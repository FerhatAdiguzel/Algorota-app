import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { storageService } from '../services/storage';

export default function EditRouteScreen({ route, navigation }: any) {
  const { route_plan, city, routeId } = route.params;
  const [editablePlan, setEditablePlan] = useState([...route_plan]);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Sil",
      "Bu durağı rotadan kaldırmak istediğine emin misin?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive", 
          onPress: () => setEditablePlan(editablePlan.filter(item => item.id !== id)) 
        }
      ]
    );
  };

  // REQ.UI.17 - Save modified route plan in Storage
  const handleSave = async () => {
    if (routeId) {
      const routes = await storageService.getRoutes();
      const existing = routes.find((r: any) => r.id === routeId);
      if (existing) {
        const updatedRoute = {
          ...existing,
          route_plan: editablePlan
        };
        const success = await storageService.updateRoute(updatedRoute);
        if (success) {
          Alert.alert("Başarılı", "Rota değişiklikleri kaydedildi.", [
            { text: "Tamam", onPress: () => navigation.goBack() }
          ]);
        } else {
          Alert.alert("Hata", "Değişiklikler kaydedilemedi.");
        }
      } else {
        Alert.alert("Hata", "Güncellenecek rota bulunamadı.");
      }
    } else {
      Alert.alert("Bilgi", "Bu rota henüz kaydedilmemiş. Lütfen önce rotayı detay sayfasından kaydedin.", [
        { text: "Tamam", onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{city} Rotasını Düzenle</Text>
        <Text style={styles.subtitle}>Durakları silebilir veya yerlerini değiştirebilirsin.</Text>
      </View>

      <FlatList 
        data={editablePlan}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.editCard}>
            <View style={styles.dragHandle}>
              <Text style={styles.dragIcon}>☰</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.time}>{item.day} - {item.time}</Text>
              <Text style={styles.place}>{item.title}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50' },
  subtitle: { fontSize: 14, color: '#7F8C8D', marginTop: 5 },
  editCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 2 },
  dragHandle: { paddingRight: 15 },
  dragIcon: { fontSize: 20, color: '#BDC3C7' },
  info: { flex: 1 },
  time: { fontSize: 12, fontWeight: 'bold', color: '#3498DB' },
  place: { fontSize: 16, color: '#2C3E50', fontWeight: '600' },
  deleteBtn: { padding: 10 },
  deleteIcon: { fontSize: 18 },
  saveButton: { backgroundColor: '#2ECC71', margin: 20, padding: 18, borderRadius: 15, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }
});
