'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Coffee, Search, UtensilsCrossed, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { MenuCategory, MenuItem } from '../types';
import { Sheet } from './ui/Sheet';
import { EmptyState, SkeletonRows, inputBase } from './ui/controls';
import { SPRING_SOFT } from '../lib/motion';

const formatPrice = (price: number) =>
  `${Number(price).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₺`;

export const MenuModal: React.FC = () => {
  const { activeModal, closeModal, activeVenue } = useApp();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<string | 'all'>('all');
  const [query, setQuery] = useState('');

  const isOpen = activeModal === 'menu';
  const venueId = activeVenue?.id ? Number(activeVenue.id) : null;

  useEffect(() => {
    if (!isOpen || !venueId) {
      setQuery('');
      setCategoryId('all');
      return;
    }
    let alive = true;
    setLoading(true);

    const fetchMenu = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          supabase.from('menu_categories').select('*').eq('venue_id', venueId).order('order_index', { ascending: true }).order('created_at', { ascending: true }),
          supabase.from('menu_items').select('*').eq('venue_id', venueId).order('order_index', { ascending: true }).order('created_at', { ascending: true }),
        ]);
        if (!alive) return;
        if (!catRes.error && catRes.data) setCategories(catRes.data);
        if (!itemRes.error && itemRes.data) setItems(itemRes.data);
      } catch (err) {
        console.error('[MenuModal fetch error]', err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchMenu();

    // Pencere açıkken menü değişiklikleri anında yansır
    const channel = supabase
      .channel(`menu-modal-${venueId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: `venue_id=eq.${venueId}` }, fetchMenu)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_categories', filter: `venue_id=eq.${venueId}` }, fetchMenu)
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [isOpen, venueId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return items.filter((item) => {
      const inCategory = categoryId === 'all' || item.category_id === categoryId;
      const matches =
        !q || item.name.toLocaleLowerCase('tr-TR').includes(q) || (item.description || '').toLocaleLowerCase('tr-TR').includes(q);
      return inCategory && matches;
    });
  }, [items, categoryId, query]);

  const chip = (active: boolean) =>
    `shrink-0 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors duration-150 ${
      active ? 'bg-white text-black' : 'bg-white/[0.06] text-white/65 hover:text-white'
    }`;

  return (
    <Sheet
      open={isOpen}
      onClose={() => closeModal(true)}
      title={activeVenue?.venue_name || activeVenue?.name || 'Menü'}
      subtitle="Menü"
      height="tall"
      width="lg"
      toolbar={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Menüde ara"
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
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
                <button type="button" onClick={() => setCategoryId('all')} className={chip(categoryId === 'all')}>
                  Tümü
                </button>
                {categories.map((cat) => (
                  <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)} className={chip(categoryId === cat.id)}>
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : undefined
      }
    >
      {loading ? (
        <SkeletonRows count={6} />
      ) : items.length === 0 ? (
        <EmptyState icon={<UtensilsCrossed className="w-6 h-6" />} title="Menü henüz eklenmemiş" text="Bu mekân dijital menüsünü henüz paylaşmadı." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search className="w-6 h-6" />} title="Sonuç yok" text="Farklı bir kelimeyle aramayı dene." />
      ) : (
        <ul className="pb-2 landscape:grid landscape:grid-cols-2 landscape:gap-x-6">
          <AnimatePresence initial={false}>
            {filtered.map((item) => {
              const available = item.is_available !== false;
              const catName = categoryId === 'all' ? categories.find((c) => c.id === item.category_id)?.name : null;
              return (
                <motion.li
                  key={item.id}
                  layout
                  transition={SPRING_SOFT}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3.5 py-3 border-b border-white/[0.05] ${available ? '' : 'opacity-45'}`}
                >
                  <span className="w-[72px] h-[72px] shrink-0 rounded-2xl overflow-hidden bg-white/[0.05] grid place-items-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" loading="lazy" className={`w-full h-full object-cover ${available ? '' : 'grayscale'}`} />
                    ) : (
                      <Coffee className="w-6 h-6 text-white/35" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[15px] font-semibold leading-snug">{item.name}</p>
                      <p className="text-[15px] font-semibold shrink-0 tabular-nums">{formatPrice(item.price)}</p>
                    </div>
                    {catName && <p className="text-[12px] text-white/40 mt-0.5">{catName}</p>}
                    {item.description && <p className="text-[13px] text-white/55 mt-1 line-clamp-2 leading-snug">{item.description}</p>}
                    {!available && <p className="text-[12px] font-semibold text-red-300/90 mt-1">Şu an yok</p>}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </Sheet>
  );
};
