const fs = require('fs');
const path = require('path');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\LeaderboardModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const fetchData = async \(\) => \{[\s\S]*?\};\n\n/m;

const replacement = `const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, name, full_name, avatar_url, total_songs_requested')
          .order('total_songs_requested', { ascending: false })
          .limit(50);
        
        if (profiles && !error) {
          const list = profiles.map((p: any) => ({
            id: p.id,
            name: p.name || p.full_name || 'Kullanıcı',
            avatar: p.avatar_url,
            total_songs_requested: p.total_songs_requested || 0
          }));
          setUsers(list);
        } else {
          setUsers([]);
        }
      } else {
        const { data: venueData, error } = await supabase
          .from('venues')
          .select('id, venue_name, logo_url, total_requests')
          .order('total_requests', { ascending: false })
          .limit(50);
        
        if (venueData && !error) {
          const list = venueData.map((v: any) => ({
            id: v.id,
            venue_name: v.venue_name,
            logo_url: v.logo_url,
            total_songs_requested: v.total_requests || 0
          }));
          setVenues(list);
        } else {
          setVenues([]);
        }
      }
    } catch (err) {
      console.error('[Leaderboard fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

`;

content = content.replace(regex, replacement);

// Replace "Bu ay henüz kayıt bulunamadı." with "Henüz kayıt bulunamadı."
content = content.replace(/Bu ay henüz kayıt bulunamadı\./g, 'Henüz kayıt bulunamadı.');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed LeaderboardModal data fetch');
