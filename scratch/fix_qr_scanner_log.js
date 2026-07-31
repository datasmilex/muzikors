const fs = require('fs');
const path = require('path');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\QrScannerModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "console.error('[Rear Camera Fallback Error]', fallbackErr);",
  "console.warn('[Rear Camera Fallback] Device not found or inaccessible.');"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed QrScannerModal log');
