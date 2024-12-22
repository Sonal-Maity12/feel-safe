import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
      <Link style={[styles.text, styles.link]} href={"/signup"}>Go To Signup</Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
  },
  link: {
    color: "blue",
    marginTop: 10
  }
});

export default HomeScreen;
