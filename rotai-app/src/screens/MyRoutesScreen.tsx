import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, Platform } from 'react-native';
import { storageService } from '../services/storage';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../services/i18n';

export default function MyRoutesScreen({ navigation }: any) {
  const [myRoutes, setMyRoutes] = useState<any[]>([]);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isFocused = useIsFocused(); // Sayfa her odaklandığında yenile

  useEffect(() => {
    if (isFocused) {
      loadRoutes();
    }
  }, [isFocused]);

  const loadRoutes = async () => {
    const routes = await storageService.getRoutes();
    setMyRoutes(routes);
  };

  const handleDeleteRoute = (id: string) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm("Bu rotayı silmek istediğinize emin misiniz?");
      if (confirmDelete) {
        storageService.removeRoute(id).then(() => loadRoutes());
      }
    } else {
      Alert.alert(
        "Rotayı Sil",
        "Bu rotayı silmek istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          { 
            text: "Sil", 
            style: "destructive",
            onPress: async () => {
              await storageService.removeRoute(id);
              loadRoutes();
            }
          }
        ]
      );
    }
  };

  const renderRouteCard = ({ item }: any) => (
    <TouchableOpacity 
      style={[styles.routeCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('RouteDetail', { ...item, isSaved: true })}
    >
      <View style={styles.routeHeader}>
        <Text style={[styles.routeCity, { color: colors.text }]}>{item.city}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.routeDate}>{new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
          <TouchableOpacity onPress={() => handleDeleteRoute(item.id)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>{t('delete')} 🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.routeInfo, { borderTopColor: colors.border }]}>
        <Text style={styles.routeDays}>{item.days} {t('day_route')}</Text>
        <View style={styles.interestsRow}>
          {item.interests?.map((int: string) => (
            <Text key={int} style={styles.interestMiniTag}>#{int}</Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🗺️</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('no_route_yet')}</Text>
      <Text style={styles.emptySubtitle}>{t('no_route_desc')}</Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('AddRoute')}
      >
        <Text style={styles.createButtonText}>{t('create_new_route')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('my_routes')}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddRoute')}
        >
          <Text style={styles.addButtonText}>+ Rota Ekle</Text>
        </TouchableOpacity>
      </View>

      {myRoutes.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList 
          data={myRoutes}
          keyExtractor={(item) => item.id}
          renderItem={renderRouteCard}
          contentContainerStyle={{ padding: 25 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 25, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
  addButton: { backgroundColor: '#3498DB', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  emptySubtitle: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', marginBottom: 30 },
  createButton: { backgroundColor: '#3498DB', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  createButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  routeCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  routeCity: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  routeDate: { fontSize: 12, color: '#95A5A6' },
  routeInfo: { borderTopWidth: 1, borderTopColor: '#F0F3F4', paddingTop: 10 },
  routeDays: { fontSize: 15, color: '#3498DB', fontWeight: '600' },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  interestMiniTag: { fontSize: 12, color: '#7F8C8D', marginRight: 10, marginTop: 2 },
  deleteButton: { backgroundColor: '#FFEBEB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginLeft: 12, borderWidth: 1, borderColor: '#FFCACA', flexDirection: 'row', alignItems: 'center' },
  deleteButtonText: { fontSize: 12, fontWeight: 'bold', color: '#E74C3C' }
});
