import { HttpClient } from '../http/client';
import { httpClient } from '../index';
import type { 
  SendNotificationRequest, 
  SendNotificationResponse,
  NotificationHistory,
  NotificationPreferences,
  NotificationType
} from '@/types/notification';

class NotificationService {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  async sendNotification(request: SendNotificationRequest): Promise<SendNotificationResponse> {
    try {
      const response = await this.client.post<SendNotificationResponse>(
        '/notifications/send',
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to send notification'
      };
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<SendNotificationResponse> {
    return this.sendNotification({
      type: 'welcome',
      recipient_email: userEmail,
      template_params: {
        user_name: userName,
        login_url: `${window.location.origin}/auth`
      },
      subject: 'Welcome to FinancialFlow Analytics!'
    });
  }

  async sendSecurityAlert(
    userEmail: string, 
    alertType: 'login_alert' | 'password_change' | 'security_alert',
    alertData: Record<string, any>
  ): Promise<SendNotificationResponse> {
    return this.sendNotification({
      type: alertType,
      recipient_email: userEmail,
      template_params: {
        ...alertData,
        timestamp: new Date().toISOString(),
        support_url: `${window.location.origin}/help`
      },
      subject: this.getSecurityAlertSubject(alertType)
    });
  }

  async sendInvitationEmail(
    inviteeEmail: string, 
    inviterName: string, 
    projectName: string,
    inviteToken: string
  ): Promise<SendNotificationResponse> {
    return this.sendNotification({
      type: 'invitation',
      recipient_email: inviteeEmail,
      template_params: {
        inviter_name: inviterName,
        project_name: projectName,
        invite_url: `${window.location.origin}/auth?invite=${inviteToken}`,
        accept_url: `${window.location.origin}/auth?invite=${inviteToken}&action=accept`
      },
      subject: `${inviterName} invited you to collaborate on ${projectName}`
    });
  }

  async sendSystemNotification(
    userEmail: string,
    message: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<SendNotificationResponse> {
    return this.sendNotification({
      type: 'system_maintenance',
      recipient_email: userEmail,
      template_params: {
        message,
        priority,
        timestamp: new Date().toISOString()
      },
      subject: 'System Notification - FinancialFlow Analytics'
    });
  }

  async getNotificationHistory(
    page: number = 1, 
    limit: number = 50
  ): Promise<{ notifications: NotificationHistory[]; total: number }> {
    try {
      const response = await this.client.get<{ notifications: NotificationHistory[]; total: number }>(
        `/notifications/history?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to get notification history:', error);
      return { notifications: [], total: 0 };
    }
  }

  async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    try {
      const response = await this.client.get<{ preferences: NotificationPreferences }>(
        '/notifications/preferences'
      );
      return response.data.preferences;
    } catch (error: any) {
      console.error('Failed to get notification preferences:', error);
      return null;
    }
  }

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      await this.client.put('/notifications/preferences', { preferences });
      return true;
    } catch (error: any) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }

  async unsubscribeFromNotifications(token: string): Promise<boolean> {
    try {
      await this.client.post('/notifications/unsubscribe', { token });
      return true;
    } catch (error: any) {
      console.error('Failed to unsubscribe from notifications:', error);
      return false;
    }
  }

  private getSecurityAlertSubject(alertType: string): string {
    switch (alertType) {
      case 'login_alert':
        return 'New Login Detected - FinancialFlow Analytics';
      case 'password_change':
        return 'Password Changed - FinancialFlow Analytics';
      case 'security_alert':
        return 'Security Alert - FinancialFlow Analytics';
      default:
        return 'Security Notification - FinancialFlow Analytics';
    }
  }

  // Utility method to check if user should receive notification based on preferences
  async shouldSendNotification(
    userEmail: string, 
    notificationType: NotificationType
  ): Promise<boolean> {
    try {
      const preferences = await this.getNotificationPreferences();
      
      if (!preferences?.email_enabled) {
        return false;
      }

      return preferences.types[notificationType as keyof typeof preferences.types] ?? false;
    } catch (error) {
      console.error('Failed to check notification preferences:', error);
      // Default to sending if we can't check preferences
      return true;
    }
  }

  // Batch notification sending for system-wide notifications
  async sendBulkNotifications(
    userEmails: string[],
    notificationType: NotificationType,
    templateParams: Record<string, any>,
    subject: string
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    for (const email of userEmails) {
      try {
        const result = await this.sendNotification({
          type: notificationType,
          recipient_email: email,
          template_params: templateParams,
          subject
        });

        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { successful, failed };
  }
}

// Export singleton instance
export const notificationService = new NotificationService(httpClient);
export { NotificationService };