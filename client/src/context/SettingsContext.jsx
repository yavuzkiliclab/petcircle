import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext(null);

const STORAGE_KEY = 'petcircle_settings';

const defaults = {
  theme: 'light',
  language: 'tr',
  petFilter: 'all',
  compact: false,
};

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  tr: {
    // Nav
    home: 'Ana Sayfa',
    explore: 'Keşfet',
    reels: 'Reels',
    messages: 'Mesajlar',
    notifications: 'Bildirimler',
    newPost: 'Yeni Gönderi',
    trending: 'Trend',
    stats: 'İstatistik',
    profile: 'Profil',
    logout: 'Çıkış',
    searchPlaceholder: 'Kullanıcı veya etiket ara...',
    searchAll: 'Tümünde ara →',
    // Feed
    suggestedForYou: 'Sana Önerilen',
    seeAll: 'Tümünü gör',
    follow: 'Takip Et',
    following: 'Takip Ediliyor',
    youMightLike: 'Bunları da beğenebilirsin',
    // Explore
    all: 'Tümü',
    nearYou: 'Yakınındaki Evcil Hayvanlar',
    suggestedUsers: 'Önerilen Kullanıcılar',
    loadMore: 'Daha fazla göster',
    loading: 'Yükleniyor...',
    noPostsFound: 'Gönderi bulunamadı',
    shareFirst: 'İlk fotoğrafı sen paylaş!',
    filterByCountry: 'Ülkeye göre filtrele',
    filterByCity: 'Şehre göre filtrele',
    allCountries: 'Tüm Ülkeler',
    // Profile
    editProfile: 'Profili Düzenle',
    posts: 'Gönderi',
    followers: 'Takipçi',
    followingLabel: 'Takip',
    noPosts: 'Henüz gönderi yok',
    // Edit Profile
    editProfileTitle: 'Profili Düzenle',
    fullName: 'Ad Soyad',
    bio: 'Biyografi',
    bioPlaceholder: 'Kendin ve hayvanın hakkında...',
    petInfo: 'Evcil Hayvan Bilgileri',
    petName: 'Evcil hayvanının adı',
    petNamePlaceholder: 'Pamuk, Max, Boncuk...',
    petType: 'Evcil hayvan türü',
    cat: 'Kedi',
    dog: 'Köpek',
    other: 'Diğer',
    city: 'Şehir',
    cityPlaceholder: 'İstanbul, London...',
    country: 'Ülke',
    language: 'Dil',
    turkish: 'Türkçe',
    english: 'English',
    settings: 'Tercihler',
    darkMode: 'Karanlık Mod',
    lightMode: 'Aydınlık Mod',
    compactMode: 'Kompakt Mod',
    petFilter: 'Evcil Hayvan Filtresi',
    save: 'Kaydet',
    saving: 'Kaydediliyor...',
    changePhoto: 'Fotoğraf değiştir',
    // Messages
    directMessages: 'Mesajlar',
    sendMessage: 'Mesaj gönder...',
    send: 'Gönder',
    selectConversation: 'Bir konuşma seç',
    // Notifications
    noNotifications: 'Bildirim yok',
    markAllRead: 'Tümünü okundu işaretle',
    // Auth
    loginTitle: 'Hoş Geldin',
    loginSubtitle: 'PetCircle\'a giriş yap',
    usernameOrEmail: 'Kullanıcı adı veya e-posta',
    password: 'Şifre',
    login: 'Giriş Yap',
    noAccount: 'Hesabın yok mu?',
    register: 'Kayıt Ol',
    registerTitle: 'Hesap Oluştur',
    haveAccount: 'Hesabın var mı?',
    // Search
    searchTitle: 'Arama',
    users: 'Kullanıcılar',
    noResults: 'Sonuç bulunamadı',
    // New Post
    newPostTitle: 'Yeni Gönderi',
    uploadMedia: 'Fotoğraf veya video yükle',
    caption: 'Açıklama',
    captionPlaceholder: 'Bir şeyler yaz...',
    location: 'Konum',
    locationPlaceholder: 'Konum ekle...',
    share: 'Paylaş',
    sharing: 'Paylaşılıyor...',
    // Trending
    trendingTitle: 'Trend Gönderiler',
    today: 'Bugün',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',
    // Time
    justNow: 'Az önce',
    minutesAgo: 'dakika önce',
    hoursAgo: 'saat önce',
    daysAgo: 'gün önce',
    weeksAgo: 'hafta önce',
  },
  en: {
    // Nav
    home: 'Home',
    explore: 'Explore',
    reels: 'Reels',
    messages: 'Messages',
    notifications: 'Notifications',
    newPost: 'New Post',
    trending: 'Trending',
    stats: 'Statistics',
    profile: 'Profile',
    logout: 'Log Out',
    searchPlaceholder: 'Search users or tags...',
    searchAll: 'Search all →',
    // Feed
    suggestedForYou: 'Suggested for You',
    seeAll: 'See all',
    follow: 'Follow',
    following: 'Following',
    youMightLike: 'You might also like',
    // Explore
    all: 'All',
    nearYou: 'Pets Near You',
    suggestedUsers: 'Suggested Users',
    loadMore: 'Load more',
    loading: 'Loading...',
    noPostsFound: 'No posts found',
    shareFirst: 'Be the first to share!',
    filterByCountry: 'Filter by country',
    filterByCity: 'Filter by city',
    allCountries: 'All Countries',
    // Profile
    editProfile: 'Edit Profile',
    posts: 'Posts',
    followers: 'Followers',
    followingLabel: 'Following',
    noPosts: 'No posts yet',
    // Edit Profile
    editProfileTitle: 'Edit Profile',
    fullName: 'Full Name',
    bio: 'Bio',
    bioPlaceholder: 'About you and your pet...',
    petInfo: 'Pet Information',
    petName: "Pet's name",
    petNamePlaceholder: 'Whiskers, Max, Biscuit...',
    petType: 'Pet type',
    cat: 'Cat',
    dog: 'Dog',
    other: 'Other',
    city: 'City',
    cityPlaceholder: 'Istanbul, London...',
    country: 'Country',
    language: 'Language',
    turkish: 'Türkçe',
    english: 'English',
    settings: 'Preferences',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    compactMode: 'Compact Mode',
    petFilter: 'Pet Filter',
    save: 'Save',
    saving: 'Saving...',
    changePhoto: 'Change photo',
    // Messages
    directMessages: 'Messages',
    sendMessage: 'Send a message...',
    send: 'Send',
    selectConversation: 'Select a conversation',
    // Notifications
    noNotifications: 'No notifications',
    markAllRead: 'Mark all as read',
    // Auth
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Sign in to PetCircle',
    usernameOrEmail: 'Username or email',
    password: 'Password',
    login: 'Sign In',
    noAccount: "Don't have an account?",
    register: 'Sign Up',
    registerTitle: 'Create Account',
    haveAccount: 'Already have an account?',
    // Search
    searchTitle: 'Search',
    users: 'Users',
    noResults: 'No results found',
    // New Post
    newPostTitle: 'New Post',
    uploadMedia: 'Upload a photo or video',
    caption: 'Caption',
    captionPlaceholder: 'Write something...',
    location: 'Location',
    locationPlaceholder: 'Add location...',
    share: 'Share',
    sharing: 'Sharing...',
    // Trending
    trendingTitle: 'Trending Posts',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    // Time
    justNow: 'Just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    weeksAgo: 'weeks ago',
  },
};

export const COUNTRIES = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
];

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...defaults, ...stored };
    } catch { return defaults; }
  });

  // Apply theme & compact to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.classList.toggle('compact', settings.compact);
  }, [settings.theme, settings.compact]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const t = useCallback((key) => {
    return translations[settings.language]?.[key] ?? translations.tr[key] ?? key;
  }, [settings.language]);

  const value = {
    theme: settings.theme,
    language: settings.language,
    petFilter: settings.petFilter,
    compact: settings.compact,
    setTheme: (v) => updateSetting('theme', v),
    setLanguage: (v) => updateSetting('language', v),
    setPetFilter: (v) => updateSetting('petFilter', v),
    setCompact: (v) => updateSetting('compact', v),
    t,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
