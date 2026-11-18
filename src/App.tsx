import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  DEMO_PRESET_MAP,
  DEMO_USERS_SEED,
  INITIAL_ATTIVITA_CLASSI,
  INITIAL_CONVOCAZIONI,
  INITIAL_IMPOSTAZIONI,
  INITIAL_PARTITE,
  INITIAL_PRE_ROLES,
  INITIAL_SEGNALAZIONI,
} from './data/mockSeed';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  testConnection,
} from './firebase';
import { isSuperAdminEmail } from './data/schoolData';
import {
  confirmUserOnboardingDoc,
  createUserProfileDoc,
  deleteAttivitaClasseDoc,
  deleteConvocazioneDoc,
  deleteDocenteDoc,
  deletePartitaDoc,
  deletePreRoleDoc,
  fetchPreRole,
  fetchUserProfile,
  resolveTeacherReportDoc,
  saveAttivitaClasseDoc,
  saveConvocazioneDoc,
  saveDocenteDoc,
  saveImpostazioniDoc,
  savePartitaDoc,
  staffUpdateUserDoc,
  submitTeacherReportDoc,
  subscribeEventData,
  subscribeStaffAdminCollections,
  syncOfficialDocentiAndSeedIfEmpty,
  upsertPreRoleDoc,
} from './services/firestoreService';
import type {
  ActiveView,
  AttivitaClasse,
  ConvocazioneTorneo,
  DemoPresetId,
  DocenteRecord,
  ImpostazioniEvento,
  PartitaTorneo,
  PreRole,
  SedeIstituto,
  SegnalazioneDocente,
  UserProfile,
} from './types';
import {
  buildDefaultDocentiRecords,
  isValidSchoolEmail,
  resolveUserIdentityOnLogin,
} from './utils/teacherMatcher';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { RefereeConsole } from './components/RefereeConsole';
import { RegulationsModal } from './components/RegulationsModal';
import { StaffDashboard } from './components/StaffDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentOnboarding } from './components/StudentOnboarding';
import { TeacherDashboard } from './components/TeacherDashboard';
import { UrgentBanner } from './components/UrgentBanner';

const INVALID_DOMAIN_MSG =
  'Accesso negato: utilizza esclusivamente il tuo account istituzionale @panettipitagora.edu.it';

