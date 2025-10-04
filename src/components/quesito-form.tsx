'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, AtSign, User, MapPin } from 'lucide-react';

type QuesitoFormProps = {
  onAddQuesito: (name: string, igUsername: string, location: string) => void;
};

export default function QuesitoForm({ onAddQuesito }: QuesitoFormProps) {
  const [name, setName] = useState('');
  const [igUsername, setIgUsername] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && igUsername.trim() && location.trim()) {
      onAddQuesito(name.trim(), igUsername.trim(), location.trim());
      setName('');
      setIgUsername('');
      setLocation('');
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg shadow-primary/5">
      <CardHeader className="bg-muted/30">
        <CardTitle className="font-headline text-xl text-foreground">Añadir un nuevo Quesito</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-grow w-full">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Nombre de la persona"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10"
                aria-label="Nombre de la persona"
              />
            </div>
            <div className="relative flex-grow w-full">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Usuario de Instagram"
                value={igUsername}
                onChange={(e) => setIgUsername(e.target.value)}
                required
                className="pl-10"
                aria-label="Usuario de Instagram"
              />
            </div>
          </div>
           <div className="relative flex-grow w-full">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Ubicación (ej: Parque del Retiro, Madrid)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="pl-10"
                aria-label="Ubicación del quesito"
              />
            </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-5 w-5" />
            Añadir Quesito (+1 Quesito)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
