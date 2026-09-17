// State Management, Seed Data & Local Storage Persistence
// Implements Schema (Section XXXIV), Audit Logs (Section XXXV), Version History (Section XXXVI)

import {
  Article,
  ArticleStatus,
  ArticleType,
  ArticleVersion,
  AuditLogEntry,
  MonthlyTarget,
  SourceData,
  UnitProfile,
  UserProfile,
} from './types';
import { checkArticleSimilarity } from '../guardrails/similarity';
import { factCheckArticleWithSource } from '../guardrails/fact-checker';
import { reviewArticlePrivacy } from '../guardrails/privacy';
import { reviewArticleLegal } from '../guardrails/legal';
import { reviewUnitNames } from '../guardrails/unit-name';
import { reviewAccidentContent } from '../guardrails/accident';

const STORAGE_KEYS = {
  ARTICLES: 'csgt_content_articles_v1',
  VERSIONS: 'csgt_content_versions_v1',
  AUDIT_LOGS: 'csgt_content_audit_logs_v1',
  UNIT_PROFILE: 'csgt_content_unit_profile_v1',
  USER_PROFILE: 'csgt_content_user_profile_v1',
  TARGET_SETTING: 'csgt_content_target_setting_v1',
};

// Default Unit Profile
export const DEFAULT_UNIT_PROFILE: UnitProfile = {
  id: 'unit-tracu-01',
  full_name: 'Đội Cảnh sát giao thông - trật tự, Công an huyện Trà Cú',
  short_name: 'CSGT Trà Cú',
  parent_unit: 'Công an tỉnh Trà Vinh',
  department: 'Đội Cảnh sát giao thông - trật tự',
  location: 'Huyện Trà Cú, tỉnh Trà Vinh',
  force_display_name: 'Lực lượng Cảnh sát giao thông Công an huyện Trà Cú',
  channel_name: 'Trang Thông tin CSGT Công an huyện Trà Cú',
  default_hashtags: ['#CSGT', '#ATGT', '#CongAnTraCu', '#TraVinhAnToan'],
  created_at: '2026-09-01T08:00:00.000Z',
  updated_at: '2026-09-01T08:00:00.000Z',
};

// Default User Profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-001',
  name: 'Đại úy Nguyễn Văn Hùng',
  email: 'hung.csgt.tracu@bocongan.gov.vn',
  badge_number: '284-912',
  rank: 'Đại úy',
  role: 'officer',
  unit_id: 'unit-tracu-01',
};

