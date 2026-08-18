import { useState, useCallback } from 'react';
import { processCommand, AIResponse } from '../utils/localAI';
import { saveItem } from '../utils/storage';

export function useLocalAI() {
  const [history, setHistory] = useState<AIResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const processVoiceCommand = useCallback(async (transcript: string, context?: string) => {
    setLoading(true);
    const result = processCommand(transcript, context);
    
    // Save to local offline storage (IndexedDB)
    try {
      await saveItem({
        type: 'command',
        content: `Command: "${transcript}" -> Response: "${result.response}"`,
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('Could not save command offline:', e);
    }

    setHistory(prev => [result, ...prev]);
    setLoading(false);
    return result;
  }, []);

  return { history, loading, processVoiceCommand };
}
