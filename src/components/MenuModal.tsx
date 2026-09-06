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
      <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center landscape:items-center landscape:justify-center landscape:p-2">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/85"
          style={{ willChange: 'opacity' }}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform' }}
          className="relative w-full max-w-md landscape:max-w-3xl h-[90vh] sm:h-[680px] landscape:max-h-[96vh] landscape:h-auto bg-[var(--theme-card)] sm:rounded-3xl landscape:rounded-2xl rounded-t-[2.5rem] flex flex-col border-t sm:border landscape:border border-white/[0.1] shadow-[0_-20px_60px_rgba(0,0,0,0.95)] overflow-hidden"
        >
          {/* Handle */}
          <div className="flex justify-center pt-2.5 pb-1 shrink-0 landscape:hidden">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="p-4 sm:p-5 landscape:py-2.5 landscape:px-4 flex items-center justify-between border-b border-white/[0.08] bg-[var(--theme-card)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 flex items-center justify-center text-[var(--theme-primary)]">
                <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight">
                  {activeVenue?.venue_name || activeVenue?.name || 'Mekân Menüsü'}
                </h2>
                <span className="text-[10px] text-[var(--theme-primary-light)] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <BookOpen className="w-3 h-3" /> Dijital Menü
                </span>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 pb-2 landscape:py-2 landscape:px-4 bg-[var(--theme-card)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Menüde ürün veya lezzet ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--theme-card-alt)] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-primary)]/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Navigation Pills */}
          {categories.length > 0 && (
            <div className="px-4 py-2 border-b border-white/[0.06] overflow-x-auto scrollbar-hide flex items-center gap-1.5">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedCategoryId === 'all'
                    ? 'bg-[var(--theme-primary)] text-black shadow-sm'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white'
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[var(--theme-primary)] text-black shadow-sm'
                        : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[9px] px-1 rounded-full ${isSelected ? 'bg-black/20 text-black font-extrabold' : 'text-neutral-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Menu Items List */}
          <div className={`flex-1 overflow-y-auto p-4 landscape:p-3 custom-scrollbar pb-10 landscape:pb-4 ${!loading && filteredItems.length > 0 ? 'landscape:grid landscape:grid-cols-2 landscape:gap-2.5 space-y-2.5 landscape:space-y-0' : 'space-y-2.5'}`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-primary)]" />
                <p className="text-xs font-bold tracking-wider uppercase">Menü yükleniyor...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center px-4 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Menü Henüz Eklenmemiş</h4>
                <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                  Bu mekân henüz dijital menü ürünlerini sisteme kaydetmedi.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-1 text-neutral-500">
                <Search className="w-6 h-6 opacity-40 mb-1" />
                <p className="text-xs font-bold text-neutral-300">Aradığınız kriterde ürün bulunamadı</p>
                <p className="text-[11px]">Farklı bir arama yapmayı deneyin.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isAvailable = item.is_available !== false;
                const catName = categories.find((c) => c.id === item.category_id)?.name;

                return (
                  <div
                    key={item.id}
                    className={`relative rounded-2xl border p-3 transition-all flex gap-3 overflow-hidden ${
                      isAvailable
                        ? 'bg-[var(--theme-card-alt)] border-white/[0.08] shadow-sm'
                        : 'bg-black/40 border-white/5 opacity-50'
                    }`}
                  >
                    {/* Item Image */}
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0 relative flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className={`w-full h-full object-cover ${
                            !isAvailable ? 'grayscale' : ''
                          }`}
                        />
                      ) : (
                        <Coffee className="w-6 h-6 text-[var(--theme-primary)]" />
                      )}

                      {/* Tükendi Rozeti */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-1">
                          <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest text-center">
                            Tükendi
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-xs sm:text-sm leading-snug line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="font-black text-amber-400 text-xs sm:text-sm shrink-0">
                            {Number(item.price).toLocaleString('tr-TR', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{' '}
                            ₺
                          </span>
                        </div>

                        {catName && selectedCategoryId === 'all' && (
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mt-0.5">
                            {catName}
                          </span>
                        )}

                        {item.description && (
                          <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-snug">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Status row if out of stock */}
                      {!isAvailable && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>Stokta yok</span>
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
