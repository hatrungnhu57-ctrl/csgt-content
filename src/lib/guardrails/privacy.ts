// Privacy Guardrail & Sanitizer (Section XIV, XV, XVI, XLIX)

import { PrivacyReviewResult, PrivacySanitizeIssue } from '../store/types';

// Regex for Vietnamese License plates:
// e.g. 84H1-123.45, 51A-987.65, 29B1-567.89, 60C-123.45, 84A-012.34, 84H1-12345
const LICENSE_PLATE_REGEX = /\b(\d{2}[A-Z]{1,2}\d?[-.\s]?\d{3})[.\s]?(\d{2})\b/gi;
const GENERAL_PLATE_REGEX = /\b([0-9]{2}[A-Z][0-9A-Z]?[-.\s]?[0-9]{3}[.-]?[0-9]{2})\b/gi;

// Phone number regex (Vietnam 10-11 digits)
const PHONE_REGEX = /(?:\+84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}\b/g;

// CCCD / CMND regex (9 or 12 digits)
const ID_CARD_REGEX = /\b(?:\d{9}|\d{12})\b/g;

// Common Vietnamese Full Name Pattern detector (Họ + Đệm + Tên)
const VIETNAMESE_NAMES_PATTERN = /\b(Nguyễn|Trần|Lê|Phạm|Hoàng|Huỳnh|Phan|Vũ|Võ|Đặng|Bùi|Đỗ|Hồ|Ngô|Dương|Lý|Đinh|Đoàn|Lâm|Trịnh|Mai|Đào|Cao|Hà)\s+([A-ZÀ-Ỹa-zà-ỹ]+(?:\s+[A-ZÀ-Ỹa-zà-ỹ]+)*)\b/g;

/**
 * Abbreviate Vietnamese Full Name:
 * "Nguyễn Văn An" -> "N.V.A."
 * "Trần Thị Bích Ngọc" -> "T.T.B.N."
 */
export function abbreviateVietnameseName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') return '';
  const words = fullName.trim().split(/\s+/);
  if (words.length < 2) return fullName;

  // Format each word as uppercase first letter + dot
  return words.map(w => w.charAt(0).toUpperCase() + '.').join('');
}

/**
 * Mask License Plate:
 * Replace last 2 digits with "xx"
 * "84H1-123.45" -> "84H1-123.xx"
 * "51A-987.65" -> "51A-987.xx"
 */
export function maskLicensePlate(plate: string): string {
  if (!plate) return '';
  // Pattern match last 2 digits
  return plate.replace(/(\d{2})$/, 'xx').replace(/(\d)\.(\d{2})$/, '$1.xx');
}

/**
 * Sanitizes text according to CSGT public safety rules
 */
export function sanitizePublicText(text: string): { sanitizedText: string; issues: PrivacySanitizeIssue[] } {
  if (!text) return { sanitizedText: '', issues: [] };

  const issues: PrivacySanitizeIssue[] = [];
  let sanitized = text;

  // 1. Sanitize License Plates
  sanitized = sanitized.replace(LICENSE_PLATE_REGEX, (match, prefix, suffix) => {
    const masked = `${prefix}.xx`.replace(/[-.\s]+\.xx/, '.xx');
    const cleanMasked = match.slice(0, -2) + 'xx';
    issues.push({
      type: 'license_plate',
      original_text: match,
      sanitized_text: cleanMasked,
      description: `Biển số phương tiện [${match}] đã được che 2 ký tự cuối thành [${cleanMasked}]`,
    });
    return cleanMasked;
  });

  // 2. Detect & Warn on Phone numbers
  const phoneMatches = sanitized.match(PHONE_REGEX);
  if (phoneMatches) {
    phoneMatches.forEach(phone => {
      issues.push({
        type: 'phone',
        original_text: phone,
        sanitized_text: '[SỐ ĐIỆN THOẠI ĐÃ ẨN]',
        description: `Phát hiện số điện thoại cá nhân [${phone}] trong văn bản`,
      });
      sanitized = sanitized.replace(phone, '09xx.xxx.xxx');
    });
  }

  // 3. Detect & Warn on CCCD / CMND
  const cccdMatches = sanitized.match(ID_CARD_REGEX);
  if (cccdMatches) {
    cccdMatches.forEach(idNum => {
      // Filter out common numbers like years 2026, counts 1234, etc.
      if (idNum.length === 12 || (idNum.length === 9 && !['100000000'].includes(idNum))) {
        issues.push({
          type: 'id_card',
          original_text: idNum,
          sanitized_text: '[SỐ ĐỊNH DANH ĐÃ ẨN]',
          description: `Phát hiện số CCCD/CMND cá nhân [${idNum}]`,
        });
        sanitized = sanitized.replace(idNum, 'xxxxxxxxxxxx');
      }
    });
  }

  return { sanitizedText: sanitized, issues };
}

/**
 * Complete Privacy Review for an Article
 */
export function reviewArticlePrivacy(content: {
  title: string;
  sapo: string;
  body: string;
  recommendation: string;
}): PrivacyReviewResult {
  const allIssues: PrivacySanitizeIssue[] = [];

  const titleSanitized = sanitizePublicText(content.title);
  const sapoSanitized = sanitizePublicText(content.sapo);
  const bodySanitized = sanitizePublicText(content.body);
  const recSanitized = sanitizePublicText(content.recommendation);

  allIssues.push(...titleSanitized.issues, ...sapoSanitized.issues, ...bodySanitized.issues, ...recSanitized.issues);

  // Check if unmasked plates or unmasked phone numbers still exist
  const is_safe = !allIssues.some(i => i.type === 'phone' || i.type === 'id_card');

  return {
    is_safe,
    issues_found: allIssues,
    sanitized_content: {
      title: titleSanitized.sanitizedText,
      sapo: sapoSanitized.sanitizedText,
      body: bodySanitized.sanitizedText,
      recommendation: recSanitized.sanitizedText,
    },
  };
}
