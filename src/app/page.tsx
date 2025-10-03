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
import { 
  useAuth,
  useUser, 
  useFirestore, 
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  updateDocumentNonBlocking
} from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy, writeBatch } from 'firebase/firestore';
import { signOut } from 'firebase/auth';


export default function Home() {
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const [localUser, setLocalUser] = useState<User | null>(null);

  const { data: quesitosData, isLoading: quesitosLoading } = useCollection<Quesito>(
    useMemoFirebase(() => authUser ? query(collection(firestore, 'quesitos'), orderBy('createdAt', 'desc')) : null, [firestore, authUser])
  );
  
  const { data: messagesData, isLoading: messagesLoading } = useCollection<Message>(
    useMemoFirebase(() => authUser ? query(collection(firestore, 'messages'), orderBy('timestamp', 'asc')) : null, [firestore, authUser])
  );

  const { toast } = useToast();

  useEffect(() => {
    if (authUser) {
      const userDocRef = doc(firestore, 'users', authUser.uid);
      const { uid, displayName, photoURL } = authUser;
      
      const userData: User = {
        id: uid,
        username: displayName || 'Usuario Anónimo',
        avatar: photoURL || 'bug', // Default avatar
        quesitosBalance: localUser?.quesitosBalance ?? 0, // Preserve balance if available
      };

      // Check if user exists, if not, create it
      setDocumentNonBlocking(userDocRef, userData, { merge: true });
      setLocalUser(userData);

    } else if (!isUserLoading) {
      setLocalUser(null);
    }
  }, [authUser, isUserLoading, firestore, localUser?.quesitosBalance]);
  
  const handleLogout = () => {
    signOut(auth);
  };
  
  const contributors = useMemo(() => {
    if (!quesitosData) return [];
    const counts: Record<string, { id: string, username: string; avatar: string; count: number; }> = {};
    
    quesitosData.forEach(quesito => {
      const { userId, username, avatar } = quesito.addedBy;
      if (!counts[userId]) {
        counts[userId] = { id: userId, username, avatar, count: 0 };
      }
      counts[userId].count++;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) as Contributor[];
  }, [quesitosData]);


  const handleAddQuesito = (name: string, igUsername: string) => {
    if (!localUser) return;

    const quesitosColRef = collection(firestore, 'quesitos');
    const userDocRef = doc(firestore, 'users', localUser.id);
    const newBalance = (localUser.quesitosBalance || 0) + 1;

    addDocumentNonBlocking(quesitosColRef, {
      name,
      igUsername,
      addedBy: {
        userId: localUser.id,
        username: localUser.username,
        avatar: localUser.avatar,
      },
      revealedBy: [],
      createdAt: serverTimestamp(),
    });

    updateDocumentNonBlocking(userDocRef, { quesitosBalance: newBalance });
    setLocalUser({ ...localUser, quesitosBalance: newBalance });
    
    toast({
      title: "¡Quesito añadido!",
      description: `Has ganado 1 quesito.`,
    });
  };

  const handleReveal = (quesitoId: string) => {
    if (!localUser) return;

    const cost = 5;
    if ((localUser.quesitosBalance || 0) < cost) {
      toast({
        variant: "destructive",
        title: "¡No tienes suficientes quesitos!",
        description: `Necesitas ${cost} quesitos para revelar este usuario.`,
      });
      return;
    }
    
    const quesitoDocRef = doc(firestore, 'quesitos', quesitoId);
    const userDocRef = doc(firestore, 'users', localUser.id);
    const newBalance = localUser.quesitosBalance - cost;

    const batch = writeBatch(firestore);

    const quesitoToUpdate = quesitosData?.find(q => q.id === quesitoId);
    if(quesitoToUpdate) {
       batch.update(quesitoDocRef, { revealedBy: [...quesitoToUpdate.revealedBy, localUser.id] });
    }
   
    batch.update(userDocRef, { quesitosBalance: newBalance });

    batch.commit().then(() => {
       setLocalUser({ ...localUser, quesitosBalance: newBalance });
       toast({
        title: "¡Usuario revelado!",
        description: `Has gastado ${cost} quesitos.`,
      });
    }).catch(err => {
      console.error("Error revealing quesito:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo revelar el usuario.",
      });
    })
  };
  
  const handleSendMessage = (text: string) => {
    if (!localUser) return;
    
    const messagesColRef = collection(firestore, 'messages');

    addDocumentNonBlocking(messagesColRef, {
      text,
      user: {
        userId: localUser.id,
        username: localUser.username,
        avatar: localUser.avatar,
      },
      timestamp: serverTimestamp(),
    });
  };

  if (isUserLoading || (authUser && !localUser)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!localUser) {
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
              Total: <span className="font-bold">{quesitosData?.length || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-sm font-semibold text-primary-foreground py-1.5 px-3 rounded-full bg-primary/80">
              <Database className="h-4 w-4" />
              <span>{localUser.quesitosBalance || 0}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-12 items-center gap-2 px-2">
                  <div className="bg-primary/20 p-1.5 rounded-full">
                    <AvatarIcon 
                      avatar={localUser.avatar} 
                      className={cn(
                        'h-7 w-7', 
                        localUser.avatar.startsWith('data:image') ? '' : 'text-primary'
                      )}
                    />
                  </div>
                  <span className="hidden md:inline font-semibold">{localUser.username}</span>
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
              quesitos={quesitosData || []} 
              currentUser={localUser}
              onReveal={handleReveal}
            />
          </div>
          <div className="space-y-8">
             <ContributorsTable contributors={contributors} />
          </div>
        </div>
      </main>

      <ChatWidget
        user={localUser}
        messages={messagesData || []}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
