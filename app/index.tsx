import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

async function clearDataIfFirstRun() {
  const firstRun = await AsyncStorage.getItem('@first_run');
  if (!firstRun) {
    // First run after reinstall, clear stored data
    await AsyncStorage.clear();
    await AsyncStorage.setItem('@first_run', 'true');  // Mark as not first run
  }
}

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await clearDataIfFirstRun();  // Clear data if first run

        // After checking first run, check if user credentials exist
        const userCredentials = await AsyncStorage.getItem('@user_credentials');
        if (userCredentials) {
          router.replace('/home');  // Navigate to home if user is logged in
        } else {
          router.replace('/login');  // Navigate to login if no credentials found
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        router.replace('/login');  // Fallback to login if error occurs
      } finally {
        setIsLoading(false);  // Ensure that loading is set to false after the operation
      }
    };

    initializeApp();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isLoading ? <ActivityIndicator size="large" color="#1565c0" /> : <Text>Loading...</Text>}
    </View>
  );
}
