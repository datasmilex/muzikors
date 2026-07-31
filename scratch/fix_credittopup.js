const fs = require('fs');
const path = require('path');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\CreditTopUpModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix container spacing
content = content.replace(
  '          <div className="space-y-2.5 my-4 relative z-10">',
  '          <div className="space-y-3 mt-5 mb-4 relative z-10">'
);

// 2. Fix badge position
content = content.replace(
  'absolute -top-2 right-3 gold-gradient-bg text-stone-950 font-black text-[8px] px-2 py-0.5 rounded-full shadow-[0_5px_10px_rgba(212,175,55,0.3)] uppercase tracking-widest z-10',
  'absolute -top-2.5 right-4 gold-gradient-bg text-stone-950 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-[0_4px_10px_rgba(212,175,55,0.4)] uppercase tracking-wider z-10'
);

// 3. Fix circle indicator shrink
content = content.replace(
  'className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 shadow-inner ${',
  'className={`w-4 h-4 shrink-0 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 shadow-inner ${'
);

// 4. Wrap text better for bonus credits
content = content.replace(
  '<div className="flex items-baseline gap-1.5">',
  '<div className="flex items-center gap-1.5 flex-wrap">'
);
content = content.replace(
  'text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 shadow-sm',
  'text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 shadow-sm whitespace-nowrap'
);

// 5. Fix price text overlap and sizes
content = content.replace(
  '<div className="text-right flex flex-col items-end justify-center">',
  '<div className="text-right flex flex-col items-end justify-center shrink-0 pl-2">'
);
content = content.replace(
  'text-[9px] text-gray-500 font-bold line-through mb-0.5',
  'text-[10px] text-gray-500 font-bold line-through mb-0.5'
);
content = content.replace(
  'text-sm font-black drop-shadow-md',
  'text-[15px] font-black drop-shadow-md'
);

// 6. Change modal's overflow-hidden to visible, so the badge doesn't get clipped.
// The modal wrapper might have `overflow-hidden`. Wait, the modal has `overflow-hidden` which clips rounded corners.
// If I change overflow-hidden to overflow-visible, the background might overflow if not rounded properly.
// The user just said "Rozetleri absolute -top-3 right-4 gibi konumlandırıp overflow yapmasını engelle".
// "overflow-hidden" is on the motion.div container.
// Let's just remove "overflow-hidden" from the motion.div in CreditTopUpModal.
content = content.replace(
  'overflow-hidden glass-panel-gold',
  'glass-panel-gold'
);

// To prevent backdrop overflow we can wrap the content in a rounded div, but it's fine since we don't have images going out of bounds.

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed CreditTopUpModal layout');
