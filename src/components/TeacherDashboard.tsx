import React from 'react';
import { ClipboardCheck, Download, Printer, RotateCcw } from 'lucide-react';
import {
  InternalTestResult,
  StudentAssignment,
  TeacherRubricState,
} from '../types';

interface TeacherDashboardProps {
  students: StudentAssignment[];
  rubric: TeacherRubricState;
  onChangeRubric: (next: TeacherRubricState) => void;
  onResetRubric?: () => void;
  bestQuizScore: number | null;
  testResults: InternalTestResult[];
}

const RUBRIC_ROWS: {
  key: keyof Omit<TeacherRubricState, 'teacherComment'>;
  label: string;
  max: number;
}[] = [
  { key: 'mathAccuracy', label: 'Kiến thức tích phân, số liệu, đơn vị', max: 3.0 },
  { key: 'model3D', label: 'Mô hình 3D và điều khiển', max: 2.0 },
  { key: 'geminiPrompt', label: 'Chất lượng prompt Gemini', max: 1.5 },
  { key: 'aiComparison', label: 'So sánh công cụ có minh chứng', max: 1.0 },
  { key: 'teamCollaboration', label: 'Hợp tác 4 nhóm (40 học sinh)', max: 1.5 },
  { key: 'presentation', label: 'Báo cáo và trình diễn', max: 1.0 },
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  rubric,
  onChangeRubric,
  onResetRubric,
  bestQuizScore,
  testResults,
}) => {
  const completedTasks = students.filter((s) => s.status === 'completed').length;
  const revisionTasks = students.filter((s) => s.status === 'needs_revision').length;
  const inProgressTasks = students.filter((s) => s.status === 'in_progress').length;
  const passedTests = testResults.filter((t) => t.passed).length;

  const totalScore =
    rubric.mathAccuracy +
    rubric.model3D +
    rubric.geminiPrompt +
    rubric.aiComparison +
    rubric.teamCollaboration +
    rubric.presentation;

  const handleExportReportCsv = () => {
    const lines = [
      ['Thong tin', 'Gia tri'],
      ['Truong', 'THPT Nguyen Hue'],
      ['Giao vien phu trach', 'Le Van Manh'],
      ['Mon hoc', 'Toan 12 - Ket noi tri thuc voi cuoc song - Bai 13'],
      ['Si so', String(students.length)],
      ['So nhom', '4'],
      ['Nhiem vu da hoan thanh', `${completedTasks}/${students.length}`],
      ['Nhiem vu can chinh sua', String(revisionTasks)],
      [
        'Ket qua luyen tap trac nghiem',
        bestQuizScore !== null ? `${bestQuizScore.toFixed(1)}/10` : 'Chua nop bai',
      ],
      [
        'Ket qua kiem thu ung dung',
        testResults.length > 0 ? `${passedTests}/${testResults.length} Dat` : 'Chua chay',
      ],
      ['---', '---'],
      ['Tieu chi danh gia', 'Diem dat / Toi da'],
      ...RUBRIC_ROWS.map((r) => [r.label, `${rubric[r.key].toFixed(2)} / ${r.max.toFixed(1)}`]),
      ['TONG DIEM DU AN', `${totalScore.toFixed(2)} / 10.0`],
      ['Nhan xet cua giao vien', rubric.teacherComment || '(Chua co nhan xet)'],
    ];

    const csv =
      '\uFEFF' +
      lines
        .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bao-cao-danh-gia-stem-smart-water-tank.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-cyan-700" />
              Dashboard Theo dõi & Đánh giá dành cho Giáo viên
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Giáo viên phụ trách: Lê Văn Mạnh · Trường THPT Nguyễn Huệ · Phiên bản cục bộ phục vụ tiết học STEM
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            {onResetRubric && (
              <button
                type="button"
                onClick={onResetRubric}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Khôi phục phiếu chấm mẫu
              </button>
            )}
            <button
              type="button"
              onClick={handleExportReportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất kết quả CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              In báo cáo
            </button>
          </div>
        </div>

        {/* Summary KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-500 block">Sĩ số lớp</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">40 HS</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-500 block">Số nhóm</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">4 nhóm</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-500 block">Tổng nhiệm vụ</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {students.length}
            </span>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
            <span className="text-[11px] text-emerald-900 block">Đã hoàn thành</span>
            <span className="text-lg font-bold font-mono text-emerald-950 tabular-nums">
              {completedTasks} ({inProgressTasks} đang làm)
            </span>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <span className="text-[11px] text-amber-900 block">Cần chỉnh sửa</span>
            <span className="text-lg font-bold font-mono text-amber-950 tabular-nums">
              {revisionTasks}
            </span>
          </div>
          <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-3">
            <span className="text-[11px] text-cyan-900 block">KQ Luyện tập</span>
            <span className="text-lg font-bold font-mono text-cyan-950 tabular-nums">
              {bestQuizScore !== null ? `${bestQuizScore.toFixed(1)}/10` : 'Chưa nộp'}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-500 block">KQ Kiểm thử</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {testResults.length > 0 ? `${passedTests}/${testResults.length} Đạt` : 'Chưa chạy'}
            </span>
          </div>
        </div>

        {/* 10-Point Grading Rubric Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          <div className="lg:col-span-7 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Tiêu chí đánh giá dự án STEM</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Điểm tối đa</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Điểm chấm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {RUBRIC_ROWS.map((r) => (
                  <tr key={r.key} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-900">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                      {r.max.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <input
                        type="number"
                        aria-label={`Điểm ${r.label}`}
                        min={0}
                        max={r.max}
                        step={0.25}
                        value={rubric[r.key]}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          const clamped = Number.isNaN(v)
                            ? 0
                            : Math.min(Math.max(0, v), r.max);
                          onChangeRubric({ ...rubric, [r.key]: clamped });
                        }}
                        className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-right font-mono text-xs font-semibold tabular-nums"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="py-3 px-4">Tổng điểm đánh giá dự án</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">10,0</td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-cyan-300 tabular-nums">
                    {totalScore.toFixed(2)} / 10,0
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <label
              htmlFor="teacher-comment-box"
              className="block text-xs font-bold text-slate-900"
            >
              Nhận xét chuyên môn của Giáo viên Lê Văn Mạnh:
            </label>
            <textarea
              id="teacher-comment-box"
              rows={7}
              value={rubric.teacherComment}
              onChange={(e) =>
                onChangeRubric({ ...rubric, teacherComment: e.target.value })
              }
              placeholder="Ghi nhận xét về mức độ nắm vững kiến thức Bài 13 (Ứng dụng hình học của tích phân), kỹ năng kiểm chứng kết quả AI của 4 nhóm và chất lượng thuyết trình..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 leading-relaxed focus:border-cyan-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Bảng điểm và nhận xét được lưu tự động trên thiết bị để giáo viên trình chiếu tổng kết tiết học hoặc in phiếu đánh giá.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
