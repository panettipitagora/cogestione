# Security Specification — Tre Giorni di Cultura e Sport (Lista 1 EN-CORE)

## 1. Data Invariants
1. **Strict Institutional Domain Gate**: Only authenticated Firebase users with `request.auth.token.email_verified == true` and an email strictly matching `^[^@]+@panettipitagora\.edu\.it$` may read or write any document.
2. **PII & Role Isolation**: User profiles (`users/{userId}`) may only be read (`get`) by the owning user (`request.auth.uid == userId`) or Staff (`isStaff()`). Listing `users`, `pre_roles`, or `segnalazioni_docenti` (for non-owners) is strictly restricted to Staff.
3. **Immutable Student Class**: Once a student sets their `classe` to a non-empty class from the 47 institute classes, the student can never modify `classe`, `role`, `isStaff`, `arbitroTornei`, `email`, `uid`, or `createdAt`. Only Staff (`isStaff()`) can reassign a student's class.
4. **Zero Privilege Escalation**: On `users/{userId}` creation, `isStaff` must be `false` (unless `email == 'diliso.danilo@panettipitagora.edu.it'` or verified via `pre_roles/{email}` with `isStaff == true`) and `arbitroTornei` must be `[]` (unless verified via `pre_roles/{email}`).
5. **Referee Scope Containment**: Referees may ONLY create, update, or delete documents in `partite_tornei` where `disciplina` is included in their `users/{uid}.arbitroTornei` array, and cannot change `disciplina` on update.
6. **Staff-Only CMS Control**: All writes to `attivita_classi`, `convocazioni_tornei`, `docenti`, `pre_roles`, `impostazioni` (urgent banner & regulations PDF), and `segnalazioni_docenti` resolution are strictly limited to `isStaff()`.
7. **Schema & Size Enforcement**: Every collection uses a dedicated `isValid[Entity]()` helper enforcing required keys, allowlisted keys (`hasOnly`), field types, string size bounds, and array size bounds (`<= 47` for classes, `<= 5` for referee disciplines).

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **External Domain Read/Write**: Signed-in `@gmail.com` user attempts to `get` `partite_tornei/m1`.
2. **Unverified Email Spoof**: User with `email_verified: false` and `@panettipitagora.edu.it` attempts to `create` `users/{uid}`.
3. **Self-Assigned Staff Escalation**: Student `create`s `users/{uid}` with `isStaff: true`.
4. **Self-Assigned Referee Escalation**: Student `update`s `users/{uid}` adding `"Calcio"` to `arbitroTornei`.
5. **Student Class Tampering**: Student with `classe: "4 ITIA_A"` attempts `update` changing `classe` to `"5 ITCM"`.
6. **Shadow Ghost Field Injection**: Student `update`s `users/{uid}` with `{ classe: "4 ITIA_A", shadowAdmin: true }`.
7. **Cross-User PII Scraping**: Student A calls `get` or `list` on `users` to read Student B's profile.
8. **Cross-Discipline Referee Hijack**: Referee with `arbitroTornei: ["Pallavolo"]` attempts to `update` a `"Calcio"` match in `partite_tornei`.
9. **Discipline Mutation Attack**: Referee for `"Pallavolo"` attempts to `update` a `"Pallavolo"` match changing `disciplina` to `"Calcio"`.
10. **Non-Staff Schedule Tampering**: Student or Teacher (non-Staff) attempts to `create` or `delete` in `attivita_classi` or `convocazioni_tornei`.
11. **Non-Staff Settings Hijack**: Non-Staff user attempts to `update` `impostazioni/evento` to inject a malicious `regolamentoPdfUrl`.
12. **Resource Poisoning / Oversized Payload**: Authenticated user attempts to `create` a `partite_tornei` document with a 2KB `campo` string or an oversized `squadraA` name.
