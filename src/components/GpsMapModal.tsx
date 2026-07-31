'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation, Store, List, Map as MapIcon, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Venue } from '../types';
import { Map, Marker, ZoomControl } from 'pigeon-maps';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // distance in km
};

export const GpsMapModal: React.FC = () => {
  const { activeModal, closeModal, activeVenue, openModal } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [radiusFilter, setRadiusFilter] = useState<number>(0); // 0 = Hepsi

  const ISTANBUL_CENTER = { lat: 41.0082, lng: 28.9784 };

  useEffect(() => {
    if (activeModal === 'map') {
      fetchVenues();
      getUserLocation();
    }
  }, [activeModal]);

  const fetchVenues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true);
    
    if (data && !error) {
      setVenues(data.map(v => ({
        id: v.id,
        name: v.venue_name,
        address: v.full_address || v.address || '',
        city: v.city,
        district: v.district,
        distance: '',
        logo: v.logo_url || '',
        coverImage: '',
        activeListeners: 0,
        currentSongTitle: '',
        currentSongArtist: '',
        latitude: v.latitude,
        longitude: v.longitude
      })));
    }
    setLoading(false);
  };

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLoc({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocError(null);
        },
        (err) => {
          console.error('Location error:', err);
          setUserLoc(ISTANBUL_CENTER); // Fallback
          setLocError('Konum alınamadı, varsayılan merkez gösteriliyor.');
        }
      );
    } else {
      setUserLoc(ISTANBUL_CENTER);
      setLocError('Tarayıcınız konum özelliğini desteklemiyor.');
    }
  };

  const processedVenues = useMemo(() => {
    let list = [...venues];
    if (userLoc) {
      list = list.map(v => {
        if (v.latitude && v.longitude) {
          v.computedDistance = getDistance(userLoc.lat, userLoc.lng, v.latitude, v.longitude);
        } else {
          v.computedDistance = 999999;
        }
        return v;
      });
      list.sort((a, b) => (a.computedDistance || 0) - (b.computedDistance || 0));

      if (radiusFilter > 0) {
        list = list.filter(v => (v.computedDistance || 0) <= radiusFilter);
      }
    }
    return list;
  }, [venues, userLoc, radiusFilter]);

  if (activeModal !== 'map') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="relative w-full max-w-md h-[88vh] sm:h-[650px] sm:rounded-[2rem] rounded-t-[2rem] p-5 z-10 shadow-[0_-10px_40px_rgba(212,175,55,0.15)] flex flex-col justify-between overflow-hidden glass-panel border border-[#D4AF37]/20 bg-[#120C08]"
        >
          {/* Header */}
          <div className="shrink-0 pb-3 border-b border-[#D4AF37]/20">
            <div className="w-12 h-1.5 rounded-full bg-[#D4AF37]/30 mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-base font-bold text-white tracking-wide">Mekanlar</h2>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {locError && <p className="text-[10px] text-red-400 mt-2">{locError}</p>}
          </div>

          {/* Toggle Map/List */}
          <div className="flex bg-[#1C130D] p-1 rounded-xl mt-3 mb-2 shrink-0 border border-[#D4AF37]/10">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${viewMode === 'list' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-amber-200/50'}`}
            >
              <List className="w-4 h-4" /> Liste
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${viewMode === 'map' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-amber-200/50'}`}
            >
              <MapIcon className="w-4 h-4" /> Harita
            </button>
          </div>

          {/* Filters */}
          {viewMode === 'list' && (
            <div className="shrink-0 mb-3 flex gap-2 overflow-x-auto no-scrollbar py-1">
              {[0, 1, 5, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusFilter(r)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${radiusFilter === r ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]' : 'border-white/10 text-gray-400 bg-white/5 hover:bg-white/10'}`}
                >
                  {r === 0 ? 'Tümü' : `${r} km`}
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative rounded-xl">
            {loading ? (
              <div className="h-full flex items-center justify-center text-amber-200/50 animate-pulse">
                Yükleniyor...
              </div>
            ) : viewMode === 'map' ? (
              <div className="w-full h-full bg-[#1A120B] rounded-xl overflow-hidden border border-[#D4AF37]/20 relative">
                {userLoc && (
                  <Map 
                    defaultCenter={[userLoc.lat, userLoc.lng]} 
                    defaultZoom={11}
                    provider={(x, y, z, dpr) => `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`}
                  >
                    <ZoomControl />
                    {userLoc !== ISTANBUL_CENTER && (
                      <Marker width={40} anchor={[userLoc.lat, userLoc.lng]}>
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                      </Marker>
                    )}
                    {processedVenues.filter(v => v.latitude && v.longitude).map((v) => (
                      <Marker key={v.id} width={40} anchor={[v.latitude!, v.longitude!]}>
                        <div 
                          className="flex flex-col items-center group cursor-pointer"
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`, '_blank')}
                        >
                          <div className="w-8 h-8 rounded-full gold-gradient-bg text-black flex items-center justify-center font-bold shadow-lg shadow-black/50 border-2 border-[#120C08] group-hover:scale-110 transition-transform">
                            <Store className="w-4 h-4" />
                          </div>
                          <div className="bg-black/80 px-2 py-0.5 rounded text-[10px] text-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full whitespace-nowrap">
                            {v.name}
                          </div>
                        </div>
                      </Marker>
                    ))}
                  </Map>
                )}
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {processedVenues.length > 0 ? processedVenues.map((v) => {
                  const distFormatted = v.computedDistance && v.computedDistance < 999999 
                    ? v.computedDistance < 1 
                      ? `${Math.round(v.computedDistance * 1000)} m uzakta`
                      : `${v.computedDistance.toFixed(1)} km uzakta`
                    : '';

                  return (
                    <div key={v.id} className="bg-[#1C130D] border border-white/5 p-3 rounded-2xl flex items-center gap-3 relative">
                      <div className="w-12 h-12 rounded-xl bg-black/40 border border-[#D4AF37]/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {v.logo ? (
                          <img src={v.logo} alt={v.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-6 h-6 text-[#D4AF37]/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{v.name}</h4>
                        <p className="text-[10px] text-gray-400 truncate">{v.address || `${v.district}, ${v.city}`}</p>
                        {distFormatted && (
                          <span className="inline-block mt-1 bg-black/40 text-[#D4AF37] px-2 py-0.5 rounded-full text-[9px] font-bold border border-[#D4AF37]/20">
                            📍 {distFormatted}
                          </span>
                        )}
                      </div>
                      {v.latitude && v.longitude && (
                        <button
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`, '_blank')}
                          className="w-10 h-10 rounded-full bg-[#2a1c12] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white hover:bg-[#D4AF37]/20 transition-all shrink-0"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                }) : (
                  <div className="glass-panel rounded-2xl p-6 text-center border border-[#D4AF37]/20 flex flex-col items-center justify-center space-y-3">
                    <Store className="w-8 h-8 text-[#D4AF37]/50 mb-1" />
                    <h4 className="text-sm font-bold text-white">Sonuç Bulunamadı</h4>
                    <p className="text-[11px] text-gray-400">Bu mesafede herhangi bir mekan bulunmuyor.</p>
                  </div>
                )}

                {/* QR Shortcut */}
                {!activeVenue && (
                   <button
                   onClick={() => {
                     closeModal();
                     openModal('qr');
                   }}
                   className="w-full mt-4 p-4 rounded-2xl border-2 border-dashed border-[#D4AF37]/30 flex items-center justify-center gap-3 hover:bg-white/5 transition-colors text-amber-200/80"
                 >
                   <QrCode className="w-6 h-6" />
                   <div className="text-left">
                     <span className="block font-bold text-xs text-white">Masadayım!</span>
                     <span className="block text-[10px]">QR Kodu okutup mekana bağlan.</span>
                   </div>
                 </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
