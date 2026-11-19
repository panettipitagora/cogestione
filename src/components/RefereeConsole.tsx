import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Gavel,
  ListChecks,
  MapPin,
  Minus,
  Plus,
  PlusCircle,
  Radio,
  Trash2,
} from 'lucide-react';
import { FASI_TORNEO, GIORNI_EVENTO } from '../data/schoolData';
import type {
  Disciplina,
  GiornoEvento,
  MatchStatus,
  PartitaTorneo,
  UserProfile,
} from '../types';
import {
  adjustMatchScore,
  groupClassesByYear,
  validateNonMixedMatchInput,
} from '../utils/tournamentUtils';

interface RefereeConsoleProps {
  user: UserProfile;
  partite: PartitaTorneo[];
  defaultDay?: GiornoEvento;
  onSavePartita: (
    partita: Omit<PartitaTorneo, 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => Promise<void>;
  onDeletePartita: (id: string) => Promise<void>;
}

export const RefereeConsole: React.FC<RefereeConsoleProps> = ({
  user,
  partite,
  defaultDay = 1,
  onSavePartita,
  onDeletePartita,
}) => {
  const assignedDisciplines = user.arbitroTornei;
  const [mobileSection, setMobileSection] = useState<'partite' | 'nuova'>('partite');
  const [filterDisciplina, setFilterDisciplina] = useState<'Tutte' | Disciplina>('Tutte');

  const [selectedDisciplina, setSelectedDisciplina] = useState<Disciplina>(
    assignedDisciplines[0] ?? 'Pallavolo'
  );
  const [giorno, setGiorno] = useState<GiornoEvento>(defaultDay);
  const [fase, setFase] = useState(FASI_TORNEO[0]);
  const [oraInizio, setOraInizio] = useState('10:00');
  const [campo, setCampo] = useState('');
  const [squadraA, setSquadraA] = useState('');
  const [classeA, setClasseA] = useState('');
  const [squadraB, setSquadraB] = useState('');
  const [classeB, setClasseB] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const yearGroups = useMemo(() => groupClassesByYear(), []);

  const scopedMatches = useMemo(() => {
    return partite
      .filter((p) => {
        if (!assignedDisciplines.includes(p.disciplina)) return false;
        if (filterDisciplina !== 'Tutte' && p.disciplina !== filterDisciplina) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.stato === 'live' && b.stato !== 'live') return -1;
        if (b.stato === 'live' && a.stato !== 'live') return 1;
        if (a.giorno !== b.giorno) return a.giorno - b.giorno;
        return a.oraInizio.localeCompare(b.oraInizio);
      });
  }, [partite, assignedDisciplines, filterDisciplina]);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNonMixedMatchInput({
      disciplina: selectedDisciplina,
      giorno,
      fase,
      oraInizio,
      campo,
      squadraA,
      classeA,
      squadraB,
      classeB,
    });

