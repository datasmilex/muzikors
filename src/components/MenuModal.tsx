'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  X,
  Search,
  Loader2,
  Coffee,
  BookOpen,
  Layers,
  Store,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { MenuCategory, MenuItem } from '../types';

export const MenuModal: React.FC = () => {
  const { activeModal, closeModal, activeVenue } = useApp();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const venueId = activeVenue?.id ? Number(activeVenue.id) : null;

  useEffect(() => {
    if (activeModal === 'menu' && venueId) {
      let isMounted = true;
      setLoading(true);

      const fetchMenu = async () => {
        try {
          const [catRes, itemRes] = await Promise.all([
            supabase
              .from('menu_categories')
              .select('*')
              .eq('venue_id', venueId)
              .order('order_index', { ascending: true })
              .order('created_at', { ascending: true }),
            supabase
              .from('menu_items')
              .select('*')
              .eq('venue_id', venueId)
              .order('order_index', { ascending: true })
              .order('created_at', { ascending: true }),
          ]);

          if (!isMounted) return;

          if (!catRes.error && catRes.data) {
            setCategories(catRes.data);
          }
          if (!itemRes.error && itemRes.data) {
            setItems(itemRes.data);
          }
        } catch (err) {
          console.error('[MenuModal fetch error]', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      fetchMenu();

      // Realtime subscription while modal is open
      const channel = supabase.channel(`menu-modal-${venueId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: `venue_id=eq.${venueId}` }, () => {
          fetchMenu();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_categories', filter: `venue_id=eq.${venueId}` }, () => {
          fetchMenu();
        })
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    } else {
      // Reset search on close
      setSearchQuery('');
      setSelectedCategoryId('all');
    }
  }, [activeModal, venueId]);

  // Filtered items based on category and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategoryId === 'all' || item.category_id === selectedCategoryId;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategoryId, searchQuery]);

  if (activeModal !== 'menu') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Sheet Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'tween', duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-lg h-[90vh] sm:h-[720px] rounded-t-[2.5rem] sm:rounded-[2.5rem] flex flex-col overflow-hidden bg-[#120C08] border border-[#D4AF37]/30 shadow-[0_-20px_50px_rgba(212,175,55,0.2)] glass-panel-gold z-10"
        >
          {/* Top Grabber for Mobile */}
          <div className="w-full pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#D4AF37]/20 bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <div className="w-full h-full bg-[#120C08] rounded-[14px] flex items-center justify-center text-[#D4AF37]">
                  <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight leading-tight">
                  {activeVenue?.venue_name || activeVenue?.name || 'Mekân Menüsü'}
                </h2>
                <span className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <BookOpen className="w-3 h-3" /> Dijital Menü
                </span>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-2.5 rounded-full bg-white/5 active:bg-white/15 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 pb-2 bg-[#120C08]">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Menüde ürün veya lezzet ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Navigation Pills */}
          {categories.length > 0 && (
            <div className="px-4 py-2 border-b border-white/5 overflow-x-auto scrollbar-hide flex items-center gap-2">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedCategoryId === 'all'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                    : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Tümü ({items.length})</span>
              </button>

              {categories.map((cat) => {
                const count = items.filter((i) => i.category_id === cat.id).length;
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                        : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-black/30 text-black font-extrabold' : 'text-zinc-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Menu Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar pb-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                <p className="text-xs font-bold tracking-wide">Lezzetler yükleniyor...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center px-4 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-600">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white">Menü Henüz Hazırlanıyor</h4>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Bu mekân henüz dijital menü ürünlerini sisteme eklememiş.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 text-zinc-500">
                <Search className="w-8 h-8 opacity-40" />
                <p className="text-sm font-bold text-zinc-300">Aradığınız kriterde ürün bulunamadı</p>
                <p className="text-xs">Farklı bir arama kelimesi deneyebilir veya kategoriyi değiştirebilirsiniz.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isAvailable = item.is_available !== false;
                const catName = categories.find((c) => c.id === item.category_id)?.name;

                return (
                  <div
                    key={item.id}
                    className={`relative rounded-2xl border p-3.5 transition-all flex gap-3.5 overflow-hidden backdrop-blur-md ${
                      isAvailable
                        ? 'bg-[#1A120B]/80 border-[#D4AF37]/25 shadow-lg shadow-black/40'
                        : 'bg-black/50 border-white/5 opacity-55'
                    }`}
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0 relative flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            !isAvailable ? 'grayscale' : ''
                          }`}
                        />
                      ) : (
                        <Coffee className="w-8 h-8 text-[#D4AF37]/50" />
                      )}

                      {/* Tükendi Rozeti */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-1">
                          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest text-center">
                            Tükendi
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-white text-sm sm:text-base leading-snug line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="font-black text-[#D4AF37] text-sm sm:text-base shrink-0 drop-shadow-md">
                            {Number(item.price).toLocaleString('tr-TR', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{' '}
                            ₺
                          </span>
                        </div>

                        {catName && selectedCategoryId === 'all' && (
                          <span className="text-[10px] font-bold text-amber-200/50 uppercase tracking-wider block mt-0.5">
                            {catName}
                          </span>
                        )}

                        {item.description && (
                          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Status row if out of stock */}
                      {!isAvailable && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>Şu an stokta yok</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
