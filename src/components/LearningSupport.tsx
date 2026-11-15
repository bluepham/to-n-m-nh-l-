import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Search,
  Volume2,
  X,
} from 'lucide-react';
import { STEM_GLOSSARY } from '../data/stemData';
import { AppTab, LanguageMode } from '../types';

export interface QuickGuideStep {
  step: number;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  targetTab: AppTab;
}

export const QUICK_GUIDE_STEPS: QuickGuideStep[] = [
  {
    step: 1,
    titleVi: 'Chọn loại bồn',
    titleEn: 'Select Tank Type',
    descVi: 'Chọn trụ, nón cụt, thành cong, hàm tùy chỉnh hoặc ví dụ bán cầu.',
    descEn: 'Pick cylinder, frustum, curved wall, custom r(z), or hemisphere.',
    targetTab: 'design3d',
  },
  {
    step: 2,
    titleVi: 'Chỉnh thông số',
    titleEn: 'Adjust Dimensions',
    descVi: 'Kéo thanh trượt R, H, mực nước h và kiểm tra miền hợp lệ.',
    descEn: 'Tune R, H, and water level h with real-time validation.',
    targetTab: 'design3d',
  },
  {
    step: 3,
    titleVi: 'Xem mô hình 3D',
    titleEn: 'Inspect 3D Model',
    descVi: 'Xoay 360°, bật mặt cắt dọc r(z) hoặc xuất tệp .GLB.',
    descEn: 'Orbit 360°, toggle longitudinal cross-section, or export .GLB.',
    targetTab: 'design3d',
  },
  {
    step: 4,
    titleVi: 'Kiểm tra công thức',
    titleEn: 'Verify Integrals',
    descVi: 'Xem 5 bước giải tích phân KaTeX và mô phỏng lát cắt tròn xoay.',
    descEn: 'Review 5-step KaTeX derivations and disk revolution slices.',
    targetTab: 'math',
  },
  {
    step: 5,
    titleVi: 'Thử bơm hoặc xả',
    titleEn: 'Pump & Drain',
    descVi: 'Quan sát mực nước h(t) tăng/giảm phi tuyến theo tiết diện bồn.',
    descEn: 'Observe non-linear water level h(t) under inflow and outflow.',
    targetTab: 'pump',
  },
  {
    step: 6,
    titleVi: 'Quan sát đồ thị',
    titleEn: 'Analyze Charts',
    descVi: 'Tương tác trên 4 đồ thị r(z), V(h), V(t), dh/dt và tải CSV/PNG.',
    descEn: 'Interact with 4 live mathematical plots and export CSV/PNG.',
    targetTab: 'charts',
  },
  {
    step: 7,
    titleVi: 'Làm bài tập',
    titleEn: 'Complete Exercises',
    descVi: 'So sánh thiết kế tối ưu A/B và làm 10 câu trắc nghiệm Toán 12.',
    descEn: 'Compare A/B tank shells and take the 10-question Math 12 quiz.',
    targetTab: 'optimize_practice',
  },
];

interface QuickGuideBannerProps {
  language: LanguageMode;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onDismiss: () => void;
}

