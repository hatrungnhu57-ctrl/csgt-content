'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  FileEdit,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Video,
  Download,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Article, ArticleStatus, ArticleType } from '@/lib/store/types';

interface ArticleLibraryViewProps {
  articles: Article[];
  onOpenArticle: (articleId: string) => void;
  onEditArticle: (articleId: string) => void;
  onGenerateVideo: (articleId: string) => void;
  onDeleteArticle: (articleId: string) => void;
}

export const ArticleLibraryView: React.FC<ArticleLibraryViewProps> = ({
  articles,
  onOpenArticle,
  onEditArticle,
  onGenerateVideo,
  onDeleteArticle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered Articles (Section XXV: Tìm kiếm theo từ khóa, tiêu đề, nội dung, tháng, chủ đề, trạng thái)
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      // 1. Keyword search (title, body, sapo, hashtags, location)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = art.title?.toLowerCase().includes(query);
        const matchBody = art.body?.toLowerCase().includes(query);
        const matchSapo = art.sapo?.toLowerCase().includes(query);
        const matchTopic = art.topic?.toLowerCase().includes(query);
        const matchRoute = art.source_data?.route?.toLowerCase().includes(query);
        const matchTags = art.hashtags?.some(t => t.toLowerCase().includes(query));

        if (!matchTitle && !matchBody && !matchSapo && !matchTopic && !matchRoute && !matchTags) {
          return false;
        }
      }

      // 2. Status filter
      if (selectedStatus !== 'ALL' && art.status !== selectedStatus) {
        return false;
      }

      // 3. Type filter
      if (selectedType !== 'ALL' && art.article_type !== selectedType) {
        return false;
      }

      // 4. Month filter
      if (selectedMonth !== 'ALL') {
        const dateObj = new Date(art.created_at || art.published_at || Date.now());
        const month = (dateObj.getMonth() + 1).toString();
        if (month !== selectedMonth) {
          return false;
        }
      }

      return true;
    });
  }, [articles, searchQuery, selectedStatus, selectedType, selectedMonth]);

  const handleCopyText = (art: Article) => {
    const text = `${art.title}\n\n${art.sapo}\n\n${art.body}\n\n${art.recommendation}\n\n${art.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(art.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTxt = (art: Article) => {
    const text = `TIN BÀI TUYÊN TRUYỀN TTATGT ĐƯỜNG BỘ\n${art.title}\n\n[SAPO]\n${art.sapo}\n\n[NỘI DUNG]\n${art.body}\n\n[KHUYẾN CÁO]\n${art.recommendation}\n\n[HASHTAGS]\n${art.hashtags.join(' ')}\n\n[DỮ LIỆU NGUỒN]\nNgày: ${art.source_data?.date}\nTuyến: ${art.source_data?.route || art.source_data?.location}\nĐơn vị: ${art.source_data?.unit_name}\nVi phạm: ${art.source_data?.violations_count || 0} trường hợp`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSGT_BaiViet_${art.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#11192e] p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/60">
            KHO TIN BÀI TUYÊN TRUYỀN (MỤC XXIII, XXIV, XXV)
          </span>
          <h1 className="text-xl font-black tracking-tight text-white mt-1">
            Lưu trữ, Quản lý & Truy xuất {articles.length} bài viết nghiệp vụ
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Lưu đầy đủ source_data, public_content, lịch sử phiên bản và liên kết xuất bản.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo từ khóa (nồng độ cồn, tốc độ, QL53, học sinh...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Status Select */}
          <div className="lg:col-span-3">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã đăng (PUBLISHED)</option>
              <option value="APPROVED">Đã duyệt (APPROVED)</option>
              <option value="NEEDS_REVIEW">Chờ kiểm duyệt (NEEDS_REVIEW)</option>
              <option value="GENERATED">Đã tạo (GENERATED)</option>
              <option value="DRAFT">Bản nháp (DRAFT)</option>
            </select>
          </div>

          {/* Type Select */}
          <div className="lg:col-span-2">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Mọi loại bài</option>
              <option value="nong_do_con">Nồng độ cồn</option>
              <option value="toc_do">Tốc độ</option>
              <option value="hoc_sinh">Học sinh</option>
              <option value="xe_tai">Xe tải</option>
              <option value="xe_khach">Xe khách</option>
              <option value="ho_tro_dan">Hỗ trợ dân</option>
              <option value="tngt">TNGT</option>
              <option value="tuyen_truyen">Tuyên truyền</option>
            </select>
          </div>

          {/* Month Select */}
          <div className="lg:col-span-2">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Cả năm 2026</option>
              <option value="9">Tháng 09/2026</option>
              <option value="8">Tháng 08/2026</option>
              <option value="7">Tháng 07/2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table / List */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Không tìm thấy bài viết nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredArticles.map(art => {
              const isPub = art.status === 'PUBLISHED';
              const isApp = art.status === 'APPROVED';
              const isRev = art.status === 'NEEDS_REVIEW' || art.status === 'GENERATED';

              return (
                <div
                  key={art.id}
                  className="p-4 hover:bg-slate-850/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Column: Title & Metadata */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isPub
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isApp
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : isRev
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isPub ? 'Đã đăng' : isApp ? 'Đã duyệt' : isRev ? 'Chờ kiểm duyệt' : 'Nháp'}
                      </span>

                      <span className="text-xs font-semibold text-slate-400">
                        Chuyên đề: <strong className="text-slate-200">{art.topic || art.article_type}</strong>
                      </span>

                      <span className="text-xs text-slate-500">
                        • Ngày tạo: {new Date(art.created_at).toLocaleDateString('vi-VN')}
                      </span>

                      <span className="text-xs text-slate-500">
                        • Phiên bản: v{art.version || 1}
                      </span>
                    </div>

                    <h3
                      onClick={() => onOpenArticle(art.id)}
                      className="text-sm font-bold text-white hover:text-blue-400 cursor-pointer line-clamp-1"
                    >
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {art.sapo || art.body}
                    </p>

                    {/* Source summary badge */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                      <span>📍 {art.source_data?.route || art.source_data?.location || 'Địa bàn'}</span>
                      <span>👮 {art.source_data?.officers_count || 0} CBCS</span>
                      <span>🚨 {art.source_data?.violations_count || 0} vi phạm</span>
                      {art.published_url && (
                        <a
                          href={art.published_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1 font-sans"
                        >
                          <ExternalLink className="h-3 w-3" /> Link bài đăng
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyText(art)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium"
                      title="Sao chép toàn bộ bài"
                    >
                      {copiedId === art.id ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleExportTxt(art)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium"
                      title="Xuất file TXT"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onGenerateVideo(art.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-950/70 hover:bg-teal-900 text-teal-300 hover:text-white border border-teal-800/80 text-xs font-bold"
                      title="Tạo kịch bản video dọc 9:16"
                    >
                      <Video className="h-3.5 w-3.5" /> Video
                    </button>

                    <button
                      onClick={() => onOpenArticle(art.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-950"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-300" /> Thẩm định
                    </button>

                    <button
                      onClick={() => onEditArticle(art.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                      title="Sửa bài"
                    >
                      <FileEdit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Đồng chí có chắc chắn muốn xóa bài viết này?')) {
                          onDeleteArticle(art.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700"
                      title="Xóa bài"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
