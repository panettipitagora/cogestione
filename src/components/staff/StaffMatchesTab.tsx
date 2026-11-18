import React, { useMemo, useState } from 'react';
import { Pencil, Trash2, Trophy } from 'lucide-react';
import { DISCIPLINE, FASI_TORNEO, GIORNI_EVENTO } from '../../data/schoolData';
import type { Disciplina, GiornoEvento, MatchStatus, PartitaTorneo } from '../../types';
import { groupClassesByYear, validateNonMixedMatchInput } from '../../utils/tournamentUtils';

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

      {/* All Matches Supervision List */}
      <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <h2 className="font-display text-base font-extrabold text-[#09090B] pb-3 border-b border-zinc-100">
          Supervisione Completa Tornei ({partite.length})
        </h2>

        <div className="divide-y divide-zinc-100">
          {partite.map((p) => (
            <article key={p.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-display font-bold text-[#FF5500]">{p.disciplina}</span>
                  <span className="text-zinc-400">·</span>
                  <span className="text-zinc-600">{p.fase}</span>
                  <span className="text-zinc-400">·</span>
                  <span className="font-mono text-zinc-500">G{p.giorno} {p.oraInizio}</span>
                  {p.stato === 'live' && (
                    <span className="px-1.5 py-0.5 rounded bg-[#FF5500] text-white text-[10px] font-bold">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="font-display font-bold text-sm text-[#09090B]">
                  {p.squadraA} ({p.classeA}) <span className="font-mono px-1.5">{p.punteggioA} - {p.punteggioB}</span> {p.squadraB} ({p.classeB})
                </p>
                <p className="text-xs text-zinc-500">{p.campo}</p>
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
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
