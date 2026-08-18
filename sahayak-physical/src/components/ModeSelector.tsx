export type ControlMode = 'voice' | 'face' | 'scan' | 'hybrid';
import { Mic, ScanFace, Camera, Combine } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: ControlMode;
  onModeChange: (mode: ControlMode) => void;
}

const modes = [
  { id: 'voice', label: 'Voice Control', icon: <Mic size={24} /> },
  { id: 'face', label: 'Face Gestures', icon: <ScanFace size={24} /> },
  { id: 'scan', label: 'Scan Medicine', icon: <Camera size={24} /> },
  { id: 'hybrid', label: 'Hybrid (All)', icon: <Combine size={24} /> },
] as const;



export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6" role="group" aria-label="Control Modes">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id as ControlMode)}
          className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 min-w-[80px] ${
            currentMode === mode.id
              ? 'border-secondary bg-secondary-container text-white font-bold scale-105 shadow-md'
              : 'border-emerald-900/10 bg-surface-dark text-on-surface-variant hover:border-secondary hover:text-primary shadow-sm'
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

