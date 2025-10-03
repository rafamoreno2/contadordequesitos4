'use client';

import { useState, useEffect, useMemo } from 'react';
import AuthScreen from '@/components/auth-screen';
import QuesitoForm from '@/components/quesito-form';
import QuesitoList from '@/components/quesito-list';
import ContributorsTable from '@/components/contributors-table';
import ChatWidget from '@/components/chat-widget';
import { AvatarIcon } from '@/components/avatar-icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Loader2, Database } from 'lucide-react';
import type { User, Quesito, Contributor, Message } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};


export default function Home() {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [quesitos, setQuesitos] = useLocalStorage<Quesito[]>('quesitos', []);
  const [messages, setMessages] = useLocalStorage<Message[]>('messages', []);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = (username: string, avatar: string) => {
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      avatar,
      quesitosBalance: 0,
    };
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };
  
  const sortedQuesitos = useMemo(() => {
    return quesitos ? [...quesitos].sort((a, b) => b.createdAt - a.createdAt) : [];
  }, [quesitos]);

  const sortedMessages = useMemo(() => {
    return messages ? [...messages].sort((a, b) => a.timestamp - b.timestamp) : [];
  }, [messages]);

  const contributors = useMemo(() => {
    if (!quesitos) return [];
    const counts: Record<string, { id: string, username: string; avatar: string; count: number; }> = {};
    
    quesitos.forEach(quesito => {
      const { userId, username, avatar } = quesito.addedBy;
      if (!counts[userId]) {
        counts[userId] = { id: userId, username, avatar, count: 0 };
      }
      counts[userId].count++;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) as Contributor[];
  }, [quesitos]);


  const handleAddQuesito = (name: string, igUsername: string) => {
    if (!user) return;

    const newQuesito = {
      id: `quesito_${Date.now()}`,
      name,
      igUsername,
      addedBy: {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      revealedBy: [],
      createdAt: Date.now(),
    };
    
    setQuesitos([...quesitos, newQuesito]);
    setUser({ ...user, quesitosBalance: (user.quesitosBalance || 0) + 1 });
    
    toast({
      title: "¡Quesito añadido!",
      description: `Has ganado 1 quesito.`,
    });
  };

  const handleReveal = (quesitoId: string) => {
    if (!user) return;

    const cost = 5;
    if ((user.quesitosBalance || 0) < cost) {
      toast({
        variant: "destructive",
        title: "¡No tienes suficientes quesitos!",
        description: `Necesitas ${cost} quesitos para revelar este usuario.`,
      });
      return;
    }
    
    const updatedQuesitos = quesitos.map(q => {
      if (q.id === quesitoId) {
        return { ...q, revealedBy: [...q.revealedBy, user.id] };
      }
      return q;
    });

    setQuesitos(updatedQuesitos);
    setUser({ ...user, quesitosBalance: user.quesitosBalance - cost });

    toast({
      title: "¡Usuario revelado!",
      description: `Has gastado ${cost} quesitos.`,
    });
  };
  
  const handleSendMessage = (text: string) => {
    if (!user) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      text,
      user: {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      timestamp: Date.now(),
    };

    setMessages([...messages, newMessage]);
  };

  if (!isClient) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-headline tracking-tight">
              Contador de Quesitos
            </h1>
            <div className="text-lg font-semibold text-accent-foreground py-2 px-4 rounded-lg bg-accent/30">
              Total: <span className="font-bold">{quesitos.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-sm font-semibold text-primary-foreground py-1.5 px-3 rounded-full bg-primary/80">
              <Database className="h-4 w-4" />
              <span>{user.quesitosBalance || 0}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-12 items-center gap-2 px-2">
                  <div className="bg-primary/20 p-1.5 rounded-full">
                    <AvatarIcon 
                      avatar={user.avatar} 
                      className={cn(
                        'h-7 w-7', 
                        user.avatar.startsWith('data:image') ? '' : 'text-primary'
                      )}
                    />
                  </div>
                  <span className="hidden md:inline font-semibold">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <QuesitoForm onAddQuesito={handleAddQuesito} />
            <QuesitoList 
              quesitos={sortedQuesitos} 
              currentUser={user}
              onReveal={handleReveal}
            />
          </div>
          <div className="space-y-8">
             <ContributorsTable contributors={contributors} />
          </div>
        </div>
      </main>

      <ChatWidget
        user={user}
        messages={sortedMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
