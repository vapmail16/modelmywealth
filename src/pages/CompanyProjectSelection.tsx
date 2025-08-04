import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building2, FolderPlus, Plus, ArrowRight } from 'lucide-react';
import { companyService, projectService } from '@/services';
import type { CompanyWithProjects, CreateCompanyData, CreateProjectData } from '@/types/company';
import { useToast } from '@/hooks/use-toast';

export default function CompanyProjectSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<CompanyWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Form states
  const [companyForm, setCompanyForm] = useState<CreateCompanyData>({
    name: '',
    industry: '',
    headquarters: '',
    description: ''
  });
  
  const [projectForm, setProjectForm] = useState<CreateProjectData>({
    company_id: '',
    name: '',
    description: '',
    project_type: 'analysis'
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    const response = await companyService.getUserCompanies();
    if (response.success && response.data) {
      setCompanies(response.data);
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to load companies",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleCreateCompany = async () => {
    const response = await companyService.createCompany(companyForm);
    if (response.success) {
      toast({
        title: "Success",
        description: "Company created successfully"
      });
      setShowCreateCompany(false);
      setCompanyForm({ name: '', industry: '', headquarters: '', description: '' });
      loadCompanies();
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to create company",
        variant: "destructive"
      });
    }
  };

  const handleCreateProject = async () => {
    if (!selectedCompany) {
      toast({
        title: "Error",
        description: "Please select a company first",
        variant: "destructive"
      });
      return;
    }

    const response = await projectService.createProject({
      ...projectForm,
      company_id: selectedCompany
    });
    
    if (response.success) {
      toast({
        title: "Success",
        description: "Project created successfully"
      });
      setShowCreateProject(false);
      setProjectForm({ company_id: '', name: '', description: '', project_type: 'analysis' });
      loadCompanies();
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to create project",
        variant: "destructive"
      });
    }
  };

  const handleProjectSelect = (projectId: string) => {
    // Store selected project in localStorage for the dashboard to use
    localStorage.setItem('selectedProject', projectId);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Company & Project Management
          </h1>
          <p className="text-xl text-muted-foreground">
            Select or create a company and project to begin financial analysis
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Dialog open={showCreateCompany} onOpenChange={setShowCreateCompany}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Building2 className="h-5 w-5" />
                Create Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Add a new company to organize your financial analysis projects.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({...companyForm, industry: e.target.value})}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="headquarters">Headquarters</Label>
                  <Input
                    id="headquarters"
                    value={companyForm.headquarters}
                    onChange={(e) => setCompanyForm({...companyForm, headquarters: e.target.value})}
                    placeholder="e.g., New York, NY"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                    placeholder="Company description (optional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateCompany}>Create Company</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="gap-2">
                <FolderPlus className="h-5 w-5" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project within a company for financial analysis.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="project-company">Company</Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project-type">Project Type</Label>
                  <Select 
                    value={projectForm.project_type} 
                    onValueChange={(value: any) => setProjectForm({...projectForm, project_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analysis">Financial Analysis</SelectItem>
                      <SelectItem value="refinancing">Refinancing</SelectItem>
                      <SelectItem value="acquisition">Acquisition</SelectItem>
                      <SelectItem value="expansion">Expansion</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                    placeholder="Project description (optional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Companies and Projects Grid */}
        <div className="grid gap-6">
          {companies.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Companies Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first company to get started with financial analysis.
                </p>
                <Button onClick={() => setShowCreateCompany(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Create Company
                </Button>
              </CardContent>
            </Card>
          ) : (
            companies.map((company) => (
              <Card key={company.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {company.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {company.industry && (
                          <Badge variant="secondary" className="mr-2">
                            {company.industry}
                          </Badge>
                        )}
                        {company.headquarters && <span>{company.headquarters}</span>}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCompany(company.id);
                        setShowCreateProject(true);
                      }}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Project
                    </Button>
                  </div>
                  {company.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {company.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  {company.projects.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No projects yet</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCompany(company.id);
                          setShowCreateProject(true);
                        }}
                        className="mt-2"
                      >
                        Create First Project
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <h4 className="font-medium text-foreground mb-2">Projects</h4>
                      {company.projects.map((project) => (
                        <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{project.name}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">{project.project_type}</Badge>
                                  <Badge 
                                    variant={project.status === 'active' ? 'default' : 'secondary'}
                                  >
                                    {project.status}
                                  </Badge>
                                </div>
                                {project.description && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {project.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleProjectSelect(project.id)}
                                className="gap-2"
                              >
                                Open
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}