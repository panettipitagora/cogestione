import React, { useMemo, useState } from 'react';
import { Check, Search, Shield, Trash2, UserCheck, UserPlus, X } from 'lucide-react';
import {
  CLASSI_ISTITUTO,
  DISCIPLINE,
  getClassesForSede,
  getSedeForClasse,
  isSuperAdminEmail,
} from '../../data/schoolData';
import type {
  Disciplina,
  DocenteRecord,
  PreRole,
  SedeIstituto,
  SegnalazioneDocente,
  UserProfile,
  UserRole,
} from '../../types';
import { isValidSchoolEmail, parseTeacherRawName } from '../../utils/teacherMatcher';
import { matchesTeacherSearch } from '../../utils/tournamentUtils';

interface StaffUsersTabProps {
  staffEmail: string;
  users: UserProfile[];
  preRoles: PreRole[];
  docenti: DocenteRecord[];
  segnalazioni: SegnalazioneDocente[];
  onUpdateUser: (
    uid: string,
    updates: Partial<Pick<UserProfile, 'sede' | 'classe' | 'role' | 'isStaff' | 'arbitroTornei' | 'displayName'>>
  ) => Promise<void>;
  onUpsertPreRole: (preRole: PreRole) => Promise<void>;
  onDeletePreRole: (email: string) => Promise<void>;
  onSaveDocente: (docente: DocenteRecord, isNew: boolean) => Promise<void>;
  onDeleteDocente: (id: string) => Promise<void>;
  onResolveSegnalazione: (seg: SegnalazioneDocente) => Promise<void>;
}

