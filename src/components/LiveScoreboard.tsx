import React, { useMemo, useState } from 'react';
import { Calendar, MapPin, Search, Trophy } from 'lucide-react';
import { DISCIPLINE, GIORNI_EVENTO } from '../data/schoolData';
import type { Disciplina, GiornoEvento, PartitaTorneo } from '../types';

interface LiveScoreboardProps {
  partite: PartitaTorneo[];
}

export const LiveScoreboard: React.FC<LiveScoreboardProps> = ({ partite }) => {
  const [disciplinaFilter, setDisciplinaFilter] = useState<'Tutte' | Disciplina>('Tutte');
  const [giornoFilter, setGiornoFilter] = useState<'Tutti' | GiornoEvento>('Tutti');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPartite = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = partite.filter((p) => {
      if (disciplinaFilter !== 'Tutte' && p.disciplina !== disciplinaFilter) return false;
      if (giornoFilter !== 'Tutti' && p.giorno !== giornoFilter) return false;
      if (q) {
        const haystack = [
          p.squadraA,
          p.classeA,
          p.squadraB,
          p.classeB,
          p.disciplina,
          p.fase,
          p.campo,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const rank: Record<PartitaTorneo['stato'], number> = {
      live: 0,
      in_programma: 1,
      conclusa: 2,
    };

    return [...list].sort((a, b) => {
      if (rank[a.stato] !== rank[b.stato]) return rank[a.stato] - rank[b.stato];
      if (a.giorno !== b.giorno) return a.giorno - b.giorno;
      return a.oraInizio.localeCompare(b.oraInizio);
    });
  }, [partite, disciplinaFilter, giornoFilter, searchQuery]);

  const liveCount = useMemo(
    () => partite.filter((p) => p.stato === 'live').length,
    [partite]
  );

  return (
    <section className="space-y-6" aria-label="Risultati Real-Time Tornei">
      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setDisciplinaFilter('Tutte')}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                disciplinaFilter === 'Tutte'
                  ? 'bg-[#09090B] text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              Tutte
            </button>
            {DISCIPLINE.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDisciplinaFilter(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  disciplinaFilter === d
                    ? 'bg-[#FF5500] text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setGiornoFilter('Tutti')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  giornoFilter === 'Tutti'
                    ? 'bg-white text-[#09090B] shadow-xs'
                    : 'text-zinc-600 hover:text-[#09090B]'
                }`}
              >
                Tutti i giorni
              </button>
              {GIORNI_EVENTO.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGiornoFilter(g.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    giornoFilter === g.value
                      ? 'bg-white text-[#09090B] shadow-xs'
                      : 'text-zinc-600 hover:text-[#09090B]'
                  }`}
                >
                  {g.shortLabel}
                </button>
              ))}
            </div>

            <div className="relative min-w-[235px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <label htmlFor="scoreboard-search" className="sr-only">
                Cerca classe, squadra o giocatore
              </label>
              <input
                id="scoreboard-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca classe o squadra..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs sm:text-sm text-[#09090B] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
          <span>
            {filteredPartite.length} {filteredPartite.length === 1 ? 'incontro visualizzato' : 'incontri visualizzati'}
          </span>
          <span className="font-mono tabular-nums">
            {liveCount > 0 ? `${liveCount} in diretta ora` : 'Nessun match live in questo momento'}
          </span>
        </div>
      </div>

      {/* Matches Grid */}
      {filteredPartite.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center space-y-2">
          <Trophy className="w-8 h-8 text-zinc-300 mx-auto" />
          <p className="font-display font-bold text-[#09090B]">
            Nessuna partita trovata con questi filtri
          </p>
          <p className="text-sm text-zinc-500">
            Prova a cambiare disciplina, giorno oppure azzera la ricerca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPartite.map((partita) => {
            const isLive = partita.stato === 'live';
            const isFinished = partita.stato === 'conclusa';

            return (
              <article
                key={partita.id}
                className={`rounded-xl border p-5 transition-colors ${
                  isLive
                    ? 'surface-active-orange border-[#FF5500]/50'
                    : 'bg-white border-zinc-200'
                }`}
              >
                {/* Card Top Meta Row */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2 text-xs text-zinc-600 min-w-0">
                    <span className="font-display font-bold text-[#09090B]">
                      {partita.disciplina}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{partita.fase}</span>
                  </div>

                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FF5500] text-white text-[11px] font-display font-extrabold tracking-wider uppercase animate-pulse shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
                      LIVE
                    </span>
                  ) : isFinished ? (
                    <span className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-500 shrink-0">
                      Conclusa
                    </span>
                  ) : (
                    <span className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-600 shrink-0">
                      In Programma
                    </span>
                  )}
                </div>

                {/* Scoreboard Duel */}
                <div className="py-5 grid grid-cols-11 items-center gap-2">
                  <div className="col-span-4 space-y-0.5">
                    <p className="font-display font-extrabold text-sm sm:text-base text-[#09090B] leading-tight break-words">
                      {partita.squadraA}
                    </p>
                    <p className="text-xs font-mono font-semibold text-[#FF5500]">
                      {partita.classeA}
                    </p>
                  </div>

                  <div className="col-span-3 flex items-center justify-center">
                    <div className="bg-[#09090B] text-white rounded-lg px-3 py-2 font-mono text-lg sm:text-xl font-bold tabular-nums tracking-tight whitespace-nowrap">
                      {partita.punteggioA} <span className="text-zinc-500">-</span> {partita.punteggioB}
                    </div>
                  </div>

                  <div className="col-span-4 text-right space-y-0.5">
                    <p className="font-display font-extrabold text-sm sm:text-base text-[#09090B] leading-tight break-words">
                      {partita.squadraB}
                    </p>
                    <p className="text-xs font-mono font-semibold text-[#FF5500]">
                      {partita.classeB}
                    </p>
                  </div>
                </div>

                {/* Bottom Schedule & Field */}
                <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      Giorno {partita.giorno} · {partita.oraInizio}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {partita.campo}
                    </span>
                  </div>
                  {partita.note && (
                    <span className="text-zinc-600 italic truncate max-w-full">
                      {partita.note}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
