import React, { useMemo, useRef, useState } from 'react';
import {
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Download,
  HardDrive,
  Upload,
  Users,
} from 'lucide-react';
import {
  AI_TOOL_CRITERIA,
  STEM_GROUPS_META,
  STEM_WORKFLOW_STAGES,
} from '../data/stemData';
import {
  AIToolEvaluation,
  StudentAssignment,
  TaskStatus,
  VersionLogItem,
} from '../types';
import { MathText } from './MathFormula';

interface GroupWorkspaceProps {
  students: StudentAssignment[];
  onUpdateStudent: (code: string, patch: Partial<StudentAssignment>) => void;
  onImportWorkspaceJson: (payload: {
    students?: StudentAssignment[];
    aiEvaluations?: AIToolEvaluation[];
    versionLog?: VersionLogItem[];
  }) => void;
  aiEvaluations: AIToolEvaluation[];
  onUpdateAiEvaluation: (
    toolId: AIToolEvaluation['toolId'],
    patch: Partial<AIToolEvaluation>,
  ) => void;
  versionLog: VersionLogItem[];
  onUpdateVersionLog: (id: string, patch: Partial<VersionLogItem>) => void;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Chưa thực hiện',
  in_progress: 'Đang thực hiện',
  pending_review: 'Chờ kiểm tra',
  completed: 'Hoàn thành',
  needs_revision: 'Cần chỉnh sửa',
};

