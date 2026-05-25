import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { storageService } from '../services/storage';

export default function EditProfileScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profile = await storageService.getUserProfile();
    setName(profile.name);
    setEmail(profile.email);
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert("Hata", "Ad ve e-posta boş bırakılamaz.");
      return;
    }

    const success = await storageService.saveUserProfile({ name, email });
    if (success) {
      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi.", [
        { text: "Tamam", onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert("Hata", "Kaydedilirken bir sorun oluştu.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput 
          style={styles.input} 
          value={name}
          onChangeText={setName}
          placeholder="Adınız Soyadınız"
        />

        <Text style={styles.label}>E-posta</Text>
        <TextInput 
          style={styles.input} 
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Yeni Şifre (Opsiyonel)</Text>
        <TextInput 
          style={styles.input} 
          value={password}
          onChangeText={setPassword}
          placeholder="******"
          secureTextEntry
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  form: { padding: 25, paddingTop: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#34495E', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E0E6ED', fontSize: 16 },
  saveButton: { backgroundColor: '#3498DB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 40, shadowColor: '#3498DB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 }
});
