'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { AppProvider } from '../context/AppContext';
import { JukeboxView } from '../components/JukeboxView';
import { ShowcaseLanding } from '../components/showcase/ShowcaseLanding';

function HomeRouter() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  // 1. Critical QR venue compatibility:
  // Existing printed venue QR codes link to: muzikors.com.tr/?v=2, ?venue=..., ?kafe_id=..., etc.
  // We check BOTH Next.js searchParams and raw window.location.search to ensure 100% reliability.
  const hasVenueParam = Boolean(
    searchParams?.get('v') ||
    searchParams?.get('venue') ||
    searchParams?.get('kafe_id') ||
    searchParams?.get('venue_id') ||
    (typeof window !== 'undefined' && /[?&](v|venue|kafe_id|venue_id)=/i.test(window.location.search))
  );

  // 2. Native mobile application check:
  // If running inside Capacitor Android/iOS shell, users must ALWAYS get the Jukebox directly.
  const isNativeApp = isNative || (typeof window !== 'undefined' && (window as any)?.Capacitor?.isNativePlatform?.());

  if (isNativeApp || hasVenueParam) {
    return (
      <main className="min-h-screen landscape:min-h-0 landscape:h-screen landscape:h-[100dvh] bg-[var(--theme-bg)] text-white flex justify-center selection:bg-amber-400 selection:text-black transition-colors duration-300 overflow-x-hidden landscape:overflow-hidden">
        <JukeboxView />
      </main>
    );
  }

  // Hydration safety check before mount
  if (!mounted) {
    if (typeof window !== 'undefined') {
      const winHasParams = /[?&](v|venue|kafe_id|venue_id)=/i.test(window.location.search);
      const winIsNative = (window as any)?.Capacitor?.isNativePlatform?.();
      if (winHasParams || winIsNative) {
        return (
          <main className="min-h-screen landscape:min-h-0 landscape:h-screen landscape:h-[100dvh] bg-[var(--theme-bg)] text-white flex justify-center selection:bg-amber-400 selection:text-black transition-colors duration-300 overflow-x-hidden landscape:overflow-hidden">
            <JukeboxView />
          </main>
        );
      }
    }
  }

  // 3. Web visitor with no QR parameters -> Showcase Landing Page!
  return <ShowcaseLanding />;
}

export default function Home() {
  return (
    <AppProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#070604]" />}>
        <HomeRouter />
      </Suspense>
    </AppProvider>
  );
}
