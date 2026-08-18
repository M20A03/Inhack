import { AppLauncher } from '@capacitor/app-launcher';

export async function executeDeepLink(action: string, target?: string, text?: string) {
  const t = target?.toLowerCase().trim() || '';
  
  if (action === 'OPEN_APP') {
    let appUrl = '';
    let webUrl = '';

    if (t.includes('whatsapp')) {
      appUrl = 'whatsapp://send';
      webUrl = 'https://wa.me/';
    } else if (t.includes('youtube')) {
      appUrl = 'vnd.youtube://';
      webUrl = 'https://youtube.com';
    } else if (t.includes('spotify')) {
      appUrl = 'spotify://';
      webUrl = 'https://open.spotify.com';
    } else if (t.includes('map') || t.includes('location')) {
      appUrl = 'geo:0,0?q=';
      webUrl = 'https://maps.google.com';
    } else if (t.includes('gmail') || t.includes('mail')) {
      appUrl = 'googlegmail://';
      webUrl = 'mailto:';
    } else if (t.includes('instagram')) {
      appUrl = 'instagram://';
      webUrl = 'https://instagram.com';
    } else if (t.includes('phone') || t.includes('dialer') || t.includes('call')) {
      window.location.href = `tel:${text || ''}`;
      return;
    } else if (t.includes('camera')) {
      appUrl = 'intent:#Intent;action=android.media.action.IMAGE_CAPTURE;end';
    } else if (t.includes('setting')) {
      appUrl = 'intent:#Intent;action=android.settings.SETTINGS;end';
    } else {
      webUrl = `https://www.google.com/search?q=${encodeURIComponent(t)}`;
    }

    if (appUrl) {
      try {
        const canOpen = await AppLauncher.canOpenUrl({ url: appUrl });
        if (canOpen.value) {
          await AppLauncher.openUrl({ url: appUrl });
          return;
        }
      } catch (e) {
        console.warn('AppLauncher failed, falling back to URL redirect', e);
      }
    }

    if (webUrl) {
      window.location.href = webUrl;
    }
  } else if (action === 'SEARCH') {
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(text || '')}`;
  } else if (action === 'CALL') {
    window.location.href = `tel:${text || ''}`;
  }
}

