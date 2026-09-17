'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PlusCircle,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Article, TopicSuggestion, UnitProfile } from '@/lib/store/types';
import { getAIProvider } from '@/lib/ai';

interface TopicSuggestionsViewProps {
  articles: Article[];
  unit: UnitProfile;
  onUseTopic: (topic: TopicSuggestion) => void;
}

export const TopicSuggestionsView: React.FC<TopicSuggestionsViewProps> = ({
  articles,
  unit,
  onUseTopic,
}) => {
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      setIsLoading(true);
      try {
        const provider = getAIProvider();
        const results = await provider.suggestTopics(9, 2026, articles);
        setSuggestions(results);
      } catch (err) {
        console.error('Lỗi tải gợi ý:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSuggestions();
  }, [articles]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#11192e] p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800/60">
            MODULE GỢI Ý CHỦ ĐỀ TUYÊN TRUYỀN (MỤC XXVII, XXVIII)
          </span>
        </div>
        <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-400" />
          Gợi ý chủ đề đổi mới – Tránh lặp đề tài – Hoàn thành chỉ tiêu 03 bài/tháng
        </h1>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Hệ thống tự động phân tích lịch sử các bài đã viết trong tháng và các chuyên đề trọng điểm để đề xuất các góc tiếp cận mới.
          <strong className="text-white"> Tuyệt đối không tạo vụ việc giả mạo, chỉ gợi ý góc tuyên truyền và kiến thức pháp luật an toàn.</strong>
        </p>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <span className="h-4 w-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin inline-block mr-2" />
            Đang phân tích cơ cấu chủ đề và tạo gợi ý phù hợp...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug, idx) => (
              <div
                key={sug.id || idx}
                className="rounded-xl border border-slate-800 bg-[#111827] hover:border-slate-700 p-5 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      GỢI Ý #{idx + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Chuyên đề: <strong className="text-slate-200">{sug.article_type}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {sug.topic_title}
                  </h3>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="text-[11px] font-bold text-amber-400 block">Lý do đề xuất:</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{sug.reason}</p>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">Góc tiếp cận:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{sug.angle}</p>
                  </div>

                  {sug.sample_outline && sug.sample_outline.length > 0 && (
                    <div className="space-y-1 text-[11px]">
                      <span className="font-bold text-slate-400">Dàn ý gợi ý:</span>
                      <ul className="list-disc pl-4 text-slate-300 space-y-0.5">
                        {sug.sample_outline.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {sug.suggested_hashtags.map((tag, i) => (
                      <span key={i} className="text-[10px] text-blue-400 bg-slate-900 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onUseTopic(sug)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-950 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  SỬ DỤNG CHỦ ĐỀ NÀY ĐỂ VIẾT BÀI MỚI
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
