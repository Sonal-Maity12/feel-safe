import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Vibration,
  ActivityIndicator,
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  Provider,
  Text,
  SegmentedButtons,
  Checkbox,
  Searchbar,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import * as SMS from "expo-sms";
import { Audio } from "expo-av";

const EmergencyNotification = () => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownTime, setCountdownTime] = useState(3);
  const [contacts, setContacts] = useState<any[]>([]); // Ensure proper type
  const [importedContacts, setImportedContacts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"manual" | "imported">("manual");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactForm, setContactForm] = useState({ name: "", phone: "" });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [alertActive, setAlertActive] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const alertTimeout = useRef<NodeJS.Timeout | null>(null);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Dimensions.get("window").width);
    };

    // Add event listener for screen size changes
    const subscription = Dimensions.addEventListener("change", handleResize);

    // Cleanup function to remove listener when the component unmounts
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const data = await AsyncStorage.getItem("@emergency_contacts");
    if (data) {
      setContacts(JSON.parse(data));
    }
  };

  const saveContacts = async (updated: any[]) => {
    await AsyncStorage.setItem("@emergency_contacts", JSON.stringify(updated));
    setContacts(updated);
  };

  const playAlertSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/alert.mp3")
      );
      setSound(sound); // Make sure to store the sound object
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing the alert sound", error);
    }
  };

  // Function to stop the alert sound and clear timeout
  const cancelAlert = async () => {
    try {
      // Stop and unload the alert sound if it is currently playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null); // Clear the sound state to avoid memory leaks
      }

      // Clear any active countdown timer
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null; // Reset the timeout reference
      }

      // Clear the alertTimeout
      if (alertTimeout.current) {
        clearTimeout(alertTimeout.current);
        alertTimeout.current = null;
      }

      // Reset countdown and visibility states
      setCountdown(null);
      setDialogVisible(false); // Hide the countdown dialog
      setAlertActive(false); // Deactivate the alert
    } catch (error) {
      console.error("Error canceling alert:", error);
    }
  };

  const withRetry = async (
    fn: () => Promise<any>,
    retries = 3,
    delay = 1000
  ) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (error: any) {
        attempt++;
        // Check if the error has a message property
        const errorMessage = error?.message || error;
        console.error(
          `Retrying (${attempt}/${retries}) due to error: ${errorMessage}`
        );
        if (attempt === retries) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * attempt)); // Exponential backoff
      }
    }
  };

  const handleSendNotification = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert("Select Contacts", "Please select at least one contact.");
      return;
    }

    // Use the correct current list based on the view mode
    const currentList = viewMode === "manual" ? contacts : importedContacts;

    setCountdown(countdownTime);
    setDialogVisible(true);
    setAlertActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownRef.current!);
          setDialogVisible(false);
          setCountdown(null);
          setAlertActive(false);
          notifyContacts(currentList);
        }
        return prev! - 1;
      });
    }, 1000);

    // Set alertTimeout to auto-dismiss after a certain time if needed
    alertTimeout.current = setTimeout(() => {
      if (alertActive) {
        cancelAlert(); // Auto-cancel if alert is active and timeout is reached
      }
    }, 20000); // Set timeout to 20 seconds (you can adjust as needed)
  };

  const notifyContacts = async (currentList: any[]) => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Denied",
          "Permission to access location was denied"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const locLink = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
      const message = `🚨 Emergency! Please help me. Here's my location: ${locLink}`;

      Vibration.vibrate(1000);
      await playAlertSound();

      await Promise.all(
        currentList.map(async (contact) => {
          if (!selectedContacts.includes(contact.id)) return;

          const phone = contact.phone ? contact.phone.replace(/\D/g, "") : "";
          const encoded = encodeURIComponent(message);

          const waUrl = `https://wa.me/${phone}?text=${encoded}`;
          const smsUrl = `sms:${phone}?body=${encoded}`;

          await Promise.all([
            withRetry(async () => {
              const supported = await Linking.canOpenURL(waUrl);
              if (supported) {
                await Linking.openURL(waUrl);
              }
            }),
            withRetry(async () => {
              const isAvailable = await SMS.isAvailableAsync();
              if (isAvailable) {
                await SMS.sendSMSAsync([phone], message);
              } else {
                await Linking.openURL(smsUrl);
              }
            }),
          ]);
        })
      );

      Alert.alert("Alert Sent", "Emergency alert sent via WhatsApp and SMS.");
    } catch (error) {
      Alert.alert("Error", "Something went wrong while sending alerts.");
    } finally {
      setLoading(false);
    }
  };

  const addOrEditContact = async () => {
    if (!contactForm.name || !contactForm.phone) {
      Alert.alert("Error", "Name and phone number are required");
      return;
    }

    const updated = [
      ...contacts,
      { id: Date.now().toString(), ...contactForm },
    ];
    await saveContacts(updated);
    setContactForm({ name: "", phone: "" });
    setDialogVisible(false);
  };

  const openPhonebook = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Access to contacts was denied.");
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      const newValidContacts = data
        .filter((c) => c.name && c.phoneNumbers?.length)
        .map((c) => ({
          id: `import_${c.id}`,
          name: c.name,
          phone: c.phoneNumbers?.[0]?.number || "",
        }));

      setImportedContacts(newValidContacts);
      setViewMode("imported");

      if (newValidContacts.length === 0) {
        Alert.alert("No Contacts", "No contacts with phone numbers found.");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      Alert.alert("Error", "Unable to fetch contacts.");
    }
  };

  const handleExport = async () => {
    const uniqueImported = importedContacts.filter((ic) => {
      const cleanImport = ic.phone.replace(/\D/g, "");
      return !contacts.some(
        (mc) => mc.phone.replace(/\D/g, "") === cleanImport
      );
    });

    const updated = [...contacts, ...uniqueImported];
    await saveContacts(updated);

    Alert.alert("Exported", "Contacts exported successfully.");
    setViewMode("manual");
  };

  const toggleSelect = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const deleteContact = async (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    await saveContacts(updated);
    setSelectedContacts((prev) => prev.filter((cid) => cid !== id));
  };

  const currentData = (
    viewMode === "manual" ? contacts : importedContacts
  ).filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <Provider>
      <LinearGradient colors={["#fff5f5", "#ffe6e6"]} style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.contentBox}>
            <Text style={styles.heading}>Emergency Assistance</Text>
            <Text style={styles.subheading}>
              Select contacts and press the button below to notify them.
            </Text>

            <Text style={styles.countdownLabel}>Countdown before alert:</Text>

            <SegmentedButtons
              value={countdownTime.toString()}
              onValueChange={(value) => setCountdownTime(Number(value))}
              buttons={["3", "5", "10"].map((val) => ({
                value: val,
                label: `${val}s`, // Corrected interpolation
                style: {
                  backgroundColor:
                    countdownTime.toString() === val ? "#ffcccc" : undefined,
                },
              }))}
            />

            {countdown !== null && (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "red",
                  textAlign: "center",
                  marginVertical: 10,
                }}
              >
                Alert in {countdown}s...
              </Text>
            )}

            <View style={{ height: 20 }} />

            <Button
              mode="contained"
              onPress={handleSendNotification}
              style={styles.alertButton}
              disabled={alertActive || loading} // Disable when alert is active
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                "Send Emergency Alert"
              )}
            </Button>

            <Button
              mode="outlined"
              onPress={cancelAlert}
              style={{
                marginBottom: 16,
                backgroundColor: "#fff",
                borderColor: "#d32f2f",
                borderWidth: 1,
              }}
              textColor="#d32f2f"
              disabled={countdown === null}
            >
              Cancel Alert
            </Button>

            <SegmentedButtons
              value={viewMode}
              onValueChange={(value) => setViewMode(value as any)}
              buttons={[
                { value: "manual", label: "Saved Contacts" },
                { value: "imported", label: "Import" },
              ]}
              style={{ marginBottom: 10 }}
            />

            <Button onPress={() => setDialogVisible(true)} icon="plus">
              Add Manual Contact
            </Button>

            {viewMode === "manual" && (
              <Button
                onPress={openPhonebook}
                icon="account-multiple"
                style={{ marginBottom: 10 }}
              >
                Import from Phonebook
              </Button>
            )}

            {viewMode === "imported" && importedContacts.length > 0 && (
              <Button
                icon="upload"
                onPress={handleExport}
                style={{ marginBottom: 10 }}
              >
                Export to Emergency Contacts
              </Button>
            )}

            <Searchbar
              placeholder="Search contacts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ marginVertical: 10 }}
            />

            <Text style={styles.contactListHeading}>
              Select Emergency Contacts
            </Text>
            <FlatList
              data={currentData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => toggleSelect(item.id)}
                  onLongPress={() =>
                    Alert.alert(
                      "Delete Contact?",
                      "Do you want to remove this contact?",
                      [
                        { text: "Cancel" },
                        {
                          text: "Delete",
                          onPress: () => deleteContact(item.id),
                        },
                      ]
                    )
                  }
                >
                  <Checkbox
                    status={
                      selectedContacts.includes(item.id)
                        ? "checked"
                        : "unchecked"
                    }
                    onPress={() => toggleSelect(item.id)} // Toggle on press
                  />
                  <Text style={{ flex: 1 }}>
                    {item.name} - {item.phone}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </KeyboardAvoidingView>

        <Portal>
          <Dialog
            visible={dialogVisible}
            onDismiss={() => setDialogVisible(false)}
          >
            <Dialog.Title>Add Emergency Contact</Dialog.Title>
            <Dialog.Content>
              <TextInput
                placeholder="Name"
                value={contactForm.name}
                onChangeText={(text) =>
                  setContactForm({ ...contactForm, name: text })
                }
                style={styles.input}
              />
              <TextInput
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={contactForm.phone}
                onChangeText={(text) =>
                  setContactForm({ ...contactForm, phone: text })
                }
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={addOrEditContact}
                style={{ marginTop: 10 }}
              >
                Save
              </Button>
            </Dialog.Content>
          </Dialog>
        </Portal>
      </LinearGradient>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentBox: {
    padding: 16,
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "red",
    textAlign: "center",
  },
  subheading: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  countdownLabel: {
    fontWeight: "600",
    marginBottom: 8,
    color: "red",
    textAlign: "center",
  },
  alertButton: {
    backgroundColor: "#d32f2f",
    width: "100%",
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8f8",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  contactListHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
    alignSelf: "flex-start",
  },

  keyboardView: {
    flex: 1,
  },

  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 8,
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 1,
  },
});

export default EmergencyNotification;
