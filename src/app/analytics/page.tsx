
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Clock, Activity, TrendingUp, TrendingDown, Target, Hourglass } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';

const kpiData = [
    { title: 'Tasks Completed', value: '1,250', trend: '+15.2%', trendDirection: 'up' as const, icon: <CheckCircle className="text-primary" /> },
    { title: 'On-Time Rate', value: '92.8%', trend: '-1.5%', trendDirection: 'down' as const, icon: <Clock className="text-blue-500" /> },
    { title: 'Projects in Progress', value: '12', trend: '+2', trendDirection: 'up' as const, icon: <Activity className="text-yellow-500" /> },
    { title: 'Avg. Task Duration', value: '3.2h', trend: '+0.5h', trendDirection: 'down' as const, icon: <Hourglass className="text-red-500" /> },
]

const taskTrendData = [
  { name: 'Jan', created: 120, completed: 98 },
  { name: 'Feb', created: 140, completed: 122 },
  { name: 'Mar', created: 160, completed: 135 },
  { name: 'Apr', created: 150, completed: 140 },
  { name: 'May', created: 180, completed: 168 },
  { name: 'Jun', created: 170, completed: 155 },
];

const projectDistributionData = [
  { name: 'Project Phoenix', value: 400 },
  { name: 'Project Nova', value: 300 },
  { name: 'Project Orion', value: 300 },
  { name: 'Project Apex', value: 200 },
];
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const recentActivities = [
    { id: 1, user: 'Patrick Achitabwino', action: 'completed the task "Develop new auth API".', time: '2 hours ago', avatarId: 'patrick-achitabwino-m1' },
    { id: 2, user: 'Wezi Chisale', action: 'started a new project "Project Terra".', time: '5 hours ago', avatarId: 'wezi-chisale-m6' },
    { id: 3, user: 'Frank Mhango', action: 'reached the milestone "Q2 Revenue Goals".', time: '1 day ago', avatarId: 'frank-mhango-m2' },
    { id: 4, user: 'Charity Moyo', action: 'updated the status of "Project Orion".', time: '2 days ago', avatarId: 'charity-moyo-m7' },
    { id: 5, user: 'Gift Banda', action: 'completed the task "Design marketing banners".', time: '3 days ago', avatarId: 'gift-banda-m4' },
];


export default function AnalyticsPage() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>An overview of team productivity and project performance.</CardDescription>
            </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        {kpi.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                           {kpi.trendDirection === 'up' ? <TrendingUp className="mr-1 h-4 w-4 text-primary" /> : <TrendingDown className="mr-1 h-4 w-4 text-destructive" />}
                           {kpi.trend} from last month
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-12 lg:col-span-4">
                <CardHeader>
                    <CardTitle>Task Completion Trends</CardTitle>
                    <CardDescription>Tasks created vs. completed over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={taskTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                }}
                            />
                            <Area type="monotone" dataKey="created" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorCreated)" />
                            <Area type="monotone" dataKey="completed" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCompleted)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="col-span-12 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Project Workload Distribution</CardTitle>
                    <CardDescription>Breakdown of tasks across active projects.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={projectDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {projectDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                 contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

         <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A log of significant team events.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64">
                    <div className="space-y-4">
                        {recentActivities.map(activity => {
                            const avatar = PlaceHolderImages.find(img => img.id === activity.avatarId);
                            return (
                                <div key={activity.id} className="flex items-center gap-4">
                                     <Avatar className="h-9 w-9">
                                        <AvatarImage src={avatar?.imageUrl} alt={activity.user} data-ai-hint={avatar?.imageHint} />
                                        <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm"><span className="font-semibold">{activity.user}</span> {activity.action}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>

      </main>
    </AppLayout>
  );
}
