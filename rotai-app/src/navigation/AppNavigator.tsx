import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../services/i18n';

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
  const { t } = useTranslation();
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
          tabBarLabel: t('explore'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>
        }} 
      />
      <Tab.Screen 
        name="MyRoutes" 
        component={MyRoutesScreen} 
        options={{ 
          tabBarLabel: t('my_routes'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🗺️</Text>
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>
        }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();

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
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('register') }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: t('forgot_password') }} />
        <Stack.Screen name="Interests" component={InterestsScreen} options={{ headerShown: false }} />
        
        {/* Main App (Tabs) */}
        <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
        
        {/* Modal-like screens */}
        <Stack.Screen name="AddRoute" component={HomeScreen} options={{ title: t('add_route_header') }} />
        <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: t('route_detail_header') }} />
        <Stack.Screen name="CityDetail" component={CityDetailScreen} options={{ title: t('city_detail_header') }} />
        <Stack.Screen name="EditRoute" component={EditRouteScreen} options={{ title: t('edit_route_header') }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('favorites') }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: t('edit_profile') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}