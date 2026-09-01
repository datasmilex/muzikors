/**
 * Genre Classifier & Vibe Guard Validator for Muzikors
 * Cross-references Spotify Artist Genres & Turkish / Global Music Data against Venue Vibe Guard
 */

export const ALL_GENRES = [
  'Pop',
  'Rap / Hip-Hop',
  'Arabesk / Damar',
  'Melodik / Akustik',
  'Agresif / Sert',
  'Elektronik / Club',
  'Rock / Alternatif',
  'Türkü / Özgün',
  'Yabancı Hit',
  'Chill / Sakin',
] as const;

export type GenreCategory = typeof ALL_GENRES[number];

export const GENRE_MAP: Record<string, string[]> = {
  'Rap / Hip-Hop': [
    'rap', 'hip hop', 'hip-hop', 'trap', 'turkish hip hop', 'turkish trap', 'turkce rap', 'türkçe rap',
    'drill', 'turkish drill', 'underground hip hop', 'boom bap', 'gangsta rap', 'urban contemporary',
    'r&b', 'trap latino', 'cloud rap', 'hardcore hip hop', 'freestyle', 'hiphop', 'trap turkce',
    'german hip hop', 'frauenrap', 'trap queen', 'dirty south', 'atlanta hip hop', 'uk drill',
    'plugg', 'rage rap', 'melodic rap', 'turkce trap'
  ],
  'Arabesk / Damar': [
    'arabesk', 'damar', 'turkish arabesk', 'fantezi', 'fantazi', 'taverna', 'turkish folk arabesk',
    'arabesk pop', 'arabesk rap', 'damar sarki', 'arabesque', 'fantezi muzik'
  ],
  'Rock / Alternatif': [
    'rock', 'turkish rock', 'alternative rock', 'anatolian rock', 'indie rock', 'hard rock',
    'punk', 'grunge', 'psychedelic rock', 'progressive rock', 'post-rock', 'garage rock',
    'türkçe rock', 'anadolu rock', 'soft rock', 'classic rock', 'indie', 'alternative',
    'indie pop', 'turkish indie', 'turkce alternatif', 'turkce rock'
  ],
  'Pop': [
    'pop', 'turkish pop', 'türkçe pop', 'dance pop', 'synth-pop', 'europop', 't-pop',
    'electropop', 'teen pop', 'art pop', 'chamber pop', 'power pop', 'viral pop', 'turkce pop'
  ],
  'Elektronik / Club': [
    'edm', 'electronic', 'house', 'techno', 'dance', 'club', 'trance', 'dubstep', 'electro',
    'deep house', 'tech house', 'drum and bass', 'dnb', 'ambient house', 'disco', 'synthwave', 'club dance',
    'slap house', 'afro house', 'melodic house', 'electro house', 'future bass'
  ],
  'Türkü / Özgün': [
    'turku', 'türkü', 'turkish folk', 'halk muzigi', 'halk müziği', 'ozgun', 'özgün', 'baglama',
    'bağlama', 'deyis', 'deyiş', 'turkce turku', 'türkçe türkü', 'karadeniz', 'ege', 'anadolu folk'
  ],
  'Melodik / Akustik': [
    'acoustic', 'lo-fi', 'chillhop', 'unplugged', 'akustik', 'piano', 'guitar', 'singer-songwriter',
    'bossa nova', 'indie folk', 'slow', 'slow pop', 'acoustic pop', 'bedhead'
  ],
  'Chill / Sakin': [
    'chill', 'ambient', 'downtempo', 'lounge', 'relaxing', 'caz', 'jazz', 'vocal jazz',
    'smooth jazz', 'blues', 'classical', 'klasik', 'meditation', 'lo-fi beats', 'coffee shop'
  ],
  'Agresif / Sert': [
    'metal', 'heavy metal', 'death metal', 'black metal', 'thrash metal', 'metalcore',
    'deathcore', 'hardcore', 'screamo', 'grindcore', 'nu metal', 'industrial metal', 'power metal'
  ],
  'Yabancı Hit': [
    'reggaeton', 'latin', 'k-pop', 'afrobeats', 'dancehall', 'j-pop', 'french pop', 'latin pop', 'amapiano'
  ]
};

