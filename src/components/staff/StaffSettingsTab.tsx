import React, { useState } from 'react';
import { CheckCircle2, Database, FileText, Megaphone } from 'lucide-react';
import type { ImpostazioniEvento } from '../../types';

interface StaffSettingsTabProps {
  staffEmail: string;
  impostazioni: ImpostazioniEvento;
  onSaveImpostazioni: (settings: ImpostazioniEvento) => Promise<void>;
  isDemoMode: boolean;
  onSyncSeedToFirestore?: () => Promise<number>;
}

export const StaffSettingsTab: React.FC<StaffSettingsTabProps> = ({
  staffEmail,
  impostazioni,
  onSaveImpostazioni,
  isDemoMode,
  onSyncSeedToFirestore,
}) => {
  const [bannerAttivo, setBannerAttivo] = useState(impostazioni.bannerAttivo);
  const [bannerTitolo, setBannerTitolo] = useState(impostazioni.bannerTitolo);
  const [bannerTesto, setBannerTesto] = useState(impostazioni.bannerTesto);
  const [bannerLivello, setBannerLivello] = useState<'info' | 'urgente'>(
    impostazioni.bannerLivello
  );
  const [regolamentoPdfUrl, setRegolamentoPdfUrl] = useState(
    impostazioni.regolamentoPdfUrl
  );
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveImpostazioni({
      bannerAttivo,
      bannerTitolo: bannerTitolo.trim(),
      bannerTesto: bannerTesto.trim(),
      bannerLivello,
      regolamentoPdfUrl: regolamentoPdfUrl.trim(),
      updatedBy: staffEmail,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleSeedClick = async () => {
    if (!onSyncSeedToFirestore) return;
    const count = await onSyncSeedToFirestore();
    setSyncResult(
      count > 0
        ? `Sincronizzazione completata: ${count} record ufficiali caricati su Firestore.`
        : 'Il database Firestore contiene già i dati ufficiali.'
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6 space-y-5">
        <div className="pb-3 border-b border-zinc-100">
          <h2 className="font-display text-lg font-extrabold text-[#09090B] flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#FF5500]" />
            <span>Banner Avviso Urgente & Regolamento PDF</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Le modifiche vengono pubblicate istantaneamente in cima a tutte le dashboard dell&apos;istituto.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 bg-[#F8FAFC] cursor-pointer">
            <div>
              <p className="text-sm font-display font-bold text-[#09090B]">
                Mostra Banner Avviso Globale
              </p>
              <p className="text-xs text-zinc-500">
                Attiva o disattiva la barra di comunicazione in tempo reale.
              </p>
            </div>
            <input
              type="checkbox"
              checked={bannerAttivo}
              onChange={(e) => setBannerAttivo(e.target.checked)}
              className="w-5 h-5 accent-[#FF5500]"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="set-titolo" className="block text-xs font-semibold text-zinc-700 mb-1">
                Titolo Avviso
              </label>
              <input
                id="set-titolo"
                type="text"
                value={bannerTitolo}
                onChange={(e) => setBannerTitolo(e.target.value)}
                placeholder="Es. Aggiornamento Campi"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="set-livello" className="block text-xs font-semibold text-zinc-700 mb-1">
                Urgenza
              </label>
              <select
                id="set-livello"
                value={bannerLivello}
                onChange={(e) => setBannerLivello(e.target.value as 'info' | 'urgente')}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-semibold"
              >
                <option value="urgente">Urgente (Arancio/Nero)</option>
                <option value="info">Informativo</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="set-testo" className="block text-xs font-semibold text-zinc-700 mb-1">
              Testo Comunicazione
            </label>
            <textarea
              id="set-testo"
              rows={3}
              value={bannerTesto}
              onChange={(e) => setBannerTesto(e.target.value)}
              placeholder="Scrivi l'avviso per studenti e docenti..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm"
            />
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <label htmlFor="set-pdf" className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>URL Diretto PDF Ufficiale Regolamenti</span>
            </label>
            <input
              id="set-pdf"
              type="url"
              value={regolamentoPdfUrl}
              onChange={(e) => setRegolamentoPdfUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-mono"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {savedFeedback ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Impostazioni pubblicate
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF7A00] text-white font-display font-bold text-sm transition-colors cursor-pointer"
            >
              Salva e Pubblica Avvisi
            </button>
          </div>
        </form>
      </section>

      <section className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
        <div className="pb-3 border-b border-zinc-100">
          <h2 className="font-display text-base font-extrabold text-[#09090B] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#FF5500]" />
            <span>Inizializzazione Database Firestore</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Sincronizza la lista ufficiale dei 172 Docenti e il calendario base sul progetto Firebase collegato.
          </p>
        </div>

        {isDemoMode ? (
          <p className="text-sm text-zinc-600 bg-[#F8FAFC] border border-zinc-200 rounded-xl p-4">
            Stai utilizzando la <strong>Modalità Demo</strong> locale. Accedi con Google Workspace (<span className="font-mono text-xs">diliso.danilo@panettipitagora.edu.it</span>) per sincronizzare i dati direttamente su Cloud Firestore.
          </p>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSeedClick}
              className="w-full py-2.5 px-4 rounded-xl bg-[#09090B] hover:bg-[#18181B] text-white font-display font-bold text-sm transition-colors cursor-pointer"
            >
              Sincronizza 172 Docenti & Dati Iniziali su Firestore
            </button>
            {syncResult && (
              <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                {syncResult}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
