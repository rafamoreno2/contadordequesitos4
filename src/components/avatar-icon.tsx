'use client';

import { Glasses, FlaskConical, Bug, Braces, Gamepad2, type LucideProps } from 'lucide-react';
import type { FC } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export const avatarComponents: { [key: string]: FC<LucideProps> } = {
  glasses: Glasses,
  flask: FlaskConical,
  bug: Bug,
  braces: Braces,
  gamepad: Gamepad2,
};

export const AvatarIcon: FC<{ avatar: string; className?: string }> = ({ avatar, className }) => {
  if (avatar.startsWith('data:image')) {
    return <Image src={avatar} alt="User Avatar" className={cn('rounded-full object-cover', className)} width={40} height={40} />;
  }
  const IconComponent = avatarComponents[avatar];
  return IconComponent ? <IconComponent className={className} /> : null;
};
