import { parseCommand, Command } from './commands';

export interface AIResponse {
  type: string;
  response: string;
  command: Command;
  logs: string[];
}

/**
 * Processes a voice transcript through the NLP parser and generates
 * human-readable responses + simulated Accessibility Service execution logs.
 */
export function processCommand(transcript: string, currentScreenContext?: string): AIResponse {
  const command = parseCommand(transcript);
  let response = '';
  let logs: string[] = [];

  switch (command.action) {
    // ── APP LAUNCHING ──
    case 'OPEN_APP':
      response = `Opening ${command.target}.`;
      logs = [
        `Resolving package for "${command.target}".`,
        `Checking if ${command.target} is installed.`,
        `Launching ${command.target} via Intent.`,
        `${command.target} is now in foreground.`,
      ];
      break;

    case 'OPEN_AND_SEND':
      response = `Opening ${command.target} to send "${command.text}" to ${command.contact}.`;
      logs = [
        `Launching ${command.target}.`,
        `Waiting for ${command.target} to load.`,
        `Locating search/contact bar.`,
        `Typing contact name: "${command.contact}".`,
        `Selecting contact "${command.contact}" from results.`,
        `Locating message input field.`,
        `Typing message: "${command.text}"`,
        `Locating send button.`,
        `Dispatching ACTION_CLICK on send button.`,
        `✅ Message sent successfully.`,
      ];
      break;

    case 'OPEN_AND_SEARCH':
      response = `Opening ${command.target} and searching for "${command.text}".`;
      logs = [
        `Launching ${command.target}.`,
        `Waiting for ${command.target} to load.`,
        `Locating search bar via AccessibilityNodeInfo.`,
        `Dispatching ACTION_FOCUS on search field.`,
        `Dispatching ACTION_SET_TEXT: "${command.text}".`,
        `Dispatching ACTION_IME_ENTER.`,
        `✅ Search results loaded.`,
      ];
      break;

    case 'OPEN_AND_DO':
      response = `Opening ${command.target} and executing: ${command.text}.`;
      logs = [
        `Launching ${command.target}.`,
        `Waiting for ${command.target} to load.`,
        `Processing sub-command: "${command.text}".`,
        `Traversing view hierarchy for actionable nodes.`,
        `Executing inferred action.`,
      ];
      break;

    // ── CALLING ──
    case 'CALL':
      response = `Calling ${command.contact}${command.target !== 'phone' ? ` on ${command.target}` : ''}.`;
      logs = [
        `Resolving contact: "${command.contact}".`,
        `Found phone number for ${command.contact}.`,
        `Launching ${command.target || 'Phone'} dialer.`,
        `Dispatching ACTION_CALL intent.`,
        `📞 Call initiated.`,
      ];
      break;

    // ── NAVIGATION ──
    case 'BACK':
      response = 'Going back.';
      logs = ['Dispatching GLOBAL_ACTION_BACK via AccessibilityService.'];
      break;

    case 'HOME':
      response = 'Going to home screen.';
      logs = ['Dispatching GLOBAL_ACTION_HOME via AccessibilityService.'];
      break;

    case 'SCROLL_DOWN':
      response = 'Scrolling down.';
      logs = ['Locating scrollable node.', 'Dispatching ACTION_SCROLL_FORWARD.'];
      break;

    case 'SCROLL_UP':
      response = 'Scrolling up.';
      logs = ['Locating scrollable node.', 'Dispatching ACTION_SCROLL_BACKWARD.'];
      break;

    case 'SWIPE_LEFT':
      response = 'Swiping left.';
      logs = ['Dispatching gesture: SWIPE_LEFT (600ms duration).'];
      break;

    case 'SWIPE_RIGHT':
      response = 'Swiping right.';
      logs = ['Dispatching gesture: SWIPE_RIGHT (600ms duration).'];
      break;

    // ── CLICKING ──
    case 'CLICK':
      response = `Clicking item ${command.number}.`;
      logs = [
        `Enumerating visible interactive nodes.`,
        `Finding node at index ${command.number}.`,
        `Dispatching ACTION_CLICK on node #${command.number}.`,
      ];
      break;

    case 'CLICK_ELEMENT':
      response = `Clicking "${command.text}".`;
      logs = [
        `Searching view hierarchy for node with text or content-description matching "${command.text}".`,
        `Found matching node.`,
        `Dispatching ACTION_CLICK.`,
      ];
      break;

    // ── TYPING ──
    case 'TYPE':
      response = `Typing: "${command.text}"`;
      logs = [
        'Finding currently focused input node.',
        `Dispatching ACTION_SET_TEXT with payload: "${command.text}".`,
        `✅ Text entered.`,
      ];
      break;

    // ── SEARCH ──
    case 'SEARCH':
      response = `Searching for "${command.text}".`;
      logs = [
        `Launching default browser.`,
        `Navigating to search engine.`,
        `Entering query: "${command.text}".`,
        `✅ Results loaded.`,
      ];
      break;

    // ── MEDIA ──
    case 'PLAY':
      response = 'Resuming playback.';
      logs = ['Dispatching MediaSession action: play.'];
      break;

    case 'PAUSE':
      response = 'Pausing playback.';
      logs = ['Dispatching MediaSession action: pause.'];
      break;

    case 'SKIP':
      response = 'Skipping to next track.';
      logs = ['Dispatching MediaSession action: next.'];
      break;

    case 'PREVIOUS':
      response = 'Going to previous track.';
      logs = ['Dispatching MediaSession action: previous.'];
      break;

    case 'VOLUME_UP':
      response = 'Turning volume up.';
      logs = ['Dispatching AudioManager: adjustStreamVolume(+1).'];
      break;

    case 'VOLUME_DOWN':
      response = 'Turning volume down.';
      logs = ['Dispatching AudioManager: adjustStreamVolume(-1).'];
      break;

    case 'MUTE':
      response = 'Muting device.';
      logs = ['Dispatching AudioManager: setStreamMute(true).'];
      break;

    // ── SYSTEM / ACCESSIBILITY ──
    case 'READ_SCREEN':
      response = currentScreenContext || 'Reading the current screen content aloud.';
      logs = [
        'Traversing active window view hierarchy.',
        'Extracting text and content descriptions from all nodes.',
        'Concatenating readable text.',
        'Passing text to TTS engine.',
      ];
      break;

    case 'MAGNIFY':
      response = 'Magnifying screen.';
      logs = ['Dispatching GLOBAL_ACTION_TOGGLE_SPLIT_SCREEN.', 'Enabling magnification gesture.'];
      break;

    case 'ZOOM_OUT':
      response = 'Zooming out.';
      logs = ['Disabling magnification gesture.'];
      break;

    case 'SCREENSHOT':
      response = 'Taking screenshot.';
      logs = ['Dispatching GLOBAL_ACTION_TAKE_SCREENSHOT.'];
      break;

    case 'BRIGHTNESS_UP':
      response = 'Increasing brightness.';
      logs = ['Settings.System: adjusting SCREEN_BRIGHTNESS (+30).'];
      break;

    case 'BRIGHTNESS_DOWN':
      response = 'Decreasing brightness.';
      logs = ['Settings.System: adjusting SCREEN_BRIGHTNESS (-30).'];
      break;

    case 'LOCK':
      response = 'Locking the screen.';
      logs = ['Dispatching GLOBAL_ACTION_LOCK_SCREEN.'];
      break;

    case 'NOTIFICATIONS':
      response = 'Opening notifications.';
      logs = ['Dispatching GLOBAL_ACTION_NOTIFICATIONS.'];
      break;

    // ── EMERGENCY ──
    case 'EMERGENCY':
      response = '🚨 Emergency mode activated! Calling your emergency contact.';
      logs = [
        '🚨 EMERGENCY DETECTED.',
        'Loading emergency contact from settings.',
        'Initiating emergency call.',
        'Sending SOS SMS with GPS location.',
        'Playing alert tone.',
      ];
      break;

    // ── NLP FALLBACK ──
    case 'NLP_PARSED':
      response = `I partially understood that. You said: "${command.text}". Could you rephrase?`;
      logs = [
        'NLP extracted partial intent.',
        `Detected target: "${command.target || 'none'}".`,
        'Confidence too low for autonomous execution.',
      ];
      break;

    // ── UNKNOWN ──
    default:
      response = `I didn't understand "${transcript}". Try saying "Open WhatsApp" or "Go back".`;
      logs = ['Intent could not be resolved.'];
  }

  return { type: command.action, response, command, logs };
}
