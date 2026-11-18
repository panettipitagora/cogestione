import React from 'react';
import { AlertCircle, Megaphone } from 'lucide-react';
import type { ImpostazioniEvento } from '../types';

interface UrgentBannerProps {
  impostazioni: ImpostazioniEvento;
}

export const UrgentBanner: React.FC<UrgentBannerProps> = ({ impostazioni }) => {
  if (!impostazioni.bannerAttivo || (!impostazioni.bannerTitolo && !impostazioni.bannerTesto)) {
    return null;
  }

  const isUrgent = impostazioni.bannerLivello === 'urgente';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`border-b ${
        isUrgent
          ? 'bg-[#09090B] text-white border-[#FF5500]/40'
          : 'bg-white text-[#09090B] border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-start sm:items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-display font-bold uppercase tracking-wider shrink-0 ${
            isUrgent ? 'bg-[#FF5500] text-white' : 'bg-zinc-900 text-white'
          }`}
        >
          {isUrgent ? <AlertCircle className="w-3.5 h-3.5" /> : <Megaphone className="w-3.5 h-3.5" />}
          {isUrgent ? 'Avviso Live' : 'Comunicazione'}
        </span>
        <p className="text-xs sm:text-sm leading-snug">
          {impostazioni.bannerTitolo && (
            <strong className="font-display font-bold mr-1.5">
              {impostazioni.bannerTitolo}:
            </strong>
          )}
          <span className={isUrgent ? 'text-zinc-200' : 'text-zinc-600'}>
            {impostazioni.bannerTesto}
          </span>
        </p>
      </div>
    </div>
  );
};
