import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { useTranslation } from '../services/i18n';

export default function RegisterScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('error_title'), t('fill_all'));
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t('error_title'), t('invalid_email'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('error_title'), t('password_mismatch'));
      return;
    }
    
    try {
      const result = await apiService.register({ email: email.trim(), password, name: "Gezgin" });
      if (result.status === 'success') {
        // Save the notification permission choice
        await storageService.saveNotificationPreference(notificationsEnabled);
        
        Alert.alert(t('success_title'), t('register_success'));
        navigation.navigate('Interests');
      } else {
        Alert.alert(t('error_title'), result.detail || t('server_error'));
      }
    } catch (error) {
      Alert.alert(t('error_title'), t('server_error'));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('register')}</Text>
      <Text style={styles.subtitle}>{t('register_subtitle')}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>{t('email_label')}</Text>
        <TextInput 
          style={styles.input} 
          placeholder={t('email_placeholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>{t('password_label')}</Text>
        <TextInput 
          style={styles.input} 
          placeholder="******"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>{t('confirm_password_label')}</Text>
        <TextInput 
          style={styles.input} 
          placeholder="******"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* REQ.UI.02 - Custom Checkbox Component */}
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, notificationsEnabled && styles.checkboxChecked]}>
            {notificationsEnabled && <Text style={styles.checkboxIcon}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>{t('notifications_checkbox')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>{t('register')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>{t('already_account')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F5F7FA', padding: 25, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#7F8C8D', marginBottom: 30 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#34495E', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E0E6ED', fontSize: 16 },
  
  // Custom Checkbox Styles
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#3498DB', justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: '#FFFFFF' },
  checkboxChecked: { backgroundColor: '#3498DB' },
  checkboxIcon: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 14, color: '#7F8C8D', lineHeight: 18 },

  button: { backgroundColor: '#3498DB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, shadowColor: '#3498DB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#3498DB', fontWeight: '600' }
});