export const QuickGuideBanner: React.FC<QuickGuideBannerProps> = ({
  language,
  activeTab,
  onSelectTab,
  onDismiss,
}) => {
  return (
    <section
      aria-label={language === 'vi' ? 'Hướng dẫn nhanh 7 bước' : '7-Step Quick Guide'}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-700 shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            {language === 'vi'
              ? 'Lộ trình trải nghiệm nhanh 7 bước'
              : '7-Step Interactive Learning Path'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          {language === 'vi' ? 'Bỏ qua hướng dẫn' : 'Skip guide'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {QUICK_GUIDE_STEPS.map((item) => {
          const isCurrent = activeTab === item.targetTab;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => onSelectTab(item.targetTab)}
              className={`group rounded-lg border p-2.5 text-left transition-colors ${
                isCurrent
                  ? 'border-cyan-600 bg-cyan-50/50'
                  : 'border-slate-200 bg-slate-50/60 hover:border-cyan-500 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                <span>
                  {item.step}. {language === 'vi' ? item.titleVi : item.titleEn}
                </span>
                <ArrowRight className="w-3 h-3 text-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <p className="mt-1 text-[11px] leading-snug text-slate-600 line-clamp-2">
                {language === 'vi' ? item.descVi : item.descEn}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

interface LearningSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  onChangeLanguage: (lang: LanguageMode) => void;
  onNavigateTab: (tab: AppTab) => void;
  guideDismissed: boolean;
  onRestoreGuide: () => void;
}

export const LearningSupportModal: React.FC<LearningSupportModalProps> = ({
  isOpen,
  onClose,
  language,
  onChangeLanguage,
  onNavigateTab,
  guideDismissed,
  onRestoreGuide,
}) => {
  const [activeSection, setActiveSection] = useState<'glossary' | 'guide'>('glossary');
  const [query, setQuery] = useState<string>('');
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [speakingTerm, setSpeakingTerm] = useState<string | null>(null);

  const filteredGlossary = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STEM_GLOSSARY;
    return STEM_GLOSSARY.filter(
      (item) =>
        item.en.toLowerCase().includes(q) ||
        item.vi.toLowerCase().includes(q) ||
        item.definitionVi.toLowerCase().includes(q),
    );
  }, [query]);

  if (!isOpen) return null;

  const handleSpeakEnglish = (termEn: string) => {
    setSpeechNotice(null);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechNotice(
        'Trình duyệt hoặc thiết bị hiện tại không hỗ trợ Web Speech API. Bạn có thể tham khảo phiên âm IPA bên cạnh thuật ngữ.',
      );
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(termEn);
      utterance.lang = 'en-US';
      utterance.rate = 0.92;

      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
      if (enVoice) {
        utterance.voice = enVoice;
      }

      utterance.onstart = () => setSpeakingTerm(termEn);
      utterance.onend = () => setSpeakingTerm(null);
      utterance.onerror = () => {
        setSpeakingTerm(null);
        setSpeechNotice(
          'Thiết bị chưa tải gói giọng đọc tiếng Anh. Bạn có thể xem phiên âm quốc tế IPA ngay dưới từ vựng.',
        );
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingTerm(null);
      setSpeechNotice(
        'Không thể phát âm thanh trên trình duyệt này. Vui lòng đối chiếu phiên âm IPA hiển thị kèm theo.',
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="learning-support-title"
    >
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-950 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 id="learning-support-title" className="text-base font-bold">
                {language === 'vi'
                  ? 'Từ điển Thuật ngữ STEM Việt – Anh & Hướng dẫn sử dụng'
                  : 'VI–EN STEM Glossary & Quick Start Guide'}
              </h2>
              <p className="text-xs text-slate-300">
                Toán 12 · Chương IV – Bài 13: Ứng dụng hình học của tích phân
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Interface Language Switcher */}
            <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => onChangeLanguage('vi')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                  language === 'vi' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => onChangeLanguage('en')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                  language === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('glossary')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                activeSection === 'glossary'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Từ điển Việt – Anh (12 thuật ngữ)
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('guide')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                activeSection === 'guide'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Hướng dẫn nhanh 7 bước
            </button>
          </div>

          {activeSection === 'glossary' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm thuật ngữ Anh / Việt..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {speechNotice && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              {speechNotice}
            </div>
          )}

          {activeSection === 'glossary' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredGlossary.map((item) => (
                <div
                  key={item.en}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between gap-2.5 hover:border-cyan-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-bold text-slate-950">{item.en}</span>
                        <span className="text-xs font-mono text-slate-500">{item.phonetic}</span>
                      </div>
                      <div className="text-xs font-semibold text-cyan-800 mt-0.5">{item.vi}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSpeakEnglish(item.en)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                        speakingTerm === item.en
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                      title={`Nghe phát âm tiếng Anh: ${item.en}`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-700" />
                      Nghe
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{item.definitionVi}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-700">
                  Bấm vào bất kỳ bước nào dưới đây để chuyển thẳng tới phòng thực hành tương ứng.
                </p>
                {guideDismissed && (
                  <button
                    type="button"
                    onClick={onRestoreGuide}
                    className="rounded-lg border border-cyan-600 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-50 transition-colors"
                  >
                    Hiện lại thanh hướng dẫn trên đầu trang
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUICK_GUIDE_STEPS.map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      onNavigateTab(s.targetTab);
                      onClose();
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-cyan-500 hover:bg-cyan-50/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-800">
                        Bước {s.step} · {s.titleVi}
                      </span>
                      <ArrowRight className="w-4 h-4 text-cyan-700" />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{s.descVi}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
