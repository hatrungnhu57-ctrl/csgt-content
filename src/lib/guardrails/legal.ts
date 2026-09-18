// Legal Verification Guardrail (Section XVIII, XX)
// Updated with Nghị định 168/2024/NĐ-CP & Nghị định 238/2026/NĐ-CP

import { LegalReviewResult, SourceData } from '../store/types';

/**
 * Known valid traffic decree references in Vietnam
 */
export const VALID_TRAFFIC_DECREES = [
  '168/2024/NĐ-CP',
  '238/2026/NĐ-CP',
  '100/2019/NĐ-CP',
  '123/2021/NĐ-CP',
  'NĐ 168/2024',
  'NĐ 238/2026',
  'Nghị định 168/2024/NĐ-CP',
  'Nghị định 238/2026/NĐ-CP',
  'Luật Trật tự, an toàn giao thông đường bộ',
];

/**
 * Checks that all legal references and penalties mentioned in the article
 * are marked as VERIFIED. Unverified references are strictly flagged.
 */
export function reviewArticleLegal(sourceData: SourceData, articleText: string): LegalReviewResult {
  const unverified: string[] = [];
  const verified: string[] = [];
  const warnings: string[] = [];

  // Check violations in source_data
  if (sourceData.violations && sourceData.violations.length > 0) {
    sourceData.violations.forEach(v => {
      if (v.legal_reference || v.penalty) {
        const desc = `${v.violation_name}: ${v.legal_reference || ''} (${v.penalty || 'Chưa rõ mức phạt'})`;
        if (v.verified) {
          verified.push(desc);
        } else {
          unverified.push(desc);
          warnings.push(`Căn cứ pháp lý hoặc mức phạt cho hành vi "${v.violation_name}" chưa được đánh dấu VERIFIED.`);
        }
      }
    });
  }

  // Check if article text contains unverified keywords or un-sourced Decree numbers
  const decreePattern = /Nghị định(?:\s+số)?\s+[0-9/]+(?:\/[A-Z-]+)?|NĐ\s+[0-9/]+/gi;
  const matches = articleText.match(decreePattern);
  if (matches) {
    matches.forEach(m => {
      const isKnownVerified = verified.some(v => v.toLowerCase().includes(m.toLowerCase()));
      if (!isKnownVerified) {
        warnings.push(`Văn bản có nhắc đến "${m}" nhưng chưa được đối chiếu trong hồ sơ pháp lý xác minh.`);
      }
    });
  }

  const is_valid = unverified.length === 0 && warnings.length === 0;

  return {
    is_valid,
    unverified_references: unverified,
    verified_references: verified,
    warnings,
  };
}
