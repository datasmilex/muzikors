'use client';

import React from 'react';
import { AppProvider } from '../../context/AppContext';
import { JukeboxView } from '../../components/JukeboxView';

export default function WebJukeboxApp() {
  return (
    <AppProvider>
      <main className="min-h-screen landscape:min-h-0 landscape:h-screen landscape:h-[100dvh] bg-[var(--theme-bg)] text-white flex justify-center selection:bg-amber-400 selection:text-black transition-colors duration-300 overflow-x-hidden landscape:overflow-hidden">
        <JukeboxView />
      </main>
    </AppProvider>
  );
}