export const GroupWorkspace: React.FC<GroupWorkspaceProps> = ({
  students,
  onUpdateStudent,
  onImportWorkspaceJson,
  aiEvaluations,
  onUpdateAiEvaluation,
  versionLog,
  onUpdateVersionLog,
}) => {
  const [groupFilter, setGroupFilter] = useState<number>(0); // 0 = all, 1..4
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudentCode, setSelectedStudentCode] = useState<string>('HS11');
  const [expandedWorkflowStep, setExpandedWorkflowStep] = useState<number>(1);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedStudent = useMemo(
    () => students.find((s) => s.code === selectedStudentCode) ?? students[0],
    [students, selectedStudentCode],
  );

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (groupFilter !== 0 && s.groupId !== groupFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    });
  }, [students, groupFilter, statusFilter]);

  const completedAndVerifiedCount = useMemo(
    () =>
      students.filter((s) => s.status === 'completed' && s.reviewer.trim().length > 0).length,
    [students],
  );
  const completedTotalCount = useMemo(
    () => students.filter((s) => s.status === 'completed').length,
    [students],
  );
  const overallProgressPct = (completedTotalCount / students.length) * 100;

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      project: 'SMART WATER TANK 3D - THPT Nguyen Hue',
      students,
      aiEvaluations,
      versionLog,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart-water-tank-stem-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed === 'object') {
          onImportWorkspaceJson({
            students: Array.isArray(parsed.students) ? parsed.students : undefined,
            aiEvaluations: Array.isArray(parsed.aiEvaluations)
              ? parsed.aiEvaluations
              : undefined,
            versionLog: Array.isArray(parsed.versionLog) ? parsed.versionLog : undefined,
          });
          setImportFeedback('Đã nhập dữ liệu JSON tiến độ nhóm thành công.');
        }
      } catch {
        setImportFeedback('Tệp JSON không hợp lệ — vui lòng kiểm tra lại định dạng.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const computeToolScore10 = (ev: AIToolEvaluation): number | null => {
    const vals = AI_TOOL_CRITERIA.map((c) => ev.scores[c.id]);
    const rated = vals.filter((v): v is number => v !== null && Number.isFinite(v));
    if (rated.length === 0) return null;
    const rawSum = rated.reduce((acc, v) => acc + v, 0);
    const maxPossible = rated.length * 2;
    return Number(((rawSum / maxPossible) * 10).toFixed(2));
  };

  return (
    <div className="space-y-8">
      {/* 1. Local Storage Honesty Notice & Overall Project Progress */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-700" />
              Dự án STEM của chúng em – Quy mô 40 Học sinh (4 Nhóm)
            </h2>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                Chế độ lưu trữ: Dữ liệu đang lưu cục bộ trên trình duyệt của thiết bị này (localStorage), không giả lập đồng bộ trực tuyến. Dùng Xuất/Nhập JSON để ghép tiến độ giữa các máy.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất JSON
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Upload className="w-3.5 h-3.5" />
              Nhập JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportJsonFile}
              className="hidden"
            />
          </div>
        </div>

        {importFeedback && (
          <div className="rounded-lg bg-cyan-50 border border-cyan-200 px-3 py-2 text-xs text-cyan-950">
            {importFeedback}
          </div>
        )}

        {/* Overall STEM Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex flex-wrap justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Tiến độ chung toàn dự án (dựa trên nhiệm vụ đánh dấu Hoàn thành):
            </span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {completedTotalCount}/40 nhiệm vụ ({overallProgressPct.toFixed(1)}%) · Đã có người kiểm tra xác nhận: {completedAndVerifiedCount}/40
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-200"
              style={{ width: `${overallProgressPct}%` }}
            />
          </div>
        </div>

        {/* 4 Group Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {STEM_GROUPS_META.map((grp) => {
            const grpStudents = students.filter((s) => s.groupId === grp.id);
            const grpDone = grpStudents.filter((s) => s.status === 'completed').length;
            return (
              <div
                key={grp.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{grp.title}</h3>
                  <span className="font-mono text-xs text-cyan-800 font-semibold shrink-0">
                    {grp.studentRange} · {grpDone}/10 xong
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
                  {grp.objectives.map((obj, i) => (
                    <li key={i}>
                      <MathText text={obj} />
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-800 pt-1 border-t border-slate-200/80">
                  <strong>Sản phẩm bàn giao:</strong> {grp.deliverable}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Quick Single-Student Inspector & Full 40-Student Table */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tra cứu & Cập nhật nhiệm vụ theo Mã Học sinh (HS01 – HS40)
            </h3>
            <p className="text-xs text-slate-500">
              Chọn nhanh một mã học sinh bên dưới để xem và cập nhật trạng thái, minh chứng làm việc
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="student-quick-select" className="text-xs font-semibold text-slate-700">
              Chọn mã HS:
            </label>
            <select
              id="student-quick-select"
              value={selectedStudentCode}
              onChange={(e) => setSelectedStudentCode(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-slate-900"
            >
              {students.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} – {s.task}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Student Spotlight Card */}
        {selectedStudent && (
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4 space-y-1">
              <div className="text-xs font-mono font-bold text-cyan-950">
                {selectedStudent.code} · {selectedStudent.groupName}
              </div>
              <div className="text-sm font-bold text-slate-900">{selectedStudent.task}</div>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="quick-status"
                className="block text-[11px] font-medium text-slate-600 mb-1"
              >
                Trạng thái
              </label>
              <select
                id="quick-status"
                value={selectedStudent.status}
                onChange={(e) =>
                  onUpdateStudent(selectedStudent.code, {
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium"
              >
                {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((stKey) => (
                  <option key={stKey} value={stKey}>
                    {STATUS_LABELS[stKey]}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="quick-evidence"
                className="block text-[11px] font-medium text-slate-600 mb-1"
              >
                Minh chứng (liên kết / mô tả)
              </label>
              <input
                id="quick-evidence"
                type="text"
                value={selectedStudent.evidence}
                placeholder="VD: Bản phác thảo trang 2..."
                onChange={(e) =>
                  onUpdateStudent(selectedStudent.code, { evidence: e.target.value })
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              />
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="quick-reviewer"
                className="block text-[11px] font-medium text-slate-600 mb-1"
              >
                Người kiểm tra
              </label>
              <input
                id="quick-reviewer"
                type="text"
                value={selectedStudent.reviewer}
                placeholder="VD: HS01 / GV Lê Văn Mạnh"
                onChange={(e) =>
                  onUpdateStudent(selectedStudent.code, { reviewer: e.target.value })
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>
        )}

        {/* Filter Bar for Table */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 0, label: 'Tất cả (40 HS)' },
              { id: 1, label: 'Nhóm 1' },
              { id: 2, label: 'Nhóm 2' },
              { id: 3, label: 'Nhóm 3' },
              { id: 4, label: 'Nhóm 4' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGroupFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  groupFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            aria-label="Lọc theo trạng thái nhiệm vụ"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="all">Mọi trạng thái</option>
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((stKey) => (
              <option key={stKey} value={stKey}>
                {STATUS_LABELS[stKey]}
              </option>
            ))}
          </select>
        </div>

        {/* Responsive Progress Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[420px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Mã HS</th>
                <th className="py-2.5 px-3 font-semibold">Nhóm</th>
                <th className="py-2.5 px-3 font-semibold">Nhiệm vụ được giao</th>
                <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                <th className="py-2.5 px-3 font-semibold">Minh chứng</th>
                <th className="py-2.5 px-3 font-semibold">Ghi chú</th>
                <th className="py-2.5 px-3 font-semibold">Người kiểm tra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredStudents.map((st) => (
                <tr key={st.code} className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {st.code}
                  </td>
                  <td className="py-2 px-3 text-slate-600 whitespace-nowrap">Nhóm {st.groupId}</td>
                  <td className="py-2 px-3 font-medium text-slate-800 min-w-[180px]">{st.task}</td>
                  <td className="py-2 px-3">
                    <select
                      aria-label={`Trạng thái của ${st.code}`}
                      value={st.status}
                      onChange={(e) =>
                        onUpdateStudent(st.code, { status: e.target.value as TaskStatus })
                      }
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    >
                      {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((k) => (
                        <option key={k} value={k}>
                          {STATUS_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      aria-label={`Minh chứng của ${st.code}`}
                      value={st.evidence}
                      placeholder="Nhập minh chứng..."
                      onChange={(e) => onUpdateStudent(st.code, { evidence: e.target.value })}
                      className="w-36 rounded border border-slate-200 px-2 py-1 text-xs focus:border-cyan-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      aria-label={`Ghi chú của ${st.code}`}
                      value={st.note}
                      placeholder="Ghi chú..."
                      onChange={(e) => onUpdateStudent(st.code, { note: e.target.value })}
                      className="w-32 rounded border border-slate-200 px-2 py-1 text-xs focus:border-cyan-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      aria-label={`Người kiểm tra của ${st.code}`}
                      value={st.reviewer}
                      placeholder="Mã người KT"
                      onChange={(e) => onUpdateStudent(st.code, { reviewer: e.target.value })}
                      className="w-28 rounded border border-slate-200 px-2 py-1 text-xs focus:border-cyan-600 focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Group 3 Interactive AI Tool Comparison Matrix (0-2 per criterion, scaled to 10) */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Bảng khảo sát & Đối sánh 3 Công cụ AI (Nhiệm vụ Nhóm 3: HS21 – HS30)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            <MathText text="Bài toán thử nghiệm chung: Tạo bồn trụ 3D, cho chỉnh $R, H$ và tính đúng $V = \pi R^2 H$. Nhập điểm 0–2 cho từng tiêu chí sau khi thực nghiệm (hệ thống không tự điền sẵn điểm khi chưa có dữ liệu kiểm chứng)." />
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold min-w-[200px]">
                  Tiêu chí đánh giá (0 – 2 điểm / mục)
                </th>
                {aiEvaluations.map((ev) => (
                  <th key={ev.toolId} className="py-2.5 px-3 font-semibold min-w-[190px]">
                    <div>{ev.toolName}</div>
                    <label className="inline-flex items-center gap-1.5 font-normal text-[11px] text-slate-600 mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ev.tested}
                        onChange={(e) =>
                          onUpdateAiEvaluation(ev.toolId, { tested: e.target.checked })
                        }
                        className="accent-cyan-700"
                      />
                      Xác nhận đã thử nghiệm thực tế
                    </label>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {AI_TOOL_CRITERIA.map((crit) => (
                <tr key={crit.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 leading-relaxed">
                    <div className="font-semibold text-slate-900">{crit.label}</div>
                    <div className="text-[11px] text-slate-500">
                      <MathText text={crit.description} />
                    </div>
                  </td>
                  {aiEvaluations.map((ev) => {
                    const val = ev.scores[crit.id];
                    return (
                      <td key={ev.toolId} className="py-2.5 px-3">
                        <select
                          aria-label={`${ev.toolName} - ${crit.label}`}
                          value={val === null || val === undefined ? '' : String(val)}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const nextScore = raw === '' ? null : Number(raw);
                            onUpdateAiEvaluation(ev.toolId, {
                              scores: { ...ev.scores, [crit.id]: nextScore },
                            });
                          }}
                          className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs tabular-nums"
                        >
                          <option value="">-- Chưa chấm --</option>
                          <option value="0">0 điểm (Chưa đáp ứng)</option>
                          <option value="1">1 điểm (Đáp ứng cơ bản)</option>
                          <option value="2">2 điểm (Tốt / Chính xác)</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Evidence & Notes Rows */}
              <tr className="bg-slate-50/60">
                <td className="py-2.5 px-3 font-semibold text-slate-800">
                  Minh chứng thử nghiệm & Ghi chú ưu/nhược điểm
                </td>
                {aiEvaluations.map((ev) => (
                  <td key={ev.toolId} className="py-2.5 px-3 space-y-1.5">
                    <input
                      type="text"
                      value={ev.evidence}
                      placeholder="Link ảnh / biên bản thử..."
                      onChange={(e) =>
                        onUpdateAiEvaluation(ev.toolId, { evidence: e.target.value })
                      }
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    />
                    <textarea
                      rows={2}
                      value={ev.pros}
                      placeholder="Nhận xét ưu/nhược điểm thực tế..."
                      onChange={(e) =>
                        onUpdateAiEvaluation(ev.toolId, { pros: e.target.value })
                      }
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    />
                  </td>
                ))}
              </tr>

              {/* Total Normalized 10-Point Score Row */}
              <tr className="bg-slate-900 text-white font-semibold">
                <td className="py-3 px-3">
                  Điểm quy đổi thang 10,0 (tính trên các tiêu chí đã chấm)
                </td>
                {aiEvaluations.map((ev) => {
                  const score10 = computeToolScore10(ev);
                  return (
                    <td key={ev.toolId} className="py-3 px-3 font-mono text-sm tabular-nums">
                      {score10 === null ? (
                        <span className="text-slate-400 text-xs font-sans">
                          Chưa có dữ liệu đánh giá
                        </span>
                      ) : (
                        <span className="text-cyan-300">
                          {score10.toFixed(2)} / 10,0 điểm{' '}
                          {!ev.tested && '(Chờ tích xác nhận thử)'}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. 7-Step STEM Process Guide & Version Log (Section XI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Expandable 7-Step STEM Process */}
        <section className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Quy trình thực hiện Dự án STEM (7 Bước chuẩn)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Khảo sát vấn đề → Phác thảo ý tưởng → Viết prompt Gemini → So sánh công cụ → Tạo ứng dụng → Kiểm thử → Trình diễn
            </p>
          </div>

          <div className="space-y-2.5">
            {STEM_WORKFLOW_STAGES.map((stage) => {
              const isOpen = expandedWorkflowStep === stage.step;
              return (
                <div
                  key={stage.step}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedWorkflowStep(isOpen ? 0 : stage.step)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs font-mono font-bold text-white">
                        {stage.step}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{stage.title}</div>
                        <div className="text-[11px] text-slate-500">Phụ trách: {stage.owner}</div>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-200/80 bg-white space-y-2 text-xs text-slate-700 leading-relaxed">
                      <p>
                        <strong className="text-slate-900">Mục tiêu:</strong>{' '}
                        <MathText text={stage.goal} />
                      </p>
                      <div>
                        <strong className="text-slate-900">Công việc cụ thể:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-0.5">
                          {stage.tasks.map((t, idx) => (
                            <li key={idx}>
                              <MathText text={t} />
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p>
                        <strong className="text-slate-900">Sản phẩm bàn giao:</strong>{' '}
                        <MathText text={stage.deliverable} />
                      </p>
                      <p>
                        <strong className="text-slate-900">Tiêu chí hoàn thành:</strong>{' '}
                        <MathText text={stage.criteria} />
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Right 5 Cols: Version Log with Explicit Confirmation */}
        <section className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-700" />
              Nhật ký phiên bản sản phẩm
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chỉ đánh dấu hoàn thành khi trưởng nhóm hoặc giáo viên trực tiếp xác nhận
            </p>
          </div>

          <div className="space-y-3">
            {versionLog.map((ver) => (
              <div
                key={ver.id}
                className={`rounded-xl border p-3.5 space-y-2 ${
                  ver.confirmed
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ver.confirmed}
                      onChange={(e) =>
                        onUpdateVersionLog(ver.id, {
                          confirmed: e.target.checked,
                          updatedAt: e.target.checked
                            ? new Date().toLocaleDateString('vi-VN')
                            : '',
                        })
                      }
                      className="accent-emerald-600 h-4 w-4"
                    />
                    {ver.versionName}
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {ver.confirmed ? `Đã xác nhận ${ver.updatedAt}` : 'Chờ xác nhận'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{ver.description}</p>
                <input
                  type="text"
                  value={ver.confirmedBy}
                  placeholder="Người xác nhận (VD: HS31 / GV Lê Văn Mạnh)"
                  onChange={(e) =>
                    onUpdateVersionLog(ver.id, { confirmedBy: e.target.value })
                  }
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
