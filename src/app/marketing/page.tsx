
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

export default function MarketingPage() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Marketing Hub</CardTitle>
            <CardDescription>
              Your central place for managing client leads, generating marketing content with AI, and creating campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="leads">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="leads">Client Leads</TabsTrigger>
                <TabsTrigger value="content">AI Content Generation</TabsTrigger>
                <TabsTrigger value="campaigns">Campaign Ads</TabsTrigger>
              </TabsList>
              <TabsContent value="leads">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Leads</CardTitle>
                    <CardDescription>Manage promotional materials and leads.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Lead management content will go here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Powered Content & Strategy</CardTitle>
                    <CardDescription>Let AI help your sales team create compelling marketing content.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted/50">
                        <Bot className="h-12 w-12 text-primary" />
                        <h3 className="font-semibold">Generate Marketing Content</h3>
                        <p className="text-muted-foreground max-w-md">
                            Create engaging blog posts, social media updates, and email newsletters effortlessly. Our AI will help you craft the perfect message to connect with your audience.
                        </p>
                        <Button>
                            <Bot className="mr-2 h-4 w-4" />
                            Start Generating
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="campaigns">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Generated Campaign Ads</CardTitle>
                    <CardDescription>Create and manage campaign ads to share with clients.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted/50">
                            <Bot className="h-12 w-12 text-primary" />
                            <h3 className="font-semibold">Create Ad Campaigns</h3>
                            <p className="text-muted-foreground max-w-md">
                                Design and launch effective ad campaigns. The AI can help you with targeting, copy, and visuals to maximize your reach and impact.
                            </p>
                            <Button>
                                <Bot className="mr-2 h-4 w-4" />
                                Create a Campaign
                            </Button>
                        </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
