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
import type { User, UserProfile, Quesito, Contributor, Message } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useAuth, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, increment } from 'firebase/firestore';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';


export default function Home() {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);

  const userProfileRef = useMemoFirebase(() => 
    firestore && firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null
  , [firestore, firebaseUser]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const quesitosRef = useMemoFirebase(() => 
    firestore && firebaseUser ? collection(firestore, 'quesitos') : null
  , [firestore, firebaseUser]);
  const { data: quesitos = [] } = useCollection<Quesito>(quesitosRef);
  
  const messagesRef = useMemoFirebase(() => 
    firestore && firebaseUser ? collection(firestore, 'messages') : null
  , [firestore, firebaseUser]);
  const { data: messages = [] } = useCollection<Message>(messagesRef);

  useEffect(() => {
    if (firebaseUser && userProfile) {
      setUser({
        id: firebaseUser.uid,
        ...userProfile,
      });
    } else {
      setUser(null);
    }
  }, [firebaseUser, userProfile]);
  
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


  const handleLogout = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
  };

  const handleAddQuesito = async (name: string, igUsername: string) => {
    if (!user || !firestore) return;
    
    const newQuesito = { 
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

    const userDocRef = doc(firestore, 'users', user.id);
    const quesitosColRef = collection(firestore, 'quesitos');

    try {
      const batch = writeBatch(firestore);
      batch.set(doc(quesitosColRef), newQuesito);
      batch.update(userDocRef, { quesitosBalance: increment(1) });
      await batch.commit();

      toast({
        title: "¡Quesito añadido!",
        description: `Has ganado 1 quesito.`,
      });
    } catch (error) {
      console.error("Error adding quesito: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo añadir el quesito.",
      });
    }
  };

  const handleReveal = async (quesitoId: string) => {
    if (!user || !firestore) return;

    const cost = 5;
    if ((user.quesitosBalance || 0) < cost) {
      toast({
        variant: "destructive",
        title: "¡No tienes suficientes quesitos!",
        description: `Necesitas ${cost} quesitos para revelar este usuario.`,
      });
      return;
    }
    
    const userDocRef = doc(firestore, 'users', user.id);
    const quesitoDocRef = doc(firestore, 'quesitos', quesitoId);
    
    const currentQuesito = quesitos?.find(q => q.id === quesitoId);
    if (!currentQuesito) return;
    const updatedRevealedBy = [...currentQuesito.revealedBy, user.id];

    try {
      const batch = writeBatch(firestore);
      batch.update(userDocRef, { quesitosBalance: increment(-cost) });
      batch.update(quesitoDocRef, { revealedBy: updatedRevealedBy });
      await batch.commit();

      toast({
        title: "¡Usuario revelado!",
        description: `Has gastado ${cost} quesitos.`,
      });
    } catch (error) {
      console.error("Error revealing quesito: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo revelar el usuario.",
      });
    }
  };
  
  const handleSendMessage = (text: string) => {
    if (!user || !firestore) return;
    const messagesColRef = collection(firestore, 'messages');
    
    const newMessage = {
      text,
      user: {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      timestamp: Date.now(),
    };
    
    addDocumentNonBlocking(messagesColRef, newMessage);
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
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
              Total: <span className="font-bold">{quesitos?.length || 0}</span>
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
