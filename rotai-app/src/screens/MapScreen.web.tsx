import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function MapScreen({ route, navigation }: any) {
  const { city } = route?.params || { city: 'Şehir' };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{city} Gezi Haritası</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.infoText}>
          Harita görünümü şu anda web sürümünde desteklenmemektedir. Lütfen haritayı görüntülemek için mobil uygulamayı (iOS/Android) kullanın.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  header: { 
    position: 'absolute', top: 20, left: 20, right: 20, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    padding: 15, borderRadius: 15, 
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5 
  },
  backButton: { marginRight: 15 },
  backText: { fontSize: 16, color: '#3498DB', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  infoText: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', lineHeight: 24 }
});
