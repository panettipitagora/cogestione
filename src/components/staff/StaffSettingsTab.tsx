import React, { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Database,
  FileText,
  Film,
  FlaskConical,
  Megaphone,
} from 'lucide-react';
import type { ImpostazioniEvento, StatoEvento } from '../../types';
import { isDemoModeEnabled, resolveStatoEvento } from '../../utils/eventConfigUtils';

interface StaffSettingsTabProps {
  staffEmail: string;
  impostazioni: ImpostazioniEvento;
  onSaveImpostazioni: (settings: ImpostazioniEvento) => Promise<void>;
  isDemoMode: boolean;
  onSyncSeedToFirestore?: () => Promise<number>;
}

const STATO_OPTIONS: { value: StatoEvento; label: string; desc: string }[] = [
  { value: 0, label: '0 · Stay Tuned', desc: 'Schermata attesa con 3 puntini' },
  { value: 1, label: '1 · Giorno 1', desc: 'Apertura Cultura & Fasi a Gironi' },
  { value: 2, label: '2 · Giorno 2', desc: 'Laboratori & Eliminazione Diretta' },
  { value: 3, label: '3 · Giorno 3', desc: 'Assemblea Finale & Finalissime' },
  { value: 4, label: '4 · Assemblea Today', desc: 'Da domani partono le vacanze' },
];

export const StaffSettingsTab: React.FC<StaffSettingsTabProps> = ({
  staffEmail,
  impostazioni,
  onSaveImpostazioni,
  isDemoMode,
  onSyncSeedToFirestore,
}) => {
  const [giornoEvento, setGiornoEvento] = useState<StatoEvento>(() =>
    resolveStatoEvento(impostazioni.giornoEvento)
  );
  const [cineforumDriveUrl, setCineforumDriveUrl] = useState(
    impostazioni.cineforumDriveUrl ?? ''
  );
  const [demoAbilitate, setDemoAbilitate] = useState<0 | 1>(() =>
    isDemoModeEnabled(impostazioni.demoAbilitate) ? 1 : 0
  );
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
      giornoEvento,
      cineforumDriveUrl: cineforumDriveUrl.trim(),
      demoAbilitate,
      updatedBy: staffEmail ? 'Staff Lista 1 EN-CORE' : 'Staff Lista 1 EN-CORE',
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
      <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="pb-3 border-b border-zinc-100">
          <h2 className="font-display text-lg font-extrabold text-[#09090B] flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#FF5500]" />
            <span>Stato Evento Firebase, Cineforum &amp; Avvisi</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Tutti i parametri in <span className="font-mono">impostazioni/evento</span> sono sincronizzati in tempo reale anche sulla pagina pubblica.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Firebase Event Day / State Controller (0..4) */}
          <div className="space-y-2.5">
            <label className="text-xs font-display font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-[#FF5500]" />
              <span>Giorno / Stato Piattaforma (<span className="font-mono">giornoEvento: 0–4</span>)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {STATO_OPTIONS.map((opt) => {
                const active = giornoEvento === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGiornoEvento(opt.value)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? 'surface-active-orange border-[#FF5500] ring-1 ring-[#FF5500]'
                        : 'bg-[#F8FAFC] border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <p className={`font-display font-extrabold text-xs ${active ? 'text-[#FF5500]' : 'text-[#09090B]'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cineforum Google Drive Link (Public, No Login) */}
          <div className="pt-2 border-t border-zinc-100">
            <label htmlFor="set-cineforum" className="text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Link Google Drive — Cineforum in Classe (<span className="font-mono">cineforumDriveUrl</span>)</span>
            </label>
            <input
              id="set-cineforum"
              type="url"
              value={cineforumDriveUrl}
              onChange={(e) => setCineforumDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm font-mono"
            />
          </div>

          {/* Demo Mode Toggle (0 | 1) */}
          <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-zinc-200 bg-[#F8FAFC]">
            <div className="space-y-0.5">
              <p className="text-sm font-display font-bold text-[#09090B] flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-[#FF5500]" />
                <span>Prove Modalità Demo (<span className="font-mono text-xs">demoAbilitate</span>)</span>
              </p>
              <p className="text-xs text-zinc-500">
                <span className="font-mono">0</span> = disattivate · <span className="font-mono">1</span> = quadrati di test ruoli visibili in home.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1 shrink-0">
              <button
                type="button"
                onClick={() => setDemoAbilitate(0)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer ${
                  demoAbilitate === 0 ? 'bg-[#09090B] text-white' : 'text-zinc-600'
                }`}
              >
                0 (OFF)
              </button>
              <button
                type="button"
                onClick={() => setDemoAbilitate(1)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer ${
                  demoAbilitate === 1 ? 'bg-[#FF5500] text-white' : 'text-zinc-600'
                }`}
              >
                1 (ON)
              </button>
            </div>
          </div>

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
            <label htmlFor="set-pdf" className="text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
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
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF7A00] text-white font-display font-bold text-sm transition-colors cursor-pointer"
            >
              Salva e Pubblica Impostazioni
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

        <div className="bg-[#F8FAFC] border border-zinc-200 rounded-xl p-4 space-y-1.5 text-xs text-zinc-600">
          <p className="font-display font-bold text-[#09090B]">
            Campi modificabili anche da Console Firebase:
          </p>
          <p>
            Collezione <span className="font-mono text-[#FF5500]">impostazioni</span> → Documento <span className="font-mono text-[#FF5500]">evento</span>:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px]">
            <li>giornoEvento: 0 | 1 | 2 | 3 | 4</li>
            <li>cineforumDriveUrl: &quot;https://drive.google.com/...&quot;</li>
            <li>demoAbilitate: 0 | 1</li>
          </ul>
        </div>

        {isDemoMode ? (
          <p className="text-sm text-zinc-600 bg-[#F8FAFC] border border-zinc-200 rounded-xl p-4">
            Stai utilizzando la <strong>Modalità Demo</strong> locale. Accedi con Google per sincronizzare i dati direttamente su Cloud Firestore.
          </p>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSeedClick}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#09090B] hover:bg-[#18181B] text-white font-display font-bold text-sm transition-colors cursor-pointer"
            >
              Sincronizza 172 Docenti &amp; Dati Iniziali su Firestore
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
