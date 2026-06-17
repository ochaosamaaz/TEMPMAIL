-- ============================================
-- TempMail Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DOMAINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ALIASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  local_part TEXT NOT NULL,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_aliases_email ON aliases(email);
CREATE INDEX idx_aliases_domain_id ON aliases(domain_id);
CREATE INDEX idx_aliases_is_active ON aliases(is_active);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alias_id UUID NOT NULL REFERENCES aliases(id) ON DELETE CASCADE,
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT DEFAULT '',
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false,
  has_otp BOOLEAN DEFAULT false,
  otp_code TEXT,
  gmail_message_id TEXT UNIQUE
);

CREATE INDEX idx_messages_alias_id ON messages(alias_id);
CREATE INDEX idx_messages_received_at ON messages(received_at DESC);
CREATE INDEX idx_messages_gmail_id ON messages(gmail_message_id);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read for domains (needed for frontend)
CREATE POLICY "Public can read active domains" ON domains
  FOR SELECT USING (is_active = true);

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access domains" ON domains
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access aliases" ON aliases
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access messages" ON messages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access audit_logs" ON audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTION: Auto-expire aliases
-- ============================================
CREATE OR REPLACE FUNCTION expire_old_aliases()
RETURNS void AS $$
BEGIN
  UPDATE aliases 
  SET is_active = false 
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Clean old messages (older than 24h)
-- ============================================
CREATE OR REPLACE FUNCTION clean_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM messages 
  WHERE received_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (optional - remove in production)
-- ============================================
-- INSERT INTO domains (domain, is_active) VALUES 
--   ('tempmail.dev', true),
--   ('quickmail.io', true);
--
-- INSERT INTO admin_users (email, role) VALUES 
--   ('admin@tempmail.dev', 'super_admin');
