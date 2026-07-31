'use client';

import React from 'react';
import { AppProvider } from '../context/AppContext';
import { Header } from '../components/Header';
import { TopRowCards } from '../components/TopRowCards';
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
    <div className="w-full max-w-md min-h-screen bg-[#120C08] flex flex-col relative shadow-[0_0_50px_rgba(212,175,55,0.15)] border-x border-[#D4AF37]/15">
      {showGateway ? (
        <GatewayScreen />
      ) : (
        <>
          <Header />
          <HappyHourBanner />
          <VenueGuard>
            <TopRowCards />
            <NowPlayingSection />
            <UpNextQueueSection />
            
            {/* Footer KVKK */}
            <div className="w-full text-center pb-24 pt-4 z-10 relative px-4">
              <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[10px] text-gray-500">
                <a href="/legal/terms" className="hover:text-[#E5A93C] underline underline-offset-2 transition-colors">Hizmet Sözleşmesi</a>
                <a href="/legal/privacy" className="hover:text-[#E5A93C] underline underline-offset-2 transition-colors">Gizlilik & KVKK</a>
                <a href="/legal/refund" className="hover:text-[#E5A93C] underline underline-offset-2 transition-colors">İptal & İade</a>
                <a href="/legal/sales" className="hover:text-[#E5A93C] underline underline-offset-2 transition-colors">Mesafeli Satış</a>
              </div>
            </div>
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
