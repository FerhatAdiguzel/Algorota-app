import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { useIsFocused } from '@react-navigation/native';

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
  const { city, days, interests, budget, pace, isSaved, id } = route.params || {};
  
  const [routeData, setRouteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      const data = await apiService.generateRoute({
        city,
        days,
        interests,
        budget,
        pace
      });

      if (data.status === 'success') {
        const enrichedPlan = data.route_plan.map((item: any, idx: number) => ({
          ...item,
          id: item.id ? String(item.id) : `step-${idx}-${Date.now()}`
        }));
        setRouteData(enrichedPlan); 
      } else {
        Alert.alert("Hata", data.message || "Rota oluşturulamadı.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamadı. Lütfen internetinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = async () => {
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
      Alert.alert("Başarılı", "Rotan başarıyla kaydedildi ve aktif rota olarak ayarlandı!", [
        { text: "Tamam", onPress: () => navigation.navigate('MyRoutes') }
      ]);
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
    <View style={styles.routeCard}>
      <View style={styles.timeContainer}>
        <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item.category] || '📍'}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.dayBadge}>{item.day}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
        <Text style={styles.cardDesc}>{item.desc}</Text>
        {item.tips && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsText}>💡 {item.tips}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>YZ Mutfağında Rotan Pişiyor...</Text>
        <Text style={styles.loadingSubtext}>Bu işlem yaklaşık 10 saniye sürebilir.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.title}>🗺️ {city} Rotan Hazır!</Text>
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

      <View style={styles.footer}>
        {isSaved ? (
          <>
            <TouchableOpacity style={styles.saveButton} onPress={handleEditRoute}>
              <Text style={styles.saveButtonText}>Rotayı Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Geri</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveRoute}>
              <Text style={styles.saveButtonText}>Rotayı Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Düzenle</Text>
            </TouchableOpacity>
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
  header: { padding: 25, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
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