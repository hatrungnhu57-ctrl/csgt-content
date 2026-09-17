// Core Types for CSGT Content System

export type ArticleType =
  | 'ttks' // Kết quả tuần tra, kiểm soát
  | 'xlvp' // Xử lý vi phạm
  | 'nong_do_con' // Nồng độ cồn
  | 'toc_do' // Tốc độ
  | 'xe_tai' // Xe tải (quá tải, cơi nới, vi phạm)
  | 'xe_khach' // Xe khách (nhồi nhét, chạy ẩu)
  | 'hoc_sinh' // Học sinh – thanh thiếu niên
  | 'tuyen_truyen' // Tuyên truyền pháp luật
  | 'ho_tro_dan' // Hỗ trợ người dân
  | 'guong_tot' // Gương người tốt, việc tốt
  | 'su_kien' // Bảo đảm TTATGT sự kiện
  | 'phan_luong' // Phân luồng giao thông
  | 'canh_bao' // Cảnh báo nguy cơ mất ATGT
  | 'tngt' // Tai nạn giao thông
  | 'hoat_dong_csgt' // Hoạt động của lực lượng CSGT
  | 'khac'; // Nội dung khác

export type ArticleStatus =
  | 'DRAFT' // Nháp
  | 'GENERATED' // Đã tạo
  | 'NEEDS_REVIEW' // Cần kiểm tra
  | 'APPROVED' // Đã duyệt
  | 'PUBLISHED' // Đã đăng
  | 'ARCHIVED'; // Lưu trữ

export type ReviewOverallStatus = 'GREEN' | 'YELLOW' | 'RED';

export type ClaimVerificationStatus = 'MATCHED' | 'UNSUPPORTED' | 'CONFLICT';

export interface ViolationEntry {
  id: string;
  violation_name: string;
  count: number;
  legal_reference?: string; // Căn cứ pháp lý
  penalty?: string; // Mức phạt
  verified: boolean; // Trạng thái VERIFIED / NOT VERIFIED
  verified_by?: string;
  verified_at?: string;
}

export interface SourceData {
  // A. Thông tin chính
  date: string; // Ngày thực hiện (YYYY-MM-DD hoặc DD/MM/YYYY)
  time?: string; // Thời gian / ca trực (VD: 19h30 - 23h30)
  location?: string; // Địa điểm cụ thể (Km 45+200, Ngã tư A-B)
  route?: string; // Tuyến đường (Quốc lộ 1A, Tỉnh lộ 848...)
  area?: string; // Địa bàn (Huyện Trà Cú, TP. Cần Thơ...)
  unit_name: string; // Đơn vị thực hiện (Đội CSGT-TT Công an huyện...)
  forces_involved?: string; // Lực lượng tham gia (CSGT phối hợp CSCĐ, Công an xã...)
  main_event: string; // Nội dung/sự việc chính
  actions_taken: string; // Lực lượng đã thực hiện hoạt động gì
  main_results: string; // Kết quả chính đạt được

  // B. Số liệu định lượng
  patrol_shifts?: number; // Số ca công tác
  officers_count?: number; // Số lượt CBCS
  vehicles_inspected?: number; // Số phương tiện kiểm tra
  violations_count?: number; // Số trường hợp vi phạm
  car_count?: number; // Ô tô vi phạm
  motorcycle_count?: number; // Mô tô vi phạm
  other_vehicle_count?: number; // Phương tiện khác
  vehicles_seized?: number; // Tạm giữ phương tiện
  licenses_seized?: number; // Tạm giữ GPLX/giấy tờ
  pending_verification?: number; // Chờ xác minh
  fines_amount?: string; // Số tiền xử phạt (ước tính hoặc chính thức)
  citizen_support_result?: string; // Kết quả hỗ trợ người dân (giúp đỡ bao nhiêu người...)

  // C. Hành vi vi phạm chi tiết
  violations: ViolationEntry[];

