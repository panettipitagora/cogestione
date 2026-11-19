import React from 'react';
import { FileText, Gavel, LogOut, ShieldCheck, LayoutDashboard } from 'lucide-react';
import type { ActiveView, UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  user: UserProfile;
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  onOpenRegulations: () => void;
  onLogout: () => void;
  isDemoMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  onChangeView,
  onOpenRegulations,
  onLogout,
  isDemoMode,
}) => {
  const hasArbitro = user.arbitroTornei.length > 0;
  const hasStaff = user.isStaff;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Brand + Logo */}
        <BrandLogo />

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeView('dashboard')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-[#09090B] text-white'
                : 'text-zinc-600 hover:text-[#09090B] hover:bg-zinc-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{user.role === 'docente' ? 'Area Docenti' : 'Dashboard'}</span>
          </button>

          {hasArbitro && (
            <button
              type="button"
              onClick={() => onChangeView('arbitro')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'arbitro'
                  ? 'bg-[#FF5500] text-white'
                  : 'bg-[#FF5500]/10 text-[#FF5500] hover:bg-[#FF5500] hover:text-white'
              }`}
            >
              <Gavel className="w-4 h-4" />
              <span>Console Arbitro</span>
            </button>
          )}

          {hasStaff && (
            <button
              type="button"
              onClick={() => onChangeView('staff')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'staff'
                  ? 'bg-[#09090B] text-[#FF7A00] ring-1 ring-[#FF5500]'
                  : 'text-zinc-700 hover:text-[#09090B] hover:bg-zinc-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
              <span>Console Staff</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenRegulations}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-600 hover:text-[#09090B] hover:bg-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Regolamenti PDF</span>
          </button>
        </nav>

        {/* Zone 3: User Action */}
        <div className="flex items-center gap-2 shrink-0">
          {isDemoMode && (
            <span className="hidden lg:inline-block text-xs font-mono text-zinc-500 whitespace-nowrap">
              Anteprima Demo
            </span>
          )}
          <button
            type="button"
            onClick={onLogout}
            aria-label="Esci dall'account"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border border-zinc-200 bg-white text-xs sm:text-sm font-semibold text-[#09090B] hover:bg-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Esci</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Role Bar */}
      {(hasArbitro || hasStaff) && (
        <nav
          aria-label="Navigazione rapida ruoli"
          className="md:hidden border-t border-zinc-100 px-4 py-1.5 flex items-center gap-2 overflow-x-auto bg-white"
        >
          <button
            type="button"
            onClick={() => onChangeView('dashboard')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'dashboard' ? 'bg-[#09090B] text-white' : 'bg-zinc-100 text-zinc-700'
            }`}
          >
            {user.role === 'docente' ? 'Area Docenti' : 'Dashboard'}
          </button>
          {hasArbitro && (
            <button
              type="button"
              onClick={() => onChangeView('arbitro')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'arbitro' ? 'bg-[#FF5500] text-white' : 'bg-[#FF5500]/10 text-[#FF5500]'
              }`}
            >
              Console Arbitro
            </button>
          )}
          {hasStaff && (
            <button
              type="button"
              onClick={() => onChangeView('staff')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'staff' ? 'bg-[#09090B] text-[#FF7A00]' : 'bg-zinc-100 text-zinc-800'
              }`}
            >
              Console Staff
            </button>
          )}
        </nav>
      )}
    </header>
  );
};
