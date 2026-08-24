import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('[Firestore Log]', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Resilient helper that executes a Firestore write operation with a strict timeout guard.
 * If Firestore is quota-limited (resource-exhausted) or offline with endless backoff retries,
 * this function times out gracefully so user signup/login/UI actions NEVER freeze.
 */
export async function safeFirestoreWrite<T>(
  writeOperation: () => Promise<T>,
  timeoutMs: number = 2500
): Promise<boolean> {
  return new Promise((resolve) => {
    let completed = false;
    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        console.warn('[Firestore] Write operation timed out (quota limit or backoff active). Continuing locally.');
        resolve(false);
      }
    }, timeoutMs);

    writeOperation()
      .then(() => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          resolve(true);
        }
      })
      .catch((err) => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          console.warn('[Firestore] Write operation notice:', err?.message || err);
          resolve(false);
        }
      });
  });
}

/**
 * Resilient helper for reading Firestore documents with fallback.
 */
export async function safeFirestoreRead<T>(
  readOperation: () => Promise<T>,
  fallbackValue: T,
  timeoutMs: number = 2500
): Promise<T> {
  return new Promise((resolve) => {
    let completed = false;
    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        console.warn('[Firestore] Read operation timed out (quota limit or offline). Returning fallback.');
        resolve(fallbackValue);
      }
    }, timeoutMs);

    readOperation()
      .then((res) => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          resolve(res);
        }
      })
      .catch((err) => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          console.warn('[Firestore] Read operation notice:', err?.message || err);
          resolve(fallbackValue);
        }
      });
  });
}