export const StaffUsersTab: React.FC<StaffUsersTabProps> = ({
  staffEmail,
  users,
  preRoles,
  docenti,
  segnalazioni,
  onUpdateUser,
  onUpsertPreRole,
  onDeletePreRole,
  onSaveDocente,
  onDeleteDocente,
  onResolveSegnalazione,
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Pre-role form
  const [preEmail, setPreEmail] = useState('');
  const [preStaff, setPreStaff] = useState(false);
  const [preArbitro, setPreArbitro] = useState<Disciplina[]>([]);
  const [preForcedRole, setPreForcedRole] = useState<'' | UserRole>('');
  const [preError, setPreError] = useState<string | null>(null);

  // Add teacher form
  const [newTeacherRaw, setNewTeacherRaw] = useState('');
  const [newTeacherCustomAlias, setNewTeacherCustomAlias] = useState('');

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (!q) return true;
      return `${u.displayName} ${u.email} ${u.classe} ${u.role}`
        .toLowerCase()
        .includes(q);
    });
  }, [users, userSearch]);

  const filteredTeachers = useMemo(() => {
    return docenti.filter((d) => matchesTeacherSearch(d, teacherSearch));
  }, [docenti, teacherSearch]);

  const togglePreArbitro = (d: Disciplina) => {
    setPreArbitro((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSavePreRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = preEmail.trim().toLowerCase();
    if (!isValidSchoolEmail(normalized)) {
      setPreError('Inserisci un indirizzo valido @panettipitagora.edu.it');
      return;
    }
    const targetIsSuperAdmin = isSuperAdminEmail(normalized);
    setPreError(null);
    await onUpsertPreRole({
      email: normalized,
      isStaff: targetIsSuperAdmin ? true : preStaff,
      arbitroTornei: targetIsSuperAdmin ? [] : preArbitro,
      forcedRole: preForcedRole,
      updatedBy: staffEmail,
    });

    // If user already exists in registered list, sync immediately
    const existingUser = users.find((u) => u.email.toLowerCase() === normalized);
    if (existingUser) {
      await onUpdateUser(existingUser.uid, {
        isStaff: targetIsSuperAdmin ? true : preStaff,
        arbitroTornei: targetIsSuperAdmin ? [] : preArbitro,
        ...(preForcedRole ? { role: preForcedRole } : {}),
      });
    }

    setPreEmail('');
    setPreStaff(false);
    setPreArbitro([]);
    setPreForcedRole('');
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherRaw.trim()) return;
    const parsed = parseTeacherRawName(newTeacherRaw.trim());
    const aliases = [...parsed.aliases];
    const custom = newTeacherCustomAlias.trim().toLowerCase();
    if (custom && isValidSchoolEmail(custom) && !aliases.includes(custom)) {
      aliases.unshift(custom);
    }
    const id = `doc_${Date.now()}_${parsed.normalizedSurname || 'custom'}`;
    await onSaveDocente(
      {
        id,
        rawName: parsed.rawName,
        displayName: parsed.displayName || newTeacherRaw.trim(),
        aliases,
        active: true,
      },
      true
    );
    setNewTeacherRaw('');
    setNewTeacherCustomAlias('');
  };

  const toggleUserArbitro = async (u: UserProfile, d: Disciplina) => {
    const next = u.arbitroTornei.includes(d)
      ? u.arbitroTornei.filter((x) => x !== d)
      : [...u.arbitroTornei, d];
    await onUpdateUser(u.uid, { arbitroTornei: next });
  };

  return (
    <div className="space-y-6">
      {/* Top Grid: Pre-Autorizzazione Email + Segnalazioni Docenti */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-6 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div className="pb-3 border-b border-zinc-100">
            <h2 className="font-display text-base font-extrabold text-[#09090B] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FF5500]" />
              <span>Assegna Arbitri & Staff per Email (Pre-Roles)</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Abilita Arbitri o Staff prima ancora del loro primo accesso Google Workspace.
            </p>
          </div>

          <form onSubmit={handleSavePreRole} className="space-y-3.5">
            <div>
              <label htmlFor="pre-email" className="block text-xs font-semibold text-zinc-700 mb-1">
                Email Istituzionale (@panettipitagora.edu.it)
              </label>
              <input
                id="pre-email"
                type="email"
                value={preEmail}
                onChange={(e) => setPreEmail(e.target.value)}
                placeholder="nome.cognome@panettipitagora.edu.it"
                required
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-zinc-700">
                Discipline Arbitro Assegnate
              </span>
              <div className="flex flex-wrap gap-2">
                {DISCIPLINE.map((d) => {
                  const active = preArbitro.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => togglePreArbitro(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#FF5500] text-white'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-zinc-200 bg-[#F8FAFC] cursor-pointer">
                <input
                  type="checkbox"
                  checked={preStaff}
                  onChange={(e) => setPreStaff(e.target.checked)}
                  className="accent-[#FF5500] w-4 h-4"
                />
                <span className="text-xs font-bold text-[#09090B]">
                  Permessi Staff Super-Admin
                </span>
              </label>

              <div>
                <label htmlFor="pre-role-select" className="sr-only">
                  Ruolo forzato
                </label>
                <select
                  id="pre-role-select"
                  value={preForcedRole}
                  onChange={(e) => setPreForcedRole(e.target.value as '' | UserRole)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-semibold"
                >
                  <option value="">Riconoscimento automatico ruolo</option>
                  <option value="studente">Forza Studente</option>
                  <option value="docente">Forza Docente</option>
                </select>
              </div>
            </div>

            {preError && <p role="alert" className="text-xs font-semibold text-red-600">{preError}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#09090B] hover:bg-[#18181B] text-white font-display font-bold text-sm transition-colors cursor-pointer"
            >
              Salva Pre-Autorizzazione
            </button>
          </form>

          {preRoles.length > 0 && (
            <div className="pt-3 border-t border-zinc-100 space-y-2">
              <p className="text-xs font-display font-bold uppercase tracking-wider text-zinc-500">
                Pre-Autorizzazioni Attive ({preRoles.length})
              </p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {preRoles.map((pr) => (
                  <div
                    key={pr.email}
                    className="flex items-center justify-between gap-2 bg-[#F8FAFC] border border-zinc-200 rounded-lg px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-mono font-semibold text-[#09090B] truncate">{pr.email}</p>
                      <p className="text-zinc-500">
                        {pr.isStaff ? 'STAFF · ' : ''}
                        {pr.arbitroTornei.length > 0
                          ? `Arbitro: ${pr.arbitroTornei.join(', ')}`
                          : 'Nessun torneo arbitro'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeletePreRole(pr.email)}
                      aria-label={`Rimuovi pre-autorizzazione ${pr.email}`}
                      className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Segnalazioni Docenti */}
        <section className="lg:col-span-6 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div className="pb-3 border-b border-zinc-100">
            <h2 className="font-display text-base font-extrabold text-[#09090B] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#FF5500]" />
              <span>Segnalazioni Docenti Non Riconosciuti ({segnalazioni.length})</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Richieste inviate dalla schermata di primo accesso studentesco.
            </p>
          </div>

          {segnalazioni.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4">Nessuna segnalazione ricevuta.</p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {segnalazioni.map((seg) => (
                <div
                  key={seg.id}
                  className="border border-zinc-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F8FAFC]"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-display font-bold text-sm text-[#09090B]">
                      {seg.displayName}
                    </p>
                    <p className="font-mono text-xs text-[#FF5500] truncate">{seg.email}</p>
                    <p className="text-xs text-zinc-600">{seg.note}</p>
                  </div>
                  {seg.stato === 'aperta' ? (
                    <button
                      type="button"
                      onClick={() => onResolveSegnalazione(seg)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5500] text-white text-xs font-display font-bold hover:bg-[#FF7A00] shrink-0 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Promuovi a Docente</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 shrink-0">
                      Risolta
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Utenti Registrati: Modifica Classe, Staff e Arbitri */}
      <section className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100">
          <div>
            <h2 className="font-display text-base font-extrabold text-[#09090B]">
              Utenti Registrati — Modifica Classe, Arbitri & Staff ({filteredUsers.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Solo lo Staff può correggere la classe di uno studente dopo la registrazione.
            </p>
          </div>
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label="Cerca utente registrato"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Cerca nome, email o classe..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-zinc-200 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {filteredUsers.map((u) => {
            const untouchableSuperAdmin = isSuperAdminEmail(u.email);
            const userClasses = u.sede ? getClassesForSede(u.sede) : CLASSI_ISTITUTO;
            return (
              <div key={u.uid} className="py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-sm text-[#09090B]">
                      {u.displayName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-white text-[11px] font-display font-bold uppercase">
                      {u.role}
                    </span>
                    {u.sede && (
                      <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] font-display font-bold uppercase">
                        {u.sede}
                      </span>
                    )}
                    {untouchableSuperAdmin ? (
                      <span className="px-2 py-0.5 rounded bg-[#FF5500] text-white text-[11px] font-display font-bold uppercase">
                        SUPER ADMIN · INTOCCABILE
                      </span>
                    ) : (
                      u.isStaff && (
                        <span className="px-2 py-0.5 rounded bg-[#FF5500] text-white text-[11px] font-display font-bold uppercase">
                          STAFF
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-xs font-mono text-zinc-500 truncate">{u.email}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Role Selector */}
                  <select
                    aria-label={`Ruolo di ${u.displayName}`}
                    value={u.role}
                    disabled={untouchableSuperAdmin}
                    onChange={(e) =>
                      onUpdateUser(u.uid, { role: e.target.value as UserRole })
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-500 text-xs font-semibold"
                  >
                    <option value="studente">Studente</option>
                    <option value="docente">Docente</option>
                  </select>

                  {/* Sede Selector */}
                  <select
                    aria-label={`Sede di ${u.displayName}`}
                    value={u.sede ?? ''}
                    onChange={(e) => {
                      const nextSede = e.target.value as '' | SedeIstituto;
                      const keepClass =
                        !nextSede ||
                        !u.classe ||
                        getSedeForClasse(u.classe) === nextSede;
                      onUpdateUser(u.uid, {
                        sede: nextSede,
                        ...(keepClass ? {} : { classe: '' }),
                      });
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold"
                  >
                    <option value="">-- Sede --</option>
                    <option value="Panetti">Panetti</option>
                    <option value="Pitagora">Pitagora</option>
                  </select>

                  {/* Class Correction Dropdown */}
                  {u.role === 'studente' && (
                    <select
                      aria-label={`Classe di ${u.displayName}`}
                      value={u.classe}
                      onChange={(e) => {
                        const cls = e.target.value;
                        onUpdateUser(u.uid, {
                          classe: cls,
                          ...(cls ? { sede: getSedeForClasse(cls) } : {}),
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs font-mono font-semibold"
                    >
                      <option value="">-- Classe --</option>
                      {userClasses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Staff Toggle (bloccato per i 4 Super-Admin intoccabili) */}
                  {untouchableSuperAdmin ? (
                    <span className="px-2.5 py-1.5 rounded-lg text-xs font-display font-bold bg-[#09090B] text-[#FF7A00] border border-[#09090B]">
                      Super-Staff Permanente (Non Arbitro)
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onUpdateUser(u.uid, { isStaff: !u.isStaff })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-display font-bold border transition-colors cursor-pointer ${
                          u.isStaff
                            ? 'bg-[#09090B] text-[#FF7A00] border-[#09090B]'
                            : 'bg-white text-zinc-600 border-zinc-300 hover:border-[#09090B]'
                        }`}
                      >
                        {u.isStaff ? 'Revoca Staff' : 'Rendi Staff'}
                      </button>

                      {/* Referee Discipline Toggles */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {DISCIPLINE.map((d) => {
                          const active = u.arbitroTornei.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleUserArbitro(u, d)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                                active
                                  ? 'bg-[#FF5500] text-white'
                                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gestione Whitelist Docenti */}
      <section className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-zinc-100">
          <div>
            <h2 className="font-display text-base font-extrabold text-[#09090B]">
              Whitelist Ufficiale Docenti ({docenti.length} nominativi)
            </h2>
            <p className="text-xs text-zinc-500">
              Generazione automatica alias progressivi e supporto cognomi composti.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-600 tabular-nums shrink-0">
            {filteredTeachers.length} / {docenti.length} docenti
          </span>
        </div>

        {/* Barra di ricerca docente dedicata e ad alto contrasto */}
        <div className="space-y-1.5">
          <label
            htmlFor="whitelist-teacher-search"
            className="block text-xs font-display font-bold uppercase tracking-wider text-zinc-700"
          >
            Cerca docente nella Whitelist
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="whitelist-teacher-search"
              type="text"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Digita cognome, nome o email alias (es. Bonatesta, De Muro, monica.bonatesta)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-300 bg-[#F8FAFC] focus:bg-white text-sm text-[#09090B] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF5500] focus:border-[#FF5500]"
            />
            {teacherSearch && (
              <button
                type="button"
                onClick={() => setTeacherSearch('')}
                aria-label="Cancella ricerca docente"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-500 hover:text-[#09090B] hover:bg-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleAddTeacher} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-[#F8FAFC] border border-zinc-200 rounded-xl p-3.5">
          <input
            type="text"
            aria-label="Cognome e Nome Docente"
            value={newTeacherRaw}
            onChange={(e) => setNewTeacherRaw(e.target.value)}
            placeholder="COGNOME NOME (es. ROSSI MARIO)"
            required
            className="sm:col-span-5 px-3 py-2 rounded-lg border border-zinc-300 bg-white text-xs sm:text-sm uppercase"
          />
          <input
            type="email"
            aria-label="Alias email opzionale"
            value={newTeacherCustomAlias}
            onChange={(e) => setNewTeacherCustomAlias(e.target.value)}
            placeholder="Alias extra opzionale (@panettipitagora.edu.it)"
            className="sm:col-span-5 px-3 py-2 rounded-lg border border-zinc-300 bg-white text-xs sm:text-sm font-mono"
          />
          <button
            type="submit"
            className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF5500] text-white text-xs font-display font-bold hover:bg-[#FF7A00] cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Aggiungi</span>
          </button>
        </form>

        <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 border border-zinc-200 rounded-xl px-4">
          {filteredTeachers.length === 0 ? (
            <p className="py-6 text-xs text-zinc-500 text-center">
              Nessun docente trovato per &ldquo;{teacherSearch.trim()}&rdquo;.
            </p>
          ) : (
            (teacherSearch.trim() ? filteredTeachers : filteredTeachers.slice(0, 60)).map((docente) => (
              <div key={docente.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-display font-bold text-[#09090B]">
                    {docente.rawName}{' '}
                    <span className="font-normal text-zinc-500">({docente.displayName})</span>
                  </p>
                  <p className="font-mono text-[11px] text-zinc-500 truncate">
                    {docente.aliases.join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteDocente(docente.id)}
                  aria-label={`Rimuovi ${docente.rawName}`}
                  className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
          {!teacherSearch.trim() && filteredTeachers.length > 60 && (
            <p className="py-2 text-xs text-zinc-500 text-center">
              Visualizzati i primi 60 risultati su {filteredTeachers.length}. Usa la barra di ricerca sopra per trovare un docente specifico.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
