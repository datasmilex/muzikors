const fs = require('fs');
const path = require('path');

const pageFile = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\app\\page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

const footerRegex = /\s*\{\/\* Footer KVKK \*\/\}\s*<div className="w-full text-center pb-24 pt-4 z-10 relative px-4">[\s\S]*?<\/div>\s*<\/div>/;

if (footerRegex.test(pageContent)) {
  pageContent = pageContent.replace(footerRegex, '');
  fs.writeFileSync(pageFile, pageContent, 'utf8');
  console.log('Removed Footer from page.tsx');
} else {
  console.log('Could not find Footer in page.tsx');
}
