import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';
import { loginWithSpotify, initializeSpotifyFromStorage, getSpotifyApi } from '../utils/spotify';

export function SpotifyControls() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  useEffect(() => {
    const token = initializeSpotifyFromStorage();
    if (token) {
      setIsAuthenticated(true);
      fetchCurrentTrack();
    }
  }, []);

  const fetchCurrentTrack = async () => {
    try {
      const api = getSpotifyApi();
      const state = await api.getMyCurrentPlaybackState();
      if (state && state.item) {
        setCurrentTrack(state.item);
      }
    } catch (e) {
      console.error('Error fetching track', e);
    }
  };

  const handlePlayPause = async () => {
    try {
      const api = getSpotifyApi();
      const state = await api.getMyCurrentPlaybackState();
      if (state && state.is_playing) {
        await api.pause();
      } else {
        await api.play();
      }
      setTimeout(fetchCurrentTrack, 500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNext = async () => {
    try {
      await getSpotifyApi().skipToNext();
      setTimeout(fetchCurrentTrack, 500);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrevious = async () => {
    try {
      await getSpotifyApi().skipToPrevious();
      setTimeout(fetchCurrentTrack, 500);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-8 p-4 bg-gray-900 rounded-xl border border-gray-700 cognitive-hide">
        <div className="flex items-center gap-3 mb-4">
          <Music className="text-green-500" size={24} />
          <h3 className="font-bold text-lg">Spotify Integration</h3>
        </div>
        <button
          onClick={loginWithSpotify}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold"
        >
          Connect to Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 p-4 bg-gray-900 rounded-xl border border-gray-700 cognitive-hide" role="region" aria-label="Spotify Player">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Music className="text-green-500" size={24} />
          <span className="font-bold truncate max-w-[200px]">
            {currentTrack ? `${currentTrack.name} - ${currentTrack.artists[0]?.name}` : 'Not playing'}
          </span>
        </div>
      </div>
      
      <div className="flex justify-center items-center gap-6">
        <button onClick={handlePrevious} className="p-3 bg-gray-800 rounded-full hover:bg-gray-700" aria-label="Previous track">
          <SkipBack size={24} />
        </button>
        <button onClick={handlePlayPause} className="p-4 bg-green-600 text-black rounded-full hover:bg-green-500" aria-label="Play or Pause">
          <Play size={28} className="ml-1" />
        </button>
        <button onClick={handleNext} className="p-3 bg-gray-800 rounded-full hover:bg-gray-700" aria-label="Next track">
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
}
