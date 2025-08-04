import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { securityService } from '@/services/security/SecurityService';
import { supabase } from '@/integrations/supabase/client';
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

      // Load security events from Supabase
      const { data: eventsData, error: eventsError } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) {
        console.error('Error loading security events:', eventsError);
      } else {
        // Cast the data to match our interface
        setEvents((eventsData || []) as SecurityEvent[]);
      }

      // Calculate metrics
      const totalEvents = eventsData?.length || 0;
      const criticalEvents = eventsData?.filter(e => e.severity === 'critical').length || 0;

      // Load active sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true);

      if (sessionsError) {
        console.error('Error loading sessions:', sessionsError);
      }

      const activeSessions = sessionsData?.length || 0;

      // Load blocked attempts from rate limits
      const { data: rateLimitsData, error: rateLimitsError } = await supabase
        .from('rate_limits')
        .select('*')
        .not('blocked_until', 'is', null);

      if (rateLimitsError) {
        console.error('Error loading rate limits:', rateLimitsError);
      }

      const blockedAttempts = rateLimitsData?.length || 0;

      setMetrics({
        totalEvents,
        criticalEvents,
        activeSessions,
        blockedAttempts,
      });

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
      // Call the security management edge function
      const { data, error } = await supabase.functions.invoke('security-management', {
        body: { action: 'cleanup' }
      });

      if (error) {
        console.error('Error cleaning up sessions:', error);
      } else {
        console.log('Cleanup completed:', data);
        await loadSecurityData(); // Refresh data
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