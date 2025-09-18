'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function GoalReaderAIChat() {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebugTests = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      // Test the debug endpoint
      console.log('Testing GET /api/chat (debug endpoint)...');
      const debugResponse = await fetch('/api/chat', { method: 'GET' });
      const debugData = await debugResponse.json();
      
      // Test a simple chat message
      console.log('Testing POST /api/chat with simple message...');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello, this is a test' })
      });
      const chatData = await chatResponse.json();
      
      setResults({
        debug: {
          status: debugResponse.status,
          data: debugData
        },
        chat: {
          status: chatResponse.status,
          data: chatData
        }
      });

    } catch (error) {
      console.error('Test error:', error);
      setResults({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge variant="default" className="bg-green-500">Success ({status})</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge variant="destructive">Client Error ({status})</Badge>;
    } else if (status >= 500) {
      return <Badge variant="destructive">Server Error ({status})</Badge>;
    }
    return <Badge variant="outline">Status: {status}</Badge>;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Chat Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDebugTests} disabled={isLoading}>
          {isLoading ? 'Running Tests...' : 'Run Debug Tests'}
        </Button>

        {results && (
          <div className="space-y-4">
            {results.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800">Error</h3>
                <pre className="text-sm text-red-700 mt-2">{results.error}</pre>
              </div>
            )}

            {results.debug && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">Debug Endpoint</h3>
                  {getStatusBadge(results.debug.status)}
                </div>
                <pre className="text-sm overflow-auto max-h-60">
                  {JSON.stringify(results.debug.data, null, 2)}
                </pre>
              </div>
            )}

            {results.chat && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">Chat Endpoint</h3>
                  {getStatusBadge(results.chat.status)}
                </div>
                <pre className="text-sm overflow-auto max-h-60">
                  {JSON.stringify(results.chat.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
