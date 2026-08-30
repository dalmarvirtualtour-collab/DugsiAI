'use client';

import React, { useEffect } from 'react';
import { SyncProvider } from '@/context/SyncContext';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('DugsiAI Service Worker registered successfully:', reg.scope);
          })
          .catch((err) => {
            console.error('Service Worker registration failed:', err);
          });
      });
    }
  }, []);

  return <SyncProvider>{children}</SyncProvider>;
}
