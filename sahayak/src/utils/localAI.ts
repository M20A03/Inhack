// Offline local JS rule engine for voice commands
// Takes a transcript and the current OCR text (if any) and processes it

export function processCommand(transcript: string, ocrText: string): { type: string, response: string, data?: any } {
  const lowerTranscript = transcript.toLowerCase().trim();

  // "List this" / "Sell this" -> Generate a product listing
  if (lowerTranscript.includes('list this') || lowerTranscript.includes('sell this')) {
    if (!ocrText) return { type: 'error', response: 'No text scanned to list. Please scan an item first.' };
    
    // Very basic heuristic listing generator offline
    const words = ocrText.split(/[\s\n]+/);
    const title = words.slice(0, 5).join(' ');
    
    let price = '$10.00 (Estimated)';
    const priceMatch = ocrText.match(/\$?\d+(\.\d{2})?/);
    if (priceMatch) {
      price = priceMatch[0];
    }

    const description = `This is a listing based on the scanned text: ${ocrText.substring(0, 100)}...`;
    
    return {
      type: 'listing',
      response: `I've created a listing. Title: ${title}. Price: ${price}.`,
      data: { title, price, description }
    };
  }

  // "Read this"
  if (lowerTranscript.includes('read this') || lowerTranscript.includes('read screen')) {
    if (!ocrText) return { type: 'error', response: 'There is no text currently scanned to read.' };
    return { type: 'read', response: ocrText };
  }

  // "Explain this" / "Simplify"
  if (lowerTranscript.includes('explain this') || lowerTranscript.includes('simplify')) {
    if (!ocrText) return { type: 'error', response: 'Please scan some text first.' };
    // Basic offline "simplification" by breaking it down
    return {
      type: 'simplify',
      response: `Here is a simple breakdown:\n1. The scanned text mentions: ${ocrText.split(' ')[0] || 'something'}.\n2. It contains ${ocrText.length} characters.\n3. The main point is derived from the text.`
    };
  }

  // "Save this"
  if (lowerTranscript.includes('save this') || lowerTranscript.includes('save text')) {
    if (!ocrText) return { type: 'error', response: 'Nothing to save.' };
    return { type: 'save', response: 'Saving the current text.' };
  }

  // Spotify controls
  if (lowerTranscript.startsWith('play ')) {
    const query = lowerTranscript.replace('play ', '').trim();
    return { type: 'spotify_play', response: `Searching and playing ${query}`, data: { query } };
  }
  
  if (lowerTranscript.includes('pause')) {
    return { type: 'spotify_pause', response: 'Pausing playback' };
  }
  
  if (lowerTranscript.includes('skip') || lowerTranscript.includes('next song')) {
    return { type: 'spotify_skip', response: 'Skipping to next song' };
  }
  
  if (lowerTranscript.includes('previous')) {
    return { type: 'spotify_previous', response: 'Going to previous song' };
  }

  return { type: 'unknown', response: `I heard: ${transcript}, but I'm not sure how to handle that offline.` };
}
