# Sahayak - The Adaptive Accessibility Assistant

Sahayak (Sanskrit for "Companion") is a Progressive Web App (PWA) that serves as an offline-first, voice-first, camera-first accessibility assistant. It adapts its UI and functionality dynamically for people with physical, visual, cognitive, and hearing disabilities.

## Features

1. **Adaptive UI Modes**: 
   - **Motor**: Enlarged touch targets (76px).
   - **Visual**: High contrast, large bold fonts, auto-TTS on actions.
   - **Cognitive**: Simplified UI, hides non-essential sections, limits text complexity.
   - **Hearing**: Disables TTS, uses flashing screen alerts and haptics (where supported).
   - **General**: Balanced everyday assistant.
2. **Offline OCR**: Scan items with the camera and extract text locally.
3. **Local Voice AI Rule Engine**: Process commands like "List this", "Explain this", or "Save this" entirely offline without API keys.
4. **Offline Storage**: Save scanned texts and AI responses securely using IndexedDB.
5. **Spotify Integration**: Connect your Spotify account to control playback using voice commands.
6. **Universal App Control (Mock)**: A conceptual showcase of Android Accessibility Service integration.

## Getting Started

### Prerequisites
- Node.js v18+ 
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy the sample `.env` file and fill in your keys (Optional for basic offline use, required for Spotify).
   ```bash
   cp .env .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Deployment
This app is ready to be deployed on Vercel. Ensure you add the environment variables in your Vercel project settings.

## Hackathon Inspiration
Inspired by winning projects like Accessify, AccessFix AI, and SAHAY. Sahayak brings all accessibility tools into one unified, offline-capable Progressive Web App.
