const fs = require('fs');
const path = require('path');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\UpNextQueueSection.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix Empty State background
content = content.replace(
  'glass-panel-gold rounded-[2rem] p-8 text-center border border-[#D4AF37]/30 flex flex-col items-center justify-center space-y-4 my-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)]',
  'bg-black/30 backdrop-blur-md rounded-[2rem] p-8 text-center border border-white/5 flex flex-col items-center justify-center space-y-4 my-2 shadow-sm'
);

// Fix Queue Cards background
content = content.replace(
  `border-[#D4AF37]/20 bg-[#1A1A1A]/95 shadow-[0_-8px_20px_rgba(0,0,0,0.8)] hover:border-[#D4AF37]/40 hover:bg-[#221811]`,
  `border-white/5 bg-[#1A1A1A]/30 shadow-[0_-8px_20px_rgba(0,0,0,0.3)] hover:border-white/10 hover:bg-[#1A1A1A]/50`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed UpNextQueueSection background');
