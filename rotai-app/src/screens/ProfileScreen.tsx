import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput, Alert, ActivityIndicator } from 'react-native';
import { storageService } from '../services/storage';
import { apiService } from '../services/api';
import { useTranslation } from '../services/i18n';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen({ navigation }: any) {
  const { t, lang, changeLang } = useTranslation();
  const { isDark, toggleTheme, colors } = useTheme();
  const isFocused = useIsFocused();

  const [profile, setProfile] = useState({ name: '', email: '' });
  
  // Settings preferences
  const [notifPref, setNotifPref] = useState(false);

  // Feedback form states (REQ.F.18)
  const [feedbackType, setFeedbackType] = useState('uygulama');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadProfile();
      loadPreferences();
    }
  }, [isFocused]);

  const loadProfile = async () => {
    const data = await storageService.getUserProfile();
    setProfile(data);
  };

  const loadPreferences = async () => {
    const notif = await storageService.getNotificationPreference();
    setNotifPref(notif);
  };

  const handleToggleNotif = async (value: boolean) => {
    setNotifPref(value);
    await storageService.saveNotificationPreference(value);
  };

  const handleToggleDarkMode = (value: boolean) => {
    toggleTheme(value);
  };

  // REQ.NF.07 - Fast Language Switch
  const handleToggleLanguage = () => {
    const nextLang = lang === 'tr' ? 'en' : 'tr';
    changeLang(nextLang);
  };

  // REQ.F.18 - Submit Feedback to Backend
  const handleSendFeedback = async () => {
    if (!feedbackContent.trim()) {
      Alert.alert(t('error_title'), t('fill_all'));
      return;
    }
    setFeedbackLoading(true);
    try {
      const res = await apiService.submitFeedback({
        email: profile.email || 'anonymous@algorota.com',
        feedback_type: feedbackType,
        content: feedbackContent.trim()
      });
      if (res.status === 'success') {
        Alert.alert(t('success_title'), t('feedback_success'));
        setFeedbackContent('');
      } else {
        Alert.alert(t('error_title'), res.detail || t('server_error'));
      }
    } catch (e) {
      Alert.alert(t('error_title'), t('server_error'));
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{profile.name ? profile.name[0] : 'G'}</Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{profile.name || 'Gezgin'}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{profile.email}</Text>
        
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editProfileText}>{t('edit_profile')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings')}</Text>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('Favorites')}>
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('favorites')}</Text>
          <Text style={styles.menuValue}>⭐</Text>
        </TouchableOpacity>

        {/* REQ.UI.20 - Persisted Notifications Preference */}
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('notifications')}</Text>
          <Switch 
            value={notifPref} 
            onValueChange={handleToggleNotif}
            trackColor={{ false: "#D1D1D1", true: "#3498DB" }} 
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('dark_mode')}</Text>
          <Switch 
            value={isDark} 
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: "#D1D1D1", true: "#3498DB" }} 
          />
        </View>

        {/* REQ.NF.07 - Language Switch */}
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={handleToggleLanguage}>
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('language_selection')}</Text>
          <Text style={styles.menuValue}>{lang === 'tr' ? 'Türkçe 🇹🇷' : 'English 🇬🇧'}</Text>
        </TouchableOpacity>
      </View>

      {/* REQ.F.18 - Geri Bildirim Gönder Bölümü */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('feedback_section')}</Text>
        <View style={[styles.feedbackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.feedbackLabel, { color: colors.textSecondary }]}>{t('feedback_type_label')}</Text>
          <View style={styles.typeSelectorRow}>
            <TouchableOpacity 
              style={[styles.typeBtn, feedbackType === 'uygulama' && styles.typeBtnActive]}
              onPress={() => setFeedbackType('uygulama')}
            >
              <Text style={[styles.typeBtnText, feedbackType === 'uygulama' && styles.typeBtnTextActive]}>
                {t('feedback_type_app')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, feedbackType === 'rota' && styles.typeBtnActive]}
              onPress={() => setFeedbackType('rota')}
            >
              <Text style={[styles.typeBtnText, feedbackType === 'rota' && styles.typeBtnTextActive]}>
                {t('feedback_type_route')}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.feedbackInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder={t('feedback_placeholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={feedbackContent}
            onChangeText={setFeedbackContent}
          />

          <TouchableOpacity 
            style={[styles.feedbackSendBtn, feedbackLoading && styles.disabledBtn]} 
            onPress={handleSendFeedback}
            disabled={feedbackLoading}
          >
            {feedbackLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.feedbackSendBtnText}>{t('feedback_btn')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('email_label')}</Text>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t('change_password')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={() => navigation.replace('Login')}>
          <Text style={[styles.menuLabel, { color: '#E74C3C' }]}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>AlgoRota v1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 40, paddingTop: 80, alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3498DB', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50' },
  userEmail: { fontSize: 16, color: '#7F8C8D', marginTop: 5 },
  editProfileButton: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#3498DB' },
  editProfileText: { color: '#3498DB', fontWeight: '600' },
  section: { marginTop: 25, paddingHorizontal: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 15 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 10 },
  settingLabel: { fontSize: 16, color: '#34495E' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 10 },
  menuLabel: { fontSize: 16, color: '#34495E' },
  menuValue: { fontSize: 14, color: '#7F8C8D' },
  
  // Feedback Form Styles
  feedbackCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E0E6ED' },
  feedbackLabel: { fontSize: 13, color: '#7F8C8D', fontWeight: '600', marginBottom: 8 },
  typeSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#F2F4F4', borderRadius: 8, marginHorizontal: 4 },
  typeBtnActive: { backgroundColor: '#3498DB' },
  typeBtnText: { fontSize: 12, color: '#7F8C8D', fontWeight: 'bold' },
  typeBtnTextActive: { color: '#FFFFFF' },
  feedbackInput: { backgroundColor: '#F8F9F9', borderWidth: 1, borderColor: '#EAECEE', borderRadius: 10, padding: 12, fontSize: 14, textAlignVertical: 'top', height: 100, marginBottom: 15 },
  feedbackSendBtn: { backgroundColor: '#2ECC71', padding: 14, borderRadius: 10, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#BDC3C7' },
  feedbackSendBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  version: { textAlign: 'center', color: '#BDC3C7', marginVertical: 30 }
});
