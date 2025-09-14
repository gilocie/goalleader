
'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { File, Image, Link, Bell, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ChatUserProfileProps {
  contact: Contact;
}

export function ChatUserProfile({ contact }: ChatUserProfileProps) {
  const avatar = PlaceHolderImages.find((img) => img.id === contact.id);

  return (
    <Card className="h-full flex flex-col rounded-none border-none">
      <CardHeader className="items-center text-center p-6 border-b">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarImage src={avatar?.imageUrl} alt={contact.name} data-ai-hint={avatar?.imageHint} />
          <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <p className="font-semibold text-lg">{contact.name}</p>
        <p className="text-sm text-muted-foreground">{contact.role}</p>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Accordion type="multiple" defaultValue={['about', 'files']} className="w-full">
          <AccordionItem value="about">
            <AccordionTrigger>About</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {contact.name.toLowerCase().replace(' ', '.')}@example.com</p>
                <p><strong>Team:</strong> Engineering</p>
                <p><strong>Location:</strong> Remote</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="files">
            <AccordionTrigger>Shared Files</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                  <File className="h-5 w-5 text-primary" />
                  <span className="flex-1 truncate text-sm">project_brief.pdf</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                  <Image className="h-5 w-5 text-primary" />
                  <span className="flex-1 truncate text-sm">wireframes_v2.png</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                  <Link className="h-5 w-5 text-primary" />
                  <span className="flex-1 truncate text-sm">staging-server-link</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <div className="p-4 border-t space-y-4">
        <Button variant="outline" className="w-full justify-between">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">On</span>
          </div>
        </Button>
        <Button variant="destructive" className="w-full">Block</Button>
      </div>
    </Card>
  );
}
