const fs = require('fs');
const path = require('path');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\VenueInfoModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// The activeVenue fix
content = content.replace(
  'const wifiName = activeVenue.wifi_name || (activeVenue as any).wifi_ssid;',
  'if (!activeVenue) return null;\n\n  const wifiName = activeVenue.wifi_name || (activeVenue as any).wifi_ssid;'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed activeVenue in VenueInfoModal');
