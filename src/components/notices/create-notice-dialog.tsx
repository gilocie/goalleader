
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelectCombobox } from '@/components/meetings/multi-select-combobox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { allUsers } from '@/lib/users';

const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  recipients: z.array(z.string()),
});

type NoticeFormValues = z.infer<typeof noticeSchema>;

interface CreateNoticeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNoticeCreate: (data: NoticeFormValues) => void;
}

export function CreateNoticeDialog({
  isOpen,
  onOpenChange,
  onNoticeCreate,
}: CreateNoticeDialogProps) {
  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: '',
      description: '',
      recipients: [],
    },
  });

  const onSubmit = (data: NoticeFormValues) => {
    onNoticeCreate(data);
    form.reset();
  };
  
  const handleSendToAll = () => {
    const data = form.getValues();
    onNoticeCreate({
        ...data,
        recipients: allUsers.map(u => u.value),
    });
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Notice</DialogTitle>
          <DialogDescription>
            Compose your announcement and send it to specific team members or everyone.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Notice Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your notice here..." {...field} className="h-24" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipients</FormLabel>
                  <FormControl>
                    <MultiSelectCombobox
                      options={allUsers}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select recipients..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </DialogClose>
              <Button type="button" onClick={handleSendToAll} className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
                Send to All
              </Button>
              <Button type="submit" disabled={!form.watch('recipients').length}>
                Send to Selected
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
