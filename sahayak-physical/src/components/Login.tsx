import { auth, provider, signInWithPopup } from '../utils/firebase';
import { LogIn } from 'lucide-react';
import { useState } from 'react';

export function Login() {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <LogIn className="w-10 h-10 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Sahayak</h1>
        <p className="text-gray-500 mb-8">
          Sign in to access your accessibility settings, saved text, and preferences across devices.
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="mt-8 pt-6 border-t border-gray-100 w-full">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
