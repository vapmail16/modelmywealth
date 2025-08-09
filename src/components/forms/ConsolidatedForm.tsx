import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Download, History, Calculator } from 'lucide-react';
import { useConsolidatedData } from '../../hooks/useConsolidatedData';
import { ConsolidatedTabType } from '../../types/consolidated';

interface ConsolidatedFormProps {
    projectId: string;
}

export const ConsolidatedForm: React.FC<ConsolidatedFormProps> = ({ projectId }) => {
    const [activeTab, setActiveTab] = useState<ConsolidatedTabType>('monthly');
    
    const {
        currentData,
        currentHistory,
        validation,
        loading,
        validating,
        calculating,
        error,
        selectedCalculationRunId,
        performCalculation,
        restoreCalculationRun,
        exportData,
        setSelectedCalculationRunId
    } = useConsolidatedData({ projectId, tabType: activeTab });

    const handleTabChange = (value: string) => {
        setActiveTab(value as ConsolidatedTabType);
    };

    const handleCalculate = async () => {
        await performCalculation();
    };

    const handleExport = async () => {
        await exportData();
    };

    const handleHistoryChange = (runId: string) => {
        setSelectedCalculationRunId(runId);
    };

    const getTabTitle = (tab: ConsolidatedTabType) => {
        switch (tab) {
            case 'monthly':
                return 'Monthly';
            case 'quarterly':
                return 'Quarterly';
            case 'yearly':
                return 'Yearly';
            default:
                return tab;
        }
    };

    const getTabDescription = (tab: ConsolidatedTabType) => {
        switch (tab) {
            case 'monthly':
                return '120 months of consolidated financial statements';
            case 'quarterly':
                return '40 quarters of consolidated financial statements';
            case 'yearly':
                return '10 years of consolidated financial statements';
            default:
                return '';
        }
    };

    const renderValidationStatus = () => {
        if (validating) {
            return (
                <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>Validating data...</AlertDescription>
                </Alert>
            );
        }

        if (validation) {
            return (
                <Alert className={validation.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertDescription>
                        {validation.success ? (
                            <span className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    Valid
                                </Badge>
                                {validation.message}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                    Invalid
                                </Badge>
                                {validation.error}
                            </span>
                        )}
                    </AlertDescription>
                </Alert>
            );
        }

        return null;
    };

    const renderSummaryCards = () => {
        if (!currentData || currentData.length === 0) return null;

        const latestData = currentData[currentData.length - 1];
        const totalRevenue = currentData.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
        const totalEbitda = currentData.reduce((sum, item) => sum + Number(item.ebitda || 0), 0);
        const totalNetIncome = currentData.reduce((sum, item) => sum + Number(item.net_income || 0), 0);

        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total EBITDA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totalEbitda.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Net Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totalNetIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Latest Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${Number(latestData.total_assets || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderDataTable = () => {
        if (!currentData || currentData.length === 0) {
            return (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            No data available. Run a calculation to see results.
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Financial Statements</CardTitle>
                    <CardDescription>
                        {getTabDescription(activeTab)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>EBITDA</TableHead>
                                    <TableHead>Net Income</TableHead>
                                    <TableHead>Total Assets</TableHead>
                                    <TableHead>Net Cash Flow</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {activeTab === 'monthly' && 'month_name' in item 
                                                ? `${item.month_name} ${item.year}`
                                                : activeTab === 'quarterly' && 'quarter_name' in item
                                                ? `${item.quarter_name} ${item.year}`
                                                : `Year ${item.year}`
                                            }
                                        </TableCell>
                                        <TableCell>${Number(item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell>${Number(item.ebitda || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell>${Number(item.net_income || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell>${Number(item.total_assets || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell>${Number(item.net_cash_flow || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Consolidated Financial Statements</h2>
                    <p className="text-muted-foreground">
                        Monthly, quarterly, and yearly consolidated financial statements using debt calculations and depreciation schedule.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleCalculate}
                        disabled={calculating || !validation?.success}
                        variant="default"
                    >
                        {calculating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Calculating...
                            </>
                        ) : (
                            <>
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={loading || currentData.length === 0}
                        variant="outline"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {renderValidationStatus()}

            {error && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Monthly Consolidated</h3>
                            <p className="text-sm text-muted-foreground">120 months of financial statements</p>
                        </div>
                        {currentHistory.length > 0 && (
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                <Select value={selectedCalculationRunId || ''} onValueChange={handleHistoryChange}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select calculation run" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentHistory.map((run) => (
                                            <SelectItem key={run.id} value={run.id}>
                                                {new Date(run.created_at).toLocaleDateString()} - {run.status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    {renderSummaryCards()}
                    {renderDataTable()}
                </TabsContent>

                <TabsContent value="quarterly" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Quarterly Consolidated</h3>
                            <p className="text-sm text-muted-foreground">40 quarters of financial statements</p>
                        </div>
                        {currentHistory.length > 0 && (
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                <Select value={selectedCalculationRunId || ''} onValueChange={handleHistoryChange}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select calculation run" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentHistory.map((run) => (
                                            <SelectItem key={run.id} value={run.id}>
                                                {new Date(run.created_at).toLocaleDateString()} - {run.status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    {renderSummaryCards()}
                    {renderDataTable()}
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Yearly Consolidated</h3>
                            <p className="text-sm text-muted-foreground">10 years of financial statements</p>
                        </div>
                        {currentHistory.length > 0 && (
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                <Select value={selectedCalculationRunId || ''} onValueChange={handleHistoryChange}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select calculation run" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentHistory.map((run) => (
                                            <SelectItem key={run.id} value={run.id}>
                                                {new Date(run.created_at).toLocaleDateString()} - {run.status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    {renderSummaryCards()}
                    {renderDataTable()}
                </TabsContent>
            </Tabs>
        </div>
    );
}; 