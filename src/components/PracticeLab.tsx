import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Puzzle,
  RefreshCw,
  Shuffle,
  Target,
  XCircle,
} from 'lucide-react';
import { QUIZ_BANK, QuizQuestion } from '../data/stemData';
import {
  DEFAULT_TANK_PARAMETERS,
  calculateSurfaceArea,
  calculateTotalVolume,
} from '../math/MathEngine';
import { TankParameters } from '../types';
import { MathFormula, MathText } from './MathFormula';
import { TankScene3D } from './TankScene3D';

interface PracticeLabProps {
  bestQuizScore: number | null;
  onQuizScoreUpdate: (scoreOutOf10: number, correctCount: number, totalCount: number) => void;
}

interface FormulaMatchItem {
  shapeId: string;
  shapeName: string;
  formulaId: string;
  latex: string;
  explanation: string;
}

const MATCH_ITEMS: FormulaMatchItem[] = [
  {
    shapeId: 'cyl',
    shapeName: 'Bồn hình trụ đứng (bán kính $R$, cao $H$)',
    formulaId: 'f_cyl',
    latex: 'V = \\pi R^2 H',
    explanation: 'Tiết diện tròn không đổi $r(z) = R$ trên toàn đoạn $[0, H]$.',
  },
  {
    shapeId: 'frustum',
    shapeName: 'Bồn hình nón cụt (đáy $r_0$, miệng $r_1$, cao $H$)',
    formulaId: 'f_frustum',
    latex: 'V = \\frac{\\pi H}{3}(r_0^2 + r_0 r_1 + r_1^2)',
    explanation: 'Nguyên hàm của hàm bán kính tuyến tính $r(z) = r_0 + \\frac{r_1 - r_0}{H}z$.',
  },
  {
    shapeId: 'curved',
    shapeName: 'Bồn có thành cong $r(z) = a + b\\sin\\left(\\frac{\\pi z}{H}\\right)$',
    formulaId: 'f_curved',
    latex: 'V = \\pi \\int_{0}^{H} \\left[a + b\\sin\\left(\\frac{\\pi z}{H}\\right)\\right]^2 dz',
    explanation: 'Bán kính biến thiên theo hàm lượng giác nên tích phân bình phương hàm $\\sin$.',
  },
  {
    shapeId: 'general',
    shapeName: 'Vật thể tròn xoay tổng quát quanh trục $Oz$',
    formulaId: 'f_general',
    latex: 'V = \\pi \\int_{0}^{H} [r(z)]^2\\,dz',
    explanation: 'Công thức tổng quát Bài 13 – Toán 12 cho mọi hàm $r(z)$ liên tục, không âm.',
  },
];

const CHALLENGES = [
  {
    id: 'ch1',
    title: 'Thử thách 1: Bồn chứa sinh hoạt $\\ge 6\\text{ m}^3$',
    prompt:
      'Thiết kế một bồn nước hình trụ có dung tích tối thiểu $6{,}00\\text{ m}^3$ (nhưng không quá $8{,}00\\text{ m}^3$ để tránh lãng phí diện tích sân) bằng cách điều chỉnh bán kính $R$ và chiều cao $H$.',
    type: 'cylinder' as const,
    minV: 6.0,
    maxV: 8.0,
    maxH: 3.5,
  },
  {
    id: 'ch2',
    title: 'Thử thách 2: Bồn nón cụt đạt chuẩn $12 \\pm 0{,}5\\text{ m}^3$',
    prompt:
      'Điều chỉnh bán kính đáy $r_0$, miệng $r_1$ và chiều cao $H$ của bồn nón cụt để dung tích nằm trong khoảng từ $11{,}50\\text{ m}^3$ đến $12{,}50\\text{ m}^3$ với chiều cao $H \\le 3{,}2\\text{ m}$.',
    type: 'frustum' as const,
    minV: 11.5,
    maxV: 12.5,
    maxH: 3.2,
  },
];

