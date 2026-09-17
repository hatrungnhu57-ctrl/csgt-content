// State Management, Multi-User Auth, Team Targets & Local Storage Persistence

import {
  Article,
  ArticleStatus,
  ArticleType,
  ArticleVersion,
  AuditLogEntry,
  MonthlyTarget,
  SourceData,
  TeamGroup,
  TeamTargetProgress,
  UnitProfile,
  UserAccount,
} from './types';
import { checkArticleSimilarity } from '../guardrails/similarity';
import { factCheckArticleWithSource } from '../guardrails/fact-checker';
import { reviewArticlePrivacy } from '../guardrails/privacy';
import { reviewArticleLegal } from '../guardrails/legal';
import { reviewUnitNames } from '../guardrails/unit-name';
import { reviewAccidentContent } from '../guardrails/accident';

const STORAGE_KEYS = {
  CURRENT_USER: 'csgt_current_user_v2',
  ACCOUNTS: 'csgt_accounts_v2',
  ARTICLES: 'csgt_articles_v2',
  VERSIONS: 'csgt_versions_v2',
  AUDIT_LOGS: 'csgt_audit_logs_v2',
  UNIT_PROFILE: 'csgt_unit_profile_v2',
  TARGET_SETTING: 'csgt_target_setting_v2',
};

// Default Unit Profile with 3 default Teams
export const DEFAULT_UNIT_PROFILE: UnitProfile = {
  id: 'unit-01',
  full_name: 'Đội Cảnh sát giao thông - trật tự, Công an huyện',
  short_name: 'CSGT Đơn vị',
  parent_unit: 'Công an tỉnh / thành phố',
  department: 'Đội Cảnh sát giao thông - trật tự',
  location: 'Địa bàn quản lý',
  force_display_name: 'Lực lượng Cảnh sát giao thông Công an huyện',
  channel_name: 'Trang Thông tin CSGT Công an huyện',
  default_hashtags: ['#CSGT', '#ATGT', '#CongAnNhanDan', '#ViBinhYenCuocSong'],
  teams: [
    {
      id: 'to-1',
      name: 'Tổ 1 - Tuần tra kiểm soát tuyến Quốc lộ',
      leader_name: 'Đại úy Nguyễn Văn A',
      member_count: 6,
      target_count: 3,
    },
    {
      id: 'to-2',
      name: 'Tổ 2 - Tuần tra kiểm soát tuyến Tỉnh lộ & Đô thị',
      leader_name: 'Thượng úy Trần Văn B',
      member_count: 6,
      target_count: 3,
    },
    {
      id: 'to-3',
      name: 'Tổ 3 - Xử lý vi phạm & Tuyên truyền an toàn',
      leader_name: 'Đại úy Lê Thị C',
      member_count: 4,
      target_count: 3,
    },
  ],
  created_at: '2026-09-01T08:00:00.000Z',
  updated_at: '2026-09-01T08:00:00.000Z',
};

// Default Seed Accounts (Admin + Tổ 1, Tổ 2, Tổ 3)
export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc-admin',
    username: 'admin',
    password: '123',
    name: 'Chỉ huy Đội (Quản trị hệ thống)',
    badge_number: 'BCH-01',
    rank: 'Trung tá',
    role: 'admin',
    unit_id: 'unit-01',
  },
  {
    id: 'acc-to1',
    username: 'to1',
    password: '123',
    name: 'Tổ 1 - TTKS Quốc lộ',
    badge_number: 'TO1-01',
    rank: 'Đại úy',
    role: 'team',
    team_id: 'to-1',
    team_name: 'Tổ 1 - Tuần tra kiểm soát tuyến Quốc lộ',
    unit_id: 'unit-01',
  },
  {
    id: 'acc-to2',
    username: 'to2',
    password: '123',
    name: 'Tổ 2 - TTKS Tỉnh lộ & Đô thị',
    badge_number: 'TO2-01',
    rank: 'Thượng úy',
    role: 'team',
    team_id: 'to-2',
    team_name: 'Tổ 2 - Tuần tra kiểm soát tuyến Tỉnh lộ & Đô thị',
    unit_id: 'unit-01',
  },
  {
    id: 'acc-to3',
    username: 'to3',
    password: '123',
    name: 'Tổ 3 - Tuyên truyền & XLVPHC',
    badge_number: 'TO3-01',
    rank: 'Đại úy',
    role: 'team',
    team_id: 'to-3',
    team_name: 'Tổ 3 - Xử lý vi phạm & Tuyên truyền an toàn',
    unit_id: 'unit-01',
  },
];