  // D. Khác
  highlights?: string; // Nội dung nổi bật
  difficulties?: string; // Khó khăn
  notes?: string; // Ghi chú nghiệp vụ
  target_recommendation?: string; // Khuyến cáo mong muốn người dân thực hiện
  source_document_name?: string; // Tài liệu nguồn (Báo cáo số... ngày...)
  raw_report_text?: string; // Đoạn text thô dán vào (nếu có)
  accident_cause_status?: 'confirmed' | 'investigating' | 'not_applicable'; // Trạng thái nguyên nhân TNGT
  accident_cause_note?: string; // Ghi chú nguyên nhân nếu có kết luận chính thức
}

export interface FactCheckClaim {
  claim: string;
  source_fact?: string;
  status: ClaimVerificationStatus;
  explanation: string;
  category: 'quantitative' | 'qualitative' | 'legal' | 'privacy';
}

export interface FactCheckResult {
  overall_result: 'PASS' | 'FAIL' | 'WARNING';
  claims: FactCheckClaim[];
  unsupported_count: number;
  conflict_count: number;
  matched_count: number;
  summary: string;
}

export interface PrivacySanitizeIssue {
  type: 'full_name' | 'license_plate' | 'phone' | 'id_card' | 'driver_license' | 'detailed_address' | 'qr_code' | 'other';
  original_text: string;
  sanitized_text: string;
  index?: number;
  description: string;
}

export interface PrivacyReviewResult {
  is_safe: boolean;
  issues_found: PrivacySanitizeIssue[];
  sanitized_content: {
    title: string;
    sapo: string;
    body: string;
    recommendation: string;
  };
}

export interface UnitNameReviewResult {
  is_valid: boolean;
  warnings: string[];
  first_occurrence_full: boolean; // Có dùng cụm "Cảnh sát giao thông" đầy đủ lần đầu không
  abbreviations_detected: string[]; // C08, PC08, Đội 6...
}

export interface LegalReviewResult {
  is_valid: boolean;
  unverified_references: string[];
  verified_references: string[];
  warnings: string[];
}

export interface AccidentReviewResult {
  is_valid: boolean;
  speculation_detected: boolean;
  warnings: string[];
}

export interface ReviewChecklist {
  // Nội dung
  title_body_aligned: boolean;
  sapo_accurate: boolean;
  time_present: boolean;
  location_present: boolean;
  unit_name_correct: boolean;
  numbers_matched: boolean;
  no_hallucination: boolean;

  // Pháp luật
  violations_match_source: boolean;
  legal_references_verified: boolean;
  penalties_verified: boolean;

  // Thông tin cá nhân
  names_abbreviated: boolean;
  plates_masked: boolean;
  no_phone_numbers: boolean;
  no_id_cards: boolean;
  no_driver_licenses: boolean;
  no_detailed_addresses: boolean;

  // Biên tập
  has_recommendation: boolean;
  has_proper_hashtags: boolean;
  tone_objective: boolean;
  no_sensationalism: boolean;
  no_excessive_emojis: boolean;
}

export interface ArticleReviewSummary {
  overall_status: ReviewOverallStatus; // GREEN | YELLOW | RED
  checklist: ReviewChecklist;
  fact_check: FactCheckResult;
  privacy_review: PrivacyReviewResult;
  unit_name_review: UnitNameReviewResult;
  legal_review: LegalReviewResult;
  accident_review?: AccidentReviewResult;
  timestamp: string;
  can_publish: boolean;
  blockers: string[];
  warnings: string[];
}

export interface ArticleVersion {
  id: string;
  article_id: string;
  version_number: number;
  title: string;
  sapo: string;
  body: string;
  recommendation: string;
  hashtags: string[];
  created_at: string;
  edited_by: string;
  change_summary: string;
}