function AppShell() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginPending, setLoginPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [regulationsOpen, setRegulationsOpen] = useState(false);

  // Event data state (synced from Firestore when logged in with Firebase, or local demo state)
  const [attivita, setAttivita] = useState<AttivitaClasse[]>(INITIAL_ATTIVITA_CLASSI);
  const [convocazioni, setConvocazioni] = useState<ConvocazioneTorneo[]>(INITIAL_CONVOCAZIONI);
  const [partite, setPartite] = useState<PartitaTorneo[]>(INITIAL_PARTITE);
  const [impostazioni, setImpostazioni] = useState<ImpostazioniEvento>(INITIAL_IMPOSTAZIONI);
  const [docenti, setDocenti] = useState<DocenteRecord[]>(() => buildDefaultDocentiRecords());

  // Staff-only state
  const [usersList, setUsersList] = useState<UserProfile[]>(DEMO_USERS_SEED);
  const [preRoles, setPreRoles] = useState<PreRole[]>(INITIAL_PRE_ROLES);
  const [segnalazioni, setSegnalazioni] = useState<SegnalazioneDocente[]>(INITIAL_SEGNALAZIONI);

  // Support deterministic ?autostart=1 or ?demo=<preset> for direct preview/verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoParam = params.get('demo') as DemoPresetId | null;
    const autostart = params.get('autostart');
    if (demoParam && demoParam in DEMO_PRESET_MAP) {
      setIsDemoMode(true);
      setCurrentUser({ ...DEMO_PRESET_MAP[demoParam] });
      setActiveView(demoParam === 'arbitro_pallavolo' ? 'arbitro' : demoParam === 'staff_admin' ? 'staff' : 'dashboard');
      setAuthLoading(false);
      return;
    }
    if (autostart === '1') {
      setIsDemoMode(true);
      setCurrentUser({ ...DEMO_PRESET_MAP.studente_attivo });
      setActiveView('dashboard');
      setAuthLoading(false);
      return;
    }
  }, []);

  // Firebase Auth & connection initialization
  useEffect(() => {
    const activeAuth = auth;
    if (isDemoMode || !isFirebaseConfigured || !activeAuth) {
      setAuthLoading(false);
      return;
    }

    testConnection();

    const unsub = onAuthStateChanged(activeAuth, async (fbUser) => {
      if (!fbUser) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      if (!isValidSchoolEmail(fbUser.email)) {
        await signOut(activeAuth);
        setCurrentUser(null);
        setAuthError(INVALID_DOMAIN_MSG);
        setAuthLoading(false);
        return;
      }

      try {
        const email = fbUser.email!.trim().toLowerCase();
        const [existingProfile, preRole] = await Promise.all([
          fetchUserProfile(fbUser.uid),
          fetchPreRole(email).catch(() => null),
        ]);

        const resolved = resolveUserIdentityOnLogin({
          uid: fbUser.uid,
          email,
          displayName: fbUser.displayName,
          existingProfile,
          preRole,
          docentiList: docenti,
        });

        if (!existingProfile) {
          await createUserProfileDoc(resolved);
        }

        setAuthError(null);
        setCurrentUser(resolved);
      } catch (err) {
        console.error('Errore risoluzione profilo:', err);
        setAuthError(
          err instanceof Error
            ? err.message
            : 'Errore durante la verifica del profilo istituzionale.'
        );
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, [isDemoMode]);

  // Real-time Firestore subscriptions when authenticated with Firebase
  useEffect(() => {
    if (isDemoMode || !currentUser || !isFirebaseConfigured) return;

    const unsubs = subscribeEventData({
      onAttivita: setAttivita,
      onConvocazioni: setConvocazioni,
      onPartite: setPartite,
      onImpostazioni: setImpostazioni,
      onDocenti: setDocenti,
    });

    let staffUnsubs: (() => void)[] = [];
    if (currentUser.isStaff) {
      staffUnsubs = subscribeStaffAdminCollections({
        onUsers: setUsersList,
        onPreRoles: setPreRoles,
        onSegnalazioni: setSegnalazioni,
      });
    }

    return () => {
      unsubs.forEach((u) => u());
      staffUnsubs.forEach((u) => u());
    };
  }, [isDemoMode, currentUser?.uid, currentUser?.isStaff]);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setAuthError(null);
    setLoginPending(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (!isValidSchoolEmail(cred.user.email)) {
        await signOut(auth);
        setAuthError(INVALID_DOMAIN_MSG);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('popup-closed-by-user')) {
        setAuthError('Accesso Google Workspace non completato. Riprova con @panettipitagora.edu.it.');
      }
    } finally {
      setLoginPending(false);
    }
  };

  const handleLogout = async () => {
    setActiveView('dashboard');
    if (isDemoMode) {
      setIsDemoMode(false);
      setCurrentUser(null);
      return;
    }
    if (auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
  };

  // --- MUTATION HANDLERS (Demo Local State OR Cloud Firestore) ---

  const handleConfirmRegistration = async (sede: SedeIstituto, classe: string) => {
    if (!currentUser) return;
    if (isDemoMode) {
      setCurrentUser({ ...currentUser, sede, classe });
      setUsersList((prev) =>
        prev.map((u) => (u.uid === currentUser.uid ? { ...u, sede, classe } : u))
      );
      return;
    }
    await confirmUserOnboardingDoc(currentUser.uid, sede, classe, currentUser.displayName);
    setCurrentUser({ ...currentUser, sede, classe });
  };

  const handleReportTeacher = async (note: string) => {
    if (!currentUser) return;
    const report: SegnalazioneDocente = {
      id: `seg_${Date.now()}`,
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      note,
      stato: 'aperta',
      createdAt: new Date().toISOString(),
    };
    if (isDemoMode) {
      setSegnalazioni((prev) => [report, ...prev]);
      return;
    }
    await submitTeacherReportDoc(report);
  };

  const handleSaveAttivita = async (
    item: Omit<AttivitaClasse, 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    if (isDemoMode) {
      setAttivita((prev) =>
        isNew ? [...prev, item] : prev.map((a) => (a.id === item.id ? item : a))
      );
      return;
    }
    await saveAttivitaClasseDoc(item, isNew);
  };

  const handleDeleteAttivita = async (id: string) => {
    if (isDemoMode) {
      setAttivita((prev) => prev.filter((a) => a.id !== id));
      return;
    }
    await deleteAttivitaClasseDoc(id);
  };

  const handleSaveConvocazione = async (
    item: Omit<ConvocazioneTorneo, 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    if (isDemoMode) {
      setConvocazioni((prev) =>
        isNew ? [...prev, item] : prev.map((c) => (c.id === item.id ? item : c))
      );
      return;
    }
    await saveConvocazioneDoc(item, isNew);
  };

  const handleDeleteConvocazione = async (id: string) => {
    if (isDemoMode) {
      setConvocazioni((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    await deleteConvocazioneDoc(id);
  };

  const handleSavePartita = async (
    item: Omit<PartitaTorneo, 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    if (isDemoMode) {
      setPartite((prev) =>
        isNew ? [...prev, item] : prev.map((p) => (p.id === item.id ? item : p))
      );
      return;
    }
    await savePartitaDoc(item, isNew);
  };

  const handleDeletePartita = async (id: string) => {
    if (isDemoMode) {
      setPartite((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    await deletePartitaDoc(id);
  };

  const handleUpdateUser = async (
    uid: string,
    updates: Partial<Pick<UserProfile, 'sede' | 'classe' | 'role' | 'isStaff' | 'arbitroTornei' | 'displayName'>>
  ) => {
    const targetUser = usersList.find((u) => u.uid === uid);
    const safeUpdates =
      targetUser && isSuperAdminEmail(targetUser.email)
        ? {
            ...updates,
            isStaff: true,
            arbitroTornei: [],
            role: targetUser.role,
          }
        : updates;

    if (isDemoMode) {
      setUsersList((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, ...safeUpdates } : u))
      );
      if (currentUser && currentUser.uid === uid) {
        setCurrentUser({ ...currentUser, ...safeUpdates });
      }
      return;
    }
    await staffUpdateUserDoc(uid, safeUpdates);
    if (currentUser && currentUser.uid === uid) {
      setCurrentUser({ ...currentUser, ...safeUpdates });
    }
  };

  const handleUpsertPreRole = async (preRole: PreRole) => {
    if (isDemoMode) {
      setPreRoles((prev) => {
        const exists = prev.some((p) => p.email === preRole.email);
        return exists
          ? prev.map((p) => (p.email === preRole.email ? preRole : p))
          : [...prev, preRole];
      });
      return;
    }
    await upsertPreRoleDoc(preRole);
  };

  const handleDeletePreRole = async (email: string) => {
    if (isDemoMode) {
      setPreRoles((prev) => prev.filter((p) => p.email !== email));
      return;
    }
    await deletePreRoleDoc(email);
  };

  const handleSaveDocente = async (docente: DocenteRecord, isNew: boolean) => {
    if (isDemoMode) {
      setDocenti((prev) =>
        isNew ? [docente, ...prev] : prev.map((d) => (d.id === docente.id ? docente : d))
      );
      return;
    }
    await saveDocenteDoc(docente, isNew);
  };

  const handleDeleteDocente = async (id: string) => {
    if (isDemoMode) {
      setDocenti((prev) => prev.filter((d) => d.id !== id));
      return;
    }
    await deleteDocenteDoc(id);
  };

  const handleResolveSegnalazione = async (seg: SegnalazioneDocente) => {
    if (isDemoMode) {
      setSegnalazioni((prev) =>
        prev.map((s) => (s.id === seg.id ? { ...s, stato: 'risolta' } : s))
      );
      await handleUpsertPreRole({
        email: seg.email,
        isStaff: false,
        arbitroTornei: [],
        forcedRole: 'docente',
        updatedBy: currentUser?.email ?? 'staff@panettipitagora.edu.it',
      });
      return;
    }
    await upsertPreRoleDoc({
      email: seg.email,
      isStaff: false,
      arbitroTornei: [],
      forcedRole: 'docente',
      updatedBy: currentUser?.email ?? 'staff@panettipitagora.edu.it',
    });
    const matchedUser = usersList.find((u) => u.email === seg.email);
    if (matchedUser) {
      await staffUpdateUserDoc(matchedUser.uid, { role: 'docente', classe: '' });
    }
    await resolveTeacherReportDoc(seg.id);
  };

  const handleSaveImpostazioni = async (settings: ImpostazioniEvento) => {
    if (isDemoMode) {
      setImpostazioni(settings);
      return;
    }
    await saveImpostazioniDoc(settings);
  };

  const handleSyncSeedToFirestore = async () => {
    if (!currentUser) return 0;
    const res = await syncOfficialDocentiAndSeedIfEmpty(currentUser.email);
    return res.seededCount;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin mx-auto" />
          <p className="font-display text-sm font-bold text-[#09090B]">
            Caricamento portale Lista 1 EN-CORE...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginView
        onGoogleLogin={handleGoogleLogin}
        authError={authError}
        isLoading={loginPending}
        isFirebaseConfigured={isFirebaseConfigured}
      />
    );
  }

  // First-time onboarding (blocking until sede is selected, plus classe for students)
  const needsOnboarding =
    !currentUser.isStaff &&
    (!currentUser.sede || (currentUser.role === 'studente' && !currentUser.classe));

  if (needsOnboarding) {
    return (
      <StudentOnboarding
        user={currentUser}
        onConfirmRegistration={handleConfirmRegistration}
        onReportTeacher={handleReportTeacher}
        onLogout={handleLogout}
      />
    );
  }

  // Guard activeView against permissions
  const resolvedView: ActiveView =
    activeView === 'staff' && !currentUser.isStaff
      ? 'dashboard'
      : activeView === 'arbitro' && currentUser.arbitroTornei.length === 0
      ? 'dashboard'
      : activeView;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar
        user={currentUser}
        activeView={resolvedView}
        onChangeView={setActiveView}
        onOpenRegulations={() => setRegulationsOpen(true)}
        onLogout={handleLogout}
        isDemoMode={isDemoMode}
      />

      <UrgentBanner impostazioni={impostazioni} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {resolvedView === 'staff' && currentUser.isStaff ? (
          <StaffDashboard
            user={currentUser}
            attivita={attivita}
            convocazioni={convocazioni}
            partite={partite}
            users={usersList}
            preRoles={preRoles}
            docenti={docenti}
            segnalazioni={segnalazioni}
            impostazioni={impostazioni}
            isDemoMode={isDemoMode}
            onSaveAttivita={handleSaveAttivita}
            onDeleteAttivita={handleDeleteAttivita}
            onSaveConvocazione={handleSaveConvocazione}
            onDeleteConvocazione={handleDeleteConvocazione}
            onSavePartita={handleSavePartita}
            onDeletePartita={handleDeletePartita}
            onUpdateUser={handleUpdateUser}
            onUpsertPreRole={handleUpsertPreRole}
            onDeletePreRole={handleDeletePreRole}
            onSaveDocente={handleSaveDocente}
            onDeleteDocente={handleDeleteDocente}
            onResolveSegnalazione={handleResolveSegnalazione}
            onSaveImpostazioni={handleSaveImpostazioni}
            onSyncSeedToFirestore={handleSyncSeedToFirestore}
          />
        ) : resolvedView === 'arbitro' && currentUser.arbitroTornei.length > 0 ? (
          <RefereeConsole
            user={currentUser}
            partite={partite}
            onSavePartita={handleSavePartita}
            onDeletePartita={handleDeletePartita}
          />
        ) : currentUser.role === 'docente' ? (
          <TeacherDashboard
            user={currentUser}
            attivita={attivita}
            convocazioni={convocazioni}
            partite={partite}
            onOpenRegulations={() => setRegulationsOpen(true)}
          />
        ) : (
          <StudentDashboard
            user={currentUser}
            attivita={attivita}
            convocazioni={convocazioni}
            partite={partite}
            onOpenRegulations={() => setRegulationsOpen(true)}
          />
        )}
      </main>

      <RegulationsModal
        open={regulationsOpen}
        pdfUrl={impostazioni.regolamentoPdfUrl}
        onClose={() => setRegulationsOpen(false)}
      />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
