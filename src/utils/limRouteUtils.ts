import { CLASSI_ISTITUTO } from '../data/schoolData';

export interface LimRouteMatch {
  isLimMode: boolean;
  limClass: string | null;
}

export function normalizeBasePath(baseUrl: string = '/'): string {
  const trimmed = baseUrl.trim();
  if (!trimmed || trimmed === '/') return '/';
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

export function formatLimClassSlug(classe: string): string {
  return classe.trim().replace(/\s+/g, '-');
}

export function resolveLimClassFromSlug(rawSegment: string | null | undefined): string | null {
  if (!rawSegment) return null;
  let decoded = rawSegment;
  try {
    decoded = decodeURIComponent(rawSegment);
  } catch {
    decoded = rawSegment;
  }
  const normalizedInput = decoded
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toUpperCase();

  for (const cls of CLASSI_ISTITUTO) {
    const normalizedCls = cls
      .trim()
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .toUpperCase();
    if (normalizedCls === normalizedInput) {
      return cls;
    }
  }
  return null;
}

export function parseLimRoute(
  pathname: string,
  search: string = '',
  baseUrl: string = '/'
): LimRouteMatch {
  const base = normalizeBasePath(baseUrl);
  let relPath = pathname || '/';

  if (base !== '/' && relPath.startsWith(base.slice(0, -1))) {
    relPath = relPath.slice(base.length - 1) || '/';
  } else if (relPath.startsWith('/cogestione/') || relPath === '/cogestione') {
    relPath = relPath.slice('/cogestione'.length) || '/';
  }

  const segments = relPath.split('/').filter(Boolean);
  if (segments.length === 0 || segments[0].toLowerCase() !== 'staff') {
    return { isLimMode: false, limClass: null };
  }

  if (segments.length >= 2) {
    const matched = resolveLimClassFromSlug(segments[1]);
    return { isLimMode: true, limClass: matched };
  }

  const params = new URLSearchParams(search);
  const queryClass = params.get('classe');
  if (queryClass) {
    return {
      isLimMode: true,
      limClass: resolveLimClassFromSlug(queryClass),
    };
  }

  return { isLimMode: true, limClass: null };
}

export function buildLimSetupPath(baseUrl: string = '/'): string {
  return `${normalizeBasePath(baseUrl)}staff`;
}

export function buildLimClassPath(classe: string, baseUrl: string = '/'): string {
  return `${normalizeBasePath(baseUrl)}staff/${formatLimClassSlug(classe)}`;
}
