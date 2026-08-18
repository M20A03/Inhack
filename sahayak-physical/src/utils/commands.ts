import nlp from 'compromise';

export interface Command {
  action: string;
  target?: string;
  text?: string;
  contact?: string;
  number?: number;
  confidence: number; // 0-1, how confident the parser is
}

// Known app names for fuzzy matching
const KNOWN_APPS = [
  'whatsapp', 'instagram', 'youtube', 'maps', 'google maps',
  'chrome', 'settings', 'camera', 'phone', 'messages', 'sms',
  'telegram', 'signal', 'spotify', 'music', 'calendar',
  'gmail', 'email', 'contacts', 'clock', 'alarm', 'calculator',
  'notes', 'files', 'gallery', 'photos', 'twitter', 'x',
  'facebook', 'snapchat', 'discord', 'slack', 'zoom',
  'uber', 'swiggy', 'zomato', 'paytm', 'gpay', 'phonepe',
];

/**
 * Uses compromise.js NLP to extract structured intents from natural language.
 * Handles complex multi-part commands like:
 *   "Open WhatsApp and send hello to Mom"
 *   "Go to settings and turn on WiFi"
 *   "Type I will be there in 10 minutes"
 *   "Click the submit button"
 */
export function parseCommand(transcript: string): Command {
  const doc = nlp(transcript);
  const lower = transcript.toLowerCase().trim();

  // ── 1. NAVIGATION (highest priority, short phrases) ──
  if (/\b(go\s*back|back)\b/.test(lower)) {
    return { action: 'BACK', confidence: 0.95 };
  }
  if (/\b(go\s*home|home\s*screen)\b/.test(lower)) {
    return { action: 'HOME', confidence: 0.95 };
  }
  if (/\bscroll\s*down\b/.test(lower)) {
    return { action: 'SCROLL_DOWN', confidence: 0.95 };
  }
  if (/\bscroll\s*up\b/.test(lower)) {
    return { action: 'SCROLL_UP', confidence: 0.95 };
  }
  if (/\bswipe\s*(left)\b/.test(lower)) {
    return { action: 'SWIPE_LEFT', confidence: 0.9 };
  }
  if (/\bswipe\s*(right)\b/.test(lower)) {
    return { action: 'SWIPE_RIGHT', confidence: 0.9 };
  }

  // ── 2. COMPLEX: "Open X and send Y to Z" ──
  const openSendMatch = lower.match(
    /open\s+(.+?)\s+and\s+(?:send|tell|message|write)\s+['""]?(.+?)['""]?\s+to\s+(.+)/
  );
  if (openSendMatch) {
    const appName = matchApp(openSendMatch[1]);
    return {
      action: 'OPEN_AND_SEND',
      target: appName,
      text: openSendMatch[2].trim(),
      contact: capitalizeWords(openSendMatch[3].trim()),
      confidence: 0.9,
    };
  }

  // ── 3. COMPLEX: "Send Y to Z on X" ──
  const sendToOnMatch = lower.match(
    /(?:send|tell|message)\s+['""]?(.+?)['""]?\s+to\s+(.+?)\s+on\s+(.+)/
  );
  if (sendToOnMatch) {
    const appName = matchApp(sendToOnMatch[3]);
    return {
      action: 'OPEN_AND_SEND',
      target: appName,
      text: sendToOnMatch[1].trim(),
      contact: capitalizeWords(sendToOnMatch[2].trim()),
      confidence: 0.85,
    };
  }

  // ── 4. COMPLEX: "Call X" / "Call X on WhatsApp" ──
  const callMatch = lower.match(/call\s+(.+?)(?:\s+on\s+(.+))?$/);
  if (callMatch) {
    const contact = capitalizeWords(callMatch[1].trim());
    const app = callMatch[2] ? matchApp(callMatch[2]) : 'phone';
    return {
      action: 'CALL',
      target: app,
      contact,
      confidence: 0.9,
    };
  }

  // ── 5. OPEN APP (simple) ──
  const openMatch = lower.match(/(?:open|launch|start|go\s+to)\s+(.+)/);
  if (openMatch && !lower.includes('open mouth')) {
    const rawApp = openMatch[1].replace(/\s+and\s+.*$/, '').trim();
    const appName = matchApp(rawApp);

    // Check if there's "and do something" after
    const andPart = lower.match(/(?:open|launch)\s+.+?\s+and\s+(.+)/);
    if (andPart) {
      const subAction = andPart[1].trim();
      // "open chrome and search for cats"
      const searchMatch = subAction.match(/(?:search|look|find)\s+(?:for\s+)?(.+)/);
      if (searchMatch) {
        return {
          action: 'OPEN_AND_SEARCH',
          target: appName,
          text: searchMatch[1].trim(),
          confidence: 0.85,
        };
      }
      // Generic: "open X and Y"
      return {
        action: 'OPEN_AND_DO',
        target: appName,
        text: subAction,
        confidence: 0.75,
      };
    }

    return { action: 'OPEN_APP', target: appName, confidence: 0.9 };
  }

  // ── 6. SEARCH ──
  const searchMatch = lower.match(/(?:search|look\s+up|find|google)\s+(?:for\s+)?(.+)/);
  if (searchMatch) {
    return {
      action: 'SEARCH',
      text: searchMatch[1].trim(),
      confidence: 0.85,
    };
  }

  // ── 7. TYPE / DICTATE ──
  const typeMatch = lower.match(/(?:type|write|enter|input|dictate)\s+(.+)/);
  if (typeMatch) {
    return {
      action: 'TYPE',
      text: typeMatch[1].trim(),
      confidence: 0.9,
    };
  }

  // ── 8. CLICK / TAP ──
  if (/\b(click|tap|press|select|hit)\b/.test(lower)) {
    const numMatch = lower.match(/(?:click|tap|press|select|hit)\s+(?:item\s+|number\s+|#)?(\d+)/);
    if (numMatch) {
      return {
        action: 'CLICK',
        number: parseInt(numMatch[1], 10),
        confidence: 0.9,
      };
    }
    // "click the submit button" / "tap on settings"
    const elemMatch = lower.match(
      /(?:click|tap|press|select|hit)\s+(?:on\s+|the\s+)?(.+?)(?:\s+button)?$/
    );
    if (elemMatch) {
      return {
        action: 'CLICK_ELEMENT',
        text: elemMatch[1].trim(),
        confidence: 0.8,
      };
    }
  }

  // ── 9. MEDIA ──
  if (/\b(play|resume)\b/.test(lower)) return { action: 'PLAY', confidence: 0.9 };
  if (/\b(pause|stop)\b/.test(lower)) return { action: 'PAUSE', confidence: 0.9 };
  if (/\b(skip|next\s*(track|song)?)\b/.test(lower)) return { action: 'SKIP', confidence: 0.9 };
  if (/\bprevious\b/.test(lower)) return { action: 'PREVIOUS', confidence: 0.9 };
  if (/\bvolume\s*up\b/.test(lower)) return { action: 'VOLUME_UP', confidence: 0.9 };
  if (/\bvolume\s*down\b/.test(lower)) return { action: 'VOLUME_DOWN', confidence: 0.9 };
  if (/\bmute\b/.test(lower)) return { action: 'MUTE', confidence: 0.9 };

  // ── 10. SYSTEM / ACCESSIBILITY ──
  if (/\bread\s*(screen|this|aloud|everything)\b/.test(lower)) {
    return { action: 'READ_SCREEN', confidence: 0.95 };
  }
  if (/\b(magnify|zoom\s*in)\b/.test(lower)) return { action: 'MAGNIFY', confidence: 0.9 };
  if (/\b(zoom\s*out)\b/.test(lower)) return { action: 'ZOOM_OUT', confidence: 0.9 };
  if (/\btake\s*(a\s*)?screenshot\b/.test(lower)) return { action: 'SCREENSHOT', confidence: 0.9 };
  if (/\b(brightness\s*up|brighter)\b/.test(lower)) return { action: 'BRIGHTNESS_UP', confidence: 0.85 };
  if (/\b(brightness\s*down|dimmer)\b/.test(lower)) return { action: 'BRIGHTNESS_DOWN', confidence: 0.85 };
  if (/\b(lock\s*screen|lock\s*phone)\b/.test(lower)) return { action: 'LOCK', confidence: 0.9 };
  if (/\b(show\s*notifications?|notification\s*panel)\b/.test(lower)) {
    return { action: 'NOTIFICATIONS', confidence: 0.9 };
  }

  // ── 11. EMERGENCY ──
  if (/\b(emergency|help\s*me|sos)\b/.test(lower)) {
    return { action: 'EMERGENCY', confidence: 0.95 };
  }

  // ── 12. FALLBACK: use compromise to extract verbs + nouns ──
  const verbs = doc.verbs().toInfinitive().out('array') as string[];
  const nouns = doc.nouns().out('array') as string[];

  if (verbs.length > 0 || nouns.length > 0) {
    return {
      action: 'NLP_PARSED',
      text: transcript,
      target: nouns[0] || undefined,
      confidence: 0.4,
    };
  }

  return { action: 'UNKNOWN', text: transcript, confidence: 0 };
}

// ── HELPERS ──

function matchApp(raw: string): string {
  const cleaned = raw.trim().toLowerCase().replace(/['"]/g, '');
  // Exact match
  const exactMatch = KNOWN_APPS.find(app => cleaned === app);
  if (exactMatch) return capitalizeWords(exactMatch);

  // Partial/fuzzy match
  const partialMatch = KNOWN_APPS.find(app => cleaned.includes(app) || app.includes(cleaned));
  if (partialMatch) return capitalizeWords(partialMatch);

  // Fall back to what the user said
  return capitalizeWords(cleaned);
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}
