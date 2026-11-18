import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  HardDrive,
  Pencil,
  Play,
  RotateCcw,
  Upload,
  Users,
} from 'lucide-react';
import {
  AI_TOOL_CRITERIA,
  CLASSROOM_EVIDENCE_ITEMS,
  STEM_GROUPS_META,
  STEM_WORKFLOW_STAGES,
  computeAiToolScore10,
} from '../data/stemData';
import {
  AIToolEvaluation,
  ClassroomEvidenceItem,
  StudentAssignment,
  TaskStatus,
  VersionLogItem,
} from '../types';
import { stripMathDelimiters } from '../math/mathTextParser';
import { MathText } from './MathFormula';
import {
  ClassroomEvidenceGallery,
  EvidenceLightboxModal,
  ResilientEvidenceImage,
} from './ClassroomEvidenceGallery';

interface GroupWorkspaceProps {
  students: StudentAssignment[];
  onUpdateStudent: (code: string, patch: Partial<StudentAssignment>) => void;
  onImportWorkspaceJson: (payload: {
    students?: StudentAssignment[];
    aiEvaluations?: AIToolEvaluation[];
    versionLog?: VersionLogItem[];
  }) => void;
  onResetDefaultWorkspace: () => void;
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

export { computeAiToolScore10 };

export const GroupWorkspace: React.FC<GroupWorkspaceProps> = ({
  students,
  onUpdateStudent,
  onImportWorkspaceJson,
  onResetDefaultWorkspace,
  aiEvaluations,
  onUpdateAiEvaluation,
  versionLog,
  onUpdateVersionLog,
}) => {
  const [groupFilter, setGroupFilter] = useState<number>(0); // 0 = all, 1..4
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudentCode, setSelectedStudentCode] = useState<string>('HS16');
  const [editingStudentCode, setEditingStudentCode] = useState<string | null>(null);
  const [expandedWorkflowStep, setExpandedWorkflowStep] = useState<number>(1);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<ClassroomEvidenceItem | null>(null);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const evidenceById = useMemo(() => {
    const map = new Map<string, ClassroomEvidenceItem>();
    for (const item of CLASSROOM_EVIDENCE_ITEMS) {
      map.set(item.id, item);
    }
    return map;
  }, []);

  const openEvidenceById = (mediaId?: string) => {
    if (!mediaId) {
      setLightboxItem(CLASSROOM_EVIDENCE_ITEMS[0] ?? null);
      return;
    }
    const found = evidenceById.get(mediaId) ?? CLASSROOM_EVIDENCE_ITEMS[0] ?? null;
    setLightboxItem(found);
  };

  const getThumbnailSrc = (item?: ClassroomEvidenceItem): string => {
    if (!item) return CLASSROOM_EVIDENCE_ITEMS[1]?.src ?? '';
    return item.type === 'video' ? item.posterSrc ?? '' : item.src;
  };

  const selectedStudent = useMemo(
    () => students.find((s) => s.code === selectedStudentCode) ?? students[0],
    [students, selectedStudentCode],
  );

