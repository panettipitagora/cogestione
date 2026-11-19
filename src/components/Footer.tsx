import React from 'react';
import { MessageCircle } from 'lucide-react';
import { ADMIN_WHATSAPP_URL, RAPPRESENTANTI_ISTITUTO } from '../data/schoolData';

interface FooterProps {
  showAdminContact?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ showAdminContact = false }) => {
  return (
    <footer className="bg-[#09090B] text-zinc-300 border-t border-zinc-800 mt-auto pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="pb-5 border-b border-zinc-800 space-y-1.5">
          <p className="font-display text-sm sm:text-base font-extrabold tracking-tight text-white">
            Lista 1 EN-CORE <span className="text-[#FF5500]">•</span> Panetti Pitagora — Tre Giorni di Cultura e Sport
          </p>
          <p className="text-xs text-zinc-400">
            Pagina non costruita da personale scolastico, ma interamente proprietaria e gestita dai Rappresentanti d&apos;Istituto.
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
                <span className="font-semibold text-white">{rep.name}</span>
                <a
                  href={`mailto:${rep.email}`}
                  className="text-zinc-400 hover:text-[#FF7A00] transition-colors truncate"
                >
                  {rep.email}
                </a>
              </div>
            ))}
          </div>
        </div>

        {showAdminContact && (
          <div className="pt-5 mt-5 border-t border-zinc-800/80 flex justify-center sm:justify-start">
            <a
              href={ADMIN_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Contatta l&apos;Admin</span>
            </a>
          </div>
        )}
      </div>
    </footer>
  );
};
