import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, TrendingUp, BarChart3, LineChart, Search, Filter, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface PeerCompany {
  id: string;
  name: string;
  ticker: string;
  industry: string;
  marketCap: number;
  revenue: number;
  employees: number;
  ratios: {
    debtToEbitda: number;
    currentRatio: number;
    roe: number;
    roa: number;
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    assetTurnover: number;
    interestCoverage: number;
  };
}

export default function PeerBenchmarking() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for peer companies
  const [peerCompanies] = useState<PeerCompany[]>([
    {
      id: "1",
      name: "Tech Solutions Inc",
      ticker: "TECH",
      industry: "Technology Services",
      marketCap: 5200000000,
      revenue: 2100000000,
      employees: 8500,
      ratios: {
        debtToEbitda: 2.1,
        currentRatio: 1.8,
        roe: 18.5,
        roa: 12.3,
        grossMargin: 65.2,
        operatingMargin: 22.1,
        netMargin: 16.8,
        assetTurnover: 0.73,
        interestCoverage: 12.5
      }
    },
    {
      id: "2",
      name: "Digital Innovations Corp",
      ticker: "DIGI",
      industry: "Technology Services",
      marketCap: 3800000000,
      revenue: 1650000000,
      employees: 6200,
      ratios: {
        debtToEbitda: 1.9,
        currentRatio: 2.1,
        roe: 16.2,
        roa: 11.8,
        grossMargin: 62.8,
        operatingMargin: 19.5,
        netMargin: 14.2,
        assetTurnover: 0.83,
        interestCoverage: 15.2
      }
    },
    {
      id: "3",
      name: "Enterprise Systems Ltd",
      ticker: "ENTS",
      industry: "Technology Services",
      marketCap: 7100000000,
      revenue: 2800000000,
      employees: 12000,
      ratios: {
        debtToEbitda: 2.8,
        currentRatio: 1.6,
        roe: 21.1,
        roa: 13.7,
        grossMargin: 58.9,
        operatingMargin: 24.3,
        netMargin: 18.5,
        assetTurnover: 0.74,
        interestCoverage: 9.8
      }
    }
  ]);

  // Your company's data (mock)
  const yourCompany = {
    name: "Your Company",
    ratios: {
      debtToEbitda: 2.5,
      currentRatio: 1.7,
      roe: 17.8,
      roa: 12.1,
      grossMargin: 61.5,
      operatingMargin: 21.2,
      netMargin: 15.8,
      assetTurnover: 0.76,
      interestCoverage: 11.2
    }
  };

  // Calculate percentiles and benchmarks
  const calculatePercentile = (value: number, dataset: number[]) => {
    const sorted = dataset.sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    return index === -1 ? 100 : (index / sorted.length) * 100;
  };

  const getBenchmarkData = () => {
    const metrics = Object.keys(yourCompany.ratios) as Array<keyof typeof yourCompany.ratios>;
    
    return metrics.map(metric => {
      const peerValues = peerCompanies.map(p => p.ratios[metric]);
      const yourValue = yourCompany.ratios[metric];
      const median = peerValues.sort((a, b) => a - b)[Math.floor(peerValues.length / 2)];
      const average = peerValues.reduce((a, b) => a + b, 0) / peerValues.length;
      const percentile = calculatePercentile(yourValue, peerValues);
      
      return {
        metric: metric.charAt(0).toUpperCase() + metric.slice(1).replace(/([A-Z])/g, ' $1'),
        yourValue,
        average,
        median,
        percentile,
        best: Math.max(...peerValues),
        worst: Math.min(...peerValues),
        status: percentile >= 75 ? 'excellent' : percentile >= 50 ? 'good' : percentile >= 25 ? 'below-average' : 'poor'
      };
    });
  };

  const radarData = [
    { metric: 'ROE', yourCompany: yourCompany.ratios.roe, industry: 18.5 },
    { metric: 'ROA', yourCompany: yourCompany.ratios.roa, industry: 12.6 },
    { metric: 'Current Ratio', yourCompany: yourCompany.ratios.currentRatio * 10, industry: 18.5 },
    { metric: 'Gross Margin', yourCompany: yourCompany.ratios.grossMargin, industry: 62.3 },
    { metric: 'Operating Margin', yourCompany: yourCompany.ratios.operatingMargin, industry: 22.0 },
    { metric: 'Net Margin', yourCompany: yourCompany.ratios.netMargin, industry: 16.5 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'below-average':
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      'below-average': "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800"
    };
    return <Badge className={variants[status]}>{status.replace('-', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peer Benchmarking</h1>
          <p className="text-muted-foreground">
            Compare your financial ratios with industry peers and identify improvement opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {peerCompanies.length} peer companies analyzed
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="peers">Peer Companies</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overall Rank</p>
                    <p className="text-3xl font-bold">#2</p>
                    <p className="text-xs text-green-600">Top 25%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Strong Areas</p>
                    <p className="text-3xl font-bold text-green-600">6</p>
                    <p className="text-xs text-muted-foreground">out of 9 metrics</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Improvement Areas</p>
                    <p className="text-3xl font-bold text-yellow-600">3</p>
                    <p className="text-xs text-muted-foreground">metrics below median</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Peer Analysis</p>
                    <p className="text-3xl font-bold">{peerCompanies.length}</p>
                    <p className="text-xs text-muted-foreground">companies compared</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance Radar
              </CardTitle>
              <CardDescription>
                Visual comparison of key financial metrics against industry averages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 70]} />
                  <Radar name="Your Company" dataKey="yourCompany" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Industry Average" dataKey="industry" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Benchmark Table */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics Benchmark</CardTitle>
              <CardDescription>
                Your performance compared to peer companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Your Value</TableHead>
                    <TableHead>Peer Average</TableHead>
                    <TableHead>Percentile</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getBenchmarkData().slice(0, 5).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.metric}</TableCell>
                      <TableCell>{item.yourValue.toFixed(1)}</TableCell>
                      <TableCell>{item.average.toFixed(1)}</TableCell>
                      <TableCell>{item.percentile.toFixed(0)}th</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Benchmarking Analysis</CardTitle>
              <CardDescription>
                Comprehensive comparison of all financial ratios with peer performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Your Value</TableHead>
                    <TableHead>Peer Average</TableHead>
                    <TableHead>Median</TableHead>
                    <TableHead>Best in Class</TableHead>
                    <TableHead>Percentile</TableHead>
                    <TableHead>Assessment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getBenchmarkData().map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        {item.metric}
                      </TableCell>
                      <TableCell className="font-mono">{item.yourValue.toFixed(2)}</TableCell>
                      <TableCell>{item.average.toFixed(2)}</TableCell>
                      <TableCell>{item.median.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">{item.best.toFixed(2)}</TableCell>
                      <TableCell>{item.percentile.toFixed(0)}th</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Improvement Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getBenchmarkData()
                  .filter(item => item.status === 'below-average' || item.status === 'poor')
                  .map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold">{item.metric}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Your value: {item.yourValue.toFixed(2)} | Peer average: {item.average.toFixed(2)} | Gap: {(item.average - item.yourValue).toFixed(2)}
                          </p>
                          <p className="text-sm">
                            Consider focusing on improving this metric to reach at least the peer median of {item.median.toFixed(2)}.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peers" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Peer Company Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Search Companies</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by name or ticker"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="All industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology Services</SelectItem>
                      <SelectItem value="finance">Financial Services</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sizes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small ($1B-$5B)</SelectItem>
                      <SelectItem value="medium">Medium ($5B-$20B)</SelectItem>
                      <SelectItem value="large">Large ($20B+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="flex items-center gap-2 w-full">
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peer Companies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Peer Companies Overview</CardTitle>
              <CardDescription>
                Detailed information about companies in your peer group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Debt/EBITDA</TableHead>
                    <TableHead>ROE</TableHead>
                    <TableHead>Current Ratio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peerCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.ticker}</p>
                        </div>
                      </TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>${(company.marketCap / 1000000000).toFixed(1)}B</TableCell>
                      <TableCell>${(company.revenue / 1000000000).toFixed(1)}B</TableCell>
                      <TableCell>{company.employees.toLocaleString()}</TableCell>
                      <TableCell>{company.ratios.debtToEbitda.toFixed(1)}x</TableCell>
                      <TableCell>{company.ratios.roe.toFixed(1)}%</TableCell>
                      <TableCell>{company.ratios.currentRatio.toFixed(1)}x</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Trend Analysis
              </CardTitle>
              <CardDescription>
                Historical performance trends compared to peer benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={[
                  { year: '2020', yourCompany: 15.2, peerAverage: 16.8 },
                  { year: '2021', yourCompany: 16.5, peerAverage: 17.2 },
                  { year: '2022', yourCompany: 17.1, peerAverage: 17.8 },
                  { year: '2023', yourCompany: 17.8, peerAverage: 18.5 },
                  { year: '2024', yourCompany: 17.8, peerAverage: 18.5 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="yourCompany" stroke="#3b82f6" name="Your Company ROE%" />
                  <Line type="monotone" dataKey="peerAverage" stroke="#10b981" name="Peer Average ROE%" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}