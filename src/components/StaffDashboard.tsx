import React, { useState } from 'react';
import {
  CalendarCog,
  Megaphone,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import type {
  AttivitaClasse,
  ConvocazioneTorneo,
  DocenteRecord,
  ImpostazioniEvento,
  PartitaTorneo,
  PreRole,
  SegnalazioneDocente,
  UserProfile,
} from '../types';
import { StaffCallupsTab } from './staff/StaffCallupsTab';
import { StaffMatchesTab } from './staff/StaffMatchesTab';
import { StaffScheduleTab } from './staff/StaffScheduleTab';
import { StaffSettingsTab } from './staff/StaffSettingsTab';
import { StaffUsersTab } from './staff/StaffUsersTab';

type StaffTab = 'calendario' | 'convocazioni' | 'partite' | 'utenti' | 'impostazioni';

interface StaffDashboardProps {
  user: UserProfile;
  attivita: AttivitaClasse[];
  convocazioni: ConvocazioneTorneo[];
  partite: PartitaTorneo[];
  users: UserProfile[];
  preRoles: PreRole[];
  docenti: DocenteRecord[];
  segnalazioni: SegnalazioneDocente[];
  impostazioni: ImpostazioniEvento;
  isDemoMode: boolean;
  onSaveAttivita: (item: Omit<AttivitaClasse, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  onDeleteAttivita: (id: string) => Promise<void>;
  onSaveConvocazione: (item: Omit<ConvocazioneTorneo, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  onDeleteConvocazione: (id: string) => Promise<void>;
  onSavePartita: (item: Omit<PartitaTorneo, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  onDeletePartita: (id: string) => Promise<void>;
  onUpdateUser: (uid: string, updates: Partial<Pick<UserProfile, 'sede' | 'classe' | 'role' | 'isStaff' | 'arbitroTornei' | 'displayName'>>) => Promise<void>;
  onUpsertPreRole: (preRole: PreRole) => Promise<void>;
  onDeletePreRole: (email: string) => Promise<void>;
  onSaveDocente: (docente: DocenteRecord, isNew: boolean) => Promise<void>;
  onDeleteDocente: (id: string) => Promise<void>;
  onResolveSegnalazione: (seg: SegnalazioneDocente) => Promise<void>;
  onSaveImpostazioni: (settings: ImpostazioniEvento) => Promise<void>;
  onSyncSeedToFirestore?: () => Promise<number>;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = (props) => {
  const [activeTab, setActiveTab] = useState<StaffTab>('convocazioni');

  const tabs: { id: StaffTab; label: string; icon: React.ReactNode }[] = [
    { id: 'calendario', label: 'Calendario Classi', icon: <CalendarCog className="w-4 h-4" /> },
    { id: 'convocazioni', label: 'Convocazioni & Sostituzioni', icon: <Users className="w-4 h-4" /> },
    { id: 'partite', label: 'Supervisione Partite', icon: <Trophy className="w-4 h-4" /> },
    { id: 'utenti', label: 'Utenti, Arbitri & Docenti', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'impostazioni', label: 'Avvisi & Regolamento', icon: <Megaphone className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <section className="hero-encore-gradient rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-[#FF7A00]">
              <ShieldCheck className="w-4 h-4" />
              <span>CMS Super-Admin · Controllo Totale Lista 1 EN-CORE</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              Console Staff & Direzione Evento
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Crea, modifica o rimuovi attività per le 47 classi, gestisci sostituzioni istantanee, supervisiona tutti i tornei e assegna i permessi Arbitro/Staff.
            </p>
          </div>
          <span className="font-mono text-xs text-zinc-300 shrink-0">
            Staff: {props.user.email}
          </span>
        </div>
      </section>

      {/* Staff Sub-navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-display font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#09090B] text-white'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-[#FF5500]' : 'text-zinc-500'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'calendario' && (
        <StaffScheduleTab
          staffEmail={props.user.email}
          attivita={props.attivita}
          onSaveAttivita={props.onSaveAttivita}
          onDeleteAttivita={props.onDeleteAttivita}
        />
      )}

      {activeTab === 'convocazioni' && (
        <StaffCallupsTab
          staffEmail={props.user.email}
          convocazioni={props.convocazioni}
          onSaveConvocazione={props.onSaveConvocazione}
          onDeleteConvocazione={props.onDeleteConvocazione}
        />
      )}

      {activeTab === 'partite' && (
        <StaffMatchesTab
          staffEmail={props.user.email}
          partite={props.partite}
          onSavePartita={props.onSavePartita}
          onDeletePartita={props.onDeletePartita}
        />
      )}

      {activeTab === 'utenti' && (
        <StaffUsersTab
          staffEmail={props.user.email}
          users={props.users}
          preRoles={props.preRoles}
          docenti={props.docenti}
          segnalazioni={props.segnalazioni}
          onUpdateUser={props.onUpdateUser}
          onUpsertPreRole={props.onUpsertPreRole}
          onDeletePreRole={props.onDeletePreRole}
          onSaveDocente={props.onSaveDocente}
          onDeleteDocente={props.onDeleteDocente}
          onResolveSegnalazione={props.onResolveSegnalazione}
        />
      )}

      {activeTab === 'impostazioni' && (
        <StaffSettingsTab
          staffEmail={props.user.email}
          impostazioni={props.impostazioni}
          onSaveImpostazioni={props.onSaveImpostazioni}
          isDemoMode={props.isDemoMode}
          onSyncSeedToFirestore={props.onSyncSeedToFirestore}
        />
      )}
    </div>
  );
};
