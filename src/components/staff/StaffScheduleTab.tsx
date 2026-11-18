import React, { useMemo, useState } from 'react';
import { CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { CLASSI_ISTITUTO, CLASSI_PANETTI, CLASSI_PITAGORA, GIORNI_EVENTO } from '../../data/schoolData';
import type { AttivitaClasse, GiornoEvento } from '../../types';
import { getActivityPastelClass, groupClassesByYear, sortByStartTime } from '../../utils/tournamentUtils';

interface StaffScheduleTabProps {
  staffEmail: string;
  attivita: AttivitaClasse[];
  onSaveAttivita: (
    item: Omit<AttivitaClasse, 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => Promise<void>;
  onDeleteAttivita: (id: string) => Promise<void>;
}

export const StaffScheduleTab: React.FC<StaffScheduleTabProps> = ({
  staffEmail,
  attivita,
  onSaveAttivita,
  onDeleteAttivita,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [giorno, setGiorno] = useState<GiornoEvento>(1);
  const [oraInizio, setOraInizio] = useState('08:30');
  const [oraFine, setOraFine] = useState('10:00');
  const [titolo, setTitolo] = useState('');
  const [tipoAttivita, setTipoAttivita] = useState('');
  const [luogo, setLuogo] = useState('');
  const [note, setNote] = useState('');
  const [selectedClassi, setSelectedClassi] = useState<string[]>([]);
  const [filterDay, setFilterDay] = useState<'Tutti' | GiornoEvento>('Tutti');
  const [error, setError] = useState<string | null>(null);

  const yearGroups = useMemo(() => groupClassesByYear(), []);

  const resetForm = () => {
    setEditingId(null);
    setGiorno(1);
    setOraInizio('08:30');
    setOraFine('10:00');
    setTitolo('');
    setTipoAttivita('');
    setLuogo('');
    setNote('');
    setSelectedClassi([]);
    setError(null);
  };

  const handleEdit = (item: AttivitaClasse) => {
    setEditingId(item.id);
    setGiorno(item.giorno);
    setOraInizio(item.oraInizio);
    setOraFine(item.oraFine);
    setTitolo(item.titolo);
    setTipoAttivita(item.tipoAttivita ?? '');
    setLuogo(item.luogo);
    setNote(item.note ?? '');
    setSelectedClassi(item.classi);
    setError(null);
  };

  const toggleClasse = (cls: string) => {
    setSelectedClassi((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const toggleYearGroup = (classesInYear: string[]) => {
    const allSelected = classesInYear.every((c) => selectedClassi.includes(c));
    if (allSelected) {
      setSelectedClassi((prev) => prev.filter((c) => !classesInYear.includes(c)));
    } else {
      setSelectedClassi((prev) => Array.from(new Set([...prev, ...classesInYear])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titolo.trim() || !luogo.trim()) {
      setError('Inserisci titolo e luogo dell’attività.');
      return;
    }
    if (selectedClassi.length === 0) {
      setError('Seleziona almeno una classe destinataria.');
      return;
    }
    setError(null);
    const id = editingId ?? `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await onSaveAttivita(
      {
        id,
        giorno,
        oraInizio,
        oraFine,
        titolo: titolo.trim(),
        tipoAttivita: tipoAttivita.trim(),
        luogo: luogo.trim(),
        note: note.trim(),
        classi: selectedClassi,
        visibile: true,
        updatedBy: staffEmail,
      },
      !editingId
    );
    resetForm();
  };

  const visibleList = useMemo(() => {
    const filtered =
      filterDay === 'Tutti'
        ? attivita
        : attivita.filter((a) => a.giorno === filterDay);
    return sortByStartTime(filtered).sort((a, b) => a.giorno - b.giorno);
  }, [attivita, filterDay]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Form */}
      <section className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h2 className="font-display text-base font-extrabold text-[#09090B] flex items-center gap-2">
            <CalendarPlus className="w-4 h-4 text-[#FF5500]" />
            <span>{editingId ? 'Modifica Attività Classe' : 'Nuova Attività Classi'}</span>
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-zinc-500 hover:text-[#09090B] cursor-pointer"
            >
              Annulla modifica
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label htmlFor="att-giorno" className="block text-xs font-semibold text-zinc-700 mb-1">
                Giorno
              </label>
              <select
                id="att-giorno"
                value={giorno}
                onChange={(e) => setGiorno(Number(e.target.value) as GiornoEvento)}
                className="w-full px-2.5 py-2 rounded-lg border border-zinc-300 text-sm font-semibold"
              >
                {GIORNI_EVENTO.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="att-inizio" className="block text-xs font-semibold text-zinc-700 mb-1">
                Inizio
              </label>
              <input
                id="att-inizio"
                type="time"
                value={oraInizio}
                onChange={(e) => setOraInizio(e.target.value)}
                required
                className="w-full px-2.5 py-2 rounded-lg border border-zinc-300 text-sm font-mono"
              />
            </div>
            <div>
              <label htmlFor="att-fine" className="block text-xs font-semibold text-zinc-700 mb-1">
                Fine
              </label>
              <input
                id="att-fine"
                type="time"
                value={oraFine}
                onChange={(e) => setOraFine(e.target.value)}
                required
                className="w-full px-2.5 py-2 rounded-lg border border-zinc-300 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="att-titolo" className="block text-xs font-semibold text-zinc-700 mb-1">
              Titolo Attività
            </label>
            <input
              id="att-titolo"
              type="text"
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              placeholder="Es. Assemblea / Laboratorio AI"
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          <div>
            <label htmlFor="att-tipo" className="block text-xs font-semibold text-zinc-700 mb-1">
              Tipo Attività (opzionale)
            </label>
            <input
              id="att-tipo"
              type="text"
              value={tipoAttivita}
              onChange={(e) => setTipoAttivita(e.target.value)}
              placeholder="Es. Assemblea, Laboratorio, Conferenza, Cineforum..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          <div>
            <label htmlFor="att-luogo" className="block text-xs font-semibold text-zinc-700 mb-1">
              Luogo / Aula
            </label>
            <input
              id="att-luogo"
              type="text"
              value={luogo}
              onChange={(e) => setLuogo(e.target.value)}
              placeholder="Es. Auditorium Centrale / Aula 204"
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          <div>
            <label htmlFor="att-note" className="block text-xs font-semibold text-zinc-700 mb-1">
              Note (opzionale)
            </label>
            <textarea
              id="att-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dettagli organizzativi o docenti accompagnatori"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          {/* Multi-class selector */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-700">
                Classi Destinatarie ({selectedClassi.length}/47)
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedClassi([...CLASSI_PANETTI])}
                  className="text-zinc-700 font-semibold hover:text-[#FF5500] cursor-pointer"
                >
                  Solo Panetti ({CLASSI_PANETTI.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClassi([...CLASSI_PITAGORA])}
                  className="text-zinc-700 font-semibold hover:text-[#FF5500] cursor-pointer"
                >
                  Solo Pitagora ({CLASSI_PITAGORA.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClassi([...CLASSI_ISTITUTO])}
                  className="text-[#FF5500] font-semibold hover:underline cursor-pointer"
                >
                  Tutte
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClassi([])}
                  className="text-zinc-500 hover:text-zinc-800 cursor-pointer"
                >
                  Deseleziona
                </button>
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto border border-zinc-200 rounded-xl p-3 space-y-3 bg-[#F8FAFC]">
              {yearGroups.map((group) => (
                <div key={group.year} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-500">
                      {group.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleYearGroup(group.classes)}
                      className="text-[11px] font-semibold text-[#FF5500] hover:underline cursor-pointer"
                    >
                      Seleziona anno
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.classes.map((cls) => {
                      const active = selectedClassi.includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => toggleClasse(cls)}
                          className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#09090B] text-white'
                              : 'bg-white border border-zinc-200 text-zinc-700 hover:border-[#FF5500]'
                          }`}
                        >
                          {cls}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF7A00] text-white font-display font-bold text-sm transition-colors cursor-pointer"
          >
            {editingId ? 'Salva Modifiche Attività' : 'Aggiungi al Calendario'}
          </button>
        </form>
      </section>

      {/* Activities List */}
      <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <h2 className="font-display text-base font-extrabold text-[#09090B]">
            Calendario Attività ({visibleList.length})
          </h2>
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
            <button
              type="button"
              onClick={() => setFilterDay('Tutti')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                filterDay === 'Tutti' ? 'bg-white text-[#09090B]' : 'text-zinc-600'
              }`}
            >
              Tutti
            </button>
            {GIORNI_EVENTO.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setFilterDay(g.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  filterDay === g.value ? 'bg-white text-[#09090B]' : 'text-zinc-600'
                }`}
              >
                {g.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {visibleList.map((act) => {
            const pastelClass = getActivityPastelClass(act.tipoAttivita);
            return (
              <article
                key={act.id}
                className={`p-3.5 rounded-xl border border-zinc-100 flex items-start justify-between gap-4 ${pastelClass || 'bg-white'}`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-mono font-bold text-[#FF5500] tabular-nums">
                      Giorno {act.giorno} · {act.oraInizio} – {act.oraFine} · {act.luogo}
                    </p>
                    {act.tipoAttivita && (
                      <span className="text-[11px] font-semibold text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200/80 bg-white/70">
                        {act.tipoAttivita}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#09090B]">
                    {act.titolo}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Classi ({act.classi.length}): {act.classi.join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(act)}
                    aria-label={`Modifica ${act.titolo}`}
                    className="p-2 rounded-lg text-zinc-500 hover:text-[#09090B] hover:bg-zinc-100 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAttivita(act.id)}
                    aria-label={`Elimina ${act.titolo}`}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
