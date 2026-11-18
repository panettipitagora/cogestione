import React, { useMemo, useState } from 'react';
import { Minus, Pencil, Plus, Trash2, Trophy } from 'lucide-react';
import { DISCIPLINE, FASI_TORNEO, GIORNI_EVENTO } from '../../data/schoolData';
import type { Disciplina, GiornoEvento, MatchStatus, PartitaTorneo } from '../../types';
import { adjustMatchScore, groupClassesByYear, validateNonMixedMatchInput } from '../../utils/tournamentUtils';

interface StaffMatchesTabProps {
  staffEmail: string;
  partite: PartitaTorneo[];
  onSavePartita: (
    item: Omit<PartitaTorneo, 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => Promise<void>;
  onDeletePartita: (id: string) => Promise<void>;
}

export const StaffMatchesTab: React.FC<StaffMatchesTabProps> = ({
  staffEmail,
  partite,
  onSavePartita,
  onDeletePartita,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [disciplina, setDisciplina] = useState<Disciplina>('Calcio');
  const [giorno, setGiorno] = useState<GiornoEvento>(1);
  const [fase, setFase] = useState(FASI_TORNEO[0]);
  const [oraInizio, setOraInizio] = useState('10:00');
  const [campo, setCampo] = useState('');
  const [squadraA, setSquadraA] = useState('');
  const [classeA, setClasseA] = useState('');
  const [squadraB, setSquadraB] = useState('');
  const [classeB, setClasseB] = useState('');
  const [punteggioA, setPunteggioA] = useState(0);
  const [punteggioB, setPunteggioB] = useState(0);
  const [stato, setStato] = useState<MatchStatus>('in_programma');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const yearGroups = useMemo(() => groupClassesByYear(), []);

  const resetForm = () => {
    setEditingId(null);
    setSquadraA('');
    setClasseA('');
    setSquadraB('');
    setClasseB('');
    setPunteggioA(0);
    setPunteggioB(0);
    setStato('in_programma');
    setCampo('');
    setNote('');
    setError(null);
  };

  const handleEdit = (p: PartitaTorneo) => {
    setEditingId(p.id);
    setDisciplina(p.disciplina);
    setGiorno(p.giorno);
    setFase(p.fase);
    setOraInizio(p.oraInizio);
    setCampo(p.campo);
    setSquadraA(p.squadraA);
    setClasseA(p.classeA);
    setSquadraB(p.squadraB);
    setClasseB(p.classeB);
    setPunteggioA(p.punteggioA);
    setPunteggioB(p.punteggioB);
    setStato(p.stato);
    setNote(p.note ?? '');
    setError(null);
  };

  const handleQuickScore = async (match: PartitaTorneo, team: 'A' | 'B', delta: number) => {
    const updated = adjustMatchScore(match, team, delta);
    await onSavePartita(
      {
        id: updated.id,
        disciplina: updated.disciplina,
        giorno: updated.giorno,
        fase: updated.fase,
        oraInizio: updated.oraInizio,
        campo: updated.campo,
        squadraA: updated.squadraA,
        classeA: updated.classeA,
        squadraB: updated.squadraB,
        classeB: updated.classeB,
        punteggioA: updated.punteggioA,
        punteggioB: updated.punteggioB,
        stato: updated.stato === 'in_programma' ? 'live' : updated.stato,
        note: updated.note ?? '',
        visibile: true,
        updatedBy: staffEmail,
      },
      false
    );
  };

  const handleQuickStatus = async (match: PartitaTorneo, nextStatus: MatchStatus) => {
    await onSavePartita(
      {
        id: match.id,
        disciplina: match.disciplina,
        giorno: match.giorno,
        fase: match.fase,
        oraInizio: match.oraInizio,
        campo: match.campo,
        squadraA: match.squadraA,
        classeA: match.classeA,
        squadraB: match.squadraB,
        classeB: match.classeB,
        punteggioA: match.punteggioA,
        punteggioB: match.punteggioB,
        stato: nextStatus,
        note: match.note ?? '',
        visibile: true,
        updatedBy: staffEmail,
      },
      false
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNonMixedMatchInput({
      disciplina,
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
      setError(validation.error);
      return;
    }
    setError(null);
    const id = editingId ?? `part_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await onSavePartita(
      {
        id,
        disciplina,
        giorno,
        fase: fase.trim(),
        oraInizio,
        campo: campo.trim(),
        squadraA: squadraA.trim(),
        classeA,
        squadraB: squadraB.trim(),
        classeB,
        punteggioA,
        punteggioB,
        stato,
        note: note.trim(),
        visibile: true,
        updatedBy: staffEmail,
      },
      !editingId
    );
    resetForm();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <section className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h2 className="font-display text-base font-extrabold text-[#09090B] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FF5500]" />
            <span>{editingId ? 'Correggi / Modifica Partita' : 'Crea Partita (Tutti i Tornei)'}</span>
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-zinc-500 hover:text-[#09090B] cursor-pointer"
            >
              Annulla
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="stf-disc" className="block text-xs font-semibold text-zinc-700 mb-1">
                Disciplina
              </label>
              <select
                id="stf-disc"
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value as Disciplina)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-semibold"
              >
                {DISCIPLINE.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="stf-giorno" className="block text-xs font-semibold text-zinc-700 mb-1">
                Giorno
              </label>
              <select
                id="stf-giorno"
                value={giorno}
                onChange={(e) => setGiorno(Number(e.target.value) as GiornoEvento)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-semibold"
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
              <label htmlFor="stf-fase" className="block text-xs font-semibold text-zinc-700 mb-1">
                Fase
              </label>
              <input
                id="stf-fase"
                type="text"
                value={fase}
                onChange={(e) => setFase(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="stf-ora" className="block text-xs font-semibold text-zinc-700 mb-1">
                Orario
              </label>
              <input
                id="stf-ora"
                type="time"
                value={oraInizio}
                onChange={(e) => setOraInizio(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="stf-campo" className="block text-xs font-semibold text-zinc-700 mb-1">
              Campo / Tavolo
            </label>
            <input
              id="stf-campo"
              type="text"
              value={campo}
              onChange={(e) => setCampo(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              aria-label="Nome Squadra A"
              value={squadraA}
              onChange={(e) => setSquadraA(e.target.value)}
              placeholder="Squadra A"
              required
              className="col-span-1 px-2.5 py-2 rounded-lg border border-zinc-300 text-xs sm:text-sm"
            />
            <select
              aria-label="Classe Squadra A"
              value={classeA}
              onChange={(e) => setClasseA(e.target.value)}
              required
              className="col-span-1 px-2 py-2 rounded-lg border border-zinc-300 text-xs font-semibold"
            >
              <option value="">Classe A</option>
              {yearGroups.map((g) => (
                <optgroup key={g.year} label={g.label}>
                  {g.classes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <input
              type="number"
              min={0}
              aria-label="Punteggio Squadra A"
              value={punteggioA}
              onChange={(e) => setPunteggioA(Number(e.target.value) || 0)}
              className="col-span-1 px-2.5 py-2 rounded-lg border border-zinc-300 text-sm font-mono font-bold text-center"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              aria-label="Nome Squadra B"
              value={squadraB}
              onChange={(e) => setSquadraB(e.target.value)}
              placeholder="Squadra B"
              required
              className="col-span-1 px-2.5 py-2 rounded-lg border border-zinc-300 text-xs sm:text-sm"
            />
            <select
              aria-label="Classe Squadra B"
              value={classeB}
              onChange={(e) => setClasseB(e.target.value)}
              required
              className="col-span-1 px-2 py-2 rounded-lg border border-zinc-300 text-xs font-semibold"
            >
              <option value="">Classe B</option>
              {yearGroups.map((g) => (
                <optgroup key={g.year} label={g.label}>
                  {g.classes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <input
              type="number"
              min={0}
              aria-label="Punteggio Squadra B"
              value={punteggioB}
              onChange={(e) => setPunteggioB(Number(e.target.value) || 0)}
              className="col-span-1 px-2.5 py-2 rounded-lg border border-zinc-300 text-sm font-mono font-bold text-center"
            />
          </div>

          <div>
            <label htmlFor="stf-stato" className="block text-xs font-semibold text-zinc-700 mb-1">
              Stato Match
            </label>
            <select
              id="stf-stato"
              value={stato}
              onChange={(e) => setStato(e.target.value as MatchStatus)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-semibold"
            >
              <option value="in_programma">In Programma</option>
              <option value="live">LIVE (In corso)</option>
              <option value="conclusa">Conclusa</option>
            </select>
          </div>

          <div>
            <label htmlFor="stf-note" className="block text-xs font-semibold text-zinc-700 mb-1">
              Note partita (opzionale)
            </label>
            <input
              id="stf-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Es. Set decisivo al 15 / Recupero"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF7A00] text-white font-display font-bold text-sm transition-colors cursor-pointer"
          >
            {editingId ? 'Aggiorna Partita' : 'Pubblica Partita'}
          </button>
        </form>
      </section>

      {/* All Matches Supervision List with Direct Score & Status Controls */}
      <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <div className="pb-3 border-b border-zinc-100 space-y-1">
          <h2 className="font-display text-base font-extrabold text-[#09090B]">
            Supervisione Completa Tornei ({partite.length})
          </h2>
          <p className="text-xs text-zinc-500">
            Lo Staff Super-Admin può creare, modificare, aggiornare i punteggi in diretta e rimuovere qualsiasi incontro senza risultare arbitro.
          </p>
        </div>

        <div className="divide-y divide-zinc-100">
          {partite.map((p) => (
            <article key={p.id} className="py-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-display font-bold text-[#FF5500]">{p.disciplina}</span>
                    <span className="text-zinc-400">·</span>
                    <span className="text-zinc-600">{p.fase}</span>
                    <span className="text-zinc-400">·</span>
                    <span className="font-mono text-zinc-500">G{p.giorno} {p.oraInizio}</span>
                    <span className="text-zinc-400">·</span>
                    <span className="text-zinc-500">{p.campo}</span>
                  </div>
                  <p className="font-display font-bold text-sm text-[#09090B]">
                    {p.squadraA} ({p.classeA}) <span className="font-mono px-1.5 text-[#FF5500]">{p.punteggioA} - {p.punteggioB}</span> {p.squadraB} ({p.classeB})
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    aria-label={`Modifica partita ${p.squadraA} vs ${p.squadraB}`}
                    className="p-2 rounded-lg text-zinc-500 hover:text-[#09090B] hover:bg-zinc-100 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePartita(p.id)}
                    aria-label={`Elimina partita ${p.squadraA} vs ${p.squadraB}`}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Live Controls for Staff */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] border border-zinc-200/80 rounded-xl px-3 py-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-mono font-semibold text-zinc-600 mr-1">
                      {p.classeA}:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickScore(p, 'A', -1)}
                      aria-label={`Decrementa punteggio ${p.squadraA}`}
                      className="p-1 rounded bg-white border border-zinc-300 hover:bg-zinc-100 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickScore(p, 'A', 1)}
                      aria-label={`Incrementa punteggio ${p.squadraA}`}
                      className="p-1 rounded bg-[#FF5500] text-white hover:bg-[#FF7A00] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-mono font-semibold text-zinc-600 mr-1">
                      {p.classeB}:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickScore(p, 'B', -1)}
                      aria-label={`Decrementa punteggio ${p.squadraB}`}
                      className="p-1 rounded bg-white border border-zinc-300 hover:bg-zinc-100 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickScore(p, 'B', 1)}
                      aria-label={`Incrementa punteggio ${p.squadraB}`}
                      className="p-1 rounded bg-[#FF5500] text-white hover:bg-[#FF7A00] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {(['in_programma', 'live', 'conclusa'] as MatchStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleQuickStatus(p, st)}
                      className={`px-2 py-1 rounded text-[11px] font-display font-bold transition-colors cursor-pointer ${
                        p.stato === st
                          ? st === 'live'
                            ? 'bg-[#FF5500] text-white'
                            : 'bg-[#09090B] text-white'
                          : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {st === 'in_programma' ? 'Programma' : st === 'live' ? 'LIVE' : 'Conclusa'}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
