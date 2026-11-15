import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  Droplets,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { FlowHistoryPoint, FlowUnit, PumpMode, TankParameters } from '../types';
import {
  calculateTotalVolume,
  calculateWaterRiseRate,
  calculateWaterVolume,
  findHeightFromVolume,
  simulatePumpStep,
} from '../math/MathEngine';
import { TankScene3D } from './TankScene3D';
import { MathFormula } from './MathFormula';

interface PumpSimulationProps {
  parameters: TankParameters;
  onChangeParameters: (next: TankParameters) => void;
  flowHistory: FlowHistoryPoint[];
  onUpdateFlowHistory: (points: FlowHistoryPoint[]) => void;
  qInM3Min: number;
  qOutM3Min: number;
  onChangeFlowRates: (qIn: number, qOut: number) => void;
}

function formatClockMMSS(minutes: number): string {
  const totalSec = Math.max(0, Math.round(minutes * 60));
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export const PumpSimulation: React.FC<PumpSimulationProps> = ({
  parameters,
  onChangeParameters,
  flowHistory,
  onUpdateFlowHistory,
  qInM3Min,
  qOutM3Min,
  onChangeFlowRates,
}) => {
  const vMax = calculateTotalVolume(parameters);
  const currentVolume = calculateWaterVolume(parameters.h, parameters);

  const [mode, setMode] = useState<PumpMode>('idle');
  const [lastActiveMode, setLastActiveMode] = useState<'pumping' | 'draining' | 'both'>('pumping');
  const [unit, setUnit] = useState<FlowUnit>('m3_min');
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 5 | 10 | 60>(5);
  const [initialVolumeM3, setInitialVolumeM3] = useState<number>(
    Number(Math.min(vMax * 0.2, currentVolume).toFixed(2)),
  );
  const [targetDurationMin, setTargetDurationMin] = useState<number>(15);
  const [elapsedMin, setElapsedMin] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<{
    tone: 'amber' | 'red' | 'emerald';
    text: string;
  } | null>(null);

  const stateRef = useRef({
    parameters,
    mode,
    qInM3Min,
    qOutM3Min,
    speedMultiplier,
    targetDurationMin,
    elapsedMin,
    currentVolume,
    flowHistory,
  });
  stateRef.current = {
    parameters,
    mode,
    qInM3Min,
    qOutM3Min,
    speedMultiplier,
    targetDurationMin,
    elapsedMin,
    currentVolume,
    flowHistory,
  };

  // Real-time simulation interval (10Hz state sync for smooth UI without 60Hz React thrashing)
  useEffect(() => {
    if (mode !== 'pumping' && mode !== 'draining' && mode !== 'both') {
      return;
    }

    let lastTickMs = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const dtRealSec = Math.min((now - lastTickMs) / 1000, 0.25);
      lastTickMs = now;

      const st = stateRef.current;
      const dtSimMin = (dtRealSec * st.speedMultiplier) / 60;

      const activeQin = st.mode === 'pumping' || st.mode === 'both' ? st.qInM3Min : 0;
      const activeQout = st.mode === 'draining' || st.mode === 'both' ? st.qOutM3Min : 0;

      if (Math.abs(activeQin - activeQout) < 1e-7) {
        setAlertMessage({
          tone: 'amber',
          text: 'Lưu lượng ròng (Qv − Qr) bằng 0 — mực nước sẽ không thay đổi.',
        });
        setMode('paused');
        return;
      }

      const nextElapsed = st.elapsedMin + dtSimMin;
      const stepRes = simulatePumpStep(
        st.currentVolume,
        activeQin,
        activeQout,
        dtSimMin,
        st.parameters,
      );

      setElapsedMin(nextElapsed);
      onChangeParameters({
        ...st.parameters,
        h: stepRes.height,
      });

      const nextPoint: FlowHistoryPoint = {
        timeMin: Number(nextElapsed.toFixed(2)),
        timeLabel: formatClockMMSS(nextElapsed),
        volumeM3: Number(stepRes.volume.toFixed(4)),
        heightM: Number(stepRes.height.toFixed(4)),
      };
      const updatedHist = [...st.flowHistory.slice(-119), nextPoint];
      onUpdateFlowHistory(updatedHist);

      if (stepRes.isFull && activeQin > activeQout) {
        setMode('idle');
        setAlertMessage({
          tone: 'red',
          text: `Cảnh báo: Bồn đã đầy (${stepRes.vMax.toFixed(3)} m³). Hệ thống tự động ngắt bơm chống tràn!`,
        });
      } else if (stepRes.isEmpty && activeQout > activeQin) {
        setMode('idle');
        setAlertMessage({
          tone: 'amber',
          text: 'Thông báo: Bồn đã cạn hết nước (0,000 m³). Đã đóng van xả.',
        });
      } else if (nextElapsed >= st.targetDurationMin) {
        setMode('paused');
        setAlertMessage({
          tone: 'emerald',
          text: `Đã hoàn thành thời gian mô phỏng mục tiêu (${st.targetDurationMin} phút).`,
        });
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [mode, onChangeParameters, onUpdateFlowHistory]);

  const unitFactor = unit === 'l_min' ? 1000 : 1;
  const unitLabel = unit === 'l_min' ? 'lít/phút' : 'm³/phút';

  const startAction = (targetMode: 'pumping' | 'draining' | 'both') => {
    if (qInM3Min < 0 || qOutM3Min < 0 || targetDurationMin <= 0) {
      setAlertMessage({
        tone: 'red',
        text: 'Thông số lưu lượng hoặc thời gian không hợp lệ (phải ≥ 0).',
      });
      return;
    }
    if (targetMode === 'pumping' && qInM3Min <= 0) {
      setAlertMessage({
        tone: 'amber',
        text: 'Lưu lượng bơm vào Qv đang bằng 0. Hãy tăng Qv > 0 để bơm nước.',
      });
      return;
    }
    if (targetMode === 'draining' && qOutM3Min <= 0) {
      setAlertMessage({
        tone: 'amber',
        text: 'Lưu lượng xả ra Qr đang bằng 0. Hãy tăng Qr > 0 để xả nước.',
      });
      return;
    }
    if (targetMode === 'pumping' && currentVolume >= vMax - 1e-5) {
      setAlertMessage({
        tone: 'red',
        text: 'Bồn đã đầy tối đa — không thể bơm thêm.',
      });
      return;
    }
    if (targetMode === 'draining' && currentVolume <= 1e-5) {
      setAlertMessage({
        tone: 'amber',
        text: 'Bồn đang cạn (0 m³) — không còn nước để xả.',
      });
      return;
    }

    setAlertMessage(null);
    if (flowHistory.length === 0) {
      onUpdateFlowHistory([
        {
          timeMin: Number(elapsedMin.toFixed(2)),
          timeLabel: formatClockMMSS(elapsedMin),
          volumeM3: Number(currentVolume.toFixed(4)),
          heightM: Number(parameters.h.toFixed(4)),
        },
      ]);
    }
    setLastActiveMode(targetMode);
    setMode(targetMode);
  };

  const handleReset = () => {
    setMode('idle');
    setElapsedMin(0);
    setAlertMessage(null);
    const clampedInit = Math.min(Math.max(0, initialVolumeM3), vMax);
    const hInit = findHeightFromVolume(clampedInit, parameters);
    onChangeParameters({ ...parameters, h: hInit });
    onUpdateFlowHistory([
      {
        timeMin: 0,
        timeLabel: '00:00',
        volumeM3: Number(clampedInit.toFixed(4)),
        heightM: Number(hInit.toFixed(4)),
      },
    ]);
  };

  const handleFillFull = () => {
    setMode('idle');
    onChangeParameters({ ...parameters, h: parameters.H });
    setAlertMessage({
      tone: 'emerald',
      text: `Đã bơm đầy bồn: Vwater = Vmax = ${vMax.toFixed(3)} m³ (h = ${parameters.H.toFixed(2)} m).`,
    });
  };

  const handleDrainAll = () => {
    setMode('idle');
    onChangeParameters({ ...parameters, h: 0 });
    setAlertMessage({
      tone: 'amber',
      text: 'Đã xả hết toàn bộ nước trong bồn: Vwater = 0,000 m³ (h = 0,00 m).',
    });
  };

  const fillPct = vMax > 0 ? (currentVolume / vMax) * 100 : 0;
  const activeInRate = mode === 'pumping' || mode === 'both' ? qInM3Min : 0;
  const activeOutRate = mode === 'draining' || mode === 'both' ? qOutM3Min : 0;
  const dhDt = calculateWaterRiseRate(
    parameters.h,
    mode === 'idle' || mode === 'paused' ? qInM3Min : activeInRate,
    mode === 'idle' || mode === 'paused' ? qOutM3Min : activeOutRate,
    parameters,
  );

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertMessage && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-xs font-medium flex items-center gap-2.5 ${
            alertMessage.tone === 'red'
              ? 'border-red-300 bg-red-50 text-red-950'
              : alertMessage.tone === 'amber'
              ? 'border-amber-300 bg-amber-50 text-amber-950'
              : 'border-emerald-300 bg-emerald-50 text-emerald-950'
          }`}
        >
          {alertMessage.tone === 'emerald' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{alertMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Live 3D Tank + Smart Telemetry Clock */}
        <div className="lg:col-span-7 space-y-4">
          <TankScene3D
            parameters={parameters}
            isPumping={(mode === 'pumping' || mode === 'both') && qInM3Min > 0}
            isDraining={(mode === 'draining' || mode === 'both') && qOutM3Min > 0}
            titleBadge={`Mô phỏng Bơm – Xả · Tốc độ x${speedMultiplier} · Đồng hồ ${formatClockMMSS(
              elapsedMin,
            )}`}
          />

          {/* Smart Telemetry Clock & 6 Real-Time Metric Cards */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-cyan-700" />
                <div>
                  <span className="text-xs text-slate-500 block">Đồng hồ mô phỏng thông minh</span>
                  <span
                    data-testid="pump-clock"
                    className="text-2xl font-bold font-mono text-slate-900 tabular-nums"
                  >
                    {formatClockMMSS(elapsedMin)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Tốc độ dâng mặt thoáng dh/dt</span>
                <span className="text-sm font-bold font-mono text-cyan-800 tabular-nums">
                  {dhDt !== null ? `${dhDt >= 0 ? '+' : ''}${dhDt.toFixed(4)} m/phút` : 'Tiết diện ~ 0'}
                </span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">Phần trăm dung tích đang sử dụng</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {fillPct.toFixed(1)}% ({Math.round(currentVolume * 1000).toLocaleString('vi-VN')} /{' '}
                  {Math.round(vMax * 1000).toLocaleString('vi-VN')} lít)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${
                    fillPct >= 98
                      ? 'bg-red-500'
                      : fillPct >= 85
                      ? 'bg-amber-500'
                      : 'bg-cyan-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, fillPct))}%` }}
                />
              </div>
            </div>

            {/* 6 Required Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500 block">Mực nước hiện tại</span>
                <span
                  data-testid="pump-height"
                  className="text-base font-bold font-mono text-slate-900 tabular-nums"
                >
                  {parameters.h.toFixed(3)} m
                </span>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50/60 p-3">
                <span className="text-[11px] text-cyan-900 block">Lượng nước hiện tại</span>
                <span
                  data-testid="pump-volume"
                  className="text-base font-bold font-mono text-cyan-950 tabular-nums"
                >
                  {currentVolume.toFixed(3)} m³
                </span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500 block">Dung tích tối đa</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {vMax.toFixed(3)} m³
                </span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500 block">Tỉ lệ đầy</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {fillPct.toFixed(1)}%
                </span>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                <span className="text-[11px] text-emerald-900 block">Lưu lượng vào (Qv)</span>
                <span className="text-base font-bold font-mono text-emerald-950 tabular-nums">
                  {(qInM3Min * unitFactor).toFixed(unit === 'l_min' ? 0 : 2)} {unitLabel}
                </span>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <span className="text-[11px] text-amber-900 block">Lưu lượng ra (Qr)</span>
                <span className="text-base font-bold font-mono text-amber-950 tabular-nums">
                  {(qOutM3Min * unitFactor).toFixed(unit === 'l_min' ? 0 : 2)} {unitLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Large Action Buttons & Simulation Parameters */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Bảng điều khiển Bơm – Xả thực</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Giải nghiệm chia đôi π∫₀ʰ[r(z)]²dz = Vwater tại từng bước thời gian
              </p>
            </div>

            {/* Primary Large Control Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => startAction('pumping')}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                  mode === 'pumping'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-600/90 text-white hover:bg-emerald-700'
                }`}
              >
                <ArrowUpFromLine className="w-4 h-4" />
                Bơm nước
              </button>

              <button
                type="button"
                onClick={() => startAction('draining')}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                  mode === 'draining'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-600 hover:text-white'
                }`}
              >
                <ArrowDownToLine className="w-4 h-4" />
                Xả nước
              </button>

              <button
                type="button"
                onClick={() => setMode('paused')}
                disabled={mode === 'idle' || mode === 'paused'}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-45"
              >
                <Pause className="w-4 h-4" />
                Tạm dừng
              </button>

              <button
                type="button"
                onClick={() => startAction(lastActiveMode)}
                disabled={mode !== 'paused'}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-45"
              >
                <Play className="w-4 h-4" />
                Tiếp tục
              </button>

              <button
                type="button"
                onClick={handleFillFull}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-2.5 text-xs font-semibold text-cyan-950 hover:bg-cyan-100"
              >
                <Droplets className="w-4 h-4 text-cyan-700" />
                Bơm đầy
              </button>

              <button
                type="button"
                onClick={handleDrainAll}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
              >
                Xả hết
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startAction('both')}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  mode === 'both'
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Chạy đồng thời (Qv − Qr)
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại
              </button>
            </div>

            {/* Unit & Playback Speed Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 block">
                  Đơn vị lưu lượng (1 m³ = 1.000 lít)
                </span>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setUnit('m3_min')}
                    className={`py-1.5 text-xs font-semibold rounded-md ${
                      unit === 'm3_min' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    m³/phút
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('l_min')}
                    className={`py-1.5 text-xs font-semibold rounded-md ${
                      unit === 'l_min' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    lít/phút
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 block">
                  Tốc độ phát mô phỏng
                </span>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
                  {([1, 5, 10, 60] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setSpeedMultiplier(spd)}
                      className={`py-1.5 text-xs font-mono font-semibold rounded-md ${
                        speedMultiplier === spd
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      x{spd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Flow Rate & Initial Water Sliders */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label htmlFor="qin-input" className="font-medium text-slate-700">
                    Lưu lượng bơm vào (Qv)
                  </label>
                  <span className="font-mono font-semibold text-emerald-800 tabular-nums">
                    {(qInM3Min * unitFactor).toFixed(unit === 'l_min' ? 0 : 2)} {unitLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={5 * unitFactor}
                    step={0.05 * unitFactor}
                    value={qInM3Min * unitFactor}
                    onChange={(e) =>
                      onChangeFlowRates(parseFloat(e.target.value) / unitFactor, qOutM3Min)
                    }
                    className="flex-1 accent-emerald-600"
                    aria-label="Thanh trượt lưu lượng bơm vào Qv"
                  />
                  <input
                    id="qin-input"
                    type="number"
                    min={0}
                    step={unit === 'l_min' ? 50 : 0.05}
                    value={Number((qInM3Min * unitFactor).toFixed(2))}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!Number.isNaN(val) && val >= 0) {
                        onChangeFlowRates(val / unitFactor, qOutM3Min);
                      }
                    }}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right font-mono text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label htmlFor="qout-input" className="font-medium text-slate-700">
                    Lưu lượng xả ra (Qr)
                  </label>
                  <span className="font-mono font-semibold text-amber-800 tabular-nums">
                    {(qOutM3Min * unitFactor).toFixed(unit === 'l_min' ? 0 : 2)} {unitLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={5 * unitFactor}
                    step={0.05 * unitFactor}
                    value={qOutM3Min * unitFactor}
                    onChange={(e) =>
                      onChangeFlowRates(qInM3Min, parseFloat(e.target.value) / unitFactor)
                    }
                    className="flex-1 accent-amber-600"
                    aria-label="Thanh trượt lưu lượng xả ra Qr"
                  />
                  <input
                    id="qout-input"
                    type="number"
                    min={0}
                    step={unit === 'l_min' ? 50 : 0.05}
                    value={Number((qOutM3Min * unitFactor).toFixed(2))}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!Number.isNaN(val) && val >= 0) {
                        onChangeFlowRates(qInM3Min, val / unitFactor);
                      }
                    }}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right font-mono text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label
                    htmlFor="init-vol-input"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Lượng nước ban đầu (m³)
                  </label>
                  <input
                    id="init-vol-input"
                    type="number"
                    min={0}
                    max={Number(vMax.toFixed(3))}
                    step={0.1}
                    value={initialVolumeM3}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) setInitialVolumeM3(Math.max(0, v));
                    }}
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sim-dur-input"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Thời gian mục tiêu (phút)
                  </label>
                  <input
                    id="sim-dur-input"
                    type="number"
                    min={1}
                    max={240}
                    step={1}
                    value={targetDurationMin}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v) && v > 0) setTargetDurationMin(v);
                    }}
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Mathematical Formula Note */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block">
                Phương trình vi phân – tích phân điều khiển mực nước:
              </span>
              <MathFormula
                displayMode
                latex="V(t + \Delta t) = V(t) + (Q_v - Q_r)\Delta t, \qquad \pi\int_{0}^{h} [r(z)]^2\,dz = V_{\text{water}}"
              />
              <p className="text-[11px] text-slate-500">
                Lưu ý: Tuyệt đối không dùng h = H·V/Vmax cho bồn nón cụt hay bồn thành cong vì diện tích mặt thoáng A(z) biến thiên theo độ cao.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
