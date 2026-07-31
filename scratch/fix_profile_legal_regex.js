const fs = require('fs');
const path = require('path');

const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\ProfileView.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<\/div>\s*<\/motion\.div>\s*<\/div>\s*<\/>\)}\s*<\/AnimatePresence>/m;

const replacement = `          </div>

          {/* Legal Links (List Group) */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-gray-500 font-medium">
            <a href="/legal/terms" className="hover:text-[#D4AF37] transition-colors">Hizmet Sözleşmesi</a>
            <span className="text-white/10">•</span>
            <a href="/legal/privacy" className="hover:text-[#D4AF37] transition-colors">KVKK & Gizlilik</a>
            <span className="text-white/10">•</span>
            <a href="/legal/refund" className="hover:text-[#D4AF37] transition-colors">İptal & İade</a>
            <span className="text-white/10">•</span>
            <a href="/legal/sales" className="hover:text-[#D4AF37] transition-colors">Mesafeli Satış</a>
          </div>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully injected legal links via regex');
} else {
  console.log('Regex did not match');
}
