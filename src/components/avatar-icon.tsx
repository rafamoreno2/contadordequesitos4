'use client';

import { Glasses, FlaskConical, Bug, Braces, Gamepad2, type LucideProps } from 'lucide-react';
import type { FC } from 'react';

export const avatarComponents: { [key: string]: FC<LucideProps> } = {
  glasses: Glasses,
  flask: FlaskConical,
  bug: Bug,
  braces: Braces,
  gamepad: Gamepad2,
};

export const AvatarIcon: FC<{ avatar: string; className?: string }> = ({ avatar, className }) => {
  const IconComponent = avatarComponents[avatar];
  return IconComponent ? <IconComponent className={className} /> : null;
};
