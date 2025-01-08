import { StyleSheet, View, Text ,} from 'react-native'
import React from 'react'
import { Avatar, Button, Card, Provider as PaperProvider } from 'react-native-paper'

const ProfileScreen = () => {const user = {
  name: 'Juhila Eta',
  email: 'juhila.98@example.com',
  avatarUrl: 'https://cdn-icons-png.flaticon.com/512/6833/6833605.png', 
};

const handleEditProfile = () => {
  // console.log('Edit Profile button pressed!');
  
};

const handleLogout = () => {
  // console.log('Logout button pressed!');

};
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.avatarContainer}>
            <Avatar.Image size={100} source={{ uri: user.avatarUrl }} />
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <Card.Content>
            <Button
              mode="outlined"
              onPress={handleEditProfile}
              style={styles.button}
            >
              Edit Profile
            </Button>
            <Button
              mode="contained"
              onPress={handleLogout}
              buttonColor="purple"
              textColor="white"
              style={styles.button}
            >
              Logout
            </Button>
          </Card.Content>
        </Card>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7', // Background color of the page
  },
  card: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#6e6e6e',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
});

export default ProfileScreen