// Sample Seed Articles
export const INITIAL_SEED_ARTICLES: Article[] = [
  {
    id: 'art-001',
    user_id: 'acc-to1',
    author_name: 'Tổ 1 - TTKS Quốc lộ',
    team_id: 'to-1',
    team_name: 'Tổ 1 - Tuần tra kiểm soát tuyến Quốc lộ',
    unit_id: 'unit-01',
    title: 'Đội Cảnh sát giao thông - trật tự: Xử lý nghiêm 14 trường hợp vi phạm nồng độ cồn',
    sapo: 'Nhằm bảo đảm trật tự, an toàn giao thông trên địa bàn, ngày 05/09/2026, lực lượng Cảnh sát giao thông đã tăng cường kiểm soát, phát hiện và lập biên bản xử lý 14 trường hợp vi phạm nồng độ cồn.',
    body: 'Thực hiện cao điểm bảo đảm trật tự an toàn giao thông, tối ngày 05/09/2026 (từ 19h00 đến 23h30), tổ công tác thuộc Đội Cảnh sát giao thông - trật tự đã huy động 10 lượt cán bộ, chiến sĩ tổ chức cắm chốt kiểm tra trên tuyến Quốc lộ.\n\nTrong ca công tác, tổ làm nhiệm vụ đã dừng kiểm tra 120 lượt phương tiện. Qua đó phát hiện 14 trường hợp người điều khiển mô tô vi phạm nồng độ cồn. Lực lượng chức năng đã tiến hành niêm phong, tạm giữ 14 phương tiện và tạm giữ 14 giấy phép lái xe theo đúng quy định của pháp luật.',
    recommendation: 'Lực lượng Cảnh sát giao thông khuyến cáo nhân dân: Tuyệt đối tuân thủ thông điệp "Đã uống rượu bia - Không lái xe". Việc chấp hành nghiêm quy định pháp luật góp phần bảo vệ tính mạng cho chính bản thân và bình yên cho mọi gia đình.',
    hashtags: ['#CSGT', '#ATGT', '#DaUongRuouBiaKhongLaiXe', '#TTATGT'],
    article_type: 'nong_do_con',
    topic: 'Nồng độ cồn',
    status: 'PUBLISHED',
    source_data: {
      date: '2026-09-05',
      time: '19h00 - 23h30',
      location: 'Khu vực trung tâm',
      route: 'Quốc lộ',
      unit_name: 'Đội Cảnh sát giao thông - trật tự',
      team_name: 'Tổ 1',
      main_event: 'Kiểm soát nồng độ cồn trong đêm',
      actions_taken: 'Cắm chốt kiểm tra tại Km 42 Quốc lộ',
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
      location: 'Khu vực trung tâm',
      route: 'Quốc lộ',
      unit_name: 'Đội Cảnh sát giao thông - trật tự',
      main_event: 'Kiểm soát nồng độ cồn trong đêm',
      actions_taken: 'Cắm chốt kiểm tra tại Km 42 Quốc lộ',
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
      title: 'Đội Cảnh sát giao thông - trật tự: Xử lý nghiêm 14 trường hợp vi phạm nồng độ cồn',
      sapo: 'Nhằm bảo đảm trật tự, an toàn giao thông trên địa bàn, ngày 05/09/2026, lực lượng Cảnh sát giao thông đã tăng cường kiểm soát, phát hiện và lập biên bản xử lý 14 trường hợp vi phạm nồng độ cồn.',
      body: 'Thực hiện cao điểm bảo đảm trật tự an toàn giao thông, tối ngày 05/09/2026 (từ 19h00 đến 23h30), tổ công tác thuộc Đội Cảnh sát giao thông - trật tự đã huy động 10 lượt cán bộ, chiến sĩ tổ chức cắm chốt kiểm tra trên tuyến Quốc lộ.\n\nTrong ca công tác, tổ làm nhiệm vụ đã dừng kiểm tra 120 lượt phương tiện. Qua đó phát hiện 14 trường hợp người điều khiển mô tô vi phạm nồng độ cồn. Lực lượng chức năng đã tiến hành niêm phong, tạm giữ 14 phương tiện và tạm giữ 14 giấy phép lái xe theo đúng quy định của pháp luật.',
      recommendation: 'Lực lượng Cảnh sát giao thông khuyến cáo nhân dân: Tuyệt đối tuân thủ thông điệp "Đã uống rượu bia - Không lái xe". Việc chấp hành nghiêm quy định pháp luật góp phần bảo vệ tính mạng cho chính bản thân và bình yên cho mọi gia đình.',
      hashtags: ['#CSGT', '#ATGT', '#DaUongRuouBiaKhongLaiXe', '#TTATGT'],
    },
    version: 1,
    published_at: '2026-09-06T09:00:00.000Z',
    created_at: '2026-09-05T23:45:00.000Z',
    updated_at: '2026-09-06T09:00:00.000Z',
  },
  {
    id: 'art-002',
    user_id: 'acc-to2',
    author_name: 'Tổ 2 - TTKS Tỉnh lộ & Đô thị',
    team_id: 'to-2',
    team_name: 'Tổ 2 - Tuần tra kiểm soát tuyến Tỉnh lộ & Đô thị',
    unit_id: 'unit-01',
    title: 'Đội Cảnh sát giao thông - trật tự: Tăng cường tuần tra, xử lý 09 trường hợp chạy quá tốc độ quy định',
    sapo: 'Ngày 12/09/2026, lực lượng Cảnh sát giao thông đã triển khai chuyên đề kiểm soát tốc độ trên tuyến Tỉnh lộ, phát hiện và lập biên bản xử lý 09 trường hợp tài xế chạy quá tốc độ cho phép.',
    body: 'Nhằm phòng ngừa tai nạn giao thông từ nguyên nhân chạy quá tốc độ, sáng ngày 12/09/2026, tổ tuần tra kiểm soát giao thông đã bố trí máy đo tốc độ ghi hình tự động kết hợp tổ công tác công khai trên tuyến Tỉnh lộ.\n\nQua kiểm soát hơn 80 lượt xe lưu thông, lực lượng chức năng phát hiện 09 trường hợp vi phạm (gồm 03 ô tô và 06 mô tô). Tất cả các trường hợp đều được thông báo hình ảnh vi phạm rõ ràng và lập biên bản xử lý vi phạm hành chính.',
    recommendation: 'Cảnh sát giao thông khuyến cáo người điều khiển phương tiện: Luôn làm chủ tốc độ, chú ý quan sát biển báo hiệu đường bộ và giữ khoảng cách an toàn, đặc biệt tại các đoạn đường giao cắt, khu dân cư đông đúc.',
    hashtags: ['#CSGT', '#ATGT', '#LamChuTocDo', '#TocDoAnToan'],
    article_type: 'toc_do',
    topic: 'Tốc độ',
    status: 'PUBLISHED',
    source_data: {
      date: '2026-09-12',
      time: '08h00 - 11h30',
      location: 'Tuyến Tỉnh lộ',
      route: 'Tỉnh lộ',
      unit_name: 'Đội Cảnh sát giao thông - trật tự',
      team_name: 'Tổ 2',
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
      location: 'Tuyến Tỉnh lộ',
      route: 'Tỉnh lộ',
      unit_name: 'Đội Cảnh sát giao thông - trật tự',
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
      title: 'Đội Cảnh sát giao thông - trật tự: Tăng cường tuần tra, xử lý 09 trường hợp chạy quá tốc độ quy định',
      sapo: 'Ngày 12/09/2026, lực lượng Cảnh sát giao thông đã triển khai chuyên đề kiểm soát tốc độ trên tuyến Tỉnh lộ, phát hiện và lập biên bản xử lý 09 trường hợp tài xế chạy quá tốc độ cho phép.',
      body: 'Nhằm phòng ngừa tai nạn giao thông từ nguyên nhân chạy quá tốc độ, sáng ngày 12/09/2026, tổ tuần tra kiểm soát giao thông đã bố trí máy đo tốc độ ghi hình tự động kết hợp tổ công tác công khai trên tuyến Tỉnh lộ.\n\nQua kiểm soát hơn 80 lượt xe lưu thông, lực lượng chức năng phát hiện 09 trường hợp vi phạm (gồm 03 ô tô và 06 mô tô). Tất cả các trường hợp đều được thông báo hình ảnh vi phạm rõ ràng và lập biên bản xử lý vi phạm hành chính.',
      recommendation: 'Cảnh sát giao thông khuyến cáo người điều khiển phương tiện: Luôn làm chủ tốc độ, chú ý quan sát biển báo hiệu đường bộ và giữ khoảng cách an toàn, đặc biệt tại các đoạn đường giao cắt, khu dân cư đông đúc.',
      hashtags: ['#CSGT', '#ATGT', '#LamChuTocDo', '#TocDoAnToan'],
    },
    version: 1,
    published_at: '2026-09-13T08:30:00.000Z',
    created_at: '2026-09-12T17:00:00.000Z',
    updated_at: '2026-09-13T08:30:00.000Z',
  },
];

