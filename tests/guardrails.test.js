// Automated Verification Test Suite (Pure ESM JS for Node v26)
import assert from 'node:assert';
import { abbreviateVietnameseName, maskLicensePlate, reviewArticlePrivacy } from '../src/lib/guardrails/privacy.ts';
import { factCheckArticleWithSource } from '../src/lib/guardrails/fact-checker.ts';
import { reviewAccidentContent } from '../src/lib/guardrails/accident.ts';
import { reviewUnitNames } from '../src/lib/guardrails/unit-name.ts';

console.log('--- BẮT ĐẦU CHẠY BỘ TEST KIỂM THỬ QUY TẮC NGHIỆP VỤ BẮT BUỘC (PHẦN XLIX) ---');

// TEST 1: Source có 8 vi phạm, AI output ghi 10 vi phạm -> EXPECTED: FAIL
{
  const source = {
    date: '2026-09-17',
    unit_name: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú',
    main_event: 'Tuần tra kiểm soát',
    actions_taken: 'Cắm chốt kiểm tra',
    main_results: 'Phát hiện xử lý 8 trường hợp',
    violations_count: 8,
    violations: [],
  };

  const articleWithConflict = {
    title: 'Phát hiện xử lý 10 trường hợp vi phạm',
    sapo: 'Ngày 17/09/2026, tổ công tác đã phát hiện lập biên bản 10 trường hợp vi phạm.',
    body: 'Lực lượng chức năng đã phát hiện 10 trường hợp vi phạm trật tự an toàn giao thông.',
    recommendation: 'Người dân cần chấp hành luật.',
  };

  const check = factCheckArticleWithSource(source, articleWithConflict);
  assert.strictEqual(check.overall_result, 'FAIL', 'Test 1 Thất bại: Phải trả về FAIL khi số liệu mâu thuẫn (8 vs 10)');
  console.log('✓ TEST 1 PASS: Phát hiện mâu thuẫn số vi phạm (nguồn: 8 vs bài: 10) -> Trả về FAIL chính xác.');
}

// TEST 2: SOURCE không có mức phạt, Output có "phạt 5 triệu đồng" -> EXPECTED: UNSUPPORTED / FAIL
{
  const source = {
    date: '2026-09-17',
    unit_name: 'Đội Cảnh sát giao thông - trật tự',
    main_event: 'Xử lý vi phạm',
    actions_taken: 'Kiểm tra nồng độ cồn',
    main_results: 'Lập biên bản vi phạm',
    violations_count: 1,
    fines_amount: undefined, // Không có số tiền phạt
    violations: [
      {
        id: 'v1',
        violation_name: 'Vi phạm nồng độ cồn',
        count: 1,
        verified: false,
      },
    ],
  };

  const articleWithHallucinatedFine = {
    title: 'Xử lý nghiêm vi phạm nồng độ cồn',
    sapo: 'Tổ công tác đã lập biên bản vi phạm.',
    body: 'Người vi phạm bị phạt 5 triệu đồng theo quy định.',
    recommendation: 'Đã uống rượu bia không lái xe.',
  };

  const check = factCheckArticleWithSource(source, articleWithHallucinatedFine);
  assert.strictEqual(check.overall_result, 'FAIL', 'Test 2 Thất bại: Phải trả về FAIL khi xuất hiện mức phạt tự sinh');
  const unsupportedClaim = check.claims.find(c => c.status === 'UNSUPPORTED');
  assert.ok(unsupportedClaim, 'Phải có claim UNSUPPORTED');
  console.log('✓ TEST 2 PASS: Phát hiện mức phạt tự sinh "phạt 5 triệu đồng" không có trong nguồn -> Trả về UNSUPPORTED / FAIL.');
}

// TEST 3: Input: 84H1-123.45 -> Public output: 84H1-123.xx -> EXPECTED: PASS
{
  const rawPlate = '84H1-123.45';
  const masked = maskLicensePlate(rawPlate);
  assert.strictEqual(masked, '84H1-123.xx', 'Test 3 Thất bại: Biển số 84H1-123.45 phải được che thành 84H1-123.xx');

  const textWithPlate = 'Phát hiện phương tiện biển kiểm soát 84H1-123.45 vi phạm tốc độ.';
  const review = reviewArticlePrivacy({
    title: 'Xử lý vi phạm',
    sapo: textWithPlate,
    body: textWithPlate,
    recommendation: 'Chấp hành luật',
  });
  assert.ok(review.sanitized_content.body.includes('84H1-123.xx'), 'Văn bản công khai phải che biển số');
  console.log('✓ TEST 3 PASS: Che 2 ký tự cuối biển số 84H1-123.45 -> 84H1-123.xx thành công.');
}

// TEST 4: Input: Nguyễn Văn An -> Public: N.V.A. -> EXPECTED: PASS
{
  const rawName = 'Nguyễn Văn An';
  const abbreviated = abbreviateVietnameseName(rawName);
  assert.strictEqual(abbreviated, 'N.V.A.', 'Test 4 Thất bại: Nguyễn Văn An phải viết tắt thành N.V.A.');
  console.log('✓ TEST 4 PASS: Viết tắt danh tính người vi phạm: "Nguyễn Văn An" -> "N.V.A." chính xác.');
}

// TEST 5: Bài TNGT không có kết luận nguyên nhân, Output AI tự ghi "do không chú ý quan sát" -> EXPECTED: FAIL
{
  const source = {
    date: '2026-09-17',
    unit_name: 'Đội Cảnh sát giao thông - trật tự',
    main_event: 'Điều tra vụ tai nạn giao thông',
    actions_taken: 'Bảo vệ hiện trường, cứu nạn cứu hộ',
    main_results: 'Đang điều tra làm rõ',
    accident_cause_status: 'investigating',
    accident_cause_note: 'Nguyên nhân đang được xác minh',
    violations: [],
  };

  const articleWithSpeculation = 'Vụ tai nạn xảy ra do tài xế xe máy do không chú ý quan sát khi chuyển hướng.';
  const review = reviewAccidentContent(source, articleWithSpeculation);
  assert.strictEqual(review.is_valid, false, 'Test 5 Thất bại: Phải phát hiện phỏng đoán nguyên nhân TNGT');
  assert.strictEqual(review.speculation_detected, true, 'speculation_detected phải là true');
  console.log('✓ TEST 5 PASS: Phát hiện và chặn đứng phỏng đoán nguyên nhân TNGT "do không chú ý quan sát" khi chưa có kết luận.');
}

// TEST 6: Phát hiện ký hiệu nội bộ (C08, Đội 6...)
{
  const unitReview = reviewUnitNames('Tổ công tác C08 đã phối hợp với Đội 6 xử lý.');
  assert.strictEqual(unitReview.is_valid, false, 'Phải phát hiện viết tắt nội bộ C08, Đội 6');
  console.log('✓ TEST 6 PASS: Phát hiện mã ký hiệu nội bộ (C08, Đội 6) yêu cầu ghi rõ danh xưng công khai.');
}

console.log('================================================================');
console.log('TẤT CẢ 6/6 BÀI TEST NGHIỆP VỤ CSGT ĐÃ THÀNH CÔNG VÀ ĐẠT 100% PASS!');
console.log('================================================================');
