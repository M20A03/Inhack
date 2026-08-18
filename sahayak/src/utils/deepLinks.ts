// src/utils/deepLinks.ts

export function executeDeepLink(action: string, target?: string, text?: string) {
  const t = target?.toLowerCase() || '';
  
  if (action === 'OPEN_APP') {
    if (t === 'whatsapp') {
      window.open('whatsapp://send', '_blank');
      // Fallback
      setTimeout(() => {
        window.open('https://web.whatsapp.com', '_blank');
      }, 1200);
    } else if (t === 'youtube') {
      window.open('https://youtube.com', '_blank');
    } else if (t === 'spotify') {
      window.open('spotify://', '_blank');
      setTimeout(() => {
        window.open('https://open.spotify.com', '_blank');
      }, 1200);
    } else if (t === 'maps') {
      window.open('https://maps.google.com', '_blank');
    } else if (t === 'gmail') {
      window.open('mailto:', '_blank');
    } else if (t === 'chrome') {
      window.open('https://google.com', '_blank');
    } else {
      // General web search
      window.open(`https://google.com/search?q=${encodeURIComponent(t)}`, '_blank');
    }
  } else if (action === 'SEARCH') {
    window.open(`https://google.com/search?q=${encodeURIComponent(text || '')}`, '_blank');
  } else if (action === 'CALL') {
    window.open(`tel:${text || ''}`, '_blank');
  }
}
