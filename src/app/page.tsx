'use client';

import React from 'react';
import { AppProvider } from '../context/AppContext';
import { Header } from '../components/Header';
import { TopRowCards } from '../components/TopRowCards';
import { GpsBanner } from '../components/GpsBanner';
import { NowPlayingSection } from '../components/NowPlayingSection';
import { UpNextQueueSection } from '../components/UpNextQueueSection';
import { StickyAddMusicButton } from '../components/StickyAddMusicButton';
import { VenueGuard } from '../components/VenueGuard';
import { DrawerMenu } from '../components/DrawerMenu';
import { CreditTopUpModal } from '../components/CreditTopUpModal';
import { MusicSearchModal } from '../components/MusicSearchModal';
import { ProfileView } from '../components/ProfileView';
import { LoginModal } from '../components/LoginModal';
import { QrScannerModal } from '../components/QrScannerModal';
import { GpsMapModal } from '../components/GpsMapModal';
import { InfoModals } from '../components/InfoModals';
import { ToastNotification } from '../components/ToastNotification';

import { GatewayScreen } from '../components/GatewayScreen';
import { useApp } from '../context/AppContext';

const AppContent = () => {
  const { isVenueBound, hasEnteredGateway, openModal } = useApp();
  const showGateway = isVenueBound && !hasEnteredGateway;

  return (
    <div className="w-full max-w-md min-h-screen bg-[#120C08] flex flex-col relative shadow-[0_0_50px_rgba(212,175,55,0.15)] border-x border-[#D4AF37]/15">
      {showGateway ? (
        <GatewayScreen />
      ) : (
        <>
          <Header />
          <VenueGuard>
            <TopRowCards />
            <GpsBanner />
            <NowPlayingSection />
            <UpNextQueueSection />
            
            {/* Footer KVKK */}
            <div className="w-full text-center pb-24 pt-4 z-10 relative">
              <button
                onClick={() => openModal('terms')}
                className="text-[10px] text-gray-500 hover:text-[#E5A93C] underline underline-offset-2 transition-colors"
              >
                Kullanım Koşulları & KVKK Aydınlatma Metni
              </button>
            </div>

            <StickyAddMusicButton />
          </VenueGuard>
        </>
      )}

      <DrawerMenu />
      <CreditTopUpModal />
      <MusicSearchModal />
      <ProfileView />
      <LoginModal />
      <QrScannerModal />
      <GpsMapModal />
      <InfoModals />
      <ToastNotification />
    </div>
  );
};

export default function Home() {
  return (
    <AppProvider>
      <main className="min-h-screen bg-[#120C08] text-[#FCEFD5] flex justify-center selection:bg-[#D4AF37] selection:text-black">
        <AppContent />
      </main>
    </AppProvider>
  );
}
