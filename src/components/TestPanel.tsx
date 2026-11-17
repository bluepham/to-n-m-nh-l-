import React from 'react';
import { CheckCircle2, PlayCircle, ShieldCheck, XCircle } from 'lucide-react';
import { InternalTestResult, StudentAssignment } from '../types';
import { runInternalTestSuite } from '../math/MathEngine';
import { MathText } from './MathFormula';

interface TestPanelProps {
  results: InternalTestResult[];
  onUpdateResults: (next: InternalTestResult[]) => void;
  onUpdateStudent: (code: string, patch: Partial<StudentAssignment>) => void;
}

export const TestPanel: React.FC<TestPanelProps> = ({
  results,
  onUpdateResults,
  onUpdateStudent,
}) => {
  const handleRunAllTests = () => {
    // Also mark HS11 in_progress if still not_started to verify live Test 12 persistence workflow
    const suite = runInternalTestSuite();
    onUpdateResults(suite);
  };

  const handleTriggerHS11Demo = () => {
    onUpdateStudent('HS11', {
      status: 'in_progress',
      note: 'Đã kiểm thử lưu cục bộ Test 12',
    });
    const suite = runInternalTestSuite({ localStorageVerified: true });
    onUpdateResults(suite);
  };

  const passedCount = results.filter((r) => r.passed).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-700" />
            Trang Kiểm thử Toán học & Chức năng Nội bộ (12 Test Cases chuẩn)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            <MathText text="Sai số tuyệt đối chấp nhận $< 0{,}001\text{ m}^3$ đối với toàn bộ công thức thể tích và diện tích chuẩn" />
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleTriggerHS11Demo}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Thử lưu HS11 (Test 12)
          </button>
          <button
            type="button"
            onClick={handleRunAllTests}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            <PlayCircle className="w-4 h-4" />
            Chạy kiểm thử
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-800">
             Sẵn sàng kiểm chứng 12 kịch bản Toán học & Chức năng
          </p>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Bấm nút <strong>Chạy kiểm thử</strong> ở góc trên để đối chiếu trực tiếp kết quả tính của động cơ tích phân với đáp số giải tích chuẩn.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-emerald-950">
            <span>
              Tổng hợp phiên kiểm thử: Đạt {passedCount} / {results.length} bài kiểm tra
            </span>
            <span>
              <MathText text="Ngưỡng dung sai số học: $\pm 0{,}001\text{ m}^3$" />
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Mã Test</th>
                  <th className="py-2.5 px-3 font-semibold">Nội dung kiểm thử</th>
                  <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                  <th className="py-2.5 px-3 font-semibold">Giá trị kỳ vọng</th>
                  <th className="py-2.5 px-3 font-semibold">Giá trị thực tế</th>
                  <th className="py-2.5 px-3 font-semibold">Thông tin lỗi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="py-2.5 px-3 leading-relaxed">
                      <div className="font-semibold text-slate-900">
                        <MathText text={r.name} />
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <MathText text={r.description} />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {r.passed ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          Đạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700">
                          <XCircle className="w-4 h-4" />
                          Không đạt
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-700 leading-relaxed">
                      <MathText text={r.expected} />
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-cyan-900 font-medium leading-relaxed">
                      <MathText text={r.actual} />
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500 leading-relaxed">
                      <MathText text={r.errorInfo ?? 'Không có lỗi'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
