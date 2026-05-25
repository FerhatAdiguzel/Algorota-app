import * as Location from 'expo-location';

export const locationService = {
  // Kullanıcı konumunu al
  getCurrentLocation: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Konum izni reddedildi');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return location.coords;
    } catch (error) {
      console.error("Location Error:", error);
      return null;
    }
  },

  // Koordinatlardan adres/şehir bul (Reverse Geocoding)
  getCityFromCoords: async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        return result[0].city || result[0].region;
      }
      return null;
    } catch (error) {
      console.error("Reverse Geocoding Error:", error);
      return null;
    }
  }
};
