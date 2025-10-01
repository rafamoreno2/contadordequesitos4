'use client';

import { useState, useEffect } from 'react';
import AuthScreen from '@/components/auth-screen';
import QuesitoForm from '@/components/quesito-form';
import QuesitoList from '@/components/quesito-list';
import { AvatarIcon } from '@/components/avatar-icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Loader2 } from 'lucide-react';
import type { User, Quesito } from '@/types';
import AlexElCapoAnimation from '@/components/alex-el-capo-animation';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [quesitos, setQuesitos] = useState<Quesito[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedUser = localStorage.getItem('quesitoUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedQuesitos = localStorage.getItem('quesitosList');
      if (storedQuesitos) {
        setQuesitos(JSON.parse(storedQuesitos));
      }
    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      localStorage.removeItem('quesitoUser');
      localStorage.removeItem('quesitosList');
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

  const handleLogin = (username: string, avatar: string) => {
    setUser({ username, avatar });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAddQuesito = (igUsername: string) => {
    if (!user) return;
    const newQuesito = { id: Date.now(), igUsername, addedBy: user };
    setQuesitos(prevQuesitos => [newQuesito, ...prevQuesitos]);
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
        <AlexElCapoAnimation />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <AlexElCapoAnimation />
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-headline tracking-tight">
              Contador de Quesitos
            </h1>
            <div className="hidden sm:block text-lg font-semibold text-accent-foreground py-2 px-4 rounded-lg bg-accent/30">
              Total: <span className="font-bold">{quesitos.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-12 items-center gap-2 px-2">
                  <div className="bg-primary/20 p-1.5 rounded-full">
                    <AvatarIcon avatar={user.avatar} className="h-7 w-7 text-primary" />
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
        <div className="mx-auto max-w-2xl space-y-8">
          <QuesitoForm onAddQuesito={handleAddQuesito} />
          <QuesitoList quesitos={quesitos} />
        </div>
      </main>
    </div>
  );
}
