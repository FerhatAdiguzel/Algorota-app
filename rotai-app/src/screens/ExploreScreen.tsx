import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { useTranslation } from '../services/i18n';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function ExploreScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const [popularCities, setPopularCities] = useState<any[]>([]);
  const [popularPlaces, setPopularPlaces] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // REQ.UI.12 - Active Route State
  const [activeRoute, setActiveRoute] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadActiveRoute();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      const data = await apiService.getPopular();
      if (data.status === 'success') {
        setPopularCities(data.popular_cities);
        setPopularPlaces(data.popular_places);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveRoute = async () => {
    const route = await storageService.getActiveRoute();
    setActiveRoute(route);
  };

  const getCityImage = (cityName: string) => {
    const lowerName = cityName.toLowerCase();
    if (lowerName.includes("ist")) return "https://images.unsplash.com/photo-1493087670264-2f7f5844b402?w=600";
    if (lowerName.includes("ank")) return "https://upload.wikimedia.org/wikipedia/commons/8/86/Ankara_Castle.jpg";
    if (lowerName.includes("izm")) return "https://upload.wikimedia.org/wikipedia/commons/7/79/Saat_Kulesi_Konak_2012.jpg";
    if (lowerName.includes("kap") || lowerName.includes("cap")) return "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=600";
    if (lowerName.includes("ant")) return "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600";
    return "https://images.unsplash.com/photo-1493087670264-2f7f5844b402?w=600";
  };

  // Real-time local search filters
  const filteredCities = popularCities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.region.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPlaces = popularPlaces.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  const hasResults = filteredCities.length > 0 || filteredPlaces.length > 0;

  const getCityIcon = (cityName: string) => {
    const lower = cityName.toLowerCase();
    if (lower.includes("ist")) return "🌉";
    if (lower.includes("ank")) return "🏛️";
    if (lower.includes("izm")) return "🌴";
    if (lower.includes("kap") || lower.includes("cap")) return "🎈";
    if (lower.includes("ant")) return "🏖️";
    return "🏙️";
  };

  const renderCityCard = ({ item }: any) => (
    <TouchableOpacity 
      style={[styles.cityCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('CityDetail', { cityId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.cityImage} />
      <View style={styles.cityInfo}>
        <Text style={[styles.cityName, { color: colors.text }]}>{getCityIcon(item.name)} {item.name}</Text>
        <Text style={styles.cityRegion}>{item.region}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPlaceCard = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.placeCard}
      onPress={() => navigation.navigate('CityDetail', { cityId: item.city.toLowerCase() === 'istanbul' ? 'istanbul' : 'cappadocia' })}
    >
      <Image source={{ uri: item.image }} style={styles.placeImage} />
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeCity}>{item.city}</Text>
        <Text style={styles.placeRating}>⭐ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  // REQ.UI.12 & REQ.UI.13 - Dynamic Active Route Widget
  const ActiveRouteWidget = () => {
    if (activeRoute && activeRoute.route_plan && activeRoute.route_plan.length > 0) {
      const nextStep = activeRoute.route_plan[0]; 
      const cityImage = getCityImage(activeRoute.city);

      return (
        <View style={styles.widgetContainer}>
          <Text style={[styles.widgetTitle, { color: colors.text }]}>{t('widget_next_stop')}</Text>
          <TouchableOpacity 
            style={[styles.widgetCard, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('RouteDetail', { ...activeRoute, isSaved: true })}
          >
            <Image source={{ uri: cityImage }} style={styles.widgetImage} />
            <View style={styles.widgetOverlay}>
              <Text style={styles.widgetDay}>{activeRoute.city} - {nextStep.day} {nextStep.time}</Text>
              <Text style={styles.widgetPlace}>{nextStep.title}</Text>
              <Text style={styles.widgetStepDesc} numberOfLines={1}>{nextStep.desc}</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    // Default Carousel for Inspiration
    return (
      <View style={styles.widgetContainer}>
        <Text style={[styles.widgetTitle, { color: colors.text }]}>{t('widget_inspiration')}</Text>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {popularPlaces.slice(0, 3).map((place, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.widgetPlaceholderCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('CityDetail', { cityId: place.city.toLowerCase() === 'istanbul' ? 'istanbul' : 'cappadocia' })}
            >
              <Image source={{ uri: place.image }} style={styles.widgetImage} />
              <View style={styles.widgetOverlay}>
                <Text style={styles.widgetDay}>{t('widget_popular')}</Text>
                <Text style={styles.widgetPlace}>{place.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('explore')}</Text>
        <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
      </View>

      <ActiveRouteWidget />

      <View style={styles.searchContainer}>
        <TextInput 
          style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} 
          placeholder={t('search_placeholder')} 
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* REQ.UI.14 - Sonuç bulunamadı message */}
      {!hasResults && search.length > 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsIcon}>🔍</Text>
          <Text style={styles.noResultsText}>{t('no_results')}</Text>
        </View>
      ) : (
        <>
          {filteredCities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('popular_cities')}</Text>
              </View>
              <FlatList 
                data={filteredCities}
                renderItem={renderCityCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Popüler mekanlar artık Şehir detay sayfasında gösterilecek */}
        </>
      )}
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 25, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2C3E50' },
  subtitle: { fontSize: 16, color: '#7F8C8D', marginTop: 5 },
  widgetContainer: { paddingHorizontal: 25, marginBottom: 30 },
  widgetTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50', marginBottom: 15 },
  widgetCard: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  widgetPlaceholderCard: { width: 340, height: 200, borderRadius: 20, overflow: 'hidden', marginRight: 15 },
  widgetImage: { width: '100%', height: '100%' },
  widgetOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.45)' },
  widgetDay: { color: '#3498DB', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  widgetPlace: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  widgetStepDesc: { color: '#E5E7EB', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  searchContainer: { paddingHorizontal: 25, marginBottom: 25 },
  searchInput: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E0E6ED', fontSize: 16 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  horizontalList: { paddingLeft: 25, paddingRight: 10 },
  cityCard: { width: 200, marginRight: 15, backgroundColor: '#FFFFFF', borderRadius: 15, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  cityImage: { width: '100%', height: 120 },
  cityInfo: { padding: 12 },
  cityName: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  cityRegion: { fontSize: 14, color: '#7F8C8D', marginTop: 2 },
  placeCard: { width: 160, marginRight: 15, backgroundColor: '#FFFFFF', borderRadius: 15, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  placeImage: { width: '100%', height: 100 },
  placeInfo: { padding: 10 },
  placeName: { fontSize: 15, fontWeight: 'bold', color: '#2C3E50' },
  placeCity: { fontSize: 12, color: '#7F8C8D' },
  placeRating: { fontSize: 12, fontWeight: 'bold', color: '#F1C40F', marginTop: 5 },
  
  // REQ.UI.14 - Sonuç bulunamadı
  noResultsContainer: { padding: 50, alignItems: 'center', justifyContent: 'center' },
  noResultsIcon: { fontSize: 50, marginBottom: 15 },
  noResultsText: { fontSize: 16, color: '#95A5A6', fontWeight: 'bold' }
});
