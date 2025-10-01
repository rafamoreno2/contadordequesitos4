'use client';

import type { Quesito } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { AvatarIcon } from '@/components/avatar-icon';

type QuesitoListProps = {
  quesitos: Quesito[];
};

export default function QuesitoList({ quesitos }: QuesitoListProps) {
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
        {quesitos.map((quesito, index) => (
          <li key={quesito.id} className="animate-fade-in-down" style={{ animationFillMode: 'backwards', animationDelay: `${index * 100}ms` }}>
            <Card className="transition-all hover:shadow-md hover:border-primary/50">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="font-semibold text-lg text-foreground">
                  @{quesito.igUsername}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground self-end sm:self-center">
                  <span>Añadido por:</span>
                  <div className="flex items-center gap-1 font-medium bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                    <AvatarIcon avatar={quesito.addedBy.avatar} className="h-4 w-4" />
                    <span>{quesito.addedBy.username}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
