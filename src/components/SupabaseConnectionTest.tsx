import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useSupabaseTest } from '@/utils/supabaseTest';

export default function SupabaseConnectionTest() {
  const { testResults, isTesting, runTests } = useSupabaseTest();

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-500">Success</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Supabase Connection Test
        </CardTitle>
        <CardDescription>
          Test your Supabase connection and database operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Run Connection Tests'
          )}
        </Button>

        {testResults && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Test Results:</h3>
            
            {/* Connection Test */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.connection.success)}
                <span className="font-medium">Connection</span>
              </div>
              {getStatusBadge(testResults.connection.success)}
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {testResults.connection.message}
            </p>

            {/* Auth Test */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.auth.success)}
                <span className="font-medium">Authentication</span>
              </div>
              {getStatusBadge(testResults.auth.success)}
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {testResults.auth.message}
            </p>

            {/* Database Test */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.database.success)}
                <span className="font-medium">Database Operations</span>
              </div>
              {getStatusBadge(testResults.database.success)}
            </div>
            <p className="text-sm text-muted-foreground ml-6 whitespace-pre-line">
              {testResults.database.message}
            </p>

            {/* Insert Test */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.insert.success)}
                <span className="font-medium">Data Insertion</span>
              </div>
              {getStatusBadge(testResults.insert.success)}
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {testResults.insert.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 