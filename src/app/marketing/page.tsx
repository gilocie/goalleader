
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { GenerateContentDialog } from '@/components/marketing/generate-content-dialog';
import type { Suggestion } from '@/types/marketing';
import { ApprovedContentActions } from '@/components/marketing/approved-content-actions';
import { ClientLeadsGrid } from '@/components/marketing/client-leads-grid';
import { Logo } from '@/components/icons';
import { useMarketing } from '@/context/marketing-context';

function MarketingPageContent() {
  const [isGenerateDialogOpen, setGenerateDialogOpen] = useState(false);
  const { approvedContent, approveContent, updateApprovedContent, deleteApprovedContent } = useMarketing();

  const handleApproveContent = (content: Suggestion) => {
    approveContent(content);
  };

  const handleContentDeleted = (updatedContent: Suggestion[]) => {
    // This is now handled by the context directly via deleteApprovedContent
  }

  const handleContentUpdated = (updatedContent: Suggestion) => {
    updateApprovedContent(updatedContent.id!, updatedContent);
  }

  return (
    <>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Marketing Hub</CardTitle>
            <CardDescription>
              Your central place for managing client leads, generating marketing content with GoalLeader, and creating campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="leads">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="leads">Client Leads</TabsTrigger>
                <TabsTrigger value="content">Use GoalLeader</TabsTrigger>
                <TabsTrigger value="campaigns">Campaign Ads</TabsTrigger>
              </TabsList>
              <TabsContent value="leads" className="mt-4">
                <ClientLeadsGrid />
              </TabsContent>
              <TabsContent value="content">
                <Card>
                  <CardHeader className="flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle>GoalLeader Content</CardTitle>
                      <CardDescription>Let GoalLeader help your sales team create compelling marketing content.</CardDescription>
                    </div>
                    <Button onClick={() => setGenerateDialogOpen(true)} className="mt-4 md:mt-0">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Generate New Content
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted/50">
                        <Logo className="h-12 w-12 text-primary" />
                        <h3 className="font-semibold">Approve Content to Manage Campaigns</h3>
                        <p className="text-muted-foreground max-w-md">
                            Once you generate and approve content, it will appear in the "Campaign Ads" tab where you can schedule and send it.
                        </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="campaigns">
                <Card>
                  <CardHeader>
                    <CardTitle>GoalLeader-Generated Campaign Ads</CardTitle>
                    <CardDescription>Effortlessly create and manage blog posts, social media updates, and email newsletters.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ApprovedContentActions 
                      content={approvedContent} 
                      onContentDeleted={handleContentDeleted}
                      onContentUpdated={handleContentUpdated}
                    />
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
    </>
  );
}

export default function MarketingPage() {
    return (
        <AppLayout>
            <MarketingPageContent />
        </AppLayout>
    )
}
