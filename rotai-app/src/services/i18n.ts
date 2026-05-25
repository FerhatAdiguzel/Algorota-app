import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = '@AlgoRota_Language';

const translations: any = {
  tr: {
    // Tab & Navigation
    explore: 'Keşfet',
    my_routes: 'Rota Planlarım',
    profile: 'Profilim',
    
    // Auth Screens
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    forgot_password: 'Şifremi Unuttum',
    login_subtitle: 'Yapay zeka ile rotanı çiz, keşfetmeye başla.',
    register_subtitle: 'Gezi macerana başlamak için kayıt ol.',
    forgot_subtitle: 'E-posta adresini gir, sana şifre sıfırlama linki gönderelim.',
    email_label: 'E-posta',
    email_placeholder: 'email@example.com',
    password_label: 'Şifre',
    password_placeholder: 'Şifreniz',
    confirm_password_label: 'Şifre Tekrar',
    confirm_password_placeholder: 'Şifre tekrarı',
    notifications_checkbox: 'Önerilen rotalar için bildirim izni ver',
    no_account: 'Hesabın yok mu? ',
    already_account: 'Zaten hesabın var mı? Giriş yap',
    reset_request_btn: 'Talep Gönder',
    back_to_login: 'Geri Dön',
    name_label: 'Ad Soyad',
    name_placeholder: 'Adınız Soyadınız',
    
    // Errors & Alerts
    error_title: 'Hata',
    success_title: 'Başarılı',
    fill_all: 'Lütfen tüm alanları doldurun.',
    invalid_email: 'Lütfen geçerli bir e-posta adresi girin.',
    password_mismatch: 'Şifreler eşleşmiyor.',
    login_failed: 'Giriş Başarısız. E-posta veya şifre hatalı.',
    server_error: 'Sunucuya bağlanılamadı.',
    register_success: 'Hesabınız oluşturuldu!',
    reset_success_msg: 'Şifre sıfırlama talebiniz başarıyla alındı.',
    
    // Explore & Home Screen
    welcome_title: 'Rota Oluştur 🗺️',
    welcome_subtitle: 'Hayalindeki geziyi planlayalım.',
    destination_label: 'Nereye Gitmek İstersin?',
    destination_placeholder: 'Şehir adı (Örn: İstanbul)',
    days_label: 'Kaç Gün Sürecek?',
    days_placeholder: 'Gün sayısı (Örn: 3)',
    interests_label: 'İlgi Alanların',
    budget_label: 'Bütçe Tercihi',
    budget_low: 'Düşük',
    budget_medium: 'Orta',
    budget_high: 'Yüksek',
    generate_route: '✨ Rota Oluştur',
    loading_ai: 'YZ Mutfağında Rotan Pişiyor...',
    loading_sub: 'Bu işlem yaklaşık 10 saniye sürebilir.',
    popular_cities: 'En Çok Ziyaret Edilen Şehirler',
    popular_places: 'Popüler Mekanlar',
    see_all: 'Tümünü Gör',
    search_placeholder: 'Şehir veya mekan ara...',
    no_results: 'Sonuç bulunamadı',
    use_my_location: '📍 Konumu Kullan',
    
    // Widget
    widget_next_stop: 'Sıradaki Durak 🚩',
    widget_inspiration: 'Günün İlhamı ✨',
    widget_popular: 'Popüler Rota',
    
    // Route Detail & Edit Route
    route_ready: 'Rotan Hazır!',
    route_subtitle: 'günlük plan.',
    map_btn: '📍 Harita',
    save_route: 'Rotayı Kaydet',
    edit: 'Düzenle',
    delete: 'Sil',
    edit_route_title: 'Rotasını Düzenle',
    edit_route_sub: 'Durakları silebilir veya yerlerini değiştirebilirsin.',
    delete_confirm_title: 'Sil',
    delete_confirm_desc: 'Bu durağı rotadan kaldırmak istediğine emin misin?',
    save_changes: 'Değişiklikleri Kaydet',
    save_success: 'Rota değişiklikleri kaydedildi.',
    
    // Profile & Settings
    settings: 'Ayarlar',
    favorites: 'Favorilerim',
    notifications: 'Bildirimler',
    dark_mode: 'Karanlık Mod',
    language_selection: 'Dil Seçimi',
    change_password: 'Şifre Değiştir',
    logout: 'Çıkış Yap',
    edit_profile: 'Profili Düzenle',
    feedback_section: 'Geri Bildirim Gönder (REQ.F.18)',
    feedback_placeholder: 'Uygulama veya rotalar hakkındaki görüşlerinizi yazın...',
    feedback_btn: 'Gönder',
    feedback_success: 'Geri bildiriminiz başarıyla iletildi. Teşekkür ederiz!',
    feedback_type_label: 'Geri Bildirim Türü',
    feedback_type_app: 'Uygulama Hakkında',
    feedback_type_route: 'Rotalar Hakkında'
  },
  en: {
    // Tab & Navigation
    explore: 'Explore',
    my_routes: 'Route Plans',
    profile: 'Profile',
    
    // Auth Screens
    login: 'Login',
    register: 'Register',
    forgot_password: 'Forgot Password',
    login_subtitle: 'Draw your route with AI, start exploring.',
    register_subtitle: 'Sign up to start your travel adventure.',
    forgot_subtitle: 'Enter your email, we will send you a reset link.',
    email_label: 'Email',
    email_placeholder: 'email@example.com',
    password_label: 'Password',
    password_placeholder: 'Your password',
    confirm_password_label: 'Confirm Password',
    confirm_password_placeholder: 'Password again',
    notifications_checkbox: 'Receive notifications for recommended routes',
    no_account: "Don't have an account? ",
    already_account: 'Already have an account? Login',
    reset_request_btn: 'Send Request',
    back_to_login: 'Go Back',
    name_label: 'Full Name',
    name_placeholder: 'Your Full Name',
    
    // Errors & Alerts
    error_title: 'Error',
    success_title: 'Success',
    fill_all: 'Please fill in all fields.',
    invalid_email: 'Please enter a valid email address.',
    password_mismatch: 'Passwords do not match.',
    login_failed: 'Login Failed. Incorrect email or password.',
    server_error: 'Could not connect to the server.',
    register_success: 'Account created successfully!',
    reset_success_msg: 'Your password reset request has been received.',
    
    // Explore & Home Screen
    welcome_title: 'Add Route 🗺️',
    welcome_subtitle: 'Let\'s plan your dream trip.',
    destination_label: 'Where do you want to go?',
    destination_placeholder: 'City name (e.g. Istanbul)',
    days_label: 'How many days?',
    days_placeholder: 'Number of days (e.g. 3)',
    interests_label: 'Your Interests',
    budget_label: 'Budget Preference',
    budget_low: 'Low',
    budget_medium: 'Medium',
    budget_high: 'High',
    generate_route: '✨ Generate Route',
    loading_ai: 'AI is Cooking Your Route...',
    loading_sub: 'This process may take about 10 seconds.',
    popular_cities: 'Most Visited Cities',
    popular_places: 'Popular Places',
    see_all: 'See All',
    search_placeholder: 'Search city or place...',
    no_results: 'No results found',
    use_my_location: '📍 Use Location',
    
    // Widget
    widget_next_stop: 'Next Stop 🚩',
    widget_inspiration: 'Inspiration of the Day ✨',
    widget_popular: 'Popular Route',
    
    // Route Detail & Edit Route
    route_ready: 'Your Route is Ready!',
    route_subtitle: 'day plan.',
    map_btn: '📍 Map',
    save_route: 'Save Route',
    edit: 'Edit',
    delete: 'Delete',
    edit_route_title: 'Edit Route',
    edit_route_sub: 'You can delete stops or reorder them.',
    delete_confirm_title: 'Delete',
    delete_confirm_desc: 'Are you sure you want to remove this stop from the route?',
    save_changes: 'Save Changes',
    save_success: 'Route changes saved.',
    
    // Profile & Settings
    settings: 'Settings',
    favorites: 'My Favorites',
    notifications: 'Notifications',
    dark_mode: 'Dark Mode',
    language_selection: 'Language',
    change_password: 'Change Password',
    logout: 'Logout',
    edit_profile: 'Edit Profile',
    feedback_section: 'Send Feedback',
    feedback_placeholder: 'Write your thoughts about the app or routes...',
    feedback_btn: 'Submit',
    feedback_success: 'Your feedback was successfully submitted. Thank you!',
    feedback_type_label: 'Feedback Type',
    feedback_type_app: 'About App',
    feedback_type_route: 'About Routes'
  }
};

export const useTranslation = () => {
  const [lang, setLang] = useState('tr');

  useEffect(() => {
    loadLang();
  }, []);

  const loadLang = async () => {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    if (saved) setLang(saved);
  };

  const changeLang = async (newLang: string) => {
    setLang(newLang);
    await AsyncStorage.setItem(LANG_KEY, newLang);
  };

  const t = (key: string) => {
    const section = translations[lang] || translations['tr'];
    return section[key] || key;
  };

  return { t, lang, changeLang };
};