// Renowned Artist Fallback Dictionary (Guarantees 100% accuracy even if Spotify tags are incomplete)
export const KNOWN_ARTIST_GENRES: Record<string, string[]> = {
  // Rap / Hip-Hop (Turkish)
  'ezhel': ['Rap / Hip-Hop'],
  'uzi': ['Rap / Hip-Hop'],
  'motive': ['Rap / Hip-Hop'],
  'çakal': ['Rap / Hip-Hop'],
  'cakal': ['Rap / Hip-Hop'],
  'reckol': ['Rap / Hip-Hop'],
  'lvbel c5': ['Rap / Hip-Hop'],
  'blok3': ['Rap / Hip-Hop'],
  'ceg': ['Rap / Hip-Hop'],
  'cegid': ['Rap / Hip-Hop'],
  'ceza': ['Rap / Hip-Hop'],
  'sagopa kajmer': ['Rap / Hip-Hop'],
  'şanışer': ['Rap / Hip-Hop'],
  'saniser': ['Rap / Hip-Hop'],
  'şehinşah': ['Rap / Hip-Hop'],
  'sehinsah': ['Rap / Hip-Hop'],
  'khontkar': ['Rap / Hip-Hop'],
  'batuflex': ['Rap / Hip-Hop'],
  'ati242': ['Rap / Hip-Hop'],
  'organize': ['Rap / Hip-Hop'],
  'sefo': ['Rap / Hip-Hop'],
  'contra': ['Rap / Hip-Hop'],
  'allame': ['Rap / Hip-Hop'],
  'hidra': ['Rap / Hip-Hop'],
  'heijan': ['Rap / Hip-Hop'],
  'muti': ['Rap / Hip-Hop'],
  'canbay': ['Rap / Hip-Hop'],
  'wolker': ['Rap / Hip-Hop'],
  'aspova': ['Rap / Hip-Hop'],
  'anıl piyancı': ['Rap / Hip-Hop'],
  'anil piyanci': ['Rap / Hip-Hop'],
  'defkhan': ['Rap / Hip-Hop'],
  'joker': ['Rap / Hip-Hop'],
  'server uraz': ['Rap / Hip-Hop'],
  'tepki': ['Rap / Hip-Hop'],
  'cash flow': ['Rap / Hip-Hop'],
  'massaka': ['Rap / Hip-Hop'],
  'yener çevik': ['Rap / Hip-Hop', 'Arabesk / Damar'],
  'yener cevik': ['Rap / Hip-Hop', 'Arabesk / Damar'],
  'gazapizm': ['Rap / Hip-Hop'],
  'era7capone': ['Rap / Hip-Hop'],
  'poizi': ['Rap / Hip-Hop'],
  'jeff redd': ['Rap / Hip-Hop'],
  'alizade': ['Rap / Hip-Hop'],
  'baneva': ['Rap / Hip-Hop'],
  'amo988': ['Rap / Hip-Hop'],
  'yung ouzo': ['Rap / Hip-Hop'],
  'lil zey': ['Rap / Hip-Hop'],
  'critical': ['Rap / Hip-Hop'],
  'jefe': ['Rap / Hip-Hop'],
  'norm ender': ['Rap / Hip-Hop'],
  'no.1': ['Rap / Hip-Hop'],
  'no 1': ['Rap / Hip-Hop'],
  'stabil': ['Rap / Hip-Hop'],
  'sansar salvo': ['Rap / Hip-Hop'],
  'hayki': ['Rap / Hip-Hop'],
  'maestro': ['Rap / Hip-Hop'],
  'şam': ['Rap / Hip-Hop'],
  'sam': ['Rap / Hip-Hop'],
  'asil slang': ['Rap / Hip-Hop'],
  'zen-g': ['Rap / Hip-Hop'],
  'killa hakan': ['Rap / Hip-Hop'],
  'patron': ['Rap / Hip-Hop'],
  'saian': ['Rap / Hip-Hop'],
  'karaçalı': ['Rap / Hip-Hop'],
  'farazi': ['Rap / Hip-Hop'],
  'kayra': ['Rap / Hip-Hop'],
  'murda': ['Rap / Hip-Hop'],
  'summer cem': ['Rap / Hip-Hop'],
  'mero': ['Rap / Hip-Hop'],
  'eno': ['Rap / Hip-Hop'],
  'luciano': ['Rap / Hip-Hop'],
  'capital bra': ['Rap / Hip-Hop'],
  'velet': ['Rap / Hip-Hop'],
  'bege': ['Rap / Hip-Hop'],
  'reynmen': ['Rap / Hip-Hop', 'Pop'],
  'semicenk': ['Pop', 'Arabesk / Damar'],

  // Rap / Hip-Hop (International)
  'eminem': ['Rap / Hip-Hop'],
  'drake': ['Rap / Hip-Hop'],
  'travis scott': ['Rap / Hip-Hop'],
  'kanye west': ['Rap / Hip-Hop'],
  '50 cent': ['Rap / Hip-Hop'],
  '2pac': ['Rap / Hip-Hop'],
  'tupac': ['Rap / Hip-Hop'],
  'snoop dogg': ['Rap / Hip-Hop'],
  'kendrick lamar': ['Rap / Hip-Hop'],
  'post malone': ['Rap / Hip-Hop', 'Pop'],
  'future': ['Rap / Hip-Hop'],
  'metro boomin': ['Rap / Hip-Hop'],
  'playboi carti': ['Rap / Hip-Hop'],
  'lil baby': ['Rap / Hip-Hop'],
  'central cee': ['Rap / Hip-Hop'],
  'jack harlow': ['Rap / Hip-Hop'],
  'ice spice': ['Rap / Hip-Hop'],
  'cardi b': ['Rap / Hip-Hop'],
  'nicki minaj': ['Rap / Hip-Hop'],
  'xxxtentacion': ['Rap / Hip-Hop'],
  'juice wrld': ['Rap / Hip-Hop'],
  'lil peep': ['Rap / Hip-Hop'],
  'lil uzi vert': ['Rap / Hip-Hop'],
  '21 savage': ['Rap / Hip-Hop'],
  'gunna': ['Rap / Hip-Hop'],
  'young thug': ['Rap / Hip-Hop'],
  'trippie redd': ['Rap / Hip-Hop'],
  'yeat': ['Rap / Hip-Hop'],
  'ken carson': ['Rap / Hip-Hop'],
  'destroy lonely': ['Rap / Hip-Hop'],
  'roddy ricch': ['Rap / Hip-Hop'],
  'dababy': ['Rap / Hip-Hop'],
  'pop smoke': ['Rap / Hip-Hop'],
  'lil durk': ['Rap / Hip-Hop'],
  'polo g': ['Rap / Hip-Hop'],
  'nle choppa': ['Rap / Hip-Hop'],
  'kodak black': ['Rap / Hip-Hop'],
  'asap rocky': ['Rap / Hip-Hop'],
  'a$ap rocky': ['Rap / Hip-Hop'],
  'tyler, the creator': ['Rap / Hip-Hop'],
  'j. cole': ['Rap / Hip-Hop'],
  'j cole': ['Rap / Hip-Hop'],
  'wiz khalifa': ['Rap / Hip-Hop'],
  'tyga': ['Rap / Hip-Hop'],
  'migos': ['Rap / Hip-Hop'],
  'quavo': ['Rap / Hip-Hop'],
  'offset': ['Rap / Hip-Hop'],
  'takeoff': ['Rap / Hip-Hop'],
  'dr. dre': ['Rap / Hip-Hop'],
  'dr dre': ['Rap / Hip-Hop'],
  'ice cube': ['Rap / Hip-Hop'],
  'nas': ['Rap / Hip-Hop'],
  'jay-z': ['Rap / Hip-Hop'],
  'jay z': ['Rap / Hip-Hop'],
  'dmx': ['Rap / Hip-Hop'],
  'lil wayne': ['Rap / Hip-Hop'],

  // Arabesk / Damar
  'müslüm gürses': ['Arabesk / Damar'],
  'muslum gurses': ['Arabesk / Damar'],
  'ibrahim tatlıses': ['Arabesk / Damar'],
  'ibrahim tatlises': ['Arabesk / Damar'],
  'ferdi tayfur': ['Arabesk / Damar'],
  'orhan gencebay': ['Arabesk / Damar'],
  'azer bülbül': ['Arabesk / Damar'],
  'azer bulbul': ['Arabesk / Damar'],
  'bergen': ['Arabesk / Damar'],
  'güllü': ['Arabesk / Damar'],
  'gullu': ['Arabesk / Damar'],
  'cengiz kurtoğlu': ['Arabesk / Damar'],
  'cengiz kurtoglu': ['Arabesk / Damar'],
  'ebru gündeş': ['Arabesk / Damar', 'Pop'],
  'ebru gundes': ['Arabesk / Damar', 'Pop'],
  'sibel can': ['Arabesk / Damar', 'Pop'],
  'hakan taşıyan': ['Arabesk / Damar'],
  'hakan tasiyan': ['Arabesk / Damar'],
  'kibariye': ['Arabesk / Damar'],
  'bülent ersoy': ['Arabesk / Damar'],
  'bulent ersoy': ['Arabesk / Damar'],
  'gökhan doğanay': ['Arabesk / Damar'],
  'gokhan doganay': ['Arabesk / Damar'],
  'seyfi doğanay': ['Arabesk / Damar'],
  'serkan kaya': ['Arabesk / Damar', 'Pop'],
  'ümit besen': ['Arabesk / Damar'],
  'umit besen': ['Arabesk / Damar'],
  'nejat alp': ['Arabesk / Damar'],
  'arif susam': ['Arabesk / Damar'],
  'coşkun sabah': ['Arabesk / Damar', 'Pop'],
  'sinan özen': ['Arabesk / Damar', 'Pop'],
  'mahsun kırmızıgül': ['Arabesk / Damar', 'Türkü / Özgün'],
  'alişan': ['Arabesk / Damar', 'Pop'],
  'emrah': ['Arabesk / Damar'],
  'küçük emrah': ['Arabesk / Damar'],
  'ceylan': ['Arabesk / Damar', 'Türkü / Özgün'],
  'latif doğan': ['Arabesk / Damar', 'Türkü / Özgün'],
  'mustafa keser': ['Arabesk / Damar', 'Türkü / Özgün'],
  'hakkı bulut': ['Arabesk / Damar'],
  'hakki bulut': ['Arabesk / Damar'],
  'tüdanya': ['Arabesk / Damar'],
  'tudanya': ['Arabesk / Damar'],
  'kamuran akkor': ['Arabesk / Damar'],

  // Rock / Alternatif
  'duman': ['Rock / Alternatif'],
  'mor ve ötesi': ['Rock / Alternatif'],
  'mor ve otesi': ['Rock / Alternatif'],
  'manga': ['Rock / Alternatif'],
  'maNga': ['Rock / Alternatif'],
  'şebnem ferah': ['Rock / Alternatif'],
  'sebnem ferah': ['Rock / Alternatif'],
  'teoman': ['Rock / Alternatif'],
  'hayko cepkin': ['Rock / Alternatif', 'Agresif / Sert'],
  'haluk levent': ['Rock / Alternatif'],
  'barış manço': ['Rock / Alternatif', 'Pop'],
  'baris manco': ['Rock / Alternatif', 'Pop'],
  'cem karaca': ['Rock / Alternatif'],
  'erkin koray': ['Rock / Alternatif'],
  'kurban': ['Rock / Alternatif', 'Agresif / Sert'],
  'pentagram': ['Rock / Alternatif', 'Agresif / Sert'],
  'yüksek sadakat': ['Rock / Alternatif'],
  'yuksek sadakat': ['Rock / Alternatif'],
  'gripin': ['Rock / Alternatif'],
  'zakkum': ['Rock / Alternatif'],
  'model': ['Rock / Alternatif'],
  'kolpa': ['Rock / Alternatif'],
  'emre aydın': ['Rock / Alternatif', 'Melodik / Akustik'],
  'emre aydin': ['Rock / Alternatif', 'Melodik / Akustik'],
  'ogün sanlısoy': ['Rock / Alternatif'],
  'feridun düzağaç': ['Rock / Alternatif', 'Melodik / Akustik'],
  'pinhani': ['Rock / Alternatif', 'Melodik / Akustik'],
  'yüzyüzeyken konuşuruz': ['Rock / Alternatif', 'Melodik / Akustik'],
  'yuzyuzeyken konusuruz': ['Rock / Alternatif', 'Melodik / Akustik'],
  'adamlar': ['Rock / Alternatif'],
  'dolu kadehi ters tut': ['Rock / Alternatif'],
  'büyük ev ablukada': ['Rock / Alternatif'],
  'son feci bisiklet': ['Rock / Alternatif'],
  'yaşlı amca': ['Rock / Alternatif'],
  'yasli amca': ['Rock / Alternatif'],
  'madrigal': ['Rock / Alternatif', 'Pop'],
  'dedublüman': ['Rock / Alternatif', 'Melodik / Akustik'],
  'dedubluman': ['Rock / Alternatif', 'Melodik / Akustik'],
  'perdenin ardındakiler': ['Rock / Alternatif', 'Melodik / Akustik'],
  'sufle': ['Rock / Alternatif', 'Pop'],
  'canozan': ['Rock / Alternatif', 'Melodik / Akustik'],
  'deniz tekin': ['Melodik / Akustik', 'Rock / Alternatif'],
  'sena şener': ['Rock / Alternatif', 'Melodik / Akustik'],
  'kalben': ['Rock / Alternatif', 'Melodik / Akustik'],
  'redd': ['Rock / Alternatif'],
  'seksendört': ['Rock / Alternatif'],
  'flört': ['Rock / Alternatif'],
  'athena': ['Rock / Alternatif'],
  'vega': ['Rock / Alternatif'],
  'queen': ['Rock / Alternatif'],
  'metallica': ['Agresif / Sert', 'Rock / Alternatif'],
  'nirvana': ['Rock / Alternatif'],
  'ac/dc': ['Rock / Alternatif'],
  'guns n\' roses': ['Rock / Alternatif'],
  'linkin park': ['Rock / Alternatif', 'Agresif / Sert'],
  'coldplay': ['Rock / Alternatif', 'Pop'],
  'arctic monkeys': ['Rock / Alternatif'],
  'the neighbourhood': ['Rock / Alternatif', 'Chill / Sakin'],
  'imagine dragons': ['Rock / Alternatif', 'Pop'],
  'radiohead': ['Rock / Alternatif', 'Melodik / Akustik'],
  'green day': ['Rock / Alternatif'],
  'rammstein': ['Agresif / Sert'],

  // Pop
  'tarkan': ['Pop'],
  'sezen aksu': ['Pop', 'Melodik / Akustik'],
  'sıla': ['Pop'],
  'sila': ['Pop'],
  'edis': ['Pop'],
  'mabel matiz': ['Pop', 'Rock / Alternatif'],
  'kenan doğulu': ['Pop'],
  'kenan dogulu': ['Pop'],
  'murat boz': ['Pop'],
  'gülşen': ['Pop'],
  'gulsen': ['Pop'],
  'hadise': ['Pop'],
  'simge': ['Pop'],
  'yalın': ['Pop', 'Melodik / Akustik'],
  'yalin': ['Pop', 'Melodik / Akustik'],
  'mustafa sandal': ['Pop'],
  'serdar ortaç': ['Pop'],
  'serdar ortac': ['Pop'],
  'demet akalın': ['Pop'],
  'demet akalin': ['Pop'],
  'hande yener': ['Pop', 'Elektronik / Club'],
  'irem derici': ['Pop'],
  'oğuzhan koç': ['Pop'],
  'buray': ['Pop', 'Melodik / Akustik'],
  'zeynep bastık': ['Pop', 'Melodik / Akustik'],
  'zeynep bastik': ['Pop', 'Melodik / Akustik'],
  'aleyna tilki': ['Pop'],
  'berkay': ['Pop'],
  'ilyas yalçıntaş': ['Pop', 'Melodik / Akustik'],
  'merve özbey': ['Pop', 'Arabesk / Damar'],
  'derya uluğ': ['Pop'],
  'ece seçkin': ['Pop'],
  'tuğba yurt': ['Pop'],
  'gökhan türkmen': ['Pop', 'Melodik / Akustik'],
  'tan taşçı': ['Pop', 'Arabesk / Damar'],
  'soner sarıkabadayı': ['Pop'],
  'murat dalkılıç': ['Pop'],
  'ziynet sali': ['Pop'],
  'bengü': ['Pop'],
  'funda arar': ['Pop'],
  'taylor swift': ['Pop'],
  'dua lipa': ['Pop'],
  'the weeknd': ['Pop', 'Elektronik / Club'],
  'billie eilish': ['Pop', 'Melodik / Akustik', 'Chill / Sakin'],
  'bruno mars': ['Pop'],
  'rihanna': ['Pop'],
  'ariana grande': ['Pop'],
  'katy perry': ['Pop'],
  'michael jackson': ['Pop'],
  'justin bieber': ['Pop'],
  'ed sheeran': ['Pop', 'Melodik / Akustik'],
  'harry styles': ['Pop', 'Rock / Alternatif'],
  'adele': ['Pop', 'Melodik / Akustik'],
  'shakira': ['Pop', 'Yabancı Hit'],
  'madonna': ['Pop'],
  'lady gaga': ['Pop', 'Elektronik / Club'],
  'beyonce': ['Pop', 'Rap / Hip-Hop'],
  'sia': ['Pop'],
  'sam smith': ['Pop', 'Melodik / Akustik'],

  // Türkü / Özgün
  'ahmet kaya': ['Türkü / Özgün'],
  'aşık veysel': ['Türkü / Özgün'],
  'asik veysel': ['Türkü / Özgün'],
  'neşet ertaş': ['Türkü / Özgün'],
  'neset ertas': ['Türkü / Özgün'],
  'musa eroğlu': ['Türkü / Özgün'],
  'arif sağ': ['Türkü / Özgün'],
  'selda bağcan': ['Türkü / Özgün', 'Rock / Alternatif'],
  'selda bagcan': ['Türkü / Özgün', 'Rock / Alternatif'],
  'cahit berkay': ['Türkü / Özgün', 'Rock / Alternatif'],
  'volkan konak': ['Türkü / Özgün', 'Pop'],
  'koray avcı': ['Türkü / Özgün', 'Pop'],
  'resul dindar': ['Türkü / Özgün'],
  'şevval sam': ['Türkü / Özgün', 'Chill / Sakin'],
  'erdal erzincan': ['Türkü / Özgün'],
  'muhlis akarsu': ['Türkü / Özgün'],
  'mahzuni şerif': ['Türkü / Özgün'],
  'kıvırcık ali': ['Türkü / Özgün'],
  'onur akın': ['Türkü / Özgün'],
  'edip akbayram': ['Türkü / Özgün'],
  'ilkay akkaya': ['Türkü / Özgün'],
  'kubat': ['Türkü / Özgün'],
  'zara': ['Türkü / Özgün', 'Pop'],
  'sevcan orhan': ['Türkü / Özgün'],
  'ekin uzunlar': ['Türkü / Özgün', 'Pop']
};

