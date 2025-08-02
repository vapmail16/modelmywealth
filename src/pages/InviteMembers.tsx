import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Mail, Send, Copy, ExternalLink, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'expired' | 'accepted';
  type: 'internal' | 'external';
}

export default function InviteMembers() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("single");
  
  // Single invite form
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState("");
  
  // Bulk invite form
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkRole, setBulkRole] = useState("");
  
  const [pendingInvites] = useState<PendingInvite[]>([
    {
      id: "1",
      email: "mike.chen@company.com",
      role: "editor",
      invitedBy: "John Smith",
      invitedAt: "2024-01-15",
      status: "pending",
      type: "internal"
    },
    {
      id: "2",
      email: "auditor@external.com",
      role: "viewer",
      invitedBy: "Sarah Johnson",
      invitedAt: "2024-01-10",
      status: "pending",
      type: "external"
    }
  ]);

  const handleSingleInvite = () => {
    if (!email || !role || !userType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${email}`,
    });
    
    // Clear form
    setEmail("");
    setRole("");
    setMessage("");
    setUserType("");
  };

  const handleBulkInvite = () => {
    if (!bulkEmails || !bulkRole) {
      toast({
        title: "Missing Information",
        description: "Please enter emails and select a role",
        variant: "destructive",
      });
      return;
    }

    const emailList = bulkEmails.split('\n').filter(email => email.trim());
    
    toast({
      title: "Bulk Invitations Sent",
      description: `${emailList.length} invitations sent successfully`,
    });
    
    setBulkEmails("");
    setBulkRole("");
  };

  const generateInviteLink = () => {
    const link = `https://your-app.com/invite?token=abc123`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Invite link copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      expired: "bg-red-100 text-red-800",
      accepted: "bg-green-100 text-green-800"
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      internal: "bg-blue-100 text-blue-800",
      external: "bg-purple-100 text-purple-800"
    };
    return <Badge className={variants[type]}>{type}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invite Team Members</h1>
          <p className="text-muted-foreground">
            Invite internal team members and external collaborators to access financial data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {pendingInvites.filter(i => i.status === 'pending').length} pending invites
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single">Single Invite</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Invite</TabsTrigger>
          <TabsTrigger value="link">Invite Link</TabsTrigger>
          <TabsTrigger value="pending">Pending Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Send Individual Invitation
              </CardTitle>
              <CardDescription>
                Invite a single team member with custom permissions and message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userType">User Type *</Label>
                  <Select value={userType} onValueChange={setUserType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal Team Member</SelectItem>
                      <SelectItem value="external">External Collaborator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Access Level *</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">
                      <div className="flex flex-col">
                        <span>Viewer</span>
                        <span className="text-xs text-muted-foreground">Read-only access to reports</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex flex-col">
                        <span>Editor</span>
                        <span className="text-xs text-muted-foreground">Can view and edit financial data</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex flex-col">
                        <span>Admin</span>
                        <span className="text-xs text-muted-foreground">Full access including user management</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message to the invitation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button onClick={handleSingleInvite} className="w-full flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk Invite Multiple Users
              </CardTitle>
              <CardDescription>
                Invite multiple team members at once with the same permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bulkEmails">Email Addresses *</Label>
                <Textarea
                  id="bulkEmails"
                  placeholder="Enter email addresses, one per line:&#10;john@company.com&#10;sarah@external.com&#10;mike@company.com"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Enter one email address per line
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bulkRole">Access Level for All Users *</Label>
                <Select value={bulkRole} onValueChange={setBulkRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                    <SelectItem value="editor">Editor - Can edit data</SelectItem>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleBulkInvite} className="w-full flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Bulk Invitations
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="link" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Generate Invite Link
              </CardTitle>
              <CardDescription>
                Create a shareable link that allows people to join your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-mono text-sm break-all">
                    https://your-app.com/invite?token=abc123def456
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={generateInviteLink} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Generate New Link
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Link Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Role</Label>
                    <Select defaultValue="viewer">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expiration</Label>
                    <Select defaultValue="7days">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1day">1 Day</SelectItem>
                        <SelectItem value="7days">7 Days</SelectItem>
                        <SelectItem value="30days">30 Days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pending Invitations
              </CardTitle>
              <CardDescription>
                Track and manage sent invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invite.role}</Badge>
                      </TableCell>
                      <TableCell>{getTypeBadge(invite.type)}</TableCell>
                      <TableCell>{invite.invitedBy}</TableCell>
                      <TableCell>{invite.invitedAt}</TableCell>
                      <TableCell>{getStatusBadge(invite.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            Resend
                          </Button>
                          <Button variant="ghost" size="sm">
                            Cancel
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}