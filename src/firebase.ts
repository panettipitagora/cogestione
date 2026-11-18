import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
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
 *
 * Se vuoi collegare un progetto Firebase esterno manuale, sostituisci
 * l'oggetto `firebaseConfig` qui sotto con le chiavi della tua Console Firebase:
 *
 * const manualFirebaseConfig = {
 *   apiKey: "INSERISCI_LA_TUA_API_KEY",
 *   authDomain: "tuo-progetto.firebaseapp.com",
 *   projectId: "tuo-progetto",
 *   storageBucket: "tuo-progetto.firebasestorage.app",
 *   messagingSenderId: "000000000000",
 *   appId: "1:000000000000:web:xxxxxxxxxxxx",
 *   firestoreDatabaseId: "(default)" // oppure ID database dedicato
 * };
 */
const firebaseConfig = appletFirebaseConfig;

export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes('remixed-project-id')
);

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
