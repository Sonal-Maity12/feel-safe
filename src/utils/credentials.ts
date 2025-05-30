import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_CREDENTIALS_KEY = '@user_credentials';

export interface Credentials {
  email?: string;
  password?: string;
  username?: string;
  profilePicture?: string | null;
  bio?: string;
}

 // Save email, password, username and profilePicture to AsyncStorage
 export const saveUserCredentials = async (newData: Credentials) => {
  try {
    const current = await getUserCredentials();
    const merged = { ...current, ...newData };
    const jsonValue = JSON.stringify(merged);
    await AsyncStorage.setItem(USER_CREDENTIALS_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving user credentials:', error);
    throw error;
  }
};
    // Get saved email, password, username, and profilePicture from AsyncStorage 
    export const getUserCredentials = async (): Promise<Credentials | null> => {
      try {
        const jsonValue = await AsyncStorage.getItem(USER_CREDENTIALS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch (error) {
        console.error('Error retrieving user credentials:', error);
        throw error;
      }
    };

// Clear user credentials from AsyncStorage
export const clearUserCredentials = async () => {
  try {
    await AsyncStorage.removeItem(USER_CREDENTIALS_KEY);
  } catch (error) {
    console.error('Error clearing credentials:', error);
    throw error;
  }
};
