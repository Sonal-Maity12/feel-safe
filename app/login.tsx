import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { TextInput, Button, Title, HelperText, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  saveUserCredentials,
  getUserCredentials,
} from "./../src/utils/credentials";
import * as ImagePicker from "expo-image-picker";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Prefill credentials if previously saved
  useEffect(() => {
    const fetchCredentials = async () => {
      const saved = await getUserCredentials();
      if (saved) {
        if (!email && saved.email) setEmail(saved.email);
        if (!password && saved.password) setPassword(saved.password);
        if (!username && saved.username) setUsername(saved.username);
        if (!profilePicture && saved.profilePicture) setProfilePicture(saved.profilePicture);
      }
    };
    fetchCredentials();
  }, []);

  const validateEmail = (email: string) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  const handleLogin = async () => {
    let isValid = true;

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) return;

    try {
      // Save credentials as an object
      await saveUserCredentials({
        email,
        password,
        username,
        profilePicture,
      });
      Alert.alert("Login Successful", `Welcome ${username || email}`);
      router.push("/(tabs)/home");
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Login Failed", "Invalid email or password.");
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to allow access to your media library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfilePicture(uri);
      }
    } catch (error) {
      console.error("Image Picker Error:", error);
      Alert.alert("Error", "Something went wrong while selecting the image.");
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Welcome To Feel Safe App</Title>

      <TouchableOpacity onPress={pickImage}>
        <View style={styles.profilePictureContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
          ) : (
            <>
              <Ionicons name="person-circle-outline" size={80} color="gray" />
              <Text style={styles.profileHintText}>Tap to select a profile picture</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!emailError}
      />
      <HelperText type="error" visible={!!emailError}>
        {emailError}
      </HelperText>

      <View style={styles.passwordContainer}>
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry={!isPasswordVisible}
          error={!!passwordError}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeIconContainer}
        >
          <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={24} color="gray" />
        </TouchableOpacity>
      </View>
      <HelperText type="error" visible={!!passwordError}>
        {passwordError}
      </HelperText>

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 30,
    color: "purple",
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
  registerText: {
    textAlign: "center",
    marginTop: 20,
    color: "blue",
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIconContainer: {
    position: "absolute",
    right: 10,
    top: 22,
    padding: 5,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileHintText: {
    marginTop: 8,
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
});
