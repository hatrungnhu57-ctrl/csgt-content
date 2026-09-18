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
  team_name?: string; // Tên tổ công tác (Tổ 1, Tổ 2, Tổ tuần tra đêm...)
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
  first_occurrence_full: boolean;
  abbreviations_detected: string[];
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
  title_body_aligned: boolean;
  sapo_accurate: boolean;
  time_present: boolean;
  location_present: boolean;
  unit_name_correct: boolean;
  numbers_matched: boolean;
  no_hallucination: boolean;

  violations_match_source: boolean;
  legal_references_verified: boolean;
  penalties_verified: boolean;

  names_abbreviated: boolean;
  plates_masked: boolean;
  no_phone_numbers: boolean;
  no_id_cards: boolean;
  no_driver_licenses: boolean;
  no_detailed_addresses: boolean;

  has_recommendation: boolean;
  has_proper_hashtags: boolean;
  tone_objective: boolean;
  no_sensationalism: boolean;
  no_excessive_emojis: boolean;
}

export interface ArticleReviewSummary {
  overall_status: ReviewOverallStatus;
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
  user_id: string; // ID của tài khoản tạo bài
  author_name: string; // Tên cán bộ/tổ tạo bài
  team_id?: string; // ID của tổ (VD: to-1, to-2)
  team_name?: string; // Tên tổ công tác
  unit_id: string;
  title: string;
  sapo: string;
  body: string;
  recommendation: string;
  hashtags: string[];
  article_type: ArticleType;
  topic: string;
  status: ArticleStatus;
  source_data: SourceData;
  source_snapshot: SourceData;
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

export interface TeamGroup {
  id: string;
  name: string; // Tổ 1 - Tuần tra kiểm soát tuyến QL
  leader_name: string;
  member_count: number;
  target_count: number; // Chỉ tiêu của tổ (VD: 3 bài/tháng)
}

export interface UnitProfile {
  id: string;
  full_name: string;
  short_name: string;
  parent_unit: string;
  department: string;
  location: string;
  force_display_name: string;
  channel_name: string;
  default_hashtags: string[];
  teams: TeamGroup[];
  created_at: string;
  updated_at: string;
}

export interface UserAccount {
  id: string;
  username: string; // Tên đăng nhập (VD: admin, to1, to2, to3...)
  password: string; // Mật khẩu (VD: 123456)
  name: string; // Tên hiển thị (VD: Ban Chỉ huy Đội / Tổ 1 - Tuần tra QL53)
  badge_number: string;
  rank: string;
  role: 'admin' | 'commander' | 'team' | 'officer'; // Admin = Chủ hệ thống, Commander = Chỉ huy, Team = Tài khoản Tổ
  team_id?: string;
  team_name?: string;
  unit_id: string;
}

export interface MonthlyTarget {
  id: string;
  user_id: string;
  team_id?: string;
  month: number;
  year: number;
  target_count: number;
  completed_count: number;
  draft_count: number;
  in_review_count: number;
  published_count: number;
  deadline_alert_level: 'normal' | 'mild_warning' | 'urgent_warning';
  days_left_in_month: number;
}

export interface TeamTargetProgress {
  team_id: string;
  team_name: string;
  target_count: number;
  completed_count: number;
  draft_count: number;
  in_review_count: number;
  is_achieved: boolean;
  articles: Article[];
}

export interface TopicSuggestion {
  id: string;
  topic_title: string;
  article_type: ArticleType;
  angle: string;
  reason: string;
  sample_outline: string[];
  suggested_hashtags: string[];
}

export interface VideoScriptSegment {
  time_range: string;
  phase: 'hook' | 'development' | 'result' | 'recommendation' | 'end_card';
  scene_description: string;
  visual_text: string;
  voice_over: string;
  subtitle: string;
  b_roll_suggestion: string;
}

export interface VideoScript {
  id: string;
  article_id: string;
  title: string;
  target_duration: string;
  aspect_ratio: '9:16';
  main_message: string;
  segments: VideoScriptSegment[];
  recommendations: string;
  end_card: {
    logo_instruction: string;
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
    | 'USER_LOGIN'
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'USER_DELETED'
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