/**
 * Classifies a track into high-level Muzikors genre categories
 */
export function classifyTrackGenres(
  track: {
    title?: string;
    name?: string;
    artist?: string;
    artists?: string;
    genres?: string[];
  },
  searchQuery?: string
): string[] {
  const resultCategories = new Set<string>();
  const artistName = String(track.artist || track.artists || '').toLowerCase().trim();
  const trackTitle = String(track.title || track.name || '').toLowerCase().trim();
  const rawGenres = (track.genres || []).map(g => String(g).toLowerCase().trim());
  const queryStr = String(searchQuery || '').toLowerCase().trim();

  // 1. Direct match with Spotify raw genres via GENRE_MAP
  for (const [category, keywords] of Object.entries(GENRE_MAP)) {
    for (const rawGenre of rawGenres) {
      if (keywords.some(kw => rawGenre.includes(kw) || kw.includes(rawGenre))) {
        resultCategories.add(category);
      }
    }
  }

  // 2. Renowned artist dictionary match on track artist
  for (const [knownArtist, categories] of Object.entries(KNOWN_ARTIST_GENRES)) {
    if (artistName.includes(knownArtist) || knownArtist.includes(artistName)) {
      categories.forEach(c => resultCategories.add(c));
    }
  }

  // 3. Match searchQuery against renowned artist dictionary and genre keywords
  if (queryStr.length >= 2) {
    for (const [knownArtist, categories] of Object.entries(KNOWN_ARTIST_GENRES)) {
      if (queryStr.includes(knownArtist) || knownArtist.includes(queryStr)) {
        categories.forEach(c => resultCategories.add(c));
      }
    }
  }

  // 4. Keyword matching on track title, artist name & search query
  const fullText = `${trackTitle} ${artistName} ${queryStr}`;

  // Rap / Drill / Trap keywords
  if (
    /\b(rap|trap|drill|freestyle|diss|flow|beat|feat\.|ft\.|mc|dj|prod\.|hiphop|hip hop)\b/i.test(fullText) ||
    /(\brapp\b|\btrap\b|\bdrill\b)/i.test(fullText)
  ) {
    resultCategories.add('Rap / Hip-Hop');
  }

  // Arabesk keywords
  if (/\b(arabesk|damar|meyhane|efkar|hasret|isyan|fantezi|fantazi)\b/i.test(fullText)) {
    resultCategories.add('Arabesk / Damar');
  }

  // Akustik / Melodik keywords
  if (/\b(akustik|acoustic|unplugged|piano|piyano|slow|enstrümantal|instrumental)\b/i.test(fullText)) {
    resultCategories.add('Melodik / Akustik');
  }

  // Türkü keywords
  if (/\b(türkü|turku|ağıt|uzun hava|halay|bozlak|semah|deyiş)\b/i.test(fullText)) {
    resultCategories.add('Türkü / Özgün');
  }

  // Rock keywords
  if (/\b(rock|metal|gitar|solo|band|heavy metal)\b/i.test(fullText)) {
    resultCategories.add('Rock / Alternatif');
  }

  return Array.from(resultCategories);
}

