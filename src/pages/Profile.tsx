import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Settings as SettingsIcon } from "lucide-react";

export default function Profile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information and preferences
          </p>
        </div>
        <Button className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-xl">Umesh Sharma</CardTitle>
            <p className="text-muted-foreground">Financial Analyst</p>
            <Badge variant="outline" className="w-fit mx-auto mt-2">
              Premium Account
            </Badge>
          </CardHeader>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">umesh.sharma@company.com</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Phone</div>
                <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Location</div>
                <div className="text-sm text-muted-foreground">New York, NY</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Member Since</div>
                <div className="text-sm text-muted-foreground">January 2024</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Account Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Projects Created</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Reports Generated</span>
              <span className="font-medium">48</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Charts Exported</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Last Login</span>
              <span className="font-medium">Today</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="text-sm font-medium">Generated KPI Dashboard Report</div>
                <div className="text-xs text-muted-foreground">Project: TTF Refinancing Analysis</div>
              </div>
              <div className="text-xs text-muted-foreground">2 hours ago</div>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="text-sm font-medium">Updated Financial Data</div>
                <div className="text-xs text-muted-foreground">Project: Q4 2024 Analysis</div>
              </div>
              <div className="text-xs text-muted-foreground">1 day ago</div>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="text-sm font-medium">Exported Debt Analysis Charts</div>
                <div className="text-xs text-muted-foreground">Project: Acquisition Model</div>
              </div>
              <div className="text-xs text-muted-foreground">3 days ago</div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">Created New Project</div>
                <div className="text-xs text-muted-foreground">Project: Merger Analysis 2024</div>
              </div>
              <div className="text-xs text-muted-foreground">1 week ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}