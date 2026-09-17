'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  Copy,
  Check,
  Sparkles,
  Clock,
  Smartphone,
  Shield,
  Layers,
  FileText,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { Article, VideoScript } from '@/lib/store/types';
import { getAIProvider } from '@/lib/ai';

interface VideoScriptGeneratorProps {
  articles: Article[];
  selectedArticleId?: string;
}

export const VideoScriptGenerator: React.FC<VideoScriptGeneratorProps> = ({
  articles,
  selectedArticleId,
}) => {
  const [currentArticleId, setCurrentArticleId] = useState<string>(
    selectedArticleId || (articles[0]?.id ?? '')
  );
  const [script, setScript] = useState<VideoScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedArticle = articles.find(a => a.id === currentArticleId);

  useEffect(() => {
    if (selectedArticle) {
      handleGenerateScript(selectedArticle);
    }
  }, [currentArticleId]);

  const handleGenerateScript = async (art: Article) => {
    setIsGenerating(true);
    try {
      const provider = getAIProvider();
      const generated = await provider.generateVideoScript(art);
      setScript(generated);
    } catch (err) {
      console.error('Lỗi tạo kịch bản video:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyScript = () => {
    if (!script) return;
    let fullText = `KỊCH BẢN VIDEO NGẮN 9:16 (TIKTOK / REELS / YOUTUBE SHORTS)\n`;
    fullText += `Tiêu đề: ${script.title}\n`;
    fullText += `Thời lượng dự kiến: ${script.target_duration}\n`;
    fullText += `Thông điệp chính: ${script.main_message}\n\n`;
    fullText += `--- CHI TIẾT CÁC PHÂN CẢNH ---\n`;

    script.segments.forEach((seg, i) => {
      fullText += `[CẢNH ${i + 1}] (${seg.time_range}) - ${seg.phase.toUpperCase()}\n`;
      fullText += `• Cảnh quay: ${seg.scene_description}\n`;
      fullText += `• Text màn hình: ${seg.visual_text}\n`;
      fullText += `• Lời bình (Voice Over): ${seg.voice_over}\n`;
      fullText += `• Phụ đề: ${seg.subtitle}\n`;
      fullText += `• B-roll gợi ý: ${seg.b_roll_suggestion}\n\n`;
    });

    fullText += `--- KẾT THÚC VIDEO (END CARD) ---\n`;
    fullText += `• Quy chuẩn Logo: ${script.end_card.logo_instruction}\n`;
    fullText += `• Thông điệp cuối: ${script.end_card.text}\n`;
    if (script.end_card.hotline) fullText += `• Hotline: ${script.end_card.hotline}\n`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#11192e] p-5 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded border border-teal-800/60 flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5" /> MODULE KỊCH BẢN VIDEO NGẮN DỌC 9:16 (MỤC XXIX, XXX, XXXI)
          </span>
          <span className="text-xs font-bold text-slate-300">Thời lượng chuẩn: 30 - 60 giây</span>
        </div>

        <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          <Video className="h-6 w-6 text-teal-400" />
          Chuyển đổi bài viết tuyên truyền thành Kịch bản Video ngắn (TikTok, Reels, Shorts)
        </h1>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Tự động xuất đầy đủ Timeline, Cảnh quay, Text trên màn hình, Voice over, Phụ đề, Gợi ý B-roll, Khuyến cáo và End card theo quy chuẩn CSGT.
        </p>
      </div>

      {/* Select Article to Convert */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            Chọn bài viết từ kho để chuyển thể thành video:
          </label>
          <select
            value={currentArticleId}
            onChange={e => setCurrentArticleId(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            {articles.map(art => (
              <option key={art.id} value={art.id}>
                [{art.topic || art.article_type}] {art.title} ({new Date(art.created_at).toLocaleDateString('vi-VN')})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCopyScript}
          disabled={!script}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-950 transition-colors shrink-0"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
          {copied ? 'ĐÃ SAO CHÉP KỊCH BẢN!' : 'SAO CHÉP KỊCH BẢN ĐẦY ĐỦ'}
        </button>
      </div>

      {/* Script Timeline & Video Breakdown */}
      {isGenerating ? (
        <div className="p-16 text-center text-slate-400 text-xs">
          <span className="h-4 w-4 rounded-full border-2 border-teal-400 border-t-transparent animate-spin inline-block mr-2" />
          Đang dựng phân cảnh kịch bản video dọc 9:16...
        </div>
      ) : script ? (
        <div className="space-y-6">
          {/* Script Overview Card */}
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Thời lượng mục tiêu:</span>
                <strong className="text-teal-400 text-sm font-bold">{script.target_duration}</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Tỷ lệ khung hình:</span>
                <strong className="text-amber-400 text-sm font-bold">Dọc 9:16 (Chuẩn Di động)</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Cảnh báo hiển thị Logo:</span>
                <strong className="text-slate-200 text-xs">{script.end_card.logo_instruction}</strong>
              </div>
            </div>
          </div>

          {/* Timeline Phân cảnh */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-400" />
              CHI TIẾT PHÂN CẢNH THEO DÒNG THỜI GIAN (TIMELINE)
            </h2>

            <div className="space-y-4">
              {script.segments.map((seg, idx) => {
                const isHook = seg.phase === 'hook';
                const isRec = seg.phase === 'recommendation';

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-5 space-y-4 transition-all ${
                      isHook
                        ? 'bg-amber-950/20 border-amber-600/60'
                        : isRec
                        ? 'bg-emerald-950/20 border-emerald-600/60'
                        : 'bg-[#111827] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-teal-900 text-teal-300 font-bold text-xs">
                          {idx + 1}
                        </span>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                          CẢNH {idx + 1}: {seg.phase === 'hook' ? 'HOOK MỞ ĐẦU (0 - 3 GIÂY)' : seg.phase === 'development' ? 'DIỄN BIẾN & HOẠT ĐỘNG' : seg.phase === 'result' ? 'KẾT QUẢ XỬ LÝ' : 'THÔNG ĐIỆP KHUYẾN CÁO'}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-teal-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        ⏱️ {seg.time_range}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Left: Visual & On-screen text */}
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 block">🎬 Mô tả Cảnh quay:</span>
                          <p className="text-slate-200 leading-relaxed">{seg.scene_description}</p>
                        </div>

                        <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 space-y-1">
                          <span className="text-[11px] font-bold text-blue-400 block">📱 Chữ hiện trên màn hình (Visual Text):</span>
                          <p className="text-white font-bold tracking-wide">{seg.visual_text}</p>
                        </div>
                      </div>

                      {/* Right: Audio & Subtitle */}
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                          <span className="text-[11px] font-bold text-amber-400 block">🎙️ Lời bình đọc (Voice Over):</span>
                          <p className="text-slate-200 leading-relaxed font-serif italic">"{seg.voice_over}"</p>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 block">🎥 Gợi ý B-roll chèn thêm:</span>
                          <p className="text-slate-300">{seg.b_roll_suggestion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* End Card */}
              <div className="rounded-xl border border-teal-800/80 bg-teal-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase">
                  <Shield className="h-4 w-4" />
                  <span>CẢNH KẾT THÚC (END CARD / 00:45 - 00:50)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Slogan / Thông điệp cuối:</span>
                    <strong className="text-white text-sm">{script.end_card.text}</strong>
                  </div>
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Quy cách định vị Logo CSGT:</span>
                    <span className="text-teal-300 font-medium">{script.end_card.logo_instruction}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
