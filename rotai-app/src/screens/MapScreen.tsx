import React from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapScreen({ route, navigation }: any) {
  const { route_plan, city } = route.params;

  // Harita için merkez noktası (ilk durağın koordinatları)
  const initialRegion = {
    latitude: route_plan[0]?.lat || 39.9334,
    longitude: route_plan[0]?.lng || 32.8597,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Çizgi için koordinat listesi
  const polylineCoords = route_plan.map((item: any) => ({
    latitude: item.lat,
    longitude: item.lng
  }));

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {route_plan.map((marker: any, index: number) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            title={marker.title}
            description={`${marker.day} - ${marker.time}`}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        <Polyline
          coordinates={polylineCoords}
          strokeColor="#3498DB"
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />
      </MapView>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{city} Gezi Haritası</Text>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.infoText}>Durakları görmek için işaretçilere dokun.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  header: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5 },
  backButton: { marginRight: 15 },
  backText: { fontSize: 16, color: '#3498DB', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  markerContainer: { backgroundColor: '#3498DB', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  markerText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  cardContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 15, alignItems: 'center', elevation: 5 },
  infoText: { fontSize: 14, color: '#7F8C8D', fontWeight: '500' }
});
