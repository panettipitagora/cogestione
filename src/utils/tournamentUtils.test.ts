import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSI_PANETTI, CLASSI_PITAGORA } from '../data/schoolData';
import type { ConvocazioneTorneo, PartitaTorneo } from '../types';
import {
  adjustMatchScore,
  formatStudentCallupSummary,
  formatTeacherRollCall,
  getActivityLiveState,
  getActivityPastelClass,
  groupClassesByYear,
  matchesTeacherSearch,
  substituteStudentInCallups,
  validateNonMixedMatchInput,
} from './tournamentUtils';

test('groupClassesByYear groups all 47 classes into 5 years and filters empty groups per sede', () => {
  const grouped = groupClassesByYear();
  assert.equal(grouped.length, 5);
  assert.equal(grouped[0].classes.length, 11); // 1A..1M
  assert.equal(grouped[1].classes.length, 10); // 2A..2L
  assert.equal(grouped[2].classes.length, 10); // 3*
  assert.equal(grouped[3].classes.length, 8);  // 4*
  assert.equal(grouped[4].classes.length, 8);  // 5*

  const pitagoraGrouped = groupClassesByYear(CLASSI_PITAGORA);
  assert.equal(pitagoraGrouped.reduce((sum, g) => sum + g.classes.length, 0), 12);

  const panettiGrouped = groupClassesByYear(CLASSI_PANETTI);
  assert.equal(panettiGrouped.reduce((sum, g) => sum + g.classes.length, 0), 35);
});

test('roll call and student callup formatters produce exact required phrasing', () => {
  const conv: ConvocazioneTorneo = {
    id: 'c1',
    studenteNome: 'Mario Rossi',
    classe: '4 ITIA_A',
    squadraNome: 'Real Panetti',
    disciplina: 'Calcio',
    giorno: 1,
    oraInizio: '10:30',
    oraFine: '11:45',
    campo: 'Campo A',
    visibile: true,
    updatedBy: 'diliso.danilo@panettipitagora.edu.it',
  };
  assert.equal(
    formatTeacherRollCall(conv),
    'Mario Rossi è impegnato nel torneo di Calcio dalle ore 10:30 alle ore 11:45'
  );
  assert.equal(
    formatStudentCallupSummary(conv),
    'Mario Rossi (4 ITIA_A) è impegnato nel torneo di Calcio dalle ore 10:30 alle ore 11:45 - Campo A'
  );
});

test('getActivityLiveState identifies in_corso, in_programma, and conclusa', () => {
  assert.equal(getActivityLiveState('10:30', '11:45', '09:00'), 'in_programma');
  assert.equal(getActivityLiveState('10:30', '11:45', '11:00'), 'in_corso');
  assert.equal(getActivityLiveState('10:30', '11:45', '12:15'), 'conclusa');
});

test('validateNonMixedMatchInput enforces valid classes for both teams', () => {
  const invalid = validateNonMixedMatchInput({
    disciplina: 'Pallavolo',
    giorno: 1,
    fase: 'Girone A',
    oraInizio: '10:00',
    campo: 'Palestra Centrale',
    squadraA: 'Dream Team 4A',
    classeA: '',
    squadraB: 'Lions 5C',
    classeB: '5 ITIA_C',
  });
  assert.equal(invalid.valid, false);

  const valid = validateNonMixedMatchInput({
    disciplina: 'Pallavolo',
    giorno: 1,
    fase: 'Girone A',
    oraInizio: '10:00',
    campo: 'Palestra Centrale',
    squadraA: 'Dream Team 4A',
    classeA: '4 ITIA_A',
    squadraB: 'Lions 5C',
    classeB: '5 ITIA_C',
  });
  assert.equal(valid.valid, true);
});

