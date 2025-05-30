import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Provider as PaperProvider } from "react-native-paper";

const TabsLayout = () => {
  return (
    <PaperProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <FontAwesome size={28} name="home" color={focused ? "purple" : "gray"} />
            ),
            tabBarShowLabel: false,
          }}
        />
        <Tabs.Screen
          name="sos"
          options={{
            title: "SoS",
            tabBarIcon: ({ focused }) => (
              <MaterialIcons size={28} name="sos" color={focused ? "purple" : "gray"} />
            ),
            tabBarShowLabel: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <FontAwesome name="user" size={28} color={focused ? "purple" : "gray"} />
            ),
            tabBarShowLabel: false,
          }}
        />
      </Tabs>
    </PaperProvider>
  );
};

export default TabsLayout;
