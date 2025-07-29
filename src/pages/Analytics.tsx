import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Download,
  Settings,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";

// Mock data for charts
const debtTrendData = [
  { month: "Jan", debt: 45.2, ebitda: 15.8, ratio: 2.86 },
  { month: "Feb", debt: 44.8, ebitda: 16.1, ratio: 2.78 },
  { month: "Mar", debt: 44.5, ebitda: 16.4, ratio: 2.71 },
  { month: "Apr", debt: 44.1, ebitda: 16.8, ratio: 2.63 },
  { month: "May", debt: 43.8, ebitda: 17.2, ratio: 2.55 },
  { month: "Jun", debt: 43.4, ebitda: 17.5, ratio: 2.48 },
];

const cashFlowData = [
  { quarter: "Q1", operating: 8.2, investing: -2.1, financing: -1.8 },
  { quarter: "Q2", operating: 9.1, investing: -1.9, financing: -2.2 },
  { quarter: "Q3", operating: 8.8, investing: -2.3, financing: -1.5 },
  { quarter: "Q4", operating: 9.5, investing: -2.7, financing: -2.8 },
];

const debtComposition = [
  { name: "Senior Secured", value: 28.5, color: "#1e3a8a" },
  { name: "Subordinated", value: 12.7, color: "#d97706" },
  { name: "Revolving Credit", value: 4.0, color: "#059669" },
];

const COLORS = ["#1e3a8a", "#d97706", "#059669", "#dc2626"];

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-franklin">Financial Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Interactive charts and KPI dashboard for debt analysis
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Charts
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Debt/EBITDA</p>
                <p className="text-2xl font-bold">2.48x</p>
                <p className="text-xs text-success">↓ 0.38x vs. target</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">DSCR</p>
                <p className="text-2xl font-bold">1.45x</p>
                <p className="text-xs text-success">↑ Above minimum</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interest Coverage</p>
                <p className="text-2xl font-bold">4.17x</p>
                <p className="text-xs text-success">↑ Healthy level</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Liquidity</p>
                <p className="text-2xl font-bold">$8.7M</p>
                <p className="text-xs text-warning">↓ Monitor closely</p>
              </div>
              <PieChart className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="debt-analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="debt-analysis">Debt Analysis</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="composition">Composition</TabsTrigger>
        </TabsList>

        <TabsContent value="debt-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debt Trend Chart */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Debt-to-EBITDA Trend</CardTitle>
                  <CardDescription>Monthly progression toward target ratio</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">6M View</Badge>
                  <Button variant="ghost" size="icon">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={debtTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ratio" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* EBITDA Growth */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>EBITDA Growth</CardTitle>
                  <CardDescription>Monthly EBITDA performance</CardDescription>
                </div>
                <Badge className="bg-success text-success-foreground">+10.8% YoY</Badge>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={debtTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="ebitda" 
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>Quarterly cash flow by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="operating" fill="hsl(var(--chart-3))" name="Operating" />
                  <Bar dataKey="investing" fill="hsl(var(--chart-4))" name="Investing" />
                  <Bar dataKey="financing" fill="hsl(var(--chart-5))" name="Financing" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Profitability Metrics</CardTitle>
              <CardDescription>Coming soon - Revenue and margin analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Profitability charts coming soon</p>
                <p className="text-sm">Advanced revenue and margin analysis</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composition" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debt Composition */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Debt Composition</CardTitle>
                <CardDescription>Current debt structure breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <RechartsPieChart data={debtComposition}>
                      {debtComposition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {debtComposition.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">${item.value}M</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Covenant Status */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Covenant Status</CardTitle>
                <CardDescription>Current compliance with debt covenants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div>
                      <p className="font-medium text-success">Max Debt/EBITDA</p>
                      <p className="text-sm text-muted-foreground">Limit: 3.0x | Current: 2.48x</p>
                    </div>
                    <Badge className="bg-success text-success-foreground">✓ Pass</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div>
                      <p className="font-medium text-success">Min DSCR</p>
                      <p className="text-sm text-muted-foreground">Limit: 1.20x | Current: 1.45x</p>
                    </div>
                    <Badge className="bg-success text-success-foreground">✓ Pass</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div>
                      <p className="font-medium text-warning">Min Liquidity</p>
                      <p className="text-sm text-muted-foreground">Limit: $10M | Current: $8.7M</p>
                    </div>
                    <Badge className="bg-warning text-warning-foreground">⚠ Watch</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}