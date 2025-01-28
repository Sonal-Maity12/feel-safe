import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <PaperProvider>
        <Stack.Screen name="index" />
        <Stack.Screen name="emergency-contact" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="nearest-police-station" />
      </PaperProvider>
    </Stack>
  );
};

export default _layout;
