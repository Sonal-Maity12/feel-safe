import React from 'react';
import { Slot } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
// import { useColorScheme } from 'react-native';  // For theme detection
// import { lightTheme, darkTheme } from '../theme';  // Replace with your theme path

export default function Layout() {
//   const colorScheme = useColorScheme();  // Detect system theme

  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}
