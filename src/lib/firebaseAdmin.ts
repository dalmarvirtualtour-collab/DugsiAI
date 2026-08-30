import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import fs from 'fs';
import path from 'path';

// Simple check to ensure we only initialize once
let db: any;

let projectId = process.env.FIREBASE_PROJECT_ID;
let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (typeof window === 'undefined') {
  // Dynamically load serviceAccountKey.json if credentials are not in env
  if (!projectId || !clientEmail || !privateKey) {
    const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(keyPath)) {
      try {
        const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        projectId = keyData.project_id;
        clientEmail = keyData.client_email;
        privateKey = keyData.private_key;
      } catch (e) {
        console.error('Failed to load local serviceAccountKey.json:', e);
      }
    }
  }

  let firebaseInitialized = false;

  if (getApps().length === 0) {
    if (projectId && clientEmail && privateKey) {
      try {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        console.log('Firebase Admin initialized successfully.');
        firebaseInitialized = true;
      } catch (error) {
        console.error('Firebase Admin initialization error, falling back to mock:', error);
      }
    } else {
      console.warn('Firebase credentials not set in environment or file. Running in fallback/simulation mode.');
    }
  } else {
    firebaseInitialized = true;
  }

  // Provide a robust mock Firestore database client if Firebase config is missing
  if (firebaseInitialized || getApps().length > 0) {
    db = getFirestore();
  } else {
    // In-memory mock for development without keys
    const mockStore: Record<string, Record<string, any>> = {};

    db = {
      collection: (collectionName: string) => {
        if (!mockStore[collectionName]) {
          mockStore[collectionName] = {};
        }
        return {
          doc: (docId: string) => {
            return {
              get: async () => {
                const data = mockStore[collectionName][docId];
                return {
                  exists: !!data,
                  data: () => data,
                };
              },
              set: async (data: any, options?: any) => {
                const existing = mockStore[collectionName][docId] || {};
                mockStore[collectionName][docId] = options?.merge 
                  ? { ...existing, ...data } 
                  : data;
                return { writeTime: new Date() };
              },
              update: async (data: any) => {
                const existing = mockStore[collectionName][docId] || {};
                mockStore[collectionName][docId] = { ...existing, ...data };
                return { writeTime: new Date() };
              },
              delete: async () => {
                delete mockStore[collectionName][docId];
                return { writeTime: new Date() };
              }
            };
          },
          where: (field: string, op: string, val: any) => {
            const allDocs = Object.entries(mockStore[collectionName] || {}).map(([id, data]) => ({
              id,
              ...data,
            }));
            const filtered = allDocs.filter(d => {
              if (op === '==') return d[field] === val;
              return false;
            });
            return {
              get: async () => {
                return {
                  empty: filtered.length === 0,
                  docs: filtered.map(f => ({
                    id: f.id,
                    data: () => f,
                  })),
                };
              },
            };
          },
        };
      },
      runTransaction: async (updateFunction: (transaction: any) => Promise<any>) => {
        // Mock transaction implementation
        const transaction = {
          get: async (docRef: any) => {
            return docRef.get();
          },
          set: (docRef: any, data: any, options?: any) => {
            docRef.set(data, options);
            return transaction;
          },
          update: (docRef: any, data: any) => {
            docRef.update(data);
            return transaction;
          },
          delete: (docRef: any) => {
            docRef.delete();
            return transaction;
          },
        };
        return updateFunction(transaction);
      },
    };
  }
}

export { db };
