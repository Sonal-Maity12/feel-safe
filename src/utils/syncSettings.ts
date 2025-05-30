// utils/syncSettings.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const SYNC_SETTING_KEY = "syncWithCloud";

// Get the user's sync preference from AsyncStorage
export const getSyncPreference = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(SYNC_SETTING_KEY);
  return value === "true";
};

// Set the user's sync preference in AsyncStorage
export const setSyncPreference = async (value: boolean) => {
  await AsyncStorage.setItem(SYNC_SETTING_KEY, value.toString());
};
