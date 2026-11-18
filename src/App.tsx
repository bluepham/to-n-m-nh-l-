import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Calculator,
  Compass,
  Droplets,
  LineChart,
  Menu,
  Scale,
  X,
} from 'lucide-react';
import {
  AIToolEvaluation,
  AppTab,
  FlowHistoryPoint,
  InternalTestResult,
  LanguageMode,
  StudentAssignment,
  TankParameters,
  TeacherRubricState,
  VersionLogItem,
} from './types';
import {
  DEFAULT_TANK_PARAMETERS,
  calculateSurfaceBreakdown,
  calculateTotalVolume,
  calculateWaterVolume,
  generateStepByStepSolution,
  runInternalTestSuite,
} from './math/MathEngine';
import {
  INITIAL_AI_EVALUATIONS,
  INITIAL_STUDENTS,
  INITIAL_TEACHER_RUBRIC,
  INITIAL_VERSION_LOG,
} from './data/stemData';
import { Dashboard } from './components/Dashboard';
import { TankScene3D } from './components/TankScene3D';
import { TankControls } from './components/TankControls';
import { IntegralLab } from './components/IntegralLab';
import { PumpSimulation } from './components/PumpSimulation';
import { MathCharts } from './components/MathCharts';
import { OptimizationLab } from './components/OptimizationLab';
import { PracticeLab } from './components/PracticeLab';
import { MathFormula, MathText } from './components/MathFormula';
import {
  LearningSupportModal,
  QuickGuideBanner,
} from './components/LearningSupport';

const STORAGE_KEYS = {
  TANK: 'swt_tank_params_v1',
  STUDENTS: 'swt_students_v3',
  AI_EVALS: 'swt_ai_evals_v3',
  VERSIONS: 'swt_versions_v2',
  RUBRIC: 'swt_rubric_v2',
  QUIZ_BEST: 'swt_best_quiz_v2',
  LANG: 'swt_lang_v1',
  GUIDE_DISMISSED: 'swt_quick_guide_dismissed_v1',
};

function loadJsonFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface NavItemConfig {
  id: AppTab;
  labelVi: string;
  labelEn: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'overview', labelVi: 'Giới thiệu', labelEn: 'Overview' },
  { id: 'design3d', labelVi: 'Thiết kế 3D', labelEn: '3D Design' },
  { id: 'math', labelVi: 'Toán học', labelEn: 'Calculus' },
  { id: 'pump', labelVi: 'Bơm – Xả', labelEn: 'Pump & Drain' },
  { id: 'charts', labelVi: 'Đồ thị', labelEn: 'Charts' },
  {
    id: 'optimize_practice',
    labelVi: 'Tối ưu & Luyện tập',
    labelEn: 'Optimize & Practice',
  },
];

