import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, HelperText, Text } from 'react-native-paper';

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false); 

  const validateEmail = (email: string) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  const handleLogin = () => {
    // if (!email) {
    //   setEmailError('Email is required');
    // } else if (!validateEmail(email)) {
    //   setEmailError('Enter a valid email');
    // } else {
    //   setEmailError('');
    // }

    // if (!password) {
    //   setPasswordError('Password is required');
    // } else {
    //   setPasswordError('');
    // }

    // if (email && validateEmail(email) && password) {
    //   console.log('Logged in', email, password);
    // router.push("/(tabs)/home")
    // }

    
    router.push("/(tabs)/home")
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Welcome Back</Title>

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
          secureTextEntry={!isPasswordVisible} // Toggle visibility of the password
          error={passwordError !== ''}
        />
        <Ionicons
          name={isPasswordVisible ? 'eye-off' : 'eye'}
          size={24}
          color="gray"
          style={styles.eyeIcon}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)} // Toggle password visibility
        />
      </View>
      <HelperText type="error" visible={passwordError !== ''}>
        {passwordError}
      </HelperText>

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>
      <Text style={styles.registerText} onPress={() => router.push("/register")}>
        Don't have an account? Register
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
  registerText: {
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
