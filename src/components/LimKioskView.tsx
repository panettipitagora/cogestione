import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Film,
  MapPin,
  Monitor,
  Trophy,
  Users,
} from 'lucide-react';
import {
  GIORNI_EVENTO,
  getClassesForSede,
  getSedeForClasse,
} from '../data/schoolData';
import type {
  AttivitaClasse,
  ConvocazioneTorneo,
  GiornoEvento,
  ImpostazioniEvento,
  PartitaTorneo,
  SedeIstituto,
  StatoEvento,
} from '../types';
import {
  resolveActiveEventDay,
  resolveStatoEvento,
  sanitizeExternalUrl,
} from '../utils/eventConfigUtils';
import { formatLimClassSlug } from '../utils/limRouteUtils';
import {
  formatStudentCallupSummary,
  getActivityLiveState,
  getActivityPastelClass,
  sortByStartTime,
} from '../utils/tournamentUtils';
import { ListaLogoSlot } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { UrgentBanner } from './UrgentBanner';

interface LimKioskViewProps {
  limClass: string | null;
  impostazioni: ImpostazioniEvento;
  attivita: AttivitaClasse[];
  convocazioni: ConvocazioneTorneo[];
  partite: PartitaTorneo[];
  onSelectLimClass: (classe: string) => void;
}

