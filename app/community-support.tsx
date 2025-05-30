import React, { useState } from 'react';
import { StyleSheet, Linking, Alert, TouchableOpacity, ScrollView, TextInput, View } from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const groupLink = 'https://chat.whatsapp.com/LXNfaluZlxh7HZgRG2velQ'; // Replace with your actual WhatsApp group invite link

const CommunitySupportScreen = () => {
  const [recentMessages, setRecentMessages] = useState<string[]>([
    'User1: Is everyone safe?',
    'User2: Need help near Main Street!',
    'User3: Just checking in, stay safe everyone!',
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Open the WhatsApp group (no automatic message sending here)
  const openWhatsAppGroup = () => {
    Linking.openURL(groupLink).catch((error) => {
      console.log('Failed to open WhatsApp group link', error);
      Alert.alert('Error', 'Unable to open the WhatsApp group link.');
    });
  };

  // Send an auto message (pre-filled message for user after they join)
  const sendAutoMessage = (message = 'Hi, I need support. Can anyone assist me?') => {
    if (!message) {
      console.error("No message provided");
      Alert.alert("Error", "No message provided");
      return;
    }

    const fullMessage = `${message}\nJoin our support group: ${groupLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;

    // Open WhatsApp with the auto message
    Linking.openURL(url).catch((error) => {
      console.log('Failed to send auto message', error);
      Alert.alert('Error', 'Unable to send the message.');
    });
  };

  // Add new message to recent messages
  const addMessage = () => {
    if (newMessage.trim()) {
      setRecentMessages([newMessage, ...recentMessages]);
      setNewMessage('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Recent Messages */}
      <View style={styles.recentMessagesContainer}>
        <Text style={styles.recentTitle}>Recent Group Messages</Text>
        {recentMessages.map((msg, index) => (
          <Text key={index} style={styles.message}>{msg}</Text>
        ))}
      </View>

      <Divider style={styles.divider} />

      <Card style={styles.card} mode="outlined">
        <Card.Title
          title="Community Support"
          titleStyle={styles.title}
          left={(props) => (
            <Ionicons {...props} name="people-circle" size={30} color="#4e73df" />
          )}
        />
        <Card.Content>
          <Text style={styles.contentText}>
            Need help? Join our community support group. We’re here to support you whenever you need us.
          </Text>
        </Card.Content>
      </Card>

      <TouchableOpacity onPress={openWhatsAppGroup} style={styles.button}>
        <View style={styles.iconButtonContainer}>
          <Ionicons name="chatbubbles" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonLabel}>Join the Community Support Group</Text>
        </View>
      </TouchableOpacity>

      <TextInput
        placeholder="Type a message..."
        value={newMessage}
        onChangeText={setNewMessage}
        style={styles.messageInput}
      />
      <Button mode="contained" onPress={addMessage} style={styles.addButton}>
        Add Message
      </Button>

      <Divider style={styles.divider} />

      <Text style={styles.quickMessageTitle}>Quick Messages</Text>
      <Button
        mode="contained"
        style={styles.quickMessageButton}
        onPress={() => sendAutoMessage("Help needed urgently!")}
      >
        Help needed urgently!
      </Button>
      <Button
        mode="contained"
        style={styles.quickMessageButton}
        onPress={() => sendAutoMessage("Is everyone safe?")}
      >
        Is everyone safe?
      </Button>
      <Button
        mode="contained"
        style={styles.quickMessageButton}
        onPress={() => sendAutoMessage("Need support, please respond!")}
      >
        Need support, please respond!
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  recentMessagesContainer: {
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1f2937',
  },
  message: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    borderRadius: 30,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'center',
    width: '80%',
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    marginVertical: 20,
    height: 1,
    backgroundColor: '#ddd',
  },
  messageInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    marginBottom: 20,
    backgroundColor: '#4e73df',
  },
  quickMessageTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1f2937',
  },
  quickMessageButton: {
    marginVertical: 5,
    borderRadius: 20,
    backgroundColor: '#25D366',
  },
  iconButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
});

export default CommunitySupportScreen;
