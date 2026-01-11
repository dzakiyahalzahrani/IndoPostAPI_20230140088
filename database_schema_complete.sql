-- ============================================
-- IndoPost-API Complete Database Schema
-- PostgreSQL 14+
-- Includes: Tables + Sample Data + Role System
-- ============================================

-- Drop existing tables if needed (untuk development)
DROP TABLE IF EXISTS request_logs CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS villages CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS regencies CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;

-- ============================================
-- USERS & AUTHENTICATION TABLES
-- ============================================

-- Table: users (WITH ROLE COLUMN)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user', -- NEW: Role column
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_user_role CHECK (role IN ('user', 'admin'))
);

-- Table: api_keys
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0
);

-- Table: request_logs
CREATE TABLE request_logs (
    id SERIAL PRIMARY KEY,
    api_key_id INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WILAYAH DATA TABLES
-- ============================================

-- Table: provinces
CREATE TABLE provinces (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- Table: regencies
CREATE TABLE regencies (
    id SERIAL PRIMARY KEY,
    province_id INTEGER NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
    code VARCHAR(4) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL
);

-- Table: districts
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    regency_id INTEGER NOT NULL REFERENCES regencies(id) ON DELETE CASCADE,
    code VARCHAR(7) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- Table: villages
CREATE TABLE villages (
    id SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    postal_code VARCHAR(5)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- API Keys indexes
CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- Request Logs indexes
CREATE INDEX idx_request_logs_api_key_id ON request_logs(api_key_id);
CREATE INDEX idx_request_logs_created_at ON request_logs(created_at);
CREATE INDEX idx_request_logs_endpoint ON request_logs(endpoint);

-- Wilayah indexes
CREATE INDEX idx_provinces_code ON provinces(code);
CREATE INDEX idx_regencies_province_id ON regencies(province_id);
CREATE INDEX idx_regencies_code ON regencies(code);
CREATE INDEX idx_districts_regency_id ON districts(regency_id);
CREATE INDEX idx_districts_code ON districts(code);
CREATE INDEX idx_villages_district_id ON villages(district_id);
CREATE INDEX idx_villages_code ON villages(code);
CREATE INDEX idx_villages_postal_code ON villages(postal_code);

-- Full-text search indexes
CREATE INDEX idx_provinces_name ON provinces USING gin(to_tsvector('indonesian', name));
CREATE INDEX idx_regencies_name ON regencies USING gin(to_tsvector('indonesian', name));
CREATE INDEX idx_districts_name ON districts USING gin(to_tsvector('indonesian', name));
CREATE INDEX idx_villages_name ON villages USING gin(to_tsvector('indonesian', name));

-- ============================================
-- SAMPLE DATA - PROVINCES (34 Provinsi)
-- ============================================

INSERT INTO provinces (code, name) VALUES
('11', 'ACEH'),
('12', 'SUMATERA UTARA'),
('13', 'SUMATERA BARAT'),
('14', 'RIAU'),
('15', 'JAMBI'),
('16', 'SUMATERA SELATAN'),
('17', 'BENGKULU'),
('18', 'LAMPUNG'),
('19', 'KEPULAUAN BANGKA BELITUNG'),
('21', 'KEPULAUAN RIAU'),
('31', 'DKI JAKARTA'),
('32', 'JAWA BARAT'),
('33', 'JAWA TENGAH'),
('34', 'DAERAH ISTIMEWA YOGYAKARTA'),
('35', 'JAWA TIMUR'),
('36', 'BANTEN'),
('51', 'BALI'),
('52', 'NUSA TENGGARA BARAT'),
('53', 'NUSA TENGGARA TIMUR'),
('61', 'KALIMANTAN BARAT'),
('62', 'KALIMANTAN TENGAH'),
('63', 'KALIMANTAN SELATAN'),
('64', 'KALIMANTAN TIMUR'),
('65', 'KALIMANTAN UTARA'),
('71', 'SULAWESI UTARA'),
('72', 'SULAWESI TENGAH'),
('73', 'SULAWESI SELATAN'),
('74', 'SULAWESI TENGGARA'),
('75', 'GORONTALO'),
('76', 'SULAWESI BARAT'),
('81', 'MALUKU'),
('82', 'MALUKU UTARA'),
('91', 'PAPUA'),
('92', 'PAPUA BARAT');

-- Insert sample regencies (Jawa Tengah)
INSERT INTO regencies (province_id, code, name, type) VALUES
((SELECT id FROM provinces WHERE code = '33'), '3301', 'CILACAP', 'KABUPATEN'),
((SELECT id FROM provinces WHERE code = '33'), '3302', 'BANYUMAS', 'KABUPATEN'),
((SELECT id FROM provinces WHERE code = '33'), '3303', 'PURBALINGGA', 'KABUPATEN'),
((SELECT id FROM provinces WHERE code = '33'), '3371', 'SEMARANG', 'KOTA'),
((SELECT id FROM provinces WHERE code = '33'), '3372', 'SALATIGA', 'KOTA'),
((SELECT id FROM provinces WHERE code = '33'), '3373', 'SURAKARTA', 'KOTA'),
((SELECT id FROM provinces WHERE code = '33'), '3374', 'MAGELANG', 'KOTA'),
((SELECT id FROM provinces WHERE code = '33'), '3375', 'PEKALONGAN', 'KOTA'),
((SELECT id FROM provinces WHERE code = '33'), '3376', 'TEGAL', 'KOTA');

-- Insert sample districts (Kota Semarang)
INSERT INTO districts (regency_id, code, name) VALUES
((SELECT id FROM regencies WHERE code = '3371'), '337101', 'MIJEN'),
((SELECT id FROM regencies WHERE code = '3371'), '337102', 'GUNUNGPATI'),
((SELECT id FROM regencies WHERE code = '3371'), '337103', 'BANYUMANIK'),
((SELECT id FROM regencies WHERE code = '3371'), '337104', 'GAJAHMUNGKUR'),
((SELECT id FROM regencies WHERE code = '3371'), '337105', 'SEMARANG SELATAN'),
((SELECT id FROM regencies WHERE code = '3371'), '337106', 'CANDISARI'),
((SELECT id FROM regencies WHERE code = '3371'), '337107', 'TEMBALANG'),
((SELECT id FROM regencies WHERE code = '3371'), '337108', 'PEDURUNGAN'),
((SELECT id FROM regencies WHERE code = '3371'), '337109', 'GENUK'),
((SELECT id FROM regencies WHERE code = '3371'), '337110', 'GAYAMSARI'),
((SELECT id FROM regencies WHERE code = '3371'), '337111', 'SEMARANG TIMUR'),
((SELECT id FROM regencies WHERE code = '3371'), '337112', 'SEMARANG UTARA'),
((SELECT id FROM regencies WHERE code = '3371'), '337113', 'SEMARANG TENGAH'),
((SELECT id FROM regencies WHERE code = '3371'), '337114', 'SEMARANG BARAT'),
((SELECT id FROM regencies WHERE code = '3371'), '337115', 'TUGU'),
((SELECT id FROM regencies WHERE code = '3371'), '337116', 'NGALIYAN');

-- Insert sample villages (Tembalang)
INSERT INTO villages (district_id, code, name, postal_code) VALUES
((SELECT id FROM districts WHERE code = '337107'), '3371071001', 'TEMBALANG', '50275'),
((SELECT id FROM districts WHERE code = '337107'), '3371071002', 'BULUSAN', '50275'),
((SELECT id FROM districts WHERE code = '337107'), '3371071003', 'ROWOSARI', '50229'),
((SELECT id FROM districts WHERE code = '337107'), '3371071004', 'SENDANGMULYO', '50275'),
((SELECT id FROM districts WHERE code = '337107'), '3371071005', 'METESEH', '50227'),
((SELECT id FROM districts WHERE code = '337107'), '3371071006', 'KRAMAS', '50275'),
((SELECT id FROM districts WHERE code = '337107'), '3371071007', 'SENDANGGUWO', '50233'),
((SELECT id FROM districts WHERE code = '337107'), '3371071008', 'JANGLI', '50227'),
((SELECT id FROM districts WHERE code = '337107'), '3371071009', 'KEDUNGMUNDU', '50273'),
((SELECT id FROM districts WHERE code = '337107'), '3371071010', 'TANDANG', '50275'),
((SELECT id FROM districts WHERE code = '337107'), '3371071011', 'SAMBIROTO', '50277'),
((SELECT id FROM districts WHERE code = '337107'), '3371071012', 'MANGUNHARJO', '50272');

-- ============================================
-- CREATE DEMO ADMIN USER
-- Password: admin123
-- ============================================

INSERT INTO users (email, password_hash, full_name, organization, role, is_active) VALUES
('admin@indopost.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe.DWGre8KJQQQhJpXgI7qOXxqWxKZzWy', 'System Administrator', 'IndoPost API', 'admin', true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR ANALYTICS & ADMIN
-- ============================================

-- View: Daily API usage statistics
CREATE OR REPLACE VIEW daily_api_usage AS
SELECT 
    DATE(created_at) as date,
    api_key_id,
    COUNT(*) as request_count,
    AVG(response_time) as avg_response_time,
    COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as success_count,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
FROM request_logs
GROUP BY DATE(created_at), api_key_id;

-- View: Popular endpoints
CREATE OR REPLACE VIEW popular_endpoints AS
SELECT 
    endpoint,
    COUNT(*) as request_count,
    AVG(response_time) as avg_response_time
FROM request_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY endpoint
ORDER BY request_count DESC;

-- View: Admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
    (SELECT COUNT(*) FROM api_keys) as total_api_keys,
    (SELECT COUNT(*) FROM api_keys WHERE is_active = true) as active_api_keys,
    (SELECT COUNT(*) FROM request_logs WHERE DATE(created_at) = CURRENT_DATE) as today_requests,
    (SELECT COUNT(*) FROM request_logs) as total_requests;

-- View: All users (admin only)
CREATE OR REPLACE VIEW admin_all_users AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.organization,
    u.role,
    u.is_active,
    u.created_at,
    COUNT(ak.id) as total_api_keys,
    COALESCE(SUM(ak.usage_count), 0) as total_requests
FROM users u
LEFT JOIN api_keys ak ON u.id = ak.user_id
GROUP BY u.id, u.email, u.full_name, u.organization, u.role, u.is_active, u.created_at
ORDER BY u.created_at DESC;

-- View: All API keys (admin only)
CREATE OR REPLACE VIEW admin_all_api_keys AS
SELECT 
    ak.id,
    ak.key,
    ak.name,
    ak.is_active,
    ak.created_at,
    ak.last_used_at,
    ak.usage_count,
    u.email as user_email,
    u.full_name as user_name
FROM api_keys ak
JOIN users u ON ak.user_id = u.id
ORDER BY ak.created_at DESC;

-- View: User statistics by role
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users
FROM users
GROUP BY role;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================


-- Check data counts
SELECT 'provinces' as table_name, COUNT(*) as count FROM provinces
UNION ALL
SELECT 'regencies', COUNT(*) FROM regencies
UNION ALL
SELECT 'districts', COUNT(*) FROM districts
UNION ALL
SELECT 'villages', COUNT(*) FROM villages
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- Test hierarchical query
SELECT 
    p.name as province,
    r.name as regency,
    d.name as district,
    v.name as village,
    v.postal_code
FROM villages v
JOIN districts d ON v.district_id = d.id
JOIN regencies r ON d.regency_id = r.id
JOIN provinces p ON r.province_id = p.id
LIMIT 10;

-- Show admin user
SELECT id, email, full_name, role, is_active FROM users WHERE role = 'admin';

-- ============================================
-- DONE!
-- ============================================

\echo '✅ Database schema created successfully!'
\echo '✅ Sample data inserted (34 provinces, Jawa Tengah data)'
\echo '✅ Admin user created: admin@indopost.com / admin123'
\echo ''
\echo '⚠️  IMPORTANT: Change admin password after first login!'
\echo ''
\echo 'Next steps:'
\echo '1. Start the server: npm run dev'
\echo '2. Login as admin to test'
\echo '3. Create your first API key'