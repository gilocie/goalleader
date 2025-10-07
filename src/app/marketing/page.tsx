
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { GenerateContentDialog } from '@/components/marketing/generate-content-dialog';
import type { Suggestion } from '@/types/marketing';
import { Logo } from '@/components/icons';
import { ApprovedContentActions } from '@/components/marketing/approved-content-actions';

export default function MarketingPage() {
  const [isGenerateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [approvedContent, setApprovedContent] = useState<Suggestion[]>([]);

  const handleApproveContent = (content: Suggestion) => {
    setApprovedContent(prev => [content, ...prev]);
  };

  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8 overflow-x-hidden">
        <Card>
          <CardHeader>
            <CardTitle>Marketing Hub</CardTitle>
            <CardDescription>
              Your central place for managing client leads, generating marketing content with GoalLeader, and creating campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-hidden">
            <Tabs defaultValue="leads">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="leads">Client Leads</TabsTrigger>
                <TabsTrigger value="content">Use GoalLeader</TabsTrigger>
                <TabsTrigger value="campaigns">Campaign Ads</TabsTrigger>
              </TabsList>
              <TabsContent value="leads" className="overflow-x-hidden">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Leads</CardTitle>
                    <CardDescription>Manage promotional materials and leads.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Client leads table has been temporarily removed for debugging.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>GoalLeader Content</CardTitle>
                    <CardDescription>Let GoalLeader help your sales team create compelling marketing content.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted/50 border">
                        <Logo className="h-12 w-12 text-primary" />
                        <h3 className="font-semibold">Generate Marketing Content</h3>
                        <p className="text-muted-foreground max-w-md">
                            Create engaging blog posts, social media updates, and email newsletters effortlessly. Our AI will help you craft the perfect message.
                        </p>
                        <Button onClick={() => setGenerateDialogOpen(true)}>
                            <Bot className="mr-2 h-4 w-4" />
                            Use GoalLeader
                        </Button>
                    </div>
                    <ApprovedContentActions content={approvedContent} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="campaigns">
                <Card>
                  <CardHeader>
                    <CardTitle>GoalLeader-Generated Campaign Ads</CardTitle>
                    <CardDescription>Create and manage campaign ads to share with clients.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted/50">
                            <Logo className="h-12 w-12 text-primary" />
                            <h3 className="font-semibold">Create Ad Campaigns</h3>
                            <p className="text-muted-foreground max-w-md">
                                Design and launch effective ad campaigns. GoalLeader can help you with targeting, copy, and visuals to maximize your reach and impact.
                            </p>
                            <Button>
                                <Logo className="mr-2 h-4 w-4 text-primary" />
                                Create with GoalLeader
                            </Button>
                        </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <GenerateContentDialog 
        isOpen={isGenerateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onApprove={handleApproveContent}
      />
    </AppLayout>
  );
}
