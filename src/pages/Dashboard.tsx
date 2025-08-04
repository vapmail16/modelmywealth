import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Calculator,
  FileText,
  AlertTriangle,
  CheckCircle,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-franklin">TTF-Refinancing Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Model My Wealth - Real-time insights for faster debt restructuring decisions
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="shadow-card">
            <Link to="/data-entry">New Analysis</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45.2M</div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingDown className="h-3 w-3" />
              <span>-2.4% from last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debt-to-EBITDA</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2x</div>
            <div className="flex items-center gap-1 text-xs text-warning">
              <TrendingUp className="h-3 w-3" />
              <span>+0.3x from target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DSCR</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.45x</div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              <span>Above covenant minimum</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Position</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8.7M</div>
            <div className="flex items-center gap-1 text-xs text-destructive">
              <TrendingDown className="h-3 w-3" />
              <span>Below 90-day target</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common financial modeling tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/data-entry">
                <Calculator className="mr-2 h-4 w-4" />
                New Debt Analysis
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/data-entry">
                <Target className="mr-2 h-4 w-4" />
                Scenario Analysis / Stress Testing
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="shadow-card border-l-4 border-l-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Covenant Risk</p>
                  <p className="text-xs text-muted-foreground">
                    Current debt-to-EBITDA ratio is approaching covenant limits. Consider refinancing options.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Data Update Needed</p>
                  <p className="text-xs text-muted-foreground">
                    Q3 financial data is pending. Update your model for accurate projections.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}