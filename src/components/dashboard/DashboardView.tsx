'use client';

import React from 'react';
import {
  PlusCircle,
  Sparkles,
  Archive,
  Video,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileCheck,
  FileEdit,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { Article, MonthlyTarget, UnitProfile, UserProfile } from '@/lib/store/types';

interface DashboardViewProps {
  target: MonthlyTarget;
  articles: Article[];
  unit: UnitProfile;
  user: UserProfile;
  onNavigate: (tab: string, contextId?: string) => void;
  onNewArticle: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  target,
  articles,
  unit,
  user,
  onNavigate,
  onNewArticle,
}) => {
  const currentMonthArticles = articles.filter(a => {
    const d = new Date(a.created_at || a.published_at || Date.now());
    return d.getMonth() + 1 === target.month && d.getFullYear() === target.year;
  });

  const recentArticles = [...articles].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 8);

  // Group by topics
  const topicDistribution: Record<string, number> = {
    'Nồng độ cồn': 0,
    'Tốc độ': 0,
    'Học sinh': 0,
    'Xe tải': 0,
    'Xe khách': 0,
    'ATGT': 0,
    'Hỗ trợ người dân': 0,
    'Tai nạn giao thông': 0,
    'Khác': 0,
  };

  articles.forEach(a => {
    switch (a.article_type) {
      case 'nong_do_con':
        topicDistribution['Nồng độ cồn']++;
        break;
      case 'toc_do':
        topicDistribution['Tốc độ']++;
        break;
      case 'hoc_sinh':
        topicDistribution['Học sinh']++;
        break;
      case 'xe_tai':
        topicDistribution['Xe tải']++;
        break;
      case 'xe_khach':
        topicDistribution['Xe khách']++;
        break;
      case 'ho_tro_dan':
      case 'guong_tot':
        topicDistribution['Hỗ trợ người dân']++;
        break;
      case 'tngt':
        topicDistribution['Tai nạn giao thông']++;
        break;
      case 'tuyen_truyen':
      case 'canh_bao':
        topicDistribution['ATGT']++;
        break;
      default:
        topicDistribution['Khác']++;
    }
  });

  const completionPct = Math.min(100, Math.round((target.completed_count / target.target_count) * 100));
  const missingCount = Math.max(0, target.target_count - target.completed_count);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Monthly Target & Deadline Alert (Section VI) */}
      <div className="rounded-xl border border-slate-800 bg-[#11192e] p-6 shadow-lg relative overflow-hidden">
        {/* Background gradient banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-500" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/50">
                CHỈ TIÊU CÔNG TÁC THÁNG {target.month < 10 ? `0${target.month}` : target.month}/{target.year}
              </span>
              <span className="text-xs text-slate-400">
                • Cán bộ: <span className="font-semibold text-slate-200">{user.name}</span> ({unit.short_name})
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-black tracking-tight text-white">
                Tiến độ: <span className="text-amber-400">{target.completed_count}</span> / {target.target_count} tin bài
              </h1>
              <span className="text-sm text-slate-400">({completionPct}% hoàn thành)</span>
            </div>

            {/* Warning Message based on date */}
            {missingCount > 0 ? (
              <div
                className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border ${
                  target.deadline_alert_level === 'urgent_warning'
                    ? 'bg-red-950/80 border-red-700 text-red-300'
                    : target.deadline_alert_level === 'mild_warning'
                    ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                    : 'bg-blue-950/50 border-blue-800/60 text-blue-300'
                }`}
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {target.deadline_alert_level === 'urgent_warning' ? (
                    <strong>CẢNH BÁO KHẨN: Sắp kết thúc tháng! Tháng này còn thiếu {missingCount} tin/bài để hoàn thành chỉ tiêu.</strong>
                  ) : target.deadline_alert_level === 'mild_warning' ? (
                    <span>Nhắc nhở: Đã qua ngày 20 của tháng, cán bộ còn thiếu {missingCount} tin/bài để đạt chỉ tiêu giao.</span>
                  ) : (
                    <span>Tháng này còn thiếu {missingCount} tin/bài (còn {target.days_left_in_month} ngày).</span>
                  )}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Xuất sắc! Cán bộ đã hoàn thành 100% chỉ tiêu tin bài tuyên truyền của tháng {target.month}/{target.year}.</span>
              </div>
            )}
          </div>

          {/* Progress Bar & Breakdown */}
          <div className="lg:w-80 space-y-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span>Tiến độ thực hiện</span>
              <span className="font-bold text-amber-400">{target.completed_count}/{target.target_count} bài</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionPct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-blue-500 to-amber-500'
                }`}
                style={{ width: `${completionPct}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[11px] border-t border-slate-800/80">
              <div>
                <div className="text-emerald-400 font-bold text-sm">{target.published_count}</div>
                <div className="text-slate-400">Đã đăng</div>
              </div>
              <div>
                <div className="text-amber-400 font-bold text-sm">{target.in_review_count}</div>
                <div className="text-slate-400">Chờ duyệt</div>
              </div>
              <div>
                <div className="text-slate-300 font-bold text-sm">{target.draft_count}</div>
                <div className="text-slate-400">Bản nháp</div>
              </div>
              <div>
                <div className="text-rose-400 font-bold text-sm">{missingCount}</div>
                <div className="text-slate-400">Còn thiếu</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Buttons (Section VI.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={onNewArticle}
          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-950/50 transition-all group border border-blue-600/40"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">+ VIẾT TIN/BÀI MỚI</div>
              <div className="text-[11px] text-blue-200">Soạn theo quy chuẩn CSGT</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-blue-300 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => onNavigate('topics')}
          className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-amber-500/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-slate-100">GỢI Ý CHỦ ĐỀ</div>
              <div className="text-[11px] text-slate-400">Tránh viết trùng lặp</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => onNavigate('library')}
          className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Archive className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-slate-100">KHO TIN BÀI</div>
              <div className="text-[11px] text-slate-400">{articles.length} bài đã lưu trữ</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => onNavigate('video')}
          className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-teal-500/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="h-5 w-5 text-teal-400" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-slate-100">TẠO KỊCH BẢN VIDEO</div>
              <div className="text-[11px] text-slate-400">Chuẩn dọc 9:16 (TikTok/Reels)</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 3. Grid: Recent Articles & Topic Diversity Warning (Section VI.4 & VI.5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Articles */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-400" />
              <h2 className="font-bold text-slate-200 text-sm">Các bài viết gần đây ({recentArticles.length})</h2>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              Xem toàn bộ kho bài <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentArticles.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Chưa có bài viết nào. Hãy bấm <strong>+ Viết tin/bài mới</strong> để bắt đầu.
              </div>
            ) : (
              recentArticles.map(art => {
                const isPublished = art.status === 'PUBLISHED';
                const isApproved = art.status === 'APPROVED';
                const isReview = art.status === 'NEEDS_REVIEW' || art.status === 'GENERATED';

                return (
                  <div
                    key={art.id}
                    onClick={() => onNavigate('review', art.id)}
                    className="p-3.5 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isPublished
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : isApproved
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                              : isReview
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isPublished
                            ? 'Đã đăng'
                            : isApproved
                            ? 'Đã duyệt'
                            : isReview
                            ? 'Chờ kiểm duyệt'
                            : 'Bản nháp'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 truncate">
                          Chuyên đề: <strong className="text-slate-300">{art.topic || 'TTATGT'}</strong>
                        </span>
                        <span className="text-[11px] text-slate-500">• {new Date(art.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <h3 className="text-xs font-semibold text-slate-100 truncate hover:text-blue-300">
                        {art.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {art.sapo || art.body}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('writer', art.id);
                        }}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Chỉnh sửa bài"
                      >
                        <FileEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('video', art.id);
                        }}
                        className="p-1.5 rounded bg-blue-950/60 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-800/50"
                        title="Tạo video 9:16"
                      >
                        <Video className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Topic Distribution & Anti-Repetition Detector (Section VI.5) */}
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-slate-200 text-sm">Cơ cấu chủ đề đã viết</h2>
              <p className="text-[11px] text-slate-400">Kiểm soát tần suất để tránh lặp đề tài</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(topicDistribution).map(([topic, count]) => {
              const maxVal = Math.max(1, ...Object.values(topicDistribution));
              const pct = Math.round((count / maxVal) * 100);
              const isOverwritten = count >= 3 && count === maxVal;

              return (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      {topic}
                      {isOverwritten && (
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800/60">
                          Viết nhiều
                        </span>
                      )}
                    </span>
                    <span className="text-slate-400 font-bold">{count} bài</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isOverwritten ? 'bg-amber-500' : count > 0 ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diversity Suggestion Box */}
          <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-700/50 space-y-1.5 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Gợi ý cân đối chuyên đề</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Tháng này đơn vị đã viết tốt về <strong className="text-white">Nồng độ cồn</strong> và <strong className="text-white">Tốc độ</strong>.
              Nên ưu tiên thêm 01 bài về <strong className="text-amber-300">An toàn giao thông lứa tuổi học sinh</strong> hoặc <strong className="text-amber-300">Hỗ trợ nhân dân</strong> để hoàn thiện chỉ tiêu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
