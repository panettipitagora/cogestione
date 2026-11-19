import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Film,
  LogOut,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { ADMIN_WHATSAPP_URL } from '../data/schoolData';
import type { DemoPresetId, ImpostazioniEvento, UserProfile } from '../types';
import { isDemoModeEnabled, sanitizeExternalUrl } from '../utils/eventConfigUtils';
import { BrandLogo, ListaLogoSlot } from './BrandLogo';
import { DemoQuickButtons } from './DemoQuickButtons';
import { Footer } from './Footer';

interface EventStatusScreenProps {
  mode: 0 | 4;
  impostazioni: ImpostazioniEvento;
  currentUser: UserProfile | null;
  onGoogleLogin: () => void;
  onDirectGoogleLogin?: () => void;
  onSelectDemo: (preset: DemoPresetId) => void;
  onLogout: () => void;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  authError: string | null;
}

export const EventStatusScreen: React.FC<EventStatusScreenProps> = ({
  mode,
  impostazioni,
  currentUser,
  onGoogleLogin,
  onDirectGoogleLogin,
  onSelectDemo,
  onLogout,
  isLoading,
  isFirebaseConfigured,
  authError,
}) => {
  const [staffLoginOpen, setStaffLoginOpen] = useState(false);

  const driveUrl = sanitizeExternalUrl(impostazioni.cineforumDriveUrl);
  const demoEnabled = isDemoModeEnabled(impostazioni.demoAbilitate);
  const isAssemblea = mode === 4;

  const renderStaffAccessCard = () => (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-center shadow-lg">
      {authError && (
        <p role="alert" className="text-xs font-semibold text-red-600 text-left">
          {authError}
        </p>
      )}
      <button
        type="button"
        onClick={onDirectGoogleLogin ?? onGoogleLogin}
        disabled={isLoading || !isFirebaseConfigured}
        className="w-full min-h-[48px] flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#09090B] text-white font-display font-bold text-sm hover:bg-[#18181B] disabled:opacity-50 transition-colors cursor-pointer"
      >
        <span>{isLoading ? 'Verifica...' : 'Accedi con Google'}</span>
        <ArrowRight className="w-4 h-4 text-[#FF5500]" />
      </button>

      {onDirectGoogleLogin && (
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoading || !isFirebaseConfigured}
          className="inline-block text-[11px] font-medium text-zinc-500 hover:text-[#09090B] underline underline-offset-2 disabled:opacity-50 transition-colors cursor-pointer py-0.5"
        >
          In caso di malfunzionamento clicca qui
        </button>
      )}

      {demoEnabled && <DemoQuickButtons onSelectDemo={onSelectDemo} />}
    </div>
  );

  // Mode 0: Full-screen gradient Stay Tuned (no boxed card, no Cineforum button, small "Accesso Staff")
  if (!isAssemblea) {
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

            {/* Animated 3 dots */}
            <div
              className="flex items-center justify-center gap-2.5 py-1"
              aria-hidden="true"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] stay-tuned-dot-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] stay-tuned-dot-2" />
              <span className="w-2.5 h-2.5 rounded-full bg-white stay-tuned-dot-3" />
            </div>

            <p className="text-sm sm:text-lg font-medium text-zinc-200 max-w-lg mx-auto leading-relaxed">
              Stiamo preparando programmi, tornei e attività. A breve tutte le classi e i tabelloni saranno online.
            </p>
          </div>
        </main>

        <footer className="w-full max-w-sm mx-auto pt-6 flex flex-col items-center gap-3 text-center">
          {!currentUser ? (
            <>
              <button
                type="button"
                onClick={() => setStaffLoginOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-[11px] font-display font-semibold text-zinc-300/80 hover:text-white transition-colors cursor-pointer py-1 px-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>Accesso Staff</span>
                {staffLoginOpen ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {staffLoginOpen && <div className="w-full">{renderStaffAccessCard()}</div>}
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Esci</span>
              </button>
              <a
                href={ADMIN_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>Contatta l&apos;Admin</span>
              </a>
            </div>
          )}

          <p className="text-[11px] text-zinc-400/80">
            Portale Lista 1 EN-CORE · Rappresentanti d&apos;Istituto
          </p>
        </footer>
      </div>
    );
  }

  // Mode 4: Assemblea di Istituto Today (card layout + Cineforum in Classe + small Accesso Staff)
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F8FAFC]">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <BrandLogo />
          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs sm:text-sm font-semibold text-[#09090B] hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Esci</span>
              </button>
            ) : (
              <span className="hidden sm:inline-block text-xs font-mono text-zinc-500 whitespace-nowrap shrink-0">
                Portale di Lista 1
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center gap-6">
        <section className="w-full hero-encore-gradient rounded-3xl p-7 sm:p-12 text-white text-center space-y-6">
          <div className="flex justify-center">
            <ListaLogoSlot />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-display font-bold uppercase tracking-widest text-[#FF7A00]">
            <span>Lista 1 EN-CORE · Cogestione Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-balance">
              Assemblea di Istituto Today
            </h1>

            <div
              className="flex items-center justify-center gap-2 py-1"
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
                      Apri l&apos;archivio film su Google Drive (accesso libero)
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
        </section>

        {!currentUser && (
          <section className="w-full max-w-sm text-center space-y-2">
            <button
              type="button"
              onClick={() => setStaffLoginOpen((prev) => !prev)}
              className="inline-flex items-center justify-center gap-1.5 text-[11px] font-display font-semibold text-zinc-500 hover:text-[#09090B] transition-colors cursor-pointer py-1 px-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Accesso Staff</span>
              {staffLoginOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {staffLoginOpen && renderStaffAccessCard()}
          </section>
        )}
      </main>

      <Footer showAdminContact={Boolean(currentUser)} />
    </div>
  );
};
