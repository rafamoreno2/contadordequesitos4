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

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [quesitos, setQuesitos] = useState<Quesito[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedUser = localStorage.getItem('quesitoUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (typeof parsedUser.quesitosBalance !== 'number') {
            parsedUser.quesitosBalance = 0;
        }
        setUser(parsedUser);
      }
      const storedQuesitos = localStorage.getItem('quesitosList');
      if (storedQuesitos) {
        setQuesitos(JSON.parse(storedQuesitos));
      }
      const storedMessages = localStorage.getItem('quesitoMessages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      localStorage.removeItem('quesitoUser');
      localStorage.removeItem('quesitosList');
      localStorage.removeItem('quesitoMessages');
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (user) {
        localStorage.setItem('quesitoUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('quesitoUser');
      }
    }
  }, [user, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('quesitosList', JSON.stringify(quesitos));
    }
  }, [quesitos, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('quesitoMessages', JSON.stringify(messages));
    }
  }, [messages, isMounted]);


  const contributors = useMemo(() => {
    const counts = quesitos.reduce((acc, quesito) => {
      const username = quesito.addedBy.username;
      if (!acc[username]) {
        acc[username] = { count: 0, user: quesito.addedBy };
      }
      acc[username].count++;
      return acc;
    }, {} as Record<string, { count: number; user: User }>);

    return Object.values(counts)
      .map(data => ({ ...data.user, count: data.count } as Contributor))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [quesitos]);

  const handleLogin = (username: string, avatar: string) => {
    // Check if user already exists to preserve balance
    try {
      const storedUsers = JSON.parse(localStorage.getItem('quesitoUsers') || '{}');
      const existingUser = storedUsers[username];
      if (existingUser) {
        if (typeof existingUser.quesitosBalance !== 'number') {
            existingUser.quesitosBalance = 0;
        }
        setUser(existingUser);
      } else {
        const newUser = { username, avatar, quesitosBalance: 0 };
        storedUsers[username] = newUser;
        setUser(newUser);
        localStorage.setItem('quesitoUsers', JSON.stringify(storedUsers));
      }
    } catch (error) {
      const newUser = { username, avatar, quesitosBalance: 0 };
      const newUsers = {[username]: newUser};
      setUser(newUser);
      localStorage.setItem('quesitoUsers', JSON.stringify(newUsers));
    }
  };

  const handleLogout = () => {
     if(user) {
        try {
            const storedUsers = JSON.parse(localStorage.getItem('quesitoUsers') || '{}');
            storedUsers[user.username] = user;
            localStorage.setItem('quesitoUsers', JSON.stringify(storedUsers));
        } catch(e) {
            console.error("Could not save user data on logout");
        }
     }
    setUser(null);
  };

  const handleAddQuesito = (name: string, igUsername: string) => {
    if (!user) return;
    const newQuesito: Quesito = { 
      id: Date.now(),
      name,
      igUsername,
      addedBy: user,
      revealedBy: [],
    };
    setQuesitos(prevQuesitos => [newQuesito, ...prevQuesitos]);
    const newBalance = (user.quesitosBalance || 0) + 1;
    setUser(currentUser => currentUser ? { ...currentUser, quesitosBalance: newBalance } : null);
    toast({
      title: "¡Quesito añadido!",
      description: `Has ganado 1 quesito. ¡Ahora tienes ${newBalance}!`,
    });
  };

  const handleReveal = (quesitoId: number) => {
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
    
    const newBalance = (user.quesitosBalance || 0) - cost;
    setUser(currentUser => currentUser ? { ...currentUser, quesitosBalance: newBalance } : null);
    setQuesitos(prevQuesitos => prevQuesitos.map(q => 
      q.id === quesitoId ? { ...q, revealedBy: [...q.revealedBy, user.username] } : q
    ));

    toast({
      title: "¡Usuario revelado!",
      description: `Has gastado ${cost} quesitos.`,
    });
  };
  
  const handleSendMessage = (text: string) => {
    if (!user) return;
    const newMessage: Message = {
      id: Date.now(),
      text,
      user,
      timestamp: Date.now(),
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} />
      </>
    );
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
              quesitos={quesitos} 
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
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
