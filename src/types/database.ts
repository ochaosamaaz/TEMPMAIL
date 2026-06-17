export interface Domain {
  id: string;
  domain: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Alias {
  id: string;
  email: string;
  domain_id: string;
  local_part: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  domain?: Domain;
}

export interface Message {
  id: string;
  alias_id: string;
  from_email: string;
  from_name: string | null;
  subject: string;
  body_text: string | null;
  body_html: string | null;
  received_at: string;
  is_read: boolean;
  has_otp: boolean;
  otp_code: string | null;
  gmail_message_id: string | null;
  alias?: Alias;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin';
  created_at: string;
}

export type ThemeColor = 'blue' | 'dark' | 'green' | 'rose' | 'amber';
