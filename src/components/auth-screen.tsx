'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { avatarComponents, AvatarIcon } from '@/components/avatar-icon';
import { cn } from '@/lib/utils';
import { User as UserIcon, Upload, LogIn, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import type { User } from '@/types';

const availableAvatars = Object.keys(avatarComponents);

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(availableAvatars[0]);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    // If the user's profile is fully updated, redirect to home.
    if (!isUserLoading && authUser?.displayName) {
      router.push('/');
    }
  }, [authUser, isUserLoading, router]);


  const handleLogin = async () => {
    if (username.trim().length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const email = `${Date.now()}@quesitos.app`;
      const password = Math.random().toString(36).slice(-8);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username.trim(),
        photoURL: customAvatar || avatar,
      });

      // After updating profile, create the user document in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userData: User = {
        id: user.uid,
        username: user.displayName || username.trim(),
        avatar: user.photoURL || customAvatar || avatar,
        quesitosBalance: 0
      };
      // This is a "fire and forget" call, but it's crucial to create the user doc
      setDocumentNonBlocking(userDocRef, userData, { merge: true });
      
      // The useEffect will handle the redirect once displayName is available.
      // We might need a manual reload to ensure the auth state is updated for the redirect.
      router.refresh();

    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || "No se pudo iniciar sesión. Inténtalo de nuevo.");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCustomAvatar(dataUrl);
        setAvatar('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (isUserLoading || authUser?.displayName) {
    return (
       <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="font-headline text-3xl text-foreground">Contador de Quesitos</CardTitle>
          <CardDescription>Elige un nombre de usuario y un avatar para empezar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Tu nombre de usuario..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10"
                  aria-label="Nombre de usuario"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Elige tu avatar</Label>
              <RadioGroup 
                value={customAvatar ? 'custom' : avatar} 
                onValueChange={(value) => {
                  if (value !== 'custom') {
                    setCustomAvatar(null);
                  }
                  setAvatar(value);
                }} 
                className="grid grid-cols-5 gap-3" 
                aria-label="Selección de avatar"
              >
                {availableAvatars.map((avatarKey) => (
                  <div key={avatarKey}>
                    <RadioGroupItem value={avatarKey} id={avatarKey} className="sr-only" disabled={isLoading}/>
                    <Label
                      htmlFor={avatarKey}
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-3 aspect-square transition-all',
                        'hover:bg-accent/50 hover:border-accent hover:scale-105',
                        avatar === avatarKey && !customAvatar ? 'border-primary bg-primary/20 scale-105' : 'border-border',
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      )}
                    >
                      <AvatarIcon avatar={avatarKey} className="h-10 w-10 text-primary" />
                    </Label>
                  </div>
                ))}
                 <div>
                  <RadioGroupItem value="custom" id="custom" className="sr-only" disabled={isLoading} />
                    <Label
                      htmlFor="custom"
                      onClick={isLoading ? undefined : handleUploadClick}
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-3 aspect-square transition-all border-dashed',
                         'hover:bg-accent/50 hover:border-accent hover:scale-105',
                        customAvatar ? 'border-primary bg-primary/20 scale-105' : 'border-border',
                         isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      )}
                    >
                      {customAvatar ? (
                        <Image src={customAvatar} alt="Custom Avatar" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <Upload className="h-10 w-10 text-primary" />
                      )}
                    </Label>
                   <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isLoading}
                  />
                </div>
              </RadioGroup>
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2" />}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
