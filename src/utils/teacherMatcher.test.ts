import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CLASSI_ISTITUTO,
  CLASSI_PANETTI,
  CLASSI_PITAGORA,
  DOCENTI_RAW,
  getSedeForClasse,
  isSuperAdminEmail,
  SUPER_ADMIN_EMAILS,
} from '../data/schoolData';
import {
  buildDefaultDocentiRecords,
  generateTeacherEmailAliases,
  isValidSchoolEmail,
  matchTeacherByEmail,
  resolveUserIdentityOnLogin,
} from './teacherMatcher';

test('official dataset contains exact 47 classes (12 Pitagora, 35 Panetti) and 172 teachers', () => {
  assert.equal(CLASSI_ISTITUTO.length, 47);
  assert.equal(CLASSI_PITAGORA.length, 12);
  assert.equal(CLASSI_PANETTI.length, 35);
  assert.equal(DOCENTI_RAW.length, 172);
  assert.deepEqual(CLASSI_PITAGORA, [
    '1A',
    '1B',
    '1M',
    '2A',
    '2B',
    '3 ITCA_A',
    '3 ITCA_B',
    '3 ITCA_C',
    '4 ITCA_A',
    '4 ITCA_B',
    '5 ITCA_A',
    '5 ITCA_B',
  ]);
  assert.equal(getSedeForClasse('1M'), 'Pitagora');
  assert.equal(getSedeForClasse('4 ITCA_B'), 'Pitagora');
  assert.equal(getSedeForClasse('1C'), 'Panetti');
  assert.equal(getSedeForClasse('4 ITIA_A'), 'Panetti');
  assert.equal(getSedeForClasse('5 ITCM'), 'Panetti');
});

test('all 4 untouchable super-admins are recognized as staff without defaulting to arbitro', () => {
  assert.equal(SUPER_ADMIN_EMAILS.length, 4);
  for (const email of [
    'diliso.danilo@panettipitagora.edu.it',
    'liseno.giulia@panettipitagora.edu.it',
    'lobefaro.fabiana@panettipitagora.edu.it',
    'chiapparino.davide@panettipitagora.edu.it',
  ]) {
    assert.equal(isSuperAdminEmail(email), true);
    const resolved = resolveUserIdentityOnLogin({
      uid: `uid-${email}`,
      email,
    });
    assert.equal(resolved.isStaff, true);
    assert.deepEqual(resolved.arbitroTornei, []);
  }
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
  assert.deepEqual(superAdmin.arbitroTornei, []);

  const teacher = resolveUserIdentityOnLogin({
    uid: 'u2',
    email: 'monicaelena.bonatesta@panettipitagora.edu.it',
  });
  assert.equal(teacher.role, 'docente');
  assert.equal(teacher.isStaff, false);
  assert.equal(teacher.classe, '');
  assert.equal(teacher.sede, '');

  const refereeStudent = resolveUserIdentityOnLogin({
    uid: 'u3',
    email: 'studente.arbitro@panettipitagora.edu.it',
    preRole: {
      email: 'studente.arbitro@panettipitagora.edu.it',
      isStaff: false,
      arbitroTornei: ['Pallavolo', 'Ping Pong'],
      sedeOverride: 'Pitagora',
      classeOverride: '5 ITCA_A',
      updatedBy: 'diliso.danilo@panettipitagora.edu.it',
    },
  });
  assert.equal(refereeStudent.role, 'studente');
  assert.equal(refereeStudent.sede, 'Pitagora');
  assert.equal(refereeStudent.classe, '5 ITCA_A');
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