class StoreManager {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // --- AUTHENTICATION & USER MANAGEMENT ---
  getAccounts(): UserAccount[] {
    if (!this.isBrowser()) return DEFAULT_ACCOUNTS;
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      this.saveAccounts(DEFAULT_ACCOUNTS);
      return DEFAULT_ACCOUNTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  saveAccounts(accounts: UserAccount[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  createAccount(account: Omit<UserAccount, 'id'>): UserAccount {
    const accounts = this.getAccounts();
    const newAcc: UserAccount = {
      ...account,
      id: `acc-${Date.now()}`,
    };
    accounts.push(newAcc);
    this.saveAccounts(accounts);
    this.addAuditLog({
      id: `log-${Date.now()}`,
      user_id: 'admin',
      user_name: 'Chỉ huy Đội',
      action: 'USER_CREATED',
      description: `Đã tạo tài khoản mới: ${newAcc.username} (${newAcc.name})`,
      timestamp: new Date().toISOString(),
    });
    return newAcc;
  }

  deleteAccount(accountId: string): void {
    const accounts = this.getAccounts().filter(a => a.id !== accountId);
    this.saveAccounts(accounts);
  }

  getCurrentUser(): UserAccount | null {
    if (!this.isBrowser()) return DEFAULT_ACCOUNTS[0];
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      // Default to admin initially
      this.setCurrentUser(DEFAULT_ACCOUNTS[0]);
      return DEFAULT_ACCOUNTS[0];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ACCOUNTS[0];
    }
  }

  setCurrentUser(user: UserAccount | null): void {
    if (!this.isBrowser()) return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  login(username: string, password: string):UserAccount | null {
    const accounts = this.getAccounts();
    const found = accounts.find(
      a => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password.trim()
    );
    if (found) {
      this.setCurrentUser(found);
      this.addAuditLog({
        id: `log-${Date.now()}`,
        user_id: found.id,
        user_name: found.name,
        action: 'USER_LOGIN',
        description: `Đăng nhập hệ thống thành công với vai trò: ${found.role}`,
        timestamp: new Date().toISOString(),
      });
      return found;
    }
    return null;
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  // --- ARTICLES ---
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
    const currentUser = this.getCurrentUser();
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
      edited_by: currentUser?.name || article.author_name || 'Cán bộ',
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
      user_id: currentUser?.id || 'unknown',
      user_name: currentUser?.name || 'Cán bộ',
      article_id: article.id,
      action: index >= 0 ? 'ARTICLE_EDITED' : 'ARTICLE_CREATED',
      description: `${index >= 0 ? 'Chỉnh sửa' : 'Tạo mới'} bài viết: "${article.title.slice(0, 50)}..."`,
      timestamp: new Date().toISOString(),
    });
  }

  deleteArticle(id: string): void {
    const currentUser = this.getCurrentUser();
    const articles = this.getArticles().filter(a => a.id !== id);
    this.saveArticles(articles);
    this.addAuditLog({
      id: `log-${Date.now()}`,
      user_id: currentUser?.id || 'unknown',
      user_name: currentUser?.name || 'Cán bộ',
      article_id: id,
      action: 'ARTICLE_DELETED',
      description: `Đã xóa bài viết có ID: ${id}`,
      timestamp: new Date().toISOString(),
    });
  }

  // --- VERSION HISTORY ---
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

  // --- AUDIT LOGS ---
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
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
  }

