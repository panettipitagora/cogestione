import React, { useState } from 'react';

interface BrandLogoProps {
  logoUrl?: string;
  variant?: 'dark' | 'light';
  showTag?: boolean;
}

/**
 * Spazio predisposto per il Logo ufficiale "Lista 1 Panetti Pitagora"
 * con fallback vettoriale geometrico EN-CORE personalizzabile.
 * Per usare un logo immagine personalizzato, inserisci il file in `/public/logo-lista1.png`
 * oppure passa la prop `logoUrl`.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoUrl = '/logo-lista1.png',
  variant = 'light',
  showTag = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="flex items-center gap-3 shrink-0">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border ${
          variant === 'dark'
            ? 'bg-[#18181B] border-zinc-800'
            : 'bg-[#09090B] border-zinc-900'
        }`}
        aria-label="Logo Piattaforma di Gestione Lista 1 EN-CORE"
      >
        {!imgFailed && logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo Lista 1 EN-CORE"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <svg
            viewBox="0 0 40 40"
            className="w-7 h-7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="34" height="34" rx="7" stroke="#FF5500" strokeWidth="2.5" />
            <path d="M12 28V12H17.5L21 20.5L24.5 12H28V28H24.2V19.2L21 26.5H19L15.8 19.2V28H12Z" fill="#FFFFFF" />
            <circle cx="30" cy="10" r="2.5" fill="#FF5500" />
          </svg>
        )}
      </div>

      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <span
          className={`font-display text-base sm:text-lg font-extrabold tracking-tight ${
            variant === 'dark' ? 'text-white' : 'text-[#09090B]'
          }`}
        >
          Piattaforma di Gestione
        </span>
        {showTag && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-display font-extrabold tracking-wider uppercase bg-[#FF5500] text-white">
            LISTA 1 EN-CORE
          </span>
        )}
      </div>
    </div>
  );
};
