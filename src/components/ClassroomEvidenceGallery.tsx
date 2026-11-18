import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Film,
  ImageOff,
  Maximize2,
  Play,
  Upload,
  X,
} from 'lucide-react';
import { CLASSROOM_EVIDENCE_ITEMS } from '../data/stemData';
import { ClassroomEvidenceItem, EvidenceCategory } from '../types';
import { stripMathDelimiters } from '../math/mathTextParser';
import { MathText } from './MathFormula';

const CATEGORY_LABELS: Record<'all' | EvidenceCategory, string> = {
  all: 'Tất cả (18 minh chứng)',
  lecture: 'Giảng dạy & Đặt vấn đề',
  lab_3d_casio: 'Thực hành Web 3D & Casio',
  group_work: 'Thảo luận & Kiểm thử nhóm',
};

const VIDEO_CHAPTERS: { timeSec: number; timeLabel: string; label: string }[] = [
  { timeSec: 0, timeLabel: '00:00', label: 'Khai mạc chuyên đề STEM Toán 12 tại lớp' },
  { timeSec: 5, timeLabel: '00:05', label: 'Đặt vấn đề thực tiễn: 60% chiều cao bồn' },
  { timeSec: 10, timeLabel: '00:10', label: '5 bước giải tích phân $V = \\pi \\int_0^H [r(z)]^2\\,dz$' },
  { timeSec: 15, timeLabel: '00:15', label: 'Mô phỏng Bơm – Xả phi tuyến thời gian thực' },
  { timeSec: 20, timeLabel: '00:20', label: 'Đối sánh 3 công cụ AI & nghiệm thu dự án' },
];

