# Sahayak – Physical Disability Edition

Sahayak is a hands-free, voice-first adaptive accessibility assistant designed specifically for people with physical disabilities (e.g., cerebral palsy, spinal cord injuries, ALS, Parkinson's).

The core principle: *"No hands required. No touch needed."*

## Features

1. **Multiple Interaction Modes**:
   - 🎤 **Voice Control**: Command execution via Web Speech API.
   - 👤 **Face Tracking (Concept)**: Cursor and click control via head movement and facial gestures.
   - 👁️ **Eye Tracking (Concept)**: Gaze and dwell selection.
   - 🔘 **Switch Control (Concept)**: Item scanning navigation for external Bluetooth switches.
2. **Universal App Control (Accessibility Service Mock)**:
   Sahayak demonstrates how an Android Accessibility Service can parse voice commands (like "Open WhatsApp and send message to Mom") and dispatch accessibility nodes to control any installed app hands-free.
3. **Offline OCR**: Fast text extraction without an internet connection.
4. **Offline History**: Saves all commands and extracted texts to IndexedDB.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```

## Hackathon Inspiration
Inspired by projects like Sanna, Project Gameface, and Switchify, Sahayak brings together multiple hands-free interaction concepts into a single, cohesive, Progressive Web App interface.
