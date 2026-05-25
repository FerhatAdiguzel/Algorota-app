import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { useTranslation } from '../services/i18n';

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error_title'), t('fill_all'));
      return;
    }

    // REQ.UI.01 - Robust Regex Email Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t('error_title'), t('invalid_email'));
      return;
    }

    try {
      const result = await apiService.login({ email: email.trim(), password });
      if (result.status === 'success') {
        await storageService.saveUserProfile(result.user);
        navigation.replace('Home');
      } else {
        Alert.alert(t('error_title'), result.detail || t('login_failed'));
      }
    } catch (error) {
      Alert.alert(t('error_title'), t('server_error'));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>AlgoRota</Text>
        <Text style={styles.subtitle}>{t('login_subtitle')}</Text>

        <TextInput 
          style={styles.input} 
          placeholder={t('email_placeholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput 
          style={styles.input} 
          placeholder={t('password_placeholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true} 
        />

        <TouchableOpacity 
          style={styles.forgotButton}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotText}>{t('forgot_password')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>{t('login')}</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.noAccountText}>{t('no_account')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>{t('register')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 },
  title: { fontSize: 40, fontWeight: 'bold', color: '#3498DB', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', marginBottom: 40 },
  input: { width: '100%', backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E0E6ED', fontSize: 16 },
  forgotButton: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { color: '#3498DB', fontWeight: '600' },
  button: { width: '100%', backgroundColor: '#3498DB', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#3498DB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  registerContainer: { flexDirection: 'row', marginTop: 30 },
  noAccountText: { color: '#7F8C8D', fontSize: 15 },
  registerText: { color: '#3498DB', fontWeight: 'bold', fontSize: 15 }
});