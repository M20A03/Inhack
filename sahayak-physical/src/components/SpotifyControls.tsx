import { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, LogIn, RefreshCw } from 'lucide-react';
import { spotify, getSpotifyAuthUrl, SpotifyTrack } from '../utils/spotify';

export function SpotifyControls() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(false);

  // Parse token from hash fragment on callback
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get('access_token');
      if (token) {
        spotify.setToken(token);
        setIsAuthenticated(true);
        window.location.hash = ''; // clear hash
      }
    } else {
      setIsAuthenticated(spotify.isAuthenticated());
    }
  }, []);

  const fetchCurrentTrack = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    const data = await spotify.getCurrentlyPlaying();
    setTrack(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentTrack();
      const interval = setInterval(fetchCurrentTrack, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    window.location.href = getSpotifyAuthUrl();
  };

  const handlePlay = async () => {
    await spotify.play();
    fetchCurrentTrack();
  };

  const handlePause = async () => {
    await spotify.pause();
    fetchCurrentTrack();
  };

  const handleNext = async () => {
    await spotify.next();
    fetchCurrentTrack();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-4 w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-800">
          <Music className="text-emerald-600" /> Spotify Controls
        </h2>
        <p className="text-sm text-slate-600">
          Connect your Spotify Premium account to control music hands-free with voice or switch control.
        </p>
        <button
          onClick={handleLogin}
          className="w-full py-4 mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <LogIn size={20} /> Login to Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-800">
          <Music className="text-emerald-600" /> Spotify Active
        </h2>
        <button onClick={fetchCurrentTrack} className="p-2 text-slate-500 hover:text-slate-800">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {track ? (
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {track.albumArt && (
            <img src={track.albumArt} alt={track.album} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">{track.name}</h3>
            <p className="text-xs text-slate-500 truncate">{track.artist}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-2xl border border-slate-200">No track playing. Start Spotify on your device.</p>
      )}

      <div className="flex gap-3 mt-1">
        <button
          onClick={handlePlay}
          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm"
        >
          <Play size={20} /> Play
        </button>
        <button
          onClick={handlePause}
          className="flex-1 py-4 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200"
        >
          <Pause size={20} /> Pause
        </button>
        <button
          onClick={handleNext}
          className="p-4 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-200"
        >
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
}

