import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { securityService } from '@/services/security/SecurityService';
import { httpClient } from '@/services/http/client';
import { AlertTriangle, Shield, Clock, Users, Activity } from 'lucide-react';

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: string; // Changed from union type to string
  ip_address: string;
  user_agent: string;
  details: any; // Changed from Record to any for compatibility
  created_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  activeSessions: number;
  blockedAttempts: number;
}

export function SecurityDashboard() {
  const { user, hasCapability } = useAuthStore();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    activeSessions: 0,
    blockedAttempts: 0,
  });
  const [loading, setLoading] = useState(true);

  // Check if user has admin capabilities - using existing capability for now
  const canViewAllEvents = hasCapability('view_analytics'); // Will be updated when new capabilities are available

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      // Load security events via SecurityService (API layer)
      const eventsData = await securityService.getSecurityEvents();
      // Map the API response to match our interface
      const mappedEvents = eventsData.map(event => ({
        id: event.id,
        user_id: event.userId || '',
        event_type: event.eventType || '',
        severity: event.severity || 'low',
        ip_address: event.ipAddress || 'unknown',
        user_agent: event.userAgent || 'unknown',
        details: event.details || {},
        created_at: event.timestamp || new Date().toISOString(),
      }));
      setEvents(mappedEvents);

      // Calculate metrics
      const totalEvents = eventsData?.length || 0;
      const criticalEvents = eventsData?.filter(e => e.severity === 'critical').length || 0;

      // Load active sessions via API
      try {
        const response = await httpClient.get('/security-management/session-management?action=count_active');
        const activeSessions = response.data?.count || 0;

        // Load blocked attempts from rate limits via API
        const rateLimitResponse = await httpClient.get('/security-management/rate-limit?action=count_blocked');
        const blockedAttempts = rateLimitResponse.data?.count || 0;

        setMetrics({
          totalEvents,
          criticalEvents,
          activeSessions,
          blockedAttempts,
        });
      } catch (error) {
        console.error('Error loading session/rate limit data:', error);
        // Use default values if API calls fail
        setMetrics({
          totalEvents,
          criticalEvents,
          activeSessions: 0,
          blockedAttempts: 0,
        });
      }

    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleCleanupExpiredSessions = async () => {
    try {
      // Call the security management API for cleanup
      const response = await httpClient.post('/security-management/cleanup');

      if (response.success) {
        console.log('Cleanup completed:', response.data);
        await loadSecurityData(); // Refresh data
      } else {
        console.error('Error cleaning up sessions:', response.error);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage security events</p>
        </div>
        <Button onClick={handleCleanupExpiredSessions} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Cleanup Expired Sessions
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.criticalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.blockedAttempts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="high">High</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Monitor authentication attempts, access violations, and security incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No security events found</p>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-medium">{formatEventType(event.event_type)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>IP: {event.ip_address}</p>
                        {event.details && Object.keys(event.details).length > 0 && (
                          <p>Details: {JSON.stringify(event.details, null, 2).slice(0, 50)}...</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {['critical', 'high', 'medium'].map((severity) => (
          <TabsContent key={severity} value={severity} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{severity.charAt(0).toUpperCase() + severity.slice(1)} Severity Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.filter(e => e.severity === severity).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No {severity} severity events found
                    </p>
                  ) : (
                    events
                      .filter(e => e.severity === severity)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity.toUpperCase()}
                            </Badge>
                            <div>
                              <p className="font-medium">{formatEventType(event.event_type)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(event.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>IP: {event.ip_address}</p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}