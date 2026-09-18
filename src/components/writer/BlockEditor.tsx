'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  History,
  Tag,
  MessageSquare,
  FileText,
  Sliders,
  CheckCircle2,
  Eye,
  Edit3,
  Share2,
  Calendar,
  MapPin,
  Send,
  Image as ImageIcon,
} from 'lucide-react';
import { Article, SourceData, UnitProfile } from '@/lib/store/types';
import { getAIProvider } from '@/lib/ai';
import { generatePoliceWordDocument } from '@/lib/utils/docx-export';

interface BlockEditorProps {
  article: Article;
  unit?: UnitProfile;
  onUpdateArticle: (updated: Article) => void;
  onProceedToReview: () => void;
  onOpenWatermarkModal?: () => void;
  saveStatusText?: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  article,
  unit,
  onUpdateArticle,
  onProceedToReview,
  onOpenWatermarkModal,
  saveStatusText = 'Đã lưu tự động',
}) => {
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [activeSection, setActiveSection] = useState<'title' | 'sapo' | 'body' | 'recommendation' | 'hashtags'>('body');
  const [alternativeTitles, setAlternativeTitles] = useState<string[]>([]);

  const handleBlockChange = (field: keyof Article['public_content'], value: any) => {
    const updated = {
      ...article,
      public_content: {
        ...article.public_content,
        [field]: value,
      },
      // Keep root synced
      [field]: value,
      version: (article.version || 1) + 1,
    };
    onUpdateArticle(updated);
  };

  const handleRewrite = async (action: 'shorter' | 'formal' | 'journalistic' | 'friendly' | 'focus_awareness' | 'focus_result' | 'three_titles') => {
    setIsRewriting(true);
    try {
      const provider = getAIProvider();
      let targetText = '';
      if (activeSection === 'title') targetText = article.title;
      else if (activeSection === 'sapo') targetText = article.sapo;
      else if (activeSection === 'body') targetText = article.body;
      else if (activeSection === 'recommendation') targetText = article.recommendation;

      const result = await provider.rewriteContent({
        sectionText: targetText,
        action,
        sourceData: article.source_snapshot,
      });

      if (action === 'three_titles' && result.alternatives) {
        setAlternativeTitles(result.alternatives);
      } else {
        handleBlockChange(activeSection as any, result.rewrittenText);
      }
    } catch (err) {
      console.error('Lỗi viết lại:', err);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopyFullArticle = () => {
    const fullText = `${article.title}\n\n${article.sapo}\n\n${article.body}\n\n${article.recommendation}\n\n${(article.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddHashtag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!article.hashtags.includes(cleanTag)) {
      handleBlockChange('hashtags', [...article.hashtags, cleanTag]);
    }
  };

  const handleRemoveHashtag = (index: number) => {
    const updated = [...article.hashtags];
    updated.splice(index, 1);
    handleBlockChange('hashtags', updated);
  };

  const titleText = article.public_content?.title || article.title;
  const sapoText = article.public_content?.sapo || article.sapo;
  const bodyText = article.public_content?.body || article.body;
  const recText = article.public_content?.recommendation || article.recommendation;
  const tagsList = article.public_content?.hashtags || article.hashtags || [];

  return (
    <div className="space-y-6">
      {/* Top Action & View Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-[#11192e] shadow-lg">
        <div className="flex items-center gap-3">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'preview'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> ĐỌC THỬ TOÀN BÀI (LIVE PREVIEW)
            </button>
            <button
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'editor'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" /> SOẠN THẢO TỪNG KHỐI
            </button>
          </div>

          <span className="hidden sm:flex text-xs text-slate-400 items-center gap-1.5 pl-2 border-l border-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {saveStatusText} (v{article.version || 1})
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyFullArticle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Đã sao chép!' : 'SAO CHÉP'}
          </button>

          {unit && (
            <button
              onClick={() => generatePoliceWordDocument(article, unit)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-950/90 hover:bg-blue-900 text-blue-200 hover:text-white text-xs font-bold border border-blue-700/70 transition-colors shadow-sm"
              title="Xuất file Word (.docx) chuẩn thể thức BCA"
            >
              <FileText className="h-3.5 w-3.5 text-blue-300" />
              <span>XUẤT WORD</span>
            </button>
          )}

          {onOpenWatermarkModal && (
            <button
              onClick={onOpenWatermarkModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/90 hover:bg-amber-900 text-amber-200 hover:text-white text-xs font-bold border border-amber-700/70 transition-colors shadow-sm"
              title="Đóng dấu Logo CSGT và che mặt ảnh"
            >
              <ImageIcon className="h-3.5 w-3.5 text-amber-300" />
              <span>ĐÓNG DẤU ẢNH</span>
            </button>
          )}

          <button
            onClick={onProceedToReview}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-950 border border-blue-500/40 transition-all cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 text-amber-300" />
            TIẾP TỤC: KIỂM DUYỆT & GỬI DUYỆT
          </button>
        </div>
      </div>

      {/* VIEW 1: ĐỌC THỬ BÀI BÁO HOÀN CHỈNH (LIVE PREVIEW) */}
      {viewMode === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Newspaper / Facebook Post Simulation */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-5">
              {/* Header meta badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider text-[10px]">
                    {article.topic || 'TUYÊN TRUYỀN TTATGT'}
                  </span>
                  <span className="text-slate-400 font-medium">
                    Tác giả: <strong className="text-slate-200">{article.team_name || article.author_name || 'Tổ công tác'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>{new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
                {titleText}
              </h1>

              {/* Sapo (Intro paragraph) */}
              <div className="p-4 rounded-xl bg-blue-950/30 border-l-4 border-blue-500 text-slate-200 text-sm font-medium leading-relaxed italic">
                {sapoText}
              </div>

              {/* Body Content */}
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-sans">
                {bodyText}
              </div>

              {/* Recommendation Box */}
              {recText && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-600/60 space-y-1.5 shadow-inner">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>KHUYẾN CÁO TỪ LỰC LƯỢNG CẢNH SÁT GIAO THÔNG</span>
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                    {recText}
                  </p>
                </div>
              )}

              {/* Hashtags */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 items-center">
                {tagsList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-slate-900 text-blue-400 border border-slate-700 text-xs font-mono font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Quick Actions & Overview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#11192e] p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase text-white">TRẠNG THÁI & THAO TÁC</h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Đơn vị:</span>
                  <span className="font-bold text-slate-200">{article.author_name}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span className="font-bold text-amber-400 uppercase">Chờ kiểm duyệt & gửi</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Số chữ ước tính:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {`${titleText} ${sapoText} ${bodyText}`.split(/\s+/).length} từ
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setViewMode('editor')}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Chỉnh sửa nội dung từng phần
                </button>

                <button
                  onClick={onProceedToReview}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-950 border border-emerald-500/40 transition-all cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" /> BẮT ĐẦU THẨM ĐỊNH AI & GỬI DUYỆT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CHẾ ĐỘ SOẠN THẢO TỪNG KHỐI (BLOCK EDITOR) */}
      {viewMode === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Structured Blocks */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. KHỐI TIÊU ĐỀ (TITLE) */}
            <div
              onClick={() => setActiveSection('title')}
              className={`rounded-2xl border p-4 transition-all ${
                activeSection === 'title'
                  ? 'border-blue-500 bg-[#121c33] shadow-md shadow-blue-950/40'
                  : 'border-slate-800 bg-[#111827]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <label className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> 1. TIÊU ĐỀ BÀI VIẾT (TITLE)
                </label>
                <span className="text-[11px] text-slate-400">
                  {titleText.length} ký tự (Ngắn, có động từ)
                </span>
              </div>
              <textarea
                value={titleText}
                onChange={e => handleBlockChange('title', e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
              />

              {alternativeTitles.length > 0 && activeSection === 'title' && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">3 Tiêu đề gợi ý khác:</span>
                  {alternativeTitles.map((alt, i) => (
                    <button
                      key={i}
                      onClick={() => handleBlockChange('title', alt)}
                      className="w-full text-left text-xs p-2 rounded-lg bg-slate-800/80 hover:bg-blue-950 hover:text-blue-300 text-slate-300 border border-slate-700/50 transition-colors"
                    >
                      • {alt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. KHỐI SAPO */}
            <div
              onClick={() => setActiveSection('sapo')}
              className={`rounded-2xl border p-4 transition-all ${
                activeSection === 'sapo'
                  ? 'border-blue-500 bg-[#121c33] shadow-md shadow-blue-950/40'
                  : 'border-slate-800 bg-[#111827]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <label className="text-xs font-bold text-blue-400 uppercase flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> 2. ĐOẠN MỞ ĐẦU (SAPO)
                </label>
                <span className="text-[11px] text-slate-400">1 - 2 câu: Việc gì - Ở đâu - Lực lượng nào - Kết quả</span>
              </div>
              <textarea
                value={sapoText}
                onChange={e => handleBlockChange('sapo', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs font-medium text-slate-200 focus:border-blue-400 focus:outline-none leading-relaxed"
              />
            </div>

            {/* 3. KHỐI NỘI DUNG (BODY) */}
            <div
              onClick={() => setActiveSection('body')}
              className={`rounded-2xl border p-4 transition-all ${
                activeSection === 'body'
                  ? 'border-blue-500 bg-[#121c33] shadow-md shadow-blue-950/40'
                  : 'border-slate-800 bg-[#111827]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <label className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> 3. NỘI DUNG CHI TIẾT (BODY)
                </label>
                <span className="text-[11px] text-slate-400">Thời gian → Địa điểm → Diễn biến → Kết quả xử lý</span>
              </div>
              <textarea
                value={bodyText}
                onChange={e => handleBlockChange('body', e.target.value)}
                rows={8}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-slate-200 focus:border-blue-400 focus:outline-none leading-relaxed font-sans"
              />
            </div>

            {/* 4. KHỐI KHUYẾN CÁO (RECOMMENDATION) */}
            <div
              onClick={() => setActiveSection('recommendation')}
              className={`rounded-2xl border p-4 transition-all ${
                activeSection === 'recommendation'
                  ? 'border-blue-500 bg-[#121c33] shadow-md shadow-blue-950/40'
                  : 'border-slate-800 bg-[#111827]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <label className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> 4. THÔNG ĐIỆP KHUYẾN CÁO (RECOMMENDATION)
                </label>
                <span className="text-[11px] text-slate-400">Khuyến cáo thực tế sát chủ đề</span>
              </div>
              <textarea
                value={recText}
                onChange={e => handleBlockChange('recommendation', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs font-medium text-emerald-200 focus:border-emerald-400 focus:outline-none leading-relaxed"
              />
            </div>

            {/* 5. KHỐI HASHTAGS */}
            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <label className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> 5. HASHTAGS (3 - 5 THẺ)
                </label>
                <span className="text-[11px] text-slate-400">{tagsList.length} / 5 hashtags</span>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {tagsList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800/80 text-xs font-semibold"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveHashtag(idx)}
                      className="hover:text-red-400 ml-1 text-slate-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: AI Rewrite Tools (Section XIII) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="sticky top-20 rounded-2xl border border-slate-800 bg-[#11192e] p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-100">CÔNG CỤ VIẾT LẠI AI (MỤC XIII)</h3>
                  <p className="text-[11px] text-slate-400">
                    Đang chọn: <strong className="text-amber-400 uppercase">{activeSection}</strong>
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-400 border border-slate-800 leading-relaxed">
                ⚡ <strong>Quy tắc bất biến:</strong> AI chỉ đổi văn phong và cách diễn đạt, <strong>tuyệt đối không thay đổi số liệu</strong> hay dữ kiện nguồn.
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleRewrite('shorter')}
                  disabled={isRewriting}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <span>✂️ Rút ngắn gọn hơn</span>
                  <span className="text-[10px] text-slate-400">Súc tích</span>
                </button>

                <button
                  onClick={() => handleRewrite('formal')}
                  disabled={isRewriting}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <span>🏛️ Trang trọng, hành chính hơn</span>
                  <span className="text-[10px] text-slate-400">Chuẩn mực</span>
                </button>

                <button
                  onClick={() => handleRewrite('journalistic')}
                  disabled={isRewriting}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <span>📰 Văn phong báo chí truyền thông</span>
                  <span className="text-[10px] text-slate-400">Chính luận</span>
                </button>

                <button
                  onClick={() => handleRewrite('friendly')}
                  disabled={isRewriting}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <span>🤝 Gần gũi, vận động nhân dân</span>
                  <span className="text-[10px] text-slate-400">Thân thiện</span>
                </button>

                <button
                  onClick={() => handleRewrite('focus_awareness')}
                  disabled={isRewriting}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <span>📢 Nhấn mạnh mục đích tuyên truyền</span>
                  <span className="text-[10px] text-slate-400">Ý thức</span>
                </button>

                <button
                  onClick={() => handleRewrite('focus_result')}
                  disabled={isRewriting}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <span>🎯 Nhấn mạnh kết quả xử lý vi phạm</span>
                  <span className="text-[10px] text-slate-400">Răn đe</span>
                </button>

                <button
                  onClick={() => handleRewrite('three_titles')}
                  disabled={isRewriting}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 text-xs font-bold border border-amber-700/60 transition-colors"
                >
                  <span>✨ Đổi 3 tiêu đề gợi ý khác</span>
                  <span className="text-[10px] text-amber-400">Tiêu đề</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
