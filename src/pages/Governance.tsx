import React, { useState } from 'react';
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  FileText,
  Building,
  Edit,
  Trash2,
  Filter,
  TrendingUp,
  BarChart3,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GovernanceTask {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  category: 'board' | 'lender' | 'regulatory';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  completedDate?: Date;
}

interface CovenantData {
  id: string;
  name: string;
  threshold: string;
  projection: string;
  buffer: number;
  nextTest: string;
  status: 'compliant' | 'at-risk' | 'breach';
}

// Mock covenant data for the dashboard
const COVENANT_DATA: CovenantData[] = [
  {
    id: '1',
    name: 'Debt-to-EBITDA',
    threshold: '≤ 3.5x',
    projection: '2.8x',
    buffer: 20.0,
    nextTest: 'Dec 31, 2024',
    status: 'compliant'
  },
  {
    id: '2',
    name: 'Interest Coverage',
    threshold: '≥ 4.0x',
    projection: '5.2x',
    buffer: 30.0,
    nextTest: 'Dec 31, 2024',
    status: 'compliant'
  },
  {
    id: '3',
    name: 'Current Ratio',
    threshold: '≥ 1.25x',
    projection: '1.45x',
    buffer: 16.0,
    nextTest: 'Dec 31, 2024',
    status: 'compliant'
  },
  {
    id: '4',
    name: 'Debt-to-Equity',
    threshold: '≤ 2.0x',
    projection: '1.6x',
    buffer: 20.0,
    nextTest: 'Dec 31, 2024',
    status: 'compliant'
  },
  {
    id: '5',
    name: 'EBITDA Margin',
    threshold: '≥ 15%',
    projection: '18.5%',
    buffer: 23.3,
    nextTest: 'Dec 31, 2024',
    status: 'compliant'
  }
];

const INITIAL_TASKS: GovernanceTask[] = [
  {
    id: '1',
    title: 'Quarterly Board Meeting',
    description: 'Prepare quarterly financial reports and board presentation',
    dueDate: new Date(2024, 11, 15),
    completed: false,
    category: 'board',
    priority: 'high',
    assignee: 'CFO'
  },
  {
    id: '2',
    title: 'Board Resolution - New Credit Facility',
    description: 'Board approval for new credit facility terms',
    dueDate: new Date(2024, 10, 30),
    completed: true,
    category: 'board',
    priority: 'high',
    assignee: 'General Counsel',
    completedDate: new Date(2024, 10, 28)
  },
  {
    id: '3',
    title: 'Monthly Lender Reporting Package',
    description: 'Submit compliance certificate and financial statements',
    dueDate: new Date(2024, 11, 20),
    completed: false,
    category: 'lender',
    priority: 'high',
    assignee: 'Finance Manager'
  },
  {
    id: '4',
    title: 'Covenant Testing Results',
    description: 'Calculate and report quarterly covenant ratios',
    dueDate: new Date(2024, 11, 15),
    completed: false,
    category: 'lender',
    priority: 'high',
    assignee: 'CFO'
  },
  {
    id: '5',
    title: 'Annual SEC 10-K Filing',
    description: 'Complete and file annual report with SEC',
    dueDate: new Date(2025, 2, 31),
    completed: false,
    category: 'regulatory',
    priority: 'high',
    assignee: 'Chief Accountant'
  },
  {
    id: '6',
    title: 'Tax Returns Filing',
    description: 'File corporate tax returns',
    dueDate: new Date(2025, 2, 15),
    completed: false,
    category: 'regulatory',
    priority: 'medium',
    assignee: 'Tax Manager'
  },
  {
    id: '7',
    title: 'Audit Committee Meeting',
    description: 'Review internal audit findings and external audit progress',
    dueDate: new Date(2024, 11, 10),
    completed: false,
    category: 'board',
    priority: 'medium',
    assignee: 'Audit Committee Chair'
  },
  {
    id: '8',
    title: 'Environmental Compliance Report',
    description: 'Submit quarterly environmental compliance documentation',
    dueDate: new Date(2024, 11, 31),
    completed: false,
    category: 'regulatory',
    priority: 'medium',
    assignee: 'Compliance Officer'
  }
];

