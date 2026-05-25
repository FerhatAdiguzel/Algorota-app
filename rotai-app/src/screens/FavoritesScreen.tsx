import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { storageService } from '../services/storage';
import { useIsFocused } from '@react-navigation/native';

export default function FavoritesScreen({ navigation }: any) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadFavorites();
    }
  }, [isFocused]);

  const loadFavorites = async () => {
    const data = await storageService.getFavorites();
    setFavorites(data);
  };

  const renderFavoriteCard = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('CityDetail', { cityId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.region}>{item.region}</Text>
      </View>
      <Text style={styles.heart}>❤️</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorilerim</Text>
        <Text style={styles.subtitle}>Beğendiğin şehirler burada toplanır.</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>Henüz favori şehrin yok.</Text>
        </View>
      ) : (
        <FlatList 
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteCard}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#FFFFFF' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
  subtitle: { fontSize: 14, color: '#7F8C8D', marginTop: 5 },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 15, marginBottom: 15, padding: 12, alignItems: 'center', elevation: 2 },
  image: { width: 70, height: 70, borderRadius: 10 },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  region: { fontSize: 13, color: '#3498DB' },
  heart: { fontSize: 20, marginRight: 5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 60, marginBottom: 15, color: '#BDC3C7' },
  emptyText: { fontSize: 16, color: '#7F8C8D' }
});
