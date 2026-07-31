'use client';

import React from 'react';
import { AppProvider } from '../context/AppContext';
import { Header } from '../components/Header';

import { NowPlayingSection } from '../components/NowPlayingSection';
import { UpNextQueueSection } from '../components/UpNextQueueSection';
import { VenueGuard } from '../components/VenueGuard';
import { DrawerMenu } from '../components/DrawerMenu';
import { BottomNav } from '../components/BottomNav';
import { CreditTopUpModal } from '../components/CreditTopUpModal';
import { MusicSearchModal } from '../components/MusicSearchModal';
import { ProfileView } from '../components/ProfileView';
import { LoginModal } from '../components/LoginModal';
import { QrScannerModal } from '../components/QrScannerModal';
import { GpsMapModal } from '../components/GpsMapModal';
import { InfoModals } from '../components/InfoModals';
import { VenueInfoModal } from '../components/VenueInfoModal';
import { DailyRewardModal } from '../components/DailyRewardModal';
import { ToastNotification } from '../components/ToastNotification';
import { TvShoutoutModal } from '../components/TvShoutoutModal';
import { LeaderboardModal } from '../components/LeaderboardModal';

import { HappyHourBanner } from '../components/HappyHourBanner';
import { GatewayScreen } from '../components/GatewayScreen';
import { useApp } from '../context/AppContext';

const AppContent = () => {
  const { isVenueBound, hasEnteredGateway, openModal } = useApp();
  const showGateway = isVenueBound && !hasEnteredGateway;

  return (
    <div className="w-full max-w-md min-h-screen bg-[#0A0A0A] flex flex-col relative shadow-[0_0_50px_rgba(212,175,55,0.1)] border-x border-[#D4AF37]/10 overflow-x-hidden">
      {/* Global Cinematic Mesh Gradients */}
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#D4AF37]/10 via-transparent to-transparent z-0 pointer-events-none blur-3xl opacity-60" />
      <div className="fixed bottom-0 right-0 w-[80vw] h-[40vh] bg-gradient-to-tr from-[#D4AF37]/5 via-[#120C08] to-transparent z-0 pointer-events-none blur-3xl opacity-50" />
      {showGateway ? (
        <GatewayScreen />
      ) : (
        <>
          <Header />
          <HappyHourBanner />
          <VenueGuard>

            <NowPlayingSection />
            <UpNextQueueSection />
            <BottomNav />
          </VenueGuard>
        </>
      )}

      <DrawerMenu />
      <LeaderboardModal />
      <CreditTopUpModal />
      <MusicSearchModal />
      <ProfileView />
      <LoginModal />
      <QrScannerModal />
      <GpsMapModal />
      <VenueInfoModal />
      <InfoModals />
      <DailyRewardModal />
      <TvShoutoutModal />
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
