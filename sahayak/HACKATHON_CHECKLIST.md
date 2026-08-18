# HACKATHON CHECKLIST: SAHAYAK

- [x] **Problem Understanding (10%)**: App clearly caters to 5 different disability profiles dynamically via the Mode Selector.
- [x] **Innovation & Creativity (20%)**: Combines offline OCR, local AI rule engine, voice commands, and adaptive UI into a PWA. Features a conceptual demo for Android Accessibility Service.
- [x] **Accessibility & Inclusivity (20%)**: 
  - WCAG AA compliant colors (Black & #FFD700).
  - Aria labels applied to all interactive elements.
  - Large touch targets (up to 76px).
  - "Skip to main content" implemented.
- [x] **Technical Execution (20%)**: 
  - React + Vite + Tailwind stack is functional.
  - IndexedDB used for offline storage.
  - Web Speech API integrated for Voice-first interactions.
  - Spotify PKCE OAuth flow structure in place.
- [x] **Scalability (15%)**: 
  - Built as a PWA (`vite-plugin-pwa`).
  - Modular component structure.
- [x] **Presentation (10%)**: 
  - Clean, high-contrast UI.
  - Loading states implemented.

## Demo Preparation
1. Ensure the site is deployed (e.g., Vercel) and has HTTPS (required for Camera and Voice APIs).
2. Prepare a physical item with text (e.g., a receipt or product label) to scan.
3. Test Spotify login beforehand to ensure the callback URL is registered in the Spotify Developer Dashboard.
4. Use Chrome on Android to demonstrate the "Install App" PWA feature.
