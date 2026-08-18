import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-6 right-6 bg-accent text-accent-fg px-6 py-4 rounded-full shadow-2xl flex items-center justify-center gap-3 hover:scale-105 transition-transform border-4 border-black font-bold z-50"
      aria-label="Install App"
    >
      <Download size={24} />
      <span>Install App</span>
    </button>
  );
}