export const PracticeLab: React.FC<PracticeLabProps> = ({
  bestQuizScore,
  onQuizScoreUpdate,
}) => {
  const [subTab, setSubTab] = useState<'matching' | 'challenge' | 'quiz'>('matching');

  // --- Activity 1: Drag & Drop / Click-to-Pair Formula Matching ---
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [pairings, setPairings] = useState<Record<string, string>>({});
  const [matchingChecked, setMatchingChecked] = useState<boolean>(false);

  const formulaPool = useMemo(
    () => [MATCH_ITEMS[2], MATCH_ITEMS[0], MATCH_ITEMS[3], MATCH_ITEMS[1]],
    [],
  );

  const assignPair = (shapeId: string, formulaId: string) => {
    setMatchingChecked(false);
    setPairings((prev) => ({ ...prev, [shapeId]: formulaId }));
    setSelectedShapeId(null);
  };

  // --- Activity 2: 3D Design Challenge ---
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const activeChallenge = CHALLENGES[challengeIdx];
  const [challengeParams, setChallengeParams] = useState<TankParameters>({
    ...DEFAULT_TANK_PARAMETERS,
    type: 'cylinder',
    R: 0.9,
    H: 1.8,
    h: 1.2,
  });

  const challengeVolume = calculateTotalVolume(challengeParams);
  const challengeArea = calculateSurfaceArea(challengeParams, 'closed');
  const challengeSuccess =
    challengeVolume >= activeChallenge.minV &&
    challengeVolume <= activeChallenge.maxV &&
    challengeParams.H <= activeChallenge.maxH;

  // --- Activity 3: 10-Question Math 12 Quiz ---
  const [questions, setQuestions] = useState<QuizQuestion[]>(QUIZ_BANK);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);

  const shuffleQuiz = () => {
    const copy = [...QUIZ_BANK];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setQuestions(copy);
    setAnswers({});
    setSubmitted(false);
    setShowAnswerKey(false);
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setShowAnswerKey(false);
  };

  const quizStats = useMemo(() => {
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctIndex) {
        correct++;
      }
    }
    const wrong = questions.length - correct;
    const score10 = Number(((correct / questions.length) * 10).toFixed(1));
    return { correct, wrong, score10 };
  }, [questions, answers]);

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    onQuizScoreUpdate(quizStats.score10, quizStats.correct, questions.length);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation for the 3 Activities */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setSubTab('matching')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'matching'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            Hoạt động 1: Kéo thả công thức
          </button>
          <button
            type="button"
            onClick={() => setSubTab('challenge')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'challenge'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Hoạt động 2: Thử thách thiết kế 3D
          </button>
          <button
            type="button"
            onClick={() => setSubTab('quiz')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'quiz'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Hoạt động 3: Trắc nghiệm 10 câu
          </button>
        </div>

        {bestQuizScore !== null && (
          <div className="text-xs font-medium text-slate-600">
            Điểm trắc nghiệm cao nhất phiên này:{' '}
            <strong className="font-mono text-emerald-700">{bestQuizScore.toFixed(1)} / 10</strong>
          </div>
        )}
      </div>

      {/* ACTIVITY 1: FORMULA MATCHING */}
      {subTab === 'matching' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Hoạt động 1 – Kéo thả (hoặc bấm chọn) nối dạng bồn với công thức thể tích
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cách thao tác: Kéo thẻ công thức bên phải thả vào ô dạng bồn bên trái, hoặc bấm chọn dạng bồn rồi bấm vào công thức tương ứng.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Tank Shapes */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Cột A – Các dạng hình học bồn chứa
              </span>
              {MATCH_ITEMS.map((item) => {
                const assignedFormulaId = pairings[item.shapeId];
                const assignedFormula = MATCH_ITEMS.find((m) => m.formulaId === assignedFormulaId);
                const isSelected = selectedShapeId === item.shapeId;
                const isCorrect = matchingChecked && assignedFormulaId === item.formulaId;
                const isWrong =
                  matchingChecked && assignedFormulaId !== item.formulaId;

                return (
                  <div
                    key={item.shapeId}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fId = e.dataTransfer.getData('text/plain');
                      if (fId) assignPair(item.shapeId, fId);
                    }}
                    className={`rounded-xl border p-4 transition-colors ${
                      isCorrect
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : isWrong
                        ? 'border-red-300 bg-red-50/40'
                        : isSelected
                        ? 'border-cyan-600 bg-cyan-50/50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedShapeId(isSelected ? null : item.shapeId)
                        }
                        className="text-left text-xs font-bold text-slate-900 hover:text-cyan-800 leading-relaxed"
                      >
                        <MathText text={item.shapeName} />
                      </button>
                      {matchingChecked &&
                        (isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                            <CheckCircle2 className="w-4 h-4" /> Đúng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 shrink-0">
                            <XCircle className="w-4 h-4" /> Chưa đúng
                          </span>
                        ))}
                    </div>

                    <div className="mt-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 min-h-[48px] flex items-center justify-between overflow-x-auto">
                      {assignedFormula ? (
                        <MathFormula displayMode latex={assignedFormula.latex} />
                      ) : (
                        <span className="text-xs text-slate-400">
                          {isSelected
                            ? 'Hãy bấm chọn 1 công thức ở Cột B bên phải →'
                            : 'Kéo công thức thả vào đây hoặc bấm vào tên bồn'}
                        </span>
                      )}
                    </div>

                    {matchingChecked && (
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        Giải thích: <MathText text={item.explanation} />
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Draggable / Clickable Formulas */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Cột B – Thẻ công thức Toán học (Kéo thả hoặc bấm chọn)
              </span>
              {formulaPool.map((fItem) => {
                const usedByShape = Object.entries(pairings).find(
                  ([, val]) => val === fItem.formulaId,
                )?.[0];
                return (
                  <button
                    key={fItem.formulaId}
                    type="button"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', fItem.formulaId)}
                    onClick={() => {
                      if (selectedShapeId) {
                        assignPair(selectedShapeId, fItem.formulaId);
                      } else {
                        // Pair to first unpaired shape for fast interaction
                        const firstEmpty = MATCH_ITEMS.find((m) => !pairings[m.shapeId]);
                        if (firstEmpty) assignPair(firstEmpty.shapeId, fItem.formulaId);
                      }
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition-colors cursor-grab active:cursor-grabbing ${
                      usedByShape
                        ? 'border-cyan-300 bg-cyan-50/40'
                        : 'border-slate-200 bg-white hover:border-cyan-500'
                    }`}
                  >
                    <div className="overflow-x-auto">
                      <MathFormula displayMode latex={fItem.latex} />
                    </div>
                    <div className="text-[11px] text-slate-500 text-right">
                      {usedByShape ? 'Đã nối vào Cột A (Bấm để gán lại)' : 'Kéo thả hoặc bấm để nối'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setMatchingChecked(true)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Kiểm tra đáp án nối công thức
            </button>
            <button
              type="button"
              onClick={() => {
                setPairings({});
                setMatchingChecked(false);
                setSelectedShapeId(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm lại
            </button>
          </div>
        </div>
      )}

      {/* ACTIVITY 2: DESIGN CHALLENGE */}
      {subTab === 'challenge' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                <MathText text={activeChallenge.title} />
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                <MathText text={activeChallenge.prompt} />
              </p>
            </div>
            <div className="flex gap-1.5">
              {CHALLENGES.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setChallengeIdx(idx);
                    setChallengeParams({
                      ...DEFAULT_TANK_PARAMETERS,
                      type: ch.type,
                      R: 0.9,
                      r0: 0.9,
                      r1: 1.4,
                      H: 1.9,
                      h: 1.4,
                    });
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    challengeIdx === idx
                      ? 'bg-cyan-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Nhiệm vụ {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <TankScene3D
                parameters={challengeParams}
                compact={false}
                titleBadge={`Thử thách thiết kế · V = ${challengeVolume.toFixed(3)} m³`}
              />
            </div>

            <div className="lg:col-span-5 space-y-4">
              {activeChallenge.type === 'cylinder' ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label htmlFor="ch-R" className="font-medium text-slate-700">
                        <MathText text="Bán kính $R$ ($\text{m}$)" />
                      </label>
                      <span className="font-mono font-bold">{challengeParams.R.toFixed(2)} m</span>
                    </div>
                    <input
                      id="ch-R"
                      type="range"
                      min={0.4}
                      max={3.0}
                      step={0.05}
                      value={challengeParams.R}
                      onChange={(e) =>
                        setChallengeParams({
                          ...challengeParams,
                          type: 'cylinder',
                          R: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label htmlFor="ch-r0" className="font-medium text-slate-700">
                        <MathText text="Bán kính đáy $r_0$ ($\text{m}$)" />
                      </label>
                      <span className="font-mono font-bold">{challengeParams.r0.toFixed(2)} m</span>
                    </div>
                    <input
                      id="ch-r0"
                      type="range"
                      min={0.4}
                      max={3.0}
                      step={0.05}
                      value={challengeParams.r0}
                      onChange={(e) =>
                        setChallengeParams({
                          ...challengeParams,
                          type: 'frustum',
                          r0: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label htmlFor="ch-r1" className="font-medium text-slate-700">
                        <MathText text="Bán kính miệng $r_1$ ($\text{m}$)" />
                      </label>
                      <span className="font-mono font-bold">{challengeParams.r1.toFixed(2)} m</span>
                    </div>
                    <input
                      id="ch-r1"
                      type="range"
                      min={0.4}
                      max={3.0}
                      step={0.05}
                      value={challengeParams.r1}
                      onChange={(e) =>
                        setChallengeParams({
                          ...challengeParams,
                          type: 'frustum',
                          r1: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="ch-H" className="font-medium text-slate-700">
                    <MathText
                      text={`Chiều cao bồn $H$ ($\\text{m}$) (Giới hạn $\\le ${activeChallenge.maxH}\\text{ m}$)`}
                    />
                  </label>
                  <span className="font-mono font-bold">{challengeParams.H.toFixed(2)} m</span>
                </div>
                <input
                  id="ch-H"
                  type="range"
                  min={0.8}
                  max={4.5}
                  step={0.05}
                  value={challengeParams.H}
                  onChange={(e) => {
                    const nextH = parseFloat(e.target.value);
                    setChallengeParams({
                      ...challengeParams,
                      H: nextH,
                      h: Number((nextH * 0.75).toFixed(2)),
                    });
                  }}
                  className="w-full accent-slate-900"
                />
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-600">Dung tích hiện đạt:</span>
                  <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                    {challengeVolume.toFixed(3)} <MathFormula latex="\text{m}^3" />
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-600">Diện tích vỏ toàn phần:</span>
                  <span className="font-mono text-slate-800 tabular-nums">
                    {challengeArea.toFixed(2)} <MathFormula latex="\text{m}^2" />
                  </span>
                </div>
              </div>

              {challengeSuccess ? (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Hoàn thành xuất sắc thử thách thiết kế!
                  </div>
                  <p className="leading-relaxed">
                    <MathText
                      text={`Bồn chứa đạt dung tích $${challengeVolume.toFixed(2)}\\text{ m}^3$ trong khoảng yêu cầu $[${activeChallenge.minV}, ${activeChallenge.maxV}]\\text{ m}^3$ và chiều cao hợp lệ.`}
                    />
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-1">
                  <div className="font-bold">Gợi ý hiệu chỉnh thông số:</div>
                  {challengeVolume < activeChallenge.minV && (
                    <p className="leading-relaxed">
                      <MathText
                        text={`Dung tích đang thiếu $${(activeChallenge.minV - challengeVolume).toFixed(2)}\\text{ m}^3$. Hãy tăng bán kính (vì $V$ tỉ lệ với bình phương bán kính!) hoặc tăng chiều cao $H$.`}
                      />
                    </p>
                  )}
                  {challengeVolume > activeChallenge.maxV && (
                    <p className="leading-relaxed">
                      <MathText
                        text={`Dung tích đang vượt mức giới hạn trên $${(challengeVolume - activeChallenge.maxV).toFixed(2)}\\text{ m}^3$. Hãy giảm nhẹ bán kính hoặc chiều cao $H$.`}
                      />
                    </p>
                  )}
                  {challengeParams.H > activeChallenge.maxH && (
                    <p className="leading-relaxed">
                      <MathText
                        text={`Chiều cao $H = ${challengeParams.H.toFixed(2)}\\text{ m}$ vượt giới hạn trần $${activeChallenge.maxH}\\text{ m}$. Hãy hạ $H$ xuống và bù lại bằng bán kính.`}
                      />
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY 3: 10-QUESTION MATH 12 QUIZ */}
      {subTab === 'quiz' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hoạt động 3 – Ngân hàng Trắc nghiệm 10 câu Tích phân Toán 12
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bao gồm 3 mức độ: Nhận biết · Thông hiểu · Vận dụng (Thang điểm 10)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={shuffleQuiz}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Trộn câu hỏi
              </button>
              <button
                type="button"
                onClick={resetQuiz}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Làm lại
              </button>
              {submitted && (
                <button
                  type="button"
                  onClick={() => setShowAnswerKey((v) => !v)}
                  className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-800"
                >
                  {showAnswerKey ? 'Ẩn lời giải chi tiết' : 'Xem đáp án'}
                </button>
              )}
            </div>
          </div>

          {submitted && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-emerald-950">
                  Điểm số bài làm: {quizStats.score10.toFixed(1)} / 10,0 điểm
                </div>
                <div className="text-xs text-emerald-900 mt-0.5 font-mono tabular-nums">
                  Số câu đúng: {quizStats.correct}/{questions.length} · Số câu sai / chưa chọn: {quizStats.wrong}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAnswerKey(true)}
                className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                Mở toàn bộ lời giải
              </button>
            </div>
          )}

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const chosen = answers[q.id];
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                      <span className="font-bold text-cyan-950 mr-1.5">
                        Câu {idx + 1}:
                      </span>
                      <MathText text={q.question} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 shrink-0">
                      Mức độ: {q.level}
                    </span>
                  </div>

                  {q.latex && (
                    <div className="rounded-lg bg-white border border-slate-200 px-3.5 py-2 inline-block overflow-x-auto max-w-full">
                      <MathFormula displayMode latex={q.latex} />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isPicked = chosen === optIdx;
                      const isRightOption = optIdx === q.correctIndex;
                      let btnStyle = 'border-slate-200 bg-white text-slate-800 hover:border-cyan-500';
                      if (submitted) {
                        if (isRightOption) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                        } else if (isPicked && !isRightOption) {
                          btnStyle = 'border-red-400 bg-red-50 text-red-900';
                        }
                      } else if (isPicked) {
                        btnStyle = 'border-slate-900 bg-slate-900 text-white font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={submitted}
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                          className={`rounded-lg border px-4 py-3 text-left text-xs leading-relaxed transition-colors flex items-center gap-2.5 overflow-x-auto ${btnStyle}`}
                        >
                          <span className="font-mono font-bold shrink-0">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <MathText text={opt} className="min-w-0" />
                        </button>
                      );
                    })}
                  </div>

                  {submitted && showAnswerKey && (
                    <div className="rounded-lg bg-white border border-slate-200 p-3.5 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 mr-1.5">
                        Đáp án đúng: {String.fromCharCode(65 + q.correctIndex)}.
                      </strong>
                      <MathText text={q.explanation} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={submitted}
              onClick={handleSubmitQuiz}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-45"
            >
              Nộp bài & Chấm điểm tự động
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
