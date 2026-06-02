import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// DİKKAT: Yerel geliştirme ortamında 'localhost' mobil cihazlarda çalışmaz.
// Web'de localhost, mobil cihazda bilgisayarınızın yerel IP adresi kullanılır.
const LAN_IP = '172.20.10.2'; // Telefonla test için bilgisayarınızın güncel IP'si
const BASE_URL = Platform.OS === 'web' ? 'http://localhost:8000' : `http://${LAN_IP}:8000`;

export interface RouteRequest {
  city: string;
  days: number;
  interests?: string[];
  budget?: 'düşük' | 'orta' | 'yüksek';
  pace?: 'yavaş' | 'normal' | 'yoğun';
}

export const apiService = {
  // Auth İşlemleri
  register: async (userData: any) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error("Register Error:", error);
      throw error;
    }
  },

  login: async (userData: any) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  },

  // Şifre Sıfırlama Talebi (REQ.UI.03)
  forgotPassword: async (email: string) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await response.json();
    } catch (error) {
      console.error("API Error (forgotPassword):", error);
      throw error;
    }
  },

  // Geri Bildirim Gönder (REQ.F.18)
  submitFeedback: async (feedbackData: { email: string; feedback_type: string; content: string }) => {
    try {
      const response = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify(feedbackData)
      });
      return await response.json();
    } catch (error) {
      console.error("API Error (submitFeedback):", error);
      throw error;
    }
  },

  // Şehirleri getir (REQ.F.04, REQ.F.09)
  getCities: async (search?: string, tag?: string) => {
    try {
      let url = `${BASE_URL}/cities`;
      const lang = await AsyncStorage.getItem('@AlgoRota_Language') || 'tr';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (tag) params.append('tag', tag);
      params.append('lang', lang);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: { "Bypass-Tunnel-Reminder": "true" }
      });
      return await response.json();
    } catch (error) {
      console.error("API Error (getCities):", error);
      throw error;
    }
  },

  // Şehir detayı getir (REQ.F.05)
  getCityDetail: async (cityId: string) => {
    try {
      const lang = await AsyncStorage.getItem('@AlgoRota_Language') || 'tr';
      const response = await fetch(`${BASE_URL}/cities/${cityId}?lang=${lang}`, {
        headers: { "Bypass-Tunnel-Reminder": "true" }
      });
      return await response.json();
    } catch (error) {
      console.error("API Error (getCityDetail):", error);
      throw error;
    }
  },

  // Popüler yerleri getir (REQ.UI.07)
  getPopular: async () => {
    try {
      const lang = await AsyncStorage.getItem('@AlgoRota_Language') || 'tr';
      const response = await fetch(`${BASE_URL}/popular?lang=${lang}`, {
        headers: { "Bypass-Tunnel-Reminder": "true" }
      });
      return await response.json();
    } catch (error) {
      console.error("API Error (getPopular):", error);
      throw error;
    }
  },

  // Rota oluştur (REQ.F.11)
  generateRoute: async (req: RouteRequest) => {
    try {
      const lang = await AsyncStorage.getItem('@AlgoRota_Language') || 'tr';
      const response = await fetch(`${BASE_URL}/generate-route?lang=${lang}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify(req)
      });
      return await response.json();
    } catch (error) {
      console.error("API Error (generateRoute):", error);
      throw error;
    }
  }
};
