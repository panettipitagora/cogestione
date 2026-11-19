import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Film,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
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
        {/* Main Editorial Status Hero Card (State 0 or State 4) */}
        <section className="w-full hero-encore-gradient rounded-3xl p-7 sm:p-12 text-white text-center space-y-6">
          <div className="flex justify-center">
            <ListaLogoSlot />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-display font-bold uppercase tracking-widest text-[#FF7A00]">
            <span>Lista 1 EN-CORE · Cogestione Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-balance">
              {isAssemblea ? 'Assemblea di Istituto Today' : 'Stay Tuned'}
            </h1>

            {/* Animated 3 dots */}
            <div
              className="flex items-center justify-center gap-2 py-1"
              aria-hidden="true"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] stay-tuned-dot-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] stay-tuned-dot-2" />
              <span className="w-2.5 h-2.5 rounded-full bg-white stay-tuned-dot-3" />
            </div>

            <p className="text-base sm:text-xl font-medium text-zinc-200 max-w-xl mx-auto leading-relaxed">
              {isAssemblea
                ? 'Da domani partono le vacanze!'
                : 'Stiamo caricando programmi, tornei e attività. A breve tutte le classi e i tabelloni saranno online.'}
            </p>
          </div>

          {/* Big Cineforum in Classe Button (No Login Required) */}
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

        {/* Discreet Staff / Demo Access Box when logged out */}
        {!currentUser && (
          <section className="w-full max-w-md">
            <button
              type="button"
              onClick={() => setStaffLoginOpen((prev) => !prev)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-display font-bold text-zinc-600 flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
                <span>Accesso Staff / Organizzatori</span>
              </span>
              {staffLoginOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {staffLoginOpen && (
              <div className="mt-2 bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
                {authError && (
                  <p role="alert" className="text-xs font-semibold text-red-600">
                    {authError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={isLoading || !isFirebaseConfigured}
                  className="w-full min-h-[48px] flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#09090B] text-white font-display font-bold text-sm hover:bg-[#18181B] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <span>{isLoading ? 'Verifica...' : 'Accedi con Google'}</span>
                  <ArrowRight className="w-4 h-4 text-[#FF5500]" />
                </button>

                {demoEnabled && <DemoQuickButtons onSelectDemo={onSelectDemo} />}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer showAdminContact={Boolean(currentUser)} />
    </div>
  );
};
