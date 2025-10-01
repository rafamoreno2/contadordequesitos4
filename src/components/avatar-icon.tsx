'use client';

import { Cat, Dog, Bird, Rabbit, Turtle, type LucideProps } from 'lucide-react';
import type { FC } from 'react';

export const avatarComponents: { [key: string]: FC<LucideProps> } = {
  cat: Cat,
  dog: Dog,
  bird: Bird,
  rabbit: Rabbit,
  turtle: Turtle,
};

export const AvatarIcon: FC<{ avatar: string; className?: string }> = ({ avatar, className }) => {
  const IconComponent = avatarComponents[avatar];
  return IconComponent ? <IconComponent className={className} /> : null;
};
