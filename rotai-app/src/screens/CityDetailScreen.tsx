import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../services/i18n';

export default function CityDetailScreen({ route, navigation }: any) {
  const { cityId } = route.params;
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const [city, setCity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [popularPlaces, setPopularPlaces] = useState<any[]>([]);

  useEffect(() => {
    loadCityDetail();
    checkIfFavorite();
  }, [cityId]);

  const loadCityDetail = async () => {
    try {
      const data = await apiService.getCityDetail(cityId);
      if (data.status === 'success') {
        setCity(data.city);
        
        // Fetch popular places and filter by current city name
        const popularData = await apiService.getPopular();
        if (popularData.status === 'success') {
          const filtered = popularData.popular_places.filter((p: any) => 
            p.city.toLowerCase() === data.city.name.toLowerCase()
          );
          setPopularPlaces(filtered);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    const favorites = await storageService.getFavorites();
    setIsFavorite(favorites.some((f: any) => f.id === cityId));
  };

  const handleToggleFavorite = async () => {
    const added = await storageService.toggleFavorite(city);
    setIsFavorite(added);
  };

  const getPlaceIcon = (placeName: string) => {
    const lower = placeName.toLowerCase();
    if (lower.includes("cami") || lower.includes("mabet")) return "🕌";
    if (lower.includes("saray") || lower.includes("kasr")) return "🏰";
    if (lower.includes("kule")) return "🗼";
    if (lower.includes("kale")) return "🏰";
    if (lower.includes("müze")) return "🏛️";
    if (lower.includes("antik") || lower.includes("tiyatro")) return "🏛️";
    if (lower.includes("çarşı") || lower.includes("pazar")) return "🛍️";
    if (lower.includes("şelale") || lower.includes("vadi") || lower.includes("göl")) return "🌊";
    if (lower.includes("park") || lower.includes("orman")) return "🌲";
    return "📍";
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: city.image }} style={styles.headerImage} />
      
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.cityName, { color: colors.text }]}>{city.name}</Text>
            <Text style={styles.cityRegion}>{city.region}</Text>
          </View>
          <TouchableOpacity style={[styles.favoriteButton, isDark && { backgroundColor: '#333' }]} onPress={handleToggleFavorite}>
            <Text style={[styles.favoriteIcon, { color: isFavorite ? '#E74C3C' : '#BDC3C7' }]}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popüler Mekanlar (City-Specific) */}
        {popularPlaces && popularPlaces.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🔥 {t('popular_places')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularPlacesScroll}>
              {popularPlaces.map((place: any, index: number) => (
                <View key={index} style={styles.popularPlaceCard}>
                  <Image source={{ uri: place.image }} style={styles.popularPlaceImage} />
                  <View style={styles.popularPlaceOverlay}>
                    <Text style={styles.popularPlaceName} numberOfLines={1}>{place.name}</Text>
                    <Text style={styles.popularPlaceRating}>⭐ {place.rating}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>📖 {t('about')}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{city.description}</Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>🎭 {t('culture')}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{city.culture}</Text>

        {/* REQ.F.06 - Gezilecek Yerler listesi */}
        {city.places && city.places.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🏛️ {t('places_to_visit')}</Text>
            {city.places.map((place: any, index: number) => (
              <View key={index} style={[styles.placeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.placeBadge, isDark && { backgroundColor: '#333' }]}>
                  <Text style={styles.placeIconText}>{getPlaceIcon(place.name)}</Text>
                </View>
                <View style={styles.placeInfo}>
                  <Text style={[styles.placeName, { color: colors.text }]}>{place.name}</Text>
                  <Text style={[styles.placeDesc, { color: colors.textSecondary }]}>{place.desc}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* REQ.F.07 & REQ.F.08 - Yemekler ve Yemek Bilgileri */}
        {city.popular_foods && city.popular_foods.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🍲 {t('famous_foods')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.foodListScroll}>
              {city.popular_foods.map((food: any, index: number) => (
                <View key={index} style={[styles.foodCard, isDark && { backgroundColor: '#3D3325', borderColor: '#4A3B2C' }]}>
                  <Text style={[styles.foodName, isDark && { color: '#E59866' }]}>{food.name}</Text>
                  <Text style={[styles.foodDesc, isDark && { color: '#D5D8DC' }]}>{food.desc}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>🏷️ {t('tags')}</Text>
        <View style={styles.tagCloud}>
          {city.tags.map((tag: string, index: number) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.card }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{tag}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.generateButton}
          onPress={() => navigation.navigate('AddRoute', { preSelectedCity: city.name })}
        >
          <Text style={styles.generateButtonText}>{t('generate_route_for_city')}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerImage: { width: '100%', height: 250 },
  content: { padding: 25, marginTop: -30, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  cityName: { fontSize: 32, fontWeight: 'bold', color: '#2C3E50' },
  cityRegion: { fontSize: 16, color: '#3498DB', fontWeight: '600' },
  favoriteButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FDF2F2', justifyContent: 'center', alignItems: 'center' },
  favoriteIcon: { fontSize: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50', marginTop: 30, marginBottom: 12 },
  description: { fontSize: 15, color: '#7F8C8D', lineHeight: 24, marginBottom: 10 },
  
  // Gezilecek Yerler (Sightseeing) Styles
  placeCard: { flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#EAECEE', alignItems: 'center' },
  placeBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBF5FB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  placeIconText: { fontSize: 22 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 17, fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 },
  placeDesc: { fontSize: 13, color: '#7F8C8D', lineHeight: 18 },

  // Food Card Styles
  foodListScroll: { marginTop: 5, paddingBottom: 5 },
  foodCard: { backgroundColor: '#FEF9E7', padding: 18, borderRadius: 15, marginRight: 12, width: 220, borderWidth: 1, borderColor: '#FADBD8' },
  foodName: { fontSize: 16, fontWeight: 'bold', color: '#78281F', marginBottom: 6 },
  foodDesc: { fontSize: 12, color: '#7B7D7D', lineHeight: 16 },

  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  tag: { backgroundColor: '#F5F7FA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  tagText: { color: '#7F8C8D', fontSize: 13 },
  popularPlacesScroll: { marginTop: 5, marginBottom: 15 },
  popularPlaceCard: { width: 200, height: 130, borderRadius: 15, overflow: 'hidden', marginRight: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  popularPlaceImage: { width: '100%', height: '100%' },
  popularPlaceOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.45)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  popularPlaceName: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 5 },
  popularPlaceRating: { color: '#F1C40F', fontWeight: 'bold', fontSize: 13 },
  generateButton: { backgroundColor: '#3498DB', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 40, shadowColor: '#3498DB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  generateButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 }
});
