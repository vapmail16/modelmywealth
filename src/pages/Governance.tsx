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
  Filter
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

const INITIAL_TASKS: GovernanceTask[] = [
  {
    id: '1',
    title: 'Quarterly Board Meeting',
    description: 'Prepare quarterly financial reports and board presentation',
    dueDate: new Date(2024, 11, 15), // December 15, 2024
    completed: false,
    category: 'board',
    priority: 'high',
    assignee: 'CFO'
  },
  {
    id: '2',
    title: 'Board Resolution - New Credit Facility',
    description: 'Board approval for new credit facility terms',
    dueDate: new Date(2024, 10, 30), // November 30, 2024
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
    dueDate: new Date(2024, 11, 20), // December 20, 2024
    completed: false,
    category: 'lender',
    priority: 'high',
    assignee: 'Finance Manager'
  },
  {
    id: '4',
    title: 'Covenant Testing Results',
    description: 'Calculate and report quarterly covenant ratios',
    dueDate: new Date(2024, 11, 15), // December 15, 2024
    completed: false,
    category: 'lender',
    priority: 'high',
    assignee: 'CFO'
  },
  {
    id: '5',
    title: 'Annual SEC 10-K Filing',
    description: 'Complete and file annual report with SEC',
    dueDate: new Date(2025, 2, 31), // March 31, 2025
    completed: false,
    category: 'regulatory',
    priority: 'high',
    assignee: 'Chief Accountant'
  },
  {
    id: '6',
    title: 'Tax Returns Filing',
    description: 'File corporate tax returns',
    dueDate: new Date(2025, 2, 15), // March 15, 2025
    completed: false,
    category: 'regulatory',
    priority: 'medium',
    assignee: 'Tax Manager'
  },
  {
    id: '7',
    title: 'Audit Committee Meeting',
    description: 'Review internal audit findings and external audit progress',
    dueDate: new Date(2024, 11, 10), // December 10, 2024
    completed: false,
    category: 'board',
    priority: 'medium',
    assignee: 'Audit Committee Chair'
  },
  {
    id: '8',
    title: 'Environmental Compliance Report',
    description: 'Submit quarterly environmental compliance documentation',
    dueDate: new Date(2024, 11, 31), // December 31, 2024
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

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "Task has been removed from your governance calendar",
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Governance Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Track board governance, lender reporting, and regulatory compliance deadlines
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Deadline
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Governance Deadline</DialogTitle>
                <DialogDescription>
                  Create a new deadline for board governance, lender reporting, or regulatory compliance
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title *</Label>
                    <Input
                      id="title"
                      value={newTask.title || ''}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Input
                      id="assignee"
                      value={newTask.assignee || ''}
                      onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                      placeholder="Who is responsible?"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task details and requirements"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select 
                      value={newTask.category} 
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="board">Board Governance</SelectItem>
                        <SelectItem value="lender">Lender Reporting</SelectItem>
                        <SelectItem value="regulatory">Regulatory Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !newTask.dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.dueDate ? format(newTask.dueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newTask.dueDate}
                          onSelect={(date) => setNewTask(prev => ({ ...prev, dueDate: date }))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>
                  Add Deadline
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{completionStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completionStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{completionStats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Due Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{completionStats.dueSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="lender">Lender</TabsTrigger>
            <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredTasks
              .sort((a, b) => {
                // Sort by completion status, then by due date
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
              })
              .map((task) => (
                <Card key={task.id} className={cn(
                  "transition-all hover:shadow-md",
                  task.completed && "opacity-70",
                  !task.completed && isOverdue(task.dueDate) && "border-red-300 bg-red-50/50",
                  !task.completed && isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && "border-yellow-300 bg-yellow-50/50"
                )}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleTaskToggle(task.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className={cn(
                              "font-semibold",
                              task.completed && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </h3>
                            {!task.completed && isOverdue(task.dueDate) && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                            {!task.completed && isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                Due Soon
                              </Badge>
                            )}
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span className={cn(
                                !task.completed && isOverdue(task.dueDate) && "text-red-600 font-medium"
                              )}>
                                Due: {format(task.dueDate, "MMM dd, yyyy")}
                              </span>
                            </div>
                            
                            {task.assignee && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{task.assignee}</span>
                              </div>
                            )}
                            
                            {task.completedDate && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>Completed: {format(task.completedDate, "MMM dd, yyyy")}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs", getCategoryColor(task.category))}>
                              <span className="flex items-center gap-1">
                                {getCategoryIcon(task.category)}
                                {task.category === 'board' ? 'Board Governance' : 
                                 task.category === 'lender' ? 'Lender Reporting' : 
                                 'Regulatory Compliance'}
                              </span>
                            </Badge>
                            
                            <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingTask(task)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="board" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Board Governance ({tasksByCategory.board.length} tasks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksByCategory.board.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                      <div>
                        <div className={cn(
                          "font-medium",
                          task.completed && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Due: {format(task.dueDate, "MMM dd, yyyy")}
                          {task.assignee && ` • ${task.assignee}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                      {!task.completed && isOverdue(task.dueDate) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lender" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Lender Reporting ({tasksByCategory.lender.length} tasks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksByCategory.lender.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                      <div>
                        <div className={cn(
                          "font-medium",
                          task.completed && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Due: {format(task.dueDate, "MMM dd, yyyy")}
                          {task.assignee && ` • ${task.assignee}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                      {!task.completed && isOverdue(task.dueDate) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Regulatory Compliance ({tasksByCategory.regulatory.length} tasks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksByCategory.regulatory.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                      <div>
                        <div className={cn(
                          "font-medium",
                          task.completed && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Due: {format(task.dueDate, "MMM dd, yyyy")}
                          {task.assignee && ` • ${task.assignee}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                      {!task.completed && isOverdue(task.dueDate) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}