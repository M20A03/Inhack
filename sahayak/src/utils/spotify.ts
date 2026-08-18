// src/utils/spotify.ts
import { CONFIG } from './config';

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
}

export const getSpotifyAuthUrl = () => {
  const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
  ];
  return `https://accounts.spotify.com/authorize?client_id=${
    CONFIG.SPOTIFY.clientId
  }&redirect_uri=${encodeURIComponent(
    CONFIG.SPOTIFY.redirectUri
  )}&scope=${encodeURIComponent(scopes.join(' '))}&response_type=token&show_dialog=true`;
};

export class SpotifyService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('spotify_access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('spotify_access_token', token);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('spotify_access_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async apiCall(endpoint: string, method: string = 'GET', body?: any) {
    if (!this.token) throw new Error('Not authenticated');

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === 401) {
      this.logout();
      throw new Error('Spotify session expired');
    }

    if (res.status === 204) return null;
    return res.json();
  }

  async getCurrentlyPlaying(): Promise<SpotifyTrack | null> {
    try {
      const data = await this.apiCall('/me/player/currently-playing');
      if (!data || !data.item) return null;
      return {
        id: data.item.id,
        name: data.item.name,
        artist: data.item.artists.map((a: any) => a.name).join(', '),
        album: data.item.album.name,
        albumArt: data.item.album.images[0]?.url || ''
      };
    } catch {
      return null;
    }
  }

  async play() {
    return this.apiCall('/me/player/play', 'PUT').catch(() => {});
  }

  async pause() {
    return this.apiCall('/me/player/pause', 'PUT').catch(() => {});
  }

  async next() {
    return this.apiCall('/me/player/next', 'POST').catch(() => {});
  }

  async previous() {
    return this.apiCall('/me/player/previous', 'POST').catch(() => {});
  }
}

export const spotify = new SpotifyService();
