import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  Box,
  Calculator,
  ClipboardCheck,
  Droplets,
  LineChart,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  AIToolEvaluation,
  AppTab,
  InternalTestResult,
  LanguageMode,
  StudentAssignment,
  TankParameters,
  TeacherRubricState,
  VersionLogItem,
} from '../types';
import { calculateTotalVolume, calculateWaterVolume } from '../math/MathEngine';
import { TankScene3D } from './TankScene3D';
import { GroupWorkspace } from './GroupWorkspace';
import { TeacherDashboard } from './TeacherDashboard';
import { TestPanel } from './TestPanel';
import { MathFormula } from './MathFormula';

interface DashboardProps {
  language: LanguageMode;
  parameters: TankParameters;
  onNavigateTab: (tab: AppTab) => void;
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
  rubric: TeacherRubricState;
  onChangeRubric: (next: TeacherRubricState) => void;
  bestQuizScore: number | null;
  testResults: InternalTestResult[];
  onUpdateTestResults: (next: InternalTestResult[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  language,
  parameters,
  onNavigateTab,
  students,
  onUpdateStudent,
  onImportWorkspaceJson,
  aiEvaluations,
  onUpdateAiEvaluation,
  versionLog,
  onUpdateVersionLog,
  rubric,
  onChangeRubric,
  bestQuizScore,
  testResults,
  onUpdateTestResults,
}) => {
  const [stemSubView, setStemSubView] = useState<'groups' | 'teacher' | 'tests'>('groups');

  const vMax = calculateTotalVolume(parameters);
  const vWater = calculateWaterVolume(parameters.h, parameters);

  return (
    <div className="space-y-8">
      {/* 1. HERO SECTION */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 6 Cols: Project Attribution & Primary Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <div className="space-y-4">
              {/* Unboxed Kicker Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-cyan-800">
                <span>DỰ ÁN STEM</span>
                <span aria-hidden="true">·</span>
                <span>TOÁN 12</span>
                <span aria-hidden="true">·</span>
                <span>KẾT NỐI TRI THỨC VỚI CUỘC SỐNG</span>
              </div>

              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950"
                style={{ textWrap: 'balance' }}
              >
                SMART WATER TANK 3D
              </h1>

              <p className="text-base font-medium text-slate-700 leading-relaxed">
                {language === 'vi'
                  ? 'Hệ sinh thái mô phỏng bồn chứa nước 3D – Học tích phân qua thực hành thiết kế, bơm – xả và tối ưu hóa vật liệu.'
                  : 'Interactive 3D Water Tank Simulation Ecosystem – Learning Calculus Integrals through Engineering Practice.'}
              </p>

              {/* School, Teacher & Lesson Attribution (Clean Unboxed Text) */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <strong className="text-slate-900">Đơn vị: Trường THPT Nguyễn Huệ</strong>
                  <span aria-hidden="true">·</span>
                  <span>
                    Giáo viên phụ trách: <strong className="text-slate-900">Lê Văn Mạnh</strong>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Chương IV: Nguyên hàm và tích phân</span>
                  <span aria-hidden="true">·</span>
                  <strong className="text-cyan-900">
                    Bài 13: Ứng dụng hình học của tích phân
                  </strong>
                  <span aria-hidden="true">·</span>
                  <span>Quy mô: 40 học sinh (4 nhóm)</span>
                </div>
              </div>

              {/* Core Integral Formula Highlight */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <MathFormula latex="V_{\text{water}}(h) = \pi \int_{0}^{h} [r(z)]^2\,dz" />
                <div className="text-xs font-mono text-slate-700 tabular-nums">
                  Hiện tại: <strong>{vWater.toFixed(2)}</strong> / {vMax.toFixed(2)} m³
                </div>
              </div>
            </div>

            {/* 3 Primary Navigation CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab('design3d')}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Box className="w-4 h-4 text-cyan-400" />
                Khám phá mô hình 3D
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('math')}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-xs font-bold text-white hover:bg-cyan-800 transition-colors whitespace-nowrap"
              >
                <Calculator className="w-4 h-4" />
                Bắt đầu thiết kế bồn
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('optimize_practice')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <Award className="w-4 h-4 text-amber-600" />
                Tham gia thử thách STEM
              </button>
            </div>
          </div>

          {/* Right 6 Cols: Interactive 3D Hero Water Tank */}
          <div className="lg:col-span-6">
            <TankScene3D
              parameters={parameters}
              isPumping={true}
              compact={false}
              heightClass="h-[390px] lg:h-[430px]"
              titleBadge="Mô hình 3D Tương tác trực tiếp · Kéo chuột để xoay 360°"
            />
          </div>
        </div>

        {/* Full-Width Pedagogical Chain Strip Below Hero */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              tab: 'design3d' as AppTab,
              icon: Box,
              step: '01. Hình khối 3D',
              desc: '4 loại bồn & mặt cắt r(z)',
            },
            {
              tab: 'math' as AppTab,
              icon: Calculator,
              step: '02. Tích phân',
              desc: '5 bước giải KaTeX & đĩa xoay',
            },
            {
              tab: 'pump' as AppTab,
              icon: Droplets,
              step: '03. Bơm – Xả',
              desc: 'Mực nước phi tuyến theo t',
            },
            {
              tab: 'charts' as AppTab,
              icon: LineChart,
              step: '04. Đồ thị số',
              desc: '4 đồ thị r(z), V(h), V(t), dh/dt',
            },
            {
              tab: 'optimize_practice' as AppTab,
              icon: Award,
              step: '05. Tối ưu & Game',
              desc: 'So sánh vỏ A/B & 10 câu hỏi',
            },
            {
              tab: 'overview' as AppTab,
              icon: Users,
              step: '06. Hợp tác STEM',
              desc: '40 học sinh · 4 nhóm & Kiểm thử',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigateTab(item.tab)}
                className="group rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-left hover:border-cyan-500 hover:bg-white transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{item.step}</span>
                  <Icon className="w-3.5 h-3.5 text-cyan-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>{item.desc}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-700" />
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. STEM WORKSPACE, TEACHER DASHBOARD & 12-TEST PANEL SWITCHER */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setStemSubView('groups')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
                stemSubView === 'groups'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Không gian 40 Học sinh & 4 Nhóm STEM
            </button>
            <button
              type="button"
              onClick={() => setStemSubView('teacher')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
                stemSubView === 'teacher'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              Dashboard Giáo viên Lê Văn Mạnh
            </button>
            <button
              type="button"
              onClick={() => setStemSubView('tests')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
                stemSubView === 'tests'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Kiểm thử Toán học & Chức năng (12 Test)
            </button>
          </div>
        </div>

        {stemSubView === 'groups' && (
          <GroupWorkspace
            students={students}
            onUpdateStudent={onUpdateStudent}
            onImportWorkspaceJson={onImportWorkspaceJson}
            aiEvaluations={aiEvaluations}
            onUpdateAiEvaluation={onUpdateAiEvaluation}
            versionLog={versionLog}
            onUpdateVersionLog={onUpdateVersionLog}
          />
        )}

        {stemSubView === 'teacher' && (
          <TeacherDashboard
            students={students}
            rubric={rubric}
            onChangeRubric={onChangeRubric}
            bestQuizScore={bestQuizScore}
            testResults={testResults}
          />
        )}

        {stemSubView === 'tests' && (
          <TestPanel
            results={testResults}
            onUpdateResults={onUpdateTestResults}
            onUpdateStudent={onUpdateStudent}
          />
        )}
      </div>
    </div>
  );
};
