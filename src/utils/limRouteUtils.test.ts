import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSI_ISTITUTO } from '../data/schoolData';
import {
  buildLimClassPath,
  buildLimSetupPath,
  formatLimClassSlug,
  parseLimRoute,
  resolveLimClassFromSlug,
} from './limRouteUtils';

test('parseLimRoute detects setup route under root and /cogestione base', () => {
  assert.deepEqual(parseLimRoute('/staff', '', '/'), {
    isLimMode: true,
    limClass: null,
  });
  assert.deepEqual(parseLimRoute('/cogestione/staff', '', '/cogestione/'), {
    isLimMode: true,
    limClass: null,
  });
  assert.deepEqual(parseLimRoute('/cogestione/staff/', '', '/cogestione/'), {
    isLimMode: true,
    limClass: null,
  });
});

test('parseLimRoute resolves locked LIM class from path slug or encoded spaces', () => {
  assert.deepEqual(parseLimRoute('/staff/1G', '', '/'), {
    isLimMode: true,
    limClass: '1G',
  });
  assert.deepEqual(parseLimRoute('/cogestione/staff/1g', '', '/cogestione/'), {
    isLimMode: true,
    limClass: '1G',
  });
  assert.deepEqual(parseLimRoute('/cogestione/staff/4-ITIA_A', '', '/cogestione/'), {
    isLimMode: true,
    limClass: '4 ITIA_A',
  });
  assert.deepEqual(parseLimRoute('/cogestione/staff/4%20ITIA_A', '', '/cogestione/'), {
    isLimMode: true,
    limClass: '4 ITIA_A',
  });
  assert.deepEqual(parseLimRoute('/cogestione/staff', '?classe=2B', '/cogestione/'), {
    isLimMode: true,
    limClass: '2B',
  });
});

test('parseLimRoute ignores non-staff routes and falls back cleanly on unknown class', () => {
  assert.deepEqual(parseLimRoute('/cogestione/', '', '/cogestione/'), {
    isLimMode: false,
    limClass: null,
  });
  assert.deepEqual(parseLimRoute('/staff/99Z', '', '/'), {
    isLimMode: true,
    limClass: null,
  });
});

test('all 47 official classes round-trip through formatLimClassSlug and resolveLimClassFromSlug', () => {
  for (const cls of CLASSI_ISTITUTO) {
    const slug = formatLimClassSlug(cls);
    assert.equal(resolveLimClassFromSlug(slug), cls);
  }
  assert.equal(buildLimSetupPath('/cogestione/'), '/cogestione/staff');
  assert.equal(buildLimClassPath('1G', '/cogestione/'), '/cogestione/staff/1G');
  assert.equal(buildLimClassPath('4 ITIA_A', '/cogestione/'), '/cogestione/staff/4-ITIA_A');
});
