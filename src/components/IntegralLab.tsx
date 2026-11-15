import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  EyeOff,
  HelpCircle,
  Layers,
  MessageSquare,
  Send,
} from 'lucide-react';
import { TankParameters } from '../types';
import {
  calculateTotalVolume,
  calculateWaterVolume,
  crossSectionArea,
  generateStepByStepSolution,
  radiusAtHeight,
} from '../math/MathEngine';
import { BUILTIN_MATH_QA } from '../data/stemData';
import { MathFormula } from './MathFormula';
import { TankControls } from './TankControls';

interface IntegralLabProps {
  parameters: TankParameters;
  onChangeParameters: (next: TankParameters) => void;
}

const VISUAL_STAGE_TITLES = [
  '1. Đường cong bán kính r(z) trên mặt phẳng (Oz, r)',
  '2. Tô sáng một dải vi phân chiều dày Δz tại độ cao zᵢ',
  '3. Quay dải phẳng quanh trục Oz tạo chuyển động tròn xoay',
  '4. Hình thành thiết diện tròn A(zᵢ) = π[r(zᵢ)]²',
  '5. Tích lũy N lát cắt đĩa trụ thành khối bồn 3D xấp xỉ',
  '6. Qua giới hạn N → ∞ thu được công thức tích phân chính xác',
];

