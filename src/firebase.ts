import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  type Auth,
  type UserCredential,
} from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import appletFirebaseConfig from '../firebase-applet-config.json';
import { SCHOOL_DOMAIN } from './data/schoolData';

/**
 * CONFIGURAZIONE FIREBASE UFFICIALE — LISTA 1 EN-CORE (PANETTI PITAGORA)
 * ----------------------------------------------------------------------
 * Questo file utilizza automaticamente la configurazione generata in
 * `firebase-applet-config.json`.
 */
const firebaseConfig = appletFirebaseConfig;

export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes('remixed-project-id')
);

export const googleOAuthClientId = firebaseConfig?.oAuthClientId ?? '';

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const auth = authInstance;
export const db = dbInstance;

// Configurazione rigida Google Workspace per dominio @panettipitagora.edu.it
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: SCHOOL_DOMAIN,
  prompt: 'select_account',
});

interface GoogleOAuthTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleGsiGlobal {
  accounts?: {
    oauth2?: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        hd?: string;
        prompt?: string;
        callback: (resp: GoogleOAuthTokenResponse) => void;
        error_callback?: (err: { type?: string; message?: string }) => void;
      }) => {
        requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
      };
    };
  };
}

let gsiScriptPromise: Promise<void> | null = null;

function loadGoogleGsiScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Ambiente browser non disponibile.'));
  }
  const win = window as unknown as { google?: GoogleGsiGlobal };
  if (win.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (gsiScriptPromise) {
    return gsiScriptPromise;
  }
  gsiScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Impossibile caricare accounts.google.com.')),
        { once: true }
      );
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gsiScriptPromise = null;
      reject(new Error('Impossibile caricare il servizio di accesso Google.'));
    };
    document.head.appendChild(script);
  });
  return gsiScriptPromise;
}

/**
 * Accesso Google diretto tramite accounts.google.com (senza passare da *.firebaseapp.com),
 * ideale quando il firewall o filtro DNS della rete scolastica blocca *.firebaseapp.com.
 */
export async function signInWithDirectGoogleOAuth(): Promise<UserCredential> {
  if (!authInstance) {
    throw new Error('Firebase Auth non è configurato.');
  }
  if (!googleOAuthClientId) {
    throw new Error('Client ID OAuth Google non presente nella configurazione.');
  }

  await loadGoogleGsiScript();

  const win = window as unknown as { google?: GoogleGsiGlobal };
  const oauth2 = win.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Modulo Google Identity Services non disponibile.');
  }

  const accessToken = await new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: googleOAuthClientId,
      scope: 'openid email profile',
      hd: SCHOOL_DOMAIN,
      prompt: 'select_account',
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(
            new Error(
              resp.error_description ||
                resp.error ||
                'Accesso Google non completato.'
            )
          );
          return;
        }
        resolve(resp.access_token);
      },
      error_callback: (err) => {
        reject(
          new Error(
            err?.type === 'popup_closed'
              ? 'popup-closed-by-user'
              : err?.message || 'Errore popup Google Identity.'
          )
        );
      },
    });

    client.requestAccessToken({ prompt: 'select_account' });
  });

  const credential = GoogleAuthProvider.credential(null, accessToken);
  return signInWithCredential(authInstance, credential);
}

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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid ?? null,
      email: authInstance?.currentUser?.email ?? null,
      emailVerified: authInstance?.currentUser?.emailVerified ?? null,
      isAnonymous: authInstance?.currentUser?.isAnonymous ?? null,
      tenantId: authInstance?.currentUser?.tenantId ?? null,
      providerInfo:
        authInstance?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) ?? [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Verifica la configurazione Firebase: il client risulta offline.');
      return false;
    }
    // Un errore di permessi o documento assente conferma comunque la raggiungibilità del server
    return true;
  }
}
