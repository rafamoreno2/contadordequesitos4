'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function AlexElCapoAnimation() {
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const scheduleNextAppearance = () => {
      // Hide for 10-20 seconds
      const hideDuration = Math.random() * 10000 + 10000;
      setTimeout(() => {
        setShow(true);
        setKey(prev => prev + 1);
        // Show for 20 seconds (duration of animation)
        setTimeout(() => {
          setShow(false);
          scheduleNextAppearance();
        }, 20000); 
      }, hideDuration);
    };

    scheduleNextAppearance();
  }, []);

  return (
    <div
      key={key}
      className={cn(
        'fixed bottom-0 left-0 h-48 w-[200px] z-50 pointer-events-none',
        show ? 'animate-walk' : 'hidden'
      )}
    >
      <Image
        src="https://picsum.photos/seed/alex/200/200"
        alt="Alex el capo"
        width={200}
        height={200}
        data-ai-hint="walking person"
        className="object-contain"
      />
    </div>
  );
}
