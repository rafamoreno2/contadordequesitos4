'use client';

import { useState, useRef, useEffect } from 'react';
import type { User, Message } from '@/types';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AvatarIcon } from '@/components/avatar-icon';
import { MessageSquare, Send, X, ChevronsUp, ChevronsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';


type ChatWidgetProps = {
  user: User;
  messages: Message[];
  onSendMessage: (text: string) => void;
};

export default function ChatWidget({ user, messages, onSendMessage }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector('div');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg z-20 bg-primary hover:bg-primary/90"
        aria-label="Abrir chat"
      >
        <MessageSquare className="h-8 w-8" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-[28rem] z-20 flex flex-col shadow-xl border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between p-3 bg-muted/50">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Mini-Chat Global
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7">
          <X className="h-5 w-5" />
          <span className="sr-only">Cerrar chat</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-3" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-start gap-2',
                  msg.user.userId === user.id ? 'justify-end' : ''
                )}
              >
                {msg.user.userId !== user.id && (
                  <AvatarIcon avatar={msg.user.avatar} className="h-6 w-6" />
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg px-3 py-2',
                    msg.user.userId === user.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{msg.text}</p>
                   <p className={cn("text-xs mt-1", msg.user.userId === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>
                    {msg.user.username} - {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: es })}
                  </p>
                </div>
                 {msg.user.userId === user.id && (
                  <AvatarIcon avatar={msg.user.avatar} className="h-6 w-6" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            autoComplete="off"
          />
          <Button type="submit" size="icon" aria-label="Enviar mensaje">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
