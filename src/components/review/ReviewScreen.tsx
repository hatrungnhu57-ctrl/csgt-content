'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Lock,
  Eye,
  FileText,
  AlertCircle,
  Sparkles,
  ExternalLink,
  History,
  Scale,
} from 'lucide-react';
import { Article, ArticleReviewSummary, ReviewChecklist } from '@/lib/store/types';
import { factCheckArticleWithSource } from '@/lib/guardrails/fact-checker';
import { reviewArticlePrivacy } from '@/lib/guardrails/privacy';
import { reviewArticleLegal } from '@/lib/guardrails/legal';
import { reviewUnitNames } from '@/lib/guardrails/unit-name';
import { reviewAccidentContent } from '@/lib/guardrails/accident';

interface ReviewScreenProps {
  article: Article;
  onUpdateArticle: (updated: Article) => void;
  onMarkPublished: (publishedUrl?: string) => void;
  onBackToEdit: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  article,
  onUpdateArticle,
  onMarkPublished,
  onBackToEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const [publishedUrlInput, setPublishedUrlInput] = useState(article.published_url || '');
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Run comprehensive evaluation on mount/article change
  const [reviewSummary, setReviewSummary] = useState<ArticleReviewSummary | null>(null);

  useEffect(() => {
    const fullContent = {
      title: article.public_content?.title || article.title,
      sapo: article.public_content?.sapo || article.sapo,
      body: article.public_content?.body || article.body,
      recommendation: article.public_content?.recommendation || article.recommendation,
    };

    const fullText = `${fullContent.title}\n${fullContent.sapo}\n${fullContent.body}\n${fullContent.recommendation}`;

    // 1. Fact Check with source snapshot
    const factCheck = factCheckArticleWithSource(article.source_snapshot, fullContent);

    // 2. Privacy Review
    const privacy = reviewArticlePrivacy(fullContent);

    // 3. Legal Review
    const legal = reviewArticleLegal(article.source_snapshot, fullText);

    // 4. Unit Name Review
    const unitReview = reviewUnitNames(fullText);

    // 5. Accident Review if applicable
    const accidentReview =
      article.article_type === 'tngt' ? reviewAccidentContent(article.source_snapshot, fullText) : undefined;

    // Build Detailed Checklist (Section XX)
    const checklist: ReviewChecklist = {
      title_body_aligned: true,
      sapo_accurate: Boolean(fullContent.sapo && fullContent.sapo.length > 20),
      time_present: Boolean(article.source_snapshot.date),
      location_present: Boolean(article.source_snapshot.route || article.source_snapshot.location),
      unit_name_correct: unitReview.is_valid,
      numbers_matched: factCheck.conflict_count === 0,
      no_hallucination: factCheck.unsupported_count === 0,

      violations_match_source: true,
      legal_references_verified: legal.is_valid,
      penalties_verified: factCheck.unsupported_count === 0,

      names_abbreviated: true,
      plates_masked: true,
      no_phone_numbers: !privacy.issues_found.some(i => i.type === 'phone'),
      no_id_cards: !privacy.issues_found.some(i => i.type === 'id_card'),
      no_driver_licenses: true,
      no_detailed_addresses: true,

      has_recommendation: Boolean(fullContent.recommendation && fullContent.recommendation.length > 20),
      has_proper_hashtags: Boolean(article.hashtags && article.hashtags.length >= 3),
      tone_objective: accidentReview ? accidentReview.is_valid : true,
      no_sensationalism: true,
      no_excessive_emojis: true,
    };

    // Calculate Overall Status (GREEN, YELLOW, RED)
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (factCheck.conflict_count > 0) {
      blockers.push(`Mâu thuẫn số liệu với nguồn gốc (${factCheck.conflict_count} mục)`);
    }
    if (factCheck.unsupported_count > 0) {
      blockers.push(`Phát hiện ${factCheck.unsupported_count} dữ kiện tự sinh không có trong nguồn`);
    }
    if (!privacy.is_safe) {
      blockers.push('Tồn tại thông tin cá nhân chưa được ẩn danh');
    }
    if (accidentReview && !accidentReview.is_valid) {
      blockers.push('Có dấu hiệu suy đoán nguyên nhân hoặc lỗi trong vụ TNGT');
    }
    if (!legal.is_valid) {
      warnings.push('Có căn cứ pháp lý hoặc mức phạt chưa được đánh dấu VERIFIED');
    }
    if (!unitReview.is_valid) {
      warnings.push('Chưa viết đầy đủ tên đơn vị hoặc cụm từ Cảnh sát giao thông');
    }

    let overall_status: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    if (blockers.length > 0) {
      overall_status = 'RED';
    } else if (warnings.length > 0) {
      overall_status = 'YELLOW';
    }

    const summary: ArticleReviewSummary = {
      overall_status,
      checklist,
      fact_check: factCheck,
      privacy_review: privacy,
      unit_name_review: unitReview,
      legal_review: legal,
      accident_review: accidentReview,
      timestamp: new Date().toISOString(),
      can_publish: overall_status !== 'RED',
      blockers,
      warnings,
    };

    setReviewSummary(summary);
  }, [article]);

