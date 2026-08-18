// src/utils/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function processWithGemini(command: string, context: string): Promise<any> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using local AI.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are Sahayak, an accessibility assistant for people with physical disabilities.
      
      The user said: "${command}"
      
      Context (scanned text if available): "${context}"
      
      Respond with a helpful, actionable response. Keep it short (under 50 words).
      If the user wants to control an app, tell me what to do.
      
      Format your response as JSON:
      {
        "action": "OPEN_APP|CLICK|TYPE|BACK|HOME|READ_SCREEN|LIST|SAVE|EXPLAIN|UNKNOWN",
        "target": "app name or element (if applicable)",
        "text": "text to type (if applicable)",
        "message": "spoken response to the user (keep it conversational and simple)"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Find the JSON block if markdown formatting is used
      const jsonStr = text.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch {
      return {
        action: 'UNKNOWN',
        message: text
      };
    }
  } catch (error) {
    console.error('Gemini error:', error);
    return {
      action: 'UNKNOWN',
      message: 'Sorry, I could not process that command. Please try again.'
    };
  }
}
