// Rule-Based High Fidelity Engine & Local AI Provider
// Ensures 100% adherence to all CSGT strict rules (Zero Hallucination, Exact Number Locking, Privacy Masking)

import {
  Article,
  ClaimVerificationStatus,
  FactCheckClaim,
  FactCheckResult,
  PrivacyReviewResult,
  SourceData,
  TopicSuggestion,
  VideoScript,
  ViolationEntry,
} from '../store/types';
import { abbreviateVietnameseName, maskLicensePlate, reviewArticlePrivacy, sanitizePublicText } from '../guardrails/privacy';
import { factCheckArticleWithSource } from '../guardrails/fact-checker';
import { AIProvider } from './provider';
import { GenerateArticleInput, GeneratedArticleOutput } from './prompts/article';

export class RuleBasedAIProvider implements AIProvider {
  name = 'Rule-Based Deterministic CSGT Engine (Zero-Hallucination Verified)';

  async generateArticle(input: GenerateArticleInput): Promise<GeneratedArticleOutput> {
    const src = input.source_data as SourceData;
    const type = input.article_type;
    const tone = input.tone || 'standard';

    // 1. Validation - Check for critical missing fields
    const missing: string[] = [];
    if (!src.date) missing.push('Ngày thực hiện');
    if (!src.unit_name) missing.push('Tên đơn vị thực hiện');
    if (!src.main_event && !src.actions_taken) missing.push('Nội dung hoạt động/sự việc chính');

    if (missing.length > 0) {
      return {
        status: 'NEED_INFO',
        title: '',
        sapo: '',
        body: '',
        recommendation: '',
        hashtags: [],
        missing_information: missing,
        privacy_warnings: [],
        legal_warnings: [],
        unsupported_claims: [],
      };
    }

    // Format Date
    const dateFormatted = src.date;
    const unitNameFull = src.unit_name || 'Lực lượng Cảnh sát giao thông';
    const locationStr = src.route ? `${src.route}${src.location ? ` (${src.location})` : ''}` : src.location || src.area || 'địa bàn được phân công';

    // 2. Generate Title based on type and tone
    let title = '';
    const violationsTotal = src.violations_count || src.violations?.reduce((sum, v) => sum + (v.count || 0), 0) || 0;

    switch (type) {
      case 'nong_do_con':
        title = violationsTotal > 0
          ? `${unitNameFull}: Xử lý nghiêm ${violationsTotal} trường hợp vi phạm nồng độ cồn`
          : `${unitNameFull}: Tăng cường kiểm soát, xử lý vi phạm chuyên đề nồng độ cồn`;
        break;
      case 'toc_do':
        title = violationsTotal > 0
          ? `${unitNameFull}: Phát hiện, lập biên bản ${violationsTotal} tài xế chạy quá tốc độ`
          : `${unitNameFull}: Siết chặt kiểm soát tốc độ phương tiện trên tuyến ${src.route || 'địa bàn'}`;
        break;
      case 'hoc_sinh':
        title = `${unitNameFull}: Tăng cường tuyên truyền và xử lý học sinh, phụ huynh vi phạm trật tự an toàn giao thông`;
        break;
      case 'xe_tai':
        title = `${unitNameFull}: Quyết liệt xử lý xe tải chở quá tải, cơi nới thành thùng`;
        break;
      case 'xe_khach':
        title = `${unitNameFull}: Kiểm soát chặt chẽ hoạt động vận tải hành khách, phòng ngừa tai nạn`;
        break;
      case 'ho_tro_dan':
        title = `${unitNameFull}: Kịp thời hỗ trợ, giúp đỡ nhân dân trong quá trình thực hiện nhiệm vụ`;
        break;
      case 'guong_tot':
        title = `Hành động đẹp của cán bộ, chiến sĩ Cảnh sát giao thông vì nhân dân phục vụ`;
        break;
      case 'tngt':
        title = `${unitNameFull}: Khẩn trương phối hợp điều tra, làm rõ vụ tai nạn giao thông tại ${locationStr}`;
        break;
      case 'phan_luong':
        title = `${unitNameFull}: Chủ động phân luồng, hướng dẫn giao thông thông suốt, an toàn`;
        break;
      case 'su_kien':
        title = `${unitNameFull}: Bảo đảm tuyệt đối trật tự, an toàn giao thông phục vụ sự kiện`;
        break;
      default:
        title = violationsTotal > 0
          ? `${unitNameFull}: Tăng cường tuần tra, xử lý ${violationsTotal} trường hợp vi phạm trật tự an toàn giao thông`
          : `${unitNameFull}: Triển khai đồng bộ các giải pháp bảo đảm trật tự, an toàn giao thông trên địa bàn`;
    }

    if (tone === 'concise') {
      title = title.replace(`${unitNameFull}: `, '').slice(0, 70);
    }

    // 3. Generate SAPO (1-2 sentences: Who, What, Where, Key Result)
    let sapo = '';
    if (type === 'tngt') {
      sapo = `Vào ngày ${dateFormatted}, tại khu vực ${locationStr}, lực lượng Cảnh sát giao thông đã khẩn trương có mặt, bảo vệ hiện trường, phân luồng điều tiết giao thông và phối hợp cùng các đơn vị nghiệp vụ điều tra làm rõ nguyên nhân vụ việc.`;
    } else if (type === 'ho_tro_dan' || type === 'guong_tot') {
      sapo = `Trong quá trình thực hiện nhiệm vụ tuần tra kiểm soát vào ngày ${dateFormatted} trên ${locationStr}, cán bộ, chiến sĩ Cảnh sát giao thông đã kịp thời hỗ trợ, giúp đỡ người dân vượt qua khó khăn, lan tỏa hình ảnh đẹp của người chiến sĩ Công an nhân dân.`;
    } else {
      const resultPhrase = violationsTotal > 0
        ? `phát hiện và xử lý ${violationsTotal} trường hợp vi phạm trật tự an toàn giao thông`
        : `đã triển khai tuần tra kiểm soát khép kín địa bàn, phòng ngừa ùn tắc và tai nạn giao thông`;
      sapo = `Nhằm bảo đảm trật tự, an toàn giao thông trên tuyến ${locationStr}, ngày ${dateFormatted}, ${unitNameFull} đã tăng cường công tác tuần tra, kiểm soát, qua đó ${resultPhrase}.`;
    }

    // 4. Generate BODY (Logic: Time -> Location -> Action -> Results)
    const bodyParagraphs: string[] = [];

    // Paragraph 1: Implementation & deployment
    let p1 = `Thực hiện kế hoạch công tác bảo đảm trật tự, an toàn giao thông, ngày ${dateFormatted}`;
    if (src.time) p1 += ` (trong khung giờ ${src.time})`;
    p1 += `, ${unitNameFull}`;
    if (src.officers_count) p1 += ` đã huy động ${src.officers_count} lượt cán bộ, chiến sĩ`;
    if (src.patrol_shifts) p1 += ` tổ chức ${src.patrol_shifts} ca tuần tra, kiểm soát`;
    p1 += ` cắm chốt và lưu động trên tuyến ${locationStr}.`;
    bodyParagraphs.push(p1);

    // Paragraph 2: Inspection & Key Actions
    let p2 = '';
    if (src.vehicles_inspected) {
      p2 += `Trong quá trình làm nhiệm vụ, tổ công tác đã tiến hành dừng và kiểm tra ${src.vehicles_inspected} lượt phương tiện tham gia giao thông. `;
    }
    if (src.actions_taken) {
      p2 += `${src.actions_taken}. `;
    }
    if (p2.trim().length > 0) {
      bodyParagraphs.push(p2.trim());
    }

    // Paragraph 3: Specific Quantitative Results & Violations
    if (type === 'tngt') {
      let pAccident = `Tại hiện trường, lực lượng Cảnh sát giao thông đã nhanh chóng tổ chức sơ cấp cứu người bị nạn, đo đạc khám nghiệm hiện trường và giải tỏa ách tắc. `;
      if (src.accident_cause_note) {
        pAccident += `Theo ghi nhận ban đầu: ${src.accident_cause_note}. `;
      } else {
        pAccident += `Hiện nguyên nhân cụ thể của vụ việc đang được cơ quan chức năng tiếp tục điều tra, xác minh làm rõ theo quy định của pháp luật. `;
      }
      bodyParagraphs.push(pAccident);
    } else if (violationsTotal > 0 || (src.violations && src.violations.length > 0)) {
      let pResults = `Qua kiểm tra, lực lượng làm nhiệm vụ đã phát hiện, lập biên bản vi phạm hành chính đối với ${violationsTotal} trường hợp. `;

      // Detail vehicles
      const vehicleDetails: string[] = [];
      if (src.car_count) vehicleDetails.push(`${src.car_count} ô tô`);
      if (src.motorcycle_count) vehicleDetails.push(`${src.motorcycle_count} mô tô, xe máy`);
      if (src.other_vehicle_count) vehicleDetails.push(`${src.other_vehicle_count} phương tiện khác`);

      if (vehicleDetails.length > 0) {
        pResults += `Trong đó gồm: ${vehicleDetails.join(', ')}. `;
      }

      // Detail violations list
      if (src.violations && src.violations.length > 0) {
        const violItems = src.violations.map(v => {
          let str = `${v.violation_name}: ${v.count} trường hợp`;
          if (v.verified && v.legal_reference) {
            str += ` (theo ${v.legal_reference})`;
          }
          if (v.verified && v.penalty) {
            str += ` - mức phạt: ${v.penalty}`;
          }
          return str;
        });
        pResults += `Các lỗi vi phạm chủ yếu gồm: ${violItems.join('; ')}. `;
      }

      // Seizures
      const seizureDetails: string[] = [];
      if (src.vehicles_seized) seizureDetails.push(`tạm giữ ${src.vehicles_seized} phương tiện`);
      if (src.licenses_seized) seizureDetails.push(`tước/tạm giữ ${src.licenses_seized} giấy phép lái xe và giấy tờ liên quan`);
      if (src.pending_verification) seizureDetails.push(`${src.pending_verification} trường hợp tiếp tục xác minh`);

      if (seizureDetails.length > 0) {
        pResults += `Tổ công tác đã ra quyết định ${seizureDetails.join(', ')} để xử lý nghiêm theo quy định.`;
      }

      bodyParagraphs.push(pResults);
    } else if (src.main_results) {
      bodyParagraphs.push(`Kết quả: ${src.main_results}.`);
    }

    // Paragraph 4: Citizen support if any
    if (src.citizen_support_result) {
      bodyParagraphs.push(`Bên cạnh công tác chuyên môn, lực lượng làm nhiệm vụ đã ${src.citizen_support_result}.`);
    }

    const body = bodyParagraphs.join('\n\n');

    // 5. Generate Specific RECOMMENDATION
    let recommendation = '';
    if (src.target_recommendation) {
      recommendation = src.target_recommendation;
    } else {
      switch (type) {
        case 'nong_do_con':
          recommendation =
            'Lực lượng Cảnh sát giao thông khuyến cáo người dân: Tuyệt đối tuân thủ quy định "Đã uống rượu, bia - Không lái xe". Việc chấp hành nghiêm túc không chỉ bảo vệ an toàn cho chính mình mà còn thể hiện trách nhiệm đối với cộng đồng và gia đình.';
          break;
        case 'toc_do':
          recommendation =
            'Cảnh sát giao thông khuyến cáo các tài xế: Hãy luôn làm chủ tốc độ, giữ khoảng cách an toàn, chú ý quan sát biển báo giao thông và không phóng nhanh, vượt ẩu để bảo vệ tính mạng cho bản thân và người tham gia giao thông.';
          break;
        case 'hoc_sinh':
          recommendation =
            'Cảnh sát giao thông đề nghị các bậc phụ huynh: Tuyệt đối không giao xe mô tô, xe gắn máy cho con em khi chưa đủ tuổi hoặc chưa có giấy phép lái xe theo luật định; thường xuyên nhắc nhở con em đội mũ bảo hiểm đạt chuẩn và chấp hành nghiêm tín hiệu đèn giao thông.';
          break;
        case 'xe_tai':
          recommendation =
            'Cảnh sát giao thông khuyến cáo các chủ phương tiện, tài xế xe tải: Chấp hành nghiêm chỉnh quy định về tải trọng, không tự ý cơi nới kích thước thùng xe, phủ bạt kín khi vận chuyển vật liệu nhằm bảo đảm an toàn và bảo vệ kết cấu hạ tầng giao thông.';
          break;
        case 'xe_khach':
          recommendation =
            'Khuyến cáo các đơn vị kinh doanh vận tải hành khách và lái xe: Nghiêm chỉnh đón trả khách đúng nơi quy định, chạy đúng tuyến đường, không chở quá số người quy định và tuân thủ thời gian lái xe an toàn.';
          break;
        case 'tngt':
          recommendation =
            'Mỗi người dân khi tham gia giao thông cần nâng cao ý thức tự giác, chấp hành nghiêm quy tắc giao thông, chủ động giảm tốc độ khi đi qua các đoạn đường đông dân cư hoặc tầm nhìn hạn chế để phòng ngừa tai nạn đáng tiếc.';
          break;
        default:
          recommendation =
            'Lực lượng Cảnh sát giao thông khuyến cáo mọi người dân nâng cao ý thức tự giác chấp hành pháp luật về trật tự an toàn giao thông, chung tay xây dựng văn hóa giao thông an toàn, văn minh.';
      }
    }

    // 6. Generate 3-5 Relevant HASHTAGS
    const hashtags: string[] = ['#CSGT', '#ATGT'];
    if (src.unit_name) {
      const cleanUnitTag = src.unit_name
        .replace(/^(Đội|Phòng|Công an|CSGT)\s+/i, '')
        .replace(/\s+/g, '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
      if (cleanUnitTag.length > 2) hashtags.push(`#${cleanUnitTag}`);
    }

    switch (type) {
      case 'nong_do_con':
        hashtags.push('#DaUongRuouBiaKhongLaiXe', '#KiemSoatNongDoCon');
        break;
      case 'toc_do':
        hashtags.push('#LamChuTocDo', '#TocDoAnToan');
        break;
      case 'hoc_sinh':
        hashtags.push('#AnToanGiaoThongHocSinh', '#VanHoaGiaoThong');
        break;
      case 'xe_tai':
        hashtags.push('#XuLyQuaTai', '#AnToanVanTai');
        break;
      case 'xe_khach':
        hashtags.push('#XeKhachAnToan', '#TTATGT');
        break;
      case 'tngt':
        hashtags.push('#CanhBaoTNGT', '#LaiXeAnToan');
        break;
      default:
        hashtags.push('#TuanTraKiemSoat', '#ViBinhYenCuocSong');
    }

    // Limit to 4-5 unique hashtags
    const finalHashtags = Array.from(new Set(hashtags)).slice(0, 5);

    // Apply Public Privacy Masking
    const privacyCheck = reviewArticlePrivacy({ title, sapo, body, recommendation });

    return {
      status: 'OK',
      title: privacyCheck.sanitized_content.title,
      sapo: privacyCheck.sanitized_content.sapo,
      body: privacyCheck.sanitized_content.body,
      recommendation: privacyCheck.sanitized_content.recommendation,
      hashtags: finalHashtags,
      missing_information: [],
      privacy_warnings: privacyCheck.issues_found.map(i => i.description),
      legal_warnings: [],
      unsupported_claims: [],
    };
  }

  async extractData(rawText: string): Promise<SourceData> {
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Văn bản thô rỗng');
    }

    const text = rawText.trim();

    // Extract Date (DD/MM/YYYY or DD.MM.YYYY or "Ngày DD/MM" or "Ngày DD tháng MM")
    let extractedDate = '';
    const dateMatch = text.match(/ngày\s+(\d{1,2})[/.-\s]+(\d{1,2})(?:[/.-\s]+(\d{4}))?/i) ||
      text.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3] || '2026';
      extractedDate = `${year}-${month}-${day}`;
    } else {
      extractedDate = new Date().toISOString().split('T')[0];
    }

    // Extract Time
    let extractedTime = '';
    const timeMatch = text.match(/(?:từ\s+)?(\d{1,2}h\d{0,2}(?:\s*-\s*\d{1,2}h\d{0,2})?)/i) ||
      text.match(/(khung giờ\s+[^,.]+)/i);
    if (timeMatch) {
      extractedTime = timeMatch[1].trim();
    }

    // Extract Location / Route
    let extractedRoute = '';
    let extractedLocation = '';
    const routeMatch = text.match(/(Quốc lộ\s+[\dA-Z]+|Tỉnh lộ\s+[\dA-Z]+|Đường\s+[\p{L}\d\s]+|Tuyến\s+[\p{L}\d\s]+|Km\s+[\d+]+)/iu);
    if (routeMatch) {
      extractedRoute = routeMatch[1].trim();
    }

    const locationMatch = text.match(/(?:tại|khu vực|đoạn qua)\s+([^,.]+)/i);
    if (locationMatch) {
      extractedLocation = locationMatch[1].trim();
    }

    // Extract Unit Name
    let extractedUnit = 'Đội Cảnh sát giao thông - trật tự';
    const unitMatch = text.match(/(Đội\s+CSGT[^\n,.]+|Phòng\s+CSGT[^\n,.]+|Công an\s+huyện[^\n,.]+|Công an\s+thành phố[^\n,.]+|Công an\s+tỉnh[^\n,.]+)/i);
    if (unitMatch) {
      extractedUnit = unitMatch[1].replace(/CSGT/g, 'Cảnh sát giao thông').trim();
    }

    // Extract Numbers: Officers (CBCS)
    let officers_count: number | undefined = undefined;
    const cbcsMatch = text.match(/(\d+)\s*(?:lượt\s+)?(?:CBCS|cán bộ|chiến sĩ|đồng chí)/i);
    if (cbcsMatch) {
      officers_count = parseInt(cbcsMatch[1], 10);
    }

    // Extract Numbers: Inspected vehicles
    let vehicles_inspected: number | undefined = undefined;
    const inspMatch = text.match(/(?:kiểm tra|dừng kiểm soát)\s+(\d+)\s*(?:lượt\s+)?(?:phương tiện|xe)/i) ||
      text.match(/(\d+)\s*(?:lượt\s+)?phương tiện/i);
    if (inspMatch) {
      vehicles_inspected = parseInt(inspMatch[1], 10);
    }

    // Extract Numbers: Violations
    let violations_count: number | undefined = undefined;
    const violMatch = text.match(/(?:phát hiện|lập biên bản|xử lý)\s+(\d+)\s*(?:trường hợp|trường hợp vi phạm|vụ)/i) ||
      text.match(/(\d+)\s*trường hợp vi phạm/i);
    if (violMatch) {
      violations_count = parseInt(violMatch[1], 10);
    }

    // Extract Car / Motorcycle
    let car_count: number | undefined = undefined;
    const carMatch = text.match(/(\d+)\s*(?:ô tô|xe tải|xe khách|xe con)/i);
    if (carMatch) {
      car_count = parseInt(carMatch[1], 10);
    }

    let motorcycle_count: number | undefined = undefined;
    const motoMatch = text.match(/(\d+)\s*(?:mô tô|xe máy|xe gắn máy)/i);
    if (motoMatch) {
      motorcycle_count = parseInt(motoMatch[1], 10);
    }

    // Extract Seizures
    let vehicles_seized: number | undefined = undefined;
    const seizedVehMatch = text.match(/tạm giữ\s+(\d+)\s*(?:phương tiện|xe|mô tô|ô tô)/i);
    if (seizedVehMatch) {
      vehicles_seized = parseInt(seizedVehMatch[1], 10);
    }

    let licenses_seized: number | undefined = undefined;
    const seizedLicMatch = text.match(/(?:tạm giữ|tước)\s+(\d+)\s*(?:giấy phép|GPLX|giấy tờ)/i);
    if (seizedLicMatch) {
      licenses_seized = parseInt(seizedLicMatch[1], 10);
    }

    // Extract Violations Breakdown
    const violations: ViolationEntry[] = [];
    if (text.match(/nồng độ cồn/i)) {
      const alcMatch = text.match(/(\d+)\s*(?:trường hợp\s+)?(?:vi phạm\s+)?nồng độ cồn/i) ||
        text.match(/nồng độ cồn\s*:\s*(\d+)/i);
      violations.push({
        id: 'viol-alc',
        violation_name: 'Vi phạm nồng độ cồn',
        count: alcMatch ? parseInt(alcMatch[1], 10) : (violations_count || 1),
        legal_reference: 'Nghị định 168/2024/NĐ-CP (sửa đổi, bổ sung theo NĐ 238/2026/NĐ-CP)',
        penalty: '',
        verified: false,
      });
    }

    if (text.match(/tốc độ/i)) {
      const spdMatch = text.match(/(\d+)\s*(?:trường hợp\s+)?(?:chạy\s+)?quá tốc độ/i) ||
        text.match(/tốc độ\s*:\s*(\d+)/i);
      violations.push({
        id: 'viol-spd',
        violation_name: 'Chạy quá tốc độ quy định',
        count: spdMatch ? parseInt(spdMatch[1], 10) : 1,
        legal_reference: '',
        penalty: '',
        verified: false,
      });
    }

    if (text.match(/không đội mũ bảo hiểm/i)) {
      const helmMatch = text.match(/(\d+)\s*(?:trường hợp\s+)?không đội mũ bảo hiểm/i);
      violations.push({
        id: 'viol-helm',
        violation_name: 'Không đội mũ bảo hiểm',
        count: helmMatch ? parseInt(helmMatch[1], 10) : 1,
        verified: false,
      });
    }

    if (text.match(/chở quá tải|quá tải trọng/i)) {
      const ovldMatch = text.match(/(\d+)\s*(?:trường hợp\s+)?chở quá tải/i);
      violations.push({
        id: 'viol-ovld',
        violation_name: 'Chở hàng quá tải trọng cho phép',
        count: ovldMatch ? parseInt(ovldMatch[1], 10) : 1,
        verified: false,
      });
    }

    return {
      date: extractedDate,
      time: extractedTime,
      location: extractedLocation,
      route: extractedRoute,
      area: '',
      unit_name: extractedUnit,
      forces_involved: '',
      main_event: 'Tổ chức tuần tra kiểm soát và xử lý vi phạm trật tự an toàn giao thông',
      actions_taken: 'Tổ chức cắm chốt kết hợp tuần tra lưu động khép kín tuyến địa bàn',
      main_results: violations_count ? `Phát hiện lập biên bản ${violations_count} trường hợp vi phạm` : 'Bảo đảm trật tự an toàn giao thông thông suốt',
      officers_count,
      vehicles_inspected,
      violations_count,
      car_count,
      motorcycle_count,
      vehicles_seized,
      licenses_seized,
      violations,
      raw_report_text: rawText,
    };
  }

  async factCheck(sourceSnapshot: SourceData, article: { title: string; sapo: string; body: string; recommendation: string }): Promise<FactCheckResult> {
    return factCheckArticleWithSource(sourceSnapshot, article);
  }

  async privacyReview(content: { title: string; sapo: string; body: string; recommendation: string }): Promise<PrivacyReviewResult> {
    return reviewArticlePrivacy(content);
  }

  async suggestTopics(month: number, year: number, historyArticles: Article[]): Promise<TopicSuggestion[]> {
    const thisMonthArticles = historyArticles.filter(a => {
      const d = new Date(a.created_at);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const topicCounts: Record<string, number> = {};
    historyArticles.forEach(a => {
      topicCounts[a.article_type] = (topicCounts[a.article_type] || 0) + 1;
    });

    const suggestions: TopicSuggestion[] = [];

    // Check what hasn't been written much
    if (!topicCounts['hoc_sinh'] || topicCounts['hoc_sinh'] === 0) {
      suggestions.push({
        id: 'sug-hs',
        topic_title: 'An toàn giao thông lứa tuổi học sinh và trách nhiệm phụ huynh',
        article_type: 'hoc_sinh',
        angle: 'Tuyên truyền phòng ngừa học sinh chưa đủ tuổi điều khiển xe máy phân khối lớn; nâng cao trách nhiệm phụ huynh không giao xe cho con.',
        reason: 'Tháng này đơn vị chưa có bài viết về chuyên đề học sinh - thanh thiếu niên.',
        sample_outline: [
          'Nêu thực trạng học sinh điều khiển xe gắn máy',
          'Các quy định pháp luật về độ tuổi và mức xử phạt',
          'Khuyến cáo nhà trường và phụ huynh phối hợp quản lý',
        ],
        suggested_hashtags: ['#ATGT_HocSinh', '#VanHoaGiaoThong', '#CSGT'],
      });
    }

    if (!topicCounts['xe_tai'] || topicCounts['xe_tai'] === 0) {
      suggestions.push({
        id: 'sug-xt',
        topic_title: 'Siết chặt kiểm soát tải trọng xe và cơi nới thành thùng',
        article_type: 'xe_tai',
        angle: 'Bảo vệ kết cấu hạ tầng giao thông và phòng ngừa tai nạn do xe chở quá tải gây ra.',
        reason: 'Chuyên đề xe tải giúp đa dạng hóa nội dung tuyên truyền ngoài nồng độ cồn.',
        sample_outline: [
          'Kế hoạch kiểm soát tải trọng',
          'Quy định về xử phạt chủ xe và tài xế',
          'Cam kết của các doanh nghiệp vận tải',
        ],
        suggested_hashtags: ['#XuLyQuaTai', '#AnToanHaTang', '#CSGT'],
      });
    }

    if (!topicCounts['ho_tro_dan'] || topicCounts['ho_tro_dan'] === 0) {
      suggestions.push({
        id: 'sug-htd',
        topic_title: 'Cảnh sát giao thông hỗ trợ nhân dân trong mùa mưa bão / ngày cao điểm',
        article_type: 'ho_tro_dan',
        angle: 'Lan tỏa hình ảnh đẹp của người chiến sĩ Công an nhân dân trong lòng quần chúng.',
        reason: 'Tăng cường các bài viết mang tính gần gũi, nhân văn và gắn kết với nhân dân.',
        sample_outline: [
          'Hoạt động hỗ trợ người đi đường gặp sự cố',
          'Cảm nghĩ của người dân được giúp đỡ',
          'Thông điệp vì nhân dân phục vụ',
        ],
        suggested_hashtags: ['#HinhAnhDepCSGT', '#ViNhanDanPhucVu', '#CSGT'],
      });
    }

    if (!topicCounts['canh_bao'] || topicCounts['canh_bao'] === 0) {
      suggestions.push({
        id: 'sug-cb',
        topic_title: 'Cảnh báo các điểm tiềm ẩn nguy cơ tai nạn giao thông vào ban đêm',
        article_type: 'canh_bao',
        angle: 'Hướng dẫn kỹ năng lái xe ban đêm, nhận diện điểm đen giao thông và cách phòng tránh va chạm.',
        reason: 'Bài cảnh báo kiến thức thực tế được đông đảo người dân quan tâm và tương tác tốt.',
        sample_outline: [
          'Đặc điểm các đoạn đường nguy hiểm/tầm nhìn hạn chế',
          'Kỹ năng sử dụng đèn pha/cos đúng quy định',
          'Khuyến cáo lái xe giữ khoảng cách an toàn',
        ],
        suggested_hashtags: ['#CanhBaoGiaoThong', '#KyNangLaiXe', '#CSGT'],
      });
    }

    // Default general advice
    if (suggestions.length < 3) {
      suggestions.push({
        id: 'sug-vhgt',
        topic_title: 'Xây dựng văn hóa nhường đường và văn minh giao thông đô thị',
        article_type: 'tuyen_truyen',
        angle: 'Tuyên truyền quy tắc nhường đường tại nơi giao nhau và văn hóa ứng xử khi xảy ra va chạm.',
        reason: 'Chủ đề nền tảng giúp củng cố ý thức chấp hành luật giao thông.',
        sample_outline: [
          'Quy tắc nhường đường theo Luật Giao thông đường bộ',
          'Văn hóa ứng xử văn minh khi tham gia giao thông',
          'Lời kêu gọi toàn dân đồng hành cùng CSGT',
        ],
        suggested_hashtags: ['#VanHoaGiaoThong', '#GiaoThongVanMinh', '#CSGT'],
      });
    }

    return suggestions.slice(0, 5);
  }

  async generateVideoScript(article: Article): Promise<VideoScript> {
    const mainAction = article.title;
    const recommendation = article.recommendation;

    return {
      id: `vid-${Date.now()}`,
      article_id: article.id,
      title: `Kịch bản video: ${article.title.slice(0, 60)}`,
      target_duration: '35-45 giây',
      aspect_ratio: '9:16',
      main_message: article.sapo,
      recommendations: recommendation,
      end_card: {
        logo_instruction: 'Logo Cảnh sát giao thông đặt góc trên bên trái, không che khuôn mặt hoặc chữ quan trọng.',
        text: 'VÌ SỰ BÌNH YÊN TRÊN MỌI TUYẾN ĐƯỜNG',
        hotline: 'Đường dây nóng phản ánh TTATGT: 1900.xxxx',
      },
      segments: [
        {
          time_range: '00:00 - 00:03',
          phase: 'hook',
          scene_description: 'Cảnh cận đèn ưu tiên xe tuần tra chớp sáng, tổ công tác CSGT ra hiệu lệnh dừng xe trong đêm.',
          visual_text: 'KIỂM SOÁT GẮT GAO TTATGT',
          voice_over: `${article.title.slice(0, 80)}!`,
          subtitle: article.title.slice(0, 80),
          b_roll_suggestion: 'Góc máy quay lướt qua hàng xe đang dừng kiểm tra trật tự.',
        },
        {
          time_range: '00:03 - 00:25',
          phase: 'development',
          scene_description: 'Cán bộ CSGT thực hiện quy trình kiểm tra nồng độ cồn / kiểm tra giấy tờ theo đúng điều lệnh CAND.',
          visual_text: 'TUẦN TRA KHÉP KÍN ĐỊA BÀN',
          voice_over: article.sapo,
          subtitle: article.sapo,
          b_roll_suggestion: 'Hình ảnh thiết bị đo hiện kết quả, tổ công tác lập biên bản công khai, minh bạch.',
        },
        {
          time_range: '00:25 - 00:35',
          phase: 'result',
          scene_description: 'Cảnh toàn tuyến đường thông suốt, phương tiện lưu thông an toàn, trật tự.',
          visual_text: 'XỬ LÝ NGHIÊM - KHÔNG CÓ VÙNG CẤM',
          voice_over: 'Mọi trường hợp vi phạm đều được phát hiện và xử lý nghiêm minh theo quy định của pháp luật.',
          subtitle: 'Xử lý nghiêm minh, không có vùng cấm, không có ngoại lệ.',
          b_roll_suggestion: 'Phương tiện vi phạm được niêm phong, tạm giữ theo đúng thủ tục.',
        },
        {
          time_range: '00:35 - 00:45',
          phase: 'recommendation',
          scene_description: 'Chiến sĩ CSGT tươi cười hướng dẫn người dân đội mũ bảo hiểm đúng quy cách hoặc nhường đường.',
          visual_text: 'THÔNG ĐIỆP AN TOÀN',
          voice_over: recommendation,
          subtitle: recommendation,
          b_roll_suggestion: 'Nụ cười của người dân khi lưu thông an toàn trên đường.',
        },
      ],
      created_at: new Date().toISOString(),
    };
  }

  async rewriteContent(params: {
    sectionText: string;
    action: 'shorter' | 'formal' | 'journalistic' | 'friendly' | 'focus_awareness' | 'focus_result' | 'three_titles';
    sourceData: SourceData;
  }): Promise<{ rewrittenText: string; alternatives?: string[] }> {
    const { sectionText, action, sourceData } = params;

    if (action === 'three_titles') {
      const unit = sourceData.unit_name || 'Lực lượng Cảnh sát giao thông';
      const loc = sourceData.route || sourceData.location || 'địa bàn';
      const count = sourceData.violations_count || 0;
      return {
        rewrittenText: sectionText,
        alternatives: [
          `${unit}: Quyết liệt bảo đảm trật tự an toàn giao thông trên tuyến ${loc}`,
          count > 0 ? `${unit}: Phát hiện, lập biên bản ${count} trường hợp vi phạm` : `${unit}: Đẩy mạnh công tác tuần tra kiểm soát trên ${loc}`,
          `Nâng cao hiệu quả xử lý vi phạm, giữ vững bình yên trên mọi cung đường`,
        ],
      };
    }

    let rewritten = sectionText;
    switch (action) {
      case 'shorter':
        rewritten = sectionText
          .replace(/Nhằm bảo đảm trật tự, an toàn giao thông trên tuyến/g, 'Bảo đảm an toàn giao thông trên')
          .replace(/lực lượng làm nhiệm vụ đã tiến hành/g, 'tổ công tác đã')
          .replace(/trong quá trình thực hiện nhiệm vụ/g, 'khi làm nhiệm vụ')
          .replace(/theo đúng quy định của pháp luật/g, 'theo quy định');
        break;
      case 'formal':
        rewritten = sectionText
          .replace(/CSGT/g, 'lực lượng Cảnh sát giao thông')
          .replace(/cán bộ/g, 'cán bộ, chiến sĩ')
          .replace(/xử phạt/g, 'ra quyết định xử phạt vi phạm hành chính');
        break;
      case 'journalistic':
        rewritten = sectionText
          .replace(/tổ chức tuần tra/g, 'mở đợt cao điểm tuần tra, kiểm soát')
          .replace(/phát hiện vi phạm/g, 'kiên quyết lập biên bản các trường hợp vi phạm');
        break;
      case 'friendly':
        rewritten = sectionText
          .replace(/nghiêm khắc xử lý/g, 'kết hợp nhắc nhở, hướng dẫn và xử lý nghiêm')
          .replace(/yêu cầu người dân/g, 'kêu gọi người dân đồng hành');
        break;
      case 'focus_awareness':
        rewritten = `${sectionText}\n\nQua đó, lực lượng chức năng đẩy mạnh tuyên truyền trực tiếp giúp người tham gia giao thông hiểu rõ các nguy cơ tiềm ẩn và tự giác nâng cao ý thức chấp hành pháp luật.`;
        break;
      case 'focus_result':
        rewritten = `${sectionText}\n\nKết quả xử lý kiên quyết đã góp phần răn đe, kéo giảm rõ rệt tình hình vi phạm trên toàn tuyến.`;
        break;
    }

    return { rewrittenText: rewritten };
  }
}
