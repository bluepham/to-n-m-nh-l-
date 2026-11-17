import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { TankParameters, TankType } from '../types';
import {
  calculateTotalVolume,
  calculateWaterVolume,
  generateStepByStepSolution,
  validateTankParameters,
} from '../math/MathEngine';
import { stripMathDelimiters } from '../math/mathTextParser';
import { MathFormula, MathText } from './MathFormula';

interface TankControlsProps {
  parameters: TankParameters;
  onChangeParameters: (next: TankParameters) => void;
}

interface SliderNumberFieldProps {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}

const SliderNumberField: React.FC<SliderNumberFieldProps> = ({
  id,
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium text-slate-700 leading-relaxed">
          <MathText text={label} />
        </label>
        <div className="flex items-center gap-1 shrink-0">
          <input
            id={id}
            type="number"
            value={Number(value.toFixed(3))}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              if (!Number.isNaN(parsed)) {
                onChange(parsed);
              }
            }}
            className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-right font-mono text-xs text-slate-900 tabular-nums focus:border-cyan-600 focus:outline-none"
          />
          <span className="w-6 text-xs text-slate-500 font-mono">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        aria-label={`${stripMathDelimiters(label)} thanh trượt`}
        min={min}
        max={max}
        step={step}
        value={Math.min(Math.max(value, min), max)}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-cyan-600 cursor-pointer h-2 rounded-lg bg-slate-200"
      />
    </div>
  );
};

