import AsyncStorage from '@react-native-async-storage/async-storage';

const ROUTES_KEY = '@AlgoRota_Routes';
const ACTIVE_ROUTE_KEY = '@AlgoRota_ActiveRoute';
const FAVORITES_KEY = '@AlgoRota_Favorites';
const USER_PROFILE_KEY = '@AlgoRota_UserProfile';

const THEME_KEY = '@theme_preference';

export const storageService = {
  // Rotaları kaydet
  saveRoute: async (route: any) => {
    try {
      const existingRoutes = await storageService.getRoutes();
      const newRoutes = [route, ...existingRoutes];
      await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(newRoutes));
      return true;
    } catch (error) {
      console.error("Storage Error (saveRoute):", error);
      return false;
    }
  },

  // Rotaları getir
  getRoutes: async () => {
    try {
      const routes = await AsyncStorage.getItem(ROUTES_KEY);
      return routes ? JSON.parse(routes) : [];
    } catch (error) {
      console.error("Storage Error (getRoutes):", error);
      return [];
    }
  },

  // Rota sil
  removeRoute: async (routeId: string) => {
    try {
      const routes = await storageService.getRoutes();
      const newRoutes = routes.filter((r: any) => r.id !== routeId);
      await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(newRoutes));
      return true;
    } catch (error) {
      console.error("Storage Error (removeRoute):", error);
      return false;
    }
  },

  // Rota güncelle (REQ.UI.17)
  updateRoute: async (updatedRoute: any) => {
    try {
      const routes = await storageService.getRoutes();
      const newRoutes = routes.map((r: any) => r.id === updatedRoute.id ? updatedRoute : r);
      await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(newRoutes));
      
      // Eğer güncellenen rota aynı zamanda aktif rotaysa onu da güncelle
      const active = await storageService.getActiveRoute();
      if (active && active.id === updatedRoute.id) {
        await storageService.setActiveRoute(updatedRoute);
      }
      return true;
    } catch (error) {
      console.error("Storage Error (updateRoute):", error);
      return false;
    }
  },

  // Aktif rotayı set et (REQ.UI.12)
  setActiveRoute: async (route: any) => {
    try {
      await AsyncStorage.setItem(ACTIVE_ROUTE_KEY, JSON.stringify(route));
      return true;
    } catch (error) {
      console.error("Storage Error (setActiveRoute):", error);
      return false;
    }
  },

  // Aktif rotayı getir
  getActiveRoute: async () => {
    try {
      const route = await AsyncStorage.getItem(ACTIVE_ROUTE_KEY);
      return route ? JSON.parse(route) : null;
    } catch (error) {
      console.error("Storage Error (getActiveRoute):", error);
      return null;
    }
  },

  // Favorilere ekle/çıkar (REQ.F.16)
  toggleFavorite: async (city: any) => {
    try {
      const favorites = await storageService.getFavorites();
      const isExist = favorites.find((f: any) => f.id === city.id);
      
      let newFavorites;
      if (isExist) {
        newFavorites = favorites.filter((f: any) => f.id !== city.id);
      } else {
        newFavorites = [city, ...favorites];
      }
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return !isExist; // true ise eklendi, false ise çıkarıldı
    } catch (error) {
      console.error("Storage Error (toggleFavorite):", error);
      return false;
    }
  },

  // Favorileri getir (REQ.F.17)
  getFavorites: async () => {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error("Storage Error (getFavorites):", error);
      return [];
    }
  },

  // Profil getir (REQ.UI.19)
  getUserProfile: async () => {
    try {
      const profile = await AsyncStorage.getItem(USER_PROFILE_KEY);
      return profile ? JSON.parse(profile) : { name: 'Gezgin Kullanıcı', email: 'gezgin@algorota.com' };
    } catch (error) {
      console.error("Storage Error (getUserProfile):", error);
      return { name: 'Gezgin Kullanıcı', email: 'gezgin@algorota.com' };
    }
  },

  // Profil kaydet (REQ.F.03)
  saveUserProfile: async (profile: any) => {
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error("Storage Error (saveUserProfile):", error);
      return false;
    }
  },

  // Bildirim Ayarı Kaydet (REQ.UI.20)
  saveNotificationPreference: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('@AlgoRota_Notifications', JSON.stringify(enabled));
      return true;
    } catch (error) {
      console.error("Storage Error (saveNotificationPreference):", error);
      return false;
    }
  },

  // Bildirim Ayarı Getir
  getNotificationPreference: async () => {
    try {
      const val = await AsyncStorage.getItem('@AlgoRota_Notifications');
      return val ? JSON.parse(val) : false;
    } catch (error) {
      console.error("Storage Error (getNotificationPreference):", error);
      return false;
    }
  },

  // Temizle
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([ROUTES_KEY, ACTIVE_ROUTE_KEY, FAVORITES_KEY, USER_PROFILE_KEY, '@AlgoRota_Notifications']);
    } catch (error) {
      console.error("Storage Error (clearAll):", error);
    }
  },
  
  // Tema Tercihi
  saveThemePreference: async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, JSON.stringify(isDark));
    } catch (error) {
      console.error('Tema tercihi kaydedilemedi', error);
    }
  },

  getThemePreference: async () => {
    try {
      const value = await AsyncStorage.getItem(THEME_KEY);
      return value ? JSON.parse(value) : false; // Default: Light mode (false)
    } catch (error) {
      console.error('Tema tercihi okunamadı', error);
      return false;
    }
  }
};
