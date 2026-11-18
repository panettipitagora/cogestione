import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  INITIAL_ATTIVITA_CLASSI,
  INITIAL_CONVOCAZIONI,
  INITIAL_IMPOSTAZIONI,
  INITIAL_PARTITE,
} from '../data/mockSeed';
import type {
  AttivitaClasse,
  ConvocazioneTorneo,
  Disciplina,
  DocenteRecord,
  ImpostazioniEvento,
  PartitaTorneo,
  PreRole,
  SedeIstituto,
  SegnalazioneDocente,
  UserProfile,
} from '../types';
import { buildDefaultDocentiRecords } from '../utils/teacherMatcher';

function ensureDb() {
  if (!db) {
    throw new Error('Firebase Firestore non è configurato.');
  }
  return db;
}

export function subscribeEventData(handlers: {
  onAttivita: (items: AttivitaClasse[]) => void;
  onConvocazioni: (items: ConvocazioneTorneo[]) => void;
  onPartite: (items: PartitaTorneo[]) => void;
  onImpostazioni: (settings: ImpostazioniEvento) => void;
  onDocenti: (items: DocenteRecord[]) => void;
}): Unsubscribe[] {
  const firestore = ensureDb();
  const unsubs: Unsubscribe[] = [];

  unsubs.push(
    onSnapshot(
      query(collection(firestore, 'attivita_classi'), where('visibile', '==', true)),
      (snap) => {
        const list: AttivitaClasse[] = snap.docs.map((d) => ({
          ...(d.data() as Omit<AttivitaClasse, 'id'>),
          id: d.id,
        }));
        handlers.onAttivita(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'attivita_classi')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(firestore, 'convocazioni_tornei'), where('visibile', '==', true)),
      (snap) => {
        const list: ConvocazioneTorneo[] = snap.docs.map((d) => ({
          ...(d.data() as Omit<ConvocazioneTorneo, 'id'>),
          id: d.id,
        }));
        handlers.onConvocazioni(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'convocazioni_tornei')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(firestore, 'partite_tornei'), where('visibile', '==', true)),
      (snap) => {
        const list: PartitaTorneo[] = snap.docs.map((d) => ({
          ...(d.data() as Omit<PartitaTorneo, 'id'>),
          id: d.id,
        }));
        handlers.onPartite(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'partite_tornei')
    )
  );

  unsubs.push(
    onSnapshot(
      doc(firestore, 'impostazioni', 'evento'),
      (snap) => {
        if (snap.exists()) {
          handlers.onImpostazioni(snap.data() as ImpostazioniEvento);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'impostazioni/evento')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(firestore, 'docenti'), where('active', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const list: DocenteRecord[] = snap.docs.map((d) => ({
            ...(d.data() as Omit<DocenteRecord, 'id'>),
            id: d.id,
          }));
          handlers.onDocenti(list);
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'docenti')
    )
  );

  return unsubs;
}

export function subscribeStaffAdminCollections(handlers: {
  onUsers: (items: UserProfile[]) => void;
  onPreRoles: (items: PreRole[]) => void;
  onSegnalazioni: (items: SegnalazioneDocente[]) => void;
}): Unsubscribe[] {
  const firestore = ensureDb();
  const unsubs: Unsubscribe[] = [];

  unsubs.push(
    onSnapshot(
      collection(firestore, 'users'),
      (snap) => {
        handlers.onUsers(snap.docs.map((d) => d.data() as UserProfile));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'users')
    )
  );

  unsubs.push(
    onSnapshot(
      collection(firestore, 'pre_roles'),
      (snap) => {
        handlers.onPreRoles(snap.docs.map((d) => d.data() as PreRole));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'pre_roles')
    )
  );

  unsubs.push(
    onSnapshot(
      collection(firestore, 'segnalazioni_docenti'),
      (snap) => {
        handlers.onSegnalazioni(
          snap.docs.map((d) => ({
            ...(d.data() as Omit<SegnalazioneDocente, 'id'>),
            id: d.id,
          }))
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'segnalazioni_docenti')
    )
  );

  return unsubs;
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const firestore = ensureDb();
  try {
    const snap = await getDoc(doc(firestore, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}

export async function fetchPreRole(email: string): Promise<PreRole | null> {
  const firestore = ensureDb();
  const normalized = email.trim().toLowerCase();
  try {
    const snap = await getDoc(doc(firestore, 'pre_roles', normalized));
    return snap.exists() ? (snap.data() as PreRole) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `pre_roles/${normalized}`);
  }
}

export async function createUserProfileDoc(profile: UserProfile): Promise<void> {
  const firestore = ensureDb();
  try {
    await setDoc(doc(firestore, 'users', profile.uid), {
      uid: profile.uid,
      email: profile.email.toLowerCase(),
      displayName: profile.displayName,
      role: profile.role,
      sede: profile.sede ?? '',
      classe: profile.classe,
      isStaff: profile.isStaff,
      arbitroTornei: profile.arbitroTornei,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${profile.uid}`);
  }
}

export async function confirmUserOnboardingDoc(
  uid: string,
  sede: SedeIstituto,
  classe: string,
  displayName: string
): Promise<void> {
  const firestore = ensureDb();
  try {
    await updateDoc(doc(firestore, 'users', uid), {
      sede,
      classe,
      displayName,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function staffUpdateUserDoc(
  uid: string,
  updates: Partial<Pick<UserProfile, 'sede' | 'classe' | 'role' | 'isStaff' | 'arbitroTornei' | 'displayName'>>
): Promise<void> {
  const firestore = ensureDb();
  try {
    await updateDoc(doc(firestore, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function upsertPreRoleDoc(preRole: PreRole): Promise<void> {
  const firestore = ensureDb();
  const emailKey = preRole.email.trim().toLowerCase();
  try {
    await setDoc(doc(firestore, 'pre_roles', emailKey), {
      email: emailKey,
      isStaff: preRole.isStaff,
      arbitroTornei: preRole.arbitroTornei,
      forcedRole: preRole.forcedRole ?? '',
      sedeOverride: preRole.sedeOverride ?? '',
      classeOverride: preRole.classeOverride ?? '',
      updatedBy: preRole.updatedBy,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `pre_roles/${emailKey}`);
  }
}

export async function deletePreRoleDoc(email: string): Promise<void> {
  const firestore = ensureDb();
  const emailKey = email.trim().toLowerCase();
  try {
    await deleteDoc(doc(firestore, 'pre_roles', emailKey));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `pre_roles/${emailKey}`);
  }
}

export async function saveAttivitaClasseDoc(
  item: Omit<AttivitaClasse, 'createdAt' | 'updatedAt'>,
  isNew: boolean
): Promise<void> {
  const firestore = ensureDb();
  const safeTipo = (item.tipoAttivita ?? '').trim().slice(0, 60);
  try {
    if (isNew) {
      await setDoc(doc(firestore, 'attivita_classi', item.id), {
        giorno: item.giorno,
        oraInizio: item.oraInizio,
        oraFine: item.oraFine,
        titolo: item.titolo.trim().slice(0, 160),
        tipoAttivita: safeTipo,
        luogo: item.luogo.trim().slice(0, 120),
        note: (item.note ?? '').trim().slice(0, 400),
        classi: item.classi,
        visibile: item.visibile,
        updatedBy: item.updatedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(firestore, 'attivita_classi', item.id), {
        giorno: item.giorno,
        oraInizio: item.oraInizio,
        oraFine: item.oraFine,
        titolo: item.titolo.trim().slice(0, 160),
        tipoAttivita: safeTipo,
        luogo: item.luogo.trim().slice(0, 120),
        note: (item.note ?? '').trim().slice(0, 400),
        classi: item.classi,
        visibile: item.visibile,
        updatedBy: item.updatedBy,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `attivita_classi/${item.id}`);
  }
}

export async function deleteAttivitaClasseDoc(id: string): Promise<void> {
  const firestore = ensureDb();
  try {
    await deleteDoc(doc(firestore, 'attivita_classi', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `attivita_classi/${id}`);
  }
}

export async function saveConvocazioneDoc(
  item: Omit<ConvocazioneTorneo, 'createdAt' | 'updatedAt'>,
  isNew: boolean
): Promise<void> {
  const firestore = ensureDb();
  try {
    if (isNew) {
      await setDoc(doc(firestore, 'convocazioni_tornei', item.id), {
        studenteNome: item.studenteNome,
        classe: item.classe,
        squadraNome: item.squadraNome,
        disciplina: item.disciplina,
        giorno: item.giorno,
        oraInizio: item.oraInizio,
        oraFine: item.oraFine,
        campo: item.campo,
        visibile: item.visibile,
        updatedBy: item.updatedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(firestore, 'convocazioni_tornei', item.id), {
        studenteNome: item.studenteNome,
        classe: item.classe,
        squadraNome: item.squadraNome,
        disciplina: item.disciplina,
        giorno: item.giorno,
        oraInizio: item.oraInizio,
        oraFine: item.oraFine,
        campo: item.campo,
        visibile: item.visibile,
        updatedBy: item.updatedBy,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `convocazioni_tornei/${item.id}`);
  }
}

export async function deleteConvocazioneDoc(id: string): Promise<void> {
  const firestore = ensureDb();
  try {
    await deleteDoc(doc(firestore, 'convocazioni_tornei', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `convocazioni_tornei/${id}`);
  }
}

export async function savePartitaDoc(
  item: Omit<PartitaTorneo, 'createdAt' | 'updatedAt'>,
  isNew: boolean
): Promise<void> {
  const firestore = ensureDb();
  try {
    if (isNew) {
      await setDoc(doc(firestore, 'partite_tornei', item.id), {
        disciplina: item.disciplina,
        giorno: item.giorno,
        fase: item.fase,
        oraInizio: item.oraInizio,
        campo: item.campo,
        squadraA: item.squadraA,
        classeA: item.classeA,
        squadraB: item.squadraB,
        classeB: item.classeB,
        punteggioA: item.punteggioA,
        punteggioB: item.punteggioB,
        stato: item.stato,
        note: item.note ?? '',
        visibile: item.visibile,
        updatedBy: item.updatedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(firestore, 'partite_tornei', item.id), {
        disciplina: item.disciplina,
        giorno: item.giorno,
        fase: item.fase,
        oraInizio: item.oraInizio,
        campo: item.campo,
        squadraA: item.squadraA,
        classeA: item.classeA,
        squadraB: item.squadraB,
        classeB: item.classeB,
        punteggioA: item.punteggioA,
        punteggioB: item.punteggioB,
        stato: item.stato,
        note: item.note ?? '',
        visibile: item.visibile,
        updatedBy: item.updatedBy,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `partite_tornei/${item.id}`);
  }
}

export async function deletePartitaDoc(id: string): Promise<void> {
  const firestore = ensureDb();
  try {
    await deleteDoc(doc(firestore, 'partite_tornei', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `partite_tornei/${id}`);
  }
}

export async function saveImpostazioniDoc(settings: ImpostazioniEvento): Promise<void> {
  const firestore = ensureDb();
  try {
    await setDoc(doc(firestore, 'impostazioni', 'evento'), {
      bannerAttivo: settings.bannerAttivo,
      bannerTitolo: settings.bannerTitolo,
      bannerTesto: settings.bannerTesto,
      bannerLivello: settings.bannerLivello,
      regolamentoPdfUrl: settings.regolamentoPdfUrl,
      updatedBy: settings.updatedBy,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'impostazioni/evento');
  }
}

export async function saveDocenteDoc(docente: DocenteRecord, isNew: boolean): Promise<void> {
  const firestore = ensureDb();
  try {
    if (isNew) {
      await setDoc(doc(firestore, 'docenti', docente.id), {
        rawName: docente.rawName,
        displayName: docente.displayName,
        aliases: docente.aliases,
        active: docente.active,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(firestore, 'docenti', docente.id), {
        rawName: docente.rawName,
        displayName: docente.displayName,
        aliases: docente.aliases,
        active: docente.active,
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `docenti/${docente.id}`);
  }
}

export async function deleteDocenteDoc(id: string): Promise<void> {
  const firestore = ensureDb();
  try {
    await deleteDoc(doc(firestore, 'docenti', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `docenti/${id}`);
  }
}

export async function submitTeacherReportDoc(report: Omit<SegnalazioneDocente, 'createdAt'>): Promise<void> {
  const firestore = ensureDb();
  try {
    await setDoc(doc(firestore, 'segnalazioni_docenti', report.id), {
      uid: report.uid,
      email: report.email.toLowerCase(),
      displayName: report.displayName,
      note: report.note,
      stato: 'aperta',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `segnalazioni_docenti/${report.id}`);
  }
}

export async function resolveTeacherReportDoc(id: string): Promise<void> {
  const firestore = ensureDb();
  try {
    await updateDoc(doc(firestore, 'segnalazioni_docenti', id), {
      stato: 'risolta',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `segnalazioni_docenti/${id}`);
  }
}

export async function syncOfficialDocentiAndSeedIfEmpty(staffEmail: string): Promise<{ seededCount: number }> {
  const firestore = ensureDb();
  let seededCount = 0;

  // 1. Sync 172 official docenti if collection is empty
  const existingDocenti = await getDocs(query(collection(firestore, 'docenti'), where('active', '==', true)));
  if (existingDocenti.empty) {
    const records = buildDefaultDocentiRecords();
    const batch = writeBatch(firestore);
    for (const r of records) {
      batch.set(doc(firestore, 'docenti', r.id), {
        rawName: r.rawName,
        displayName: r.displayName,
        aliases: r.aliases,
        active: true,
        createdAt: serverTimestamp(),
      });
      seededCount += 1;
    }
    await batch.commit();
  }

  // 2. Seed initial activities, callups, matches, and settings if empty
  const existingAtt = await getDocs(query(collection(firestore, 'attivita_classi'), where('visibile', '==', true)));
  if (existingAtt.empty) {
    const batch = writeBatch(firestore);
    for (const att of INITIAL_ATTIVITA_CLASSI) {
      batch.set(doc(firestore, 'attivita_classi', att.id), {
        ...att,
        updatedBy: staffEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      seededCount += 1;
    }
    for (const conv of INITIAL_CONVOCAZIONI) {
      batch.set(doc(firestore, 'convocazioni_tornei', conv.id), {
        ...conv,
        updatedBy: staffEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      seededCount += 1;
    }
    for (const part of INITIAL_PARTITE) {
      batch.set(doc(firestore, 'partite_tornei', part.id), {
        ...part,
        updatedBy: staffEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      seededCount += 1;
    }
    batch.set(doc(firestore, 'impostazioni', 'evento'), {
      ...INITIAL_IMPOSTAZIONI,
      updatedBy: staffEmail,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  }

  return { seededCount };
}

export function normalizeArbitroInput(disciplines: string[]): Disciplina[] {
  const valid: Disciplina[] = ['Calcio', 'Pallavolo', 'Ping Pong', 'Scacchi', 'Olimpiadi'];
  return disciplines.filter((d): d is Disciplina => valid.includes(d as Disciplina));
}
