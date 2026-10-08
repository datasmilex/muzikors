export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success') => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    switch (type) {
      case 'light': window.navigator.vibrate(50); break;
      case 'medium': window.navigator.vibrate(100); break;
      case 'heavy': window.navigator.vibrate([150, 50, 150]); break;
      case 'success': window.navigator.vibrate([50, 50, 100]); break;
      default: window.navigator.vibrate(50);
    }
  }
};
