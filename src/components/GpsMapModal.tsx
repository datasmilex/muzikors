'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation, Store, List, Map as MapIcon, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
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

  const getUserLocation = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            throw new Error('Konum izni verilmedi');
          }
        }
        
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
        
        setUserLoc({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocError(null);
      } else {
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
      }
    } catch (err) {
      console.error('Location exception:', err);
      setUserLoc(ISTANBUL_CENTER);
      setLocError('Konum alınamadı, varsayılan merkez gösteriliyor.');
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

  

  return (
    <AnimatePresence>
      {activeModal === 'map' && (<>

      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'tween', duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-md h-[88vh] sm:h-[650px] sm:rounded-3xl rounded-t-3xl p-4 z-10 shadow-[0_-10px_40px_rgba(212,175,55,0.15)] flex flex-col justify-between overflow-hidden glass-panel-gold border border-[#D4AF37]/30 bg-[#120C08]"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />

          {/* Header */}
          <div className="shrink-0 pb-4 border-b border-[#D4AF37]/20 relative z-10">
            <div className="w-12 h-1.5 rounded-full bg-[#D4AF37]/30 mx-auto mb-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner">
                  <MapPin className="w-5 h-5 drop-shadow-md" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight drop-shadow-md">Yakın Mekanlar</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full bg-white/5 active:bg-white/10 active:rotate-90 text-zinc-400 active:text-white transition-all duration-300"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {locError && <p className="text-[11px] text-red-400 font-medium mt-2 px-1">{locError}</p>}
          </div>

          {/* Toggle Map/List */}
          <div className="flex bg-black/40 p-1.5 rounded-xl mt-4 mb-3 shrink-0 border border-white/5 relative z-10 shadow-inner">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-2 text-xs font-black rounded-lg flex items-center justify-center gap-2 transition-all ${viewMode === 'list' ? 'bg-[#D4AF37] text-stone-950 shadow-md scale-105' : 'text-gray-400 active:text-white'}`}
            >
              <List className="w-4 h-4" /> Liste
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-2 text-xs font-black rounded-lg flex items-center justify-center gap-2 transition-all ${viewMode === 'map' ? 'bg-[#D4AF37] text-stone-950 shadow-md scale-105' : 'text-gray-400 active:text-white'}`}
            >
              <MapIcon className="w-4 h-4" /> Harita
            </button>
          </div>

          {/* Filters */}
          {viewMode === 'list' && (
            <div className="shrink-0 mb-4 flex gap-2 overflow-x-auto no-scrollbar py-1 relative z-10 px-1">
              {[0, 1, 5, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusFilter(r)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-black border transition-all whitespace-nowrap shadow-sm ${radiusFilter === r ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]' : 'border-white/10 text-gray-400 bg-white/5 active:bg-white/10'}`}
                >
                  {r === 0 ? 'Tümü' : `${r} km`}
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative rounded-xl z-10">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-[#D4AF37]/50 animate-pulse space-y-3">
                <MapPin className="w-8 h-8" />
                <span className="text-sm font-bold tracking-widest uppercase">Yükleniyor...</span>
              </div>
            ) : viewMode === 'map' ? (
              <div className="w-full h-full bg-[#1A1A1A] rounded-[1.5rem] overflow-hidden border border-[#D4AF37]/20 relative shadow-inner">
                {userLoc && (
                  <Map 
                    defaultCenter={[userLoc.lat, userLoc.lng]} 
                    defaultZoom={12}
                    provider={(x, y, z, dpr) => `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`}
                  >
                    <ZoomControl />
                    {userLoc !== ISTANBUL_CENTER && (
                      <Marker width={50} anchor={[userLoc.lat, userLoc.lng]}>
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping" />
                          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative z-10" />
                        </div>
                      </Marker>
                    )}
                    {processedVenues.filter(v => v.latitude && v.longitude).map((v) => (
                      <Marker key={v.id} width={40} anchor={[v.latitude!, v.longitude!]}>
                        <div 
                          className="flex flex-col items-center group cursor-pointer"
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`, '_blank')}
                        >
                          <div className="w-10 h-10 rounded-full gold-gradient-bg text-stone-950 flex items-center justify-center font-bold shadow-[0_5px_15px_rgba(212,175,55,0.4)] border-2 border-[#120C08] group-active:scale-95 transition-transform">
                            <Store className="w-5 h-5" />
                          </div>
                          <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-bold text-white mt-2 opacity-0 group-active:opacity-100 transition-opacity absolute top-full whitespace-nowrap border border-[#D4AF37]/30 shadow-lg pointer-events-none">
                            {v.name}
                          </div>
                        </div>
                      </Marker>
                    ))}
                  </Map>
                )}
              </div>
            ) : (
              <div className="space-y-4 pb-4 px-1">
                {processedVenues.length > 0 ? processedVenues.map((v) => {
                  const distFormatted = v.computedDistance && v.computedDistance < 999999 
                    ? v.computedDistance < 1 
                      ? `${Math.round(v.computedDistance * 1000)} m`
                      : `${v.computedDistance.toFixed(1)} km`
                    : '';

                  return (
                    <div key={v.id} className="bg-[#1A1A1A]/80 border border-[#D4AF37]/20 p-4 rounded-2xl flex items-center gap-4 relative shadow-inner active:-translate-y-1 transition-transform group">
                      <div className="w-14 h-14 rounded-xl bg-black/60 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 overflow-hidden shadow-md group-active:border-[#D4AF37]/60 transition-colors">
                        {v.logo ? (
                          <img src={v.logo} alt={v.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-6 h-6 text-[#D4AF37]/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-white text-sm truncate drop-shadow-sm">{v.name}</h4>
                        <p className="text-[11px] font-medium text-gray-400 truncate mt-0.5">{v.address || `${v.district}, ${v.city}`}</p>
                        {distFormatted && (
                          <span className="inline-flex items-center gap-1 mt-2 bg-black/40 text-[#D4AF37] px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border border-[#D4AF37]/20">
                            <Navigation className="w-3 h-3" />
                            {distFormatted}
                          </span>
                        )}
                      </div>
                      {v.latitude && v.longitude && (
                        <button
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`, '_blank')}
                          className="w-12 h-12 rounded-xl bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] active:bg-[#D4AF37]/10 active:scale-95 transition-all shrink-0 shadow-sm"
                        >
                          <Navigation className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  );
                }) : (
                  <div className="bg-[#1A1A1A]/60 rounded-2xl p-8 text-center border border-white/5 flex flex-col items-center justify-center space-y-4 shadow-inner">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <Store className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white mb-1">Mekan Bulunamadı</h4>
                      <p className="text-[13px] text-gray-400 font-medium">Bu mesafede herhangi bir Muzikors mekanı bulunmuyor.</p>
                    </div>
                  </div>
                )}

                {/* QR Shortcut */}
                {!activeVenue && (
                   <button
                   onClick={() => {
                     closeModal();
                     openModal('qr');
                   }}
                   className="w-full mt-6 p-5 rounded-[1.5rem] border-2 border-dashed border-[#D4AF37]/40 flex items-center justify-center gap-4 active:bg-[#D4AF37]/5 active:border-[#D4AF37] active:scale-95 transition-all text-amber-200/80 group bg-black/20"
                 >
                   <div className="w-12 h-12 rounded-xl gold-gradient-bg flex items-center justify-center shadow-md group-active:scale-95 transition-transform shrink-0">
                     <QrCode className="w-6 h-6 text-stone-950" />
                   </div>
                   <div className="text-left">
                     <span className="block font-black text-sm text-white tracking-wide">Masadayım!</span>
                     <span className="block text-[11px] font-medium mt-0.5">Mekanın QR kodunu okutarak hemen bağlan.</span>
                   </div>
                 </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
