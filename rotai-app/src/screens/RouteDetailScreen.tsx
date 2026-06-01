import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const CATEGORY_ICONS: any = {
  tarih: '🏛️',
  doğa: '🌲',
  gastronomi: '🍲',
  eğlence: '🎡',
  kültür: '🎭',
  alışveriş: '🛍️'
};

export default function RouteDetailScreen({ route, navigation }: any) {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const { city, days, interests, budget, pace, isSaved, id } = route.params || {};
  
  const [routeData, setRouteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJustSaved, setIsJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSaved && route.params?.route_plan) {
      setRouteData(route.params.route_plan);
      setLoading(false);
    } else {
      generateRoute();
    }
  }, [city, days]);

  // Reload saved route if edited
  useEffect(() => {
    if (isFocused && isSaved && id) {
      reloadSavedRoute();
    }
  }, [isFocused]);

  const reloadSavedRoute = async () => {
    const routes = await storageService.getRoutes();
    const current = routes.find((r: any) => r.id === id);
    if (current && current.route_plan) {
      setRouteData(current.route_plan);
    }
  };

  const generateRoute = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.generateRoute({
        city,
        days,
        interests,
        budget,
        pace
      });

      if (data.status === 'success' && Array.isArray(data.route_plan) && data.route_plan.length > 0) {
        const enrichedPlan = data.route_plan.map((item: any, idx: number) => ({
          ...item,
          id: item.id ? String(item.id) : `step-${idx}-${Date.now()}`
        }));
        setRouteData(enrichedPlan); 
      } else {
        setError(data.message || "Yapay zeka boş rota üretti. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucuya ulaşılamadı. Backend çalışıyor mu kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = async () => {
    if (isJustSaved) return;

    const routeToSave = {
      id: Date.now().toString(),
      city,
      days,
      interests,
      route_plan: routeData,
      created_at: new Date().toISOString()
    };

    const success = await storageService.saveRoute(routeToSave);
    if (success) {
      await storageService.setActiveRoute(routeToSave); // Kaydedilen rotayı aktif yap
      setIsJustSaved(true);
      Alert.alert("Başarılı", "Rotan başarıyla kaydedildi ve aktif rota olarak ayarlandı!");
    } else {
      Alert.alert("Hata", "Rota kaydedilirken bir sorun oluştu.");
    }
  };

  // REQ.UI.17 - Navigate to Edit Screen
  const handleEditRoute = () => {
    navigation.navigate('EditRoute', {
      route_plan: routeData,
      city: city,
      routeId: id
    });
  };

  const renderRouteItem = ({ item }: any) => (
    <View style={[styles.routeCard, { backgroundColor: colors.card }]}>
      <View style={[styles.timeContainer, { borderRightColor: colors.border }]}>
        <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item.category] || '📍'}</Text>
        <Text style={[styles.timeText, { color: colors.text }]}>{item.time}</Text>
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.dayBadge}>{item.day}</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
        {item.tips && (
          <View style={[styles.tipsContainer, { backgroundColor: colors.background, borderLeftColor: colors.primary }]}>
            <Text style={[styles.tipsText, { color: colors.textSecondary }]}>💡 {item.tips}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={[styles.loadingText, { color: colors.text }]}>YZ Mutfağında Rotan Pişiyor...</Text>
        <Text style={styles.loadingSubtext}>Bu işlem yaklaşık 10 saniye sürebilir.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 50, marginBottom: 20 }}>⚠️</Text>
        <Text style={[styles.loadingText, { color: colors.text }]}>Rota Oluşturulamadı</Text>
        <Text style={[styles.loadingSubtext, { marginBottom: 25, paddingHorizontal: 30, textAlign: 'center' }]}>{error}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#3498DB', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 }}
          onPress={generateRoute}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Tekrar Dene</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ marginTop: 12, paddingVertical: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#7F8C8D', fontSize: 14 }}>← Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.title, { color: colors.text }]}>🗺️ {city} Rotan Hazır!</Text>
            <Text style={styles.subtitle}>{days} günlük plan.</Text>
          </View>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => navigation.navigate('Map', { route_plan: routeData, city })}
          >
            <Text style={styles.mapButtonText}>📍 Harita</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList 
        data={routeData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderRouteItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      />

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {isSaved ? (
          <>
            <TouchableOpacity style={styles.saveButton} onPress={handleEditRoute}>
              <Text style={styles.saveButtonText}>Rotayı Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.background }]} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Geri</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.saveButton, isJustSaved && { backgroundColor: '#2ECC71' }]} 
              onPress={handleSaveRoute}
              disabled={isJustSaved}
            >
              <Text style={styles.saveButtonText}>{isJustSaved ? "Rota Kaydedildi" : "Rotayı Kaydet"}</Text>
            </TouchableOpacity>
            {isJustSaved ? (
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home', { screen: 'MyRoutes' })}>
                <Text style={[styles.backButtonText, { color: '#3498DB' }]}>Rotalarım ➔</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Düzenle</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  loadingText: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  loadingSubtext: { marginTop: 8, fontSize: 14, color: '#7F8C8D' },
  header: { padding: 15, paddingTop: 15, backgroundColor: '#FFFFFF', borderBottomLeftRadius: 15, borderBottomRightRadius: 15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mapButton: { backgroundColor: '#EBF5FB', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#3498DB' },
  mapButtonText: { color: '#3498DB', fontWeight: 'bold', fontSize: 14 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50' },
  subtitle: { fontSize: 14, color: '#7F8C8D', marginTop: 5 },
  routeCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 15, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5 },
  timeContainer: { width: '22%', borderRightWidth: 1, borderRightColor: '#F0F3F4', justifyContent: 'center', alignItems: 'center', paddingRight: 10 },
  categoryIcon: { fontSize: 24, marginBottom: 5 },
  timeText: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
  durationText: { fontSize: 11, color: '#95A5A6', marginTop: 2 },
  infoContainer: { flex: 1, paddingLeft: 15 },
  cardHeader: { flexDirection: 'column', marginBottom: 5 },
  dayBadge: { fontSize: 10, fontWeight: 'bold', color: '#3498DB', marginBottom: 2, textTransform: 'uppercase' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#2C3E50' },
  cardDesc: { fontSize: 13, color: '#7F8C8D', lineHeight: 18 },
  tipsContainer: { marginTop: 10, backgroundColor: '#FEF9E7', padding: 8, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#F1C40F' },
  tipsText: { fontSize: 12, color: '#9A7D0A', fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FFFFFF', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F3F4' },
  saveButton: { flex: 2, backgroundColor: '#3498DB', padding: 15, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  backButton: { flex: 1, backgroundColor: '#F0F3F4', padding: 15, borderRadius: 12, alignItems: 'center' },
  backButtonText: { color: '#7F8C8D', fontWeight: 'bold', fontSize: 16 }
});