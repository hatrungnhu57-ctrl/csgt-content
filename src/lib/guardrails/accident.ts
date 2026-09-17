// Traffic Accident Guardrail (Section XIX, XLIX)

import { AccidentReviewResult, SourceData } from '../store/types';

const SPECULATIVE_ACCIDENT_PHRASES = [
  'do không chú ý quan sát',
  'do chạy quá tốc độ',
  'do đi sai làn đường',
  'do buồn ngủ',
  'do say xỉn',
  'do mất lái',
  'lỗi hoàn toàn do',
  'chịu trách nhiệm chính',
  'người điều khiển xe máy đã vi phạm',
  'tài xế xe tải có hành vi thiếu quan sát',
  'nguyên nhân là do',
  'do tài xế không làm chủ tốc độ',
];

/**
 * Validates traffic accident articles to strictly prevent AI hallucination or
 * speculation of cause, fault, or legal responsibility when there is no final conclusion in source data.
 */
export function reviewAccidentContent(sourceData: SourceData, articleText: string): AccidentReviewResult {
  const warnings: string[] = [];
  let speculation_detected = false;

  const lowerText = articleText.toLowerCase();

  // If source data indicates accident cause is under investigation or not conclusive
  const isInvestigating =
    sourceData.accident_cause_status === 'investigating' ||
    !sourceData.accident_cause_note ||
    sourceData.accident_cause_note.toLowerCase().includes('đang điều tra') ||
    sourceData.accident_cause_note.toLowerCase().includes('đang xác minh');

  if (isInvestigating) {
    // Check if article text contains speculation phrases
    for (const phrase of SPECULATIVE_ACCIDENT_PHRASES) {
      if (lowerText.includes(phrase)) {
        speculation_detected = true;
        warnings.push(`Phát hiện phỏng đoán nguyên nhân: "${phrase}". Khi vụ việc đang xác minh, AI và người viết tuyệt đối không tự quy kết lỗi hoặc phỏng đoán nguyên nhân.`);
      }
    }

    // Check if the article explicitly retains the proper objective phrasing
    const hasProperInvestigationNotice =
      lowerText.includes('đang được xác minh') ||
      lowerText.includes('đang được điều tra') ||
      lowerText.includes('đang phối hợp điều tra') ||
      lowerText.includes('làm rõ nguyên nhân');

    if (!hasProperInvestigationNotice) {
      warnings.push('Bài viết về TNGT cần nêu rõ "Nguyên nhân vụ việc đang được cơ quan chức năng điều tra, làm rõ" theo đúng tính chất nghiệp vụ.');
    }
  }

  const is_valid = !speculation_detected && warnings.length === 0;

  return {
    is_valid,
    speculation_detected,
    warnings,
  };
}