export interface ResilientEvidenceImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ResilientEvidenceImage: React.FC<ResilientEvidenceImageProps> = ({
  src,
  alt,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  const cleanAlt = useMemo(() => stripMathDelimiters(alt), [alt]);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1.5 bg-slate-100 text-slate-500 p-2 text-center ${className}`}
      >
        <ImageOff className="w-5 h-5 text-slate-400 shrink-0" />
        <span className="text-[11px] font-medium line-clamp-2">{cleanAlt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={cleanAlt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

interface EvidenceLightboxModalProps {
  activeItem: ClassroomEvidenceItem | null;
  customVideoUrl?: string | null;
  onClose: () => void;
  onSelectItem: (item: ClassroomEvidenceItem) => void;
}

export const EvidenceLightboxModal: React.FC<EvidenceLightboxModalProps> = ({
  activeItem,
  customVideoUrl,
  onClose,
  onSelectItem,
}) => {
  useEffect(() => {
    if (!activeItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      const idx = CLASSROOM_EVIDENCE_ITEMS.findIndex((i) => i.id === activeItem.id);
      if (idx === -1) return;
      if (e.key === 'ArrowRight') {
        const next = CLASSROOM_EVIDENCE_ITEMS[(idx + 1) % CLASSROOM_EVIDENCE_ITEMS.length];
        onSelectItem(next);
      } else if (e.key === 'ArrowLeft') {
        const prev =
          CLASSROOM_EVIDENCE_ITEMS[
            (idx - 1 + CLASSROOM_EVIDENCE_ITEMS.length) % CLASSROOM_EVIDENCE_ITEMS.length
          ];
        onSelectItem(prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem, onClose, onSelectItem]);

  if (!activeItem) return null;

  const currentIndex = CLASSROOM_EVIDENCE_ITEMS.findIndex((i) => i.id === activeItem.id);
  const handlePrev = () => {
    if (currentIndex === -1) return;
    const prev =
      CLASSROOM_EVIDENCE_ITEMS[
        (currentIndex - 1 + CLASSROOM_EVIDENCE_ITEMS.length) % CLASSROOM_EVIDENCE_ITEMS.length
      ];
    onSelectItem(prev);
  };
  const handleNext = () => {
    if (currentIndex === -1) return;
    const next =
      CLASSROOM_EVIDENCE_ITEMS[(currentIndex + 1) % CLASSROOM_EVIDENCE_ITEMS.length];
    onSelectItem(next);
  };

  const resolvedVideoSrc =
    activeItem.type === 'video' && customVideoUrl ? customVideoUrl : activeItem.src;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={stripMathDelimiters(activeItem.title)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 text-white overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 sm:px-6 py-3.5">
          <div className="min-w-0">
            <div className="text-xs text-cyan-400 font-mono tabular-nums">
              Minh chứng {currentIndex + 1}/{CLASSROOM_EVIDENCE_ITEMS.length} ·{' '}
              {activeItem.dateLabel} ·{' '}
              {activeItem.groupIds.map((g) => `Nhóm ${g}`).join(', ')}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white leading-snug mt-0.5">
              <MathText text={activeItem.title} />
            </h4>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ minh chứng"
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative bg-slate-950 flex items-center justify-center max-h-[68vh] min-h-[260px]">
          {activeItem.type === 'video' ? (
            <video
              key={resolvedVideoSrc}
              src={resolvedVideoSrc}
              poster={activeItem.posterSrc}
              controls
              autoPlay
              playsInline
              className="max-h-[68vh] w-full object-contain"
            />
          ) : (
            <ResilientEvidenceImage
              src={activeItem.src}
              alt={activeItem.title}
              className="max-h-[68vh] w-full object-contain"
            />
          )}

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Minh chứng trước"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/85 border border-slate-700 p-2.5 text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Minh chứng tiếp theo"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/85 border border-slate-700 p-2.5 text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 bg-slate-950 border-t border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <MathText text={activeItem.caption} />
        </div>
      </div>
    </div>
  );
};

interface ClassroomEvidenceGalleryProps {
  onOpenEvidence: (item: ClassroomEvidenceItem) => void;
  customVideoUrl?: string | null;
  onSelectCustomVideo?: (objectUrl: string) => void;
}

export const ClassroomEvidenceGallery: React.FC<ClassroomEvidenceGalleryProps> = ({
  onOpenEvidence,
  customVideoUrl,
  onSelectCustomVideo,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | EvidenceCategory>('all');
  const [showAllPhotos, setShowAllPhotos] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoInputRef = useRef<HTMLInputElement | null>(null);

  const mainVideo = useMemo(
    () => CLASSROOM_EVIDENCE_ITEMS.find((item) => item.type === 'video') ?? null,
    [],
  );

  const filteredPhotos = useMemo(() => {
    const photos = CLASSROOM_EVIDENCE_ITEMS.filter((item) => item.type === 'image');
    if (categoryFilter === 'all') return photos;
    return photos.filter((item) => item.category === categoryFilter);
  }, [categoryFilter]);

  const displayedPhotos = showAllPhotos ? filteredPhotos : filteredPhotos.slice(0, 8);

  const handleSeekChapter = (seconds: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    try {
      vid.currentTime = seconds;
      void vid.play();
    } catch {
      // Ignore autoplay restrictions in non-interactive environments
    }
  };

  const handleLocalVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onSelectCustomVideo) return;
    const url = URL.createObjectURL(file);
    onSelectCustomVideo(url);
    e.target.value = '';
  };

  const activeVideoSrc = customVideoUrl || mainVideo?.src || '';

  return (
    <section
      id="classroom-evidence-section"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-700 shrink-0" />
            <span>
              Hồ sơ Minh chứng Thực nghiệm Dạy học STEM tại Trường THPT Nguyễn Huệ
            </span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ghi nhận thực tế tiết dạy chuyên đề Bài 13 Toán 12 (ngày 18/11) do GV Lê Văn Mạnh trực tiếp hướng dẫn: video tổng hợp tiến trình và 17 hình ảnh hoạt động lớp học, bấm máy Casio kiểm chứng & sản phẩm Web 3D của 4 nhóm.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(Object.keys(CATEGORY_LABELS) as ('all' | EvidenceCategory)[]).map((catKey) => (
            <button
              key={catKey}
              type="button"
              onClick={() => {
                setCategoryFilter(catKey);
                setShowAllPhotos(true);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === catKey
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {CATEGORY_LABELS[catKey]}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Classroom Video Block */}
      {mainVideo && (categoryFilter === 'all' || categoryFilter === 'lecture') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="lg:col-span-7 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            <video
              key={activeVideoSrc}
              ref={videoRef}
              src={activeVideoSrc}
              poster={mainVideo.posterSrc}
              controls
              preload="metadata"
              playsInline
              data-testid="classroom-main-video"
              className="w-full max-h-[360px] object-contain"
            />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-cyan-800 font-semibold">
                  <Film className="w-3.5 h-3.5 shrink-0" />
                  <span>Video Tư liệu Lớp học · Ngày 18/11</span>
                </div>

                {onSelectCustomVideo && (
                  <>
                    <button
                      type="button"
                      onClick={() => localVideoInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap"
                    >
                      <Upload className="w-3 h-3 text-cyan-700" />
                      <span>Mở video gốc từ máy</span>
                    </button>
                    <input
                      ref={localVideoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleLocalVideoFileChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                <MathText text={mainVideo.title} />
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                <MathText text={mainVideo.caption} />
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-800">
                Mốc nội dung chính trong video (bấm để chuyển nhanh):
              </div>
              <div className="space-y-1">
                {VIDEO_CHAPTERS.map((ch) => (
                  <button
                    key={ch.timeSec}
                    type="button"
                    onClick={() => handleSeekChapter(ch.timeSec)}
                    className="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-left text-xs hover:border-cyan-500 hover:bg-cyan-50/40 transition-colors"
                  >
                    <span className="text-slate-800 font-medium">
                      <MathText text={ch.label} />
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-cyan-800 shrink-0 tabular-nums">
                      <Play className="w-3 h-3" />
                      {ch.timeLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedPhotos.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenEvidence(item)}
              className="group flex flex-col text-left rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-cyan-500 transition-colors"
            >
              <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                <ResilientEvidenceImage
                  src={item.src}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 text-white text-xs font-medium">
                  <span>Phóng to minh chứng</span>
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-500 tabular-nums">
                    {item.groupIds.map((g) => `Nhóm ${g}`).join(' · ')} · {item.dateLabel}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    <MathText text={item.title} />
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  <MathText text={item.caption} />
                </p>
              </div>
            </button>
          ))}
        </div>

        {filteredPhotos.length > 8 && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowAllPhotos((prev) => !prev)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
            >
              {showAllPhotos
                ? 'Thu gọn danh sách ảnh minh chứng'
                : `Xem đầy đủ toàn bộ ${filteredPhotos.length} ảnh thực nghiệm lớp học`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
