// Content Similarity Checker (Section XXVI)

import { Article } from '../store/types';

/**
 * Calculates string similarity using Jaccard token overlap
 */
function calculateJaccardSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;

  const tokenize = (t: string) =>
    t
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);

  return Math.round((intersection.size / union.size) * 100);
}

/**
 * Checks if a new draft article is overly similar to existing published or draft articles
 */
export function checkArticleSimilarity(
  newArticle: { title: string; body: string; topic?: string },
  existingArticles: Article[]
): {
  isSimilar: boolean;
  similarArticle?: Article;
  percentage: number;
  suggestion: string;
} {
  if (!existingArticles || existingArticles.length === 0) {
    return { isSimilar: false, percentage: 0, suggestion: '' };
  }

  const newText = `${newArticle.title} ${newArticle.body}`;
  let maxSimilarity = 0;
  let mostSimilarArticle: Article | undefined = undefined;

  for (const art of existingArticles) {
    const existingText = `${art.title} ${art.body}`;
    const sim = calculateJaccardSimilarity(newText, existingText);

    if (sim > maxSimilarity) {
      maxSimilarity = sim;
      mostSimilarArticle = art;
    }
  }

  if (maxSimilarity >= 50 && mostSimilarArticle) {
    let suggestion = 'Bài viết có tỷ lệ tương đồng cao với bài trước đó.';
    if (mostSimilarArticle.article_type === 'nong_do_con') {
      suggestion = 'Gợi ý: Hãy tập trung vào khía cạnh ý thức của người dân, kết quả phòng ngừa hoặc các trường hợp chấp hành tốt để làm mới bài viết.';
    } else if (mostSimilarArticle.article_type === 'hoc_sinh') {
      suggestion = 'Gợi ý: Hãy nhấn mạnh vào trách nhiệm của phụ huynh và nhà trường khi giao xe cho con em.';
    } else {
      suggestion = 'Gợi ý: Hãy thay đổi góc tiếp cận (từ góc độ bảo đảm an toàn, phòng ngừa thay vì chỉ liệt kê kết quả xử lý).';
    }

    return {
      isSimilar: true,
      similarArticle: mostSimilarArticle,
      percentage: maxSimilarity,
      suggestion,
    };
  }

  return { isSimilar: false, percentage: maxSimilarity, suggestion: '' };
}
