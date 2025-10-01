'use client';

import type { Contributor } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AvatarIcon } from '@/components/avatar-icon';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

type ContributorsTableProps = {
  contributors: Contributor[];
};

export default function ContributorsTable({ contributors }: ContributorsTableProps) {
  return (
    <Card className="shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-foreground flex items-center gap-2">
          <Crown className="text-yellow-500" />
          Mayores Contribuidores
        </CardTitle>
        <CardDescription>Top 5 quesito contributors.</CardDescription>
      </CardHeader>
      <CardContent>
        {contributors.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead className="text-right">Quesitos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributors.map((contributor, index) => (
                <TableRow key={contributor.username}>
                  <TableCell className="font-bold text-center text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AvatarIcon
                        avatar={contributor.avatar}
                        className={cn('h-6 w-6', contributor.avatar.startsWith('data:image') ? '' : 'text-primary')}
                      />
                      <span className="font-medium">{contributor.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {contributor.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Aún no hay contribuidores.</p>
            <p>¡Sé el primero en añadir un quesito!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
