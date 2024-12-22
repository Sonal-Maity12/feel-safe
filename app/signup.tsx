import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const SignUp = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>SignUp</Text>
      <Button title="Sign Up" />
      <Button onPress={() => router.push("/")} title="Go To Login" />
      <TouchableOpacity  style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  text: {
    fontSize: 20,
  },
  btn: {
    backgroundColor: "red",
    width: 200,
    padding: 20,
    alignItems: "center",
    borderRadius: 10,
  },
  btnText: {
    fontWeight: 600,
    color: "white",
    fontSize: 20,
    flexWrap: "nowrap"
  }
});

export default SignUp;
