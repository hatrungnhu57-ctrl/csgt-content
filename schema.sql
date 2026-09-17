-- ================================================================
-- CSGT CONTENT - DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- Dành cho hệ thống nhiều Cán bộ, nhiều Tổ/Đội và Chỉ huy đơn vị
-- ================================================================

-- 1. BẢNG ĐƠN VỊ (UNITS)
CREATE TABLE IF NOT EXISTS units (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    parent_unit VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    location VARCHAR(255),
    force_display_name VARCHAR(255),
    channel_name VARCHAR(255),
    default_hashtags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG NGƯỜI DÙNG / CÁN BỘ CHIẾN SĨ (USERS)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    unit_id VARCHAR(50) REFERENCES units(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    badge_number VARCHAR(50),
    rank VARCHAR(50),
    role VARCHAR(20) DEFAULT 'officer' CHECK (role IN ('officer', 'team_lead', 'commander', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG TIN BÀI TUYÊN TRUYỀN (ARTICLES)
CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    unit_id VARCHAR(50) REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sapo TEXT NOT NULL,
    body TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    hashtags TEXT[],
    article_type VARCHAR(50) NOT NULL,
    topic VARCHAR(100),
    status VARCHAR(30) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'GENERATED', 'NEEDS_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
    source_data JSONB NOT NULL,
    source_snapshot JSONB NOT NULL,
    public_content JSONB NOT NULL,
    review_summary JSONB,
    similarity_warning JSONB,
    version INT DEFAULT 1,
    published_at TIMESTAMP WITH TIME ZONE,
    published_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG LỊCH SỬ PHIÊN BẢN (ARTICLE_VERSIONS)
CREATE TABLE IF NOT EXISTS article_versions (
    id VARCHAR(50) PRIMARY KEY,
    article_id VARCHAR(50) REFERENCES articles(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    title TEXT NOT NULL,
    sapo TEXT NOT NULL,
    body TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    hashtags TEXT[],
    edited_by VARCHAR(100),
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG THEO DÕI CHỈ TIÊU THÁNG (MONTHLY_TARGETS)
CREATE TABLE IF NOT EXISTS monthly_targets (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    target_count INT DEFAULT 3,
    completed_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month, year)
);

-- 6. BẢNG NHẬT KÝ KIỂM TOÁN (AUDIT_LOGS)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    article_id VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CHÈN DỮ LIỆU MẪU BAN ĐẦU
INSERT INTO units (id, full_name, short_name, parent_unit, department, location, force_display_name, channel_name, default_hashtags)
VALUES (
    'unit-tracu-01',
    'Đội Cảnh sát giao thông - trật tự, Công an huyện Trà Cú',
    'CSGT Trà Cú',
    'Công an tỉnh Trà Vinh',
    'Đội Cảnh sát giao thông - trật tự',
    'Huyện Trà Cú, tỉnh Trà Vinh',
    'Lực lượng Cảnh sát giao thông Công an huyện Trà Cú',
    'Trang Thông tin CSGT Công an huyện Trà Cú',
    ARRAY['#CSGT', '#ATGT', '#CongAnTraCu', '#TraVinhAnToan']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, unit_id, name, email, badge_number, rank, role)
VALUES (
    'user-001',
    'unit-tracu-01',
    'Đại úy Nguyễn Văn Hùng',
    'hung.csgt.tracu@bocongan.gov.vn',
    '284-912',
    'Đại úy',
    'officer'
) ON CONFLICT (id) DO NOTHING;
