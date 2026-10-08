import React from 'react';
import { Share2, Disc3, MapPin } from 'lucide-react';

export default function MuzikorsWrappedCard({ userStats }: { userStats?: any }) {
  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Muzikors İstatistiklerim',
        text: 'Bu ay kahve içerken en çok Indie Rock dinlettim!',
        url: 'https://muzikors.com',
      });
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#111] rounded-3xl p-8 border border-[#222] flex flex-col min-h-[400px]">
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#facc15] opacity-5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Disc3 className="w-6 h-6 text-white" />
            <span className="text-white font-bold tracking-widest text-sm uppercase">Muzikors Kaset</span>
          </div>
          <span className="text-gray-500 text-xs font-medium px-2 py-1 bg-[#1a1a1a] rounded-md">Kasım 2026</span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">En Çok Dinlettiğin Mekan</p>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#10b981]" />
              {userStats?.topCafe || 'Mekan Seçilmedi'}
            </h3>
          </div>

          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Ruh Halin</p>
            <h3 className="text-4xl font-black text-[#facc15] tracking-tight">
              {userStats?.topGenre || 'Bilinmiyor'}
            </h3>
          </div>

          <div className="pt-4 border-t border-[#222]">
            <p className="text-gray-400 text-sm">
              Kafelere toplam <span className="text-white font-bold">{userStats?.totalRequests || 0}</span> şarkı hediye ettin.
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleShare}
        className="relative z-10 mt-8 w-full bg-white text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform duration-150 ease-out hover:bg-gray-200 min-h-[44px]"
      >
        <Share2 className="w-5 h-5" />
        İstatistiklerimi Paylaş
      </button>
    </div>
  );
}
