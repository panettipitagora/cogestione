import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Lock,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import type { DemoPresetId } from '../types';
import { BrandLogo } from './BrandLogo';
import { Footer } from './Footer';

interface LoginViewProps {
  onGoogleLogin: () => void;
  onSelectDemo: (preset: DemoPresetId) => void;
  authError: string | null;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onGoogleLogin,
  onSelectDemo,
  authError,
  isLoading,
  isFirebaseConfigured,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <BrandLogo />
          <span className="text-xs font-mono text-zinc-500 whitespace-nowrap shrink-0">
            Portale di Lista 1
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Hero Editorial Panel */}
          <section className="lg:col-span-7 hero-encore-gradient rounded-2xl p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-[#FF7A00]">
                <span>Edizione Ufficiale</span>
                <span aria-hidden="true">·</span>
                <span>Lista 1 EN-CORE</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] text-balance">
                Tre Giorni di Cultura e Sport
              </h1>

              <p className="text-zinc-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Il portale di Lista 1 per consultare il programma della tua classe, verificare le convocazioni ai tornei e seguire i risultati in diretta.
              </p>
            </div>
          </section>

          {/* Right Auth & Institutional Box */}
          <section className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-7 sm:p-9 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#09090B]">
                  Accedi al Portale
                </h2>
                <p className="text-sm text-zinc-600">
                  Il sistema riconosce automaticamente il tuo profilo Studente, Docente, Arbitro o Staff al momento dell&apos;accesso.
                </p>
              </div>

              {authError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-900"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-snug">{authError}</p>
                </div>
              )}

              <button
                type="button"
                onClick={onGoogleLogin}
                disabled={isLoading || !isFirebaseConfigured}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-[#09090B] text-white font-display font-bold text-sm hover:bg-[#18181B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5500] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.39 0 3.4 2.66 1.44 6.55l3.66 2.84C6.01 6.72 8.76 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.66-5.02 3.66-8.73z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.1 14.61c-.24-.72-.38-1.49-.38-2.61s.14-1.89.38-2.61L1.44 6.55C.52 8.38 0 10.13 0 12s.52 3.62 1.44 5.45l3.66-2.84z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.76-2.91c-1.08.72-2.45 1.16-4.17 1.16-3.24 0-5.99-1.72-6.9-4.39l-3.66 2.84C3.4 21.34 7.39 24 12 24z"
                  />
                </svg>
                <span>
                  {isLoading ? 'Verifica account in corso...' : 'Accedi con Google Workspace'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#FF5500]" />
              </button>

              {/* Demo Mode Role Selector */}
              <div className="pt-4 border-t border-zinc-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-display font-bold uppercase tracking-wider text-zinc-500">
                    Modalità Demo (Anteprima Ruoli)
                  </p>
                  <span className="text-[11px] font-mono text-zinc-400">Dati precaricati</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectDemo('studente_attivo')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 bg-[#F8FAFC] hover:border-[#FF5500] hover:bg-[#FFF7F2] text-xs font-semibold text-[#09090B] transition-colors cursor-pointer text-left"
                  >
                    <Users className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                    <span className="truncate">Studente (4 ITIA_A)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectDemo('studente_onboarding')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 bg-[#F8FAFC] hover:border-[#FF5500] hover:bg-[#FFF7F2] text-xs font-semibold text-[#09090B] transition-colors cursor-pointer text-left"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                    <span className="truncate">1° Accesso Classe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectDemo('docente')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 bg-[#F8FAFC] hover:border-[#FF5500] hover:bg-[#FFF7F2] text-xs font-semibold text-[#09090B] transition-colors cursor-pointer text-left"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                    <span className="truncate">Docente (47 Classi)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectDemo('arbitro_pallavolo')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 bg-[#F8FAFC] hover:border-[#FF5500] hover:bg-[#FFF7F2] text-xs font-semibold text-[#09090B] transition-colors cursor-pointer text-left"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                    <span className="truncate">Arbitro Tornei</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectDemo('staff_admin')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/30 hover:bg-[#FF5500] hover:text-white text-xs font-display font-bold text-[#FF5500] transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Staff Super-Admin (CMS Completo)</span>
                </button>
              </div>
            </div>

            {/* Institutional Domain Box Highlighted at Bottom */}
            <div className="bg-[#09090B] text-white rounded-xl p-4 space-y-2 border border-zinc-800">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-zinc-400">
                  <Lock className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>Accesso Esclusivo Istituto</span>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#FF5500] text-white">
                  @panettipitagora.edu.it
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                L&apos;accesso è consentito esclusivamente tramite account Google Workspace della scuola con suffisso{' '}
                <strong className="font-mono text-[#FF7A00]">@panettipitagora.edu.it</strong>. Account personali{' '}
                <span className="font-mono text-zinc-400">@gmail.com</span> o di altri domini vengono bloccati automaticamente.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
