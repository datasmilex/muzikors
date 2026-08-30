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
import { PremiumModal } from '../components/PremiumModal';
import { DailyRewardModal } from '../components/DailyRewardModal';
import { RewardedAdModal } from '../components/RewardedAdModal';
import { ToastNotification } from '../components/ToastNotification';
import { GlobalFeedView } from '../components/GlobalFeedView';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { LyricsModal } from '../components/LyricsModal';
import { MenuModal } from '../components/MenuModal';
import { VenueOwnerModal } from '../components/VenueOwnerModal';

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
    <div className="w-full max-w-md min-h-screen bg-[var(--theme-bg)] flex flex-col relative shadow-[0_0_80px_rgba(0,0,0,0.9)] border-x border-white/[0.06] overflow-x-hidden transition-colors duration-300">
      
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
      <MenuModal />
      <VenueOwnerModal />
      <InfoModals />
      <DailyRewardModal />
      <RewardedAdModal />
      <PremiumModal />
      <GlobalFeedView />
      <LyricsModal />
      <ToastNotification />
    </div>
  );
};

export default function Home() {
  return (
    <AppProvider>
      <main className="min-h-screen bg-[var(--theme-bg)] text-white flex justify-center selection:bg-amber-400 selection:text-black transition-colors duration-300">
        <AppContent />
      </main>
    </AppProvider>
  );
}