// Sample Seed Articles for Month 09/2026
export const INITIAL_SEED_ARTICLES: Article[] = [
  {
    id: 'art-001',
    user_id: 'user-001',
    unit_id: 'unit-tracu-01',
    title: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú: Xử lý nghiêm 14 trường hợp vi phạm nồng độ cồn',
    sapo: 'Nhằm bảo đảm trật tự, an toàn giao thông trên địa bàn, ngày 05/09/2026, Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú đã tăng cường kiểm soát, phát hiện và lập biên bản xử lý 14 trường hợp vi phạm nồng độ cồn.',
    body: 'Thực hiện cao điểm bảo đảm trật tự an toàn giao thông, tối ngày 05/09/2026 (từ 19h00 đến 23h30), tổ công tác thuộc Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú đã huy động 10 lượt cán bộ, chiến sĩ tổ chức cắm chốt kiểm tra trên tuyến Quốc lộ 53 (đoạn qua thị trấn Trà Cú).\n\nTrong ca công tác, tổ làm nhiệm vụ đã dừng kiểm tra 120 lượt phương tiện. Qua đó phát hiện 14 trường hợp người điều khiển mô tô vi phạm nồng độ cồn. Lực lượng chức năng đã tiến hành niêm phong, tạm giữ 14 phương tiện và tạm giữ 14 giấy phép lái xe theo đúng quy định của pháp luật.',
    recommendation: 'Lực lượng Cảnh sát giao thông khuyến cáo nhân dân: Tuyệt đối tuân thủ thông điệp "Đã uống rượu bia - Không lái xe". Việc chấp hành nghiêm quy định pháp luật góp phần bảo vệ tính mạng cho chính bản thân và bình yên cho mọi gia đình.',
    hashtags: ['#CSGT', '#ATGT', '#DaUongRuouBiaKhongLaiXe', '#CSGTTraCu', '#QuocLo53'],
    article_type: 'nong_do_con',
    topic: 'Nồng độ cồn',
    status: 'PUBLISHED',
    source_data: {
      date: '2026-09-05',
      time: '19h00 - 23h30',
      location: 'Thị trấn Trà Cú',
      route: 'Quốc lộ 53',
      unit_name: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú',
      main_event: 'Kiểm soát nồng độ cồn trong đêm',
      actions_taken: 'Cắm chốt kiểm tra tại Km 42 Quốc lộ 53',
      main_results: 'Phát hiện xử lý 14 trường hợp vi phạm',
      officers_count: 10,
      vehicles_inspected: 120,
      violations_count: 14,
      motorcycle_count: 14,
      vehicles_seized: 14,
      licenses_seized: 14,
      violations: [
        {
          id: 'v1',
          violation_name: 'Điều khiển xe mô tô trên đường mà trong máu hoặc hơi thở có nồng độ cồn',
          count: 14,
          legal_reference: 'Nghị định 100/2019/NĐ-CP',
          penalty: 'Từ 2 - 8 triệu đồng, tước GPLX',
          verified: true,
        },
      ],
    },
    source_snapshot: {
      date: '2026-09-05',
      time: '19h00 - 23h30',
      location: 'Thị trấn Trà Cú',
      route: 'Quốc lộ 53',
      unit_name: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú',
      main_event: 'Kiểm soát nồng độ cồn trong đêm',
      actions_taken: 'Cắm chốt kiểm tra tại Km 42 Quốc lộ 53',
      main_results: 'Phát hiện xử lý 14 trường hợp vi phạm',
      officers_count: 10,
      vehicles_inspected: 120,
      violations_count: 14,
      motorcycle_count: 14,
      vehicles_seized: 14,
      licenses_seized: 14,
      violations: [
        {
          id: 'v1',
          violation_name: 'Điều khiển xe mô tô trên đường mà trong máu hoặc hơi thở có nồng độ cồn',
          count: 14,
          legal_reference: 'Nghị định 100/2019/NĐ-CP',
          penalty: 'Từ 2 - 8 triệu đồng, tước GPLX',
          verified: true,
        },
      ],
    },
    public_content: {
      title: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú: Xử lý nghiêm 14 trường hợp vi phạm nồng độ cồn',
      sapo: 'Nhằm bảo đảm trật tự, an toàn giao thông trên địa bàn, ngày 05/09/2026, Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú đã tăng cường kiểm soát, phát hiện và lập biên bản xử lý 14 trường hợp vi phạm nồng độ cồn.',
      body: 'Thực hiện cao điểm bảo đảm trật tự an toàn giao thông, tối ngày 05/09/2026 (từ 19h00 đến 23h30), tổ công tác thuộc Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú đã huy động 10 lượt cán bộ, chiến sĩ tổ chức cắm chốt kiểm tra trên tuyến Quốc lộ 53 (đoạn qua thị trấn Trà Cú).\n\nTrong ca công tác, tổ làm nhiệm vụ đã dừng kiểm tra 120 lượt phương tiện. Qua đó phát hiện 14 trường hợp người điều khiển mô tô vi phạm nồng độ cồn. Lực lượng chức năng đã tiến hành niêm phong, tạm giữ 14 phương tiện và tạm giữ 14 giấy phép lái xe theo đúng quy định của pháp luật.',
      recommendation: 'Lực lượng Cảnh sát giao thông khuyến cáo nhân dân: Tuyệt đối tuân thủ thông điệp "Đã uống rượu bia - Không lái xe". Việc chấp hành nghiêm quy định pháp luật góp phần bảo vệ tính mạng cho chính bản thân và bình yên cho mọi gia đình.',
      hashtags: ['#CSGT', '#ATGT', '#DaUongRuouBiaKhongLaiXe', '#CSGTTraCu', '#QuocLo53'],
    },
    version: 1,
    published_at: '2026-09-06T09:00:00.000Z',
    published_url: 'https://facebook.com/csgt.tracu/posts/101',
    created_at: '2026-09-05T23:45:00.000Z',
    updated_at: '2026-09-06T09:00:00.000Z',
  },
  {
    id: 'art-002',
    user_id: 'user-001',
    unit_id: 'unit-tracu-01',
    title: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú: Tăng cường tuần tra, xử lý 09 trường hợp chạy quá tốc độ quy định',
    sapo: 'Ngày 12/09/2026, Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú đã triển khai chuyên đề kiểm soát tốc độ trên tuyến Tỉnh lộ 914, phát hiện và lập biên bản xử lý 09 trường hợp tài xế chạy quá tốc độ cho phép.',
    body: 'Nhằm phòng ngừa tai nạn giao thông từ nguyên nhân chạy quá tốc độ, sáng ngày 12/09/2026, tổ tuần tra kiểm soát giao thông đã bố trí máy đo tốc độ ghi hình tự động kết hợp tổ công tác công khai trên tuyến Tỉnh lộ 914.\n\nQua kiểm soát hơn 80 lượt xe lưu thông, lực lượng chức năng phát hiện 09 trường hợp vi phạm (gồm 03 ô tô và 06 mô tô). Tất cả các trường hợp đều được thông báo hình ảnh vi phạm rõ ràng và lập biên bản xử lý vi phạm hành chính.',
    recommendation: 'Cảnh sát giao thông khuyến cáo người điều khiển phương tiện: Luôn làm chủ tốc độ, chú ý quan sát biển báo hiệu đường bộ và giữ khoảng cách an toàn, đặc biệt tại các đoạn đường giao cắt, khu dân cư đông đúc.',
    hashtags: ['#CSGT', '#ATGT', '#LamChuTocDo', '#TocDoAnToan', '#TinhLo914'],
    article_type: 'toc_do',
    topic: 'Tốc độ',
    status: 'PUBLISHED',
    source_data: {
      date: '2026-09-12',
      time: '08h00 - 11h30',
      location: 'Xã Đại An',
      route: 'Tỉnh lộ 914',
      unit_name: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú',
      main_event: 'Kiểm soát tốc độ phương tiện',
      actions_taken: 'Đo tốc độ bằng thiết bị kỹ thuật nghiệp vụ kết hợp dừng xe công khai',
      main_results: 'Phát hiện xử lý 09 trường hợp vi phạm tốc độ',
      officers_count: 6,
      vehicles_inspected: 85,
      violations_count: 9,
      car_count: 3,
      motorcycle_count: 6,
      licenses_seized: 9,
      violations: [
        {
          id: 'v2',
          violation_name: 'Điều khiển xe chạy quá tốc độ quy định từ 10 km/h đến 20 km/h',
          count: 9,
          legal_reference: 'Nghị định 100/2019/NĐ-CP',
          penalty: 'Phạt tiền theo khung quy định',
          verified: true,
        },
      ],
    },
    source_snapshot: {
      date: '2026-09-12',
      time: '08h00 - 11h30',
      location: 'Xã Đại An',
      route: 'Tỉnh lộ 914',
      unit_name: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú',
      main_event: 'Kiểm soát tốc độ phương tiện',
      actions_taken: 'Đo tốc độ bằng thiết bị kỹ thuật nghiệp vụ kết hợp dừng xe công khai',
      main_results: 'Phát hiện xử lý 09 trường hợp vi phạm tốc độ',
      officers_count: 6,
      vehicles_inspected: 85,
      violations_count: 9,
      car_count: 3,
      motorcycle_count: 6,
      licenses_seized: 9,
      violations: [
        {
          id: 'v2',
          violation_name: 'Điều khiển xe chạy quá tốc độ quy định từ 10 km/h đến 20 km/h',
          count: 9,
          legal_reference: 'Nghị định 100/2019/NĐ-CP',
          penalty: 'Phạt tiền theo khung quy định',
          verified: true,
        },
      ],
    },
    public_content: {
      title: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú: Tăng cường tuần tra, xử lý 09 trường hợp chạy quá tốc độ quy định',
      sapo: 'Ngày 12/09/2026, Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú đã triển khai chuyên đề kiểm soát tốc độ trên tuyến Tỉnh lộ 914, phát hiện và lập biên bản xử lý 09 trường hợp tài xế chạy quá tốc độ cho phép.',
      body: 'Nhằm phòng ngừa tai nạn giao thông từ nguyên nhân chạy quá tốc độ, sáng ngày 12/09/2026, tổ tuần tra kiểm soát giao thông đã bố trí máy đo tốc độ ghi hình tự động kết hợp tổ công tác công khai trên tuyến Tỉnh lộ 914.\n\nQua kiểm soát hơn 80 lượt xe lưu thông, lực lượng chức năng phát hiện 09 trường hợp vi phạm (gồm 03 ô tô và 06 mô tô). Tất cả các trường hợp đều được thông báo hình ảnh vi phạm rõ ràng và lập biên bản xử lý vi phạm hành chính.',
      recommendation: 'Cảnh sát giao thông khuyến cáo người điều khiển phương tiện: Luôn làm chủ tốc độ, chú ý quan sát biển báo hiệu đường bộ và giữ khoảng cách an toàn, đặc biệt tại các đoạn đường giao cắt, khu dân cư đông đúc.',
      hashtags: ['#CSGT', '#ATGT', '#LamChuTocDo', '#TocDoAnToan', '#TinhLo914'],
    },
    version: 1,
    published_at: '2026-09-13T08:30:00.000Z',
    published_url: 'https://facebook.com/csgt.tracu/posts/102',
    created_at: '2026-09-12T17:00:00.000Z',
    updated_at: '2026-09-13T08:30:00.000Z',
  },
  {
    id: 'art-003',
    user_id: 'user-001',
    unit_id: 'unit-tracu-01',
    title: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú: Tuyên truyền an toàn giao thông và xử lý học sinh chưa đủ tuổi điều khiển xe máy',
    sapo: 'Ngày 16/09/2026, Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú đã phối hợp với các trường THPT trên địa bàn tăng cường kiểm tra, nhắc nhở và xử lý nghiêm các trường hợp học sinh vi phạm trật tự an toàn giao thông.',
    body: 'Thực hiện kế hoạch tăng cường bảo đảm TTATGT cho lứa tuổi học sinh trong năm học mới 2026 - 2027, sáng 16/09/2026, tổ công tác đã tiến hành tuần tra kiểm soát tại khu vực cổng trường THPT Trà Cú và tuyến đường lân cận.\n\nQua kiểm tra, lực lượng CSGT đã phát hiện 06 trường hợp học sinh điều khiển xe gắn máy dung tích xi lanh trên 50cm3 khi chưa đủ tuổi, không đội mũ bảo hiểm. Tổ công tác đã mời phụ huynh đến làm việc, ký cam kết không giao xe cho con em khi chưa đủ điều kiện theo luật định.',
    recommendation: 'Cảnh sát giao thông đề nghị các bậc phụ huynh và nhà trường: Nâng cao trách nhiệm quản lý, giáo dục con em; tuyệt đối không giao xe mô tô, xe gắn máy cho học sinh khi chưa đủ tuổi hoặc chưa có giấy phép lái xe, bảo vệ an toàn tương lai cho các em.',
    hashtags: ['#CSGT', '#ATGT', '#AnToanGiaoThongHocSinh', '#VanHoaGiaoThong', '#CongAnTraCu'],
    article_type: 'hoc_sinh',
    topic: 'Học sinh – thanh thiếu niên',
    status: 'NEEDS_REVIEW',
    source_data: {
      date: '2026-09-16',
      time: '06h30 - 08h00',
      location: 'Khu vực cổng trường THPT Trà Cú',
      route: 'Đường 3/2, thị trấn Trà Cú',
      unit_name: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú',
      main_event: 'Kiểm tra, xử lý học sinh vi phạm TTATGT đầu năm học',
      actions_taken: 'Cắm chốt kiểm tra kết hợp tuyên truyền nhắc nhở',
      main_results: 'Lập biên bản 06 trường hợp, mời phụ huynh làm việc',
      officers_count: 4,
      vehicles_inspected: 35,
      violations_count: 6,
      motorcycle_count: 6,
      vehicles_seized: 6,
      violations: [
        {
          id: 'v3',
          violation_name: 'Người từ đủ 16 tuổi đến dưới 18 tuổi điều khiển xe mô tô có dung tích xi lanh từ 50 cm3 trở lên',
          count: 6,
          legal_reference: 'Nghị định 100/2019/NĐ-CP',
          penalty: 'Phạt cảnh cáo, phạt tiền đối với chủ phương tiện giao xe',
          verified: true,
        },
      ],
    },
    source_snapshot: {
      date: '2026-09-16',
      time: '06h30 - 08h00',
      location: 'Khu vực cổng trường THPT Trà Cú',
      route: 'Đường 3/2, thị trấn Trà Cú',
      unit_name: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú',
      main_event: 'Kiểm tra, xử lý học sinh vi phạm TTATGT đầu năm học',
      actions_taken: 'Cắm chốt kiểm tra kết hợp tuyên truyền nhắc nhở',
      main_results: 'Lập biên bản 06 trường hợp, mời phụ huynh làm việc',
      officers_count: 4,
      vehicles_inspected: 35,
      violations_count: 6,
      motorcycle_count: 6,
      vehicles_seized: 6,
      violations: [
        {
          id: 'v3',
          violation_name: 'Người từ đủ 16 tuổi đến dưới 18 tuổi điều khiển xe mô tô có dung tích xi lanh từ 50 cm3 trở lên',
          count: 6,
          legal_reference: 'Nghị định 100/2019/NĐ-CP',
          penalty: 'Phạt cảnh cáo, phạt tiền đối với chủ phương tiện giao xe',
          verified: true,
        },
      ],
    },
    public_content: {
      title: 'Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú: Tuyên truyền an toàn giao thông và xử lý học sinh chưa đủ tuổi điều khiển xe máy',
      sapo: 'Ngày 16/09/2026, Đội Cảnh sát giao thông - trật tự Công an huyện Trà Cú đã phối hợp với các trường THPT trên địa bàn tăng cường kiểm tra, nhắc nhở và xử lý nghiêm các trường hợp học sinh vi phạm trật tự an toàn giao thông.',
      body: 'Thực hiện kế hoạch tăng cường bảo đảm TTATGT cho lứa tuổi học sinh trong năm học mới 2026 - 2027, sáng 16/09/2026, tổ công tác đã tiến hành tuần tra kiểm soát tại khu vực cổng trường THPT Trà Cú và tuyến đường lân cận.\n\nQua kiểm tra, lực lượng CSGT đã phát hiện 06 trường hợp học sinh điều khiển xe gắn máy dung tích xi lanh trên 50cm3 khi chưa đủ tuổi, không đội mũ bảo hiểm. Tổ công tác đã mời phụ huynh đến làm việc, ký cam kết không giao xe cho con em khi chưa đủ điều kiện theo luật định.',
      recommendation: 'Cảnh sát giao thông đề nghị các bậc phụ huynh và nhà trường: Nâng cao trách nhiệm quản lý, giáo dục con em; tuyệt đối không giao xe mô tô, xe gắn máy cho học sinh khi chưa đủ tuổi hoặc chưa có giấy phép lái xe, bảo vệ an toàn tương lai cho các em.',
      hashtags: ['#CSGT', '#ATGT', '#AnToanGiaoThongHocSinh', '#VanHoaGiaoThong', '#CongAnTraCu'],
    },
    version: 1,
    created_at: '2026-09-16T10:00:00.000Z',
    updated_at: '2026-09-16T10:00:00.000Z',
  },
];