export interface Article {
  id: string;
  user_id: string;
  unit_id: string;
  title: string;
  sapo: string;
  body: string;
  recommendation: string;
  hashtags: string[];
  article_type: ArticleType;
  topic: string;
  status: ArticleStatus;
  source_data: SourceData; // Dữ liệu nghiệp vụ gốc (chứa số liệu đầy đủ)
  source_snapshot: SourceData; // Bất biến tại thời điểm AI tạo bài
  public_content: {
    title: string;
    sapo: string;
    body: string;
    recommendation: string;
    hashtags: string[];
  };
  review_summary?: ArticleReviewSummary;
  similarity_warning?: {
    similar_article_id: string;
    similar_title: string;
    similarity_percentage: number;
    published_date: string;
    suggestion: string;
  };
  version: number;
  published_at?: string;
  published_url?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface UnitProfile {
  id: string;
  full_name: string; // Tên đầy đủ: Công an huyện Trà Cú - Công an tỉnh Trà Vinh
  short_name: string; // Tên rút gọn thường gọi
  parent_unit: string; // Đơn vị cấp trên: Công an tỉnh Trà Vinh
  department: string; // Đội Cảnh sát giao thông - trật tự
  location: string; // Địa bàn quản lý: Huyện Trà Cú, tỉnh Trà Vinh
  force_display_name: string; // Cách ghi tên lực lượng: Lực lượng Cảnh sát giao thông Công an huyện Trà Cú
  channel_name: string; // Trang/kênh truyền thông: CSGT Trà Cú / Fanpage Công an huyện
  default_hashtags: string[]; // Hashtag mặc định: #CSGT #ATGT #CongAnTraCu
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  badge_number: string; // Số hiệu CAND
  rank: string; // Cấp bậc: Đại úy, Thiếu tá...
  role: 'officer' | 'team_lead' | 'commander' | 'admin';
  unit_id: string;
}

export interface MonthlyTarget {
  id: string;
  user_id: string;
  month: number; // 1 - 12
  year: number; // 2026
  target_count: number; // Mặc định 3 bài
  completed_count: number;
  draft_count: number;
  in_review_count: number;
  published_count: number;
  deadline_alert_level: 'normal' | 'mild_warning' | 'urgent_warning';
  days_left_in_month: number;
}

export interface TopicSuggestion {
  id: string;
  topic_title: string;
  article_type: ArticleType;
  angle: string; // Góc tuyên truyền
  reason: string; // Vì sao đề xuất (ví dụ: Tháng này chưa có bài về học sinh, tháng trước đã viết nhiều nồng độ cồn)
  sample_outline: string[];
  suggested_hashtags: string[];
}

export interface VideoScriptSegment {
  time_range: string; // "00:00 - 00:03"
  phase: 'hook' | 'development' | 'result' | 'recommendation' | 'end_card';
  scene_description: string; // Mô tả cảnh quay
  visual_text: string; // Chữ hiển thị trên màn hình
  voice_over: string; // Lời bình (đọc)
  subtitle: string; // Phụ đề hiển thị
  b_roll_suggestion: string; // Gợi ý hình ảnh chèn thêm
}

export interface VideoScript {
  id: string;
  article_id: string;
  title: string;
  target_duration: string; // "30-45 giây"
  aspect_ratio: '9:16';
  main_message: string;
  segments: VideoScriptSegment[];
  recommendations: string;
  end_card: {
    logo_instruction: string; // "Logo CSGT đặt góc trên bên trái, không che chữ"
    text: string;
    hotline?: string;
  };
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  article_id?: string;
  action:
    | 'ARTICLE_CREATED'
    | 'ARTICLE_EDITED'
    | 'AI_GENERATED'
    | 'AI_REWRITTEN'
    | 'DATA_EXTRACTED'
    | 'FACT_CHECKED'
    | 'PRIVACY_SANITIZED'
    | 'LEGAL_VERIFIED'
    | 'STATUS_CHANGED'
    | 'ARTICLE_PUBLISHED'
    | 'VERSION_RESTORED'
    | 'ARTICLE_DELETED';
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
