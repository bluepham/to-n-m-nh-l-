import React, { useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, FileSpreadsheet, Maximize2, X } from 'lucide-react';
import { FlowHistoryPoint, TankParameters } from '../types';
import {
  calculateTotalVolume,
  calculateWaterRiseRate,
  calculateWaterVolume,
  crossSectionArea,
  radiusAtHeight,
} from '../math/MathEngine';
import { MathFormula, MathText } from './MathFormula';

interface MathChartsProps {
  parameters: TankParameters;
  onChangeParameters: (next: TankParameters) => void;
  flowHistory: FlowHistoryPoint[];
  qInM3Min: number;
  qOutM3Min: number;
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvLines = [
    headers.join(','),
    ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ];
  const blob = new Blob(['\uFEFF' + csvLines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadSvgContainerAsPng(container: HTMLDivElement | null, filename: string) {
  if (!container) return;
  const svgEl = container.querySelector('svg');
  if (!svgEl) return;

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const rect = svgEl.getBoundingClientRect();
  const width = Math.max(600, Math.round(rect.width) * 2);
  const height = Math.max(360, Math.round(rect.height) * 2);

  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = filename;
      link.click();
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

export const MathCharts: React.FC<MathChartsProps> = ({
  parameters,
  onChangeParameters,
  flowHistory,
  qInM3Min,
  qOutM3Min,
}) => {
  const [zoomChartId, setZoomChartId] = useState<'c1' | 'c2' | 'c3' | 'c4' | null>(null);
  const [compareQRate, setCompareQRate] = useState<number>(1.2);

  const refC1 = useRef<HTMLDivElement | null>(null);
  const refC2 = useRef<HTMLDivElement | null>(null);
  const refC3 = useRef<HTMLDivElement | null>(null);
  const refC4 = useRef<HTMLDivElement | null>(null);

  const vMax = useMemo(() => calculateTotalVolume(parameters), [parameters]);
  const vCurrent = useMemo(
    () => calculateWaterVolume(parameters.h, parameters),
    [parameters],
  );

  // Chart 1 & Chart 2 & Chart 4 Spatial Profile Data along [0, H]
  const profileSeries = useMemo(() => {
    const N = 60;
    const netQ = Math.abs(qInM3Min - qOutM3Min) > 1e-5 ? qInM3Min - qOutM3Min : 0.8;
    const rows: {
      z: number;
      r: number;
      area: number;
      volume: number;
      dhdt: number | null;
    }[] = [];

    for (let i = 0; i <= N; i++) {
      const z = Number(((i / N) * parameters.H).toFixed(3));
      const r = radiusAtHeight(z, parameters);
      const area = crossSectionArea(z, parameters);
      const vol = calculateWaterVolume(z, parameters);
      const rate = calculateWaterRiseRate(z, netQ, 0, parameters);
      rows.push({
        z,
        r: Number((Number.isFinite(r) ? r : 0).toFixed(4)),
        area: Number((Number.isFinite(area) ? area : 0).toFixed(4)),
        volume: Number((Number.isFinite(vol) ? vol : 0).toFixed(4)),
        // Cap extreme near-singular spikes at r -> 0 cleanly
        dhdt: rate !== null && Math.abs(rate) <= 25 ? Number(rate.toFixed(4)) : null,
      });
    }
    return { rows, netQ };
  }, [parameters, qInM3Min, qOutM3Min]);

  // Chart 3: Volume vs Time V(t) with comparison flow rate
  const timeSeries = useMemo(() => {
    const baseNetQ = Math.abs(qInM3Min - qOutM3Min) > 1e-4 ? Math.abs(qInM3Min - qOutM3Min) : 0.6;
    if (flowHistory.length >= 2) {
      const v0 = flowHistory[0].volumeM3;
      const t0 = flowHistory[0].timeMin;
      return flowHistory.map((pt) => {
        const dt = Math.max(0, pt.timeMin - t0);
        const cmpVol = Math.min(vMax, Math.max(0, v0 + compareQRate * dt));
        return {
          timeMin: pt.timeMin,
          volumeM3: pt.volumeM3,
          compareVolumeM3: Number(cmpVol.toFixed(4)),
        };
      });
    }

    // Analytical preview curve if user hasn't pressed Run in Pump Lab yet
    const maxTime = Math.max(5, Math.ceil((vMax / baseNetQ) * 1.15));
    const pts: { timeMin: number; volumeM3: number; compareVolumeM3: number }[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = Number(((i / 40) * maxTime).toFixed(2));
      const vMain = Math.min(vMax, Math.max(0, baseNetQ * t));
      const vCmp = Math.min(vMax, Math.max(0, compareQRate * t));
      pts.push({
        timeMin: t,
        volumeM3: Number(vMain.toFixed(4)),
        compareVolumeM3: Number(vCmp.toFixed(4)),
      });
    }
    return pts;
  }, [flowHistory, qInM3Min, qOutM3Min, compareQRate, vMax]);

  const handleChart2Click = (state: unknown) => {
    const st = state as { activeLabel?: number | string } | null;
    if (st && st.activeLabel !== undefined) {
      const clickedH = Number(st.activeLabel);
      if (Number.isFinite(clickedH) && clickedH >= 0 && clickedH <= parameters.H) {
        onChangeParameters({ ...parameters, h: clickedH });
      }
    }
  };

  const renderChartContent = (id: 'c1' | 'c2' | 'c3' | 'c4', heightPx: number) => {
    if (id === 'c1') {
      return (
        <ResponsiveContainer width="100%" height={heightPx}>
          <LineChart data={profileSeries.rows} margin={{ top: 10, right: 20, left: 4, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="z"
              type="number"
              domain={[0, parameters.H]}
              unit=" m"
              tick={{ fontSize: 11 }}
              label={{ value: 'Độ cao z (m)', position: 'insideBottom', offset: -10, fontSize: 11 }}
            />
            <YAxis
              unit=" m"
              tick={{ fontSize: 11 }}
              label={{ value: 'r(z) (m)', angle: -90, position: 'insideLeft', fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: unknown, name: unknown) => [
                `${Number(value).toFixed(3)} ${name === 'area' ? 'm²' : 'm'}`,
                name === 'r' ? 'Bán kính r(z)' : 'Tiết diện A(z)',
              ]}
              labelFormatter={(zVal) => {
                const zNum = Number(zVal);
                const area = crossSectionArea(zNum, parameters);
                return `Độ cao z = ${zNum.toFixed(2)} m · Diện tích A(z) = ${
                  Number.isFinite(area) ? area.toFixed(3) : '0'
                } m²`;
              }}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine x={parameters.h} stroke="#0891b2" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="r"
              name="Bán kính r(z) (m)"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (id === 'c2') {
      return (
        <ResponsiveContainer width="100%" height={heightPx}>
          <LineChart
            data={profileSeries.rows}
            onClick={handleChart2Click}
            margin={{ top: 10, right: 20, left: 4, bottom: 18 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="z"
              type="number"
              domain={[0, parameters.H]}
              unit=" m"
              tick={{ fontSize: 11 }}
              label={{ value: 'Mực nước h (m)', position: 'insideBottom', offset: -10, fontSize: 11 }}
            />
            <YAxis
              unit=" m³"
              tick={{ fontSize: 11 }}
              label={{ value: 'V(h) (m³)', angle: -90, position: 'insideLeft', fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: unknown) => [`${Number(value).toFixed(3)} m³`, 'Thể tích nước V(h)']}
              labelFormatter={(hVal) => `Mực nước h = ${Number(hVal).toFixed(2)} m (Bấm để đặt mực nước)`}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="volume"
              name="Thể tích tích phân V(h)"
              stroke="#0891b2"
              strokeWidth={2.6}
              dot={false}
            />
            <ReferenceDot
              x={Number(parameters.h.toFixed(3))}
              y={Number(vCurrent.toFixed(4))}
              r={6}
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (id === 'c3') {
      return (
        <ResponsiveContainer width="100%" height={heightPx}>
          <LineChart data={timeSeries} margin={{ top: 10, right: 20, left: 4, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="timeMin"
              unit=" ph"
              tick={{ fontSize: 11 }}
              label={{ value: 'Thời gian t (phút)', position: 'insideBottom', offset: -10, fontSize: 11 }}
            />
            <YAxis
              unit=" m³"
              tick={{ fontSize: 11 }}
              label={{ value: 'V(t) (m³)', angle: -90, position: 'insideLeft', fontSize: 11 }}
            />
            <Tooltip
              formatter={(val: unknown, name: unknown) => [`${Number(val).toFixed(3)} m³`, String(name)]}
              labelFormatter={(t) => `Thời điểm t = ${Number(t).toFixed(2)} phút`}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="volumeM3"
              name={
                flowHistory.length >= 2
                  ? 'Lịch sử phiên mô phỏng V(t)'
                  : 'Đường bơm hiện tại V(t)'
              }
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="compareVolumeM3"
              name={`So sánh Q = ${compareQRate.toFixed(2)} m³/phút`}
              stroke="#f59e0b"
              strokeDasharray="5 4"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={heightPx}>
        <LineChart data={profileSeries.rows} margin={{ top: 10, right: 20, left: 4, bottom: 18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="z"
            type="number"
            domain={[0, parameters.H]}
            unit=" m"
            tick={{ fontSize: 11 }}
            label={{ value: 'Mực nước h (m)', position: 'insideBottom', offset: -10, fontSize: 11 }}
          />
          <YAxis
            unit=" m/p"
            tick={{ fontSize: 11 }}
            label={{ value: 'dh/dt (m/phút)', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip
            formatter={(val: unknown) =>
              val === null || val === undefined || !Number.isFinite(Number(val))
                ? ['Tiết diện ≈ 0 (Điểm suy biến)', 'dh/dt']
                : [`${Number(val).toFixed(4)} m/phút`, 'Tốc độ tăng dh/dt']
            }
            labelFormatter={(hVal) => `Tại mực nước h = ${Number(hVal).toFixed(2)} m`}
          />
          <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="dhdt"
            connectNulls={false}
            name={`dh/dt với Q = ${profileSeries.netQ.toFixed(2)} m³/phút`}
            stroke="#7c3aed"
            strokeWidth={2.4}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Phòng Đồ thị Toán học tương tác (4 Biểu đồ đồng bộ thời gian thực)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kéo thanh mực nước hoặc bấm trực tiếp lên Biểu đồ 2 để cập nhật lượng nước trên mô hình 3D.
          </p>
        </div>

        {/* Interactive Water Level & Compare Q Quick Bar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="chart-h-slider" className="text-xs font-semibold text-slate-700">
              <MathText text="Kéo điểm mực nước $h$:" />
            </label>
            <input
              id="chart-h-slider"
              type="range"
              min={0}
              max={parameters.H}
              step={0.02}
              value={parameters.h}
              onChange={(e) =>
                onChangeParameters({ ...parameters, h: parseFloat(e.target.value) })
              }
              className="w-32 accent-cyan-600"
            />
            <span className="text-xs font-bold text-cyan-900 tabular-nums">
              <MathText
                text={`$${parameters.h.toFixed(2)}\\text{ m}$ ($${vCurrent.toFixed(2)}\\text{ m}^3$)`}
              />
            </span>
          </div>
        </div>
      </div>

      {/* 2x2 Grid of 4 Mathematical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div ref={refC1} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                <MathText text="Biểu đồ 1 – Bán kính $r(z)$ & Tiết diện ngang theo độ cao $z$" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                <MathText text="Rê chuột vào đường cong để xem độ cao $z$, bán kính $r(z)$ và diện tích $A(z) = \pi [r(z)]^2$." />
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setZoomChartId('c1')}
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Phóng to Biểu đồ 1"
                title="Phóng to"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => downloadSvgContainerAsPng(refC1.current, 'bieu-do-1-ban-kinh.png')}
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Tải ảnh PNG Biểu đồ 1"
                title="Tải ảnh PNG"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'bieu-do-1-ban-kinh.csv',
                    ['z_m', 'r_m', 'A_m2'],
                    profileSeries.rows.map((r) => [r.z, r.r, r.area]),
                  )
                }
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Xuất CSV Biểu đồ 1"
                title="Xuất CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {renderChartContent('c1', 260)}
        </div>

        {/* Chart 2 */}
        <div ref={refC2} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-relaxed">
                <MathText text="Biểu đồ 2 – Thể tích nước $\displaystyle V_{\text{water}}(h) = \pi \int_{0}^{h} [r(z)]^2\,dz$" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                <MathText
                  text={`Điểm đỏ đánh dấu mực nước hiện tại ($h = ${parameters.h.toFixed(2)}\\text{ m}$). Bấm vào đồ thị để đổi $h$!`}
                />
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setZoomChartId('c2')}
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Phóng to Biểu đồ 2"
                title="Phóng to"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => downloadSvgContainerAsPng(refC2.current, 'bieu-do-2-the-tich-theo-h.png')}
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Tải ảnh PNG Biểu đồ 2"
                title="Tải ảnh PNG"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'bieu-do-2-the-tich-theo-h.csv',
                    ['h_m', 'Vwater_m3'],
                    profileSeries.rows.map((r) => [r.z, r.volume]),
                  )
                }
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Xuất CSV Biểu đồ 2"
                title="Xuất CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {renderChartContent('c2', 260)}
        </div>

        {/* Chart 3 */}
        <div ref={refC3} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                <MathText text="Biểu đồ 3 – Thể tích theo thời gian $V(t)$ & So sánh tốc độ bơm" />
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <label htmlFor="cmp-q-input" className="text-xs text-slate-500">
                  Lưu lượng đối chứng:
                </label>
                <input
                  id="cmp-q-input"
                  type="number"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={compareQRate}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isNaN(v) && v > 0) setCompareQRate(v);
                  }}
                  className="w-16 rounded border border-slate-300 px-1.5 py-0.5 font-mono text-xs tabular-nums"
                />
                <span className="text-xs text-slate-500">
                  <MathFormula latex="\text{m}^3/\text{phút}" />
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setZoomChartId('c3')}
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Phóng to Biểu đồ 3"
                title="Phóng to"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => downloadSvgContainerAsPng(refC3.current, 'bieu-do-3-the-tich-thoi-gian.png')}
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Tải ảnh PNG Biểu đồ 3"
                title="Tải ảnh PNG"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'bieu-do-3-the-tich-thoi-gian.csv',
                    ['time_min', 'V_m3', 'V_compare_m3'],
                    timeSeries.map((r) => [r.timeMin, r.volumeM3, r.compareVolumeM3 ?? '']),
                  )
                }
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Xuất CSV Biểu đồ 3"
                title="Xuất CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {renderChartContent('c3', 260)}
        </div>

        {/* Chart 4 */}
        <div ref={refC4} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-relaxed">
                <MathText text="Biểu đồ 4 – Tốc độ tăng mực nước $\dfrac{dh}{dt}$ theo độ cao $h$" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                <MathText text="Khi tiết diện ngang $A(h) = \pi [r(h)]^2$ nhỏ, cùng một lượng nước làm mực nước dâng nhanh hơn." />
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setZoomChartId('c4')}
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Phóng to Biểu đồ 4"
                title="Phóng to"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => downloadSvgContainerAsPng(refC4.current, 'bieu-do-4-toc-do-tang-dhdt.png')}
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Tải ảnh PNG Biểu đồ 4"
                title="Tải ảnh PNG"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'bieu-do-4-toc-do-tang-dhdt.csv',
                    ['h_m', 'dh_dt_m_per_min'],
                    profileSeries.rows.map((r) => [
                      r.z,
                      r.dhdt === null ? 'Tiet_dien_gan_0' : r.dhdt,
                    ]),
                  )
                }
                className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Xuất CSV Biểu đồ 4"
                title="Xuất CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {renderChartContent('c4', 260)}
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <MathFormula displayMode latex="\frac{dh}{dt} = \frac{Q_v - Q_r}{\pi [r(h)]^2}" />
            <span className="text-[11px] text-slate-500 leading-relaxed">
              <MathText text="Các điểm có tiết diện $A(h) \approx 0$ (như đỉnh vòm bán cầu $z = 2$) được lọc an toàn, không hiển thị vô cực." />
            </span>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomChartId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem phóng to biểu đồ"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
        >
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {zoomChartId === 'c1' && (
                  <MathText text="Biểu đồ 1 – Bán kính $r(z)$ theo độ cao $z$" />
                )}
                {zoomChartId === 'c2' && (
                  <MathText text="Biểu đồ 2 – Thể tích nước $\displaystyle V_{\text{water}}(h) = \pi \int_{0}^{h} [r(z)]^2\,dz$" />
                )}
                {zoomChartId === 'c3' && (
                  <MathText text="Biểu đồ 3 – Thể tích theo thời gian $V(t)$" />
                )}
                {zoomChartId === 'c4' && (
                  <MathText text="Biểu đồ 4 – Tốc độ tăng mực nước $\dfrac{dh}{dt}$" />
                )}
              </h3>
              <button
                type="button"
                onClick={() => setZoomChartId(null)}
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Đóng cửa sổ phóng to biểu đồ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderChartContent(zoomChartId, 430)}
          </div>
        </div>
      )}
    </div>
  );
};