  // --- UNIT PROFILE & TEAMS ---
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

  // --- TEAM PROGRESS & TARGETS ---
  getAllTeamsProgress(month: number = 9, year: number = 2026): TeamTargetProgress[] {
    const unit = this.getUnitProfile();
    const allArticles = this.getArticles();
    const teams = unit.teams || [];

    return teams.map(team => {
      const teamArticles = allArticles.filter(a => {
        const d = new Date(a.created_at || a.published_at || Date.now());
        const isThisMonth = d.getMonth() + 1 === month && d.getFullYear() === year;
        return isThisMonth && a.team_id === team.id;
      });

      const published = teamArticles.filter(a => a.status === 'PUBLISHED').length;
      const inReview = teamArticles.filter(a => a.status === 'NEEDS_REVIEW' || a.status === 'APPROVED' || a.status === 'GENERATED').length;
      const drafts = teamArticles.filter(a => a.status === 'DRAFT').length;
      const target = team.target_count || 3;

      return {
        team_id: team.id,
        team_name: team.name,
        target_count: target,
        completed_count: published,
        draft_count: drafts,
        in_review_count: inReview,
        is_achieved: published >= target,
        articles: teamArticles,
      };
    });
  }

  // Target for current logged in user/team
  getMonthlyTarget(month: number = 9, year: number = 2026): MonthlyTarget {
    const currentUser = this.getCurrentUser();
    const articles = this.getArticles();

    // If team user, only count team's articles. If admin, count all unit articles.
    const relevantArticles = articles.filter(a => {
      const d = new Date(a.created_at || a.published_at || Date.now());
      const isThisMonth = d.getMonth() + 1 === month && d.getFullYear() === year;
      if (!isThisMonth) return false;
      if (currentUser?.role === 'admin' || currentUser?.role === 'commander') return true;
      return a.team_id === currentUser?.team_id || a.user_id === currentUser?.id;
    });

    const published_count = relevantArticles.filter(a => a.status === 'PUBLISHED').length;
    const in_review_count = relevantArticles.filter(a => a.status === 'NEEDS_REVIEW' || a.status === 'APPROVED' || a.status === 'GENERATED').length;
    const draft_count = relevantArticles.filter(a => a.status === 'DRAFT').length;
    const completed_count = published_count;

    // Configurable target
    let target_count = 3;
    if (currentUser?.team_id) {
      const unit = this.getUnitProfile();
      const team = unit.teams?.find(t => t.id === currentUser.team_id);
      if (team) target_count = team.target_count || 3;
    } else if (this.isBrowser()) {
      const custom = localStorage.getItem(STORAGE_KEYS.TARGET_SETTING);
      if (custom) target_count = parseInt(custom, 10) || 3;
    }

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
      user_id: currentUser?.id || 'admin',
      team_id: currentUser?.team_id,
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
