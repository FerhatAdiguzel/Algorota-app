import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';

const INTERESTS = [
  { id: 'tarih', name: 'Tarih', icon: '🏛️' },
  { id: 'doğa', name: 'Doğa', icon: '🌲' },
  { id: 'gastronomi', name: 'Gastronomi', icon: '🍲' },
  { id: 'eğlence', name: 'Eğlence', icon: '🎡' },
  { id: 'kültür', name: 'Kültür', icon: '🎭' },
  { id: 'alışveriş', name: 'Alışveriş', icon: '🛍️' },
  { id: 'macera', name: 'Macera', icon: '🏔️' },
  { id: 'deniz', name: 'Deniz & Plaj', icon: '🏖️' },
];

export default function InterestsScreen({ navigation }: any) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleContinue = () => {
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nelerden Hoşlanırsın?</Text>
      <Text style={styles.subtitle}>Sana en uygun rotaları oluşturabilmemiz için ilgi alanlarını seç.</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {INTERESTS.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={[
              styles.card, 
              selectedInterests.includes(item.id) && styles.cardSelected
            ]}
            onPress={() => toggleInterest(item.id)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[
              styles.name,
              selectedInterests.includes(item.id) && styles.nameSelected
            ]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Devam Et</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.replace('Home')}>
          <Text style={styles.skipText}>Şimdilik Atla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 25, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#7F8C8D', marginBottom: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '47%', 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 15, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3
  },
  cardSelected: { borderColor: '#3498DB', backgroundColor: '#EBF5FB' },
  icon: { fontSize: 30, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '600', color: '#34495E' },
  nameSelected: { color: '#3498DB' },
  footer: { marginTop: 20 },
  button: { backgroundColor: '#3498DB', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  skipButton: { marginTop: 15, alignItems: 'center' },
  skipText: { color: '#7F8C8D', fontSize: 16, fontWeight: '500' }
});