  const selectedStudentMedia = useMemo(
    () =>
      selectedStudent?.evidenceMediaId
        ? evidenceById.get(selectedStudent.evidenceMediaId)
        : undefined,
    [selectedStudent, evidenceById],
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

  const handleResetWorkspace = () => {
    onResetDefaultWorkspace();
    setEditingStudentCode(null);
    setImportFeedback(
      'Đã khôi phục đầy đủ bộ dữ liệu thực nghiệm lớp học ngày 18/11 (40/40 HS, bảng chấm điểm 3 công cụ AI và nhật ký phiên bản).',
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. Local Storage Honesty Notice & Overall Project Progress */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-700 shrink-0" />
              <span>Dự án STEM của chúng em – Quy mô 40 Học sinh (4 Nhóm)</span>
            </h2>
            <p className="text-xs text-slate-600 flex items-start sm:items-center gap-1.5 leading-relaxed">
              <HardDrive className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                Đã nạp sẵn kết quả thực nghiệm dạy học STEM tại Trường THPT Nguyễn Huệ (18/11) và lưu cục bộ trên trình duyệt (localStorage). Có thể chỉnh sửa trực tiếp hoặc Xuất/Nhập JSON.
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetWorkspace}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Khôi phục mặc định
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất JSON
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
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
          <div className="flex flex-wrap justify-between gap-1 text-xs">
            <span className="font-semibold text-slate-700">
              Tiến độ chung toàn dự án (dựa trên nhiệm vụ đánh dấu Hoàn thành):
            </span>
            <span
              data-testid="stem-overall-progress"
              className="font-mono font-bold text-slate-900 tabular-nums"
            >
              {completedTotalCount}/{students.length} nhiệm vụ ({overallProgressPct.toFixed(1)}%) · Đã kiểm tra xác nhận: {completedAndVerifiedCount}/{students.length}
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
                  <span className="font-mono text-xs text-emerald-800 font-semibold shrink-0 tabular-nums">
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

      {/* 2. Quick Single-Student Inspector & Full 40-Student Roster */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900">
              Tra cứu & Cập nhật nhiệm vụ theo Mã Học sinh (HS01 – HS40)
            </h3>
            <p className="text-xs text-slate-500">
              Hiển thị trực tiếp ảnh thu nhỏ minh chứng và công thức KaTeX đầy đủ; bấm nút Sửa ở từng dòng để cập nhật nội dung
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <label
              htmlFor="student-quick-select"
              className="text-xs font-semibold text-slate-700 shrink-0"
            >
              Chọn mã HS:
            </label>
            <select
              id="student-quick-select"
              value={selectedStudentCode}
              onChange={(e) => setSelectedStudentCode(e.target.value)}
              className="flex-1 sm:flex-initial min-w-0 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-semibold text-slate-900"
            >
              {students.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} – {stripMathDelimiters(s.task)} ({STATUS_LABELS[s.status]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Student Spotlight Card with Live Thumbnail & KaTeX Rendering */}
        {selectedStudent && (
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-4 flex items-start gap-3">
              <button
                type="button"
                onClick={() => openEvidenceById(selectedStudent.evidenceMediaId)}
                aria-label={`Xem phóng to minh chứng của ${selectedStudent.code}`}
                className="group relative w-24 h-18 rounded-lg overflow-hidden border border-cyan-300 bg-slate-900 shrink-0"
              >
                <ResilientEvidenceImage
                  src={getThumbnailSrc(selectedStudentMedia)}
                  alt={selectedStudentMedia?.title ?? selectedStudent.task}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {selectedStudentMedia?.type === 'video' && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                    <Play className="w-5 h-5 fill-white" />
                  </span>
                )}
              </button>

              <div className="min-w-0 space-y-1">
                <div className="text-xs font-mono font-bold text-cyan-950">
                  {selectedStudent.code} · {selectedStudent.groupName}
                </div>
                <div className="text-sm font-bold text-slate-900 leading-snug">
                  <MathText text={selectedStudent.task} />
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Minh chứng:</strong>{' '}
                  <MathText text={selectedStudent.evidence} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
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
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium"
              >
                {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((stKey) => (
                  <option key={stKey} value={stKey}>
                    {STATUS_LABELS[stKey]}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-4">
              {editingStudentCode === selectedStudent.code ? (
                <div>
                  <label
                    htmlFor="quick-evidence"
                    className="block text-[11px] font-medium text-slate-600 mb-1"
                  >
                    Chỉnh sửa nội dung minh chứng (hỗ trợ $...$ KaTeX)
                  </label>
                  <div className="flex items-start gap-1.5">
                    <textarea
                      id="quick-evidence"
                      rows={2}
                      value={selectedStudent.evidence}
                      placeholder="VD: Bản phác thảo trang 2..."
                      onChange={(e) =>
                        onUpdateStudent(selectedStudent.code, { evidence: e.target.value })
                      }
                      className="min-w-0 flex-1 rounded-md border border-cyan-400 bg-white px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingStudentCode(null)}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 shrink-0 whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Xong</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cyan-200/80 bg-white/80 px-3 py-2">
                  <div className="min-w-0 flex-1 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Ghi chú kết quả:</strong>{' '}
                    <MathText text={selectedStudent.note || 'Đã nghiệm thu đầy đủ'} />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEvidenceById(selectedStudent.evidenceMediaId)}
                      aria-label={`Xem minh chứng trực quan của ${selectedStudent.code}`}
                      className="inline-flex items-center gap-1 rounded-md bg-cyan-800 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-900 whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Phóng to</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStudentCode(selectedStudent.code)}
                      aria-label={`Chỉnh sửa thông tin của ${selectedStudent.code}`}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
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
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs"
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
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

        {/* Responsive Progress Roster: Card Stack below lg (<1024px), Full Wrapped Table on lg+ (>=1024px) */}
        <div className="rounded-xl border border-slate-200 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="hidden lg:table-header-group bg-slate-100 text-slate-700 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap w-[76px]">Mã HS</th>
                <th className="py-2.5 px-2.5 font-semibold whitespace-nowrap w-[74px]">Nhóm</th>
                <th className="py-2.5 px-3 font-semibold w-[16%]">Nhiệm vụ được giao</th>
                <th className="py-2.5 px-2.5 font-semibold whitespace-nowrap w-[132px]">Trạng thái</th>
                <th className="py-2.5 px-3 font-semibold w-[31%]">Hình ảnh & Minh chứng thực hiện</th>
                <th className="py-2.5 px-3 font-semibold w-[22%]">Ghi chú kết quả</th>
                <th className="py-2.5 px-3 font-semibold w-[14%]">Người kiểm tra</th>
              </tr>
            </thead>
            <tbody className="block lg:table-row-group divide-y divide-slate-200 bg-white">
              {filteredStudents.map((st) => {
                const linkedMedia = st.evidenceMediaId
                  ? evidenceById.get(st.evidenceMediaId)
                  : undefined;
                const isEditing = editingStudentCode === st.code;

                return (
                  <tr
                    key={st.code}
                    className="block lg:table-row p-4 lg:p-0 space-y-3 lg:space-y-0 hover:bg-slate-50/80 align-top"
                  >
                    {/* Code + Mobile Header */}
                    <td className="flex items-center justify-between lg:table-cell lg:py-3 lg:px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span>{st.code}</span>
                      <div className="flex items-center gap-2 lg:hidden font-sans">
                        <span className="text-[11px] font-semibold text-cyan-800">
                          Nhóm {st.groupId}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingStudentCode(isEditing ? null : st.code)
                          }
                          className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          {isEditing ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>Xong</span>
                            </>
                          ) : (
                            <>
                              <Pencil className="w-3 h-3" />
                              <span>Sửa</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Group */}
                    <td className="hidden lg:table-cell lg:py-3 lg:px-2.5 text-slate-600 whitespace-nowrap">
                      Nhóm {st.groupId}
                    </td>

                    {/* Assigned Task */}
                    <td className="block lg:table-cell lg:py-3 lg:px-3 font-semibold lg:font-medium text-slate-900 lg:text-slate-800 leading-snug break-words">
                      <MathText text={st.task} />
                    </td>

                    {/* Status Select */}
                    <td className="block lg:table-cell lg:py-3 lg:px-2.5">
                      <select
                        aria-label={`Trạng thái của ${st.code}`}
                        value={st.status}
                        onChange={(e) =>
                          onUpdateStudent(st.code, { status: e.target.value as TaskStatus })
                        }
                        className={`w-full lg:w-auto rounded-md border px-2 py-1.5 lg:py-1 text-xs font-medium ${
                          st.status === 'completed'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                            : 'border-slate-300 bg-white text-slate-800'
                        }`}
                      >
                        {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((k) => (
                          <option key={k} value={k}>
                            {STATUS_LABELS[k]}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Visual Evidence Thumbnail + Full Formatted KaTeX Text (No Truncation!) */}
                    <td className="block lg:table-cell lg:py-3 lg:px-3">
                      <div className="flex items-start gap-2.5">
                        {linkedMedia && (
                          <button
                            type="button"
                            onClick={() => openEvidenceById(st.evidenceMediaId)}
                            aria-label={`Mở ${linkedMedia.type === 'video' ? 'video' : 'ảnh'} minh chứng của ${st.code}`}
                            title={stripMathDelimiters(linkedMedia.title)}
                            className="group relative w-16 h-12 rounded-md overflow-hidden border border-slate-300 bg-slate-900 shrink-0 hover:border-cyan-600 transition-colors"
                          >
                            <ResilientEvidenceImage
                              src={getThumbnailSrc(linkedMedia)}
                              alt={linkedMedia.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-slate-950/75 py-0.5 text-[9px] font-semibold text-white text-center leading-none">
                              {linkedMedia.type === 'video' ? '▶ Video' : 'Xem ảnh'}
                            </span>
                          </button>
                        )}

                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <textarea
                              rows={2}
                              aria-label={`Minh chứng của ${st.code}`}
                              value={st.evidence}
                              placeholder="Nhập minh chứng..."
                              onChange={(e) =>
                                onUpdateStudent(st.code, { evidence: e.target.value })
                              }
                              className="w-full rounded border border-cyan-500 bg-white px-2 py-1 text-xs leading-relaxed focus:outline-none"
                            />
                          ) : (
                            <div className="text-xs text-slate-800 leading-relaxed break-words">
                              <MathText text={st.evidence || 'Chưa cập nhật minh chứng'} />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Result Note with Full KaTeX Rendering */}
                    <td className="block lg:table-cell lg:py-3 lg:px-3">
                      {isEditing ? (
                        <textarea
                          rows={2}
                          aria-label={`Ghi chú của ${st.code}`}
                          value={st.note}
                          placeholder="Ghi chú..."
                          onChange={(e) =>
                            onUpdateStudent(st.code, { note: e.target.value })
                          }
                          className="w-full rounded border border-cyan-500 bg-white px-2 py-1 text-xs leading-relaxed focus:outline-none"
                        />
                      ) : (
                        <div className="text-xs text-slate-600 leading-relaxed break-words">
                          <span className="lg:hidden font-semibold text-slate-800">
                            Ghi chú:{' '}
                          </span>
                          <MathText text={st.note || '—'} />
                        </div>
                      )}
                    </td>

                    {/* Reviewer + Desktop Edit Toggle */}
                    <td className="block lg:table-cell lg:py-3 lg:px-3">
                      <div className="flex items-start justify-between gap-1.5">
                        {isEditing ? (
                          <input
                            type="text"
                            aria-label={`Người kiểm tra của ${st.code}`}
                            value={st.reviewer}
                            placeholder="Mã người KT"
                            onChange={(e) =>
                              onUpdateStudent(st.code, { reviewer: e.target.value })
                            }
                            className="min-w-0 flex-1 rounded border border-cyan-500 bg-white px-2 py-1 text-xs focus:outline-none"
                          />
                        ) : (
                          <div className="text-xs font-medium text-slate-800 leading-snug break-words">
                            <span className="lg:hidden text-slate-500 font-normal">
                              Kiểm tra:{' '}
                            </span>
                            {st.reviewer || '—'}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setEditingStudentCode(isEditing ? null : st.code)
                          }
                          aria-label={
                            isEditing
                              ? `Lưu dòng ${st.code}`
                              : `Chỉnh sửa dòng ${st.code}`
                          }
                          title={isEditing ? 'Hoàn tất chỉnh sửa' : 'Chỉnh sửa nội dung'}
                          className="hidden lg:inline-flex items-center justify-center rounded border border-slate-200 bg-white p-1 text-slate-500 hover:border-cyan-500 hover:text-cyan-800 shrink-0"
                        >
                          {isEditing ? (
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Pencil className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Group 3 Interactive AI Tool Comparison Matrix (0-2 per criterion, scaled to 10) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Bảng khảo sát & Đối sánh 3 Công cụ AI (Nhiệm vụ Nhóm 3: HS21 – HS30)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            <MathText text="Bài toán thử nghiệm chung: Tạo bồn trụ 3D, cho chỉnh $R, H$ và tính đúng $V = \pi R^2 H$. Bảng dưới đây đã điền sẵn kết quả chấm điểm thực nghiệm (0–2 điểm/mục) và biên bản đối sánh của Nhóm 3; có thể điều chỉnh lại trực tiếp từng tiêu chí." />
          </p>
        </div>

        {/* Quick 3-Tool Score Summary Strip with Thumbnail Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {aiEvaluations.map((ev) => {
            const score10 = computeAiToolScore10(ev);
            const evMedia = ev.evidenceMediaId
              ? evidenceById.get(ev.evidenceMediaId)
              : undefined;
            return (
              <div
                key={ev.toolId}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {evMedia && (
                    <button
                      type="button"
                      onClick={() => openEvidenceById(ev.evidenceMediaId)}
                      aria-label={`Xem ảnh minh chứng ${ev.toolName}`}
                      className="w-12 h-10 rounded-md overflow-hidden border border-slate-300 bg-slate-900 shrink-0"
                    >
                      <ResilientEvidenceImage
                        src={getThumbnailSrc(evMedia)}
                        alt={evMedia.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {ev.toolName}
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                      {ev.tested ? 'Đã thử nghiệm thực tế' : 'Chờ xác nhận thử nghiệm'}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    data-testid={`ai-score-${ev.toolId}`}
                    className="font-mono text-base font-bold text-cyan-900 tabular-nums"
                  >
                    {score10 !== null ? `${score10.toFixed(2)}/10` : '--'}
                  </div>
                  {ev.evidenceMediaId && (
                    <button
                      type="button"
                      onClick={() => openEvidenceById(ev.evidenceMediaId)}
                      className="text-[11px] font-semibold text-cyan-700 hover:underline"
                    >
                      Xem minh chứng
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Responsive Matrix: Clean Stacked Cards below lg (<1024px), 4-Col Table on lg+ */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="hidden lg:table-header-group bg-slate-100 text-slate-800">
              <tr>
                <th className="py-3 px-3 font-semibold w-[25%]">
                  Tiêu chí đánh giá (0 – 2 điểm / mục)
                </th>
                {aiEvaluations.map((ev) => (
                  <th key={ev.toolId} className="py-3 px-3 font-semibold w-[25%]">
                    <div className="text-slate-900">{ev.toolName}</div>
                    <label className="inline-flex items-center gap-1.5 font-normal text-[11px] text-slate-700 mt-1 cursor-pointer">
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
            <tbody className="block lg:table-row-group divide-y divide-slate-200 bg-white">
              {/* Mobile/Tablet Tested Checkboxes Row */}
              <tr className="block lg:hidden p-3.5 bg-slate-50 space-y-2">
                <td className="block font-semibold text-slate-800">
                  Trạng thái xác nhận thực nghiệm của Nhóm 3:
                </td>
                <td className="block space-y-1.5">
                  {aiEvaluations.map((ev) => (
                    <label
                      key={ev.toolId}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 cursor-pointer"
                    >
                      <span>{ev.toolName}</span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800">
                        <input
                          type="checkbox"
                          checked={ev.tested}
                          onChange={(e) =>
                            onUpdateAiEvaluation(ev.toolId, { tested: e.target.checked })
                          }
                          className="accent-cyan-700 h-4 w-4"
                        />
                        Đã thử nghiệm
                      </span>
                    </label>
                  ))}
                </td>
              </tr>

              {AI_TOOL_CRITERIA.map((crit) => (
                <tr
                  key={crit.id}
                  className="block lg:table-row p-3.5 lg:p-0 space-y-2.5 lg:space-y-0 hover:bg-slate-50/70"
                >
                  <td className="block lg:table-cell lg:py-2.5 lg:px-3 leading-relaxed">
                    <div className="font-semibold text-slate-900">{crit.label}</div>
                    <div className="text-[11px] text-slate-500">
                      <MathText text={crit.description} />
                    </div>
                  </td>
                  {aiEvaluations.map((ev) => {
                    const val = ev.scores[crit.id];
                    return (
                      <td
                        key={ev.toolId}
                        className="block lg:table-cell lg:py-2.5 lg:px-3"
                      >
                        <div className="lg:hidden text-[11px] font-semibold text-slate-700 mb-1">
                          {ev.toolName}
                        </div>
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
                          className="w-full rounded border border-slate-300 bg-white px-2.5 py-2 lg:py-1.5 font-mono text-xs tabular-nums"
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
              <tr className="block lg:table-row p-3.5 lg:p-0 space-y-3 lg:space-y-0 bg-slate-50/60 align-top">
                <td className="block lg:table-cell lg:py-3 lg:px-3 font-semibold text-slate-800">
                  Minh chứng thử nghiệm & Ghi chú ưu/nhược điểm thực tế
                </td>
                {aiEvaluations.map((ev) => {
                  const evMedia = ev.evidenceMediaId
                    ? evidenceById.get(ev.evidenceMediaId)
                    : undefined;
                  return (
                    <td
                      key={ev.toolId}
                      className="block lg:table-cell lg:py-3 lg:px-3 space-y-2"
                    >
                      <div className="flex items-center justify-between lg:hidden pt-1">
                        <span className="text-xs font-bold text-slate-900">{ev.toolName}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        {evMedia && (
                          <button
                            type="button"
                            onClick={() => openEvidenceById(ev.evidenceMediaId)}
                            aria-label={`Xem minh chứng của ${ev.toolName}`}
                            className="relative w-14 h-11 rounded border border-slate-300 bg-slate-900 overflow-hidden shrink-0 hover:border-cyan-600"
                          >
                            <ResilientEvidenceImage
                              src={getThumbnailSrc(evMedia)}
                              alt={evMedia.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-slate-950/75 text-[9px] text-white text-center leading-tight">
                              Xem
                            </span>
                          </button>
                        )}
                        <textarea
                          rows={2}
                          aria-label={`Minh chứng thử nghiệm ${ev.toolName}`}
                          value={ev.evidence}
                          placeholder="Link ảnh / biên bản thử..."
                          onChange={(e) =>
                            onUpdateAiEvaluation(ev.toolId, { evidence: e.target.value })
                          }
                          className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs leading-snug"
                        />
                      </div>

                      <textarea
                        rows={4}
                        aria-label={`Nhận xét ưu nhược điểm ${ev.toolName}`}
                        value={ev.pros}
                        placeholder="Nhận xét ưu/nhược điểm thực tế..."
                        onChange={(e) =>
                          onUpdateAiEvaluation(ev.toolId, { pros: e.target.value })
                        }
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs leading-relaxed"
                      />
                    </td>
                  );
                })}
              </tr>

              {/* Total Normalized 10-Point Score Row */}
              <tr className="block lg:table-row p-3.5 lg:p-0 space-y-2 lg:space-y-0 bg-slate-900 text-white font-semibold">
                <td className="block lg:table-cell lg:py-3 lg:px-3">
                  Điểm quy đổi thang 10,0 (tính trên 8 tiêu chí thực nghiệm)
                </td>
                {aiEvaluations.map((ev) => {
                  const score10 = computeAiToolScore10(ev);
                  return (
                    <td
                      key={ev.toolId}
                      className="flex items-center justify-between lg:table-cell lg:py-3 lg:px-3 font-mono text-sm tabular-nums"
                    >
                      <span className="lg:hidden font-sans text-xs text-slate-300">
                        {ev.toolName}:
                      </span>
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

      {/* 4. Real Classroom Evidence Gallery (1 Video + 17 Photos at THPT Nguyen Hue) */}
      <ClassroomEvidenceGallery
        onOpenEvidence={(item) => setLightboxItem(item)}
        customVideoUrl={customVideoUrl}
        onSelectCustomVideo={(url) => setCustomVideoUrl(url)}
      />

      {/* 5. 7-Step STEM Process Guide & Version Log (Section XI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Expandable 7-Step STEM Process */}
        <section className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Quy trình thực hiện Dự án STEM (7 Bước chuẩn)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
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
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs font-mono font-bold text-white shrink-0">
                        {stage.step}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{stage.title}</div>
                        <div className="text-[11px] text-slate-500">Phụ trách: {stage.owner}</div>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
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
        <section className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-700 shrink-0" />
              <span>Nhật ký phiên bản sản phẩm</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đã xác nhận nghiệm thu đầy đủ qua 6 mốc phát triển từ Ý tưởng v1 đến Bản hoàn chỉnh (18/11)
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
                  <span className="text-[11px] font-mono text-emerald-900 tabular-nums">
                    {ver.confirmed ? `Đã xác nhận ${ver.updatedAt}` : 'Chờ xác nhận'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <MathText text={ver.description} />
                </p>
                <input
                  type="text"
                  aria-label={`Người xác nhận ${ver.versionName}`}
                  value={ver.confirmedBy}
                  placeholder="Người xác nhận (VD: HS31 / GV Lê Văn Mạnh)"
                  onChange={(e) =>
                    onUpdateVersionLog(ver.id, { confirmedBy: e.target.value })
                  }
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Lightbox Modal for Photo & Video Evidence */}
      <EvidenceLightboxModal
        activeItem={lightboxItem}
        customVideoUrl={customVideoUrl}
        onClose={() => setLightboxItem(null)}
        onSelectItem={(item) => setLightboxItem(item)}
      />
    </div>
  );
};
