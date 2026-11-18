import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, GraduationCap, HelpCircle, Send, X } from 'lucide-react';
import type { UserProfile } from '../types';
import { groupClassesByYear } from '../utils/tournamentUtils';
import { BrandLogo } from './BrandLogo';
import { Footer } from './Footer';

interface StudentOnboardingProps {
  user: UserProfile;
  onConfirmClass: (classe: string) => Promise<void>;
  onReportTeacher: (note: string) => Promise<void>;
  onLogout: () => void;
}

export const StudentOnboarding: React.FC<StudentOnboardingProps> = ({
  user,
  onConfirmClass,
  onReportTeacher,
  onLogout,
}) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportSending, setReportSending] = useState(false);

  const yearGroups = useMemo(() => groupClassesByYear(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      setError('Seleziona la tua classe prima di continuare.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onConfirmClass(selectedClass);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio della classe.');
      setSaving(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSending(true);
    try {
      await onReportTeacher(reportNote.trim() || 'Docente non riconosciuto automaticamente al primo login.');
      setReportSent(true);
    } finally {
      setReportSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <BrandLogo />
          <button
            type="button"
            onClick={onLogout}
            className="px-3.5 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Cambia Account
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl w-full bg-white border border-zinc-200 rounded-2xl p-7 sm:p-10 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#FF5500]">
              <GraduationCap className="w-4 h-4" />
              <span>Configurazione Primo Accesso</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#09090B]">
              Benvenuto, {user.displayName}
            </h1>
            <p className="text-sm text-zinc-600">
              Account verificato: <span className="font-mono text-xs text-[#09090B]">{user.email}</span>. Seleziona la tua classe di appartenenza per accedere al programma personalizzato e alle convocazioni.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="onboarding-classe-select"
                className="block text-sm font-display font-bold text-[#09090B]"
              >
                Seleziona la tua Classe (47 classi ufficiali)
              </label>
              <select
                id="onboarding-classe-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white text-sm font-semibold text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#FF5500] focus:border-[#FF5500]"
              >
                <option value="">-- Seleziona Classe --</option>
                {yearGroups.map((group) => (
                  <optgroup key={group.year} label={group.label}>
                    {group.classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div
              role="note"
              className="bg-[#FFF7F2] border border-[#FF5500]/30 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-[#FF5500] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#09090B] leading-relaxed">
                <strong>Attenzione:</strong> una volta confermata, la classe non potrà essere modificata autonomamente. In caso di errore contatta lo Staff EN-CORE.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !selectedClass}
              className="w-full py-3.5 px-5 rounded-xl bg-[#FF5500] hover:bg-[#FF7A00] disabled:opacity-50 text-white font-display font-bold text-sm transition-colors cursor-pointer"
            >
              {saving ? 'Salvataggio in corso...' : 'Conferma Classe e Entra nel Portale'}
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-200 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setReportSent(false);
                setReportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-[#09090B] underline underline-offset-4 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Sei un docente non riconosciuto automaticamente?</span>
            </button>
          </div>
        </div>
      </main>

      {reportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-teacher-title"
        >
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="report-teacher-title" className="font-display text-lg font-extrabold text-[#09090B]">
                Segnalazione Profilo Docente
              </h2>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                aria-label="Chiudi segnalazione"
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSent ? (
              <div className="space-y-4 py-2">
                <div className="flex items-start gap-3 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Segnalazione inviata allo Staff Lista 1 EN-CORE. Il tuo account <strong className="font-mono text-xs">{user.email}</strong> verrà abilitato come Docente al più presto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="w-full py-2.5 rounded-lg bg-[#09090B] text-white text-sm font-semibold cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <p className="text-sm text-zinc-600">
                  Se la tua email istituzionale usa un formato diverso dallo standard <span className="font-mono text-xs">nome.cognome</span>, invia una segnalazione allo Staff per l&apos;abilitazione manuale.
                </p>
                <div>
                  <label htmlFor="teacher-report-note" className="block text-xs font-semibold text-zinc-700 mb-1">
                    Note (Cognome e Nome / Materia)
                  </label>
                  <textarea
                    id="teacher-report-note"
                    rows={3}
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    placeholder="Es. Prof. Mario Rossi — Email istituzionale abbreviata"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-700 cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={reportSending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF5500] text-white text-sm font-semibold hover:bg-[#FF7A00] cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{reportSending ? 'Invio...' : 'Invia allo Staff'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