export default function Governance() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<GovernanceTask[]>(INITIAL_TASKS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GovernanceTask | null>(null);
  const [covenantData, setCovenantData] = useState<CovenantData[]>(COVENANT_DATA);
  const [nextTestingDate, setNextTestingDate] = useState<string>("Dec 31, 2024");
  
  // New task form state
  const [newTask, setNewTask] = useState<Partial<GovernanceTask>>({
    title: '',
    description: '',
    dueDate: new Date(),
    category: 'board',
    priority: 'medium',
    assignee: '',
    completed: false
  });

  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = {
            ...task,
            completed: !task.completed,
            completedDate: !task.completed ? new Date() : undefined
          };
          
          toast({
            title: updatedTask.completed ? "Task Completed" : "Task Reopened",
            description: `${task.title} has been ${updatedTask.completed ? 'marked as complete' : 'reopened'}`,
          });
          
          return updatedTask;
        }
        return task;
      })
    );
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const task: GovernanceTask = {
      id: Date.now().toString(),
      title: newTask.title!,
      description: newTask.description || '',
      dueDate: newTask.dueDate!,
      completed: false,
      category: newTask.category as 'board' | 'lender' | 'regulatory',
      priority: newTask.priority as 'low' | 'medium' | 'high',
      assignee: newTask.assignee
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date(),
      category: 'board',
      priority: 'medium',
      assignee: '',
      completed: false
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Task Added",
      description: `${task.title} has been added to your governance calendar`,
    });
  };

  const handleCovenantThresholdChange = (covenantId: string, newThreshold: string) => {
    setCovenantData(prev => prev.map(covenant => 
      covenant.id === covenantId 
        ? { ...covenant, threshold: newThreshold }
        : covenant
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "Task has been removed from your governance calendar",
    });
  };

  const getCovenantStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'at-risk': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'breach': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCovenantStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-300';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'breach': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'board': return <Users className="h-4 w-4" />;
      case 'lender': return <Building className="h-4 w-4" />;
      case 'regulatory': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'board': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'lender': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'regulatory': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  const isDueSoon = (dueDate: Date) => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return dueDate <= threeDaysFromNow && dueDate >= new Date();
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedCategory === 'all') return true;
    return task.category === selectedCategory;
  });

  const tasksByCategory = {
    board: tasks.filter(t => t.category === 'board'),
    lender: tasks.filter(t => t.category === 'lender'),
    regulatory: tasks.filter(t => t.category === 'regulatory')
  };

  const completionStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length,
    dueSoon: tasks.filter(t => !t.completed && isDueSoon(t.dueDate)).length
  };

  // Calculate governance metrics
  const governanceMetrics = {
    covenantCompliance: (covenantData.filter(c => c.status === 'compliant').length / covenantData.length) * 100,
    averageBuffer: covenantData.reduce((acc, c) => acc + c.buffer, 0) / covenantData.length,
    atRiskCovenants: covenantData.filter(c => c.status === 'at-risk').length,
    breachedCovenants: covenantData.filter(c => c.status === 'breach').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Governance & Compliance</h1>
          <p className="text-muted-foreground mt-1">
            Covenant monitoring, governance requirements, and compliance tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="quarterly">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="current-year">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="2-years">2 Years</SelectItem>
              <SelectItem value="3-years">3 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Governance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Key Metrics Cards */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Covenant Compliance</p>
                <p className="text-2xl font-bold text-green-600">{governanceMetrics.covenantCompliance.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {covenantData.filter(c => c.status === 'compliant').length}/{covenantData.length} compliant
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Buffer</p>
                <p className="text-2xl font-bold text-blue-600">{governanceMetrics.averageBuffer.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Safety margin</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-bold text-green-600">LOW</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {governanceMetrics.atRiskCovenants} at risk, {governanceMetrics.breachedCovenants} breached
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Testing</p>
                <Input 
                  value={nextTestingDate}
                  onChange={(e) => setNextTestingDate(e.target.value)}
                  className="text-2xl font-bold text-purple-600 border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                />
                <p className="text-xs text-muted-foreground mt-1">Quarterly review</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Covenant Compliance Overview */}
      <Card className="shadow-card border-green-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Covenant Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Compliance</span>
              <span className="text-sm text-green-600">
                {covenantData.filter(c => c.status === 'compliant').length}/{covenantData.length} Compliant
              </span>
            </div>
            <Progress value={governanceMetrics.covenantCompliance} className="h-3" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {covenantData.map((covenant) => (
              <Card 
                key={covenant.id} 
                className="cursor-pointer transition-all hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{covenant.name}</CardTitle>
                    {getCovenantStatusIcon(covenant.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Threshold:</span>
                      <Input 
                        value={covenant.threshold}
                        onChange={(e) => handleCovenantThresholdChange(covenant.id, e.target.value)}
                        className="w-20 h-6 text-right text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Projection:</span>
                      <span className="font-bold text-green-600">{covenant.projection}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Buffer:</span>
                      <span className="font-medium">{covenant.buffer.toFixed(1)}%</span>
                    </div>
                    <Badge 
                      className={cn("w-full justify-center text-xs", getCovenantStatusColor(covenant.status))}
                    >
                      Next Test: {covenant.nextTest}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}