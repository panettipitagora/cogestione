import React, { useMemo, useState } from 'react';
import { CalendarDays, Clock, FileText, MapPin, Trophy, Users } from 'lucide-react';
import { GIORNI_EVENTO } from '../data/schoolData';
import type {
  AttivitaClasse,
  ConvocazioneTorneo,
  GiornoEvento,
  PartitaTorneo,
  UserProfile,
} from '../types';
import {
  formatStudentCallupSummary,
  getActivityLiveState,
  getActivityPastelClass,
  sortByStartTime,
} from '../utils/tournamentUtils';
import { LiveScoreboard } from './LiveScoreboard';

interface StudentDashboardProps {
  user: UserProfile;
  attivita: AttivitaClasse[];
  convocazioni: ConvocazioneTorneo[];
  partite: PartitaTorneo[];
  onOpenRegulations: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  attivita,
  convocazioni,
  partite,
  onOpenRegulations,
}) => {
  const [activeTab, setActiveTab] = useState<'classe' | 'tornei'>('classe');
  const [selectedDay, setSelectedDay] = useState<GiornoEvento>(1);

  const classActivities = useMemo(() => {
    const matching = attivita.filter(
      (item) => item.giorno === selectedDay && item.classi.includes(user.classe)
    );
    return sortByStartTime(matching);
  }, [attivita, selectedDay, user.classe]);

  const classCallups = useMemo(() => {
    const matching = convocazioni.filter(
      (item) => item.giorno === selectedDay && item.classe === user.classe
    );
    return sortByStartTime(matching);
  }, [convocazioni, selectedDay, user.classe]);

  return (
    <div className="space-y-6">
      {/* Student Profile Header */}
      <section className="hero-encore-gradient rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="space-y-2.5">
            <p className="text-xs font-display font-bold uppercase tracking-widest text-[#FF7A00]">
              Area Studente · Tre Giorni di Cultura e Sport
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              {user.displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#FF5500] text-white font-mono text-xs font-bold tracking-wide">
                {user.classe}
              </span>
              <span className="text-xs font-mono text-zinc-300">
                {user.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenRegulations}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs sm:text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#FF7A00]" />
              <span>Regolamenti Ufficiali PDF</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Dashboard Tabs */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('classe')}
          className={`inline-flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'classe'
              ? 'bg-[#09090B] text-white'
              : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-[#FF5500] shrink-0" />
          <span>La Mia Classe</span>
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

      {activeTab === 'classe' ? (
        <div className="space-y-6">
          {/* Day Selector */}
          <div className="grid grid-cols-3 gap-3">
            {GIORNI_EVENTO.map((g) => {
              const active = selectedDay === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setSelectedDay(g.value)}
                  className={`p-3.5 sm:p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    active
                      ? 'surface-active-orange border-[#FF5500]'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <p
                    className={`font-display text-sm sm:text-base font-extrabold ${
                      active ? 'text-[#FF5500]' : 'text-[#09090B]'
                    }`}
                  >
                    {g.label}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5 hidden sm:block">
                    {g.dateHint}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Programma della Classe */}
            <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div>
                  <h2 className="font-display text-lg font-extrabold tracking-tight text-[#09090B]">
                    Programma Classe {user.classe}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Attività culturali e didattiche del Giorno {selectedDay}
                  </p>
                </div>
                <span className="font-mono text-xs text-zinc-500 tabular-nums">
                  {classActivities.length} attività
                </span>
              </div>

              {classActivities.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-500">
                  Nessuna attività programmata per la classe {user.classe} nel Giorno {selectedDay}.
                </div>
              ) : (
                <div className="space-y-3">
                  {classActivities.map((act) => {
                    const liveState = getActivityLiveState(act.oraInizio, act.oraFine);
                    const pastelClass = getActivityPastelClass(act.tipoAttivita);
                    return (
                      <article
                        key={act.id}
                        className={`p-4 rounded-xl border border-zinc-100 space-y-2 ${pastelClass || 'bg-white'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#09090B] tabular-nums">
                              <Clock className="w-3.5 h-3.5 text-[#FF5500]" />
                              {act.oraInizio} – {act.oraFine}
                            </span>
                            {act.tipoAttivita && (
                              <span className="text-[11px] font-semibold text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200/80 bg-white/70">
                                {act.tipoAttivita}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[11px] font-display font-bold uppercase tracking-wider ${
                              liveState === 'in_corso'
                                ? 'text-[#FF5500]'
                                : 'text-zinc-500'
                            }`}
                          >
                            {liveState === 'in_corso'
                              ? 'In corso ora'
                              : liveState === 'conclusa'
                              ? 'Terminata'
                              : 'In programma'}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-base text-[#09090B]">
                          {act.titolo}
                        </h3>
                        <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{act.luogo}</span>
                        </p>
                        {act.note && (
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {act.note}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Convocazioni Tornei della Classe */}
            <section className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div>
                  <h2 className="font-display text-lg font-extrabold tracking-tight text-[#09090B]">
                    Convocazioni Tornei ({user.classe})
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Compagni impegnati nei tornei — Giorno {selectedDay}
                  </p>
                </div>
                <Users className="w-4 h-4 text-[#FF5500] shrink-0" />
              </div>

              {classCallups.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-500">
                  Nessuno studente della {user.classe} risulta convocato nei tornei per il Giorno {selectedDay}.
                </div>
              ) : (
                <div className="space-y-3">
                  {classCallups.map((conv) => {
                    const status = getActivityLiveState(conv.oraInizio, conv.oraFine);
                    return (
                      <div
                        key={conv.id}
                        className={`rounded-xl border p-4 space-y-2 ${
                          status === 'in_corso'
                            ? 'surface-active-orange border-[#FF5500]/50'
                            : 'bg-[#F8FAFC] border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-display font-bold text-[#FF5500]">
                            {conv.disciplina} · {conv.squadraNome}
                          </span>
                          <span
                            className={`text-[11px] font-display font-bold uppercase tracking-wider ${
                              status === 'in_corso' ? 'text-[#FF5500]' : 'text-zinc-500'
                            }`}
                          >
                            {status === 'in_corso' ? 'In corso ora' : 'In programma'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#09090B] leading-snug">
                          {formatStudentCallupSummary(conv)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : (
        <LiveScoreboard partite={partite} />
      )}
    </div>
  );
};
