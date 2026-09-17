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
} from 'lucide-react';
import { Article, SourceData } from '@/lib/store/types';
import { getAIProvider } from '@/lib/ai';

interface BlockEditorProps {
  article: Article;
  onUpdateArticle: (updated: Article) => void;
  onProceedToReview: () => void;
  saveStatusText?: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  article,
  onUpdateArticle,
  onProceedToReview,
  saveStatusText = 'Đã lưu tự động',
}) => {
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
    // Copy format according to Section XLII (No UI labels)
    const fullText = `${article.title}\n\n${article.sapo}\n\n${article.body}\n\n${article.recommendation}\n\n${article.hashtags.join(' ')}`;
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

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#11192e]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800/60">
            TRÌNH SOẠN THẢO KHỐI (MỤC XII)
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {saveStatusText} (Phiên bản v{article.version || 1})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyFullArticle}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Đã sao chép toàn bộ bài!' : 'SAO CHÉP BÀI ĐĂNG'}
          </button>

          <button
            onClick={onProceedToReview}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-950 transition-all"
          >
            <ShieldCheck className="h-4 w-4 text-amber-300" />
            TIẾP TỤC: KIỂM DUYỆT TRƯỚC KHI ĐĂNG
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Block Editor, Right is AI Rewrite Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Structured Blocks */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. KHỐI TIÊU ĐỀ (TITLE) */}
          <div
            onClick={() => setActiveSection('title')}
            className={`rounded-xl border p-4 transition-all ${
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
                {article.public_content?.title?.length || 0} ký tự (Ngắn, có động từ, không giật gân)
              </span>
            </div>
            <textarea
              value={article.public_content?.title || ''}
              onChange={e => handleBlockChange('title', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm font-bold text-white focus:border-blue-500 focus:outline-none"
            />

            {/* Alternative titles if generated */}
            {alternativeTitles.length > 0 && activeSection === 'title' && (
              <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">3 Tiêu đề gợi ý khác:</span>
                {alternativeTitles.map((alt, i) => (
                  <button
                    key={i}
                    onClick={() => handleBlockChange('title', alt)}
                    className="w-full text-left text-xs p-2 rounded bg-slate-800/80 hover:bg-blue-950 hover:text-blue-300 text-slate-300 border border-slate-700/50 transition-colors"
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
            className={`rounded-xl border p-4 transition-all ${
              activeSection === 'sapo'
                ? 'border-blue-500 bg-[#121c33] shadow-md shadow-blue-950/40'
                : 'border-slate-800 bg-[#111827]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <label className="text-xs font-bold text-blue-400 uppercase flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> 2. ĐOẠN MỞ ĐẦU (SAPO)
              </label>
              <span className="text-[11px] text-slate-400">1 - 2 câu: Việc gì - Ở đâu - Lực lượng làm gì - Kết quả</span>
            </div>
            <textarea
              value={article.public_content?.sapo || ''}
              onChange={e => handleBlockChange('sapo', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 focus:border-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* 3. KHỐI NỘI DUNG (BODY) */}
          <div
            onClick={() => setActiveSection('body')}
            className={`rounded-xl border p-4 transition-all ${
              activeSection === 'body'
                ? 'border-blue-500 bg-[#121c33] shadow-md shadow-blue-950/40'
                : 'border-slate-800 bg-[#111827]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <label className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" /> 3. NỘI DUNG CHI TIẾT (BODY)
              </label>
              <span className="text-[11px] text-slate-400">Thời gian → Địa điểm → Diễn biến → Kết quả</span>
            </div>
            <textarea
              value={article.public_content?.body || ''}
              onChange={e => handleBlockChange('body', e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none leading-relaxed font-sans"
            />
          </div>

          {/* 4. KHỐI KHUYẾN CÁO (RECOMMENDATION) */}
          <div
            onClick={() => setActiveSection('recommendation')}
            className={`rounded-xl border p-4 transition-all ${
              activeSection === 'recommendation'
                ? 'border-blue-500 bg-[#121c33] shadow-md shadow-blue-950/40'
                : 'border-slate-800 bg-[#111827]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <label className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> 4. THÔNG ĐIỆP KHUYẾN CÁO (RECOMMENDATION)
              </label>
              <span className="text-[11px] text-slate-400">Khuyến cáo thực tế sát chủ đề, không chung chung</span>
            </div>
            <textarea
              value={article.public_content?.recommendation || ''}
              onChange={e => handleBlockChange('recommendation', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-medium text-emerald-200 focus:border-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* 5. KHỐI HASHTAGS */}
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <label className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> 5. HASHTAGS (3 - 5 THẺ)
              </label>
              <span className="text-[11px] text-slate-400">{article.hashtags?.length || 0} / 5 hashtags</span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {(article.public_content?.hashtags || article.hashtags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800/80 text-xs font-semibold"
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
          <div className="sticky top-20 rounded-xl border border-slate-800 bg-[#111827] p-4 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-100">CÔNG CỤ VIẾT LẠI AI (MỤC XIII)</h3>
                <p className="text-[11px] text-slate-400">
                  Đang chọn: <strong className="text-amber-400 uppercase">{activeSection}</strong>
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 text-[11px] text-slate-400 border border-slate-800 leading-relaxed">
              ⚡ <strong>Quy tắc bất biến:</strong> AI chỉ đổi văn phong và cách diễn đạt, <strong>tuyệt đối không thay đổi số liệu</strong> hay dữ kiện nguồn.
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleRewrite('shorter')}
                disabled={isRewriting}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <span>✂️ Rút ngắn gọn hơn</span>
                <span className="text-[10px] text-slate-400">Súc tích</span>
              </button>

              <button
                onClick={() => handleRewrite('formal')}
                disabled={isRewriting}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <span>🏛️ Trang trọng, hành chính hơn</span>
                <span className="text-[10px] text-slate-400">Chuẩn mực</span>
              </button>

              <button
                onClick={() => handleRewrite('journalistic')}
                disabled={isRewriting}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <span>📰 Văn phong báo chí truyền thông</span>
                <span className="text-[10px] text-slate-400">Chính luận</span>
              </button>

              <button
                onClick={() => handleRewrite('friendly')}
                disabled={isRewriting}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <span>🤝 Gần gũi, vận động nhân dân</span>
                <span className="text-[10px] text-slate-400">Thân thiện</span>
              </button>

              <button
                onClick={() => handleRewrite('focus_awareness')}
                disabled={isRewriting}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <span>📢 Nhấn mạnh mục đích tuyên truyền</span>
                <span className="text-[10px] text-slate-400">Nâng ý thức</span>
              </button>

              <button
                onClick={() => handleRewrite('focus_result')}
                disabled={isRewriting}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <span>🎯 Nhấn mạnh kết quả răn đe</span>
                <span className="text-[10px] text-slate-400">Xử lý nghiêm</span>
              </button>

              <button
                onClick={() => handleRewrite('three_titles')}
                disabled={isRewriting}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-200 text-xs font-bold border border-amber-700/60 transition-colors"
              >
                <span>✨ Đề xuất 3 tiêu đề khác</span>
                <span className="text-[10px] text-amber-400">AI</span>
              </button>
            </div>

            {/* Source Snapshot Card for Instant Reference */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                Dữ liệu nguồn đối chiếu (Snapshot):
              </span>
              <div className="p-2.5 rounded bg-slate-900 text-[11px] text-slate-300 space-y-1 font-mono">
                <div>• Ngày: {article.source_snapshot?.date}</div>
                <div>• Tuyến: {article.source_snapshot?.route || article.source_snapshot?.location}</div>
                <div>• Lực lượng: {article.source_snapshot?.officers_count || 0} CBCS</div>
                <div>• Kiểm tra: {article.source_snapshot?.vehicles_inspected || 0} xe</div>
                <div>• Vi phạm: <strong className="text-rose-400">{article.source_snapshot?.violations_count || 0}</strong> trường hợp</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
