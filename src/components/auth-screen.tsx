'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { avatarComponents, AvatarIcon } from '@/components/avatar-icon';
import { cn } from '@/lib/utils';
import { User as UserIcon, Upload } from 'lucide-react';
import Image from 'next/image';

const availableAvatars = Object.keys(avatarComponents);

type AuthScreenProps = {
  onLogin: (username: string, avatar: string) => void;
};

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(availableAvatars[0]);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    setError('');
    const loginAvatar = customAvatar || avatar;
    onLogin(username.trim(), loginAvatar);
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
                    <RadioGroupItem value={avatarKey} id={avatarKey} className="sr-only" />
                    <Label
                      htmlFor={avatarKey}
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-3 aspect-square transition-all',
                        'hover:bg-accent/50 hover:border-accent hover:scale-105',
                        avatar === avatarKey && !customAvatar ? 'border-primary bg-primary/20 scale-105' : 'border-border'
                      )}
                    >
                      <AvatarIcon avatar={avatarKey} className="h-10 w-10 text-primary" />
                    </Label>
                  </div>
                ))}
                 <div>
                  <RadioGroupItem value="custom" id="custom" className="sr-only" />
                    <Label
                      htmlFor="custom"
                      onClick={handleUploadClick}
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-3 aspect-square transition-all',
                         'hover:bg-accent/50 hover:border-accent hover:scale-105',
                        customAvatar ? 'border-primary bg-primary/20 scale-105' : 'border-border'
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
                  />
                </div>
              </RadioGroup>
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
