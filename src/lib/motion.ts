// Uygulama genelinde ortak hareket ayarları: her açılır pencere ve liste aynı ritimde hareket eder.

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN = [0.4, 0, 1, 1] as const;

/** Alttan açılan pencereler: hızlı ama zıplamadan yerine oturur */
export const SPRING_SHEET = { type: 'spring' as const, stiffness: 420, damping: 40, mass: 0.9 };

/** Sıralama değişimleri, sekme göstergeleri gibi küçük yer değiştirmeler */
export const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 520, damping: 38, mass: 0.7 };

/** Liste öğelerinin yerleşmesi */
export const SPRING_SOFT = { type: 'spring' as const, stiffness: 300, damping: 32, mass: 0.9 };

/** Listeler için sırayla beliren öğeler */
export const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: Math.min(i, 8) * 0.035, duration: 0.32, ease: EASE_OUT },
  }),
};
