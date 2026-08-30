'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation, Store, List, Map as MapIcon, QrCode, Search, Loader2 } from 'lucide-react';
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
  const { activeModal, closeModal, activeVenue, openModal, bindVenueById, showToast } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [radiusFilter, setRadiusFilter] = useState<number>(0); // 0 = Hepsi
  const [searchQuery, setSearchQuery] = useState('');

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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        (v.name && v.name.toLowerCase().includes(q)) || 
        (v.address && v.address.toLowerCase().includes(q)) || 
        (v.district && v.district.toLowerCase().includes(q))
      );
    }

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
  }, [venues, userLoc, radiusFilter, searchQuery]);

  

  return (
    <AnimatePresence>
      {activeModal === 'map' && (<>

      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-md h-[88vh] sm:h-[680px] bg-[var(--theme-card)] sm:rounded-3xl rounded-t-[2.5rem] p-5 z-10 shadow-[0_-20px_60px_rgba(0,0,0,0.95)] flex flex-col border-t sm:border border-white/[0.1] overflow-hidden"
        >
          {/* Handle */}
          <div className="flex justify-center pt-0 pb-2 shrink-0">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="shrink-0 pb-3 border-b border-white/[0.08] relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 flex items-center justify-center text-[var(--theme-primary)]">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-white tracking-tight">Yakın Mekanlar</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {locError && <p className="text-[10px] text-[var(--theme-primary-light)] font-medium mt-1.5 px-0.5">{locError}</p>}
          </div>

          {/* Search Input */}
          <div className="mt-3 shrink-0 relative z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Mekan adı, ilçe veya adres ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--theme-card-alt)] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white font-medium focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Toggle Map/List */}
          <div className="flex bg-[var(--theme-card-alt)] p-1 rounded-xl mt-3 mb-2 shrink-0 border border-white/10 relative z-10">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all ${viewMode === 'list' ? 'bg-[var(--theme-primary)] text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              <List className="w-3.5 h-3.5" /> Liste
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all ${viewMode === 'map' ? 'bg-amber-400 text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Harita
            </button>
          </div>

          {/* Filters */}
          {viewMode === 'list' && (
            <div className="shrink-0 mb-3 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 relative z-10">
              {[0, 1, 5, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusFilter(r)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all whitespace-nowrap ${radiusFilter === r ? 'border-amber-400 bg-amber-400/15 text-amber-300' : 'border-white/[0.06] text-white/60 bg-white/[0.02]'}`}
                >
                  {r === 0 ? 'Tümü' : `${r} km`}
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative rounded-2xl z-10">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-amber-400/70 space-y-2 py-16">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Yükleniyor...</span>
              </div>
            ) : viewMode === 'map' ? (
              <div className="w-full h-full bg-[var(--theme-card-alt)] rounded-2xl overflow-hidden border border-white/[0.08] relative">
                {userLoc && (
                  <Map 
                    defaultCenter={[userLoc.lat, userLoc.lng]} 
                    defaultZoom={12}
                    provider={(x, y, z) => `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`}
                  >
                    <ZoomControl />
                    {userLoc !== ISTANBUL_CENTER && (
                      <Marker width={40} anchor={[userLoc.lat, userLoc.lng]}>
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-6 h-6 bg-blue-500/30 rounded-full animate-ping" />
                          <div className="w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white shadow-md relative z-10" />
                        </div>
                      </Marker>
                    )}
                    {processedVenues.filter(v => v.latitude && v.longitude).map((v) => (
                      <Marker key={v.id} width={36} anchor={[v.latitude!, v.longitude!]}>
                        <div 
                          className="flex flex-col items-center group cursor-pointer"
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`, '_blank')}
                        >
                          <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)] text-black flex items-center justify-center font-bold shadow-md border-2 border-[var(--theme-card)]">
                            <Store className="w-4 h-4" />
                          </div>
                          <div className="bg-black/90 px-2 py-1 rounded-md text-[10px] font-bold text-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full whitespace-nowrap border border-white/10 shadow-lg pointer-events-none">
                            {v.name}
                          </div>
                        </div>
                      </Marker>
                    ))}
                  </Map>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 pb-2">
                {processedVenues.length > 0 ? processedVenues.map((v) => {
                  const distFormatted = v.computedDistance && v.computedDistance < 999999 
                    ? v.computedDistance < 1 
                      ? `${Math.round(v.computedDistance * 1000)} m`
                      : `${v.computedDistance.toFixed(1)} km`
                    : '';

                  return (
                    <div key={v.id} className="bg-[var(--theme-card-alt)] border border-white/[0.08] p-3 rounded-2xl flex items-center gap-3 relative shadow-sm">
                      <div className="w-11 h-11 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {v.logo ? (
                          <img src={v.logo} alt={v.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-5 h-5 text-[var(--theme-primary)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-xs truncate">{v.name}</h4>
                        <p className="text-[10px] font-medium text-neutral-400 truncate mt-0.5">{v.address || `${v.district}, ${v.city}`}</p>
                        {distFormatted && (
                          <span className="inline-flex items-center gap-1 mt-1 bg-black/40 text-[var(--theme-primary-light)] px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase border border-white/5">
                            <Navigation className="w-2.5 h-2.5" />
                            {distFormatted}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            bindVenueById(v.id.toString());
                            closeModal();
                            showToast('Mekana bağlanıldı!');
                          }}
                          className="w-9 h-9 rounded-xl bg-[var(--theme-primary)] text-black flex items-center justify-center active:scale-95 transition-all shadow-sm"
                          title="Mekana Git"
                        >
                          <Store className="w-4 h-4" />
                        </button>
                        {v.latitude && v.longitude && (
                          <button
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`, '_blank')}
                            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[var(--theme-primary)] active:scale-95 transition-all"
                            title="Yol Tarifi"
                          >
                            <Navigation className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="bg-[var(--theme-card-alt)] rounded-2xl p-6 text-center border border-white/[0.08] flex flex-col items-center justify-center space-y-2">
                    <Store className="w-6 h-6 text-neutral-500 mb-1" />
                    <div>
                      <h4 className="text-xs font-bold text-white mb-0.5">Mekan Bulunamadı</h4>
                      <p className="text-[11px] text-neutral-400">Bu mesafede açık bir mekan bulunmuyor.</p>
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
                    className="w-full mt-3 p-3.5 rounded-2xl border border-dashed border-amber-400/40 flex items-center gap-3 active:scale-95 transition-all text-white/80 bg-amber-400/[0.03]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-black shrink-0 shadow-sm">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-xs text-white">Masadayım!</span>
                      <span className="block text-[10px] text-neutral-400">Masadaki QR kodu okutarak hemen bağlanın.</span>
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