export const LimKioskView: React.FC<LimKioskViewProps> = ({
  limClass,
  impostazioni,
  attivita,
  convocazioni,
  partite,
  onSelectLimClass,
}) => {
  const [setupSede, setSetupSede] = useState<SedeIstituto>('Panetti');

  const statoEvento: StatoEvento = resolveStatoEvento(impostazioni.giornoEvento);
  const activeEventDay: GiornoEvento = resolveActiveEventDay(statoEvento);
  const [selectedDay, setSelectedDay] = useState<GiornoEvento>(activeEventDay);

  useEffect(() => {
    setSelectedDay(activeEventDay);
  }, [activeEventDay]);

  const driveUrl = sanitizeExternalUrl(impostazioni.cineforumDriveUrl);

  const setupClasses = useMemo(
    () => getClassesForSede(setupSede),
    [setupSede]
  );

  const classActivities = useMemo(() => {
    if (!limClass) return [];
    return sortByStartTime(
      attivita.filter(
        (item) => item.giorno === selectedDay && item.classi.includes(limClass)
      )
    );
  }, [attivita, selectedDay, limClass]);

  const classCallups = useMemo(() => {
    if (!limClass) return [];
    return sortByStartTime(
      convocazioni.filter(
        (item) => item.giorno === selectedDay && item.classe === limClass
      )
    );
  }, [convocazioni, selectedDay, limClass]);

  const classMatches = useMemo(() => {
    if (!limClass) return [];
    return sortByStartTime(
      partite.filter(
        (p) =>
          p.giorno === selectedDay &&
          (p.classeA === limClass || p.classeB === limClass)
      )
    );
  }, [partite, selectedDay, limClass]);

  // Step 1: Configurator (/cogestione/staff) when no class is selected yet
  if (!limClass) {
    return (
      <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          <section className="hero-encore-gradient rounded-2xl p-6 sm:p-8 text-white space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <ListaLogoSlot />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FF5500] text-white text-[11px] font-display font-extrabold tracking-wider uppercase">
                <Monitor className="w-3.5 h-3.5" />
                <span>LISTA 1 EN-CORE · SETUP LIM</span>
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
                Tre Giorni di Cultura e Sport
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                Seleziona la classe di quest&apos;aula per bloccare la schermata LIM senza login. Una volta aperta la pagina della classe (es.{' '}
                <span className="font-mono text-[#FF7A00]">/staff/1G</span>), aggiungi la pagina alla schermata Home o al Desktop della LIM.
              </p>
            </div>
          </section>

          <section className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-100">
              <div>
                <h2 className="font-display text-lg font-extrabold text-[#09090B]">
                  1. Scegli Sede e Classe Permanente
                </h2>
                <p className="text-xs text-zinc-500">
                  La LIM mostrerà esclusivamente programmi, convocazioni e Cineforum per la classe scelta.
                </p>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-zinc-100 border border-zinc-200 self-start sm:self-auto">
                {(['Panetti', 'Pitagora'] as SedeIstituto[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSetupSede(s)}
                    className={`px-4 py-2 rounded-lg text-xs font-display font-bold transition-colors cursor-pointer ${
                      setupSede === s
                        ? 'bg-[#09090B] text-white'
                        : 'text-zinc-600 hover:text-[#09090B]'
                    }`}
                  >
                    Sede {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
              {setupClasses.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onSelectLimClass(cls)}
                  className="min-h-[54px] px-3 py-2.5 rounded-xl border border-zinc-200 bg-[#F8FAFC] hover:border-[#FF5500] hover:bg-[#FFF7F2] text-center transition-colors cursor-pointer group"
                >
                  <span className="block font-display font-extrabold text-sm sm:text-base text-[#09090B] group-hover:text-[#FF5500]">
                    {cls}
                  </span>
                  <span className="block font-mono text-[10px] text-zinc-400 group-hover:text-zinc-600 truncate">
                    /staff/{formatLimClassSlug(cls)}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-zinc-600 space-y-0.5">
                <p className="font-display font-bold text-[#09090B]">
                  2. Come salvare la scorciatoia permanente sulla LIM
                </p>
                <p>
                  Dopo aver toccato la classe, usa{' '}
                  <strong>Menu Browser → Aggiungi alla schermata Home / Crea scorciatoia</strong>: si aprirà sempre direttamente su quella classe senza barre o login.
                </p>
              </div>
              <PWAInstallButton compact label="Salva sulla Home" />
            </div>
          </section>
        </div>
      </div>
    );
  }

  const classSede = getSedeForClasse(limClass);

  // Respect State 0 (Stay Tuned) on all LIM screens too
  if (statoEvento === 0) {
    return (
      <div className="min-h-[100dvh] w-full hero-encore-gradient text-white flex flex-col justify-between px-5 sm:px-8 py-8 sm:py-10">
        <div className="h-4" aria-hidden="true" />
        <main className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full space-y-6">
          <div className="flex justify-center">
            <ListaLogoSlot />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-display font-bold uppercase tracking-widest text-[#FF7A00]">
            <span>Lista 1 EN-CORE · Cogestione Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-balance">
              Stay Tuned
            </h1>

            <div
              className="flex items-center justify-center gap-2.5 py-1"
              aria-hidden="true"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] stay-tuned-dot-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] stay-tuned-dot-2" />
              <span className="w-2.5 h-2.5 rounded-full bg-white stay-tuned-dot-3" />
            </div>

            <p className="text-sm sm:text-lg font-medium text-zinc-200 max-w-lg mx-auto leading-relaxed">
              Stiamo preparando programmi, tornei e attività. A breve il programma della classe{' '}
              <strong className="font-mono text-[#FF7A00]">{limClass}</strong> sarà online.
            </p>
          </div>
        </main>
        <div className="text-center text-[11px] font-mono text-zinc-400/80">
          Classe {limClass} · Lista 1 EN-CORE
        </div>
      </div>
    );
  }

  // Respect State 4 (Assemblea Today) on LIM screens too, with Cineforum CTA
  if (statoEvento === 4) {
    return (
      <div className="min-h-[100dvh] w-full hero-encore-gradient text-white flex flex-col justify-center px-5 sm:px-8 py-10">
        <main className="max-w-2xl mx-auto w-full text-center space-y-6">
          <div className="flex justify-center">
            <ListaLogoSlot />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-display font-bold uppercase tracking-widest text-[#FF7A00]">
            <span>Lista 1 EN-CORE · Classe {limClass}</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-balance">
              Assemblea di Istituto Today
            </h1>

            <div
              className="flex items-center justify-center gap-2.5 py-1"
              aria-hidden="true"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] stay-tuned-dot-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] stay-tuned-dot-2" />
              <span className="w-2.5 h-2.5 rounded-full bg-white stay-tuned-dot-3" />
            </div>

            <p className="text-base sm:text-xl font-medium text-zinc-200 max-w-xl mx-auto leading-relaxed">
              Da domani partono le vacanze!
            </p>
          </div>

          <div className="pt-2 max-w-md mx-auto w-full">
            {driveUrl ? (
              <a
                href={driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[60px] px-6 py-4 rounded-2xl bg-[#FF5500] hover:bg-[#FF7A00] text-white font-display font-extrabold text-base sm:text-lg flex items-center justify-between gap-3 transition-colors shadow-sm"
              >
                <span className="inline-flex items-center gap-3 text-left">
                  <Film className="w-6 h-6 shrink-0" />
                  <span>
                    <span className="block leading-tight">Cineforum in Classe</span>
                    <span className="block text-[11px] font-sans font-medium text-white/90">
                      Apri i film su Google Drive — accessibile senza accesso
                    </span>
                  </span>
                </span>
                <ExternalLink className="w-5 h-5 shrink-0" />
              </a>
            ) : (
              <div className="w-full min-h-[56px] px-5 py-3.5 rounded-2xl bg-white/10 border border-white/15 text-zinc-300 text-sm flex items-center justify-center gap-2">
                <Film className="w-4 h-4 text-[#FF7A00]" />
                <span>Cineforum in Classe — link Google Drive in aggiornamento</span>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Active Days (1, 2, 3): Clean, bar-free LIM Class View strictly locked to `limClass`
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F8FAFC]">
      <UrgentBanner impostazioni={impostazioni} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
        {/* Clean LIM Hero Card (No navbar above, No switcher, Lista 1 Style) */}
        <section className="hero-encore-gradient rounded-2xl p-6 sm:p-8 text-white space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <ListaLogoSlot />
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#FF5500] text-white font-display text-xs font-extrabold tracking-wider uppercase">
                  LISTA 1 EN-CORE
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/15 border border-white/20 text-white font-display text-xs font-extrabold tracking-wider uppercase">
                  Sede {classSede}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-white text-[#09090B] font-mono text-xs sm:text-sm font-extrabold tracking-wide">
                  Classe {limClass}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-balance">
                Tre Giorni di Cultura e Sport
              </h1>
            </div>

            {/* Cineforum in Classe directly accessible from LIM */}
            <div className="lg:min-w-[320px] xl:min-w-[360px]">
              {driveUrl ? (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[60px] px-5 py-3.5 rounded-2xl bg-[#FF5500] hover:bg-[#FF7A00] text-white font-display font-extrabold text-base flex items-center justify-between gap-3 transition-colors"
                >
                  <span className="inline-flex items-center gap-3 text-left min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                      <Film className="w-5 h-5 text-white" />
                    </span>
                    <span className="min-w-0">
                      <span className="block leading-tight">Cineforum in Classe</span>
                      <span className="block text-[11px] font-sans font-medium text-white/90 mt-0.5">
                        Apri i film su Google Drive
                      </span>
                    </span>
                  </span>
                  <ExternalLink className="w-5 h-5 shrink-0" />
                </a>
              ) : (
                <div className="w-full min-h-[54px] px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-zinc-200 text-xs flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-[#FF7A00] shrink-0" />
                  <span>Cineforum in Classe — cartella Google Drive in fase di pubblicazione</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Event Day Selector */}
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

        {/* Two-column Classroom Board strictly locked to `limClass` */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Programma Orario della Classe */}
          <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 text-[#FF5500] shrink-0" />
                <div>
                  <h2 className="font-display text-lg font-extrabold tracking-tight text-[#09090B]">
                    Programma Classe {limClass}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Attività del Giorno {selectedDay}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-zinc-500 tabular-nums shrink-0 whitespace-nowrap">
                {classActivities.length} attività
              </span>
            </div>

            {classActivities.length === 0 ? (
              <div className="py-10 text-center text-sm text-zinc-500">
                Nessuna attività programmata per la classe {limClass} nel Giorno {selectedDay}.
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
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-[#09090B] tabular-nums">
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
                      <h3 className="font-display font-bold text-base sm:text-lg text-[#09090B]">
                        {act.titolo}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{act.luogo}</span>
                      </p>
                      {act.note && (
                        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                          {act.note}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Convocazioni & Tornei della Classe */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div>
                  <h2 className="font-display text-lg font-extrabold tracking-tight text-[#09090B]">
                    Convocazioni Tornei ({limClass})
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Alunni giustificati nei tornei — Giorno {selectedDay}
                  </p>
                </div>
                <Users className="w-4 h-4 text-[#FF5500] shrink-0" />
              </div>

              {classCallups.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-500">
                  Nessuno studente della {limClass} convocato nei tornei per il Giorno {selectedDay}.
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

            {classMatches.length > 0 && (
              <section className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                  <div>
                    <h2 className="font-display text-base font-extrabold tracking-tight text-[#09090B]">
                      Partite della Classe {limClass}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Giorno {selectedDay}
                    </p>
                  </div>
                  <Trophy className="w-4 h-4 text-[#FF5500] shrink-0" />
                </div>

                <div className="space-y-2.5">
                  {classMatches.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-xl border border-zinc-200 bg-[#F8FAFC] p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                        <span className="font-bold text-[#FF5500]">
                          {m.disciplina} · {m.fase}
                        </span>
                        <span className="text-zinc-500">
                          {m.oraInizio} · {m.campo}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm font-display font-bold text-[#09090B]">
                        <span className="truncate">
                          {m.squadraA} ({m.classeA})
                        </span>
                        <span className="font-mono px-2 py-0.5 rounded bg-[#09090B] text-white text-xs shrink-0 tabular-nums">
                          {m.punteggioA} - {m.punteggioB}
                        </span>
                        <span className="truncate text-right">
                          {m.squadraB} ({m.classeB})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
