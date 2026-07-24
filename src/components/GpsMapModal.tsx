'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Radio, Users, Check, Store, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_VENUES } from '../data/mockData';

export const GpsMapModal: React.FC = () => {
  const { activeModal, closeModal, activeVenue, bindVenueById, openModal } = useApp();

  if (activeModal !== 'map') return null;

  const venueList = Object.values(MOCK_VENUES);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* GPS Venue Map Container */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-md h-[88vh] bg-[#120C08] border-t-2 border-[#D4AF37]/40 rounded-t-[32px] p-5 z-10 shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* Header */}
          <div className="shrink-0 pb-3 border-b border-[#D4AF37]/20">
            <div className="w-12 h-1.5 rounded-full bg-[#D4AF37]/30 mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-base font-bold text-white tracking-wide">Muzikors Mekan Haritası</h2>
              </div>

              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Map Visual Simulation */}
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-[#D4AF37]/30 my-3 shadow-inner bg-[#1A120B] flex flex-col items-center justify-center text-center p-4">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            />

            {/* Radar Pulse Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[#D4AF37]/40 animate-ping pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="w-10 h-10 rounded-full gold-gradient-bg text-stone-950 font-black flex items-center justify-center mx-auto shadow-md">
                <MapPin className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="text-xs font-bold text-amber-100">GPS Mekan Tarayıcı</p>
              <span className="text-[10px] text-amber-200/60 block">Masadaki QR kod ile mekana anında bağlanabilirsiniz.</span>
            </div>
          </div>

          {/* Requirement 1: Map Clean Slate Placeholder */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-wider px-1">
              Yakındaki Aktif Mekanlar
            </h3>

            {venueList.length === 0 && !activeVenue ? (
              <div className="glass-panel rounded-2xl p-6 text-center border border-[#D4AF37]/20 flex flex-col items-center justify-center space-y-3 my-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                  <Store className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Sistemde Henüz Kayıtlı Anlaşmalı Kafe Bulunmuyor</h4>
                  <p className="text-[11px] text-amber-200/60">
                    Masa üzerindeki Muzikors QR kodunu taratarak mekana otomatik bağlanabilirsiniz.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeModal();
                    openModal('qr');
                  }}
                  className="px-4 py-2 rounded-xl gold-gradient-bg text-stone-950 font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" /> Masa QR Okut
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeVenue && (
                  <div className="glass-panel-gold rounded-2xl p-3.5 border border-[#D4AF37]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-xl shrink-0">
                          {activeVenue.logo}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{activeVenue.name}</h4>
                          <p className="text-xs text-amber-200/60 font-medium">
                            {activeVenue.district}, {activeVenue.city} • {activeVenue.distance}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Bağlı
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
