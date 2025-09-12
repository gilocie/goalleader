import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const teamMembers = [
  {
    name: 'Olivia Martin',
    email: 'olivia.martin@example.com',
    avatarId: 'avatar-1',
    task: 'UI/UX Design',
    status: 'Completed',
  },
  {
    name: 'Jackson Lee',
    email: 'jackson.lee@example.com',
    avatarId: 'avatar-2',
    task: 'Frontend Dev',
    status: 'In Progress',
  },
  {
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@example.com',
    avatarId: 'avatar-3',
    task: 'Backend Dev',
    status: 'In Progress',
  },
  {
    name: 'William Kim',
    email: 'will@example.com',
    avatarId: 'avatar-4',
    task: 'QA Testing',
    status: 'Pending',
  },
];

const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'In Progress':
      return 'secondary';
    case 'Pending':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function TeamCollaboration() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Collaboration</CardTitle>
        <CardDescription>
          An overview of your team's current tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {teamMembers.map((member) => {
          const avatar = PlaceHolderImages.find(
            (img) => img.id === member.avatarId
          );
          return (
            <div key={member.name} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={avatar?.imageUrl} alt={member.name} data-ai-hint={avatar?.imageHint} />
                  <AvatarFallback>
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {member.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.task}</p>
                </div>
              </div>
              <Badge variant={getBadgeVariant(member.status) as any}>
                {member.status}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
