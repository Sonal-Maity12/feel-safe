import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet, } from 'react-native';
import { Button, Provider as PaperProvider } from 'react-native-paper';

const SosScreen = () => {
  const handleSOSPress = () => {
    console.log('SOS button pressed!');
  
  };
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Button
          mode="contained"
          onPress={handleSOSPress}
          buttonColor="#ff4d4d"
          textColor="white"
          contentStyle={styles.buttonContent}
        >
          SOS
        </Button>
      </View>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', 
  },
  buttonContent: {
    height: 50,
    width: 200,
  },
});

export default SosScreen