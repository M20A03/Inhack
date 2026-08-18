import React from 'react';
import { Settings, Eye, Ear, Brain, Activity } from 'lucide-react';

export type AppMode = 'general' | 'motor' | 'visual' | 'cognitive' | 'hearing';

interface ModeSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const modes = [
  { id: 'general', label: 'General', icon: <Settings size={24} /> },
  { id: 'motor', label: 'Motor', icon: <Activity size={24} /> },
  { id: 'visual', label: 'Visual', icon: <Eye size={24} /> },
  { id: 'cognitive', label: 'Cognitive', icon: <Brain size={24} /> },
  { id: 'hearing', label: 'Hearing', icon: <Ear size={24} /> },
] as const;

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Accessibility Modes">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-colors ${
            currentMode === mode.id
              ? 'border-accent bg-accent/20 text-accent'
              : 'border-gray-700 hover:border-gray-500'
          }`}
          aria-pressed={currentMode === mode.id}
          aria-label={`${mode.label} Mode`}
        >
          {mode.icon}
          <span className="text-sm mt-1">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
