import React, { useState } from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';

export function AccessibilityServiceDemo() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div className="mt-8 p-4 bg-blue-900/30 border border-blue-800 rounded-xl cognitive-hide">
      <div className="flex items-start gap-3">
        <ShieldAlert className="text-blue-400 mt-1 shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-lg mb-2">Universal App Control</h3>
          <p className="text-sm text-gray-300 mb-4">
            (Conceptual Demo) Activating the Android Accessibility Service allows Sahayak to read screens from other apps and simulate touches for motor-impaired users.
          </p>
          
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
              isEnabled ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            {isEnabled ? (
              <>
                <CheckCircle size={20} />
                Service Enabled
              </>
            ) : (
              'Enable Accessibility Service'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
