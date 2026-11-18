import React from 'react';
import { ExternalLink, FileText, X } from 'lucide-react';
import { DISCIPLINE } from '../data/schoolData';

interface RegulationsModalProps {
  open: boolean;
  pdfUrl: string;
  onClose: () => void;
}

export const RegulationsModal: React.FC<RegulationsModalProps> = ({
  open,
  pdfUrl,
  onClose,
}) => {
  if (!open) return null;

  const hasValidUrl = Boolean(pdfUrl && pdfUrl.trim().startsWith('http'));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="regulations-modal-title"
    >
      <div className="bg-white border border-zinc-200 rounded-xl max-w-2xl w-full overflow-hidden shadow-xl">
        <div className="bg-[#09090B] text-white px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FF5500] text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="regulations-modal-title" className="font-display text-base font-extrabold tracking-tight">
                Regolamenti Ufficiali Tornei
              </h2>
              <p className="text-xs text-zinc-400">
                Tre Giorni di Cultura e Sport · Lista 1 EN-CORE
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi regolamenti"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-[#F8FAFC] border border-zinc-200 rounded-lg p-4 space-y-2">
            <h3 className="font-display text-sm font-bold text-[#09090B]">
              Regole Generali di Partecipazione
            </h3>
            <ul className="text-sm text-zinc-600 space-y-1.5 list-disc pl-5">
              <li>
                Ogni squadra o partecipante rappresenta esclusivamente una singola classe dell&apos;Istituto (non sono ammesse squadre miste tra classi diverse).
              </li>
              <li>
                Gli studenti convocati devono presentarsi presso il campo o tavolo indicato almeno 10 minuti prima dell&apos;orario di inizio per il riconoscimento arbitrale.
              </li>
              <li>
                Le assenze alle attività di classe durante la fascia oraria di gara sono automaticamente giustificate tramite il registro convocazioni visibile ai Docenti.
              </li>
              <li>
                In caso di infortunio o impedimento, solo lo Staff EN-CORE può autorizzare la sostituzione con un compagno della stessa classe.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-display font-bold uppercase tracking-wider text-zinc-500">
              Discipline Ufficiali Coperte dal PDF
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DISCIPLINE.map((d) => (
                <div
                  key={d}
                  className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-center text-xs font-semibold text-[#09090B]"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-zinc-500 truncate">
              {hasValidUrl ? (
                <span>Documento: {pdfUrl}</span>
              ) : (
                <span>URL PDF non ancora impostato dallo Staff.</span>
              )}
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Chiudi
              </button>
              {hasValidUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF5500] text-white text-sm font-semibold hover:bg-[#FF7A00] transition-colors whitespace-nowrap"
                >
                  Apri PDF Ufficiale
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
