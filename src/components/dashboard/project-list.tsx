import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const tasks = [
  {
    name: 'Design landing page',
    status: 'In Progress',
    dueDate: '2024-07-25',
  },
  {
    name: 'Develop API for user authentication',
    status: 'Completed',
    dueDate: '2024-07-15',
  },
  {
    name: 'Setup database schema',
    status: 'Pending',
    dueDate: '2024-08-01',
  },
  {
    name: 'Deploy to production',
    status: 'Pending',
    dueDate: '2024-08-15',
  },
  {
    name: 'Write documentation',
    status: 'In Progress',
    dueDate: '2024-08-10',
  },
];

const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'In Progress':
      return 'secondary';
    case 'Pending':
      return 'outline';
    default:
      return 'outline';
  }
};


export function ProjectList() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>ToDo List</CardTitle>
        <CardDescription>A list of your tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell text-right">Due Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.name}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(task.status) as any}>{task.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-right">{task.dueDate}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
