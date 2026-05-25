import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

interface Props {
  visible: boolean;
  onRetry: () => void;
}

export default function NetworkError({ visible, onRetry }: Props) {
  return (
    <Modal visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>📶</Text>
          <Text style={styles.title}>Bağlantı Hatası</Text>
          <Text style={styles.subtitle}>İnternet bağlantınızı kontrol edin. Çevrimdışı modda sadece kayıtlı rotalarınıza erişebilirsiniz.</Text>
          
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center', padding: 30 },
  content: { alignItems: 'center' },
  icon: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  retryButton: { backgroundColor: '#3498DB', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 12 },
  retryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }
});
