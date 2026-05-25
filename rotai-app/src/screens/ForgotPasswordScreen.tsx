import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { apiService } from '../services/api';
import { useTranslation } from '../services/i18n';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert(t('error_title'), t('fill_all'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t('error_title'), t('invalid_email'));
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.forgotPassword(email.trim());
      if (result.status === 'success') {
        Alert.alert(t('success_title'), t('reset_success_msg'), [
          { text: t('back_to_login'), onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert(t('error_title'), result.detail || t('server_error'));
      }
    } catch (error: any) {
      Alert.alert(t('error_title'), t('server_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('forgot_password')}</Text>
      <Text style={styles.subtitle}>{t('forgot_subtitle')}</Text>

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

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '...' : t('reset_request_btn')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>{t('back_to_login')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 25, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#7F8C8D', marginBottom: 30 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#34495E', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E0E6ED', fontSize: 16 },
  button: { backgroundColor: '#3498DB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  disabledButton: { backgroundColor: '#BDC3C7' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#3498DB', fontWeight: '600' }
});
