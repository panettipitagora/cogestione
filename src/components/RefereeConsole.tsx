import React, { useMemo, useState } from 'react';
import { Gavel, Minus, Plus, Radio, Trash2 } from 'lucide-react';
import { CLASSI_ISTITUTO, FASI_TORNEO, GIORNI_EVENTO } from '../data/schoolData';
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
  onSavePartita: (
    partita: Omit<PartitaTorneo, 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => Promise<void>;
  onDeletePartita: (id: string) => Promise<void>;
}

export const RefereeConsole: React.FC<RefereeConsoleProps> = ({
  user,
  partite,
  onSavePartita,
  onDeletePartita,
}) => {
  const assignedDisciplines = user.arbitroTornei;
  const [selectedDisciplina, setSelectedDisciplina] = useState<Disciplina>(
    assignedDisciplines[0] ?? 'Pallavolo'
  );
  const [giorno, setGiorno] = useState<GiornoEvento>(1);
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
      .filter((p) => assignedDisciplines.includes(p.disciplina))
      .sort((a, b) => {
        if (a.stato === 'live' && b.stato !== 'live') return -1;
        if (b.stato === 'live' && a.stato !== 'live') return 1;
        if (a.giorno !== b.giorno) return a.giorno - b.giorno;
        return a.oraInizio.localeCompare(b.oraInizio);
      });
  }, [partite, assignedDisciplines]);

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

  const handleDirectScore = async (match: PartitaTorneo, team: 'A' | 'B', rawValue: string) => {
    const parsed = Math.max(0, Math.min(999, Number.parseInt(rawValue || '0', 10) || 0));
    await onSavePartita(
      {
        ...match,
        punteggioA: team === 'A' ? parsed : match.punteggioA,
        punteggioB: team === 'B' ? parsed : match.punteggioB,
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
    <div className="space-y-6">
      <section className="hero-encore-gradient rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-[#FF7A00]">
              <Gavel className="w-4 h-4" />
              <span>Console Arbitro · Aggiornamento Scoreboard Real-Time</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              Gestione Gare: {assignedDisciplines.join(' · ')}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Ogni incontro deve oppore squadre o giocatori di singole classi (non miste). Le modifiche sono pubblicate in diretta sulle dashboard di studenti e docenti.
            </p>
          </div>
          <span className="font-mono text-xs text-zinc-300 shrink-0">
            Arbitro: {user.displayName}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Create Match Form */}
        <section className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-zinc-100">
            <h2 className="font-display text-lg font-extrabold text-[#09090B]">
              Nuovo Incontro di Classe
            </h2>
            <p className="text-xs text-zinc-500">
              Discipline abilitate: {assignedDisciplines.join(', ')}
            </p>
          </div>

          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ref-disciplina" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Disciplina
                </label>
                <select
                  id="ref-disciplina"
                  value={selectedDisciplina}
                  onChange={(e) => setSelectedDisciplina(e.target.value as Disciplina)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-semibold text-[#09090B]"
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
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-semibold text-[#09090B]"
                >
                  {GIORNI_EVENTO.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ref-fase" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Fase Torneo
                </label>
                <select
                  id="ref-fase"
                  value={fase}
                  onChange={(e) => setFase(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-[#09090B]"
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
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-mono"
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
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
              />
            </div>

            {/* Squadra A */}
            <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-3.5 space-y-2.5">
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
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-sm"
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
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-sm font-semibold"
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
            <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-3.5 space-y-2.5">
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
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-sm"
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
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-sm font-semibold"
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
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
              />
            </div>

            {formError && (
              <p role="alert" className="text-xs font-semibold text-red-600">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#FF5500] hover:bg-[#FF7A00] text-white font-display font-bold text-sm transition-colors cursor-pointer"
            >
              {submitting ? 'Salvataggio...' : 'Pubblica Incontro nel Tabellone'}
            </button>
          </form>
        </section>

        {/* Active Matches Live Controls */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-[#09090B]">
              Incontri di Tua Competenza ({scopedMatches.length})
            </h2>
          </div>

          {scopedMatches.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-sm text-zinc-500">
              Nessun incontro registrato per {assignedDisciplines.join(', ')}. Crea il primo incontro dal pannello a sinistra.
            </div>
          ) : (
            <div className="space-y-4">
              {scopedMatches.map((match) => (
                <article
                  key={match.id}
                  className={`rounded-xl border p-5 space-y-4 ${
                    match.stato === 'live'
                      ? 'surface-active-orange border-[#FF5500]/50'
                      : 'bg-white border-zinc-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                    <div className="text-xs text-zinc-600">
                      <span className="font-display font-bold text-[#09090B]">
                        {match.disciplina}
                      </span>{' '}
                      · {match.fase} · <span className="font-mono">G{match.giorno} {match.oraInizio}</span> · {match.campo}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(['in_programma', 'live', 'conclusa'] as MatchStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(match, st)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-display font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            match.stato === st
                              ? st === 'live'
                                ? 'bg-[#FF5500] text-white'
                                : 'bg-[#09090B] text-white'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                        >
                          {st === 'in_programma' ? 'In Programma' : st === 'live' ? 'LIVE' : 'Conclusa'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Score Adjusters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display font-bold text-sm text-[#09090B] truncate">
                          {match.squadraA}
                        </p>
                        <p className="text-xs font-mono text-[#FF5500] font-semibold">
                          {match.classeA}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleScoreDelta(match, 'A', -1)}
                          aria-label={`Diminuisci punteggio ${match.squadraA}`}
                          className="w-8 h-8 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={999}
                          aria-label={`Punteggio ${match.squadraA}`}
                          value={match.punteggioA}
                          onChange={(e) => handleDirectScore(match, 'A', e.target.value)}
                          className="w-12 h-8 text-center font-mono font-bold text-base bg-[#09090B] text-white rounded-lg tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => handleScoreDelta(match, 'A', 1)}
                          aria-label={`Aumenta punteggio ${match.squadraA}`}
                          className="w-8 h-8 rounded-lg bg-[#FF5500] text-white hover:bg-[#FF7A00] flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display font-bold text-sm text-[#09090B] truncate">
                          {match.squadraB}
                        </p>
                        <p className="text-xs font-mono text-[#FF5500] font-semibold">
                          {match.classeB}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleScoreDelta(match, 'B', -1)}
                          aria-label={`Diminuisci punteggio ${match.squadraB}`}
                          className="w-8 h-8 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={999}
                          aria-label={`Punteggio ${match.squadraB}`}
                          value={match.punteggioB}
                          onChange={(e) => handleDirectScore(match, 'B', e.target.value)}
                          className="w-12 h-8 text-center font-mono font-bold text-base bg-[#09090B] text-white rounded-lg tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => handleScoreDelta(match, 'B', 1)}
                          aria-label={`Aumenta punteggio ${match.squadraB}`}
                          className="w-8 h-8 rounded-lg bg-[#FF5500] text-white hover:bg-[#FF7A00] flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="inline-flex items-center gap-1.5 text-zinc-500">
                      <Radio className={`w-3.5 h-3.5 ${match.stato === 'live' ? 'text-[#FF5500]' : 'text-zinc-400'}`} />
                      {match.stato === 'live'
                        ? 'Risultato sincronizzato in diretta su tutte le dashboard'
                        : 'Aggiorna lo stato su LIVE al fischio d’inizio'}
                    </span>

                    {confirmDeleteId === match.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-zinc-500 hover:text-zinc-800 font-semibold cursor-pointer"
                        >
                          Annulla
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeletePartita(match.id);
                            setConfirmDeleteId(null);
                          }}
                          className="text-red-600 font-bold hover:underline cursor-pointer"
                        >
                          Conferma Eliminazione
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(match.id)}
                        className="inline-flex items-center gap-1 text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Elimina</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
