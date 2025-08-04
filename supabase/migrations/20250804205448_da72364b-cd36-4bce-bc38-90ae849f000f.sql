-- Add new security-related capabilities to the capability enum
ALTER TYPE capability ADD VALUE IF NOT EXISTS 'view_security_events';
ALTER TYPE capability ADD VALUE IF NOT EXISTS 'manage_security';
ALTER TYPE capability ADD VALUE IF NOT EXISTS 'view_sensitive_financial_data';

-- Add security capabilities to admin role
INSERT INTO public.role_capabilities (role, user_type, capability)
VALUES 
  ('admin', 'business', 'view_security_events'),
  ('admin', 'business', 'manage_security'),
  ('admin', 'business', 'view_sensitive_financial_data'),
  ('admin', 'tech', 'view_security_events'),
  ('admin', 'tech', 'manage_security'),
  ('admin', 'tech', 'view_sensitive_financial_data')
ON CONFLICT (role, user_type, capability) DO NOTHING;