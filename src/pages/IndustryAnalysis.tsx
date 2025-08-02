import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, TrendingUp, BarChart3, PieChart, Download, AlertCircle, InfoIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface IndustryMetrics {
  industry: string;
  companies: number;
  avgRevenue: number;
  avgMarketCap: number;
  medianRoe: number;
  medianRoa: number;
  medianDebtEquity: number;
  medianCurrentRatio: number;
  medianGrossMargin: number;
  medianOperatingMargin: number;
  medianNetMargin: number;
  avgPeRatio: number;
  avgEbitdaMargin: number;
}

export default function IndustryAnalysis() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIndustry, setSelectedIndustry] = useState("technology");
  const [selectedMetric, setSelectedMetric] = useState("roe");
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  // Mock industry data
  const industryData: IndustryMetrics[] = [
    {
      industry: "Technology Services",
      companies: 127,
      avgRevenue: 2450000000,
      avgMarketCap: 8200000000,
      medianRoe: 18.5,
      medianRoa: 12.3,
      medianDebtEquity: 0.45,
      medianCurrentRatio: 2.1,
      medianGrossMargin: 62.8,
      medianOperatingMargin: 21.4,
      medianNetMargin: 16.2,
      avgPeRatio: 24.6,
      avgEbitdaMargin: 25.8
    },
    {
      industry: "Financial Services",
      companies: 89,
      avgRevenue: 3200000000,
      avgMarketCap: 12500000000,
      medianRoe: 12.8,
      medianRoa: 1.2,
      medianDebtEquity: 0.85,
      medianCurrentRatio: 1.0,
      medianGrossMargin: 78.5,
      medianOperatingMargin: 28.9,
      medianNetMargin: 22.1,
      avgPeRatio: 14.2,
      avgEbitdaMargin: 45.6
    },
    {
      industry: "Healthcare",
      companies: 156,
      avgRevenue: 1850000000,
      avgMarketCap: 6800000000,
      medianRoe: 15.2,
      medianRoa: 8.9,
      medianDebtEquity: 0.38,
      medianCurrentRatio: 2.8,
      medianGrossMargin: 71.4,
      medianOperatingMargin: 18.7,
      medianNetMargin: 13.8,
      avgPeRatio: 28.1,
      avgEbitdaMargin: 22.3
    },
    {
      industry: "Manufacturing",
      companies: 203,
      avgRevenue: 2100000000,
      avgMarketCap: 5400000000,
      medianRoe: 14.7,
      medianRoa: 6.8,
      medianDebtEquity: 0.62,
      medianCurrentRatio: 1.8,
      medianGrossMargin: 35.2,
      medianOperatingMargin: 12.1,
      medianNetMargin: 8.4,
      avgPeRatio: 16.8,
      avgEbitdaMargin: 16.7
    }
  ];

  const currentIndustry = industryData.find(i => i.industry.toLowerCase().includes(selectedIndustry)) || industryData[0];

  // Historical trend data
  const trendData = [
    { year: '2019', tech: 16.2, finance: 11.5, healthcare: 13.8, manufacturing: 12.9 },
    { year: '2020', tech: 17.1, finance: 10.8, healthcare: 14.2, manufacturing: 11.8 },
    { year: '2021', tech: 18.8, finance: 12.1, healthcare: 15.1, manufacturing: 13.5 },
    { year: '2022', tech: 17.9, finance: 11.9, healthcare: 14.8, manufacturing: 14.2 },
    { year: '2023', tech: 18.5, finance: 12.8, healthcare: 15.2, manufacturing: 14.7 },
  ];

  // Industry distribution data for pie chart
  const distributionData = [
    { name: 'Technology', value: 28, color: '#3b82f6' },
    { name: 'Healthcare', value: 22, color: '#10b981' },
    { name: 'Manufacturing', value: 18, color: '#f59e0b' },
    { name: 'Financial Services', value: 15, color: '#ef4444' },
    { name: 'Other', value: 17, color: '#8b5cf6' }
  ];

  // Comparative metrics
  const comparativeData = industryData.map(industry => ({
    name: industry.industry.split(' ')[0],
    roe: industry.medianRoe,
    roa: industry.medianRoa,
    grossMargin: industry.medianGrossMargin,
    operatingMargin: industry.medianOperatingMargin,
    currentRatio: industry.medianCurrentRatio * 10 // Scale for better visualization
  }));

  // Your company vs industry benchmark
  const yourCompanyMetrics = {
    roe: 17.8,
    roa: 12.1,
    grossMargin: 61.5,
    operatingMargin: 21.2,
    currentRatio: 1.7,
    debtEquity: 0.52
  };

  const getBenchmarkStatus = (yourValue: number, industryMedian: number, higherIsBetter: boolean = true) => {
    const difference = ((yourValue - industryMedian) / industryMedian) * 100;
    if (higherIsBetter) {
      return difference >= 10 ? 'excellent' : difference >= 0 ? 'good' : difference >= -10 ? 'below-average' : 'poor';
    } else {
      return difference <= -10 ? 'excellent' : difference <= 0 ? 'good' : difference <= 10 ? 'below-average' : 'poor';
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
          <h1 className="text-3xl font-bold tracking-tight">Industry Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of financial performance across industries and market segments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {industryData.reduce((sum, i) => sum + i.companies, 0)} companies analyzed
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Industry Overview</TabsTrigger>
          <TabsTrigger value="comparison">Cross-Industry</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          <TabsTrigger value="benchmarks">Your Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Industry Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Industry for Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology Services</SelectItem>
                    <SelectItem value="financial">Financial Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Year</SelectItem>
                    <SelectItem value="3year">3-Year Average</SelectItem>
                    <SelectItem value="5year">5-Year Average</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Industry Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Companies</p>
                    <p className="text-3xl font-bold">{currentIndustry.companies}</p>
                    <p className="text-xs text-muted-foreground">in analysis</p>
                  </div>
                  <PieChart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Revenue</p>
                    <p className="text-3xl font-bold">${(currentIndustry.avgRevenue / 1000000000).toFixed(1)}B</p>
                    <p className="text-xs text-muted-foreground">median company</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Median ROE</p>
                    <p className="text-3xl font-bold">{currentIndustry.medianRoe.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">return on equity</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg P/E</p>
                    <p className="text-3xl font-bold">{currentIndustry.avgPeRatio.toFixed(1)}x</p>
                    <p className="text-xs text-muted-foreground">price to earnings</p>
                  </div>
                  <LineChart className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Industry Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>{currentIndustry.industry} - Key Financial Metrics</CardTitle>
              <CardDescription>
                Median values across all companies in this industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Return on Equity</p>
                  <p className="text-2xl font-bold text-blue-600">{currentIndustry.medianRoe.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Return on Assets</p>
                  <p className="text-2xl font-bold text-green-600">{currentIndustry.medianRoa.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Ratio</p>
                  <p className="text-2xl font-bold text-purple-600">{currentIndustry.medianCurrentRatio.toFixed(1)}x</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Debt-to-Equity</p>
                  <p className="text-2xl font-bold text-orange-600">{currentIndustry.medianDebtEquity.toFixed(2)}x</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                  <p className="text-2xl font-bold text-indigo-600">{currentIndustry.medianGrossMargin.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Operating Margin</p>
                  <p className="text-2xl font-bold text-pink-600">{currentIndustry.medianOperatingMargin.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Net Margin</p>
                  <p className="text-2xl font-bold text-cyan-600">{currentIndustry.medianNetMargin.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">EBITDA Margin</p>
                  <p className="text-2xl font-bold text-emerald-600">{currentIndustry.avgEbitdaMargin.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Industry Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Composition</CardTitle>
                <CardDescription>Distribution of companies by industry</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cross-Industry Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Cross-Industry ROE Comparison</CardTitle>
                <CardDescription>Median return on equity by industry</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={industryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="industry" angle={-45} textAnchor="end" height={80} fontSize={10} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="medianRoe" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Industry Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Industry Comparison</CardTitle>
              <CardDescription>Key metrics across all major industries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Industry</TableHead>
                    <TableHead>Companies</TableHead>
                    <TableHead>Avg Revenue</TableHead>
                    <TableHead>ROE</TableHead>
                    <TableHead>ROA</TableHead>
                    <TableHead>Current Ratio</TableHead>
                    <TableHead>Gross Margin</TableHead>
                    <TableHead>P/E Ratio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {industryData.map((industry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{industry.industry}</TableCell>
                      <TableCell>{industry.companies}</TableCell>
                      <TableCell>${(industry.avgRevenue / 1000000000).toFixed(1)}B</TableCell>
                      <TableCell>{industry.medianRoe.toFixed(1)}%</TableCell>
                      <TableCell>{industry.medianRoa.toFixed(1)}%</TableCell>
                      <TableCell>{industry.medianCurrentRatio.toFixed(1)}x</TableCell>
                      <TableCell>{industry.medianGrossMargin.toFixed(1)}%</TableCell>
                      <TableCell>{industry.avgPeRatio.toFixed(1)}x</TableCell>
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
                Historical Industry Performance Trends
              </CardTitle>
              <CardDescription>5-year ROE trends across major industries</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tech" stroke="#3b82f6" name="Technology" strokeWidth={2} />
                  <Line type="monotone" dataKey="finance" stroke="#ef4444" name="Financial Services" strokeWidth={2} />
                  <Line type="monotone" dataKey="healthcare" stroke="#10b981" name="Healthcare" strokeWidth={2} />
                  <Line type="monotone" dataKey="manufacturing" stroke="#f59e0b" name="Manufacturing" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trend Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {industryData.map((industry, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{industry.industry}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>5-Year Growth:</span>
                        <span className="text-green-600">+2.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volatility:</span>
                        <span className="text-blue-600">Low</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outlook:</span>
                        <span className="text-green-600">Positive</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Performance vs Industry Benchmarks</CardTitle>
              <CardDescription>
                Compare your company's financial metrics against {currentIndustry.industry} industry medians
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Your Company</TableHead>
                    <TableHead>Industry Median</TableHead>
                    <TableHead>Difference</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Assessment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Return on Equity</TableCell>
                    <TableCell>{yourCompanyMetrics.roe.toFixed(1)}%</TableCell>
                    <TableCell>{currentIndustry.medianRoe.toFixed(1)}%</TableCell>
                    <TableCell>{(yourCompanyMetrics.roe - currentIndustry.medianRoe).toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {yourCompanyMetrics.roe > currentIndustry.medianRoe ? 
                          <TrendingUp className="h-4 w-4 text-green-600" /> : 
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        }
                        <span className={yourCompanyMetrics.roe > currentIndustry.medianRoe ? "text-green-600" : "text-yellow-600"}>
                          {yourCompanyMetrics.roe > currentIndustry.medianRoe ? "Above" : "Below"} Median
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(getBenchmarkStatus(yourCompanyMetrics.roe, currentIndustry.medianRoe))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Return on Assets</TableCell>
                    <TableCell>{yourCompanyMetrics.roa.toFixed(1)}%</TableCell>
                    <TableCell>{currentIndustry.medianRoa.toFixed(1)}%</TableCell>
                    <TableCell>{(yourCompanyMetrics.roa - currentIndustry.medianRoa).toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {yourCompanyMetrics.roa > currentIndustry.medianRoa ? 
                          <TrendingUp className="h-4 w-4 text-green-600" /> : 
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        }
                        <span className={yourCompanyMetrics.roa > currentIndustry.medianRoa ? "text-green-600" : "text-yellow-600"}>
                          {yourCompanyMetrics.roa > currentIndustry.medianRoa ? "Above" : "Below"} Median
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(getBenchmarkStatus(yourCompanyMetrics.roa, currentIndustry.medianRoa))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Current Ratio</TableCell>
                    <TableCell>{yourCompanyMetrics.currentRatio.toFixed(1)}x</TableCell>
                    <TableCell>{currentIndustry.medianCurrentRatio.toFixed(1)}x</TableCell>
                    <TableCell>{(yourCompanyMetrics.currentRatio - currentIndustry.medianCurrentRatio).toFixed(1)}x</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {yourCompanyMetrics.currentRatio > currentIndustry.medianCurrentRatio ? 
                          <TrendingUp className="h-4 w-4 text-green-600" /> : 
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        }
                        <span className={yourCompanyMetrics.currentRatio > currentIndustry.medianCurrentRatio ? "text-green-600" : "text-yellow-600"}>
                          {yourCompanyMetrics.currentRatio > currentIndustry.medianCurrentRatio ? "Above" : "Below"} Median
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(getBenchmarkStatus(yourCompanyMetrics.currentRatio, currentIndustry.medianCurrentRatio))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Gross Margin</TableCell>
                    <TableCell>{yourCompanyMetrics.grossMargin.toFixed(1)}%</TableCell>
                    <TableCell>{currentIndustry.medianGrossMargin.toFixed(1)}%</TableCell>
                    <TableCell>{(yourCompanyMetrics.grossMargin - currentIndustry.medianGrossMargin).toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {yourCompanyMetrics.grossMargin > currentIndustry.medianGrossMargin ? 
                          <TrendingUp className="h-4 w-4 text-green-600" /> : 
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        }
                        <span className={yourCompanyMetrics.grossMargin > currentIndustry.medianGrossMargin ? "text-green-600" : "text-yellow-600"}>
                          {yourCompanyMetrics.grossMargin > currentIndustry.medianGrossMargin ? "Above" : "Below"} Median
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(getBenchmarkStatus(yourCompanyMetrics.grossMargin, currentIndustry.medianGrossMargin))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Improvement Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Strengths to Leverage</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• ROA performance is competitive within the {currentIndustry.industry.toLowerCase()} sector</li>
                    <li>• Maintain current operational efficiency practices</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">Areas for Improvement</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Focus on improving ROE to reach industry median of {currentIndustry.medianRoe.toFixed(1)}%</li>
                    <li>• Consider strategies to optimize current ratio closer to industry standard</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}