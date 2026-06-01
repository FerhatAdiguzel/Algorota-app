import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, createElement } from 'react-native';

const CATEGORY_ICONS: any = {
  tarih: '🏛️',
  doğa: '🌲',
  gastronomi: '🍲',
  eğlence: '🎡',
  kültür: '🎭',
  alışveriş: '🛍️'
};

export default function MapScreen({ route, navigation }: any) {
  const { city, route_plan } = route?.params || { city: 'Şehir', route_plan: [] };
  const stops = (route_plan || []).filter((s: any) => s.lat && s.lng);
  const [selectedStop, setSelectedStop] = useState<any>(null);

  // Harita URL'si: tüm durakları marker olarak göster
  const buildMapUrl = () => {
    if (stops.length === 0) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }
    // İlk durak merkez olsun
    const center = selectedStop || stops[0];
    const zoom = selectedStop ? 16 : 13;
    return `https://maps.google.com/maps?q=${center.lat},${center.lng}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <View style={styles.container}>
      {/* Harita */}
      <View style={styles.mapContainer}>
        {createElement('iframe', {
          key: selectedStop ? selectedStop.id : 'default',
          src: buildMapUrl(),
          style: { border: 0, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 },
          allowFullScreen: true,
        })}
      </View>

      {/* Üst Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{city} Gezi Haritası</Text>
        <Text style={styles.stopCount}>{stops.length} durak</Text>
      </View>

      {/* Alt kısım: Durak listesi */}
      {stops.length > 0 && (
        <View style={styles.stopsPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
            {stops.map((stop: any, idx: number) => (
              <TouchableOpacity
                key={stop.id || idx}
                style={[
                  styles.stopCard,
                  selectedStop?.id === stop.id && styles.stopCardActive
                ]}
                onPress={() => setSelectedStop(stop)}
              >
                <Text style={styles.stopIcon}>{CATEGORY_ICONS[stop.category] || '📍'}</Text>
                <Text style={styles.stopOrder}>{idx + 1}</Text>
                <Text style={styles.stopTitle} numberOfLines={2}>{stop.title}</Text>
                <Text style={styles.stopTime}>{stop.time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  mapContainer: { flex: 1, width: '100%', height: '100%' },
  header: { 
    position: 'absolute', top: 20, left: 20, right: 20, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    padding: 15, borderRadius: 15, 
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5 
  },
  backButton: { marginRight: 15 },
  backText: { fontSize: 16, color: '#3498DB', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', flex: 1 },
  stopCount: { fontSize: 13, color: '#7F8C8D', fontWeight: '600' },
  stopsPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)', 
    paddingVertical: 15, 
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.15, shadowRadius: 8
  },
  stopCard: {
    backgroundColor: '#F8F9FA', borderRadius: 14, padding: 12, marginHorizontal: 6,
    width: 120, alignItems: 'center', borderWidth: 2, borderColor: 'transparent'
  },
  stopCardActive: {
    borderColor: '#3498DB', backgroundColor: '#EBF5FB'
  },
  stopIcon: { fontSize: 24, marginBottom: 4 },
  stopOrder: { fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#3498DB', width: 20, height: 20, borderRadius: 10, textAlign: 'center', lineHeight: 20, marginBottom: 4 },
  stopTitle: { fontSize: 12, fontWeight: '600', color: '#2C3E50', textAlign: 'center', marginBottom: 2 },
  stopTime: { fontSize: 11, color: '#95A5A6' }
});
