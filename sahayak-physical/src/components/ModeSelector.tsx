// ModeSelector component
import { Mic, ToggleRight, ScanFace, Eye, Combine } from 'lucide-react';

export type ControlMode = 'voice' | 'switch' | 'face' | 'eye' | 'hybrid';

interface ModeSelectorProps {
  currentMode: ControlMode;
  onModeChange: (mode: ControlMode) => void;
}

const modes = [
  { id: 'voice', label: 'Voice', icon: <Mic size={24} /> },
  { id: 'switch', label: 'Switch', icon: <ToggleRight size={24} /> },
  { id: 'face', label: 'Face', icon: <ScanFace size={24} /> },
  { id: 'eye', label: 'Eye', icon: <Eye size={24} /> },
  { id: 'hybrid', label: 'Hybrid', icon: <Combine size={24} /> },
] as const;

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Control Modes">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id as ControlMode)}
          className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors min-w-[70px] ${
            currentMode === mode.id
              ? 'border-accent bg-accent/20 text-accent'
              : 'border-gray-700 hover:border-gray-500 text-gray-400'
          }`}
          aria-pressed={currentMode === mode.id}
          aria-label={`${mode.label} Control Mode`}
        >
          {mode.icon}
          <span className="text-xs font-bold mt-2 uppercase tracking-wide">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