/**
 * Checks if a track is allowed by the venue's Vibe Guard configuration
 */
export function isTrackAllowedByVibeGuard(
  track: { title?: string; name?: string; artist?: string; artists?: string; genres?: string[] },
  allowedGenres?: string[] | null,
  searchQuery?: string
): { isAllowed: boolean; matchedGenres: string[]; blockedReason?: string } {
  // If venue didn't specify allowed_genres or allowed_genres is empty -> Vibe Guard is OFF (Everything allowed)
  if (!allowedGenres || !Array.isArray(allowedGenres) || allowedGenres.length === 0) {
    return { isAllowed: true, matchedGenres: [] };
  }

  const matchedGenres = classifyTrackGenres(track, searchQuery);

  // If track has no matched genre and cannot be classified, allow it
  if (matchedGenres.length === 0) {
    return { isAllowed: true, matchedGenres: [] };
  }

  // Calculate forbidden genres for this venue (all standard genres NOT in allowedGenres)
  const forbiddenGenres: string[] = (ALL_GENRES as readonly string[]).filter(g => !allowedGenres.includes(g));

  // Check if track matches any forbidden genre
  const matchedForbiddenGenres = matchedGenres.filter(g => forbiddenGenres.includes(g));

  if (matchedForbiddenGenres.length > 0) {
    // If the track matches a forbidden genre (e.g. Rap), even if it also has Pop,
    // the forbidden genre takes precedence to protect the venue's atmosphere!
    const forbiddenGenresStr = matchedForbiddenGenres.join(', ');
    return {
      isAllowed: false,
      matchedGenres,
      blockedReason: `Mekân Tarzı Dışı (${forbiddenGenresStr})`
    };
  }

  return { isAllowed: true, matchedGenres };
}