export const TankControls: React.FC<TankControlsProps> = ({
  parameters,
  onChangeParameters,
}) => {
  const [draftError, setDraftError] = useState<string | null>(null);
  const [exprDraft, setExprDraft] = useState<string>(parameters.customExpression);
  const [maxRangeOverride, setMaxRangeOverride] = useState<boolean>(false);

  const hLimit = maxRangeOverride ? 15 : 10;
  const rLimit = maxRangeOverride ? 10 : 5;

  const tryApply = (candidate: TankParameters) => {
    const clampedH = candidate.H;
    const adjusted: TankParameters = {
      ...candidate,
      h:
        clampedH > 0
          ? Math.min(Math.max(0, candidate.h), clampedH)
          : candidate.h,
    };
    const check = validateTankParameters(adjusted);
    if (!check.valid) {
      setDraftError(check.error ?? 'Thông số không hợp lệ. Đang giữ nguyên mô hình hợp lệ gần nhất.');
      return;
    }
    setDraftError(null);
    onChangeParameters(adjusted);
  };

  const selectTankType = (nextType: TankType) => {
    setDraftError(null);
    if (nextType === 'cylinder') {
      onChangeParameters({
        ...parameters,
        type: 'cylinder',
        R: parameters.R > 0 ? parameters.R : 1.2,
        H: 2.0,
        h: 1.2,
        presetLabel: undefined,
      });
    } else if (nextType === 'frustum') {
      onChangeParameters({
        ...parameters,
        type: 'frustum',
        r0: 1.0,
        r1: 1.8,
        H: 3.0,
        h: 1.8,
        presetLabel: undefined,
      });
    } else if (nextType === 'curved') {
      onChangeParameters({
        ...parameters,
        type: 'curved',
        curveA: 1.0,
        curveB: 0.5,
        H: 2.0,
        h: 1.2,
        presetLabel: undefined,
      });
    } else {
      onChangeParameters({
        ...parameters,
        type: 'custom',
        customMode: 'polynomial',
        polyA: 1.0,
        polyB: 0.3,
        polyC: -0.08,
        H: 2.5,
        h: 1.5,
        presetLabel: undefined,
      });
    }
  };

  const applyHemispherePosterPreset = () => {
    setDraftError(null);
    setExprDraft('sqrt(4 - z^2)');
    onChangeParameters({
      ...parameters,
      type: 'custom',
      customMode: 'expression',
      customExpression: 'sqrt(4 - z^2)',
      H: 2.0,
      h: 1.2,
      presetLabel: 'Ví dụ Poster: Bán cầu V = 16π/3',
    });
  };

  const vMax = calculateTotalVolume(parameters);
  const vWater = calculateWaterVolume(parameters.h, parameters);
  const fillPct = vMax > 0 ? (vWater / vMax) * 100 : 0;
  const solution = generateStepByStepSolution(parameters);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Thông số thiết kế bồn</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            <MathText text="Trục $Oz$ thẳng đứng · Đáy $z = 0\text{ m}$ · Đỉnh $z = H$" />
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMaxRangeOverride((v) => !v)}
          className="text-xs font-medium text-cyan-700 hover:text-cyan-900 underline underline-offset-2 whitespace-nowrap"
        >
          {maxRangeOverride ? 'Phạm vi chuẩn (10m)' : 'Mở rộng phạm vi (15m)'}
        </button>
      </div>

      {/* 4 Default Tank Types */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-slate-700">
          Chọn loại hình học bồn chứa
        </span>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
          {(
            [
              ['cylinder', '1. Bồn hình trụ'],
              ['frustum', '2. Bồn nón cụt'],
              ['curved', '3. Bồn thành cong'],
              ['custom', '4. Hàm tùy chỉnh'],
            ] as [TankType, string][]
          ).map(([tKey, tLabel]) => {
            const active = parameters.type === tKey;
            return (
              <button
                key={tKey}
                type="button"
                onClick={() => selectTankType(tKey)}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white/70 hover:text-slate-900'
                }`}
              >
                {tLabel}
              </button>
            );
          })}
        </div>

        {/* Poster Hemisphere Featured Preset Button */}
        <button
          type="button"
          onClick={applyHemispherePosterPreset}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50/80 px-3 py-2 text-xs font-semibold text-cyan-950 hover:bg-cyan-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
          <MathText text="Xem ví dụ bán cầu – $V = \frac{16\pi}{3} \approx 16{,}755\text{ m}^3$" />
        </button>
      </div>

      {/* Validation Alert (keeps last valid model active) */}
      {draftError && (
        <div
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Thông báo kiểm tra miền xác định</p>
            <p className="mt-0.5 leading-relaxed">
              <MathText text={draftError} />
            </p>
            <p className="mt-1 text-[11px] text-amber-800">
              Hệ thống vẫn đang giữ mô hình hợp lệ gần nhất để đảm bảo an toàn tính toán.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Geometry Sliders */}
      <div className="space-y-4">
        <SliderNumberField
          id="param-H"
          label="Chiều cao toàn bồn ($H$)"
          unit="m"
          value={parameters.H}
          min={0.5}
          max={hLimit}
          step={0.1}
          onChange={(val) => tryApply({ ...parameters, H: val })}
        />

        {parameters.type === 'cylinder' && (
          <SliderNumberField
            id="param-R"
            label="Bán kính hình trụ ($R$)"
            unit="m"
            value={parameters.R}
            min={0.2}
            max={rLimit}
            step={0.05}
            onChange={(val) => tryApply({ ...parameters, R: val })}
          />
        )}

        {parameters.type === 'frustum' && (
          <>
            <SliderNumberField
              id="param-r0"
              label="Bán kính đáy dưới ($r_0$)"
              unit="m"
              value={parameters.r0}
              min={0.2}
              max={rLimit}
              step={0.05}
              onChange={(val) => tryApply({ ...parameters, r0: val })}
            />
            <SliderNumberField
              id="param-r1"
              label="Bán kính miệng trên ($r_1$)"
              unit="m"
              value={parameters.r1}
              min={0.2}
              max={rLimit}
              step={0.05}
              onChange={(val) => tryApply({ ...parameters, r1: val })}
            />
          </>
        )}

        {parameters.type === 'curved' && (
          <>
            <SliderNumberField
              id="param-curveA"
              label="Bán kính nền $a$ trong $a + b\sin(\frac{\pi z}{H})$"
              unit="m"
              value={parameters.curveA}
              min={0.4}
              max={rLimit}
              step={0.05}
              onChange={(val) => tryApply({ ...parameters, curveA: val })}
            />
            <SliderNumberField
              id="param-curveB"
              label="Độ phình/thắt $b$ trong $a + b\sin(\frac{\pi z}{H})$"
              unit="m"
              value={parameters.curveB}
              min={-Math.min(1.5, parameters.curveA - 0.15)}
              max={2.5}
              step={0.05}
              onChange={(val) => tryApply({ ...parameters, curveB: val })}
            />
          </>
        )}

        {parameters.type === 'custom' && (
          <div className="space-y-3 rounded-lg bg-slate-50 p-3 border border-slate-200">
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-md">
              <button
                type="button"
                onClick={() =>
                  tryApply({
                    ...parameters,
                    customMode: 'polynomial',
                    presetLabel: undefined,
                  })
                }
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors ${
                  parameters.customMode === 'polynomial'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MathText text="Bậc hai $a + bz + cz^2$" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setExprDraft(parameters.customExpression);
                  tryApply({
                    ...parameters,
                    customMode: 'expression',
                  });
                }}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors ${
                  parameters.customMode === 'expression'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Biểu thức math.js
              </button>
            </div>

            {parameters.customMode === 'polynomial' ? (
              <div className="space-y-3">
                <SliderNumberField
                  id="param-polyA"
                  label="Hệ số tự do $a$"
                  unit="m"
                  value={parameters.polyA}
                  min={0.2}
                  max={4.0}
                  step={0.05}
                  onChange={(val) => tryApply({ ...parameters, polyA: val })}
                />
                <SliderNumberField
                  id="param-polyB"
                  label="Hệ số bậc nhất $b$"
                  unit=""
                  value={parameters.polyB}
                  min={-1.2}
                  max={1.5}
                  step={0.05}
                  onChange={(val) => tryApply({ ...parameters, polyB: val })}
                />
                <SliderNumberField
                  id="param-polyC"
                  label="Hệ số bậc hai $c$"
                  unit=""
                  value={parameters.polyC}
                  min={-0.5}
                  max={0.5}
                  step={0.01}
                  onChange={(val) => tryApply({ ...parameters, polyC: val })}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="custom-expr-input"
                  className="block text-xs font-medium text-slate-700 leading-relaxed"
                >
                  <MathText text="Nhập hàm $r(z)$ theo biến $z$ (hỗ trợ $\sin, \cos, \sqrt{\cdot}, \pi, H$):" />
                </label>
                <div className="flex gap-1.5">
                  <input
                    id="custom-expr-input"
                    type="text"
                    value={exprDraft}
                    onChange={(e) => setExprDraft(e.target.value)}
                    placeholder="Ví dụ: sqrt(4 - z^2) hoặc 1.2 + 0.3*cos(pi*z/H)"
                    className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      tryApply({
                        ...parameters,
                        customMode: 'expression',
                        customExpression: exprDraft,
                        presetLabel: undefined,
                      })
                    }
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
                  >
                    Áp dụng
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'sqrt(4 - z^2)', H: 2 },
                    { label: '1.1 + 0.35*cos(pi*z/H)', H: 2.5 },
                    { label: '0.8 + 0.4*sqrt(z)', H: 3 },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => {
                        setExprDraft(sample.label);
                        tryApply({
                          ...parameters,
                          customMode: 'expression',
                          customExpression: sample.label,
                          H: sample.H,
                          h: Number((sample.H * 0.6).toFixed(2)),
                          presetLabel: undefined,
                        });
                      }}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-700 hover:bg-slate-100"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Water Level Slider h */}
        <div className="pt-2 border-t border-slate-100">
          <SliderNumberField
            id="param-h"
            label="Chiều cao mực nước hiện tại ($h$)"
            unit="m"
            value={parameters.h}
            min={0}
            max={parameters.H}
            step={0.02}
            onChange={(val) => tryApply({ ...parameters, h: val })}
          />
        </div>
      </div>

      {/* Live Formula & Calculated Volumes Summary */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-3">
        <div className="text-xs text-slate-600 overflow-x-auto">
          <span className="font-semibold text-slate-800 block mb-1">Hàm bán kính đang dùng:</span>
          <MathFormula latex={solution.radiusLatex} />
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="rounded-lg bg-white border border-slate-200 p-2.5">
            <span className="text-[11px] text-slate-500 block">
              <MathText text="Dung tích toàn bồn ($V_{\max}$)" />
            </span>
            <span
              data-testid="metric-vmax"
              className="text-base font-bold text-slate-900 font-mono tabular-nums"
            >
              {vMax.toFixed(3)} m³
            </span>
            <span className="block text-[11px] text-slate-500 font-mono tabular-nums">
              ≈ {Math.round(vMax * 1000).toLocaleString('vi-VN')} lít
            </span>
          </div>

          <div className="rounded-lg bg-cyan-50/70 border border-cyan-200 p-2.5">
            <span className="text-[11px] text-cyan-900 block">
              <MathText text="Thể tích nước ($V_{\text{water}}$)" />
            </span>
            <span
              data-testid="metric-vwater"
              className="text-base font-bold text-cyan-950 font-mono tabular-nums"
            >
              {vWater.toFixed(3)} m³
            </span>
            <span className="block text-[11px] text-cyan-800 font-mono tabular-nums">
              ≈ {Math.round(vWater * 1000).toLocaleString('vi-VN')} lít
            </span>
          </div>
        </div>

        {/* Fill Percentage Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tỉ lệ chứa nước
            </span>
            <span
              data-testid="metric-fill-pct"
              className="font-bold font-mono text-slate-900 tabular-nums"
            >
              {fillPct.toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
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
      </div>
    </div>
  );
};
