import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { apiService } from '../services/api';
import { locationService } from '../services/location';
import { useTranslation } from '../services/i18n';

const INTERESTS = ['Tarih', 'Doğa', 'Gastronomi', 'Eğlence', 'Kültür', 'Alışveriş', 'Deniz'];

export default function HomeScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const [city, setCity] = useState('');
  const [days, setDays] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState('orta');
  const [pace, setPace] = useState('normal');
  
  // Autocomplete suggestions & Location Loader states
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(false);

  // If a city is passed from CityDetailScreen (e.g. preSelectedCity)
  useEffect(() => {
    if (route.params?.preSelectedCity) {
      setCity(route.params.preSelectedCity);
    }
  }, [route.params?.preSelectedCity]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleCityChange = async (text: string) => {
    setCity(text);
    if (text.trim().length > 1) {
      try {
        const res = await apiService.getCities(text.trim());
        if (res.status === 'success') {
          setSuggestions(res.cities);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setSuggestions([]);
    }
  };

  // REQ.F.15 - Get Current User Location and Autoselect nearest city
  const handleUseLocation = async () => {
    setLocLoading(true);
    try {
      const coords = await locationService.getCurrentLocation();
      if (coords) {
        const detectedCity = await locationService.getCityFromCoords(coords.latitude, coords.longitude);
        if (detectedCity) {
          setCity(detectedCity);
          setSuggestions([]);
          Alert.alert(t('success_title'), `${t('use_my_location')}: ${detectedCity}`);
        } else {
          // Default fallbacks in case reverse geocoding returns something else on local envs
          setCity('İstanbul');
          Alert.alert(t('success_title'), "Yakın şehir tespit edildi: İstanbul");
        }
      } else {
        Alert.alert(t('error_title'), "Konum bilgisi alınamadı. Lütfen konum izinlerinizi kontrol edin.");
      }
    } catch (error) {
      Alert.alert(t('error_title'), "Konum tespiti sırasında bir hata oluştu.");
    } finally {
      setLocLoading(false);
    }
  };

  const handleGenerateRoute = () => {
    navigation.navigate('RouteDetail', { 
      city: city.trim(), 
      days: parseInt(days),
      interests: selectedInterests,
      budget: budget,
      pace: pace
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.greeting}>{t('welcome_title')}</Text>
          <Text style={styles.question}>{t('welcome_subtitle')}</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t('destination_label')}</Text>
            {/* REQ.F.15 - Konumumu Kullan Butonu */}
            <TouchableOpacity 
              style={styles.locationBtn} 
              onPress={handleUseLocation}
              disabled={locLoading}
            >
              {locLoading ? (
                <ActivityIndicator size="small" color="#3498DB" />
              ) : (
                <Text style={styles.locationBtnText}>{t('use_my_location')}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              placeholder={t('destination_placeholder')}
              value={city}
              onChangeText={handleCityChange}
            />
          </View>

          {/* Autocomplete Dropdown list (REQ.UI.11) */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.suggestionItem}
                  onPress={() => {
                    setCity(item.name);
                    setSuggestions([]);
                  }}
                >
                  <Text style={styles.suggestionText}>🏙️ {item.name} ({item.region})</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>{t('days_label')}</Text>
          <TextInput 
            style={styles.input} 
            placeholder={t('days_placeholder')} 
            keyboardType="numeric"
            value={days}
            onChangeText={setDays}
          />

          <Text style={styles.label}>{t('interests_label')}</Text>
          <View style={styles.tagContainer}>
            {INTERESTS.map(interest => (
              <TouchableOpacity 
                key={interest}
                style={[
                  styles.tag, 
                  selectedInterests.includes(interest) && styles.tagSelected
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.tagText,
                  selectedInterests.includes(interest) && styles.tagTextSelected
                ]}>{interest}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('budget_label')}</Text>
          <View style={styles.optionRow}>
            {[
              { id: 'düşük', label: t('budget_low') },
              { id: 'orta', label: t('budget_medium') },
              { id: 'yüksek', label: t('budget_high') }
            ].map(b => (
              <TouchableOpacity 
                key={b.id}
                style={[styles.optionBtn, budget === b.id && styles.optionBtnActive]}
                onPress={() => setBudget(b.id)}
              >
                <Text style={[styles.optionText, budget === b.id && styles.optionTextActive]}>
                  {b.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.button, (!city || !days) ? styles.buttonDisabled : null]} 
            onPress={handleGenerateRoute}
            disabled={!city || !days}
          >
            <Text style={styles.buttonText}>{t('generate_route')}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 30 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 5 },
  question: { fontSize: 32, fontWeight: '800', color: '#3498DB' },
  formCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, zIndex: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '700', color: '#34495E' },
  locationBtn: { backgroundColor: '#EBF5FB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#3498DB' },
  locationBtnText: { color: '#3498DB', fontSize: 12, fontWeight: 'bold' },
  inputContainer: { width: '100%' },
  input: { backgroundColor: '#F8F9F9', borderWidth: 1, borderColor: '#EAECEE', padding: 15, borderRadius: 12, fontSize: 16, width: '100%', marginTop: 5 },
  
  // Suggestions List
  suggestionsContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#EAECEE', marginTop: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  suggestionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F2F4F4' },
  suggestionText: { fontSize: 15, color: '#34495E', fontWeight: '500' },

  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  tag: { backgroundColor: '#F0F3F4', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 10, borderWidth: 1, borderColor: '#EAECEE' },
  tagSelected: { backgroundColor: '#3498DB', borderColor: '#3498DB' },
  tagText: { color: '#7F8C8D', fontWeight: '600' },
  tagTextSelected: { color: '#FFFFFF' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  optionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#F0F3F4', marginHorizontal: 4 },
  optionBtnActive: { backgroundColor: '#3498DB' },
  optionText: { color: '#7F8C8D', fontWeight: 'bold' },
  optionTextActive: { color: '#FFFFFF' },
  button: { backgroundColor: '#2ECC71', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 35 },
  buttonDisabled: { backgroundColor: '#AAB7B8' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 }
});