    if (!validation.valid) {
      setFormError(validation.error);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      const id = `part_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await onSavePartita(
        {
          id,
          disciplina: selectedDisciplina,
          giorno,
          fase: fase.trim(),
          oraInizio,
          campo: campo.trim(),
          squadraA: squadraA.trim(),
          classeA,
          squadraB: squadraB.trim(),
          classeB,
          punteggioA: 0,
          punteggioB: 0,
          stato: 'in_programma',
          note: note.trim(),
          visibile: true,
          updatedBy: user.email,
        },
        true
      );
      setSquadraA('');
      setClasseA('');
      setSquadraB('');
      setClasseB('');
      setCampo('');
      setNote('');
      setMobileSection('partite');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScoreDelta = async (match: PartitaTorneo, team: 'A' | 'B', delta: number) => {
    const updated = adjustMatchScore(match, team, delta);
    await onSavePartita(
      {
        ...updated,
        updatedBy: user.email,
      },
      false
    );
  };

  const handleStatusChange = async (match: PartitaTorneo, stato: MatchStatus) => {
    await onSavePartita(
      {
        ...match,
        stato,
        updatedBy: user.email,
      },
      false
    );
  };

  return (
    <div className="space-y-5">
      {/* Compact Touch-First Referee Header */}
      <section className="hero-encore-gradient rounded-2xl p-5 sm:p-7 text-white">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-[#FF7A00]">
              <Gavel className="w-4 h-4" />
              <span>Console Arbitro · Mobile Live Scoring</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              {assignedDisciplines.join(' · ')}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Tocca LIVE al fischio d&apos;inizio e aggiorna i punti in tempo reale con i pulsanti grandi.
            </p>
          </div>
          <span className="font-mono text-xs text-zinc-300 shrink-0">
            Arbitro: {user.displayName}
          </span>
        </div>
      </section>

      {/* Primary Action Switcher (Partite Live vs + Nuovo Incontro) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setMobileSection('partite')}
          className={`min-h-[48px] px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            mobileSection === 'partite'
              ? 'bg-[#09090B] text-white'
              : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          <ListChecks className="w-4 h-4 text-[#FF5500] shrink-0" />
          <span>Partite ({scopedMatches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSection('nuova')}
          className={`min-h-[48px] px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            mobileSection === 'nuova'
              ? 'bg-[#FF5500] text-white'
              : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>+ Nuovo Incontro</span>
        </button>
      </div>

      {mobileSection === 'partite' ? (
        <section className="space-y-4">
          {/* Discipline Filter Chips (if referee manages > 1 discipline) */}
          {assignedDisciplines.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setFilterDisciplina('Tutte')}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-display font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  filterDisciplina === 'Tutte'
                    ? 'bg-[#09090B] text-white'
                    : 'bg-white border border-zinc-200 text-zinc-700'
                }`}
              >
                Tutte
              </button>
              {assignedDisciplines.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFilterDisciplina(d)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-display font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    filterDisciplina === d
                      ? 'bg-[#FF5500] text-white'
                      : 'bg-white border border-zinc-200 text-zinc-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {scopedMatches.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-3">
              <p className="font-display font-bold text-base text-[#09090B]">
                Nessuna partita in elenco
              </p>
              <p className="text-sm text-zinc-500">
                Crea il primo incontro per {assignedDisciplines.join(', ')} toccando il pulsante qui sotto.
              </p>
              <button
                type="button"
                onClick={() => setMobileSection('nuova')}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#FF5500] text-white font-display font-bold text-sm cursor-pointer"
              >
                + Crea Primo Incontro
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scopedMatches.map((match) => {
                const isLive = match.stato === 'live';
                return (
                  <article
                    key={match.id}
                    className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
                      isLive
                        ? 'surface-active-orange border-[#FF5500]'
                        : 'bg-white border-zinc-200'
                    }`}
                  >
                    {/* Meta Info Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-[#09090B] text-white font-display font-bold">
                          {match.disciplina}
                        </span>
                        <span className="font-semibold text-zinc-700">{match.fase}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          G{match.giorno} {match.oraInizio}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {match.campo}
                        </span>
                      </div>
                    </div>

                    {/* Full-Width 3-Button Match State Selector */}
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-100">
                      {(['in_programma', 'live', 'conclusa'] as MatchStatus[]).map((st) => {
                        const active = match.stato === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(match, st)}
                            className={`min-h-[44px] rounded-lg text-xs font-display font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              active
                                ? st === 'live'
                                  ? 'bg-[#FF5500] text-white'
                                  : 'bg-[#09090B] text-white'
                                : 'text-zinc-600 hover:text-[#09090B]'
                            }`}
                          >
                            {st === 'live' && active && (
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            )}
                            <span>
                              {st === 'in_programma'
                                ? 'In Attesa'
                                : st === 'live'
                                ? 'LIVE'
                                : 'Conclusa'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Graphical Dark Scoreboard Panel */}
                    <div className="bg-[#09090B] text-white rounded-2xl p-4 sm:p-5">
                      <div className="grid grid-cols-11 items-center gap-2">
                        <div className="col-span-4 space-y-1">
                          <p className="font-display font-extrabold text-sm sm:text-base leading-tight break-words">
                            {match.squadraA}
                          </p>
                          <span className="inline-block px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] font-bold text-[#FF7A00]">
                            {match.classeA}
                          </span>
                        </div>

                        <div className="col-span-3 flex items-center justify-center">
                          <div className="font-mono text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight whitespace-nowrap">
                            <span>{match.punteggioA}</span>
                            <span className="text-zinc-500 mx-1.5">-</span>
                            <span>{match.punteggioB}</span>
                          </div>
                        </div>

                        <div className="col-span-4 text-right space-y-1">
                          <p className="font-display font-extrabold text-sm sm:text-base leading-tight break-words">
                            {match.squadraB}
                          </p>
                          <span className="inline-block px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] font-bold text-[#FF7A00]">
                            {match.classeB}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Thumb-Friendly Large Scoring Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Team A Controls */}
                      <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-2.5 space-y-2">
                        <p className="text-[11px] font-display font-bold text-zinc-600 truncate px-0.5">
                          {match.squadraA}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleScoreDelta(match, 'A', -1)}
                            aria-label={`Diminuisci punteggio ${match.squadraA}`}
                            className="w-12 sm:w-14 min-h-[52px] rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 active:scale-95 flex items-center justify-center text-[#09090B] transition-transform cursor-pointer shrink-0"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScoreDelta(match, 'A', 1)}
                            aria-label={`Aumenta punteggio ${match.squadraA}`}
                            className="flex-1 min-h-[52px] rounded-xl bg-[#FF5500] hover:bg-[#FF7A00] active:scale-95 text-white font-display font-extrabold text-base flex items-center justify-center gap-1 transition-transform cursor-pointer"
                          >
                            <Plus className="w-5 h-5" />
                            <span>1</span>
                          </button>
                        </div>
                      </div>

                      {/* Team B Controls */}
                      <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-2.5 space-y-2">
                        <p className="text-[11px] font-display font-bold text-zinc-600 truncate px-0.5 text-right">
                          {match.squadraB}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleScoreDelta(match, 'B', -1)}
                            aria-label={`Diminuisci punteggio ${match.squadraB}`}
                            className="w-12 sm:w-14 min-h-[52px] rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 active:scale-95 flex items-center justify-center text-[#09090B] transition-transform cursor-pointer shrink-0"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScoreDelta(match, 'B', 1)}
                            aria-label={`Aumenta punteggio ${match.squadraB}`}
                            className="flex-1 min-h-[52px] rounded-xl bg-[#FF5500] hover:bg-[#FF7A00] active:scale-95 text-white font-display font-extrabold text-base flex items-center justify-center gap-1 transition-transform cursor-pointer"
                          >
                            <Plus className="w-5 h-5" />
                            <span>1</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer Status & Delete */}
                    <div className="flex items-center justify-between gap-2 text-xs pt-1">
                      <span className="inline-flex items-center gap-1.5 text-zinc-500">
                        <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-[#FF5500]' : 'text-zinc-400'}`} />
                        {isLive ? 'In diretta sulle dashboard' : 'Pronto al fischio'}
                      </span>

                      {confirmDeleteId === match.id ? (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-[36px] px-2 text-zinc-500 hover:text-zinc-800 font-semibold cursor-pointer"
                          >
                            Annulla
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await onDeletePartita(match.id);
                              setConfirmDeleteId(null);
                            }}
                            className="min-h-[36px] px-2 text-red-600 font-bold hover:underline cursor-pointer"
                          >
                            Conferma
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(match.id)}
                          className="min-h-[36px] px-2 inline-flex items-center gap-1 text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Elimina</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        /* Create Match Form (Touch-Optimized) */
        <section className="max-w-2xl mx-auto bg-white border border-zinc-200 rounded-2xl p-5 sm:p-7 space-y-4">
          <div className="pb-3 border-b border-zinc-100">
            <h2 className="font-display text-lg font-extrabold text-[#09090B]">
              Nuovo Incontro di Classe
            </h2>
            <p className="text-xs text-zinc-500">
              Discipline abilitate: {assignedDisciplines.join(', ')}
            </p>
          </div>

          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="ref-disciplina" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Disciplina
                </label>
                <select
                  id="ref-disciplina"
                  value={selectedDisciplina}
                  onChange={(e) => setSelectedDisciplina(e.target.value as Disciplina)}
                  className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-zinc-300 text-sm font-semibold text-[#09090B]"
                >
                  {assignedDisciplines.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ref-giorno" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Giorno
                </label>
                <select
                  id="ref-giorno"
                  value={giorno}
                  onChange={(e) => setGiorno(Number(e.target.value) as GiornoEvento)}
                  className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-zinc-300 text-sm font-semibold text-[#09090B]"
                >
                  {GIORNI_EVENTO.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="ref-fase" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Fase Torneo
                </label>
                <select
                  id="ref-fase"
                  value={fase}
                  onChange={(e) => setFase(e.target.value)}
                  className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-zinc-300 text-sm text-[#09090B]"
                >
                  {FASI_TORNEO.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ref-ora" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Orario Inizio
                </label>
                <input
                  id="ref-ora"
                  type="time"
                  value={oraInizio}
                  onChange={(e) => setOraInizio(e.target.value)}
                  required
                  className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-zinc-300 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ref-campo" className="block text-xs font-semibold text-zinc-700 mb-1">
                Campo / Tavolo
              </label>
              <input
                id="ref-campo"
                type="text"
                value={campo}
                onChange={(e) => setCampo(e.target.value)}
                placeholder="Es. Palestra Centrale / Tavolo 2"
                required
                className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-zinc-300 text-sm"
              />
            </div>

            {/* Squadra A */}
            <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-display font-bold uppercase tracking-wider text-zinc-600">
                Squadra / Giocatore A (Classe singola)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="ref-sq-a" className="sr-only">
                    Nome Squadra A
                  </label>
                  <input
                    id="ref-sq-a"
                    type="text"
                    value={squadraA}
                    onChange={(e) => setSquadraA(e.target.value)}
                    placeholder="Nome squadra o atleta A"
                    required
                    className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-zinc-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="ref-cls-a" className="sr-only">
                    Classe Squadra A
                  </label>
                  <select
                    id="ref-cls-a"
                    value={classeA}
                    onChange={(e) => setClasseA(e.target.value)}
                    required
                    className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-zinc-300 bg-white text-sm font-semibold"
                  >
                    <option value="">Classe A *</option>
                    {yearGroups.map((group) => (
                      <optgroup key={group.year} label={group.label}>
                        {group.classes.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Squadra B */}
            <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-display font-bold uppercase tracking-wider text-zinc-600">
                Squadra / Giocatore B (Classe singola)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="ref-sq-b" className="sr-only">
                    Nome Squadra B
                  </label>
                  <input
                    id="ref-sq-b"
                    type="text"
                    value={squadraB}
                    onChange={(e) => setSquadraB(e.target.value)}
                    placeholder="Nome squadra o atleta B"
                    required
                    className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-zinc-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="ref-cls-b" className="sr-only">
                    Classe Squadra B
                  </label>
                  <select
                    id="ref-cls-b"
                    value={classeB}
                    onChange={(e) => setClasseB(e.target.value)}
                    required
                    className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-zinc-300 bg-white text-sm font-semibold"
                  >
                    <option value="">Classe B *</option>
                    {yearGroups.map((group) => (
                      <optgroup key={group.year} label={group.label}>
                        {group.classes.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="ref-note" className="block text-xs font-semibold text-zinc-700 mb-1">
                Note arbitrali (opzionale)
              </label>
              <input
                id="ref-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Es. Al meglio dei 3 set"
                className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-zinc-300 text-sm"
              />
            </div>

            {formError && (
              <p role="alert" className="text-xs font-semibold text-red-600">
                {formError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setMobileSection('partite')}
                className="min-h-[48px] px-4 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                Indietro
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 min-h-[48px] py-3 rounded-xl bg-[#FF5500] hover:bg-[#FF7A00] text-white font-display font-bold text-sm transition-colors cursor-pointer"
              >
                {submitting ? 'Salvataggio...' : 'Pubblica Incontro nel Tabellone'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};
