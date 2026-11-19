import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Search,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { CLASSI_ISTITUTO, GIORNI_EVENTO, getClassesForSede } from '../data/schoolData';
import type {
  AttivitaClasse,
  ConvocazioneTorneo,
  GiornoEvento,
  PartitaTorneo,
  UserProfile,
} from '../types';
import {
  formatTeacherRollCall,
  getActivityPastelClass,
  groupClassesByYear,
  sortByStartTime,
} from '../utils/tournamentUtils';
import { LiveScoreboard } from './LiveScoreboard';

interface TeacherDashboardProps {
  user: UserProfile;
  attivita: AttivitaClasse[];
  convocazioni: ConvocazioneTorneo[];
  partite: PartitaTorneo[];
  defaultDay?: GiornoEvento;
  onChangeSede?: (sede: 'Panetti' | 'Pitagora') => Promise<void>;
  onOpenRegulations: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  attivita,
  convocazioni,
  partite,
  defaultDay = 1,
  onChangeSede,
  onOpenRegulations,
}) => {
  const [activeTab, setActiveTab] = useState<'classi' | 'tornei'>('classi');
  const [yearFilter, setYearFilter] = useState<'Tutte' | number>('Tutte');
  const [searchClass, setSearchClass] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [detailDay, setDetailDay] = useState<GiornoEvento>(defaultDay);

  React.useEffect(() => {
    setDetailDay(defaultDay);
  }, [defaultDay]);

  const sedeClasses = useMemo(
    () => (user.sede ? getClassesForSede(user.sede) : CLASSI_ISTITUTO),
    [user.sede]
  );

  const yearGroups = useMemo(() => groupClassesByYear(sedeClasses), [sedeClasses]);

  const filteredClasses = useMemo(() => {
    const q = searchClass.trim().toLowerCase();
    return sedeClasses.filter((cls) => {
      if (yearFilter !== 'Tutte' && !cls.startsWith(String(yearFilter))) return false;
      if (q && !cls.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sedeClasses, yearFilter, searchClass]);

  const classDetailData = useMemo(() => {
    if (!selectedClass) return null;
    const dayActivities = sortByStartTime(
      attivita.filter(
        (a) => a.giorno === detailDay && a.classi.includes(selectedClass)
      )
    );
    const dayCallups = sortByStartTime(
      convocazioni.filter(
        (c) => c.giorno === detailDay && c.classe === selectedClass
      )
    );
    return { dayActivities, dayCallups };
  }, [selectedClass, detailDay, attivita, convocazioni]);

  return (
    <div className="space-y-6">
      {/* Teacher Profile Header */}
      <section className="hero-encore-gradient rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="space-y-2.5">
            <p className="text-xs font-display font-bold uppercase tracking-widest text-[#FF7A00]">
              Portale Docenti · Monitoraggio Classi e Appello Tornei
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              {user.displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#FF5500] text-white font-display text-xs font-extrabold tracking-wider uppercase">
                DOCENTE
              </span>
              {onChangeSede ? (
                <div
                  role="group"
                  aria-label="Seleziona sede istituto"
                  className="inline-flex items-center gap-1 p-1 rounded-lg bg-white/10 border border-white/20"
                >
                  {(['Panetti', 'Pitagora'] as const).map((sedeOpt) => {
                    const active = user.sede === sedeOpt;
                    return (
                      <button
                        key={sedeOpt}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setYearFilter('Tutte');
                          setSelectedClass(null);
                          void onChangeSede(sedeOpt);
                        }}
                        className={`px-2.5 py-1 rounded-md font-display text-xs font-extrabold tracking-wider uppercase transition-colors cursor-pointer ${
                          active
                            ? 'bg-white text-[#09090B]'
                            : 'text-zinc-200 hover:bg-white/10'
                        }`}
                      >
                        Sede {sedeOpt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                user.sede && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-white/15 border border-white/20 text-white font-display text-xs font-extrabold tracking-wider uppercase">
                    SEDE {user.sede}
                  </span>
                )
              )}
              <span className="text-xs font-mono text-zinc-300">{user.email}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenRegulations}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs sm:text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#FF7A00]" />
            <span>Regolamenti Ufficiali PDF</span>
          </button>
        </div>
      </section>

      {/* Main Tabs */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('classi')}
          className={`inline-flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'classi'
              ? 'bg-[#09090B] text-white'
              : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#FF5500] shrink-0" />
          <span>
            {user.sede
              ? `Classi Sede ${user.sede} (${sedeClasses.length})`
              : `Tutte le Classi (${sedeClasses.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tornei')}
          className={`inline-flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'tornei'
              ? 'bg-[#09090B] text-white'
              : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#FF5500] shrink-0" />
          <span className="truncate">Risultati Real-Time Tornei</span>
        </button>
      </div>

      {activeTab === 'classi' ? (
        <div className="space-y-5">
          {/* Year Filters + Class Search */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setYearFilter('Tutte')}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-colors cursor-pointer ${
                  yearFilter === 'Tutte'
                    ? 'bg-[#09090B] text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                Tutte ({sedeClasses.length})
              </button>
              {yearGroups.map((g) => (
                <button
                  key={g.year}
                  type="button"
                  onClick={() => setYearFilter(g.year)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-colors cursor-pointer ${
                    yearFilter === g.year
                      ? 'bg-[#FF5500] text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[230px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <label htmlFor="teacher-class-search" className="sr-only">
                Cerca classe
              </label>
              <input
                id="teacher-class-search"
                type="search"
                value={searchClass}
                onChange={(e) => setSearchClass(e.target.value)}
                placeholder={user.sede === 'Pitagora' ? 'Cerca classe (es. 4 ITCA_A)...' : 'Cerca classe (es. 4 ITIA_A)...'}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-sm text-[#09090B] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
              />
            </div>
          </div>

          {/* Sede Classes Interactive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredClasses.map((cls) => {
              const callupsCount = convocazioni.filter((c) => c.classe === cls).length;
              const activitiesCount = attivita.filter((a) => a.classi.includes(cls)).length;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className="group bg-white border border-zinc-200 hover:border-[#FF5500] rounded-xl p-4 text-left transition-colors flex flex-col justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-display font-extrabold text-sm text-[#09090B] group-hover:text-[#FF5500] transition-colors">
                      {cls}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[#FF5500] transition-colors shrink-0" />
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono tabular-nums space-y-0.5">
                    <p>{activitiesCount} attività</p>
                    <p className={callupsCount > 0 ? 'text-[#FF5500] font-semibold' : ''}>
                      {callupsCount} convocati tornei
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <LiveScoreboard partite={partite} sedeFilter={user.sede} defaultDay={defaultDay} />
      )}

      {/* Class Detail Modal */}
      {selectedClass && classDetailData && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="class-detail-title"
        >
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-xl">
            <div className="bg-[#09090B] text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
              <div>
                <p className="text-xs font-display font-bold uppercase tracking-wider text-[#FF7A00]">
                  Scheda Classe & Giustificazioni Appello
                </p>
                <h2 id="class-detail-title" className="font-display text-xl font-extrabold tracking-tight">
                  Classe {selectedClass}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                aria-label="Chiudi dettaglio classe"
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 bg-[#F8FAFC] border-b border-zinc-200 flex items-center gap-2 shrink-0">
              {GIORNI_EVENTO.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setDetailDay(g.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-bold transition-colors cursor-pointer ${
                    detailDay === g.value
                      ? 'bg-[#FF5500] text-white'
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Tournament Roll-Call Justifications */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF5500]" />
                  <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-[#09090B]">
                    Alunni Impegnati nei Tornei (Giorno {detailDay})
                  </h3>
                </div>

                {classDetailData.dayCallups.length === 0 ? (
                  <p className="text-sm text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                    Nessun alunno della {selectedClass} risulta impegnato nei tornei per il Giorno {detailDay}.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {classDetailData.dayCallups.map((conv) => (
                      <div
                        key={conv.id}
                        className="surface-active-orange border border-[#FF5500]/30 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <p className="text-sm font-semibold text-[#09090B]">
                          {formatTeacherRollCall(conv)}
                        </p>
                        <span className="text-xs font-mono text-zinc-600 shrink-0">
                          {conv.squadraNome} · {conv.campo}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Class Schedule */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#09090B]" />
                  <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-[#09090B]">
                    Programma Orario della Classe (Giorno {detailDay})
                  </h3>
                </div>

                {classDetailData.dayActivities.length === 0 ? (
                  <p className="text-sm text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                    Nessuna attività inserita per questa classe nel Giorno {detailDay}.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {classDetailData.dayActivities.map((act) => {
                      const pastelClass = getActivityPastelClass(act.tipoAttivita);
                      return (
                        <div
                          key={act.id}
                          className={`p-3.5 rounded-xl border border-zinc-200 space-y-1 ${pastelClass || 'bg-white'}`}
                        >
                          <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#FF5500] font-bold tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {act.oraInizio} – {act.oraFine}
                            </span>
                            <span className="text-zinc-500 font-sans font-medium inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {act.luogo}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-display font-bold text-sm text-[#09090B]">
                              {act.titolo}
                            </p>
                            {act.tipoAttivita && (
                              <span className="text-[11px] font-semibold text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200/80 bg-white/70">
                                {act.tipoAttivita}
                              </span>
                            )}
                          </div>
                          {act.note && (
                            <p className="text-xs text-zinc-500">{act.note}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
