// SignupScreen.js

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, HelperText, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; // For the eye icon
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const validateEmail = (email: string) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  const handleSignup = () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!email) {
      setEmailError('Email is required');
    } else if (!validateEmail(email)) {
      setEmailError('Enter a valid email');
    }

    if (!password) {
      setPasswordError('Password is required');
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    }

    if (email && validateEmail(email) && password && password === confirmPassword) {
      // Handle signup logic here (e.g., call API)
      console.log('Account created');
      router.back()
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Create Account</Title>
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError !== ''}
      />
      <HelperText type="error" visible={emailError !== ''}>
        {emailError}
      </HelperText>

      <View style={styles.passwordContainer}>
        <TextInput
          label="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          secureTextEntry={!isPasswordVisible}
          error={passwordError !== ''}
        />
        <Ionicons
          name={isPasswordVisible ? 'eye-off' : 'eye'}
          size={24}
          color="gray"
          style={styles.eyeIcon}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        />
      </View>
      <HelperText type="error" visible={passwordError !== ''}>
        {passwordError}
      </HelperText>

      <View style={styles.passwordContainer}>
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          style={styles.input}
          secureTextEntry={!isConfirmPasswordVisible}
          error={confirmPasswordError !== ''}
        />
        <Ionicons
          name={isConfirmPasswordVisible ? 'eye-off' : 'eye'}
          size={24}
          color="gray"
          style={styles.eyeIcon}
          onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
        />
      </View>
      <HelperText type="error" visible={confirmPasswordError !== ''}>
        {confirmPasswordError}
      </HelperText>

      <Button mode="contained" onPress={handleSignup} style={styles.button}>
        Sign Up
      </Button>
      <Text style={styles.loginText} onPress={() => router.back()}>
        Already have an account? Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 30,
    color: "purple"
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'blue',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 20,
  },
});
