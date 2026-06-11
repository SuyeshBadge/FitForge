import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import { setupNotifications } from './src/utils/notifications';

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: '#f97316',
          background: '#0a0a0a',
          card: '#141414',
          text: '#f5f5f5',
          border: '#333',
          notification: '#f97316',
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' as const },
          medium: { fontFamily: 'System', fontWeight: '500' as const },
          bold: { fontFamily: 'System', fontWeight: '700' as const },
          heavy: { fontFamily: 'System', fontWeight: '800' as const },
        },
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <TabNavigator />
    </NavigationContainer>
  );
}
