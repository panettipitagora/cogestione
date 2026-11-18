import { DOCENTI_RAW, SCHOOL_DOMAIN, SUPER_ADMIN_EMAIL } from '../data/schoolData';
import type { Disciplina, DocenteRecord, PreRole, UserProfile, UserRole } from '../types';

const COMPOUND_SURNAME_PREFIXES = new Set([
  'DE',
  'DEL',
  "DELL'",
  'DELLA',
  'DELLE',
  'DELLO',
  'DI',
  'LA',
  'LO',
  'LI',
  'SAN',
  'SANTA',
]);

const KNOWN_COMPOUND_SURNAMES = new Set([
  'demuro',
  'dellaquila',
  'dellefoglie',
  'dilillo',
  'dirutigliano',
  'lamantia',
  'lostorto',
  'debenedictis',
  'degaetano',
  'degiglio',
  'deluisi',
  'demarzo',
]);

function stripAccentsAndPunctuation(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`\-\s.]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function isTrailingDottedInitial(token: string): boolean {
  const cleaned = token.trim();
  // Matches tokens like "I.A.", "F.A.", "R.M.", "G.", "D."
  return /^([A-Za-z]\.)+$/.test(cleaned);
}

function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface ParsedDocenteName {
  rawName: string;
  displayName: string;
  normalizedSurname: string;
  givenNames: string[];
  aliases: string[];
}

export function parseTeacherRawName(rawDocente: string): ParsedDocenteName {
  const rawTrimmed = rawDocente.trim().replace(/\s+/g, ' ');
  const tokens = rawTrimmed.split(' ').filter(Boolean);

  // Remove any trailing dotted initials (e.g. "I.A.", "F.A.", "R.M.", "G.", "D.")
  while (tokens.length > 2 && isTrailingDottedInitial(tokens[tokens.length - 1])) {
    tokens.pop();
  }

  let surnameTokensCount = 1;
  if (tokens.length >= 3) {
    const firstUpper = tokens[0].toUpperCase();
    const combinedTwo = stripAccentsAndPunctuation(tokens[0] + tokens[1]);
    if (
      KNOWN_COMPOUND_SURNAMES.has(combinedTwo) ||
      COMPOUND_SURNAME_PREFIXES.has(firstUpper) ||
      firstUpper.endsWith("'")
    ) {
      surnameTokensCount = 2;
    }
  } else if (tokens.length === 2 && tokens[0].includes("'")) {
    // Handles single-token apostrophe surnames like DELL'AQUILA if ever joined
    surnameTokensCount = 1;
  }

  const surnameParts = tokens.slice(0, surnameTokensCount);
  const nameParts = tokens.slice(surnameTokensCount);

  const normalizedSurname = stripAccentsAndPunctuation(surnameParts.join(''));
  const normalizedGivenNames = nameParts
    .map((part) => stripAccentsAndPunctuation(part))
    .filter(Boolean);

  const aliases: string[] = [];
  let progressiveName = '';
  for (const part of normalizedGivenNames) {
    progressiveName += part;
    const email = `${progressiveName}.${normalizedSurname}@${SCHOOL_DOMAIN}`;
    if (!aliases.includes(email)) {
      aliases.push(email);
    }
  }

  const displayName = `${toTitleCase(nameParts.join(' '))} ${toTitleCase(surnameParts.join(' '))}`.trim();

  return {
    rawName: rawTrimmed,
    displayName,
    normalizedSurname,
    givenNames: normalizedGivenNames,
    aliases,
  };
}

export function generateTeacherEmailAliases(rawDocente: string): string[] {
  return parseTeacherRawName(rawDocente).aliases;
}

export function buildDefaultDocentiRecords(): DocenteRecord[] {
  return DOCENTI_RAW.map((raw, idx) => {
    const parsed = parseTeacherRawName(raw);
    return {
      id: `doc_${String(idx + 1).padStart(3, '0')}_${parsed.normalizedSurname}`,
      rawName: parsed.rawName,
      displayName: parsed.displayName,
      aliases: parsed.aliases,
      active: true,
    };
  });
}

export function isValidSchoolEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split('@');
  if (parts.length !== 2) return false;
  return parts[0].length > 0 && parts[1] === SCHOOL_DOMAIN;
}

export function matchTeacherByEmail(
  email: string,
  docentiList?: DocenteRecord[]
): DocenteRecord | null {
  if (!isValidSchoolEmail(email)) return null;
  const normalized = email.trim().toLowerCase();
  const source = docentiList && docentiList.length > 0 ? docentiList : buildDefaultDocentiRecords();

  for (const docente of source) {
    if (!docente.active) continue;
    if (docente.aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return docente;
    }
  }
  return null;
}

export function resolveUserIdentityOnLogin(params: {
  uid: string;
  email: string;
  displayName?: string | null;
  existingProfile?: UserProfile | null;
  preRole?: PreRole | null;
  docentiList?: DocenteRecord[];
}): UserProfile {
  const normalizedEmail = params.email.trim().toLowerCase();
  const matchedTeacher = matchTeacherByEmail(normalizedEmail, params.docentiList);
  const isSuperAdmin = normalizedEmail === SUPER_ADMIN_EMAIL;

  const baseRole: UserRole =
    params.preRole?.forcedRole === 'docente' || params.preRole?.forcedRole === 'studente'
      ? params.preRole.forcedRole
      : params.existingProfile?.role ?? (matchedTeacher ? 'docente' : 'studente');

  const resolvedStaff = Boolean(
    isSuperAdmin ||
      params.preRole?.isStaff ||
      params.existingProfile?.isStaff
  );

  const mergedArbitroSet = new Set<Disciplina>([
    ...(params.existingProfile?.arbitroTornei ?? []),
    ...(params.preRole?.arbitroTornei ?? []),
  ]);

  // If preRole explicitly replaces arbitroTornei, prefer preRole when present
  const resolvedArbitro: Disciplina[] = params.preRole
    ? [...params.preRole.arbitroTornei]
    : Array.from(mergedArbitroSet);

  const fallbackName =
    params.displayName?.trim() ||
    matchedTeacher?.displayName ||
    toTitleCase(normalizedEmail.split('@')[0].replace(/[._]/g, ' '));

  const resolvedDisplayName =
    params.existingProfile?.displayName?.trim() ||
    matchedTeacher?.displayName ||
    fallbackName;

  const resolvedClasse =
    baseRole === 'docente'
      ? ''
      : params.preRole?.classeOverride || params.existingProfile?.classe || '';

  return {
    uid: params.uid,
    email: normalizedEmail,
    displayName: resolvedDisplayName,
    role: baseRole,
    classe: resolvedClasse,
    isStaff: resolvedStaff,
    arbitroTornei: resolvedArbitro,
  };
}
