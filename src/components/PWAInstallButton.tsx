import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  label = 'Aggiungi alla Home',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-display font-bold transition-colors cursor-pointer ${
          compact
            ? 'px-3 py-1.5 text-xs bg-[#FF5500] hover:bg-[#FF7A00] text-white'
            : 'px-4 py-2 text-xs sm:text-sm bg-[#FF5500] hover:bg-[#FF7A00] text-white'
        }`}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-display font-bold text-[#09090B] transition-colors cursor-pointer"
        >
          <Share className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>{label}</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white border border-zinc-200 p-5 space-y-3 shadow-xl text-left">
              <div className="flex items-center justify-between gap-2">
                <h3
                  id="ios-install-title"
                  className="font-display text-base font-extrabold text-[#09090B]"
                >
                  Aggiungi alla schermata Home
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Chiudi istruzioni"
                  className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-xs text-zinc-600 space-y-1.5 list-decimal pl-4 leading-relaxed">
                <li>
                  Tocca il tasto <strong>Condividi</strong> nella barra di Safari.
                </li>
                <li>
                  Scorri verso il basso e seleziona{' '}
                  <strong>Aggiungi alla schermata Home</strong>.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#09090B] text-white font-display font-bold text-xs cursor-pointer"
              >
                Ho capito
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
