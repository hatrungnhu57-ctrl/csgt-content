'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Edit3,
  FileText,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { Article, ArticleType, SourceData, UnitProfile } from '@/lib/store/types';
import { ArticleTypeSelector } from './ArticleTypeSelector';
import { RawReportExtractor } from './RawReportExtractor';
import { ArticleDataForm } from './ArticleDataForm';
import { BlockEditor } from './BlockEditor';
import { getAIProvider } from '@/lib/ai';
import { checkArticleSimilarity } from '@/lib/guardrails/similarity';

interface ArticleWriterWorkflowProps {
  initialArticle?: Article | null;
  existingArticles: Article[];
  unit: UnitProfile;
  onSaveArticle: (article: Article) => void;
  onProceedToReview: (articleId: string) => void;
  onCancel: () => void;
}

export const ArticleWriterWorkflow: React.FC<ArticleWriterWorkflowProps> = ({
  initialArticle,
  existingArticles,
  unit,
  onSaveArticle,
  onProceedToReview,
  onCancel,
}) => {
  // Wizard steps: 1 (Type) -> 2 (Data / Raw) -> 3 (Editor / Blocks)
  const [step, setStep] = useState<1 | 2 | 3>(initialArticle ? 3 : 1);
  const [inputMode, setInputMode] = useState<'form' | 'raw_text'>('form');

  const [selectedType, setSelectedType] = useState<ArticleType>(initialArticle?.article_type || 'nong_do_con');

  const [sourceData, setSourceData] = useState<SourceData>(
    initialArticle?.source_data || {
      date: new Date().toISOString().split('T')[0],
      unit_name: unit.full_name,
      route: '',
      location: '',
      actions_taken: '',
      main_event: '',
      main_results: '',
      violations: [],
    }
  );

  const [currentArticle, setCurrentArticle] = useState<Article | null>(initialArticle || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [missingInfoError, setMissingInfoError] = useState<string[]>([]);
  const [similarityWarning, setSimilarityWarning] = useState<any>(null);

  // Handle Generating Article from Source Data
  const handleGenerateArticle = async () => {
    setIsGenerating(true);
    setMissingInfoError([]);

    try {
      const provider = getAIProvider();
      const output = await provider.generateArticle({
        source_data: sourceData,
        article_type: selectedType,
        unit_profile: unit,
      });

      if (output.status === 'NEED_INFO') {
        setMissingInfoError(output.missing_information || ['Dữ liệu chưa đủ']);
        setIsGenerating(false);
        return;
      }

      // Check similarity with older articles (Section XXVI)
      const simCheck = checkArticleSimilarity(
        { title: output.title, body: output.body, topic: selectedType },
        existingArticles
      );

      const newArticle: Article = {
        id: currentArticle?.id || `art-${Date.now()}`,
        user_id: currentArticle?.user_id || 'acc-admin',
        author_name: currentArticle?.author_name || 'Tổ công tác',
        team_id: currentArticle?.team_id,
        team_name: currentArticle?.team_name,
        unit_id: unit.id,
        title: output.title,
        sapo: output.sapo,
        body: output.body,
        recommendation: output.recommendation,
        hashtags: output.hashtags,
        article_type: selectedType,
        topic: selectedType,
        status: 'GENERATED',
        source_data: sourceData,
        source_snapshot: JSON.parse(JSON.stringify(sourceData)), // Deep snapshot
        public_content: {
          title: output.title,
          sapo: output.sapo,
          body: output.body,
          recommendation: output.recommendation,
          hashtags: output.hashtags,
        },
        similarity_warning: simCheck.isSimilar
          ? {
              similar_article_id: simCheck.similarArticle?.id || '',
              similar_title: simCheck.similarArticle?.title || '',
              similarity_percentage: simCheck.percentage,
              published_date: simCheck.similarArticle?.created_at || '',
              suggestion: simCheck.suggestion,
            }
          : undefined,
        version: 1,
        created_at: currentArticle?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCurrentArticle(newArticle);
      onSaveArticle(newArticle);
      setStep(3);
    } catch (err) {
      console.error('Lỗi sinh bài:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateArticleInEditor = (updated: Article) => {
    setCurrentArticle(updated);
    onSaveArticle(updated);
  };

  const handleExtractedFromRaw = (extracted: SourceData) => {
    setSourceData(extracted);
    setInputMode('form');
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator Header */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 text-xs font-bold ${
              step === 1 ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              1
            </span>
            <span className="hidden sm:inline">Chọn loại bài</span>
          </button>

          <span className="text-slate-700">→</span>

          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 text-xs font-bold ${
              step === 2 ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <span className="hidden sm:inline">Nhập dữ liệu nghiệp vụ</span>
          </button>

          <span className="text-slate-700">→</span>

          <button
            disabled={!currentArticle}
            onClick={() => currentArticle && setStep(3)}
            className={`flex items-center gap-2 text-xs font-bold ${
              step === 3 ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              3
            </span>
            <span className="hidden sm:inline">Biên tập khối</span>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
        >
          Hủy bỏ / Quay về
        </button>
      </div>

      {/* Step 1: Article Type Selector */}
      {step === 1 && (
        <div className="space-y-6">
          <ArticleTypeSelector
            selectedType={selectedType}
            onSelectType={type => {
              setSelectedType(type);
              setStep(2);
            }}
          />

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-950 transition-all"
            >
              TIẾP TỤC: NHẬP DỮ LIỆU SỰ VIỆC <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Input Mode Switcher (Form vs Raw Report) */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Tabs for Mode */}
          <div className="flex items-center justify-between p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-md">
            <button
              onClick={() => setInputMode('form')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                inputMode === 'form' ? 'bg-blue-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Biểu mẫu nghiệp vụ (Form)
            </button>
            <button
              onClick={() => setInputMode('raw_text')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                inputMode === 'raw_text' ? 'bg-blue-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Dán báo cáo thô (AI bóc tách)
            </button>
          </div>

          {inputMode === 'raw_text' ? (
            <RawReportExtractor
              onDataExtracted={handleExtractedFromRaw}
              onCancel={() => setInputMode('form')}
            />
          ) : (
            <ArticleDataForm
              sourceData={sourceData}
              onChange={setSourceData}
              articleType={selectedType}
            />
          )}

          {/* Missing info error alert if any */}
          {missingInfoError.length > 0 && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-700 text-xs text-red-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>AI TRẢ VỀ TRẠNG THÁI "NEED_INFO" (MỤC IV)</span>
              </div>
              <p>Hệ thống không được tự bịa dữ liệu. Vui lòng bổ sung các trường bắt buộc sau:</p>
              <ul className="list-disc pl-5 font-semibold text-white">
                {missingInfoError.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Đổi loại bài
            </button>

            <button
              onClick={handleGenerateArticle}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-950 disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  AI Đang tạo bài theo chuẩn CSGT...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  AI TẠO BÀI VIẾT (CHUẨN TUYÊN TRUYỀN)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Block Editor */}
      {step === 3 && currentArticle && (
        <div className="space-y-6">
          {/* Similarity Warning (Section XXVI) */}
          {currentArticle.similarity_warning && (
            <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-600/80 text-xs text-amber-200 space-y-2">
              <div className="font-bold flex items-center gap-2 text-amber-300">
                <ShieldAlert className="h-4 w-4" />
                <span>CẢNH BÁO TRÙNG LẶP NỘI DUNG ({currentArticle.similarity_warning.similarity_percentage}% TƯƠNG ĐỒNG)</span>
              </div>
              <p>
                Bài viết này có nội dung khá tương đồng với bài đã lưu: <strong>"{currentArticle.similarity_warning.similar_title}"</strong>.
              </p>
              <p className="text-amber-100 bg-amber-900/40 p-2 rounded border border-amber-700/40">
                💡 {currentArticle.similarity_warning.suggestion}
              </p>
            </div>
          )}

          <BlockEditor
            article={currentArticle}
            onUpdateArticle={handleUpdateArticleInEditor}
            onProceedToReview={() => onProceedToReview(currentArticle.id)}
          />
        </div>
      )}
    </div>
  );
};
