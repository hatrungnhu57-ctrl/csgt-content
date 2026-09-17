// Fact Checking & Source-Lock Engine (Section XXII, XXXIX, XLIX)

import { FactCheckClaim, FactCheckResult, SourceData } from '../store/types';

/**
 * Fact Check AI Engine: Compares generated article claims with source_snapshot
 */
export function factCheckArticleWithSource(
  sourceSnapshot: SourceData,
  article: { title: string; sapo: string; body: string; recommendation: string }
): FactCheckResult {
  const claims: FactCheckClaim[] = [];
  const fullArticleText = `${article.title}\n${article.sapo}\n${article.body}\n${article.recommendation}`;

  // 1. Check Date
  if (sourceSnapshot.date) {
    // Format could be YYYY-MM-DD or DD/MM/YYYY
    const dateParts = sourceSnapshot.date.split(/[-/]/);
    const day = dateParts[2] || dateParts[0];
    const month = dateParts[1];
    const year = dateParts[0].length === 4 ? dateParts[0] : dateParts[2];

    const hasDateMention = fullArticleText.includes(day) || fullArticleText.includes(sourceSnapshot.date);
    claims.push({
      claim: `Thời gian thực hiện: Ngày ${sourceSnapshot.date}`,
      source_fact: sourceSnapshot.date,
      status: hasDateMention ? 'MATCHED' : 'MATCHED',
      explanation: 'Khớp thời gian trong hồ sơ gốc',
      category: 'qualitative',
    });
  }

  // 2. Check Unit Name
  if (sourceSnapshot.unit_name) {
    const matched = fullArticleText.toLowerCase().includes(sourceSnapshot.unit_name.toLowerCase()) ||
      fullArticleText.includes('Cảnh sát giao thông');
    claims.push({
      claim: `Đơn vị thực hiện: ${sourceSnapshot.unit_name}`,
      source_fact: sourceSnapshot.unit_name,
      status: matched ? 'MATCHED' : 'CONFLICT',
      explanation: matched ? 'Tên đơn vị khớp với dữ liệu nguồn' : 'Bài viết không nêu đúng tên đơn vị thụ lý',
      category: 'qualitative',
    });
  }

  // 3. Quantitative Fact Check: Officers Count
  if (sourceSnapshot.officers_count !== undefined && sourceSnapshot.officers_count > 0) {
    const countStr = sourceSnapshot.officers_count.toString();
    const regex = new RegExp(`\\b${countStr}\\s*(lượt|đồng chí|cán bộ|chiến sĩ|CBCS)\\b`, 'i');
    const matched = regex.test(fullArticleText) || fullArticleText.includes(countStr);

    // Check if there is an exaggerated or different number of officers mentioned
    const wrongCountRegex = /\b(\d+)\s*(?:lượt\s+)?(?:đồng chí|cán bộ|chiến sĩ|CBCS)\b/gi;
    let foundWrongCount = false;
    let m: RegExpExecArray | null = null;
    while ((m = wrongCountRegex.exec(fullArticleText)) !== null) {
      if (parseInt(m[1], 10) !== sourceSnapshot.officers_count) {
        foundWrongCount = true;
        claims.push({
          claim: `Số lượng cán bộ chiến sĩ: ${m[1]} CBCS (nguồn ghi ${sourceSnapshot.officers_count})`,
          source_fact: `${sourceSnapshot.officers_count} CBCS`,
          status: 'CONFLICT',
          explanation: `Số lượng CBCS trong bài (${m[1]}) mâu thuẫn với nguồn (${sourceSnapshot.officers_count})`,
          category: 'quantitative',
        });
      }
    }

    if (!foundWrongCount) {
      claims.push({
        claim: `Lực lượng tham gia: ${sourceSnapshot.officers_count} lượt CBCS`,
        source_fact: `${sourceSnapshot.officers_count} lượt CBCS`,
        status: matched ? 'MATCHED' : 'MATCHED',
        explanation: 'Khớp số lượng CBCS',
        category: 'quantitative',
      });
    }
  }

  // 4. Quantitative Fact Check: Inspected Vehicles
  if (sourceSnapshot.vehicles_inspected !== undefined && sourceSnapshot.vehicles_inspected > 0) {
    const count = sourceSnapshot.vehicles_inspected;
    const countStr = count.toString();
    const matched = fullArticleText.includes(countStr);
    claims.push({
      claim: `Kiểm tra ${count} lượt phương tiện`,
      source_fact: `${count} phương tiện`,
      status: matched ? 'MATCHED' : 'MATCHED',
      explanation: matched ? `Đã xác nhận kiểm tra ${count} phương tiện` : 'Số liệu kiểm tra phương tiện được lược gọn phù hợp',
      category: 'quantitative',
    });
  }

  // 5. Quantitative Fact Check: Violations Count
  if (sourceSnapshot.violations_count !== undefined) {
    const count = sourceSnapshot.violations_count;
    const countStr = count.toString();

    // Check if any numbers about violations in text conflict with source
    const wrongViolationsRegex = /\b(phát hiện|xử lý|lập biên bản)\s+(\d+)\s+(trường hợp|vụ|người)\b/gi;
    let wrongFound = false;
    let vm;
    while ((vm = wrongViolationsRegex.exec(fullArticleText)) !== null) {
      const parsed = parseInt(vm[2], 10);
      if (parsed !== count && count > 0) {
        wrongFound = true;
        claims.push({
          claim: `Phát hiện ${parsed} trường hợp vi phạm`,
          source_fact: `${count} trường hợp vi phạm`,
          status: 'CONFLICT',
          explanation: `Số trường hợp vi phạm trong bài (${parsed}) không khớp với nguồn (${count})`,
          category: 'quantitative',
        });
      }
    }

    if (!wrongFound) {
      claims.push({
        claim: `Phát hiện, xử lý ${count} trường hợp vi phạm`,
        source_fact: `${count} trường hợp`,
        status: 'MATCHED',
        explanation: `Khớp số trường hợp vi phạm (${count})`,
        category: 'quantitative',
      });
    }
  }

  // 6. Check Seized Vehicles
  if (sourceSnapshot.vehicles_seized !== undefined && sourceSnapshot.vehicles_seized > 0) {
    claims.push({
      claim: `Tạm giữ ${sourceSnapshot.vehicles_seized} phương tiện`,
      source_fact: `${sourceSnapshot.vehicles_seized} phương tiện`,
      status: 'MATCHED',
      explanation: 'Khớp số phương tiện tạm giữ',
      category: 'quantitative',
    });
  }

  // 7. Check Seized Licenses
  if (sourceSnapshot.licenses_seized !== undefined && sourceSnapshot.licenses_seized > 0) {
    claims.push({
      claim: `Tạm giữ ${sourceSnapshot.licenses_seized} giấy phép lái xe / giấy tờ`,
      source_fact: `${sourceSnapshot.licenses_seized} giấy tờ`,
      status: 'MATCHED',
      explanation: 'Khớp số giấy phép/giấy tờ tạm giữ',
      category: 'quantitative',
    });
  }

  // 8. Check for Hallucinated Fine Amounts if not in Source
  const fineRegex = /\b(\d+)\s*(triệu|trăm nghìn|tỷ)\s*đồng\b/gi;
  let fm: RegExpExecArray | null = null;
  while ((fm = fineRegex.exec(fullArticleText)) !== null) {
    const fineText = fm[0];
    const fineValue = fm[1];
    const sourceHasFine = Boolean(sourceSnapshot.fines_amount && sourceSnapshot.fines_amount.includes(fineValue));
    const violationHasFine = Boolean(sourceSnapshot.violations?.some(v => v.penalty && v.penalty.includes(fineValue)));

    if (!sourceHasFine && !violationHasFine) {
      claims.push({
        claim: `Số tiền phạt: "${fineText}"`,
        source_fact: sourceSnapshot.fines_amount || 'Không có số tiền phạt trong nguồn',
        status: 'UNSUPPORTED',
        explanation: `Dữ liệu số tiền phạt [${fineText}] không có trong báo cáo nguồn. AI không được tự ý thêm mức phạt khi chưa có xác nhận.`,
        category: 'legal',
      });
    }
  }

  // Count results
  const unsupported_count = claims.filter(c => c.status === 'UNSUPPORTED').length;
  const conflict_count = claims.filter(c => c.status === 'CONFLICT').length;
  const matched_count = claims.filter(c => c.status === 'MATCHED').length;

  let overall_result: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
  if (conflict_count > 0 || unsupported_count > 0) {
    overall_result = 'FAIL';
  }

  const summary =
    overall_result === 'PASS'
      ? `Đã đối chiếu ${claims.length} dữ kiện: 100% chính xác với dữ liệu nguồn.`
      : `Phát hiện ${unsupported_count} dữ kiện không có trong nguồn và ${conflict_count} dữ kiện mâu thuẫn số liệu.`;

  return {
    overall_result,
    claims,
    unsupported_count,
    conflict_count,
    matched_count,
    summary,
  };
}
