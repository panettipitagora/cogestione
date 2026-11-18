import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Errore imprevisto di sistema.',
    };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-zinc-200 rounded-xl p-8 space-y-5">
            <div className="flex items-center gap-3 text-[#09090B]">
              <div className="w-10 h-10 rounded-lg bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-lg font-extrabold tracking-tight">
                  Si è verificato un problema di caricamento
                </h1>
                <p className="text-sm text-zinc-600">
                  Verifica la connessione o i permessi del tuo account istituzionale.
                </p>
              </div>
            </div>
            <pre className="text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg p-3 overflow-auto max-h-40 text-zinc-700">
              {this.state.errorMessage}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#09090B] text-white text-sm font-semibold hover:bg-[#18181B] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Ricarica piattaforma
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
