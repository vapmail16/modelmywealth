import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Download,
  Upload,
  Trash2,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reports: true,
    security: true
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your application preferences and account settings
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select defaultValue="est">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Standard Time</SelectItem>
                      <SelectItem value="pst">Pacific Standard Time</SelectItem>
                      <SelectItem value="cst">Central Standard Time</SelectItem>
                      <SelectItem value="mst">Mountain Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-save Projects</Label>
                    <p className="text-sm text-muted-foreground">Automatically save changes every 30 seconds</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Advanced Features</Label>
                    <p className="text-sm text-muted-foreground">Display advanced calculation options</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Report Completion</Label>
                    <p className="text-sm text-muted-foreground">Notify when reports are ready</p>
                  </div>
                  <Switch 
                    checked={notifications.reports}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, reports: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Important security notifications</p>
                  </div>
                  <Switch 
                    checked={notifications.security}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, security: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Password & Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Extra security for your account</p>
                  </div>
                  <Switch />
                </div>
                <Button variant="outline" className="w-full">
                  Manage API Keys
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Session</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Chrome on Windows</span>
                    <span className="text-muted-foreground">New York, NY</span>
                  </div>
                </div>
                <Button variant="destructive" size="sm" className="w-full">
                  Sign Out All Devices
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Appearance & Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="border rounded-lg p-3 cursor-pointer hover:border-primary">
                      <div className="w-full h-8 bg-background border rounded mb-2"></div>
                      <div className="text-xs text-center">Light</div>
                    </div>
                    <div className="border rounded-lg p-3 cursor-pointer hover:border-primary">
                      <div className="w-full h-8 bg-gray-900 border rounded mb-2"></div>
                      <div className="text-xs text-center">Dark</div>
                    </div>
                    <div className="border rounded-lg p-3 cursor-pointer hover:border-primary border-primary">
                      <div className="w-full h-8 bg-gradient-to-r from-background to-gray-900 border rounded mb-2"></div>
                      <div className="text-xs text-center">System</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Reduce spacing for more information</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Grid Lines</Label>
                    <p className="text-sm text-muted-foreground">Display grid lines in charts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Data Import/Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full gap-2">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Export All Data
                </Button>
                <div className="text-xs text-muted-foreground">
                  Last backup: 2 days ago
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">Weekly automatic backups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}