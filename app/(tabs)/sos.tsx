import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Vibration,
  Modal,
  Platform,
  Alert,
} from "react-native";
import {
  Button,
  Provider as PaperProvider,
  TextInput,
  TouchableRipple,
  Checkbox,
  Divider,
} from "react-native-paper";
import {
  Camera,
  CameraView,
  CameraType,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as Location from "expo-location";
import * as SMS from "expo-sms";
import * as Contacts from "expo-contacts";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import * as IntentLauncher from "expo-intent-launcher";
import { Ionicons } from "@expo/vector-icons";

const SosScreen = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [contacts, setContacts] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<ContactType[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ContactType[]>([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const [canStop, setCanStop] = useState(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);

  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [capturedVideoUri, setCapturedVideoUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStarted, setRecordingStarted] = useState(false); // ✅ Add this
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [videoSaved, setVideoSaved] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<
    boolean | null
  >(null);

  const [isFlashBlinking, setIsFlashBlinking] = useState(false);
  const flashIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [flashMode, setFlashMode] = useState<boolean>(false);

  // Add this state to track siren duration
  const SIREN_DURATION = 10000; // 10 seconds to match siren sound duration

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        setContacts(data);
      }

      const requestAllPermissions = async () => {
        // Request camera permission
        const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(camStatus === "granted");

        // Request audio permission
        const { status: micStatus } = await Audio.requestPermissionsAsync();
        setMicrophonePermission(micStatus === "granted");

        // Request media library permissions with write access
        if (Platform.OS === 'android') {
          const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync(true);
          setHasMediaLibraryPermission(mediaStatus === 'granted');
        } else {
          const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
          setHasMediaLibraryPermission(mediaStatus === 'granted');
        }
      };

      await requestAllPermissions();
    })();
  }, []);

  useEffect(() => {
    if (isRecording) {
      const timeout = setTimeout(() => setCanStop(true), 3000);
      return () => clearTimeout(timeout);
    } else {
      setCanStop(false);
    }
  }, [isRecording]);

  type ContactType = Contacts.Contact;

  const toggleContactSelection = (contact: ContactType) => {
    if (!contact.phoneNumbers?.[0]?.number) {
      Alert.alert('Invalid Contact', 'This contact does not have a phone number.');
      return;
    }

    setSelectedContacts((prev) => {
      const isAlreadySelected = prev.some((c) => c.id === contact.id);
      if (isAlreadySelected) {
        const filtered = prev.filter((c) => c.id !== contact.id);
        // Update selected phone number if we still have contacts selected
        if (filtered.length > 0) {
          setSelectedPhoneNumber(filtered[0].phoneNumbers?.[0]?.number || null);
        } else {
          setSelectedPhoneNumber(null);
        }
        return filtered;
      } else {
        // Add new contact and update selected phone number
        const newContacts = [...prev, contact];
        setSelectedPhoneNumber(contact.phoneNumbers?.[0]?.number || null);
        // Update recent contacts
        if (!recentContacts.some((c) => c.id === contact.id)) {
          setRecentContacts((prevRecent) => [contact, ...prevRecent.slice(0, 4)]);
        }
        return newContacts;
      }
    });
  };

  // Play Siren Sound
  const playSirenSound = async () => {
    try {
      // Create and load the siren sound
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/siren.mp3")
      );

      // Set the sound state
      setSound(sound);

      // Play the sound
      await sound.playAsync();

      // Update the state to indicate the siren is playing
      setIsSirenPlaying(true);

      // Stop both siren and flash after SIREN_DURATION
      setTimeout(() => {
        stopSiren();
        stopFlashBlinking();
      }, SIREN_DURATION);
    } catch (error) {
      console.error("Error playing siren:", error);
      stopFlashBlinking(); // Stop flash if siren fails
    }
  };

  // Stop Siren Sound
  const stopSiren = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setIsSirenPlaying(false);
    } catch (error) {
      console.error("Error stopping siren:", error);
    }
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
        });
        if (photo?.uri) {
          const savedUri = await saveToLibrary(photo.uri);
          setCapturedPhotoUri(savedUri);
          Alert.alert(
            "Photo Saved",
            "The photo has been saved to your library."
          );
          return savedUri;
        }
      } catch (error) {
        console.error("Error capturing photo:", error);
      }
    }
    return null;
  };

  const startVideoRecording = async () => {
    if (!cameraRef.current || !hasCameraPermission || !microphonePermission) {
      Alert.alert('Permission Error', 'Camera or microphone permission not granted.');
      return;
    }

    try {
      // Reset states
      setIsRecording(true);
      setCapturedVideoUri(null);
      setVideoSaved(false);
      setRecordingStarted(false);

      // For Android in Expo Go, show warning about development build requirement
      if (Platform.OS === 'android') {
        Alert.alert(
          'Note',
          'Video recording in Expo Go on Android may be limited. For full functionality, please create a development build.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }

      // Start recording with minimal options to ensure compatibility
      const videoPromise = cameraRef.current.recordAsync();

      // Set a flag to indicate recording has started
      setTimeout(() => {
        if (isRecording) {
          setRecordingStarted(true);
        }
      }, 500);

      // Set up auto-stop with progress tracking
      let recordingDuration = 0;
      const progressInterval = setInterval(() => {
        if (isRecording) {
          recordingDuration += 100;
          if (recordingDuration >= 10000) { // 10 seconds
            clearInterval(progressInterval);
            stopVideoRecording();
          }
        } else {
          clearInterval(progressInterval);
        }
      }, 100);

      const video = await videoPromise;
      clearInterval(progressInterval);
      
      if (video?.uri) {
        setCapturedVideoUri(video.uri);
        setVideoSaved(true);
        
        // Try to save to library only on iOS or if explicitly granted permission
        if (Platform.OS === 'ios' || (Platform.OS === 'android' && hasMediaLibraryPermission)) {
          try {
            await saveToLibrary(video.uri);
            Alert.alert('Success', 'Video recorded and saved successfully!');
          } catch (error) {
            console.warn('Could not save to library:', error);
            Alert.alert(
              'Success',
              'Video recorded successfully but could not be saved to library. It can still be used for SOS.'
            );
          }
        } else {
          Alert.alert('Success', 'Video recorded successfully!');
        }
      }
    } catch (error) {
      console.error('Error recording video:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to record video. ';
      if (Platform.OS === 'android') {
        errorMessage += 'On Android, you may need to create a development build for full video functionality.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      Alert.alert('Recording Error', errorMessage);
    } finally {
      // Cleanup
      setIsRecording(false);
      setRecordingStarted(false);
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
    }
  };

  const stopVideoRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      // Add a small delay before stopping to ensure minimum recording duration
      if (!recordingStarted) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Error stopping video recording:', error);
    } finally {
      setIsRecording(false);
      setRecordingStarted(false);
    }
  };

  const saveToLibrary = async (uri: string): Promise<string | null> => {
    try {
      // For Android, ensure we have write permission
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        if (status !== 'granted') {
          throw new Error('Media library permission not granted');
        }
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      
      try {
        const album = await MediaLibrary.getAlbumAsync('SOS Videos');
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync('SOS Videos', asset, false);
        }
      } catch (albumError) {
        console.error('Album error:', albumError);
        // Even if album creation fails, we still have the asset
      }
      
      return asset.uri;
    } catch (error) {
      console.error('Error saving to library:', error);
      throw error; // Propagate error to handle it in the calling function
    }
  };

  const openSavedVideo = () => {
    if (capturedVideoUri) {
      if (Platform.OS === "android") {
        IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: capturedVideoUri,
          flags: 1,
          type: "video/mp4",
        });
      } else {
        Linking.openURL(capturedVideoUri);
      }
    }
  };

  const startFlashBlinking = async () => {
    console.log('Starting flash blinking...');
    if (!cameraRef.current) {
      console.log('No camera ref available');
      return;
    }

    setIsFlashBlinking(true);
    let isOn = false;

    // Clear any existing interval
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current);
    }

    // Initial torch state
    setFlashMode(true);
    
    flashIntervalRef.current = setInterval(() => {
      if (!isFlashBlinking) {
        stopFlashBlinking();
        return;
      }

      isOn = !isOn;
      console.log('Setting torch:', isOn);
      setFlashMode(isOn);
    }, 300);

    // Stop the flash after SIREN_DURATION
    setTimeout(() => {
      stopFlashBlinking();
    }, SIREN_DURATION);
  };

  const stopFlashBlinking = () => {
    console.log('Stopping flash blinking...');
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current);
      flashIntervalRef.current = null;
    }
    
    setIsFlashBlinking(false);
    setFlashMode(false);
  };

  const handleSOSPress = async () => {
    if (!selectedPhoneNumber) {
      Alert.alert('Error', 'Please select a contact first.');
      return;
    }

    try {
      console.log('Starting SOS sequence...');
      
      // Start effects in sequence with proper timing
      startFlashBlinking();
      
      // Small delay to ensure camera is ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Start siren and vibration
      await playSirenSound();
      Vibration.vibrate([500, 500, 500, 500], true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Get Location and send messages
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Error', 'Location permission is required to send your location.');
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      if (!userLocation?.coords) {
        Alert.alert('Error', 'Could not get your location. Please try again.');
        return;
      }

      // Prepare and send messages while effects are running
      const locationUrl = `https://maps.google.com/?q=${userLocation.coords.latitude},${userLocation.coords.longitude}`;
      const message = `🚨 EMERGENCY SOS ALERT!\nI need immediate help!\nMy location: ${locationUrl}`;

      // Send to all selected contacts
      for (const contact of selectedContacts) {
        const phoneNumber = contact.phoneNumbers?.[0]?.number;
        if (!phoneNumber) continue;

        try {
          await SMS.sendSMSAsync(phoneNumber, message);
        } catch (error) {
          console.error('SMS error:', error);
        }

        try {
          const whatsappUrl = `whatsapp://send?phone=${phoneNumber.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(message)}`;
          await Linking.openURL(whatsappUrl);
        } catch (error) {
          console.error('WhatsApp error:', error);
        }
      }

      // Show success modal
      setSosModalVisible(true);
    } catch (error) {
      console.error('SOS error:', error);
      Alert.alert('Error', 'Failed to send SOS. Please try again.');
      stopFlashBlinking();
      stopSiren();
    }
  };

  const toggleCameraFacing = () => {
    setFacing((facing) => (facing === "back" ? "front" : "back"));
  };

  const handleCloseSosModal = () => {
    setSosModalVisible(false);
    setSelectedPhoneNumber(null);
    stopSiren();
    stopFlashBlinking();
    Vibration.cancel(); // Stop vibration
  };

  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up...');
      if (sound) {
        sound.unloadAsync();
      }
      stopFlashBlinking();
      Vibration.cancel();
    };
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Checking permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission</Text>
        <Button mode="contained" onPress={requestPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  if (hasCameraPermission === null || hasMediaLibraryPermission === null) {
    return (
      <View>
        <Text>Requesting permissions...</Text>
      </View>
    );
  }

  if (!hasCameraPermission || !hasMediaLibraryPermission) {
    return (
      <View>
        <Text>Permission denied. Please enable camera and media access.</Text>
      </View>
    );
  }
  return (
    <PaperProvider>
      <View style={styles.container}>
        <CameraView 
          ref={cameraRef} 
          style={styles.camera} 
          facing="back"
          enableTorch={flashMode}
        >
          <View style={styles.overlay}>
            {/* Flip Camera */}
            <Button
              mode="contained"
              onPress={toggleCameraFacing}
              style={styles.controlButton}
              buttonColor="#1976D2"
              icon="camera-flip"
            >
              Flip Camera
            </Button>

            {/* Select Contact */}
            <Button
              mode="contained"
              onPress={() => setContactModalVisible(true)}
              style={styles.controlButton}
              buttonColor="#0288D1"
              icon="account-multiple"
            >
              Select Contact
            </Button>

            {/* Capture Photo */}
            <Button
              mode="contained"
              onPress={capturePhoto}
              style={styles.controlButton}
              buttonColor="#00796B"
              icon="camera"
            >
              Capture Photo
            </Button>

            {/* Record / Stop Video */}
            <TouchableOpacity
              onPress={canStop ? stopVideoRecording : startVideoRecording}
              style={[
                styles.iconButton,
                isRecording ? styles.stopButton : styles.recordButton,
              ]}
            >
              <Ionicons
                name={isRecording ? "square" : "videocam"}
                size={24}
                color="white"
                style={{ marginLeft: 8 }}
              />
              <Text style={styles.buttonText}>
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Text>
            </TouchableOpacity>

            {/* Show Video Saved Status */}
            {videoSaved && <Text style={styles.videoStatus}>Video Saved!</Text>}

            {/* View Saved Video */}
            {capturedVideoUri && videoSaved && !isRecording && (
              <TouchableOpacity
                onPress={openSavedVideo}
                style={styles.viewButton}
              >
                <Ionicons name="play-circle" size={28} color="#007AFF" />
                <Text style={styles.viewText}>View Saved Video</Text>
              </TouchableOpacity>
            )}

            {/* Show Selected Number */}
            {selectedPhoneNumber && (
              <Text style={styles.selectedNumber}>
                Selected: {selectedPhoneNumber}
              </Text>
            )}

            {/* SOS Button */}
            <Button
              mode="contained"
              onPress={handleSOSPress}
              buttonColor="#B22222"
              textColor="white"
              contentStyle={styles.sosButtonContent}
              style={styles.sosButton}
              disabled={!selectedPhoneNumber}
              icon="alarm-light"
            >
              SEND SOS
            </Button>

            {/* Stop Siren Button */}
            {isSirenPlaying && (
              <TouchableOpacity
                onPress={stopSiren}
                style={styles.controlButton1}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="stop-circle"
                    size={24}
                    color="red"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.buttonText}>Stop Siren</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </CameraView>

        {/* SOS Modal */}
        <Modal visible={sosModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>🚨 SOS Alert Sent! 🚨</Text>
              <Button onPress={handleCloseSosModal}>Close</Button>
            </View>
          </View>
        </Modal>

        {/* Contact Picker Modal */}
        <Modal visible={contactModalVisible} transparent animationType="slide">
          <View style={styles.contactModalOverlay}>
            <View style={styles.contactModalContent}>
              {/* Header with Back Button */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <TouchableOpacity onPress={() => setContactModalVisible(false)}>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={[styles.modalText, { marginLeft: 10 }]}>
                  Select a Contact
                </Text>
              </View>

              {/* Search Input */}
              <TextInput
                placeholder="Search contacts..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                mode="outlined"
                style={{ marginBottom: 10, width: "100%" }}
              />

              {/* Contact List */}
              <ScrollView style={{ maxHeight: 300, width: "100%" }}>
                {/* Recently Used Contacts */}
                {recentContacts.length > 0 && (
                  <>
                    <Text style={{ marginTop: 10, fontWeight: "bold" }}>
                      Recently Used
                    </Text>
                    {recentContacts.map((contact) => {
                      const name = `${contact.name} (${contact.phoneNumbers?.[0]?.number || "No number"
                        })`;
                      const isSelected = selectedContacts.some(
                        (c) => c.id === contact.id
                      );
                      return (
                        <TouchableRipple
                          key={contact.id}
                          onPress={() => toggleContactSelection(contact)}
                          rippleColor="rgba(0, 0, 0, .32)"
                        >
                          <View style={styles.contactItem}>
                            <Checkbox.Android
                              status={isSelected ? "checked" : "unchecked"}
                              onPress={() => toggleContactSelection(contact)}
                            />
                            <Text style={styles.contactName}>{name}</Text>
                          </View>
                        </TouchableRipple>
                      );
                    })}
                    <Divider style={{ marginVertical: 10 }} />
                  </>
                )}

                {/* Filtered Contacts */}
                {contacts.length > 0 ? (
                  contacts
                    .filter(
                      (c) =>
                        c.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        c.phoneNumbers?.[0]?.number.includes(searchQuery)
                    )
                    .map((contact) => {
                      const phone = contact.phoneNumbers?.[0]?.number;
                      return (
                        <TouchableRipple
                          key={contact.id}
                          onPress={() => {
                            if (phone) {
                              setSelectedPhoneNumber(phone);
                              setContactModalVisible(false);
                              setSearchQuery("");
                              setRecentContacts((prev) => {
                                const exists = prev.find(
                                  (c) => c.id === contact.id
                                );
                                return exists
                                  ? prev
                                  : [contact, ...prev].slice(0, 5);
                              });
                            }
                          }}
                          rippleColor="rgba(0, 0, 0, .32)"
                        >
                          <View style={styles.contactItem}>
                            <Text style={styles.contactName}>
                              {contact.name} ({phone || "No number"})
                            </Text>
                          </View>
                        </TouchableRipple>
                      );
                    })
                ) : (
                  <Text style={{ textAlign: "center", marginVertical: 10 }}>
                    No contacts found
                  </Text>
                )}
              </ScrollView>

              {/* Cancel Button */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                <Button mode="text" onPress={() => setContactModalVisible(false)}>
                  Cancel
                </Button>
                {
                  recentContacts.length > 0 &&
                  <Button mode="text" onPress={() => {
                    const phoneNumber = selectedContacts[0].phoneNumbers?.[0]?.number;
                    if (phoneNumber) {
                      setSelectedPhoneNumber(phoneNumber);
                    }
                    setContactModalVisible(false);
                  }}>
                    Done
                  </Button>}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  message: { fontSize: 18 },
  camera: { flex: 1, width: "100%" },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: { fontSize: 20, fontWeight: "bold" },
  contactModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  contactModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  contactButton: {
    padding: 10,
    margin: 5,
    backgroundColor: "#0288D1",
    borderRadius: 5,
    width: "100%",
  },
  contactName: { fontSize: 16, },
  sosButton: { position: "absolute", bottom: 50, padding: 10 },
  sosButtonContent: { paddingHorizontal: 50 },
  controlButton: {
    marginBottom: 20,
    borderRadius: 6,
    alignItems: "center",
    padding: 10,
  },
  selectedNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginVertical: 10,
  },

  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: "#F57C00",
  },

  recordButton: {
    backgroundColor: "#F57C00",
  },

  stopButton: {
    backgroundColor: "#D32F2F",
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  viewText: {
    marginLeft: 6,
    color: "#007AFF",
    fontWeight: "500",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    // marginLeft: 8,
    padding: 10,
  },
  controlButton1: {
    backgroundColor: "#D32F2F",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },

  videoStatus: {
    fontSize: 16,
    color: "green",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
  },
  searchInput: {
    marginBottom: 20,
  },
  contactItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  selectedContact: {
    backgroundColor: "#d3f8d3", // Green background for selected contacts
  },
});

export default SosScreen;