export default function App() {
  const isAutostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [supportModalOpen, setSupportModalOpen] = useState<boolean>(false);
  const [optPracticeSubView, setOptPracticeSubView] = useState<
    'all' | 'optimize' | 'practice'
  >('all');

  const [language, setLanguage] = useState<LanguageMode>(() =>
    loadJsonFromStorage<LanguageMode>(STORAGE_KEYS.LANG, 'vi'),
  );

  const [guideDismissed, setGuideDismissed] = useState<boolean>(() => {
    if (isAutostart) return true;
    return loadJsonFromStorage<boolean>(STORAGE_KEYS.GUIDE_DISMISSED, false);
  });

  const [parameters, setParameters] = useState<TankParameters>(() =>
    loadJsonFromStorage<TankParameters>(
      STORAGE_KEYS.TANK,
      DEFAULT_TANK_PARAMETERS,
    ),
  );

  const [students, setStudents] = useState<StudentAssignment[]>(() => {
    const stored = loadJsonFromStorage<StudentAssignment[]>(
      STORAGE_KEYS.STUDENTS,
      INITIAL_STUDENTS,
    );
    return Array.isArray(stored) && stored.length === 40
      ? stored
      : INITIAL_STUDENTS;
  });

  const [aiEvaluations, setAiEvaluations] = useState<AIToolEvaluation[]>(() => {
    const stored = loadJsonFromStorage<AIToolEvaluation[]>(
      STORAGE_KEYS.AI_EVALS,
      INITIAL_AI_EVALUATIONS,
    );
    return Array.isArray(stored) && stored.length === 3
      ? stored
      : INITIAL_AI_EVALUATIONS;
  });

  const [versionLog, setVersionLog] = useState<VersionLogItem[]>(() => {
    const stored = loadJsonFromStorage<VersionLogItem[]>(
      STORAGE_KEYS.VERSIONS,
      INITIAL_VERSION_LOG,
    );
    return Array.isArray(stored) && stored.length > 0
      ? stored
      : INITIAL_VERSION_LOG;
  });

  const [rubric, setRubric] = useState<TeacherRubricState>(() =>
    loadJsonFromStorage<TeacherRubricState>(
      STORAGE_KEYS.RUBRIC,
      INITIAL_TEACHER_RUBRIC,
    ),
  );

  const [bestQuizScore, setBestQuizScore] = useState<number | null>(() =>
    loadJsonFromStorage<number | null>(STORAGE_KEYS.QUIZ_BEST, 9.0),
  );

  const [testResults, setTestResults] = useState<InternalTestResult[]>(() =>
    runInternalTestSuite(),
  );

  // Shared pump & flow telemetry state for seamless sync between Screen 4 (Pump) and Screen 5 (Charts)
  const [qInM3Min, setQInM3Min] = useState<number>(0.45);
  const [qOutM3Min, setQOutM3Min] = useState<number>(0.15);
  const [flowHistory, setFlowHistory] = useState<FlowHistoryPoint[]>([]);

  // Persist states to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.TANK, JSON.stringify(parameters));
    } catch {
      // Ignore storage quota errors
    }
  }, [parameters]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch {
      // Ignore storage quota errors
    }
  }, [students]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.AI_EVALS,
        JSON.stringify(aiEvaluations),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [aiEvaluations]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.VERSIONS,
        JSON.stringify(versionLog),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [versionLog]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.RUBRIC, JSON.stringify(rubric));
    } catch {
      // Ignore storage quota errors
    }
  }, [rubric]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.QUIZ_BEST,
        JSON.stringify(bestQuizScore),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [bestQuizScore]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.LANG, JSON.stringify(language));
    } catch {
      // Ignore storage quota errors
    }
  }, [language]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.GUIDE_DISMISSED,
        JSON.stringify(guideDismissed),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [guideDismissed]);

  const handleUpdateStudent = (
    code: string,
    patch: Partial<StudentAssignment>,
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.code === code ? { ...s, ...patch } : s)),
    );
  };

  const handleImportWorkspaceJson = (payload: {
    students?: StudentAssignment[];
    aiEvaluations?: AIToolEvaluation[];
    versionLog?: VersionLogItem[];
  }) => {
    if (Array.isArray(payload.students) && payload.students.length === 40) {
      setStudents(payload.students);
    }
    if (
      Array.isArray(payload.aiEvaluations) &&
      payload.aiEvaluations.length === 3
    ) {
      setAiEvaluations(payload.aiEvaluations);
    }
    if (Array.isArray(payload.versionLog) && payload.versionLog.length > 0) {
      setVersionLog(payload.versionLog);
    }
  };

  const handleUpdateAiEvaluation = (
    toolId: AIToolEvaluation['toolId'],
    patch: Partial<AIToolEvaluation>,
  ) => {
    setAiEvaluations((prev) =>
      prev.map((item) =>
        item.toolId === toolId ? { ...item, ...patch } : item,
      ),
    );
  };

  const handleUpdateVersionLog = (
    id: string,
    patch: Partial<VersionLogItem>,
  ) => {
    setVersionLog((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    );
  };

  const handleResetDefaultWorkspace = () => {
    setStudents(INITIAL_STUDENTS);
    setAiEvaluations(INITIAL_AI_EVALUATIONS);
    setVersionLog(INITIAL_VERSION_LOG);
  };

  const handleResetRubric = () => {
    setRubric(INITIAL_TEACHER_RUBRIC);
  };

  const handleQuizScoreUpdate = (scoreOutOf10: number) => {
    setBestQuizScore((prev) =>
      prev === null ? scoreOutOf10 : Math.max(prev, scoreOutOf10),
    );
  };

  const handleNavigateTab = (tab: AppTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Live metrics for Design 3D summary bar & sub-bar
  const vMax = useMemo(() => calculateTotalVolume(parameters), [parameters]);
  const vWater = useMemo(
    () => calculateWaterVolume(parameters.h, parameters),
    [parameters],
  );
  const surfaceBreakdown = useMemo(
    () => calculateSurfaceBreakdown(parameters, 'closed'),
    [parameters],
  );
  const mathReport = useMemo(
    () => generateStepByStepSolution(parameters),
    [parameters],
  );
  const fillPercent = vMax > 0 ? Math.min(100, (vWater / vMax) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* TOP NAVIGATION BAR: Strictly 3 Zones (Brand | Single-line Nav | Utility Button) */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 print:hidden">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-6 lg:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigateTab('overview')}
            className="text-xs sm:text-base font-bold tracking-tight text-white hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            SMART WATER TANK 3D
          </button>

          {/* Zone 2: Primary Screen Links (Desktop) */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden lg:flex items-center gap-6 h-full"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigateTab(item.id)}
                  className={`h-full inline-flex items-center px-1 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-cyan-400 text-white'
                      : 'border-transparent text-slate-300 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {language === 'vi' ? item.labelVi : item.labelEn}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Utility CTA + Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSupportModalOpen(true)}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-700 bg-slate-900 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-white hover:border-cyan-500 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                {language === 'vi' ? (
                  <>
                    Từ điển<span className="hidden sm:inline"> &amp; Hướng dẫn</span>
                  </>
                ) : (
                  <>
                    Glossary<span className="hidden sm:inline"> &amp; Guide</span>
                  </>
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Mở trình đơn"
              className="lg:hidden rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-200 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigateTab(item.id)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {language === 'vi' ? item.labelVi : item.labelEn}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* SUB-HEADER TELEMETRY & LANGUAGE STRIP */}
      <div className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 tabular-nums">
            <span>
              Trường THPT Nguyễn Huệ · GV:{' '}
              <strong className="text-slate-900">Lê Văn Mạnh</strong>
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span>
              Dung tích tối đa:{' '}
              <strong data-testid="global-vmax" className="font-mono text-slate-900">
                {vMax.toFixed(3)} m³
              </strong>
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline">
              Nước hiện tại:{' '}
              <strong
                data-testid="global-vwater"
                className="font-mono text-cyan-800"
              >
                {vWater.toFixed(3)} m³
              </strong>{' '}
              ({fillPercent.toFixed(1)}% ·{' '}
              <MathText
                text={`$h = ${parameters.h.toFixed(2)} / ${parameters.H.toFixed(2)}\\text{ m}$`}
              />
              )
            </span>
          </div>

          <div className="flex items-center gap-2">
            {guideDismissed && (
              <button
                type="button"
                onClick={() => setGuideDismissed(false)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Compass className="w-3 h-3 text-cyan-700" />
                {language === 'vi' ? 'Lộ trình 7 bước' : '7-Step Path'}
              </button>
            )}

            <div
              role="group"
              aria-label="Chuyển đổi ngôn ngữ"
              className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5 text-[11px]"
            >
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`rounded px-2 py-0.5 font-semibold transition-colors ${
                  language === 'vi'
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tiếng Việt
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded px-2 py-0.5 font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {!guideDismissed && (
          <QuickGuideBanner
            language={language}
            activeTab={activeTab}
            onSelectTab={handleNavigateTab}
            onDismiss={() => setGuideDismissed(true)}
          />
        )}

        {/* SCREEN 1: OVERVIEW & STEM HUB */}
        {activeTab === 'overview' && (
          <Dashboard
            language={language}
            parameters={parameters}
            onNavigateTab={handleNavigateTab}
            students={students}
            onUpdateStudent={handleUpdateStudent}
            onImportWorkspaceJson={handleImportWorkspaceJson}
            onResetDefaultWorkspace={handleResetDefaultWorkspace}
            aiEvaluations={aiEvaluations}
            onUpdateAiEvaluation={handleUpdateAiEvaluation}
            versionLog={versionLog}
            onUpdateVersionLog={handleUpdateVersionLog}
            rubric={rubric}
            onChangeRubric={setRubric}
            onResetRubric={handleResetRubric}
            bestQuizScore={bestQuizScore}
            testResults={testResults}
            onUpdateTestResults={setTestResults}
          />
        )}

        {/* SCREEN 2: INTERACTIVE 3D TANK DESIGN */}
        {activeTab === 'design3d' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                  {language === 'vi'
                    ? 'Phòng Thiết kế & Mô phỏng Bồn nước 3D'
                    : 'Interactive 3D Water Tank Design Studio'}
                </h1>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {language === 'vi' ? (
                    <MathText text="Điều chỉnh hình học bồn chứa từ hàm bán kính $r(z)$, quan sát mặt cắt dọc và xuất tệp .GLB thực tế." />
                  ) : (
                    <MathText text="Configure rotational tank geometry from $r(z)$, inspect longitudinal cross-sections, and export .GLB models." />
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigateTab('math')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-cyan-700" />
                  Xem 5 bước giải tích phân
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateTab('pump')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-800 transition-colors"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  Mô phỏng Bơm – Xả bồn này
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 8 Columns: 3D Viewport + Live Integral Summary */}
              <div className="lg:col-span-8 space-y-4">
                <TankScene3D
                  parameters={parameters}
                  isPumping={false}
                  compact={false}
                  titleBadge="Không gian 3D tương tác · Xoay chuột trái, cuộn thu phóng, giữ chuột phải kéo tâm"
                />

                {/* Live Geometry & Surface Integral Readout Strip */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800">
                        Liên kết Hình học 3D & Tích phân Toán 12
                      </span>
                      <div className="mt-1 overflow-x-auto">
                        <MathFormula displayMode latex={mathReport.totalIntegralLatex} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavigateTab('charts')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <LineChart className="w-3.5 h-3.5 text-cyan-700" />
                      Mở 4 đồ thị của bồn này
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                    <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                      <div className="text-[11px] text-slate-500">
                        <MathText text="Dung tích tối đa $V_{\max}$" />
                      </div>
                      <div
                        data-testid="design-vmax"
                        className="text-base font-bold font-mono text-slate-950 mt-0.5"
                      >
                        {vMax.toFixed(3)} m³
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {(vMax * 1000).toFixed(0)} lít
                      </div>
                    </div>

                    <div className="rounded-lg bg-cyan-50/60 border border-cyan-200/80 p-3">
                      <div className="text-[11px] text-cyan-900">
                        <MathText text="Thể tích nước $V(h)$" />
                      </div>
                      <div
                        data-testid="design-vwater"
                        className="text-base font-bold font-mono text-cyan-950 mt-0.5"
                      >
                        {vWater.toFixed(3)} m³
                      </div>
                      <div className="text-[11px] text-cyan-800">
                        <MathText
                          text={`Mực nước $h = ${parameters.h.toFixed(2)}\\text{ m}$`}
                        />{' '}
                        ({fillPercent.toFixed(1)}%)
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                      <div className="text-[11px] text-slate-500">
                        <MathText text="Diện tích thành bên $S_{\text{xq}}$" />
                      </div>
                      <div className="text-base font-bold font-mono text-slate-950 mt-0.5">
                        {surfaceBreakdown.side.toFixed(3)} m²
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Tích phân mặt tròn xoay
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                      <div className="text-[11px] text-slate-500">
                        Tổng diện tích vỏ kín
                      </div>
                      <div className="text-base font-bold font-mono text-slate-950 mt-0.5">
                        {surfaceBreakdown.total.toFixed(3)} m²
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Đáy + Thành bên + Nắp
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 4 Columns: Parameter Controls */}
              <div className="lg:col-span-4">
                <TankControls
                  parameters={parameters}
                  onChangeParameters={setParameters}
                />
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: INTEGRAL CALCULUS LAB */}
        {activeTab === 'math' && (
          <IntegralLab
            parameters={parameters}
            onChangeParameters={setParameters}
          />
        )}

        {/* SCREEN 4: PUMP & DRAIN SIMULATION */}
        {activeTab === 'pump' && (
          <PumpSimulation
            parameters={parameters}
            onChangeParameters={setParameters}
            flowHistory={flowHistory}
            onUpdateFlowHistory={setFlowHistory}
            qInM3Min={qInM3Min}
            qOutM3Min={qOutM3Min}
            onChangeFlowRates={(qIn, qOut) => {
              setQInM3Min(qIn);
              setQOutM3Min(qOut);
            }}
          />
        )}

        {/* SCREEN 5: 4 INTERACTIVE MATHEMATICAL CHARTS */}
        {activeTab === 'charts' && (
          <MathCharts
            parameters={parameters}
            onChangeParameters={setParameters}
            flowHistory={flowHistory}
            qInM3Min={qInM3Min}
            qOutM3Min={qOutM3Min}
          />
        )}

        {/* SCREEN 6: DESIGN OPTIMIZATION & PRACTICE LAB */}
        {activeTab === 'optimize_practice' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOptPracticeSubView('all')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
                    optPracticeSubView === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  Hiển thị toàn bộ (Tối ưu & Luyện tập)
                </button>
                <button
                  type="button"
                  onClick={() => setOptPracticeSubView('optimize')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
                    optPracticeSubView === 'optimize'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  So sánh & Tối ưu Thiết kế (A/B)
                </button>
                <button
                  type="button"
                  onClick={() => setOptPracticeSubView('practice')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
                    optPracticeSubView === 'practice'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Thử thách & 10 Câu Trắc nghiệm Toán 12
                </button>
              </div>

              {bestQuizScore !== null && (
                <div className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 tabular-nums">
                  Điểm trắc nghiệm cao nhất: <strong>{bestQuizScore.toFixed(1)} / 10</strong>
                </div>
              )}
            </div>

            {(optPracticeSubView === 'all' ||
              optPracticeSubView === 'optimize') && <OptimizationLab />}

            {(optPracticeSubView === 'all' ||
              optPracticeSubView === 'practice') && (
              <PracticeLab
                bestQuizScore={bestQuizScore}
                onQuizScoreUpdate={handleQuizScoreUpdate}
              />
            )}
          </div>
        )}
      </main>

      {/* ACADEMIC FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-5 mt-12 print:hidden">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <strong className="text-slate-800">SMART WATER TANK 3D</strong> · Dự
            án Giáo dục STEM Toán 12 (Chương IV – Bài 13: Ứng dụng hình học của
            tích phân)
          </div>
          <div>
            Trường THPT Nguyễn Huệ · Giáo viên hướng dẫn:{' '}
            <strong className="text-slate-800">Lê Văn Mạnh</strong> · Lưu trữ dữ
            liệu cục bộ trên trình duyệt (localStorage & JSON)
          </div>
        </div>
      </footer>

      {/* BILINGUAL GLOSSARY & 7-STEP GUIDE MODAL */}
      <LearningSupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        language={language}
        onChangeLanguage={setLanguage}
        onNavigateTab={handleNavigateTab}
        guideDismissed={guideDismissed}
        onRestoreGuide={() => setGuideDismissed(false)}
      />
    </div>
  );
}
