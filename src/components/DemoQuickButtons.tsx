import React from 'react';
import {
  Gavel,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import type { DemoPresetId } from '../types';

interface DemoQuickButtonsProps {
  onSelectDemo: (preset: DemoPresetId) => void;
}

const DEMO_TILES: {
  id: DemoPresetId;
  label: string;
  sublabel: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'studente_attivo',
    label: 'Studente',
    sublabel: '4 ITIA_A',
    Icon: GraduationCap,
  },
  {
    id: 'studente_onboarding',
    label: '1° Accesso',
    sublabel: 'Reg. Sede',
    Icon: UserPlus,
  },
  {
    id: 'docente',
    label: 'Docente',
    sublabel: 'Appello',
    Icon: UserCheck,
  },
  {
    id: 'arbitro_pallavolo',
    label: 'Arbitro',
    sublabel: 'Live Score',
    Icon: Gavel,
  },
  {
    id: 'staff_admin',
    label: 'Staff',
    sublabel: 'Super CMS',
    Icon: ShieldCheck,
  },
];

export const DemoQuickButtons: React.FC<DemoQuickButtonsProps> = ({
  onSelectDemo,
}) => {
  return (
    <div className="pt-4 border-t border-zinc-200 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-500">
          Modalità Demo Abilitata (Test Ruoli)
        </p>
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FF5500]/10 text-[#FF5500]">
          demoAbilitate = 1
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {DEMO_TILES.map(({ id, label, sublabel, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectDemo(id)}
            className="min-h-[64px] p-2 rounded-xl border border-zinc-200 bg-[#F8FAFC] hover:border-[#FF5500] hover:bg-[#FFF7F2] flex flex-col items-center justify-center text-center gap-1 transition-colors cursor-pointer"
          >
            <Icon className="w-4 h-4 text-[#FF5500]" />
            <span className="font-display font-bold text-[11px] text-[#09090B] leading-tight">
              {label}
            </span>
            <span className="font-mono text-[10px] text-zinc-500 leading-none">
              {sublabel}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
