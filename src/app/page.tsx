'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ArticleWriterWorkflow } from '@/components/writer/ArticleWriterWorkflow';
import { ReviewScreen } from '@/components/review/ReviewScreen';
import { TopicSuggestionsView } from '@/components/topics/TopicSuggestionsView';
import { ArticleLibraryView } from '@/components/library/ArticleLibraryView';
import { VideoScriptGenerator } from '@/components/video/VideoScriptGenerator';
import { SettingsView } from '@/components/settings/SettingsView';
import { store, DEFAULT_UNIT_PROFILE, DEFAULT_USER_PROFILE } from '@/lib/store';
import { Article, MonthlyTarget, TopicSuggestion, UnitProfile, UserProfile, AuditLogEntry } from '@/lib/store/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [articles, setArticles] = useState<Article[]>([]);
  const [unitProfile, setUnitProfile] = useState<UnitProfile>(DEFAULT_UNIT_PROFILE);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [target, setTarget] = useState<MonthlyTarget>({
    id: 'tgt-2026-9',
    user_id: 'user-001',
    month: 9,
    year: 2026,
    target_count: 3,
    completed_count: 2,
    draft_count: 0,
    in_review_count: 1,
    published_count: 2,
    deadline_alert_level: 'normal',
    days_left_in_month: 13,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Active editing or reviewing article ID
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [writerInitialArticle, setWriterInitialArticle] = useState<Article | null>(null);

  // Sync state with store on mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const loadedArticles = store.getArticles();
    const loadedUnit = store.getUnitProfile();
    const loadedTarget = store.getMonthlyTarget(9, 2026);
    const loadedLogs = store.getAuditLogs();

    setArticles(loadedArticles);
    setUnitProfile(loadedUnit);
    setTarget(loadedTarget);
    setAuditLogs(loadedLogs);
  };

  const handleSaveArticle = (article: Article) => {
    store.saveArticle(article);
    refreshData();
  };

  const handleDeleteArticle = (id: string) => {
    store.deleteArticle(id);
    refreshData();
  };

  const handleSaveUnitProfile = (unit: UnitProfile) => {
    store.saveUnitProfile(unit);
    refreshData();
  };

  const handleUpdateTargetCount = (count: number) => {
    store.setTargetCount(count);
    refreshData();
  };

  const handleStartNewArticle = () => {
    setWriterInitialArticle(null);
    setSelectedArticleId(null);
    setActiveTab('writer');
  };

  const handleEditArticle = (id: string) => {
    const art = store.getArticleById(id);
    if (art) {
      setWriterInitialArticle(art);
      setSelectedArticleId(id);
      setActiveTab('writer');
    }
  };

  const handleOpenReview = (id?: string) => {
    const targetId = id || selectedArticleId || articles[0]?.id;
    if (targetId) {
      setSelectedArticleId(targetId);
      setActiveTab('review');
    }
  };

  const handleMarkPublished = (publishedUrl?: string) => {
    if (!selectedArticleId) return;
    const art = store.getArticleById(selectedArticleId);
    if (art) {
      const updated: Article = {
        ...art,
        status: 'PUBLISHED',
        published_at: new Date().toISOString(),
        published_url: publishedUrl || art.published_url || 'https://facebook.com/csgt.tracu/posts/' + Date.now(),
      };
      store.saveArticle(updated);
      store.addAuditLog({
        id: `log-${Date.now()}`,
        user_id: userProfile.id,
        user_name: userProfile.name,
        article_id: updated.id,
        action: 'ARTICLE_PUBLISHED',
        description: `Đã xuất bản bài viết: "${updated.title}"`,
        timestamp: new Date().toISOString(),
      });
      refreshData();
      setActiveTab('dashboard');
    }
  };

  const handleUseTopicSuggestion = (sug: TopicSuggestion) => {
    const newArt: Article = {
      id: `art-${Date.now()}`,
      user_id: userProfile.id,
      unit_id: unitProfile.id,
      title: sug.topic_title,
      sapo: sug.angle,
      body: '',
      recommendation: '',
      hashtags: sug.suggested_hashtags,
      article_type: sug.article_type,
      topic: sug.topic_title,
      status: 'DRAFT',
      source_data: {
        date: new Date().toISOString().split('T')[0],
        unit_name: unitProfile.full_name,
        main_event: sug.angle,
        actions_taken: sug.angle,
        main_results: '',
        violations: [],
      },
      source_snapshot: {
        date: new Date().toISOString().split('T')[0],
        unit_name: unitProfile.full_name,
        main_event: sug.angle,
        actions_taken: sug.angle,
        main_results: '',
        violations: [],
      },
      public_content: {
        title: sug.topic_title,
        sapo: sug.angle,
        body: '',
        recommendation: '',
        hashtags: sug.suggested_hashtags,
      },
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setWriterInitialArticle(newArt);
    setSelectedArticleId(newArt.id);
    setActiveTab('writer');
  };

  const pendingReviewCount = articles.filter(
    a => a.status === 'NEEDS_REVIEW' || a.status === 'GENERATED'
  ).length;

  const draftCount = articles.filter(a => a.status === 'DRAFT').length;
  const currentReviewArticle = articles.find(a => a.id === selectedArticleId) || articles[0];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      <Navbar
        unit={unitProfile}
        user={userProfile}
        target={target}
        activeTab={activeTab}
        onNavigate={tab => setActiveTab(tab)}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          onNavigate={tab => {
            if (tab === 'writer') {
              setWriterInitialArticle(null);
            }
            setActiveTab(tab);
          }}
          pendingReviewCount={pendingReviewCount}
          draftCount={draftCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              target={target}
              articles={articles}
              unit={unitProfile}
              user={userProfile}
              onNavigate={(tab, id) => {
                if (id) setSelectedArticleId(id);
                setActiveTab(tab);
              }}
              onNewArticle={handleStartNewArticle}
            />
          )}

          {activeTab === 'writer' && (
            <ArticleWriterWorkflow
              initialArticle={writerInitialArticle}
              existingArticles={articles}
              unit={unitProfile}
              onSaveArticle={handleSaveArticle}
              onProceedToReview={id => {
                setSelectedArticleId(id);
                setActiveTab('review');
              }}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'review' && currentReviewArticle && (
            <ReviewScreen
              article={currentReviewArticle}
              onUpdateArticle={handleSaveArticle}
              onMarkPublished={handleMarkPublished}
              onBackToEdit={() => handleEditArticle(currentReviewArticle.id)}
            />
          )}

          {activeTab === 'topics' && (
            <TopicSuggestionsView
              articles={articles}
              unit={unitProfile}
              onUseTopic={handleUseTopicSuggestion}
            />
          )}

          {activeTab === 'library' && (
            <ArticleLibraryView
              articles={articles}
              onOpenArticle={handleOpenReview}
              onEditArticle={handleEditArticle}
              onGenerateVideo={id => {
                setSelectedArticleId(id);
                setActiveTab('video');
              }}
              onDeleteArticle={handleDeleteArticle}
            />
          )}

          {activeTab === 'video' && (
            <VideoScriptGenerator
              articles={articles}
              selectedArticleId={selectedArticleId || undefined}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              unit={unitProfile}
              user={userProfile}
              target={target}
              auditLogs={auditLogs}
              onSaveUnitProfile={handleSaveUnitProfile}
              onUpdateTargetCount={handleUpdateTargetCount}
            />
          )}
        </main>
      </div>
    </div>
  );
}