// Helper Functions to Read/Write LocalStorage
class StoreManager {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Articles
  getArticles(): Article[] {
    if (!this.isBrowser()) return INITIAL_SEED_ARTICLES;
    const raw = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    if (!raw) {
      this.saveArticles(INITIAL_SEED_ARTICLES);
      return INITIAL_SEED_ARTICLES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SEED_ARTICLES;
    }
  }

  saveArticles(articles: Article[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  }

  getArticleById(id: string): Article | undefined {
    return this.getArticles().find(a => a.id === id);
  }

  saveArticle(article: Article): void {
    const articles = this.getArticles();
    const index = articles.findIndex(a => a.id === article.id);

    // Save version history
    this.addArticleVersion({
      id: `ver-${Date.now()}`,
      article_id: article.id,
      version_number: article.version || 1,
      title: article.title,
      sapo: article.sapo,
      body: article.body,
      recommendation: article.recommendation,
      hashtags: article.hashtags,
      created_at: new Date().toISOString(),
      edited_by: 'Đại úy Nguyễn Văn Hùng',
      change_summary: index >= 0 ? `Cập nhật phiên bản v${article.version}` : 'Tạo mới bài viết',
    });

    if (index >= 0) {
      articles[index] = { ...article, updated_at: new Date().toISOString() };
    } else {
      articles.unshift({
        ...article,
        created_at: article.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    this.saveArticles(articles);
    this.addAuditLog({
      id: `log-${Date.now()}`,
      user_id: 'user-001',
      user_name: 'Đại úy Nguyễn Văn Hùng',
      article_id: article.id,
      action: index >= 0 ? 'ARTICLE_EDITED' : 'ARTICLE_CREATED',
      description: `${index >= 0 ? 'Chỉnh sửa' : 'Tạo mới'} bài viết: "${article.title.slice(0, 50)}..."`,
      timestamp: new Date().toISOString(),
    });
  }

  deleteArticle(id: string): void {
    const articles = this.getArticles().filter(a => a.id !== id);
    this.saveArticles(articles);
    this.addAuditLog({
      id: `log-${Date.now()}`,
      user_id: 'user-001',
      user_name: 'Đại úy Nguyễn Văn Hùng',
      article_id: id,
      action: 'ARTICLE_DELETED',
      description: `Đã xóa bài viết có ID: ${id}`,
      timestamp: new Date().toISOString(),
    });
  }

  // Version History
  getArticleVersions(articleId: string): ArticleVersion[] {
    if (!this.isBrowser()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    if (!raw) return [];
    try {
      const allVersions: ArticleVersion[] = JSON.parse(raw);
      return allVersions.filter(v => v.article_id === articleId).sort((a, b) => b.version_number - a.version_number);
    } catch {
      return [];
    }
  }

  addArticleVersion(version: ArticleVersion): void {
    if (!this.isBrowser()) return;
    const raw = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    let allVersions: ArticleVersion[] = [];
    try {
      allVersions = raw ? JSON.parse(raw) : [];
    } catch {
      allVersions = [];
    }
    allVersions.push(version);
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(allVersions));
  }

  // Audit Logs
  getAuditLogs(): AuditLogEntry[] {
    if (!this.isBrowser()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  addAuditLog(entry: AuditLogEntry): void {
    if (!this.isBrowser()) return;
    const logs = this.getAuditLogs();
    logs.unshift(entry);
    // Keep max 200 logs
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
  }

  // Unit Profile
  getUnitProfile(): UnitProfile {
    if (!this.isBrowser()) return DEFAULT_UNIT_PROFILE;
    const raw = localStorage.getItem(STORAGE_KEYS.UNIT_PROFILE);
    if (!raw) {
      this.saveUnitProfile(DEFAULT_UNIT_PROFILE);
      return DEFAULT_UNIT_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_UNIT_PROFILE;
    }
  }

  saveUnitProfile(profile: UnitProfile): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.UNIT_PROFILE, JSON.stringify(profile));
  }

  // Monthly Target Calculation (Section VI)
  getMonthlyTarget(month: number = 9, year: number = 2026): MonthlyTarget {
    const articles = this.getArticles();
    const thisMonthArticles = articles.filter(a => {
      const d = new Date(a.created_at || a.published_at || Date.now());
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const published_count = thisMonthArticles.filter(a => a.status === 'PUBLISHED').length;
    const in_review_count = thisMonthArticles.filter(a => a.status === 'NEEDS_REVIEW' || a.status === 'APPROVED' || a.status === 'GENERATED').length;
    const draft_count = thisMonthArticles.filter(a => a.status === 'DRAFT').length;
    const completed_count = published_count;

    // Configurable target (default 3)
    let target_count = 3;
    if (this.isBrowser()) {
      const custom = localStorage.getItem(STORAGE_KEYS.TARGET_SETTING);
      if (custom) target_count = parseInt(custom, 10) || 3;
    }

    // Calculate current day in month & warning level
    // Context date is 2026-09-17
    const now = new Date();
    const currentDay = now.getDate();
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const days_left_in_month = Math.max(0, totalDaysInMonth - currentDay);

    let deadline_alert_level: 'normal' | 'mild_warning' | 'urgent_warning' = 'normal';
    if (completed_count < target_count) {
      if (currentDay >= 26) {
        deadline_alert_level = 'urgent_warning';
      } else if (currentDay >= 21) {
        deadline_alert_level = 'mild_warning';
      }
    }

    return {
      id: `tgt-${year}-${month}`,
      user_id: 'user-001',
      month,
      year,
      target_count,
      completed_count,
      draft_count,
      in_review_count,
      published_count,
      deadline_alert_level,
      days_left_in_month,
    };
  }

  setTargetCount(count: number): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.TARGET_SETTING, count.toString());
  }
}

export const store = new StoreManager();
