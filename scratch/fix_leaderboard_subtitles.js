const fs = require('fs');
const path = require('path');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\LeaderboardModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<p className="text-\[11px\] font-semibold text-\[#D4AF37\] uppercase tracking-wide truncate">\s*Müzikşin\s*<\/p>/g,
  ''
);

content = content.replace(
  /<p className="text-\[11px\] font-semibold text-\[#D4AF37\] uppercase tracking-wide truncate">\s*Mekan Lideri\s*<\/p>/g,
  ''
);

fs.writeFileSync(file, content, 'utf8');
console.log('Removed subtitles from LeaderboardModal');