export const IntegralLab: React.FC<IntegralLabProps> = ({
  parameters,
  onChangeParameters,
}) => {
  const [showSteps, setShowSteps] = useState<boolean>(true);
  const [visualModeOpen, setVisualModeOpen] = useState<boolean>(true);
  const [visualStep, setVisualStep] = useState<number>(0); // 0..5
  const [sliceCount, setSliceCount] = useState<number>(12);
  const [focusSliceRatio, setFocusSliceRatio] = useState<number>(0.55);

  // Math Assistant state
  const [selectedQaId, setSelectedQaId] = useState<string>(BUILTIN_MATH_QA[0].id);
  const [geminiAvailable, setGeminiAvailable] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/gemini/status')
      .then((r) => (r.ok ? r.json() : { available: false }))
      .then((data: { available?: boolean }) => {
        if (active) setGeminiAvailable(Boolean(data?.available));
      })
      .catch(() => {
        if (active) setGeminiAvailable(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const solution = useMemo(() => generateStepByStepSolution(parameters), [parameters]);
  const vMax = useMemo(() => calculateTotalVolume(parameters), [parameters]);
  const vWater = useMemo(
    () => calculateWaterVolume(parameters.h, parameters),
    [parameters],
  );

  // Riemann disc sum for Stage 5 comparison
  const riemannData = useMemo(() => {
    const H = parameters.H;
    const dz = H / sliceCount;
    const discs: { zMid: number; r: number; dv: number }[] = [];
    let sumVol = 0;
    let maxR = 0.5;

    for (let i = 0; i < sliceCount; i++) {
      const zMid = (i + 0.5) * dz;
      const r = radiusAtHeight(zMid, parameters);
      const safeR = Number.isFinite(r) && r >= 0 ? r : 0;
      if (safeR > maxR) maxR = safeR;
      const dv = Math.PI * safeR * safeR * dz;
      sumVol += dv;
      discs.push({ zMid, r: safeR, dv });
    }

    const curvePts: { z: number; r: number }[] = [];
    for (let k = 0; k <= 80; k++) {
      const z = (k / 80) * H;
      const r = radiusAtHeight(z, parameters);
      const safeR = Number.isFinite(r) && r >= 0 ? r : 0;
      if (safeR > maxR) maxR = safeR;
      curvePts.push({ z, r: safeR });
    }

    return { dz, discs, sumVol, maxR, curvePts };
  }, [parameters, sliceCount]);

  const zFocus = focusSliceRatio * parameters.H;
  const rFocus = radiusAtHeight(zFocus, parameters) || 0;
  const aFocus = crossSectionArea(zFocus, parameters) || 0;

  const selectedQa =
    BUILTIN_MATH_QA.find((item) => item.id === selectedQaId) ?? BUILTIN_MATH_QA[0];

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiAnswer(null);

    try {
      const tankContext = `Loại bồn=${parameters.type}, H=${parameters.H}m, h=${parameters.h}m, Vmax=${vMax.toFixed(
        3,
      )}m³, Vwater=${vWater.toFixed(3)}m³`;
      const resp = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: customQuestion.trim(),
          tankContext,
        }),
      });
      const json = (await resp.json()) as { answer?: string; error?: string };
      if (!resp.ok || json.error) {
        setAiError(json.error ?? 'Không thể kết nối dịch vụ Gemini API.');
      } else {
        setAiAnswer(json.answer ?? '');
      }
    } catch {
      setAiError('Không thể kết nối máy chủ trợ lý Gemini. Vui lòng tham khảo bộ giải thích chuẩn bên trên.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Split: Mathematical Engine & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: General Integral Formulation + 5-Step Derivation */}
        <div className="lg:col-span-8 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Hệ thống Toán học – Tích phân khối tròn xoay
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chương IV · Bài 13: Ứng dụng hình học của tích phân · Toán 12 Kết nối tri thức
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSteps(true)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    showSteps
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Giải thích từng bước
                </button>
                <button
                  type="button"
                  onClick={() => setShowSteps(false)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    !showSteps
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Ẩn lời giải
                </button>
              </div>
            </div>

            {/* Distinction between Vmax and Vwater(h) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  1. Thể tích toàn bồn (Dung tích tối đa Vmax)
                </span>
                <MathFormula
                  displayMode
                  latex="V_{\max} = \pi \int_{0}^{H} [r(z)]^2\,dz"
                />
                <div className="pt-1 border-t border-slate-200/80 flex items-baseline justify-between text-xs">
                  <span className="text-slate-600">Giá trị tính được (z: 0 → {parameters.H} m):</span>
                  <span className="font-bold font-mono text-slate-900 text-sm tabular-nums">
                    {vMax.toFixed(4)} m³
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 space-y-2">
                <span className="text-xs font-semibold text-cyan-950 block">
                  2. Thể tích lượng nước hiện có Vwater(h)
                </span>
                <MathFormula
                  displayMode
                  latex="V_{\text{water}}(h) = \pi \int_{0}^{h} [r(z)]^2\,dz"
                />
                <div className="pt-1 border-t border-cyan-200/80 flex items-baseline justify-between text-xs">
                  <span className="text-cyan-900">
                    Tại mực nước h = {parameters.h.toFixed(2)} m:
                  </span>
                  <span className="font-bold font-mono text-cyan-950 text-sm tabular-nums">
                    {vWater.toFixed(4)} m³
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-100/80 px-3.5 py-2.5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
              <span>
                Phương pháp tính hiện hành: <strong className="text-slate-900">{solution.methodLabel}</strong>
              </span>
              <span className="font-mono text-slate-600">
                Đáy bồn z = 0 m · Đỉnh bồn z = H = {parameters.H.toFixed(2)} m
              </span>
            </div>

            {/* 5-Step Solution */}
            {showSteps && (
              <div className="space-y-3 pt-2">
                {solution.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="rounded-xl border border-slate-200 bg-white p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white font-mono">
                        {st.stepNumber}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Bước {st.stepNumber}: {st.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{st.explanation}</p>
                    <div className="rounded-lg bg-slate-50 px-3 py-2 overflow-x-auto border border-slate-100">
                      <MathFormula displayMode latex={st.latex} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Interactive 6-Step Visualizer: "Từ đồ thị đến bồn nước 3D" */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Trực quan hóa bản chất tích phân: Từ đồ thị đến bồn nước 3D
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điều khiển từng bước để quan sát lát cắt r(z) quay quanh trục Oz tạo thành vật thể 3D
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVisualModeOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-700 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                {visualModeOpen ? 'Thu gọn mô phỏng lát cắt' : 'Từ đồ thị đến bồn nước 3D'}
              </button>
            </div>

            {visualModeOpen && (
              <div className="space-y-4">
                {/* Stepper Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-900">
                    {VISUAL_STAGE_TITLES[visualStep]}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={visualStep === 0}
                      onClick={() => setVisualStep((s) => Math.max(0, s - 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Quay lại
                    </button>
                    <span className="text-xs font-mono text-slate-600 tabular-nums">
                      Bước {visualStep + 1}/6
                    </span>
                    <button
                      type="button"
                      disabled={visualStep === 5}
                      onClick={() => setVisualStep((s) => Math.min(5, s + 1))}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
                    >
                      Tiếp theo
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Interactive Slice & N Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200 p-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <label htmlFor="slice-pos-slider" className="font-medium text-slate-700">
                        Vị trí lát cắt đang xét zᵢ:
                      </label>
                      <span className="font-mono font-semibold text-cyan-800 tabular-nums">
                        {zFocus.toFixed(2)} m (r = {rFocus.toFixed(2)} m)
                      </span>
                    </div>
                    <input
                      id="slice-pos-slider"
                      type="range"
                      min={0.05}
                      max={0.95}
                      step={0.01}
                      value={focusSliceRatio}
                      onChange={(e) => setFocusSliceRatio(parseFloat(e.target.value))}
                      className="w-full accent-cyan-600"
                    />
                  </div>

                  <div className="rounded-lg border border-slate-200 p-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <label htmlFor="slice-count-slider" className="font-medium text-slate-700">
                        Số lát cắt đĩa trụ N (Tổng Riemann):
                      </label>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        N = {sliceCount} lát (Δz = {riemannData.dz.toFixed(3)} m)
                      </span>
                    </div>
                    <input
                      id="slice-count-slider"
                      type="range"
                      min={4}
                      max={60}
                      step={2}
                      value={sliceCount}
                      onChange={(e) => setSliceCount(parseInt(e.target.value, 10))}
                      className="w-full accent-slate-900"
                    />
                  </div>
                </div>

                {/* Dual Interactive SVG Canvas: Left = 2D Plane (Oz, r(z)) | Right = 3D Isometric Disc Revolution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Panel A: 2D Generating Curve */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-700 mb-2">
                      Mặt phẳng tọa độ (Oz, r) & Đường sinh r(z)
                    </div>
                    <svg
                      viewBox="0 0 320 260"
                      className="w-full h-[230px] bg-white rounded-lg border border-slate-200"
                      role="img"
                      aria-label="Đồ thị mặt phẳng đường sinh r(z)"
                    >
                      {/* Axes: Oz vertical at x=55, r horizontal at y=225 */}
                      <line x1="55" y1="230" x2="55" y2="20" stroke="#334155" strokeWidth="1.8" />
                      <polygon points="55,14 50,24 60,24" fill="#334155" />
                      <text x="38" y="24" fontSize="11" fontWeight="600" fill="#0f172a">
                        Oz
                      </text>

                      <line x1="50" y1="225" x2="295" y2="225" stroke="#334155" strokeWidth="1.8" />
                      <polygon points="302,225 292,220 292,230" fill="#334155" />
                      <text x="282" y="244" fontSize="11" fontWeight="600" fill="#0f172a">
                        r(z)
                      </text>

                      {/* Stage 5+: Show all N Riemann rectangles */}
                      {visualStep >= 4 &&
                        riemannData.discs.map((d, idx) => {
                          const scaleY = 185 / parameters.H;
                          const scaleX = 195 / Math.max(riemannData.maxR, 0.5);
                          const hRect = riemannData.dz * scaleY;
                          const yTop = 225 - (d.zMid + riemannData.dz * 0.5) * scaleY;
                          const wRect = d.r * scaleX;
                          return (
                            <rect
                              key={idx}
                              x={55}
                              y={yTop}
                              width={Math.max(0, wRect)}
                              height={Math.max(1, hRect)}
                              fill="#bae6fd"
                              fillOpacity={0.55}
                              stroke="#0284c7"
                              strokeWidth="0.7"
                            />
                          );
                        })}

                      {/* Stage 1+: Shaded region under r(z) when Stage 5 */}
                      {(() => {
                        const scaleY = 185 / parameters.H;
                        const scaleX = 195 / Math.max(riemannData.maxR, 0.5);
                        const pathD = riemannData.curvePts
                          .map((pt, idx) => {
                            const px = 55 + pt.r * scaleX;
                            const py = 225 - pt.z * scaleY;
                            return `${idx === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
                          })
                          .join(' ');

                        const focusY = 225 - zFocus * scaleY;
                        const focusW = rFocus * scaleX;

                        return (
                          <>
                            <path
                              d={pathD}
                              fill="none"
                              stroke="#0284c7"
                              strokeWidth="2.6"
                            />
                            {/* Stage 2+: Highlighted slice strip dz */}
                            {visualStep >= 1 && (
                              <g>
                                <rect
                                  x={55}
                                  y={focusY - 5}
                                  width={Math.max(2, focusW)}
                                  height={10}
                                  fill="#f59e0b"
                                  fillOpacity={0.75}
                                  stroke="#b45309"
                                  strokeWidth="1.2"
                                />
                                <circle
                                  cx={55 + focusW}
                                  cy={focusY}
                                  r={4}
                                  fill="#dc2626"
                                />
                                <text
                                  x={Math.min(220, 62 + focusW)}
                                  y={Math.max(32, focusY - 6)}
                                  fontSize="10"
                                  fontWeight="600"
                                  fill="#92400e"
                                >
                                  r(zᵢ) = {rFocus.toFixed(2)}m
                                </text>
                              </g>
                            )}
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Panel B: 3D Isometric Disc Revolution & Accumulation */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-700 mb-2">
                      Khối tròn xoay quanh trục Oz & Lát cắt hình tròn
                    </div>
                    <svg
                      viewBox="0 0 320 260"
                      className="w-full h-[230px] bg-slate-950 rounded-lg border border-slate-800"
                      role="img"
                      aria-label="Mô phỏng đĩa tròn xoay 3D quanh trục Oz"
                    >
                      {/* Oz symmetry axis */}
                      <line
                        x1="160"
                        y1="238"
                        x2="160"
                        y2="18"
                        stroke="#38bdf8"
                        strokeDasharray="4 3"
                        strokeWidth="1.4"
                      />
                      <text x="166" y="26" fontSize="11" fontWeight="600" fill="#7dd3fc">
                        Oz
                      </text>

                      {/* Stage 4/5/6: Stack of 3D elliptical discs */}
                      {visualStep >= 4 &&
                        riemannData.discs.map((d, idx) => {
                          const scaleY = 175 / parameters.H;
                          const scaleX = 105 / Math.max(riemannData.maxR, 0.5);
                          const cy = 222 - d.zMid * scaleY;
                          const rx = Math.max(1, d.r * scaleX);
                          const ry = Math.max(1, rx * 0.28);
                          return (
                            <ellipse
                              key={idx}
                              cx={160}
                              cy={cy}
                              rx={rx}
                              ry={ry}
                              fill={visualStep === 5 ? '#06b6d4' : '#0284c7'}
                              fillOpacity={visualStep === 5 ? 0.35 : 0.25}
                              stroke="#38bdf8"
                              strokeWidth="1"
                            />
                          );
                        })}

                      {/* Silhouette Curves on Left & Right when Stage >= 5 */}
                      {visualStep >= 5 &&
                        (() => {
                          const scaleY = 175 / parameters.H;
                          const scaleX = 105 / Math.max(riemannData.maxR, 0.5);
                          const rightD = riemannData.curvePts
                            .map(
                              (pt, idx) =>
                                `${idx === 0 ? 'M' : 'L'} ${(160 + pt.r * scaleX).toFixed(1)} ${(
                                  222 -
                                  pt.z * scaleY
                                ).toFixed(1)}`,
                            )
                            .join(' ');
                          const leftD = riemannData.curvePts
                            .map(
                              (pt, idx) =>
                                `${idx === 0 ? 'M' : 'L'} ${(160 - pt.r * scaleX).toFixed(1)} ${(
                                  222 -
                                  pt.z * scaleY
                                ).toFixed(1)}`,
                            )
                            .join(' ');
                          return (
                            <>
                              <path d={rightD} fill="none" stroke="#22d3ee" strokeWidth="2.2" />
                              <path d={leftD} fill="none" stroke="#22d3ee" strokeWidth="2.2" />
                            </>
                          );
                        })()}

                      {/* Highlighted Active Revolving Disc (Stage >= 2) */}
                      {visualStep >= 2 &&
                        (() => {
                          const scaleY = 175 / parameters.H;
                          const scaleX = 105 / Math.max(riemannData.maxR, 0.5);
                          const cy = 222 - zFocus * scaleY;
                          const rx = Math.max(2, rFocus * scaleX);
                          const ry = Math.max(2, rx * 0.3);

                          if (visualStep === 2) {
                            // Partial 240 deg revolution arc
                            return (
                              <g>
                                <ellipse
                                  cx={160}
                                  cy={cy}
                                  rx={rx}
                                  ry={ry}
                                  fill="none"
                                  stroke="#fbbf24"
                                  strokeDasharray="6 4"
                                  strokeWidth="2"
                                />
                                <line
                                  x1={160}
                                  y1={cy}
                                  x2={160 + rx}
                                  y2={cy}
                                  stroke="#f59e0b"
                                  strokeWidth="2.5"
                                />
                                <text x="20" y="246" fontSize="10" fill="#fde68a">
                                  Quay 360° bán kính r(zᵢ) quanh trục Oz
                                </text>
                              </g>
                            );
                          }

                          return (
                            <g>
                              <ellipse
                                cx={160}
                                cy={cy}
                                rx={rx}
                                ry={ry}
                                fill="#f59e0b"
                                fillOpacity={0.55}
                                stroke="#fde047"
                                strokeWidth="2"
                              />
                              <line
                                x1={160}
                                y1={cy}
                                x2={160 + rx}
                                y2={cy}
                                stroke="#ffffff"
                                strokeWidth="1.8"
                              />
                              <text x="18" y="246" fontSize="10" fill="#bae6fd">
                                A(zᵢ) = π·r(zᵢ)² = {aFocus.toFixed(3)} m²
                              </text>
                            </g>
                          );
                        })()}
                    </svg>
                  </div>
                </div>

                {/* Quantitative Convergence Box (Riemann Sum vs Exact Integral) */}
                <div className="rounded-xl bg-slate-900 text-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-cyan-300 font-medium block">
                      Đối chiếu tổng xấp xỉ {sliceCount} lát cắt trụ và tích phân xác định:
                    </span>
                    <div className="text-sm font-mono tabular-nums">
                      Tổng {sliceCount} đĩa trụ Σ π·r(zᵢ)²Δz ={' '}
                      <strong className="text-amber-300">{riemannData.sumVol.toFixed(4)} m³</strong>{' '}
                      · Tích phân chuẩn V ={' '}
                      <strong className="text-cyan-300">{vMax.toFixed(4)} m³</strong> (Sai lệch:{' '}
                      {Math.abs(riemannData.sumVol - vMax).toFixed(4)} m³)
                    </div>
                  </div>
                  {visualStep === 5 && (
                    <div className="bg-slate-800 rounded-lg px-3 py-1.5 shrink-0">
                      <MathFormula latex="V = \pi \int_{0}^{H} [r(z)]^2\,dz" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Math Assistant Frame (Section XIV.3) */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-700" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">Trợ lý giải thích Toán học</h2>
                  <p className="text-xs text-slate-500">
                    Kho kiến thức Toán 12 kiểm chứng sẵn sàng ngoại tuyến + Trợ lý Gemini phía máy chủ
                  </p>
                </div>
              </div>
            </div>

            {/* 5 Preset STEM Math Questions */}
            <div className="flex flex-wrap gap-1.5">
              {BUILTIN_MATH_QA.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedQaId(item.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors text-left ${
                    selectedQaId === item.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.question}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{selectedQa.shortSummary}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{selectedQa.detailedAnswer}</p>
              <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 overflow-x-auto">
                <MathFormula displayMode latex={selectedQa.latex} />
              </div>
            </div>

            {/* Optional Server-side Gemini Expansion */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-700" />
                  Đặt câu hỏi mở rộng cùng Gemini (Máy chủ)
                </span>
                <span className="text-slate-500">
                  {geminiAvailable
                    ? 'Trạng thái: Đã kết nối Gemini API máy chủ'
                    : 'Trạng thái: Chưa cấu hình khóa API máy chủ (Đang dùng bộ giải thích chuẩn)'}
                </span>
              </div>

              <form onSubmit={handleAskGemini} className="flex gap-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder={
                    geminiAvailable
                      ? 'Nhập câu hỏi Toán học về bồn chứa hiện tại...'
                      : 'Cấu hình GEMINI_API_KEY trong Settings > Secrets để bật hỏi đáp mở rộng'
                  }
                  disabled={!geminiAvailable || aiLoading}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 focus:border-cyan-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!geminiAvailable || aiLoading || !customQuestion.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-800 disabled:opacity-45 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  {aiLoading ? 'Đang xử lý...' : 'Hỏi Gemini'}
                </button>
              </form>

              {aiError && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {aiError}
                </p>
              )}
              {aiAnswer && (
                <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-3.5 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                  <span className="font-semibold text-cyan-950 block mb-1">
                    Phản hồi từ Gemini (hãy đối chiếu lại bằng công thức tích phân):
                  </span>
                  {aiAnswer}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right 4 Cols: Live Tank Parameter Deck */}
        <div className="lg:col-span-4">
          <TankControls
            parameters={parameters}
            onChangeParameters={onChangeParameters}
          />
        </div>
      </div>
    </div>
  );
};
