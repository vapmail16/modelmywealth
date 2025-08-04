import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services';
import type { NotificationPreferences as NotificationPrefsType } from '@/types/notification';
import { Bell, Mail, Shield, FileText, Users, Home } from 'lucide-react';

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPrefsType>({
    email_enabled: true,
    frequency: 'immediate',
    types: {
      security: true,
      reports: true,
      system: true,
      collaboration: true,
      welcome: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getNotificationPreferences();
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const success = await notificationService.updateNotificationPreferences(preferences);
      if (success) {
        toast({
          title: "Success",
          description: "Notification preferences updated successfully"
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationType = (type: keyof NotificationPrefsType['types'], enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: enabled
      }
    }));
  };

  const notificationTypes = [
    {
      key: 'security' as const,
      label: 'Security Alerts',
      description: 'Login alerts, password changes, and security warnings',
      icon: Shield
    },
    {
      key: 'reports' as const,
      label: 'Reports & Analytics',
      description: 'Report generation, financial analysis completion',
      icon: FileText
    },
    {
      key: 'system' as const,
      label: 'System Notifications',
      description: 'Maintenance updates, system announcements',
      icon: Bell
    },
    {
      key: 'collaboration' as const,
      label: 'Team Collaboration',
      description: 'Project invites, team updates, mentions',
      icon: Users
    },
    {
      key: 'welcome' as const,
      label: 'Onboarding & Welcome',
      description: 'Account setup, welcome messages, getting started guides',
      icon: Home
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how and when you receive notifications from FinancialFlow Analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Email Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Enable or disable all email notifications
            </p>
          </div>
          <Switch
            checked={preferences.email_enabled}
            onCheckedChange={(checked) => 
              setPreferences(prev => ({ ...prev, email_enabled: checked }))
            }
          />
        </div>

        <Separator />

        {/* Frequency Setting */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Notification Frequency</Label>
          <Select
            value={preferences.frequency}
            onValueChange={(value: 'immediate' | 'daily' | 'weekly') =>
              setPreferences(prev => ({ ...prev, frequency: value }))
            }
            disabled={!preferences.email_enabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choose how often you want to receive notifications
          </p>
        </div>

        <Separator />

        {/* Notification Types */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Notification Types</Label>
          <div className="space-y-4">
            {notificationTypes.map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="flex items-start justify-between space-x-4">
                <div className="flex items-start space-x-3 flex-1">
                  <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.types[key]}
                  onCheckedChange={(checked) => updateNotificationType(key, checked)}
                  disabled={!preferences.email_enabled}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};