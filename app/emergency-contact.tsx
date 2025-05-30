import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
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
  Image,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Button, Menu, IconButton } from "react-native-paper";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

type Contact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  image?: string;
};

const STORAGE_KEY = "@emergency_contacts";

const getColorFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`;
  return color;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const EmergencyContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentContact, setCurrentContact] = useState<Partial<Contact>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

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

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission denied", "We need access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setCurrentContact((prev) => ({
        ...prev,
        image: result.assets[0].uri,
      }));
    }
  };

  const saveContact = () => {
    if (
      !currentContact.name ||
      !currentContact.phone ||
      !currentContact.relationship
    ) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    if (isEditing && currentContact.id) {
      const updatedContacts = contacts.map((contact) =>
        contact.id === currentContact.id
          ? { ...contact, ...currentContact }
          : contact
      );
      setContacts(updatedContacts);
      saveContactsToStorage(updatedContacts);
    } else {
      const newContact = { ...currentContact, id: uuidv4() } as Contact;
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      saveContactsToStorage(updatedContacts);
    }

    closeModal();
  };

  const deleteContact = (id: string) => {
    Alert.alert("Confirm Delete", "Delete this contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updated = contacts.filter((c) => c.id !== id);
          setContacts(updated);
          saveContactsToStorage(updated);
        },
      },
    ]);
  };

  const saveContactsToStorage = async (contacts: Contact[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error("Saving error:", e);
    }
  };

  const loadContactsFromStorage = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        setContacts(JSON.parse(json));
      }
    } catch (e) {
      console.error("Loading error:", e);
    }
  };

  useEffect(() => {
    loadContactsFromStorage();
  }, []);

  const shareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location access is required to share your location."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      await Linking.openURL(googleMapsUrl);
    } catch (error) {
      console.error("Location sharing error:", error);
      Alert.alert("Error", "Failed to share location.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconButton
            icon="magnify"
            onPress={() => setSearchVisible((prev) => !prev)}
          />
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={openMenu}
                style={{ marginRight: 5 }}
              />
            }
          >
            <Menu.Item
              onPress={loadContactsFromStorage}
              title="Refresh Contacts"
              leadingIcon="refresh"
            />
            <Menu.Item
              onPress={() => {
                Alert.alert("Settings", "Settings screen coming soon.");
                closeMenu();
              }}
              title="Settings"
              leadingIcon="cog"
            />
            <Menu.Item
              onPress={() => {
                Alert.alert(
                  "About",
                  "Feel Safe - Your Personal Safety Companion"
                );
                closeMenu();
              }}
              title="About"
              leadingIcon="information-outline"
            />
          </Menu>
        </View>
      </View>

      {searchVisible && (
        <TextInput
          style={styles.searchBar}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}

      <FlatList
        data={contacts.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.avatarImage} />
            ) : (
              <View
                style={[
                  styles.contactAvatar,
                  { backgroundColor: getColorFromName(item.name) },
                ]}
              >
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
              </View>
            )}
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactRelationship}>
                {item.relationship}
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${item.phone}`)}
              >
                <Text style={styles.contactPhone}>{item.phone}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={shareLocation}>
                <Text style={styles.shareLocation}>📍 Share My Location</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                onPress={() => openModal(item)}
                style={[styles.actionButton, styles.editButton]}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteContact(item.id)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No contacts found.</Text>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
        <Text style={styles.addButtonText}>+ Add</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Contact" : "New Contact"}
              </Text>

              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickImage}
              >
                <Text style={{ color: "#007bff", fontWeight: "bold" }}>
                  {currentContact.image ? "Change Image" : "Pick Image"}
                </Text>
              </TouchableOpacity>

              {currentContact.image && (
                <Image
                  source={{ uri: currentContact.image }}
                  style={styles.previewImage}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Name"
                value={currentContact.name || ""}
                onChangeText={(text) =>
                  setCurrentContact((prev) => ({ ...prev, name: text }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                value={currentContact.phone || ""}
                onChangeText={(text) =>
                  setCurrentContact((prev) => ({ ...prev, phone: text }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Relationship"
                value={currentContact.relationship || ""}
                onChangeText={(text) =>
                  setCurrentContact((prev) => ({ ...prev, relationship: text }))
                }
              />

              <View style={styles.modalActions}>
                <Button mode="contained" onPress={saveContact}>
                  {isEditing ? "Save Changes" : "Add Contact"}
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
    backgroundColor: "#fff",
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchBar: {
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  contactRelationship: {
    fontSize: 14,
    color: "#777",
  },
  contactPhone: {
    fontSize: 14,
    color: "#007bff",
  },
  shareLocation: {
    color: "#007bff",
    fontSize: 14,
  },
  contactActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: "#007bff",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
  },
  actionButtonText: {
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },
  addButton: {
    marginTop: 20,
    backgroundColor: "#28a745",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    width: "80%",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  imagePickerButton: {
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalActions: {
    marginTop: 20,
  },
  cancelButtonText: {
    color: "#007bff",
  },
});

export default EmergencyContactsPage;
