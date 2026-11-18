export type Disciplina =
  | 'Calcio'
  | 'Pallavolo'
  | 'Ping Pong'
  | 'Scacchi'
  | 'Olimpiadi';

export type UserRole = 'studente' | 'docente';

export type MatchStatus = 'in_programma' | 'live' | 'conclusa';

export type GiornoEvento = 1 | 2 | 3;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  classe: string;
  isStaff: boolean;
  arbitroTornei: Disciplina[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PreRole {
  email: string;
  isStaff: boolean;
  arbitroTornei: Disciplina[];
  forcedRole?: '' | UserRole;
  classeOverride?: string;
  updatedBy: string;
  updatedAt?: string;
}

export interface DocenteRecord {
  id: string;
  rawName: string;
  displayName: string;
  aliases: string[];
  active: boolean;
  createdAt?: string;
}

export interface AttivitaClasse {
  id: string;
  giorno: GiornoEvento;
  oraInizio: string;
  oraFine: string;
  titolo: string;
  tipoAttivita?: string;
  luogo: string;
  note?: string;
  classi: string[];
  visibile: boolean;
  updatedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConvocazioneTorneo {
  id: string;
  studenteNome: string;
  classe: string;
  squadraNome: string;
  disciplina: Disciplina;
  giorno: GiornoEvento;
  oraInizio: string;
  oraFine: string;
  campo: string;
  visibile: boolean;
  updatedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartitaTorneo {
  id: string;
  disciplina: Disciplina;
  giorno: GiornoEvento;
  fase: string;
  oraInizio: string;
  campo: string;
  squadraA: string;
  classeA: string;
  squadraB: string;
  classeB: string;
  punteggioA: number;
  punteggioB: number;
  stato: MatchStatus;
  note?: string;
  visibile: boolean;
  updatedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImpostazioniEvento {
  bannerAttivo: boolean;
  bannerTitolo: string;
  bannerTesto: string;
  bannerLivello: 'info' | 'urgente';
  regolamentoPdfUrl: string;
  updatedBy: string;
  updatedAt?: string;
}

export interface SegnalazioneDocente {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  note: string;
  stato: 'aperta' | 'risolta';
  createdAt?: string;
}

export type ActiveView =
  | 'dashboard'
  | 'arbitro'
  | 'staff';

export type DemoPresetId =
  | 'studente_onboarding'
  | 'studente_attivo'
  | 'docente'
  | 'arbitro_pallavolo'
  | 'staff_admin';
