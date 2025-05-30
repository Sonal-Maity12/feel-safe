import { Stack } from 'expo-router';

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="emergency-contact" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="nearest-police-stations" />
      <Stack.Screen name="emergency-notification" />
      <Stack.Screen name="live-location" />
      <Stack.Screen name="community-support" />
      <Stack.Screen name="safety-resource" />
    </Stack>
  );
};

export default  RootLayout;
