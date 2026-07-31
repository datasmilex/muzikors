const fs = require('fs');
const path = require('path');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\DrawerMenu.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /if \(activeModal === 'drawer' && user && activeVenue\) {/g,
  "if (activeModal === 'drawer' && user?.id && activeVenue?.id) {"
);

content = content.replace(
  /}, \[activeModal, user, activeVenue\]\);/g,
  "}, [activeModal, user?.id, activeVenue?.id]);"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed loop in DrawerMenu.tsx');
