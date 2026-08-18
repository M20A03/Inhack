import SpotifyWebApi from 'spotify-web-api-js';
import { SPOTIFY_CLIENT_ID } from './config';

const spotifyApi = new SpotifyWebApi();

const redirectUri = window.location.origin; // Dynamically use the current origin

export const getSpotifyApi = () => spotifyApi;

// OAuth PKCE flow functions
function generateRandomString(length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function loginWithSpotify() {
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('spotify_verifier', verifier);

  const scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state streaming';
  
  const args = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge
  });

  window.location.href = `https://accounts.spotify.com/authorize?${args}`;
}

export async function handleSpotifyCallback(code: string) {
  const verifier = localStorage.getItem('spotify_verifier');
  if (!verifier) return null;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      spotifyApi.setAccessToken(data.access_token);
      localStorage.setItem('spotify_token', data.access_token);
      return data.access_token;
    }
  } catch (error) {
    console.error('Error getting Spotify token', error);
  }
  return null;
}

export function initializeSpotifyFromStorage() {
  const token = localStorage.getItem('spotify_token');
  if (token) {
    spotifyApi.setAccessToken(token);
    return token;
  }
  return null;
}
