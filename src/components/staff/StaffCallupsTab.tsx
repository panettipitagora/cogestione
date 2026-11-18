import React, { useMemo, useState } from 'react';
import { Pencil, RefreshCw, Search, Trash2, UserPlus, X } from 'lucide-react';
import { DISCIPLINE, GIORNI_EVENTO } from '../../data/schoolData';
import type { ConvocazioneTorneo, Disciplina, GiornoEvento } from '../../types';
import { groupClassesByYear, sortByStartTime } from '../../utils/tournamentUtils';

interface StaffCallupsTabProps {
  staffEmail: string;
  convocazioni: ConvocazioneTorneo[];
  onSaveConvocazione: (
    item: Omit<ConvocazioneTorneo, 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => Promise<void>;
  onDeleteConvocazione: (id: string) => Promise<void>;
}

export const StaffCallupsTab: React.FC<StaffCallupsTabProps> = ({
  staffEmail,
  convocazioni,
  onSaveConvocazione,
  onDeleteConvocazione,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [classe, setClasse] = useState('4 ITIA_A');
  const [studenteNome, setStudenteNome] = useState('');
  const [squadraNome, setSquadraNome] = useState('');
  const [disciplina, setDisciplina] = useState<Disciplina>('Calcio');
  const [giorno, setGiorno] = useState<GiornoEvento>(1);
  const [oraInizio, setOraInizio] = useState('10:30');
  const [oraFine, setOraFine] = useState('11:45');
  const [campo, setCampo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Substitute Modal State
  const [subTarget, setSubTarget] = useState<ConvocazioneTorneo | null>(null);
  const [subNewName, setSubNewName] = useState('');

  const yearGroups = useMemo(() => groupClassesByYear(), []);

  const resetForm = () => {
    setEditingId(null);
    setStudenteNome('');
    setSquadraNome('');
    setCampo('');
  };

  const handleEdit = (item: ConvocazioneTorneo) => {
    setEditingId(item.id);
    setClasse(item.classe);
    setStudenteNome(item.studenteNome);
    setSquadraNome(item.squadraNome);
    setDisciplina(item.disciplina);
    setGiorno(item.giorno);
    setOraInizio(item.oraInizio);
    setOraFine(item.oraFine);
    setCampo(item.campo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studenteNome.trim() || !squadraNome.trim() || !campo.trim() || !classe) return;
    const id = editingId ?? `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await onSaveConvocazione(
      {
        id,
        studenteNome: studenteNome.trim(),
        classe,
        squadraNome: squadraNome.trim(),
        disciplina,
        giorno,
        oraInizio,
        oraFine,
        campo: campo.trim(),
        visibile: true,
        updatedBy: staffEmail,
      },
      !editingId
    );
    resetForm();
  };

  const handleConfirmSubstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTarget || subNewName.trim().length < 2) return;
    await onSaveConvocazione(
      {
        ...subTarget,
        studenteNome: subNewName.trim(),
        updatedBy: staffEmail,
      },
      false
    );
    setSubTarget(null);
    setSubNewName('');
  };

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = convocazioni.filter((c) => {
      if (!q) return true;
      return `${c.studenteNome} ${c.classe} ${c.squadraNome} ${c.disciplina} ${c.campo}`
        .toLowerCase()
        .includes(q);
    });
    return sortByStartTime(list).sort((a, b) => a.giorno - b.giorno);
  }, [convocazioni, searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Add/Edit Callup Form */}
      <section className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h2 className="font-display text-base font-extrabold text-[#09090B] flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#FF5500]" />
            <span>{editingId ? 'Modifica Convocazione' : 'Nuova Convocazione Torneo'}</span>
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
              <label htmlFor="conv-classe" className="block text-xs font-semibold text-zinc-700 mb-1">
                Classe (47 classi)
              </label>
              <select
                id="conv-classe"
                value={classe}
                onChange={(e) => setClasse(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-semibold"
              >
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
            </div>
            <div>
              <label htmlFor="conv-disc" className="block text-xs font-semibold text-zinc-700 mb-1">
                Disciplina
              </label>
              <select
                id="conv-disc"
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
          </div>

          <div>
            <label htmlFor="conv-nome" className="block text-xs font-semibold text-zinc-700 mb-1">
              Nome e Cognome Studente
            </label>
            <input
              id="conv-nome"
              type="text"
              value={studenteNome}
              onChange={(e) => setStudenteNome(e.target.value)}
              placeholder="Es. Mario Rossi"
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          <div>
            <label htmlFor="conv-squadra" className="block text-xs font-semibold text-zinc-700 mb-1">
              Nome Squadra (legata alla classe)
            </label>
            <input
              id="conv-squadra"
              type="text"
              value={squadraNome}
              onChange={(e) => setSquadraNome(e.target.value)}
              placeholder="Es. Real Panetti"
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label htmlFor="conv-giorno" className="block text-xs font-semibold text-zinc-700 mb-1">
                Giorno
              </label>
              <select
                id="conv-giorno"
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
              <label htmlFor="conv-inizio" className="block text-xs font-semibold text-zinc-700 mb-1">
                Dalle ore
              </label>
              <input
                id="conv-inizio"
                type="time"
                value={oraInizio}
                onChange={(e) => setOraInizio(e.target.value)}
                required
                className="w-full px-2.5 py-2 rounded-lg border border-zinc-300 text-sm font-mono"
              />
            </div>
            <div>
              <label htmlFor="conv-fine" className="block text-xs font-semibold text-zinc-700 mb-1">
                Alle ore
              </label>
              <input
                id="conv-fine"
                type="time"
                value={oraFine}
                onChange={(e) => setOraFine(e.target.value)}
                required
                className="w-full px-2.5 py-2 rounded-lg border border-zinc-300 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="conv-campo" className="block text-xs font-semibold text-zinc-700 mb-1">
              Campo / Luogo
            </label>
            <input
              id="conv-campo"
              type="text"
              value={campo}
              onChange={(e) => setCampo(e.target.value)}
              placeholder="Es. Campo A / Palestra Centrale"
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF7A00] text-white font-display font-bold text-sm transition-colors cursor-pointer"
          >
            {editingId ? 'Salva Modifiche Convocazione' : 'Inserisci Convocazione'}
          </button>
        </form>
      </section>

      {/* Callups List with Quick Substitute Button */}
      <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100">
          <h2 className="font-display text-base font-extrabold text-[#09090B]">
            Convocazioni & Sostituzione Rapida ({filteredList.length})
          </h2>
          <div className="relative min-w-[210px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <label htmlFor="conv-search" className="sr-only">
              Cerca studente o classe
            </label>
            <input
              id="conv-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca alunno o classe..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-zinc-200 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {filteredList.map((conv) => (
            <article
              key={conv.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-sm text-[#09090B]">
                    {conv.studenteNome}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#09090B] text-white font-mono text-[11px] font-bold">
                    {conv.classe}
                  </span>
                  <span className="text-xs font-semibold text-[#FF5500]">
                    {conv.disciplina} · {conv.squadraNome}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-mono tabular-nums">
                  Giorno {conv.giorno} · {conv.oraInizio}–{conv.oraFine} · {conv.campo}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSubTarget(conv);
                    setSubNewName('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF7F2] border border-[#FF5500]/40 text-[#FF5500] hover:bg-[#FF5500] hover:text-white text-xs font-display font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sostituisci</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(conv)}
                  aria-label={`Modifica convocazione ${conv.studenteNome}`}
                  className="p-2 rounded-lg text-zinc-500 hover:text-[#09090B] hover:bg-zinc-100 cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteConvocazione(conv.id)}
                  aria-label={`Elimina convocazione ${conv.studenteNome}`}
                  className="p-2 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quick Substitute Mini-Modal */}
      {subTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sub-modal-title"
        >
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 id="sub-modal-title" className="font-display text-lg font-extrabold text-[#09090B]">
                Sostituisci Alunno Assente
              </h3>
              <button
                type="button"
                onClick={() => setSubTarget(null)}
                aria-label="Chiudi modale sostituzione"
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-3.5 text-xs space-y-1">
              <p>
                Alunno attuale: <strong className="text-[#09090B]">{subTarget.studenteNome}</strong> ({subTarget.classe})
              </p>
              <p className="text-zinc-600">
                Torneo: <strong>{subTarget.disciplina}</strong> · Squadra: <strong>{subTarget.squadraNome}</strong>
              </p>
              <p className="font-mono text-zinc-500">
                Giorno {subTarget.giorno} · {subTarget.oraInizio}–{subTarget.oraFine} · {subTarget.campo}
              </p>
            </div>

            <form onSubmit={handleConfirmSubstitution} className="space-y-4">
              <div>
                <label htmlFor="sub-new-name" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nome e Cognome Sostituto (Classe {subTarget.classe})
                </label>
                <input
                  id="sub-new-name"
                  type="text"
                  value={subNewName}
                  onChange={(e) => setSubNewName(e.target.value)}
                  placeholder="Inserisci compagno della stessa classe"
                  required
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubTarget(null)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-700 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#FF5500] hover:bg-[#FF7A00] text-white text-sm font-display font-bold cursor-pointer"
                >
                  Conferma Sostituzione
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
