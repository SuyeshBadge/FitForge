import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import DietScreen from '../screens/DietScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { focused: string; default: string }> = {
  dashboard: { focused: 'home', default: 'home-outline' },
  workout: { focused: 'barbell', default: 'barbell-outline' },
  diet: { focused: 'restaurant', default: 'restaurant-outline' },
  progress: { focused: 'trending-up', default: 'trending-up-outline' },
  settings: { focused: 'settings', default: 'settings-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.default;
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,10,0.95)',
          borderTopColor: '#333',
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="workout" component={WorkoutScreen} options={{ tabBarLabel: 'Workout' }} />
      <Tab.Screen name="diet" component={DietScreen} options={{ tabBarLabel: 'Diet' }} />
      <Tab.Screen name="progress" component={ProgressScreen} options={{ tabBarLabel: 'Progress' }} />
      <Tab.Screen name="settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}
