export interface NotificationPreferences {
  email_enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  types: {
    security: boolean;
    reports: boolean;
    system: boolean;
    collaboration: boolean;
    welcome: boolean;
  };
}

export interface NotificationHistory {
  id: string;
  user_id: string;
  type: NotificationType;
  status: 'pending' | 'sent' | 'failed';
  template_id?: string;
  recipient_email: string;
  subject?: string;
  template_params: Record<string, any>;
  sent_at: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 
  | 'welcome'
  | 'security_alert'
  | 'login_alert'
  | 'password_change'
  | 'system_maintenance'
  | 'invitation'
  | 'report_ready'
  | 'data_update'
  | 'covenant_alert';

export interface SendNotificationRequest {
  type: NotificationType;
  recipient_email: string;
  template_id?: string;
  template_params: Record<string, any>;
  subject?: string;
}

export interface SendNotificationResponse {
  success: boolean;
  notification_id?: string;
  error?: string;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  name: string;
  subject_template: string;
  emailjs_template_id: string;
  default_params: Record<string, any>;
}