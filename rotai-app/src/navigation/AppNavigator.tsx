import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Ekranlar
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import InterestsScreen from '../screens/InterestsScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import MyRoutesScreen from '../screens/MyRoutesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RouteDetailScreen from '../screens/RouteDetailScreen';
import CityDetailScreen from '../screens/CityDetailScreen';
import EditRouteScreen from '../screens/EditRouteScreen';
import MapScreen from '../screens/MapScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Alt Navigasyon (Tab Bar) - REQ.UI.08, REQ.UI.09
function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: { height: 70, paddingBottom: 15, paddingTop: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: colors.card, borderTopWidth: 0, elevation: 10 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{ 
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>
        }} 
      />
      <Tab.Screen 
        name="MyRoutes" 
        component={MyRoutesScreen} 
        options={{ 
          tabBarLabel: 'Rota Planlarım',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🗺️</Text>
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: 'Profilim',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>
        }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isDark, colors } = useTheme();

  const CustomTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    }
  };

  return (
    <NavigationContainer theme={CustomTheme}>
      <Stack.Navigator initialRouteName="Login">
        {/* Auth Stack */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Kayıt Ol' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Şifre Sıfırla' }} />
        <Stack.Screen name="Interests" component={InterestsScreen} options={{ headerShown: false }} />
        
        {/* Main App (Tabs) */}
        <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
        
        {/* Modal-like screens */}
        <Stack.Screen name="AddRoute" component={HomeScreen} options={{ title: 'Rota Ekle' }} />
        <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Rota Detayı' }} />
        <Stack.Screen name="CityDetail" component={CityDetailScreen} options={{ title: 'Şehir Detayı' }} />
        <Stack.Screen name="EditRoute" component={EditRouteScreen} options={{ title: 'Rotayı Düzenle' }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorilerim' }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Profili Düzenle' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}