test('substituteStudentInCallups replaces student name while preserving team, class, and schedule', () => {
  const initial: ConvocazioneTorneo[] = [
    {
      id: 'c1',
      studenteNome: 'Mario Rossi',
      classe: '4 ITIA_A',
      squadraNome: 'Real Panetti',
      disciplina: 'Calcio',
      giorno: 1,
      oraInizio: '10:30',
      oraFine: '11:45',
      campo: 'Campo A',
      visibile: true,
      updatedBy: 'staff@panettipitagora.edu.it',
    },
  ];
  const updated = substituteStudentInCallups(
    initial,
    'c1',
    'Luca Bianchi',
    'diliso.danilo@panettipitagora.edu.it'
  );
  assert.equal(updated[0].studenteNome, 'Luca Bianchi');
  assert.equal(updated[0].classe, '4 ITIA_A');
  assert.equal(updated[0].squadraNome, 'Real Panetti');
  assert.equal(updated[0].oraInizio, '10:30');
  assert.equal(updated[0].campo, 'Campo A');
});

test('adjustMatchScore increments and never drops below 0', () => {
  const match: PartitaTorneo = {
    id: 'm1',
    disciplina: 'Calcio',
    giorno: 1,
    fase: 'Girone A',
    oraInizio: '10:00',
    campo: 'Campo A',
    squadraA: 'Real Panetti',
    classeA: '4 ITIA_A',
    squadraB: 'Atletico Pitagora',
    classeB: '5 ITCM',
    punteggioA: 0,
    punteggioB: 2,
    stato: 'live',
    visibile: true,
    updatedBy: 'arbitro@panettipitagora.edu.it',
  };
  assert.equal(adjustMatchScore(match, 'A', -1).punteggioA, 0);
  assert.equal(adjustMatchScore(match, 'A', 1).punteggioA, 1);
  assert.equal(adjustMatchScore(match, 'B', 1).punteggioB, 3);
});

test('getActivityPastelClass returns subtle pastel tint when type is set and deterministic fallback', () => {
  assert.equal(getActivityPastelClass(''), '');
  assert.equal(getActivityPastelClass(undefined), '');
  assert.match(getActivityPastelClass('Laboratorio'), /^bg-.*-50\//);
  assert.equal(getActivityPastelClass('Custom Tipo X'), getActivityPastelClass('custom tipo x'));
});

test('matchesTeacherSearch handles spaced compound surnames, accents, and email aliases', () => {
  const teacher = {
    rawName: "DELL'AQUILA MARIA NICOLÒ",
    displayName: "Maria Nicolò Dell'Aquila",
    aliases: ['maria.dellaquila@panettipitagora.edu.it'],
  };
  assert.equal(matchesTeacherSearch(teacher, 'dellaquila'), true);
  assert.equal(matchesTeacherSearch(teacher, "dell'aquila"), true);
  assert.equal(matchesTeacherSearch(teacher, 'nicolo'), true);
  assert.equal(matchesTeacherSearch(teacher, 'maria.dellaquila@'), true);
  assert.equal(matchesTeacherSearch(teacher, 'inesistente'), false);
});

import {
  isDemoModeEnabled,
  resolveActiveEventDay,
  resolveStatoEvento,
  sanitizeExternalUrl,
} from './eventConfigUtils';

test('resolveStatoEvento and resolveActiveEventDay handle states 0 through 4 accurately', () => {
  assert.equal(resolveStatoEvento(0), 0);
  assert.equal(resolveStatoEvento(1), 1);
  assert.equal(resolveStatoEvento(2), 2);
  assert.equal(resolveStatoEvento(3), 3);
  assert.equal(resolveStatoEvento(4), 4);
  assert.equal(resolveStatoEvento('3'), 3);
  assert.equal(resolveStatoEvento(99), 1);

  assert.equal(resolveActiveEventDay(0), 1);
  assert.equal(resolveActiveEventDay(1), 1);
  assert.equal(resolveActiveEventDay(2), 2);
  assert.equal(resolveActiveEventDay(3), 3);
  assert.equal(resolveActiveEventDay(4), 1);
});

test('isDemoModeEnabled and sanitizeExternalUrl validate Firebase flags safely', () => {
  assert.equal(isDemoModeEnabled(1), true);
  assert.equal(isDemoModeEnabled('1'), true);
  assert.equal(isDemoModeEnabled(0), false);
  assert.equal(isDemoModeEnabled(undefined), false);

  assert.equal(
    sanitizeExternalUrl('https://drive.google.com/drive/folders/abc'),
    'https://drive.google.com/drive/folders/abc'
  );
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeExternalUrl(''), '');
});
