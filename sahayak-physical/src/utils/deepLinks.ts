import { AppLauncher } from '@capacitor/app-launcher';
import { Capacitor } from '@capacitor/core';

/**
 * Executes deep links and native device actions.
 * Handles: OPEN_APP, BACK, HOME, SCROLL, SEARCH, CALL, and all navigation actions.
 */
export async function executeDeepLink(action: string, target?: string, text?: string) {
  const t = (target || '').toLowerCase().trim();
  const isNative = Capacitor.isNativePlatform();

  // ── NAVIGATION ACTIONS (Face Gesture + Voice) ──
  if (action === 'BACK') {
    window.history.back();
    return;
  }

  if (action === 'HOME') {
    // On web/PWA, scroll to top & reset view
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (action === 'SCROLL_DOWN') {
    window.scrollBy({ top: 400, behavior: 'smooth' });
    return;
  }

  if (action === 'SCROLL_UP') {
    window.scrollBy({ top: -400, behavior: 'smooth' });
    return;
  }

  // ── APP LAUNCHING ──
  if (action === 'OPEN_APP' || action === 'OPEN_AND_SEND' || action === 'OPEN_AND_SEARCH' || action === 'OPEN_AND_DO') {

    // Map of apps → Android intent URIs (package-based = most reliable) + web fallback
    const APP_INTENTS: Record<string, { intent: string; web: string }> = {
      whatsapp: {
        intent: 'intent://#Intent;package=com.whatsapp;scheme=whatsapp;end',
        web: 'https://api.whatsapp.com/',
      },
      youtube: {
        intent: 'intent://#Intent;package=com.google.android.youtube;scheme=vnd.youtube;end',
        web: 'https://www.youtube.com',
      },
      spotify: {
        intent: 'intent://#Intent;package=com.spotify.music;scheme=spotify;end',
        web: 'https://open.spotify.com',
      },
      maps: {
        intent: 'intent://maps.google.com/maps#Intent;package=com.google.android.apps.maps;scheme=https;end',
        web: 'https://maps.google.com',
      },
      'google maps': {
        intent: 'intent://maps.google.com/maps#Intent;package=com.google.android.apps.maps;scheme=https;end',
        web: 'https://maps.google.com',
      },
      instagram: {
        intent: 'intent://#Intent;package=com.instagram.android;scheme=instagram;end',
        web: 'https://www.instagram.com',
      },
      gmail: {
        intent: 'intent://#Intent;package=com.google.android.gm;scheme=googlegmail;end',
        web: 'mailto:',
      },
      settings: {
        intent: 'intent://#Intent;action=android.settings.SETTINGS;end',
        web: '',
      },
      camera: {
        intent: 'intent://#Intent;action=android.media.action.IMAGE_CAPTURE;end',
        web: '',
      },
      chrome: {
        intent: 'intent://#Intent;package=com.android.chrome;scheme=https;end',
        web: 'https://www.google.com',
      },
      telegram: {
        intent: 'intent://#Intent;package=org.telegram.messenger;scheme=tg;end',
        web: 'https://web.telegram.org',
      },
      facebook: {
        intent: 'intent://#Intent;package=com.facebook.katana;scheme=fb;end',
        web: 'https://www.facebook.com',
      },
    };

    // Phone/dialer special case
    if (t.includes('phone') || t.includes('dialer') || t.includes('call')) {
      const telUrl = `tel:${text || ''}`;
      try {
        await AppLauncher.openUrl({ url: telUrl });
      } catch {
        window.open(telUrl, '_system');
      }
      return;
    }

    // Find matching app config
    let appConfig: { intent: string; web: string } | null = null;
    for (const [key, config] of Object.entries(APP_INTENTS)) {
      if (t.includes(key) || key.includes(t)) {
        appConfig = config;
        break;
      }
    }

    if (isNative && appConfig) {
      // Try Android intent URI first (most reliable on native)
      try {
        await AppLauncher.openUrl({ url: appConfig.intent });
        return;
      } catch (e) {
        console.warn('[DeepLink] Intent launch failed, trying web fallback:', e);
      }
    }

    // Web fallback
    const webUrl = appConfig?.web || `https://www.google.com/search?q=${encodeURIComponent(t + ' app')}`;
    if (webUrl) {
      try {
        await AppLauncher.openUrl({ url: webUrl });
      } catch {
        window.open(webUrl, '_blank');
      }
    }
    return;
  }

  // ── SEARCH ──
  if (action === 'SEARCH' || action === 'OPEN_AND_SEARCH') {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text || '')}`;
    try {
      await AppLauncher.openUrl({ url: searchUrl });
    } catch {
      window.open(searchUrl, '_blank');
    }
    return;
  }

  // ── CALL ──
  if (action === 'CALL') {
    const telUrl = `tel:${text || ''}`;
    try {
      await AppLauncher.openUrl({ url: telUrl });
    } catch {
      window.open(telUrl, '_system');
    }
    return;
  }
}
