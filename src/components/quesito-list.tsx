'use client';

import type { Quesito, User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { AvatarIcon } from '@/components/avatar-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, Database } from 'lucide-react';

type QuesitoListProps = {
  quesitos: Quesito[];
  currentUser: User;
  onReveal: (quesitoId: string) => void;
};

export default function QuesitoList({ quesitos, currentUser, onReveal }: QuesitoListProps) {
  if (quesitos.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-16 border-2 border-dashed border-border rounded-lg bg-card">
        <p className="text-lg font-medium">¡Aún no hay quesitos!</p>
        <p>Añade el primero para empezar la lista.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold font-headline text-foreground">Lista Global de Quesitos</h2>
      <ul className="space-y-3">
        {quesitos.map((quesito, index) => {
          const isAddedByCurrentUser = quesito.addedBy.userId === currentUser.id;
          const isRevealed = isAddedByCurrentUser || quesito.revealedBy.includes(currentUser.id);

          return (
            <li key={quesito.id} className="animate-fade-in-down" style={{ animationFillMode: 'backwards', animationDelay: `${index * 100}ms` }}>
              <Card className="transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-foreground">
                      {quesito.name}
                    </div>
                     <div className="text-sm text-muted-foreground mt-1">
                      {isRevealed ? (
                        <a href={`https://instagram.com/${quesito.igUsername}`} target="_blank" rel="noopener noreferrer" className="text-accent-foreground font-semibold hover:underline">
                          @{quesito.igUsername}
                        </a>
                      ) : (
                        'Usuario de Instagram oculto'
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    {!isRevealed && (
                      <Button variant="outline" size="sm" onClick={() => onReveal(quesito.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Revelar
                        <div className="flex items-center ml-2 border-l pl-2 gap-1 text-primary">
                          <Database className="h-3 w-3" /> 5
                        </div>
                      </Button>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Añadido por:</span>
                      <div className="flex items-center gap-1 font-medium bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                        <AvatarIcon 
                          avatar={quesito.addedBy.avatar} 
                          className={cn('h-4 w-4', quesito.addedBy.avatar.startsWith('data:image') ? '' : 'text-secondary-foreground')}
                        />
                        <span>{quesito.addedBy.username}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
