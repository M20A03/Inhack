import { auth, provider, signInWithPopup, signInAnonymously } from '../utils/firebase';
import { useState } from 'react';
import { UserCheck } from 'lucide-react';

export function AuthComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.warn('Google Popup failed, trying fallback:', err);
      // If webview blocks popup, try anonymous fallback
      try {
        await signInAnonymously(auth);
      } catch (fallbackErr: any) {
        setError("Could not complete sign in. Please try Guest Sign-In.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error(err);
      setError("Guest sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-slate-800 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans rounded-3xl border border-slate-200 shadow-2xl">
      <main className="w-full max-w-md flex flex-col items-center text-center space-y-6">
        {/* Brand Section */}
        <div className="flex flex-col items-center space-y-3 w-full">
          <div className="w-28 h-28 rounded-3xl border-4 border-emerald-600 flex items-center justify-center p-1 bg-white shadow-md overflow-hidden">
            <img src="/logo.jpg" alt="Sahayak Official Logo" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-emerald-800">sahayak</h1>
            <p className="text-xs text-amber-700 tracking-widest uppercase font-bold">ALWAYS HERE TO HELP</p>
          </div>
        </div>


        {/* Login Actions */}
        <div className="w-full space-y-3 px-2">
          {error && (
            <div className="w-full bg-rose-50 text-rose-700 p-3 rounded-2xl text-xs font-semibold border border-rose-200">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white text-slate-700 border border-slate-300 rounded-2xl flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all shadow-sm active:scale-98 font-bold text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>

          <button 
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98 font-bold text-sm"
          >
            <UserCheck className="w-5 h-5" />
            <span>Continue as Guest User</span>
          </button>
        </div>
      </main>
    </div>
  );
}

