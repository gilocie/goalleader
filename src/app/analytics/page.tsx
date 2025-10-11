
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Clock, Activity, TrendingUp, TrendingDown, Target, Hourglass } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTimeTracker } from '@/context/time-tracker-context';
import { useUser } from '@/context/user-context';
import { useMemo } from 'react';
import { format, parseISO, isBefore, startOfMonth, endOfMonth, getMonth } from 'date-fns';

function AnalyticsPageContent() {
    const { tasks } = useTimeTracker();
    const { user, allTeamMembers } = useUser();

    // Personal stats
    const stats = useMemo(() => {
        const userTasks = user ? tasks.filter(t => t.userId === user.id) : [];
        const completedTasks = userTasks.filter(t => t.status === 'Completed');
        const onTimeTasks = completedTasks.filter(t => {
            if (!t.endTime || !t.dueDate) return false;
            const completionDate = (t.endTime as any).toDate ? (t.endTime as any).toDate() : new Date(t.endTime as any);
            const dueDate = parseISO(t.dueDate);
            return isBefore(completionDate, dueDate) || completionDate.toDateString() === dueDate.toDateString();
        });

        const totalDuration = completedTasks.reduce((acc, t) => acc + (t.duration || 0), 0);
        const avgDurationHours = completedTasks.length > 0 ? (totalDuration / completedTasks.length / 3600) : 0;

        return {
            tasksCompleted: completedTasks.length,
            onTimeRate: completedTasks.length > 0 ? (onTimeTasks.length / completedTasks.length) * 100 : 0,
            projectsInProgress: userTasks.filter(t => t.status === 'In Progress').length,
            avgTaskDuration: avgDurationHours.toFixed(1),
        };
    }, [tasks, user]);

    // Filtered data for team/department/branch/country
    const filteredTeamMemberIds = useMemo(() => {
        if (!user) return [];
        return allTeamMembers
            .filter(member => 
                member.department === user.department &&
                member.branch === user.branch &&
                member.country === user.country
            )
            .map(member => member.id);
    }, [allTeamMembers, user]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => filteredTeamMemberIds.includes(task.userId));
    }, [tasks, filteredTeamMemberIds]);

    const kpiData = [
        { title: 'My Tasks Completed', value: stats.tasksCompleted.toLocaleString(), trend: '+15.2%', trendDirection: 'up' as const, icon: <CheckCircle className="text-primary" /> },
        { title: 'My On-Time Rate', value: `${stats.onTimeRate.toFixed(1)}%`, trend: '-1.5%', trendDirection: 'down' as const, icon: <Clock className="text-blue-500" /> },
        { title: 'My Projects in Progress', value: stats.projectsInProgress, trend: '+2', trendDirection: 'up' as const, icon: <Activity className="text-yellow-500" /> },
        { title: 'My Avg. Task Duration', value: `${stats.avgTaskDuration}h`, trend: '+0.5h', trendDirection: 'down' as const, icon: <Hourglass className="text-red-500" /> },
    ]

    const taskTrendData = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            name: monthNames[i],
            created: 0,
            completed: 0
        }));

        filteredTasks.forEach(task => {
            const createdAt = (task.createdAt as any)?.toDate();
            if (createdAt) {
                const month = getMonth(createdAt);
                monthlyData[month].created++;
            }

            if (task.status === 'Completed' && task.endTime) {
                const completedAt = (task.endTime as any)?.toDate();
                if (completedAt) {
                    const month = getMonth(completedAt);
                    monthlyData[month].completed++;
                }
            }
        });
        const currentMonth = new Date().getMonth();
        return Array.from({ length: 6 }, (_, i) => {
            const monthIndex = (currentMonth - 5 + i + 12) % 12;
            return monthlyData[monthIndex];
        });
    }, [filteredTasks]);

    const projectDistributionData = useMemo(() => {
        const distribution: { [key: string]: number } = {};
        filteredTasks.forEach(task => {
            const department = allTeamMembers.find(m => m.id === task.userId)?.department || 'Unassigned';
            if (distribution[department]) {
                distribution[department]++;
            } else {
                distribution[department] = 1;
            }
        });
        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    }, [filteredTasks, allTeamMembers]);

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    const recentActivities = useMemo(() => {
        return filteredTasks.sort((a,b) => {
            const timeA = (a.createdAt as any)?.toMillis() || 0;
            const timeB = (b.createdAt as any)?.toMillis() || 0;
            return timeB - timeA;
        }).slice(0, 5).map((task, index) => {
            const taskUser = allTeamMembers.find(u => u.id === task.userId);
            let action = '';
            if (task.status === 'Completed') action = `completed the task "${task.name}".`;
            else if (task.status === 'In Progress') action = `started the task "${task.name}".`;
            else action = `created the task "${task.name}".`;

            return {
                id: task.id,
                user: taskUser?.name || 'Unknown User',
                action: action,
                time: format(new Date((task.createdAt as any).toDate()), 'p'),
                avatarId: taskUser?.id || `user-${index}`
            };
        });
    }, [filteredTasks, allTeamMembers]);


  return (
      <main className="flex-grow p-4 md:p-8 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>An overview of personal and team productivity.</CardDescription>
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
                    <CardDescription>Team's tasks created vs. completed over the last 6 months.</CardDescription>
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
                    <CardDescription>Breakdown of team tasks across departments.</CardDescription>
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
                <CardTitle>Recent Team Activity</CardTitle>
                <CardDescription>A log of significant events from your team.</CardDescription>
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
  );
}

export default function AnalyticsPage() {
    return (
        <AppLayout>
            <AnalyticsPageContent />
        </AppLayout>
    );
}
