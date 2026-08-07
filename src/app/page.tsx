'use client';

import React from 'react';
import { AppProvider } from '../context/AppContext';
import { Header } from '../components/Header';

import { NowPlayingSection } from '../components/NowPlayingSection';
import { UpNextQueueSection } from '../components/UpNextQueueSection';
import { VenueGuard } from '../components/VenueGuard';
import { DrawerMenu } from '../components/DrawerMenu';
import { BottomNav } from '../components/BottomNav';
import { MusicSearchModal } from '../components/MusicSearchModal';
import { ProfileView } from '../components/ProfileView';
import { LoginModal } from '../components/LoginModal';
import { QrScannerModal } from '../components/QrScannerModal';
import { GpsMapModal } from '../components/GpsMapModal';
import { InfoModals } from '../components/InfoModals';
import { VenueInfoModal } from '../components/VenueInfoModal';
import { DailyRewardModal } from '../components/DailyRewardModal';
import { ToastNotification } from '../components/ToastNotification';
import { GlobalFeedView } from '../components/GlobalFeedView';
import { LeaderboardModal } from '../components/LeaderboardModal';

import { QuickActionsBanner } from '../components/QuickActionsBanner';
import { GatewayScreen } from '../components/GatewayScreen';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { TutorialManager } from '../components/TutorialManager';
import { BetaTesterWelcomeModal } from '../components/BetaTesterWelcomeModal';
import { useApp } from '../context/AppContext';

const AppContent = () => {
  const { isVenueBound, hasEnteredGateway } = useApp();
  const showGateway = isVenueBound && !hasEnteredGateway;

  return (
    <div className="w-full max-w-md min-h-screen bg-[#0A0A0A] flex flex-col relative shadow-[0_0_50px_rgba(212,175,55,0.1)] border-x border-[#D4AF37]/10 overflow-x-hidden app-bg-gradient">
      
      {!isVenueBound ? (
        <WelcomeScreen />
      ) : showGateway ? (
        <GatewayScreen />
      ) : (
        <>
          <Header />
          <QuickActionsBanner />
          <VenueGuard>
            <NowPlayingSection />
            <UpNextQueueSection />
            <BottomNav />
          </VenueGuard>
        </>
      )}

      <TutorialManager />
      <BetaTesterWelcomeModal />
      <DrawerMenu />
      <LeaderboardModal />
      <MusicSearchModal />
      <ProfileView />
      <LoginModal />
      <QrScannerModal />
      <GpsMapModal />
      <VenueInfoModal />
      <InfoModals />
      <DailyRewardModal />
      <GlobalFeedView />
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
