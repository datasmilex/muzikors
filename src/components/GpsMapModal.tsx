'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { List, Map as MapIcon, Navigation, QrCode, Search, Store, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Map, Marker, ZoomControl } from 'pigeon-maps';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Venue } from '../types';
import { Sheet } from './ui/Sheet';
import { EmptyState, Segmented, SkeletonRows, btn, inputBase } from './ui/controls';
import { EASE_OUT } from '../lib/motion';

const ISTANBUL_CENTER = { lat: 41.0082, lng: 28.9784 };

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (km?: number) => {
  if (km === undefined || km >= 999999) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};

const directionsUrl = (v: Venue) => `https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`;

export const GpsMapModal: React.FC = () => {
  const { activeModal, closeModal, activeVenue, openModal } = useApp();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locNote, setLocNote] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(0);
  const [query, setQuery] = useState('');

  const isOpen = activeModal === 'map';

  useEffect(() => {
    if (!isOpen) return;

    const fetchVenues = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('venues')
        .select('id, venue_name, full_address, city, district, logo_url, latitude, longitude')
        .eq('is_active', true);
      if (data && !error) {
        setVenues(
          data.map((v: any) => ({
            id: String(v.id),
            name: v.venue_name,
            address: v.full_address || '',
            city: v.city,
            district: v.district,
            distance: '',
            logo: v.logo_url || '',
            coverImage: '',
            activeListeners: 0,
            currentSongTitle: '',
            currentSongArtist: '',
            latitude: v.latitude,
            longitude: v.longitude,
          }))
        );
      }
      setLoading(false);
    };

    const locate = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const permission = await Geolocation.checkPermissions();
          if (permission.location !== 'granted') {
            const req = await Geolocation.requestPermissions();
            if (req.location !== 'granted') throw new Error('Konum izni verilmedi');
          }
          const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocNote(null);
        } else if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setLocNote(null);
            },
            () => {
              setUserLoc(ISTANBUL_CENTER);
              setLocNote('Konumun alınamadı; mesafeler İstanbul merkezine göre.');
            }
          );
        } else {
          setUserLoc(ISTANBUL_CENTER);
          setLocNote('Tarayıcın konumu desteklemiyor.');
        }
      } catch {
        setUserLoc(ISTANBUL_CENTER);
        setLocNote('Konumun alınamadı; mesafeler İstanbul merkezine göre.');
      }
    };

    fetchVenues();
    locate();
  }, [isOpen]);

  const list = useMemo(() => {
    let result = [...venues];
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (q) {
      result = result.filter((v) =>
        [v.name, v.address, v.district, v.city].some((field) => field && field.toLocaleLowerCase('tr-TR').includes(q))
      );
    }
    if (userLoc) {
      result = result
        .map((v) => ({
          ...v,
          computedDistance: v.latitude && v.longitude ? getDistance(userLoc.lat, userLoc.lng, v.latitude, v.longitude) : 999999,
        }))
        .sort((a, b) => (a.computedDistance || 0) - (b.computedDistance || 0));
      if (radius > 0) result = result.filter((v) => (v.computedDistance || 0) <= radius);
    }
    return result;
  }, [venues, userLoc, radius, query]);

  const chip = (active: boolean) =>
    `shrink-0 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors duration-150 ${
      active ? 'bg-white text-black' : 'bg-white/[0.06] text-white/65 hover:text-white'
    }`;

  return (
    <Sheet
      open={isOpen}
      onClose={closeModal}
      title="Keşfet"
      subtitle={locNote || 'Yakındaki Muzikors mekânları'}
      height="tall"
      width="lg"
      toolbar={
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mekân, ilçe veya adres ara"
              className={`${inputBase} pl-11 pr-10`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Aramayı temizle"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center text-white/50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Segmented
            layoutId="map-view"
            value={view}
            onChange={setView}
            options={[
              { value: 'list', label: 'Liste', icon: <List className="w-4 h-4" /> },
              { value: 'map', label: 'Harita', icon: <MapIcon className="w-4 h-4" /> },
            ]}
          />
          {view === 'list' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
              {[0, 1, 5, 10].map((r) => (
                <button key={r} type="button" onClick={() => setRadius(r)} className={chip(radius === r)}>
                  {r === 0 ? 'Tümü' : `${r} km`}
                </button>
              ))}
            </div>
          )}
        </div>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.22, ease: EASE_OUT } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          className={view === 'map' ? 'h-full pb-4' : 'pb-2'}
        >
          {loading ? (
            <SkeletonRows count={6} />
          ) : view === 'map' ? (
            <div className="w-full h-full min-h-[320px] rounded-3xl overflow-hidden bg-white/[0.04]">
              {userLoc && (
                <Map
                  defaultCenter={[userLoc.lat, userLoc.lng]}
                  defaultZoom={12}
                  provider={(x, y, z) => `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`}
                >
                  <ZoomControl />
                  {userLoc !== ISTANBUL_CENTER && (
                    <Marker width={40} anchor={[userLoc.lat, userLoc.lng]}>
                      <div className="w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-md" />
                    </Marker>
                  )}
                  {list
                    .filter((v) => v.latitude && v.longitude)
                    .map((v) => (
                      <Marker key={v.id} width={36} anchor={[v.latitude!, v.longitude!]}>
                        <button
                          type="button"
                          aria-label={`${v.name} yol tarifi`}
                          onClick={() => window.open(directionsUrl(v), '_blank')}
                          className="w-9 h-9 rounded-full bg-[var(--theme-primary)] text-black grid place-items-center shadow-md border-2 border-white/90"
                        >
                          <Store className="w-4 h-4" />
                        </button>
                      </Marker>
                    ))}
                </Map>
              )}
            </div>
          ) : list.length === 0 ? (
            <EmptyState icon={<Store className="w-6 h-6" />} title="Mekân bulunamadı" text="Bu aralıkta açık bir mekân yok. Aralığı genişletmeyi dene." />
          ) : (
            <ul className="landscape:grid landscape:grid-cols-2 landscape:gap-x-6">
              {list.map((v) => (
                <li key={v.id} className="flex items-center gap-3 py-3 border-b border-white/[0.05]">
                  <span className="w-12 h-12 shrink-0 rounded-2xl overflow-hidden bg-white/[0.06] grid place-items-center">
                    {v.logo ? <img src={v.logo} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-white/40" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold truncate">{v.name}</span>
                    <span className="block text-[12px] text-white/50 truncate mt-0.5">
                      {[formatDistance(v.computedDistance), v.address || [v.district, v.city].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  {v.latitude && v.longitude && (
                    <a
                      href={directionsUrl(v)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${v.name} yol tarifi`}
                      className="w-11 h-11 shrink-0 grid place-items-center rounded-full bg-white/[0.07] text-white/80 active:scale-95 transition-transform duration-150"
                    >
                      <Navigation className="w-[18px] h-[18px]" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!activeVenue && view === 'list' && !loading && (
            <button type="button" onClick={() => openModal('qr')} className={`${btn.secondary} w-full mt-4`}>
              <QrCode className="w-4 h-4 text-white/60" />
              Masadayım, QR okut
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </Sheet>
  );
};