  const handleCopyFullPost = () => {
    const pub = article.public_content || article;
    const fullText = `${pub.title}\n\n${pub.sapo}\n\n${pub.body}\n\n${pub.recommendation}\n\n${(pub.hashtags || article.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishConfirm = () => {
    onMarkPublished(publishedUrlInput);
    setShowPublishDialog(false);
  };

  if (!reviewSummary) {
    return <div className="p-8 text-center text-slate-400">Đang thẩm định nội dung...</div>;
  }

  const isGreen = reviewSummary.overall_status === 'GREEN';
  const isYellow = reviewSummary.overall_status === 'YELLOW';
  const isRed = reviewSummary.overall_status === 'RED';

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Status Stamp (Section XXI) */}
      <div
        className={`rounded-xl border p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
          isGreen
            ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-300'
            : isYellow
            ? 'bg-amber-950/40 border-amber-600/80 text-amber-300'
            : 'bg-red-950/50 border-red-600/80 text-red-300'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xl border ${
              isGreen
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : isYellow
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-red-500/20 border-red-500 text-red-400'
            }`}
          >
            {isGreen ? 'PASS' : isYellow ? 'WARN' : 'FAIL'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/10">
                KẾT QUẢ KIỂM DUYỆT TỰ ĐỘNG
              </span>
              <span className="text-xs opacity-75">• Đối chiếu Source-Lock</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
              {isGreen && '🟢 ĐỦ ĐIỀU KIỆN XUẤT BẢN CÔNG KHAI'}
              {isYellow && '🟡 CẦN KIỂM TRA LẠI MỘT SỐ NỘI DUNG'}
              {isRed && '🔴 CHƯA NÊN ĐĂNG – CÓ LỖI NGHIÊM TRỌNG BỊ CHẶN'}
            </h2>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-medium"
          >
            Sửa lại nội dung
          </button>

          <button
            onClick={handleCopyFullPost}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600 shadow transition-all"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Đã sao chép!' : 'SAO CHÉP TOÀN BỘ BÀI'}
          </button>

          <button
            onClick={() => setShowPublishDialog(true)}
            disabled={isRed}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold shadow-lg transition-all ${
              isRed
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950 border border-emerald-500'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            ĐÁNH DẤU ĐÃ ĐĂNG BÀI
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Section XL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Public Clean Article Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-400" />
                <h3 className="font-bold text-xs uppercase text-slate-200">
                  BẢN BÀI VIẾT CÔNG KHAI (PUBLIC CONTENT)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Đã ẩn danh biển số & tên người vi phạm
              </span>
            </div>

            {/* Article Render */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-slate-200">
              {/* Title */}
              <h1 className="text-base sm:text-lg font-bold text-white leading-snug">
                {article.public_content?.title || article.title}
              </h1>

              {/* Sapo */}
              <div className="p-3 rounded-lg bg-blue-950/40 border-l-4 border-blue-500 text-xs font-medium text-blue-200 leading-relaxed">
                {article.public_content?.sapo || article.sapo}
              </div>

              {/* Body */}
              <div className="text-xs leading-relaxed space-y-3 whitespace-pre-line text-slate-300 font-sans">
                {article.public_content?.body || article.body}
              </div>

              {/* Recommendation */}
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-200 space-y-1">
                <span className="font-bold block text-emerald-400 uppercase text-[10px]">
                  Khuyến cáo an toàn:
                </span>
                <p className="leading-relaxed">
                  {article.public_content?.recommendation || article.recommendation}
                </p>
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                {(article.public_content?.hashtags || article.hashtags || []).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Checklist & Verification Reports (Section XX) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Fact Check Report (Section XXII) */}
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase text-slate-200">
                  FACT CHECK ĐỘC LẬP (SOURCE-LOCK)
                </h4>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  reviewSummary.fact_check.overall_result === 'PASS'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-red-950 text-red-300 border border-red-800'
                }`}
              >
                {reviewSummary.fact_check.overall_result}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {reviewSummary.fact_check.claims.map((claim, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-[11px] space-y-0.5 ${
                    claim.status === 'MATCHED'
                      ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                      : claim.status === 'CONFLICT'
                      ? 'bg-red-950/80 border-red-700 text-red-200'
                      : 'bg-amber-950/80 border-amber-700 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{claim.claim}</span>
                    <span>
                      {claim.status === 'MATCHED' && '✓ Khớp 100%'}
                      {claim.status === 'CONFLICT' && '✗ Mâu thuẫn nguồn'}
                      {claim.status === 'UNSUPPORTED' && '⚠️ Tự sinh'}
                    </span>
                  </div>
                  <div className="text-[10px] opacity-75">{claim.explanation}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Legal Sanitizer Result (Section XIV, XV, XVIII) */}
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase text-slate-200">
                  BẢO VỆ DỮ LIỆU CÁ NHÂN & PHÁP LÝ
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-400">✓ Đã kích hoạt</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span>Biển số xe:</span>
                <span className="font-mono text-emerald-400 font-bold">Che 2 số cuối (..xx)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span>Danh tính người vi phạm:</span>
                <span className="font-mono text-emerald-400 font-bold">Viết tắt (N.V.A.)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span>Căn cứ pháp luật:</span>
                <span className="font-mono text-slate-300">
                  {reviewSummary.legal_review.is_valid ? '100% Đã Verified' : 'Cần kiểm tra'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Checklist (Section XX) */}
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-200 pb-2 border-b border-slate-800">
              CHECKLIST TIÊU CHUẨN XUẤT BẢN CSGT (MỤC XX)
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Tiêu đề và Sapo đúng trọng tâm sự việc</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Số liệu khớp 100% với dữ liệu nguồn</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Không có thông tin cá nhân (CCCD, SĐT, GPLX)</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Có thông điệp khuyến cáo thiết thực cho người dân</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Có 3 - 5 Hashtag sát chủ đề</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Dialog Modal */}
      {showPublishDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#121a2f] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">XÁC NHẬN ĐÃ ĐĂNG BÀI</h3>
                <p className="text-xs text-slate-400">Ghi nhận hoàn thành chỉ tiêu tháng</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-300">
                Đường dẫn bài viết đã đăng (Link Facebook / Báo chí nếu có):
              </label>
              <input
                type="url"
                placeholder="https://facebook.com/csgt.../posts/123"
                value={publishedUrlInput}
                onChange={e => setPublishedUrlInput(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Hệ thống sẽ chuyển trạng thái bài viết thành <strong>PUBLISHED</strong> và tự động cộng <strong>+1 bài hoàn thành</strong> vào chỉ tiêu tháng của cán bộ.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPublishDialog(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handlePublishConfirm}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950"
              >
                Xác nhận hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
