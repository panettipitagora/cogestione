import React, { useState } from 'react';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  showTag?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  showTag = true,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
      <span
        className={`font-display text-sm sm:text-lg font-extrabold tracking-tight truncate ${
          variant === 'dark' ? 'text-white' : 'text-[#09090B]'
        }`}
      >
        Piattaforma di Gestione
      </span>
      {showTag && (
        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-display font-extrabold tracking-wider uppercase bg-[#FF5500] text-white whitespace-nowrap shrink-0">
          LISTA 1 EN-CORE
        </span>
      )}
    </div>
  );
};

interface ListaLogoSlotProps {
  logoUrl?: string;
}

/**
 * Slot dedicato al Logo ufficiale di Lista 1 EN-CORE nella schermata principale.
 * Carica automaticamente il file `public/logo-lista1.png` dalla repository GitHub.
 * Se il file non è ancora presente, rimane nascosto senza mostrare icone rotte.
 */
export const ListaLogoSlot: React.FC<ListaLogoSlotProps> = ({
  logoUrl = `${import.meta.env.BASE_URL}logo-lista1.png`,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed || !logoUrl) {
    return null;
  }

  return (
    <div className="inline-flex items-center justify-center bg-white/10 border border-white/15 rounded-2xl p-3 w-fit">
      <img
        src={logoUrl}
        alt="Logo Lista 1 EN-CORE"
        onError={() => setImgFailed(true)}
        className="h-14 sm:h-16 w-auto object-contain"
      />
    </div>
  );
};
