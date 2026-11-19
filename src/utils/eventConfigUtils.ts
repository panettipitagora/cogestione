import type { GiornoEvento, ImpostazioniEvento, StatoEvento } from '../types';

/**
 * Normalizza lo stato evento letto da Firebase (`giornoEvento`: 0..4).
 * 0 = Stay Tuned
 * 1, 2, 3 = Giorni 1-3 dell'evento
 * 4 = Assemblea d'Istituto Today
 */
export function resolveStatoEvento(rawValue: unknown): StatoEvento {
  const num = typeof rawValue === 'number' ? rawValue : Number(rawValue);
  if (num === 0 || num === 1 || num === 2 || num === 3 || num === 4) {
    return num;
  }
  return 1;
}

/**
 * Restituisce il giorno attivo (1, 2 o 3) per i calendari/tornei.
 */
export function resolveActiveEventDay(stato: StatoEvento): GiornoEvento {
  if (stato === 2 || stato === 3) return stato;
  return 1;
}

/**
 * Verifica se le prove demo sono abilitate da Firebase (`demoAbilitate === 1`).
 */
export function isDemoModeEnabled(rawValue: unknown): boolean {
  const num = typeof rawValue === 'number' ? rawValue : Number(rawValue);
  return num === 1;
}

/**
 * Valida un URL esterno (es. Google Drive per Cineforum in Classe) evitando schemi non sicuri.
 */
export function sanitizeExternalUrl(url: string | undefined | null): string {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return '';
}

export function normalizeImpostazioniEvento(
  raw: Partial<ImpostazioniEvento> | null | undefined,
  fallback: ImpostazioniEvento
): ImpostazioniEvento {
  if (!raw) return fallback;
  return {
    bannerAttivo: typeof raw.bannerAttivo === 'boolean' ? raw.bannerAttivo : fallback.bannerAttivo,
    bannerTitolo: typeof raw.bannerTitolo === 'string' ? raw.bannerTitolo : fallback.bannerTitolo,
    bannerTesto: typeof raw.bannerTesto === 'string' ? raw.bannerTesto : fallback.bannerTesto,
    bannerLivello: raw.bannerLivello === 'info' || raw.bannerLivello === 'urgente' ? raw.bannerLivello : fallback.bannerLivello,
    regolamentoPdfUrl: typeof raw.regolamentoPdfUrl === 'string' ? raw.regolamentoPdfUrl : fallback.regolamentoPdfUrl,
    giornoEvento: resolveStatoEvento(raw.giornoEvento ?? fallback.giornoEvento),
    cineforumDriveUrl: typeof raw.cineforumDriveUrl === 'string' ? raw.cineforumDriveUrl : fallback.cineforumDriveUrl ?? '',
    demoAbilitate: isDemoModeEnabled(raw.demoAbilitate ?? fallback.demoAbilitate) ? 1 : 0,
    updatedBy: typeof raw.updatedBy === 'string' && raw.updatedBy ? raw.updatedBy : fallback.updatedBy,
    updatedAt: raw.updatedAt,
  };
}
