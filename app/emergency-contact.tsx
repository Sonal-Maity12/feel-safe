import React, { useId, useState } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from 'react-native-paper';

type Contact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
};

const EmergencyContactsPage: React.FC = () => {
  const id = useId()
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentContact, setCurrentContact] = useState<Partial<Contact>>({});
  const [isEditing, setIsEditing] = useState(false);

  const openModal = (contact?: Contact) => {
    if (contact) {
      setCurrentContact(contact);
      setIsEditing(true);
    } else {
      setCurrentContact({});
      setIsEditing(false);
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setCurrentContact({});
  };

  const saveContact = () => {
    if (!currentContact.name || !currentContact.phone || !currentContact.relationship) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    if (isEditing && currentContact.id) {
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === currentContact.id ? { ...contact, ...currentContact } : contact
        )
      );
    } else {
      setContacts(prevContacts => [
        ...prevContacts,
        { ...currentContact, id } as Contact,
      ]);
    }

    closeModal();
  };

  const deleteContact = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setContacts(prev => prev.filter(contact => contact.id !== id)) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactRelationship}>{item.relationship}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity onPress={() => openModal(item)} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteContact(item.id)} style={[styles.actionButton, styles.deleteButton]}>
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No contacts found. Add a new contact!</Text>}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Contact' : 'New Contact'}</Text>

              <TextInput
                style={styles.input}
                placeholder="Name"
                value={currentContact.name || ''}
                onChangeText={text => setCurrentContact(prev => ({ ...prev, name: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                value={currentContact.phone || ''}
                onChangeText={text => setCurrentContact(prev => ({ ...prev, phone: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Relationship (e.g., Family, Doctor)"
                value={currentContact.relationship || ''}
                onChangeText={text => setCurrentContact(prev => ({ ...prev, relationship: text }))}
              />

              <View style={styles.modalActions}>
                <Button mode="contained" onPress={saveContact}>
                  <Text>Save</Text>
                </Button>
                <Button onPress={closeModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Button>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  contactCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactInfo: {
    flex: 3,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactRelationship: {
    color: '#555',
    marginBottom: 4,
  },
  contactPhone: {
    color: '#007bff',
  },
  contactActions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    width:40
  },
  actionButtonText: {
    color: '#007bff',
    textAlign: 'center',
    
  },
  deleteButton: {
    marginTop: 4,
    backgroundColor: '',
    borderRadius: 4,
    width:80,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});

export default EmergencyContactsPage;
