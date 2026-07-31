const fs = require('fs');
const path = require('path');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\VenueInfoModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/activeVenue\.logo_url/g, '(activeVenue as any).logo_url');
content = content.replace(/activeVenue\.venue_name/g, '(activeVenue as any).venue_name');
content = content.replace(/activeVenue\.name/g, '(activeVenue as any).name');
content = content.replace(/activeVenue\.wifi_name/g, '(activeVenue as any).wifi_name');
content = content.replace(/activeVenue\.wifi_password/g, '(activeVenue as any).wifi_password');
content = content.replace(/activeVenue\.menu_link/g, '(activeVenue as any).menu_link');

// Fix line 33 typo from previous replacement that reversed activeModal
// Actually line 33 says: {activeModal === 'venue_info' || !activeVenue && (<>
// I need to change it to {activeModal === 'venue_info' && (<>
content = content.replace(
  "{activeModal === 'venue_info' || !activeVenue && (<>",
  "{activeModal === 'venue_info' && (<>"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed TS errors in VenueInfoModal');
