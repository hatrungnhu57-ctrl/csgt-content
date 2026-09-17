// AI Provider Abstraction Interface (Section XLVI, XLVII)

import {
  Article,
  ArticleReviewSummary,
  FactCheckResult,
  PrivacyReviewResult,
  SourceData,
  TopicSuggestion,
  VideoScript,
} from '../store/types';
import { GenerateArticleInput, GeneratedArticleOutput } from './prompts/article';

export interface AIProvider {
  name: string;

  /**
   * Generates a structured traffic safety propaganda article strictly based on SourceData
   */
  generateArticle(input: GenerateArticleInput): Promise<GeneratedArticleOutput>;

  /**
   * Extracts structured data from raw patrol reports or notes
   */
  extractData(rawText: string): Promise<SourceData>;

  /**
   * Independently fact checks generated content against source snapshot
   */
  factCheck(sourceSnapshot: SourceData, article: { title: string; sapo: string; body: string; recommendation: string }): Promise<FactCheckResult>;

  /**
   * Performs privacy review, scans for sensitive personal data
   */
  privacyReview(content: { title: string; sapo: string; body: string; recommendation: string }): Promise<PrivacyReviewResult>;

  /**
   * Suggests topics based on monthly target and writing history
   */
  suggestTopics(month: number, year: number, historyArticles: Article[]): Promise<TopicSuggestion[]>;

  /**
   * Converts an approved article into a 9:16 short video script
   */
  generateVideoScript(article: Article): Promise<VideoScript>;

  /**
   * Rewrites a specific section with controlled tone without altering facts
   */
  rewriteContent(params: {
    sectionText: string;
    action: 'shorter' | 'formal' | 'journalistic' | 'friendly' | 'focus_awareness' | 'focus_result' | 'three_titles';
    sourceData: SourceData;
  }): Promise<{ rewrittenText: string; alternatives?: string[] }>;
}
