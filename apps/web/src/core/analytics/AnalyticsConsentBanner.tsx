import { useState } from 'react';
import { analytics } from '.';

export function AnalyticsConsentBanner() {
  const [show, setShow] = useState(() => {
    return localStorage.getItem('tadabbur_analytics_consent') === null;
  });

  if (!show) return null;

  function handleChoice(granted: boolean) {
    analytics.setConsent(granted);
    setShow(false);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-stone-900 text-stone-100 p-4 rounded-2xl shadow-xl z-50 border border-stone-800 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-sm text-stone-100">Anonymous Usage Analytics</h4>
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
            We use pseudonymous usage insights (e.g. Surah views) to improve app performance. We never collect note text or personal data.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-1">
        <button
          onClick={() => handleChoice(false)}
          className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 font-medium rounded-lg transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => handleChoice(true)}
          className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
