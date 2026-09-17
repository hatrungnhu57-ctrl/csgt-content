// Unit Name Guardrail (Section XVII)

import { UnitNameReviewResult } from '../store/types';

const INTERNAL_ABBREVIATIONS = [
  { code: 'C08', suggestion: 'Cục Cảnh sát giao thông' },
  { code: 'PC08', suggestion: 'Phòng Cảnh sát giao thông' },
  { code: 'Phòng 6', suggestion: 'Phòng Hướng dẫn tuần tra, kiểm soát giao thông đường bộ' },
  { code: 'Đội 6', suggestion: 'Đội Tuần tra kiểm soát giao thông' },
  { code: 'CAND', suggestion: 'Công an nhân dân' },
];

/**
 * Checks for proper unit name conventions:
 * 1. "Cảnh sát giao thông" must be written in full at its first occurrence.
 * 2. Internal shorthand codes (C08, PC08, Phòng 6...) must not be published directly without full name.
 */
export function reviewUnitNames(articleText: string): UnitNameReviewResult {
  const warnings: string[] = [];
  const detectedAbbreviations: string[] = [];

  // Check internal abbreviations
  INTERNAL_ABBREVIATIONS.forEach(abbr => {
    const regex = new RegExp(`\\b${abbr.code}\\b`, 'g');
    if (regex.test(articleText)) {
      detectedAbbreviations.push(abbr.code);
      warnings.push(`Ký hiệu nội bộ "${abbr.code}" xuất hiện trong bài. Cần viết đầy đủ "${abbr.suggestion}" trước công chúng.`);
    }
  });

  // Check first occurrence of CSGT vs Cảnh sát giao thông
  const csgtIndex = articleText.search(/\bCSGT\b/);
  const fullCSGTIndex = articleText.search(/Cảnh sát giao thông/i);

  let first_occurrence_full = true;
  if (csgtIndex !== -1) {
    if (fullCSGTIndex === -1 || csgtIndex < fullCSGTIndex) {
      first_occurrence_full = false;
      warnings.push('Cụm từ "Cảnh sát giao thông" phải được viết đầy đủ ở lần đầu tiên xuất hiện trước khi viết tắt "CSGT".');
    }
  }

  const is_valid = warnings.length === 0;

  return {
    is_valid,
    warnings,
    first_occurrence_full,
    abbreviations_detected: detectedAbbreviations,
  };
}
