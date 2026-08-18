import { auth, provider, signInWithPopup } from '../utils/firebase';
import { useState } from 'react';

export function AuthComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-forest text-on-surface flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Background Decoration blur */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none flex justify-center items-center">
        <div className="w-[600px] h-[600px] bg-primary rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <main className="w-full max-w-md z-10 flex flex-col items-center text-center space-y-12 relative bg-surface-dark/40 border border-outline-variant/35 p-8 rounded-3xl backdrop-blur-md">
        {/* Brand Section */}
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="w-40 h-40 rounded-full border border-outline-variant/40 flex items-center justify-center p-3 bg-surface-dark shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
            <img 
              alt="Sahayak Logo" 
              className="w-full h-full object-contain relative z-10 drop-shadow-xl rounded-full" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeHda1h3O2KL-iSx1SUyzrg6DgV0iIQIQY3CH5gWA8w1wd4R0e8zIeDTEIagL957sDCKDVYjXphQZshFwzseFtxZcKxVKHPmwQDwHdT-RfH9-tJM0cJ8ryUKAgBN0aNDcEiR3FjKNfAxE1XqTOK9i95GJyrP034R-DLS6BLywbNk7JY7Q-lPFKXAEUFeaz3e8wEC0S-LGSy5y6TVn6eucCi52Wc5Mr-kEf5Z_EmOT3wtFKp-q-4Mgv2SpGnfrhQVLw"
            />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-5xl font-extrabold text-primary">Sahayak</h1>
            <p className="font-sans text-xs text-accent-gold tracking-widest uppercase font-bold opacity-90">ALWAYS HERE TO HELP</p>
          </div>
        </div>

        {/* Login Actions */}
        <div className="w-full space-y-4 px-2">
          {error && (
            <div className="w-full bg-red-950/40 text-red-400 p-3 rounded-xl text-sm border border-red-500/30">
              {error}
            </div>
          )}

          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-16 bg-primary text-on-primary rounded-xl flex items-center justify-center space-x-3 hover:bg-secondary transition-all shadow-lg active:scale-95 duration-200 group font-bold"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="font-sans text-md font-bold">{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Decorative subtle elements */}
        <div className="w-full flex justify-center space-x-2 mt-4 opacity-40">
          <div className="w-2 h-2 rounded-full bg-accent-gold"></div>
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-secondary"></div>
        </div>
      </main>
    </div>
  );
}
