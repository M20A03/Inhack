// src/utils/commandProcessor.ts

export interface Command {
  action: 'OPEN_APP' | 'CLICK' | 'TYPE' | 'BACK' | 'HOME' | 
          'SCROLL_UP' | 'SCROLL_DOWN' | 'PLAY' | 'PAUSE' | 'SKIP' |
          'VOLUME_UP' | 'VOLUME_DOWN' | 'READ_SCREEN' | 'MAGNIFY' |
          'SAVE' | 'LIST' | 'EXPLAIN' | 'UNKNOWN';
  target?: string;
  text?: string;
  number?: number;
  confidence: number;
  raw: string;
}

// Map of known apps (expand this)
const KNOWN_APPS = [
  'whatsapp', 'instagram', 'facebook', 'youtube', 'gmail', 
  'maps', 'spotify', 'twitter', 'telegram', 'signal', 
  'chrome', 'settings', 'camera', 'photos', 'calendar',
  'clock', 'calculator', 'notes', 'messages', 'contacts',
  'play store', 'amazon', 'flipkart', 'swiggy', 'zomato'
];

export function parseCommand(transcript: string): Command {
  const lower = transcript.toLowerCase().trim();
  const words = lower.split(' ');

  // --- Check for app opening ---
  for (const app of KNOWN_APPS) {
    if (lower.includes('open') && lower.includes(app)) {
      return {
        action: 'OPEN_APP',
        target: app,
        confidence: 0.9,
        raw: transcript
      };
    }
  }

  // --- Check for typing ---
  const typeMatch = lower.match(/type\s+(.+?)(?:\s+and\s+|$)/);
  if (typeMatch) {
    return {
      action: 'TYPE',
      text: typeMatch[1].trim(),
      confidence: 0.85,
      raw: transcript
    };
  }

  // --- Check for clicking ---
  const clickNumberMatch = transcript.match(/(?:click|tap)\s+(\d+)/i);
  if (clickNumberMatch) {
    return {
      action: 'CLICK',
      number: parseInt(clickNumberMatch[1]),
      confidence: 0.9,
      raw: transcript
    };
  }

  // --- Check for scrolling ---
  if (lower.includes('scroll up') || lower.includes('go up')) {
    return { action: 'SCROLL_UP', confidence: 0.9, raw: transcript };
  }
  if (lower.includes('scroll down') || lower.includes('go down')) {
    return { action: 'SCROLL_DOWN', confidence: 0.9, raw: transcript };
  }

  // --- Check for navigation ---
  if (lower.includes('go back') || lower.includes('back')) {
    return { action: 'BACK', confidence: 0.95, raw: transcript };
  }
  if (lower.includes('go home') || lower.includes('home')) {
    return { action: 'HOME', confidence: 0.95, raw: transcript };
  }

  // --- Check for media control ---
  if (lower.includes('play music') || lower.includes('play song') || lower.includes('play')) {
    return { action: 'PLAY', confidence: 0.85, raw: transcript };
  }
  if (lower.includes('pause') || lower.includes('stop')) {
    return { action: 'PAUSE', confidence: 0.95, raw: transcript };
  }
  if (lower.includes('skip') || lower.includes('next')) {
    return { action: 'SKIP', confidence: 0.9, raw: transcript };
  }
  if (lower.includes('volume up') || lower.includes('louder')) {
    return { action: 'VOLUME_UP', confidence: 0.9, raw: transcript };
  }
  if (lower.includes('volume down') || lower.includes('quieter')) {
    return { action: 'VOLUME_DOWN', confidence: 0.9, raw: transcript };
  }

  // --- Check for accessibility actions ---
  if (lower.includes('read screen') || lower.includes('read this')) {
    return { action: 'READ_SCREEN', confidence: 0.9, raw: transcript };
  }
  if (lower.includes('magnify') || lower.includes('zoom in')) {
    return { action: 'MAGNIFY', confidence: 0.85, raw: transcript };
  }

  // --- Check for Sahayak-specific actions ---
  if (lower.includes('list this') || lower.includes('sell this')) {
    return { action: 'LIST', confidence: 0.95, raw: transcript };
  }
  if (lower.includes('save this')) {
    return { action: 'SAVE', confidence: 0.95, raw: transcript };
  }
  if (lower.includes('explain') || lower.includes('simplify')) {
    return { action: 'EXPLAIN', confidence: 0.9, raw: transcript };
  }

  // Unknown command
  return {
    action: 'UNKNOWN',
    confidence: 0.3,
    raw: transcript
  };
}

// Generate a natural language response for a command
export function generateResponse(command: Command, context: string): string {
  switch (command.action) {
    case 'OPEN_APP':
      return `Opening ${command.target}...`;
    case 'CLICK':
      return `Clicking item ${command.number}...`;
    case 'TYPE':
      return `Typing: "${command.text}"`;
    case 'BACK':
      return 'Going back...';
    case 'HOME':
      return 'Going home...';
    case 'SCROLL_UP':
      return 'Scrolling up...';
    case 'SCROLL_DOWN':
      return 'Scrolling down...';
    case 'PLAY':
      return 'Playing music...';
    case 'PAUSE':
      return 'Pausing...';
    case 'SKIP':
      return 'Skipping...';
    case 'VOLUME_UP':
      return 'Volume up...';
    case 'VOLUME_DOWN':
      return 'Volume down...';
    case 'READ_SCREEN':
      return `Reading: ${context}`;
    case 'MAGNIFY':
      return 'Zooming in...';
    case 'LIST':
      return `Listing product from: ${context}`;
    case 'SAVE':
      return 'Saved successfully!';
    case 'EXPLAIN':
      const steps = context.split('.').filter(s => s.trim().length > 0).slice(0, 3);
      const stepText = steps.map((s, i) => `Step ${i+1}: ${s.trim()}`).join('. ');
      return `Simplified: ${stepText}`;
    default:
      return `I heard: "${command.raw}". Try saying "Open WhatsApp" or "Type hello".`;
  }
}
