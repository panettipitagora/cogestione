import { CLASSI_ISTITUTO, DISCIPLINE } from '../data/schoolData';
import type {
  ConvocazioneTorneo,
  Disciplina,
  GiornoEvento,
  PartitaTorneo,
} from '../types';

export interface ClassYearGroup {
  year: number;
  label: string;
  classes: string[];
}

export function groupClassesByYear(classes: string[] = CLASSI_ISTITUTO): ClassYearGroup[] {
  const labels: Record<number, string> = {
    1: '1° Anno',
    2: '2° Anno',
    3: '3° Anno',
    4: '4° Anno',
    5: '5° Anno',
  };

  const map = new Map<number, string[]>();
  for (const cls of classes) {
    const yearDigit = Number.parseInt(cls.charAt(0), 10);
    if (!Number.isNaN(yearDigit) && yearDigit >= 1 && yearDigit <= 5) {
      const list = map.get(yearDigit) ?? [];
      list.push(cls);
      map.set(yearDigit, list);
    }
  }

  return [1, 2, 3, 4, 5]
    .map((year) => ({
      year,
      label: labels[year],
      classes: map.get(year) ?? [],
    }))
    .filter((group) => group.classes.length > 0);
}

export function formatTeacherRollCall(conv: ConvocazioneTorneo): string {
  return `${conv.studenteNome} è impegnato nel torneo di ${conv.disciplina} dalle ore ${conv.oraInizio} alle ore ${conv.oraFine}`;
}

export function formatStudentCallupSummary(conv: ConvocazioneTorneo): string {
  return `${conv.studenteNome} (${conv.classe}) è impegnato nel torneo di ${conv.disciplina} dalle ore ${conv.oraInizio} alle ore ${conv.oraFine} - ${conv.campo}`;
}

export function parseTimeToMinutes(hhmm: string): number {
  const match = /^([0-2]\d):([0-5]\d)$/.exec(hhmm.trim());
  if (!match) return -1;
  return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
}

export function getActivityLiveState(
  oraInizio: string,
  oraFine: string,
  nowHHMM?: string
): 'in_corso' | 'in_programma' | 'conclusa' {
  const start = parseTimeToMinutes(oraInizio);
  const end = parseTimeToMinutes(oraFine);
  if (start < 0 || end < 0) return 'in_programma';

  let currentMinutes: number;
  if (nowHHMM) {
    currentMinutes = parseTimeToMinutes(nowHHMM);
  } else {
    const now = new Date();
    currentMinutes = now.getHours() * 60 + now.getMinutes();
  }

  if (currentMinutes < start) return 'in_programma';
  if (currentMinutes <= end) return 'in_corso';
  return 'conclusa';
}

export function sortByStartTime<T extends { oraInizio: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => parseTimeToMinutes(a.oraInizio) - parseTimeToMinutes(b.oraInizio));
}

export function validateNonMixedMatchInput(input: {
  disciplina: string;
  giorno: GiornoEvento;
  fase: string;
  oraInizio: string;
  campo: string;
  squadraA: string;
  classeA: string;
  squadraB: string;
  classeB: string;
}): { valid: true } | { valid: false; error: string } {
  if (!DISCIPLINE.includes(input.disciplina as Disciplina)) {
    return { valid: false, error: 'Seleziona una disciplina valida.' };
  }
  if (![1, 2, 3].includes(input.giorno)) {
    return { valid: false, error: 'Seleziona un giorno valido (Giorno 1, 2 o 3).' };
  }
  if (!input.fase.trim()) {
    return { valid: false, error: 'Inserisci la fase del torneo (es. Girone A, Quarti, Finale).' };
  }
  if (parseTimeToMinutes(input.oraInizio) < 0) {
    return { valid: false, error: 'Inserisci un orario valido nel formato HH:MM.' };
  }
  if (!input.campo.trim()) {
    return { valid: false, error: 'Specifica il campo o tavolo di gioco.' };
  }
  if (!input.squadraA.trim() || !input.squadraB.trim()) {
    return { valid: false, error: 'Inserisci il nome di entrambe le squadre o giocatori.' };
  }
  if (!CLASSI_ISTITUTO.includes(input.classeA) || !CLASSI_ISTITUTO.includes(input.classeB)) {
    return { valid: false, error: 'Seleziona obbligatoriamente la classe di appartenenza per entrambe le squadre (no squadre miste).' };
  }
  return { valid: true };
}

export function substituteStudentInCallups(
  callups: ConvocazioneTorneo[],
  callupId: string,
  newStudentName: string,
  updatedBy: string
): ConvocazioneTorneo[] {
  const trimmed = newStudentName.trim();
  if (trimmed.length < 2) return callups;
  return callups.map((item) =>
    item.id === callupId
      ? {
          ...item,
          studenteNome: trimmed,
          updatedBy,
          updatedAt: new Date().toISOString(),
        }
      : item
  );
}

export function adjustMatchScore(
  match: PartitaTorneo,
  team: 'A' | 'B',
  delta: number
): PartitaTorneo {
  const nextA = team === 'A' ? Math.max(0, match.punteggioA + delta) : match.punteggioA;
  const nextB = team === 'B' ? Math.max(0, match.punteggioB + delta) : match.punteggioB;
  return {
    ...match,
    punteggioA: nextA,
    punteggioB: nextB,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Palette pastello molto chiara e discreta per distinguere visivamente i tipi di attività
 * senza appesantire l'interfaccia editoriale.
 */
export const ACTIVITY_PASTEL_PALETTE = [
  'bg-sky-50/40',
  'bg-amber-50/40',
  'bg-emerald-50/40',
  'bg-violet-50/40',
  'bg-rose-50/40',
  'bg-teal-50/40',
  'bg-indigo-50/40',
  'bg-orange-50/35',
] as const;

export const ACTIVITY_TYPE_PASTEL_MAP: Record<string, string> = {
  assemblea: 'bg-orange-50/35',
  laboratorio: 'bg-sky-50/40',
  workshop: 'bg-sky-50/40',
  conferenza: 'bg-violet-50/40',
  talk: 'bg-violet-50/40',
  cineforum: 'bg-rose-50/40',
  proiezione: 'bg-rose-50/40',
  sportiva: 'bg-emerald-50/40',
  torneo: 'bg-emerald-50/40',
  orientamento: 'bg-amber-50/40',
  culturale: 'bg-indigo-50/40',
  premiazione: 'bg-teal-50/40',
};

export function getActivityPastelClass(tipoAttivita?: string): string {
  const normalized = (tipoAttivita ?? '').trim().toLowerCase();
  if (!normalized) return '';
  if (ACTIVITY_TYPE_PASTEL_MAP[normalized]) {
    return ACTIVITY_TYPE_PASTEL_MAP[normalized];
  }
  for (const [key, cls] of Object.entries(ACTIVITY_TYPE_PASTEL_MAP)) {
    if (normalized.includes(key)) {
      return cls;
    }
  }
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return ACTIVITY_PASTEL_PALETTE[hash % ACTIVITY_PASTEL_PALETTE.length];
}

function normalizeSearchToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesTeacherSearch(
  teacher: { rawName: string; displayName: string; aliases: string[] },
  query: string
): boolean {
  const q = normalizeSearchToken(query);
  if (!q) return true;
  const qCompact = q.replace(/\s+/g, '');
  const haystack = normalizeSearchToken(
    `${teacher.rawName} ${teacher.displayName} ${teacher.aliases.join(' ')}`
  );
  const haystackCompact = haystack.replace(/\s+/g, '');
  return haystack.includes(q) || haystackCompact.includes(qCompact);
}
