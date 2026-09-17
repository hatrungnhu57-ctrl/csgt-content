'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SourceData } from '@/lib/store/types';
import { getAIProvider } from '@/lib/ai';

interface RawReportExtractorProps {
  onDataExtracted: (data: SourceData) => void;
  onCancel: () => void;
}

const SAMPLE_RAW_REPORTS = [
  {
    label: 'Mẫu 1: Báo cáo Nồng độ cồn đêm',
    text: 'Ngày 17/9/2026, Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú tổ chức thực hiện chuyên đề nồng độ cồn tại Km 45 Quốc lộ 53 (đoạn qua xã Đại An). Ca công tác gồm 12 CBCS, tiến hành dừng kiểm tra 145 lượt phương tiện, phát hiện 08 trường hợp vi phạm nồng độ cồn (gồm 02 ô tô, 06 mô tô). Tổ công tác đã lập biên bản, tạm giữ 08 phương tiện, tước 08 giấy phép lái xe theo quy định.',
  },
  {
    label: 'Mẫu 2: Báo cáo Chuyên đề Tốc độ',
    text: 'Sáng ngày 15/09/2026, tổ tuần tra kiểm soát Đội Cảnh sát giao thông - trật tự tổ chức đo tốc độ trên tuyến Tỉnh lộ 914. Quân số 6 đồng chí. Kiểm tra 90 phương tiện, phát hiện 11 trường hợp chạy quá tốc độ quy định (04 ô tô con, 07 xe máy). Tạm giữ 11 GPLX để xử lý.',
  },
  {
    label: 'Mẫu 3: Báo cáo Học sinh vi phạm cổng trường',
    text: 'Ngày 16/9/2026, Đội Cảnh sát giao thông phối hợp Công an xã cắm chốt kiểm tra tại cổng trường THPT. Phát hiện 06 trường hợp học sinh chưa đủ tuổi điều khiển xe mô tô trên 50cc, không đội mũ bảo hiểm. Đã tạm giữ 6 xe máy, lập biên bản và mời phụ huynh đến làm việc.',
  },
  {
    label: 'Mẫu 4: Vụ TNGT đang điều tra',
    text: 'Vào lúc 14h30 ngày 17/09/2026, tại Km 20 Tỉnh lộ 848 xảy ra vụ va chạm giữa xe ô tô tải và xe mô tô. Lực lượng Cảnh sát giao thông đã có mặt bảo vệ hiện trường, đưa người bị thương đi cấp cứu và phân luồng giao thông. Hiện nguyên nhân vụ tai nạn đang được các cơ quan chức năng khẩn trương điều tra, xác minh làm rõ.',
  },
];

export const RawReportExtractor: React.FC<RawReportExtractorProps> = ({
  onDataExtracted,
  onCancel,
}) => {
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<SourceData | null>(null);

  const handleExtract = async () => {
    if (!rawText.trim()) return;
    setIsExtracting(true);
    try {
      const provider = getAIProvider();
      const extracted = await provider.extractData(rawText);
      setExtractedPreview(extracted);
    } catch (err) {
      console.error('Lỗi trích xuất:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirm = () => {
    if (extractedPreview) {
      onDataExtracted(extractedPreview);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            CHẾ ĐỘ DÁN BÁO CÁO THÔ / NỘI DUNG TỔNG HỢP (MỤC X)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dán đoạn văn bản báo cáo công tác, kế hoạch hoặc tóm tắt vụ việc. AI sẽ tự động bóc tách số liệu vào biểu mẫu nghiệp vụ.
            <strong className="text-slate-200"> Không tự ý suy diễn hoặc bổ sung dữ liệu còn thiếu.</strong>
          </p>
        </div>

        {/* Quick Sample Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">Báo cáo mẫu thử nghiệm:</span>
          {SAMPLE_RAW_REPORTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setRawText(sample.text)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Nội dung báo cáo thô cần trích xuất:
          </label>
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            rows={6}
            placeholder="Ví dụ: Ngày 17/9, tổ công tác thực hiện chuyên đề nồng độ cồn tại Km 45 QL53, có 12 CBCS, kiểm tra 145 phương tiện, phát hiện 08 trường hợp..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300"
          >
            Quay lại nhập biểu mẫu
          </button>

          <button
            onClick={handleExtract}
            disabled={isExtracting || !rawText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-950 transition-all"
          >
            {isExtracting ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Đang phân tích & trích xuất...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                BÓC TÁCH DỮ LIỆU TỰ ĐỘNG
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extracted Data Inspection Modal / Panel (MỤC X.7: Màn kiểm tra dữ liệu đã trích xuất) */}
      {extractedPreview && (
        <div className="rounded-xl border border-amber-600/60 bg-[#131b2e] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm text-slate-100">
                  KIỂM TRA DỮ LIỆU ĐÃ TRÍCH XUẤT (BẮT BUỘC XÁC NHẬN)
                </h3>
                <p className="text-xs text-slate-400">
                  Cán bộ kiểm tra lại các trường thông tin đã nhận dạng trước khi đưa vào tạo bài viết.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800">
              ✓ Đã bóc tách thành công
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Ngày thực hiện:</span>
              <strong className="text-amber-300 text-sm">{extractedPreview.date || 'Chưa nhận diện'}</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Đơn vị:</span>
              <strong className="text-slate-100">{extractedPreview.unit_name}</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Tuyến đường / Địa điểm:</span>
              <strong className="text-slate-100">{extractedPreview.route || extractedPreview.location || 'Chưa rõ'}</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Số CBCS tham gia:</span>
              <strong className="text-blue-400 font-bold text-sm">{extractedPreview.officers_count || 0} CBCS</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Phương tiện kiểm tra:</span>
              <strong className="text-slate-100 font-bold text-sm">{extractedPreview.vehicles_inspected || 0} xe</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Tổng số vi phạm:</span>
              <strong className="text-rose-400 font-bold text-sm">{extractedPreview.violations_count || 0} trường hợp</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Phân loại phương tiện:</span>
              <span className="text-slate-200">
                {extractedPreview.car_count ? `${extractedPreview.car_count} Ô tô, ` : ''}
                {extractedPreview.motorcycle_count ? `${extractedPreview.motorcycle_count} Mô tô` : 'Không phân loại'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Tạm giữ:</span>
              <span className="text-amber-400 font-medium">
                {extractedPreview.vehicles_seized || 0} phương tiện, {extractedPreview.licenses_seized || 0} GPLX
              </span>
            </div>
          </div>

          {/* Violations details */}
          {extractedPreview.violations && extractedPreview.violations.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-300 block">Hành vi vi phạm đã trích xuất:</span>
              <div className="space-y-1.5">
                {extractedPreview.violations.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-200 pl-2 border-l-2 border-amber-500">
                    <span>{v.violation_name} ({v.count} trường hợp)</span>
                    <span className="text-[10px] text-slate-400">
                      {v.legal_reference ? `Căn cứ: ${v.legal_reference}` : 'Chưa gắn căn cứ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setExtractedPreview(null)}
              className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300"
            >
              Chỉnh sửa lại đoạn dán
            </button>

            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              XÁC NHẬN VÀ ĐIỀN VÀO BIỂU MẪU ĐỂ TẠO BÀI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
