'use client';

import React from 'react';
import {
  Shield,
  FileText,
  Wine,
  Gauge,
  Truck,
  Bus,
  GraduationCap,
  BookOpen,
  HeartHandshake,
  Award,
  CalendarCheck,
  GitFork,
  AlertTriangle,
  Car,
  BadgeCheck,
  Layers,
} from 'lucide-react';
import { ArticleType } from '@/lib/store/types';

interface ArticleTypeSelectorProps {
  selectedType: ArticleType;
  onSelectType: (type: ArticleType) => void;
}

export const ARTICLE_TYPES: {
  id: ArticleType;
  title: string;
  desc: string;
  icon: any;
  badge?: string;
  color: string;
}[] = [
  {
    id: 'ttks',
    title: '1. Tuần tra, kiểm soát',
    desc: 'Kết quả ca trực, đợt cao điểm TTKS tổng hợp trên tuyến địa bàn',
    icon: Shield,
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/40 text-blue-400',
  },
  {
    id: 'xlvp',
    title: '2. Xử lý vi phạm chung',
    desc: 'Lập biên bản xử lý các hành vi vi phạm trật tự an toàn giao thông',
    icon: FileText,
    color: 'from-slate-700/40 to-slate-800/20 border-slate-700 text-slate-300',
  },
  {
    id: 'nong_do_con',
    title: '3. Chuyên đề Nồng độ cồn',
    desc: 'Xử lý người điều khiển phương tiện trong cơ thể có cồn, ma túy',
    icon: Wine,
    badge: 'Trọng điểm',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-400',
  },
  {
    id: 'toc_do',
    title: '4. Chuyên đề Tốc độ',
    desc: 'Đo tốc độ tự động và công khai, xử lý phương tiện phóng nhanh',
    icon: Gauge,
    badge: 'Trọng điểm',
    color: 'from-red-500/20 to-red-600/10 border-red-500/40 text-red-400',
  },
  {
    id: 'xe_tai',
    title: '5. Chuyên đề Xe tải',
    desc: 'Xử lý chở quá tải trọng, cơi nới thành thùng, rơi vãi vật liệu',
    icon: Truck,
    color: 'from-orange-500/20 to-orange-600/10 border-orange-500/40 text-orange-400',
  },
  {
    id: 'xe_khach',
    title: '6. Chuyên đề Xe khách',
    desc: 'Kiểm soát phương tiện kinh doanh vận tải, đón trả khách sai quy định',
    icon: Bus,
    color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/40 text-yellow-400',
  },
  {
    id: 'hoc_sinh',
    title: '7. Học sinh – Thanh thiếu niên',
    desc: 'Tuyên truyền cổng trường, xử lý chưa đủ tuổi, không đội mũ bảo hiểm',
    icon: GraduationCap,
    badge: 'Đầu năm học',
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-400',
  },
  {
    id: 'tuyen_truyen',
    title: '8. Tuyên truyền pháp luật',
    desc: 'Phổ biến Luật GTĐB, các mức phạt mới, kỹ năng tham gia giao thông',
    icon: BookOpen,
    color: 'from-teal-500/20 to-teal-600/10 border-teal-500/40 text-teal-400',
  },
  {
    id: 'ho_tro_dan',
    title: '9. Hỗ trợ người dân',
    desc: 'Giúp đỡ người lỡ đường, mùa mưa bão, đưa người đi cấp cứu',
    icon: HeartHandshake,
    badge: 'Lan tỏa đẹp',
    color: 'from-rose-500/20 to-rose-600/10 border-rose-500/40 text-rose-400',
  },
  {
    id: 'guong_tot',
    title: '10. Gương người tốt, việc tốt',
    desc: 'Biểu dương CBCS nhặt được của rơi, dũng cảm cứu nạn cứu hộ',
    icon: Award,
    color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/40 text-cyan-400',
  },
  {
    id: 'su_kien',
    title: '11. Bảo đảm TTATGT sự kiện',
    desc: 'Bảo vệ lễ hội, kỳ thi tốt nghiệp, đại hội, đón dẫn đoàn ngoại giao',
    icon: CalendarCheck,
    color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/40 text-indigo-400',
  },
  {
    id: 'phan_luong',
    title: '12. Phân luồng giao thông',
    desc: 'Hướng dẫn giao thông chống ùn tắc giờ cao điểm, mưa ngập',
    icon: GitFork,
    color: 'from-violet-500/20 to-violet-600/10 border-violet-500/40 text-violet-400',
  },
  {
    id: 'canh_bao',
    title: '13. Cảnh báo nguy cơ mất ATGT',
    desc: 'Khuyến cáo điểm đen tai nạn, đoạn đường sạt lở, thời tiết xấu',
    icon: AlertTriangle,
    badge: 'Cảnh báo',
    color: 'from-amber-600/20 to-amber-700/10 border-amber-600/40 text-amber-500',
  },
  {
    id: 'tngt',
    title: '14. Tai nạn giao thông',
    desc: 'Thông tin hiện trường khách quan (áp dụng nghiêm ngặt Guardrail chống phán đoán lỗi)',
    icon: Car,
    badge: 'Nghiêm ngặt',
    color: 'from-red-600/20 to-red-700/10 border-red-600/40 text-red-500',
  },
  {
    id: 'hoat_dong_csgt',
    title: '15. Hoạt động của lực lượng CSGT',
    desc: 'Hội nghị, tập huấn điều lệnh, phong trào thi đua vì ANTQ',
    icon: BadgeCheck,
    color: 'from-blue-600/20 to-blue-700/10 border-blue-600/40 text-blue-500',
  },
  {
    id: 'khac',
    title: '16. Nội dung khác',
    desc: 'Các chủ đề tuyên truyền chuyên sâu hoặc bài viết đặc thù khác',
    icon: Layers,
    color: 'from-slate-600/20 to-slate-700/10 border-slate-600/40 text-slate-400',
  },
];

export const ArticleTypeSelector: React.FC<ArticleTypeSelectorProps> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">1</span>
            BƯỚC 1: CHỌN LOẠI BÀI VIẾT TUYÊN TRUYỀN (16 LOẠI HÌNH)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mỗi loại bài được gắn với cấu trúc nghiệp vụ và mẫu khuyến cáo an toàn phù hợp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ARTICLE_TYPES.map(item => {
          const Icon = item.icon;
          const isSelected = selectedType === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectType(item.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-900/60 to-blue-950 border-blue-500 shadow-md shadow-blue-950 ring-2 ring-blue-500/50'
                  : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-slate-800/80 border ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className={`text-xs font-bold ${isSelected ? 'text-blue-300' : 'text-slate-100'}`}>
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </div>

              {isSelected && (
                <div className="mt-3 text-[11px] font-bold text-blue-400 flex items-center gap-1">
                  ✓ Đang chọn loại này
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
