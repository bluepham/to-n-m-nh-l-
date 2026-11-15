import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Scale,
  Search,
} from 'lucide-react';
import {
  CandidateScanResult,
  OptimizationConstraints,
  SurfaceIncludeMode,
  TankParameters,
  TankType,
} from '../types';
import {
  DEFAULT_TANK_PARAMETERS,
  calculateSurfaceBreakdown,
  calculateTotalVolume,
  scanCandidateTankDesigns,
} from '../math/MathEngine';
import { TankScene3D } from './TankScene3D';
import { MathFormula } from './MathFormula';

export const OptimizationLab: React.FC = () => {
  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    vTarget: 10.0,
    hMin: 1.0,
    hMax: 5.0,
    rMax: 2.5,
    unitCostVnd: 850000,
    surfaceMode: 'closed',
  });

  const [planA, setPlanA] = useState<TankParameters>({
    ...DEFAULT_TANK_PARAMETERS,
    type: 'cylinder',
    R: 1.168,
    H: 2.336,
    h: 1.4,
  });

  const [planB, setPlanB] = useState<TankParameters>({
    ...DEFAULT_TANK_PARAMETERS,
    type: 'frustum',
    r0: 1.0,
    r1: 1.55,
    H: 2.0,
    h: 1.2,
  });

  const [scanResults, setScanResults] = useState<{
    scannedCount: number;
    bestCandidates: CandidateScanResult[];
  } | null>(null);

  const evalPlan = (p: TankParameters) => {
    const vol = calculateTotalVolume(p);
    const surf = calculateSurfaceBreakdown(p, constraints.surfaceMode);
    const maxR =
      p.type === 'cylinder'
        ? p.R
        : p.type === 'frustum'
        ? Math.max(p.r0, p.r1)
        : p.curveA + Math.abs(p.curveB);

    const reasons: string[] = [];
    if (vol < constraints.vTarget - 0.02) {
      reasons.push(`Thiếu ${(constraints.vTarget - vol).toFixed(2)} m³ so với Vtarget`);
    }
    if (p.H < constraints.hMin || p.H > constraints.hMax) {
      reasons.push(`Chiều cao H = ${p.H.toFixed(2)} m nằm ngoài [${constraints.hMin}, ${constraints.hMax}] m`);
    }
    if (maxR > constraints.rMax) {
      reasons.push(`Bán kính lớn nhất ${maxR.toFixed(2)} m vượt ngưỡng ${constraints.rMax} m`);
    }

    return {
      vol,
      surf,
      maxR,
      cost: surf.total * constraints.unitCostVnd,
      meetsConstraints: reasons.length === 0,
      reasons,
    };
  };

  const resA = useMemo(() => evalPlan(planA), [planA, constraints]);
  const resB = useMemo(() => evalPlan(planB), [planB, constraints]);

  const comparisonSummary = useMemo(() => {
    if (!resA.meetsConstraints && !resB.meetsConstraints) {
      return {
        winner: 'none' as const,
        message:
          'Cả hai phương án hiện chưa thỏa mãn đầy đủ ràng buộc dung tích hoặc kích thước. Hãy điều chỉnh thông số hoặc bấm "Quét tập phương án tham khảo".',
      };
    }
    if (resA.meetsConstraints && !resB.meetsConstraints) {
      return {
        winner: 'A' as const,
        message:
          'Chỉ có Phương án A đạt đầy đủ điều kiện ràng buộc (Phương án B vi phạm điều kiện thiết kế).',
      };
    }
    if (!resA.meetsConstraints && resB.meetsConstraints) {
      return {
        winner: 'B' as const,
        message:
          'Chỉ có Phương án B đạt đầy đủ điều kiện ràng buộc (Phương án A vi phạm điều kiện thiết kế).',
      };
    }

    const diffArea = Math.abs(resA.surf.total - resB.surf.total);
    const diffCost = Math.abs(resA.cost - resB.cost);
    if (diffArea < 0.01) {
      return {
        winner: 'tie' as const,
        message: 'Hai phương án đều đạt chuẩn và có diện tích vỏ gần như tương đương nhau.',
      };
    }

    if (resA.surf.total < resB.surf.total) {
      return {
        winner: 'A' as const,
        message: `Phương án A tiết kiệm hơn ${diffArea.toFixed(2)} m² vật liệu (giảm khoảng ${Math.round(
          diffCost,
        ).toLocaleString('vi-VN')} VNĐ) nhờ tỉ lệ chiều cao và bán kính cân đối hơn.`,
      };
    }
    return {
      winner: 'B' as const,
      message: `Phương án B tiết kiệm hơn ${diffArea.toFixed(2)} m² vật liệu (giảm khoảng ${Math.round(
        diffCost,
      ).toLocaleString('vi-VN')} VNĐ) trong cùng điều kiện dung tích yêu cầu.`,
    };
  }, [resA, resB]);

  const renderPlanCard = (
    title: string,
    plan: TankParameters,
    setPlan: React.Dispatch<React.SetStateAction<TankParameters>>,
    evalRes: ReturnType<typeof evalPlan>,
    isRecommended: boolean,
  ) => {
    return (
      <div
        className={`rounded-xl border bg-white p-5 space-y-4 ${
          isRecommended ? 'border-emerald-500 shadow-xs' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <span className="text-xs text-slate-500">
              {evalRes.meetsConstraints ? 'Đạt điều kiện ràng buộc' : 'Chưa đạt ràng buộc'}
            </span>
          </div>
          {isRecommended && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <Award className="w-4 h-4" />
              Đề xuất hợp lý hơn
            </span>
          )}
        </div>

        {/* Mini 3D Preview */}
        <TankScene3D
          parameters={plan}
          compact
          titleBadge={`${title} · V = ${evalRes.vol.toFixed(2)} m³`}
        />

        {/* Shape Selector */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
          {(
            [
              ['cylinder', 'Hình trụ'],
              ['frustum', 'Nón cụt'],
              ['curved', 'Thành cong'],
            ] as [TankType, string][]
          ).map(([tKey, tLabel]) => (
            <button
              key={tKey}
              type="button"
              onClick={() =>
                setPlan((prev) => ({
                  ...prev,
                  type: tKey,
                }))
              }
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                plan.type === tKey ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white'
              }`}
            >
              {tLabel}
            </button>
          ))}
        </div>

        {/* Compact Parameter Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Chiều cao H (m)
            </label>
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.05}
              value={plan.H}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (v > 0) setPlan({ ...plan, H: v, h: Number((v * 0.6).toFixed(2)) });
              }}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs tabular-nums"
            />
          </div>

          {plan.type === 'cylinder' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Bán kính R (m)
              </label>
              <input
                type="number"
                min={0.2}
                max={8}
                step={0.05}
                value={plan.R}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (v > 0) setPlan({ ...plan, R: v });
                }}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs tabular-nums"
              />
            </div>
          )}

          {plan.type === 'frustum' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Đáy r₀ (m)
                </label>
                <input
                  type="number"
                  min={0.2}
                  max={8}
                  step={0.05}
                  value={plan.r0}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (v >= 0.1) setPlan({ ...plan, r0: v });
                  }}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Miệng r₁ (m)
                </label>
                <input
                  type="number"
                  min={0.2}
                  max={8}
                  step={0.05}
                  value={plan.r1}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (v >= 0.1) setPlan({ ...plan, r1: v });
                  }}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs tabular-nums"
                />
              </div>
            </>
          )}

          {plan.type === 'curved' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Tham số a (m)
                </label>
                <input
                  type="number"
                  min={0.3}
                  max={6}
                  step={0.05}
                  value={plan.curveA}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (v >= 0.2) setPlan({ ...plan, curveA: v });
                  }}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Độ phình b (m)
                </label>
                <input
                  type="number"
                  min={-0.8}
                  max={2}
                  step={0.05}
                  value={plan.curveB}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isNaN(v) && plan.curveA + v > 0.1) {
                      setPlan({ ...plan, curveB: v });
                    }
                  }}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs tabular-nums"
                />
              </div>
            </>
          )}
        </div>

        {/* Constraint Status */}
        {!evalRes.meetsConstraints ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-950 space-y-1">
            {evalRes.reasons.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thỏa mãn dung tích yêu cầu và giới hạn kích thước.</span>
          </div>
        )}

        {/* Calculated Surface & Cost Breakdown */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-600">Dung tích toàn bồn (V):</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {evalRes.vol.toFixed(3)} m³
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Diện tích thành xung quanh (Sside):</span>
            <span className="font-mono text-slate-800 tabular-nums">
              {evalRes.surf.side.toFixed(3)} m²
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Diện tích đáy + nắp được tính:</span>
            <span className="font-mono text-slate-800 tabular-nums">
              {(evalRes.surf.bottom + evalRes.surf.top).toFixed(3)} m²
            </span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-slate-200">
            <span className="font-semibold text-slate-800">Tổng diện tích vật liệu (Stotal):</span>
            <span className="font-mono font-bold text-cyan-900 tabular-nums">
              {evalRes.surf.total.toFixed(3)} m²
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-800">Chi phí vật liệu ước tính:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {Math.round(evalRes.cost).toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Constraints & Surface Formula Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-700" />
              Phòng thí nghiệm Tối ưu Thiết kế & Tiết kiệm Vật liệu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh hai phương án bồn chứa theo tích phân diện tích mặt tròn xoay và ràng buộc kích thước
            </p>
          </div>

          <button
            type="button"
            onClick={() => setScanResults(scanCandidateTankDesigns(constraints))}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            Quét tập phương án tham khảo
          </button>
        </div>

        {/* Surface Integral Formula Display */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
          <MathFormula latex="S_{\text{side}} = 2\pi \int_{0}^{H} r(z)\sqrt{1 + [r'(z)]^2}\,dz, \qquad S_{\text{total}} = S_{\text{side}} + S_{\text{bottom}} + S_{\text{top}}" />
        </div>

        {/* Constraints Form */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div>
            <label
              htmlFor="opt-vtarget"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Dung tích Vtarget (m³)
            </label>
            <input
              id="opt-vtarget"
              type="number"
              min={0.5}
              max={200}
              step={0.5}
              value={constraints.vTarget}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (v > 0) setConstraints({ ...constraints, vTarget: v });
              }}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="opt-hmin" className="block text-xs font-medium text-slate-700 mb-1">
              H nhỏ nhất (m)
            </label>
            <input
              id="opt-hmin"
              type="number"
              min={0.3}
              max={10}
              step={0.1}
              value={constraints.hMin}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (v > 0) setConstraints({ ...constraints, hMin: v });
              }}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="opt-hmax" className="block text-xs font-medium text-slate-700 mb-1">
              H lớn nhất (m)
            </label>
            <input
              id="opt-hmax"
              type="number"
              min={0.5}
              max={15}
              step={0.1}
              value={constraints.hMax}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (v >= constraints.hMin) setConstraints({ ...constraints, hMax: v });
              }}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="opt-rmax" className="block text-xs font-medium text-slate-700 mb-1">
              Bán kính tối đa (m)
            </label>
            <input
              id="opt-rmax"
              type="number"
              min={0.3}
              max={10}
              step={0.1}
              value={constraints.rMax}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (v > 0) setConstraints({ ...constraints, rMax: v });
              }}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="opt-cost" className="block text-xs font-medium text-slate-700 mb-1">
              Đơn giá (VNĐ/m²)
            </label>
            <input
              id="opt-cost"
              type="number"
              min={10000}
              step={50000}
              value={constraints.unitCostVnd}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (v >= 0) setConstraints({ ...constraints, unitCostVnd: v });
              }}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="opt-mode" className="block text-xs font-medium text-slate-700 mb-1">
              Cấu hình vỏ bồn
            </label>
            <select
              id="opt-mode"
              value={constraints.surfaceMode}
              onChange={(e) =>
                setConstraints({
                  ...constraints,
                  surfaceMode: e.target.value as SurfaceIncludeMode,
                })
              }
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900"
            >
              <option value="closed">Bồn kín (Thành + Đáy + Nắp)</option>
              <option value="open_top">Không nắp (Thành + Đáy)</option>
              <option value="side_only">Chỉ tính thành xung quanh</option>
            </select>
          </div>
        </div>

        {/* Scanned Finite Parameter Candidates */}
        {scanResults && (
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-cyan-950">
                Kết quả quét trên tập hữu hạn {scanResults.scannedCount} bộ tham số thử nghiệm:
              </span>
              <span className="text-[11px] text-slate-600">
                (Đây là phương án diện tích nhỏ nhất trong tập hữu hạn đã xét, không khẳng định tối ưu tuyệt đối trên mọi hàm số)
              </span>
            </div>

            {scanResults.bestCandidates.length === 0 ? (
              <p className="text-xs text-amber-800">
                Không tìm thấy bộ tham số nào trong lưới quét đạt Vtarget = {constraints.vTarget} m³ dưới giới hạn Hmax = {constraints.hMax} m và Rmax = {constraints.rMax} m. Hãy nới rộng giới hạn!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {scanResults.bestCandidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5 text-xs"
                  >
                    <div className="font-bold text-slate-900">{cand.label}</div>
                    <div className="font-mono text-[11px] text-slate-600">{cand.summary}</div>
                    <div className="font-mono text-cyan-900 font-semibold tabular-nums">
                      Stotal = {cand.surfaceArea.toFixed(2)} m² · {Math.round(cand.estimatedCost).toLocaleString('vi-VN')} đ
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setPlanA(cand.params)}
                        className="flex-1 rounded bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-slate-800"
                      >
                        Nạp vào A
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlanB(cand.params)}
                        className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-100"
                      >
                        Nạp vào B
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side-by-Side Plan A vs Plan B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderPlanCard(
          'Phương án A',
          planA,
          setPlanA,
          resA,
          comparisonSummary.winner === 'A',
        )}
        {renderPlanCard(
          'Phương án B',
          planB,
          setPlanB,
          resB,
          comparisonSummary.winner === 'B',
        )}
      </div>

      {/* Conclusion & Mandatory Engineering Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
        <h3 className="text-sm font-bold text-slate-900">
          Kết luận đối sánh & Lý do lựa chọn phương án
        </h3>
        <p className="text-xs text-slate-800 font-medium leading-relaxed">
          {comparisonSummary.message}
        </p>
        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          Ghi chú học thuật: Kết quả trên là mô hình toán học hình học phục vụ học tập môn Toán 12, chưa xét độ bền kết cấu chịu lực, áp suất thủy tĩnh theo độ sâu, hao hụt cắt gọt tôn/inox, mối hàn, tiêu chuẩn thi công và các yếu tố kỹ thuật công trình thực tế.
        </p>
      </div>
    </div>
  );
};
