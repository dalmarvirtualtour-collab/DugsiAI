'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface OutboxItem {
  id: string;
  url: string;
  method: string;
  body: any;
  timestamp: number;
}

interface SyncContextType {
  isOnline: boolean;
  outboxCount: number;
  saveOffline: (url: string, method: string, body: any) => Promise<void>;
  syncOutbox: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [outboxCount, setOutboxCount] = useState<number>(0);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Initialize IndexedDB outbox store
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const request = indexedDB.open('dugsiai-sync-db', 1);

    request.onupgradeneeded = (event: any) => {
      const activeDb = event.target.result;
      if (!activeDb.objectStoreNames.contains('outbox')) {
        activeDb.createObjectStore('outbox', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      const activeDb = event.target.result;
      setDb(activeDb);
      updateOutboxCount(activeDb);
    };

    request.onerror = (err) => {
      console.error('Failed to open sync IndexedDB:', err);
    };

    // Connection hooks
    const handleOnline = () => {
      setIsOnline(true);
      if (request.result) {
        drainOutbox(request.result);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateOutboxCount = (activeDb: IDBDatabase) => {
    try {
      const transaction = activeDb.transaction('outbox', 'readonly');
      const store = transaction.objectStore('outbox');
      const countReq = store.count();
      countReq.onsuccess = () => {
        setOutboxCount(countReq.result);
      };
    } catch (e) {
      console.error('Failed to update outbox count:', e);
    }
  };

  const saveOffline = async (url: string, method: string, body: any) => {
    if (!db) {
      console.error('Database connection not ready.');
      return;
    }

    const id = crypto.randomUUID();
    const finalBody = body && typeof body === 'object'
      ? { ...body, transaction_id: body.transaction_id || id }
      : body;

    const newItem: OutboxItem = {
      id,
      url,
      method,
      body: finalBody,
      timestamp: Date.now()
    };

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('outbox', 'readwrite');
      const store = transaction.objectStore('outbox');
      const addReq = store.add(newItem);

      addReq.onsuccess = () => {
        updateOutboxCount(db);
        resolve();
      };

      addReq.onerror = (err) => {
        console.error('Failed to write offline request to IndexedDB outbox:', err);
        reject(err);
      };
    });
  };

  const drainOutbox = async (activeDb: IDBDatabase) => {
    const transaction = activeDb.transaction('outbox', 'readwrite');
    const store = transaction.objectStore('outbox');
    const getReq = store.getAll();

    getReq.onsuccess = async () => {
      const items: OutboxItem[] = getReq.result;
      if (items.length === 0) return;

      console.info(`Draining ${items.length} offline queued items...`);

      for (const item of items) {
        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.body)
          });
          if (response.ok) {
            // Remove item from IndexedDB on success
            const deleteTx = activeDb.transaction('outbox', 'readwrite');
            deleteTx.objectStore('outbox').delete(item.id);
          }
        } catch (err) {
          console.error(`Failed to drain sync item: ${item.id}:`, err);
        }
      }
      updateOutboxCount(activeDb);
    };
  };

  const syncOutbox = async () => {
    if (db) {
      await drainOutbox(db);
    }
  };

  return (
    <SyncContext.Provider value={{ isOnline, outboxCount, saveOffline, syncOutbox }}>
      {children}
      
      {/* Offline indicators */}
      {!isOnline && (
        <div className="fixed bottom-6 left-6 z-50 bg-amber-950 border border-amber-900/60 text-amber-300 text-xs font-semibold px-4 py-3 rounded-lg shadow-xl shadow-black/80 flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          <span>Working Offline (Changes Saved Locally)</span>
        </div>
      )}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
