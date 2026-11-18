import React from 'react';
import { RAPPRESENTANTI_ISTITUTO } from '../data/schoolData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#09090B] text-zinc-300 border-t border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="pb-5 border-b border-zinc-800">
          <p className="font-display text-sm sm:text-base font-extrabold tracking-tight text-white">
            Lista 1 EN-CORE <span className="text-[#FF5500]">•</span> Panetti Pitagora — Tre Giorni di Cultura e Sport
          </p>
        </div>

        <div className="pt-5">
          <p className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Rappresentanti d&apos;Istituto
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {RAPPRESENTANTI_ISTITUTO.map((rep) => (
              <div
                key={rep.email}
                className="bg-[#18181B] border border-zinc-800 rounded-lg px-3.5 py-2.5 flex flex-col gap-0.5"
              >
                <span className="font-semibold text-white">
                  {rep.name}
                  {rep.role === 'Moderatore Software' && (
                    <span className="text-[#FF5500] font-normal"> · {rep.role}</span>
                  )}
                </span>
                <a
                  href={`mailto:${rep.email}`}
                  className="text-zinc-400 hover:text-[#FF7A00] transition-colors truncate"
                >
                  {rep.email}
                </a>
                {rep.phone && (
                  <span className="text-zinc-400 font-mono tabular-nums">
                    Tel: {rep.phone}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
