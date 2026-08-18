import React from 'react';
import { Volume2, Save } from 'lucide-react';
import { speakText } from '../hooks/useSpeechRecognition';
import { saveItem } from '../utils/storage';
import { AppMode } from './ModeSelector';

interface AIResponseProps {
  response: string;
  currentMode: AppMode;
  onSave?: () => void;
}

export function AIResponse({ response, currentMode, onSave }: AIResponseProps) {
  if (!response) return null;

  const handleSpeak = () => speakText(response);
  const handleSave = async () => {
    await saveItem(response, 'response');
    if (onSave) onSave();
    if (currentMode === 'visual' || currentMode === 'general') {
      speakText('Response saved.');
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 mt-6 shadow-md" role="region" aria-label="AI Response">
      <h3 className="text-lg font-bold mb-2 text-accent">Assistant</h3>
      <div className="text-gray-200 whitespace-pre-wrap mb-4">
        {response}
      </div>
      
      <div className="flex gap-2 cognitive-hide">
        {currentMode !== 'hearing' && (
          <button
            onClick={handleSpeak}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Read response aloud"
          >
            <Volume2 size={20} />
            Read
          </button>
        )}
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Save response"
        >
          <Save size={20} />
          Save
        </button>
      </div>
    </div>
  );
}
