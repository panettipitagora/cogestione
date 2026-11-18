import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSI_ISTITUTO, DOCENTI_RAW } from '../data/schoolData';
import {
  buildDefaultDocentiRecords,
  generateTeacherEmailAliases,
  isValidSchoolEmail,
  matchTeacherByEmail,
  resolveUserIdentityOnLogin,
} from './teacherMatcher';

test('official dataset contains exact 47 classes and 172 teachers', () => {
  assert.equal(CLASSI_ISTITUTO.length, 47);
  assert.equal(DOCENTI_RAW.length, 172);
});

test('generateTeacherEmailAliases handles multiple given names progressively', () => {
  assert.deepEqual(generateTeacherEmailAliases('BONATESTA MONICA ELENA'), [
    'monica.bonatesta@panettipitagora.edu.it',
    'monicaelena.bonatesta@panettipitagora.edu.it',
  ]);

  assert.deepEqual(generateTeacherEmailAliases('PASCAZIO ANNA MARIA GRAZIA'), [
    'anna.pascazio@panettipitagora.edu.it',
    'annamaria.pascazio@panettipitagora.edu.it',
    'annamariagrazia.pascazio@panettipitagora.edu.it',
  ]);
});

test('generateTeacherEmailAliases strips trailing dotted initials and normalizes compound surnames', () => {
  assert.deepEqual(generateTeacherEmailAliases('DE MURO FERDINANDO I.A.'), [
    'ferdinando.demuro@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases("DELL'AQUILA ROBERTO"), [
    'roberto.dellaquila@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('DELLE FOGLIE ANGELANTONIO'), [
    'angelantonio.dellefoglie@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('DI LILLO ANTONELLA'), [
    'antonella.dilillo@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('DI RUTIGLIANO MATTEO'), [
    'matteo.dirutigliano@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('LA MANTIA VITO'), [
    'vito.lamantia@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('LO STORTO LOREDANA'), [
    'loredana.lostorto@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('DE BENEDICTIS GIOVANNI'), [
    'giovanni.debenedictis@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('DE GAETANO ALESSANDRA'), [
    'alessandra.degaetano@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('DE GIGLIO CARMELA'), [
    'carmela.degiglio@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('DE LUISI CARMELA'), [
    'carmela.deluisi@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('DE MARZO PAOLA'), [
    'paola.demarzo@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('PIRAINO LUCA F.A.'), [
    'luca.piraino@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('ROMITO GIOVANNA R.M.'), [
    'giovanna.romito@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('RONDINELLI GAIA G.'), [
    'gaia.rondinelli@panettipitagora.edu.it',
  ]);
  assert.deepEqual(generateTeacherEmailAliases('MANFREDI MARINA D.'), [
    'marina.manfredi@panettipitagora.edu.it',
  ]);
});

test('all 172 teachers generate at least one valid school alias', () => {
  const records = buildDefaultDocentiRecords();
  assert.equal(records.length, 172);
  for (const record of records) {
    assert.ok(record.aliases.length >= 1, `No aliases for ${record.rawName}`);
    for (const alias of record.aliases) {
      assert.equal(isValidSchoolEmail(alias), true, `Invalid alias ${alias}`);
    }
  }
});

test('isValidSchoolEmail strictly enforces @panettipitagora.edu.it', () => {
  assert.equal(isValidSchoolEmail('diliso.danilo@panettipitagora.edu.it'), true);
  assert.equal(isValidSchoolEmail('DILISO.DANILO@PANETTIPITAGORA.EDU.IT'), true);
  assert.equal(isValidSchoolEmail('mario.rossi@gmail.com'), false);
  assert.equal(isValidSchoolEmail('mario@fake-panettipitagora.edu.it'), false);
  assert.equal(isValidSchoolEmail(''), false);
});

test('resolveUserIdentityOnLogin assigns super-admin, teacher, referee, and student roles properly', () => {
  const superAdmin = resolveUserIdentityOnLogin({
    uid: 'u1',
    email: 'diliso.danilo@panettipitagora.edu.it',
    displayName: 'Danilo Diliso',
  });
  assert.equal(superAdmin.isStaff, true);
  assert.equal(superAdmin.role, 'studente');

  const teacher = resolveUserIdentityOnLogin({
    uid: 'u2',
    email: 'monicaelena.bonatesta@panettipitagora.edu.it',
  });
  assert.equal(teacher.role, 'docente');
  assert.equal(teacher.isStaff, false);
  assert.equal(teacher.classe, '');

  const refereeStudent = resolveUserIdentityOnLogin({
    uid: 'u3',
    email: 'studente.arbitro@panettipitagora.edu.it',
    preRole: {
      email: 'studente.arbitro@panettipitagora.edu.it',
      isStaff: false,
      arbitroTornei: ['Pallavolo', 'Ping Pong'],
      updatedBy: 'diliso.danilo@panettipitagora.edu.it',
    },
  });
  assert.equal(refereeStudent.role, 'studente');
  assert.deepEqual(refereeStudent.arbitroTornei, ['Pallavolo', 'Ping Pong']);
});

test('matchTeacherByEmail matches all progressive combinations', () => {
  const match1 = matchTeacherByEmail('anna.pascazio@panettipitagora.edu.it');
  const match2 = matchTeacherByEmail('annamariagrazia.pascazio@panettipitagora.edu.it');
  assert.ok(match1);
  assert.ok(match2);
  assert.equal(match1?.rawName, 'PASCAZIO ANNA MARIA GRAZIA');
  assert.equal(match2?.rawName, 'PASCAZIO ANNA MARIA GRAZIA');
});
