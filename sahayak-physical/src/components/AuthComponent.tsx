import { auth, provider, signInWithPopup } from '../utils/firebase';
import { LogIn } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans text-yellow-400">
      <div className="max-w-md w-full bg-zinc-950 rounded-3xl shadow-xl p-8 border-2 border-yellow-500 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6 border-2 border-yellow-500">
          <LogIn className="w-10 h-10 text-yellow-400" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Welcome to Sahayak</h1>
        <p className="text-yellow-300 mb-8">
          Sign in to access your accessibility settings, saved text, and preferences across devices.
        </p>

        {error && (
          <div className="w-full bg-zinc-900 text-red-500 p-3 rounded-lg mb-4 text-sm border border-red-500">
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-yellow-400 text-black font-bold py-4 px-4 rounded-xl hover:bg-yellow-300 transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="mt-8 pt-6 border-t border-yellow-500/20 w-full">
          <p className="text-xs text-yellow-600">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
