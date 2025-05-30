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

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        setContacts(data);
      }
    })();

    const requestAllPermissions = async () => {
      const { status: camStatus } =
        await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(camStatus === "granted");

      const { status: micStatus } = await Audio.requestPermissionsAsync();
      setMicrophonePermission(micStatus === "granted");

      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaStatus.granted);
    };

    requestAllPermissions();
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
    setSelectedContacts((prev) => {
      const isAlreadySelected = prev.some((c) => c.id === contact.id);
      if (isAlreadySelected) {
        return prev.filter((c) => c.id !== contact.id);
      } else {
        // Optional: update recent contacts when selected
        if (!recentContacts.some((c) => c.id === contact.id)) {
          setRecentContacts([contact, ...recentContacts.slice(0, 4)]); // Keep last 5
        }
        return [...prev, contact];
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

      // Stop the siren after 10 seconds
      setTimeout(stopSiren, 10000);
    } catch (error) {
      console.error("Error playing siren:", error);
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
    if (
      cameraRef.current &&
      hasCameraPermission &&
      microphonePermission &&
      hasMediaLibraryPermission
    ) {
      try {
        console.log("Recording started");
        setIsRecording(true);
        setCapturedVideoUri(null);
        setVideoSaved(false);
        setRecordingStarted(false); // ✅ Reset flag

        // Start recording
        const videoPromise = cameraRef.current.recordAsync();

        // ✅ Wait a bit to ensure recording has actually started
        setTimeout(() => {
          setRecordingStarted(true);
        }, 1500); // 1.5 seconds is usually enough

        // Set timeout to auto-stop recording (after a total of 6 seconds for example)
        recordingTimeoutRef.current = setTimeout(() => {
          stopVideoRecording();
        }, 6000);

        const video = await videoPromise;
        console.log("Video object:", video);

        if (video?.uri) {
          setCapturedVideoUri(video.uri);
          setVideoSaved(false);
        } else {
          console.error("No URI found in the video object");
        }
      } catch (error) {
        console.error("Error starting video recording:", error);
        setIsRecording(false);
      }
    } else {
      console.warn(
        "Permissions are not granted for Camera, Microphone, or Media Library."
      );
    }
  };

  // Stop video recording
  const stopVideoRecording = async () => {
    if (cameraRef.current && isRecording && recordingStarted) {
      try {
        console.log("Stopping video recording...");
        cameraRef.current.stopRecording();

        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }

        setIsRecording(false);
        setRecordingStarted(false);

        setTimeout(async () => {
          if (capturedVideoUri) {
            const savedUri = await saveToLibrary(capturedVideoUri);
            if (savedUri) {
              setVideoSaved(true);
              console.log("Video saved:", savedUri);
            }
          } else {
            console.error("No video captured to save.");
          }
        }, 100);
      } catch (error) {
        console.error("Error stopping video recording:", error);
      }
    } else {
      console.warn("Cannot stop, recording hasn't fully started.");
    }
  };

  //save video
  const saveToLibrary = async (videoUri: string) => {
    try {
      // Get current permission status
      const { status } = await MediaLibrary.getPermissionsAsync();

      if (status !== "granted") {
        const { status: newStatus } =
          await MediaLibrary.requestPermissionsAsync();
        if (newStatus !== "granted") {
          console.error("Permission to access media library denied");
          return null;
        }
      }

      // Save video
      const asset = await MediaLibrary.createAssetAsync(videoUri);
      await MediaLibrary.createAlbumAsync("MyVideos", asset, false);
      return asset.uri;
    } catch (error) {
      console.error("Error saving video to library:", error);
      return null;
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

  const handleSOSPress = async () => {
    console.log("SOS button pressed!");

    try {
      // Play Siren Sound
      await playSirenSound();

      // Trigger Vibration and Haptics
      Vibration.vibrate(5000);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Request Location Permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission not granted.");
        alert("Location permission is required to send your SOS.");
        return;
      }

      // Get Current Location
      const userLocation = await Location.getCurrentPositionAsync({});
      if (!userLocation?.coords) {
        console.error("Failed to get user location.");
        alert("Failed to retrieve location.");
        return;
      }

      // Ensure a contact is selected
      if (selectedContacts.length === 0) {
        console.error("No contacts selected.");
        alert("Please select at least one contact.");
        return;
      }

      // Loop through selected contacts and send SOS
      for (const contact of selectedContacts) {
        const phoneNumber = contact.phoneNumbers?.[0]?.number;
        const message = `🚨 I need help! My location: https://maps.google.com/?q=${userLocation.coords.latitude},${userLocation.coords.longitude}`;

        // Ensure phone number is valid
        if (!phoneNumber) {
          console.error("Invalid phone number.");
          alert("One or more contacts don't have a valid phone number.");
          continue;
        }

        // Send SMS
        await SMS.sendSMSAsync(phoneNumber, message);

        // Send WhatsApp message
        try {
          await Linking.openURL(
            `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
              message
            )}`
          );
        } catch (error) {
          console.error("Error sending WhatsApp message:", error);
        }

        // Send Email
        const emailBody = `${message}${
          capturedPhotoUri ? `\nPhoto: ${capturedPhotoUri}` : ""
        }${capturedVideoUri ? `\nVideo: ${capturedVideoUri}` : ""}`;
        try {
          await Linking.openURL(
            `mailto:?subject=Emergency Help Needed!&body=${encodeURIComponent(
              emailBody
            )}`
          );
        } catch (error) {
          console.error("Error opening email app:", error);
        }
      }

      // Show SOS Modal
      setSosModalVisible(true);
    } catch (error) {
      console.error("Error during SOS:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const toggleCameraFacing = () => {
    setFacing((facing) => (facing === "back" ? "front" : "back"));
  };

  const handleCloseSosModal = () => {
    setSosModalVisible(false);
    setSelectedPhoneNumber(null);
    stopSiren();
  };

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
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
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
                      const name = `${contact.name} (${
                        contact.phoneNumbers?.[0]?.number || "No number"
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
              <Button mode="text" onPress={() => setContactModalVisible(false)}>
                Cancel
              </Button>
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
    // fontWeight: "bold",
    // fontSize: 24
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

  // buttonText: {
  //   color: "white",
  //   marginLeft: 8,
  // },

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
// OR
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Vibration,
//   Modal,
// } from "react-native";
// import { Button, Provider as PaperProvider } from "react-native-paper";
// import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
// import * as Location from "expo-location";
// import * as SMS from "expo-sms";
// import * as Contacts from "expo-contacts";
// import { Audio } from "expo-av";
// import * as Haptics from "expo-haptics";
// import * as Linking from "expo-linking";

// const SosScreen = () => {
//   const [facing, setFacing] = useState<CameraType>("back");
//   const [permission, requestPermission] = useCameraPermissions();
//   const [contacts, setContacts] = useState<any[]>([]);
//   const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(
//     null
//   );
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [sosModalVisible, setSosModalVisible] = useState(false);
//   const [contactModalVisible, setContactModalVisible] = useState(false);

//   // Load contacts when component mounts
//   useEffect(() => {
//     const loadContacts = async () => {
//       const { status } = await Contacts.requestPermissionsAsync();
//       if (status === "granted") {
//         const { data } = await Contacts.getContactsAsync({
//           fields: [Contacts.Fields.PhoneNumbers],
//         });
//         setContacts(data);
//       }
//     };

//     loadContacts();
//   }, []);

//   // Handle selecting a phone number
//   const handleSelectPhoneNumber = (phoneNumber: string) => {
//     setSelectedPhoneNumber(phoneNumber);
//   };

//   // Play loud siren
//   const playSirenSound = async () => {
//     try {
//       const { sound } = await Audio.Sound.createAsync(
//         require("../../assets/sounds/siren.mp3") // Update path as needed
//       );
//       setSound(sound);
//       await sound.playAsync();

//       // Auto-stop after 10 seconds
//       setTimeout(() => {
//         stopSiren();
//       }, 10000);
//     } catch (error) {
//       console.error("Error playing siren:", error);
//     }
//   };

//   const stopSiren = async () => {
//     if (sound) {
//       await sound.stopAsync();
//       await sound.unloadAsync();
//       setSound(null);
//     }
//   };

//   const handleSOSPress = async () => {
//     console.log("SOS button pressed!");

//     try {
//       // Play siren and vibrate immediately
//       await playSirenSound();
//       Vibration.vibrate(5000);
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

//       // Request location permission
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         console.log("Permission to access location denied");
//         return;
//       }

//       // Get location
//       let userLocation = await Location.getCurrentPositionAsync({});

//       if (userLocation && userLocation.coords) {
//         const message = `🚨 I need help! My location: https://maps.google.com/?q=${userLocation.coords.latitude},${userLocation.coords.longitude}`;

//         if (selectedPhoneNumber) {
//           // Send SMS
//           const { result } = await SMS.sendSMSAsync(
//             [selectedPhoneNumber],
//             message
//           );

//           if (result === "sent") {
//             console.log("SMS sent successfully!");
//           } else {
//             console.log("SMS sending cancelled or failed");
//           }

//           // Send WhatsApp
//           const whatsappUrl = `whatsapp://send?phone=${selectedPhoneNumber}&text=${encodeURIComponent(
//             message
//           )}`;
//           Linking.openURL(whatsappUrl).catch((err) =>
//             console.error("Error opening WhatsApp: ", err)
//           );
//         } else {
//           console.log("No phone number selected");
//         }

//         // Show Modal after SOS is done
//         setSosModalVisible(true);
//       } else {
//         console.log("Could not retrieve location");
//       }
//     } catch (error) {
//       console.error("Error during SOS process:", error);
//     }
//   };

//   const handleCloseSosModal = () => {
//     setSosModalVisible(false);
//     setSelectedPhoneNumber(null); // 🧹 clear selected contact
//     stopSiren(); // 🛑 make sure siren stops (if still playing)
//   };

//   const toggleCameraFacing = () => {
//     setFacing((current) => (current === "back" ? "front" : "back"));
//   };

//   if (!permission) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>Checking permissions...</Text>
//       </View>
//     );
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>
//           We need your permission to show the camera
//         </Text>
//         <Button mode="contained" onPress={requestPermission}>
//           Grant Permission
//         </Button>
//       </View>
//     );
//   }

//   return (
//     <PaperProvider>
//       <View style={styles.container}>
//         <CameraView style={styles.camera} facing={facing}>
//           <View style={styles.overlay}>
//             {/* Flip Camera Button */}
//             <TouchableOpacity
//               style={styles.flipButton}
//               onPress={toggleCameraFacing}
//             >
//               <Text style={styles.flipText}>Flip</Text>
//             </TouchableOpacity>

//             {/* Select Contact Button */}
//             <Button
//               mode="contained"
//               onPress={() => setContactModalVisible(true)}
//               buttonColor="#1E90FF"
//               textColor="white"
//               style={{ marginBottom: 10 }}
//             >
//               Select Contact
//             </Button>

//             {/* Show Selected Phone Number */}
//             {selectedPhoneNumber && (
//               <Text style={styles.selectedNumber}>
//                 Selected: {selectedPhoneNumber}
//               </Text>
//             )}

//             {/* SOS Button */}
//             <Button
//               mode="contained"
//               onPress={handleSOSPress}
//               buttonColor="#ff4d4d"
//               textColor="white"
//               contentStyle={styles.sosButtonContent}
//               style={styles.sosButton}
//               disabled={!selectedPhoneNumber}
//             >
//               SOS
//             </Button>

//             {/* Stop Siren Button */}
//             {sound && (
//               <Button
//                 mode="contained"
//                 onPress={stopSiren}
//                 buttonColor="red"
//                 textColor="white"
//                 style={{ marginTop: 10 }}
//               >
//                 Stop Siren
//               </Button>
//             )}
//           </View>
//         </CameraView>

//         {/* Modal for SOS Sent */}
//         <Modal visible={sosModalVisible} transparent animationType="fade">
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalText}>🚨 SOS Alert Sent! 🚨</Text>
//               <Button onPress={handleCloseSosModal}>Close</Button>
//             </View>
//           </View>
//         </Modal>

//         {/* Modal for Contact Selection */}
//         <Modal visible={contactModalVisible} transparent animationType="slide">
//           <View style={styles.contactModalOverlay}>
//             <View style={styles.contactModalContent}>
//               <Text style={styles.modalText}>Select a Contact</Text>

//               <ScrollView style={{ maxHeight: 300, width: "100%" }}>
//                 {contacts.length > 0 ? (
//                   contacts.map((contact, index) => (
//                     <TouchableOpacity
//                       key={index}
//                       style={styles.contactButton}
//                       onPress={() => {
//                         handleSelectPhoneNumber(
//                           contact.phoneNumbers?.[0]?.number
//                         );
//                         setContactModalVisible(false);
//                       }}
//                     >
//                       <Text style={styles.contactName}>{contact.name}</Text>
//                     </TouchableOpacity>
//                   ))
//                 ) : (
//                   <Text style={{ textAlign: "center", marginVertical: 10 }}>
//                     No contacts found
//                   </Text>
//                 )}
//               </ScrollView>

//               <Button
//                 mode="text"
//                 onPress={() => setContactModalVisible(false)}
//                 style={{ marginTop: 10 }}
//               >
//                 Cancel
//               </Button>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </PaperProvider>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   camera: {
//     flex: 1,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: "flex-end",
//     alignItems: "center",
//     paddingBottom: 40,
//     backgroundColor: "rgba(0, 0, 0, 0.2)",
//   },
//   flipButton: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//     backgroundColor: "#00000070",
//     padding: 10,
//     borderRadius: 8,
//   },
//   flipText: {
//     color: "#fff",
//     fontSize: 16,
//   },
//   sosButton: {
//     marginTop: 20,
//   },
//   sosButtonContent: {
//     height: 50,
//     width: 200,
//   },
//   message: {
//     textAlign: "center",
//     margin: 20,
//     fontSize: 16,
//     color: "white",
//   },
//   contactsContainer: {
//     maxHeight: 150,
//     width: "90%",
//     backgroundColor: "#ffffff90",
//     borderRadius: 8,
//     marginBottom: 10,
//     padding: 10,
//   },
//   contactButton: {
//     paddingVertical: 6,
//   },
//   contactName: {
//     fontSize: 16,
//     color: "#000",
//   },
//   selectedNumber: {
//     color: "white",
//     fontSize: 16,
//     marginVertical: 8,
//   },
//   contactsTitle: {
//     fontSize: 20,
//     color: "white",
//     marginBottom: 10,
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     padding: 30,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   modalText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   contactModalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   contactModalContent: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 10,
//     width: "80%",
//     alignItems: "center",
//   },
// });

// export default SosScreen;

// OR
// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { useCameraPermissions } from 'expo-camera';

// const CameraPermissionTest = () => {
//   const [permission, requestPermission] = useCameraPermissions();

//   useEffect(() => {
//     if (permission?.granted) {
//       console.log("Camera permission granted");
//     }
//   }, [permission]);

//   if (!permission) {
//     return <Text>Checking permissions...</Text>;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text>No camera permission</Text>
//         <Button title="Grant Permission" onPress={requestPermission} />
//       </View>
//     );
//   }

//   return <Text>Camera permission granted!</Text>;
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default CameraPermissionTest;

// OR
// import React, { useState, useRef } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
// import { Button, Provider as PaperProvider } from 'react-native-paper';
// import { Camera, CameraType, useCameraPermissions } from 'expo-camera';
// import { Audio } from 'expo-av';
// import * as Location from 'expo-location';
// import * as Sharing from 'expo-sharing';
// import * as SMS from 'expo-sms';
// import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';

// const SosScreen = () => {
//   const [facing, setFacing] = useState<CameraType>('back');
//   const [permission, requestPermission] = useCameraPermissions();
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const cameraRef = useRef<Camera | null>(null);

//   const handleSOSPress = async () => {
//     console.log('SOS button pressed!');
//     // Get the current location
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status === 'granted') {
//       const location = await Location.getCurrentPositionAsync({});
//       console.log('Current location:', location.coords);
//       // Send location to contacts (implement the actual sending logic here)
//     }

//     // Play the siren sound to alert people
//     if (sound) {
//       await sound.playAsync();
//     }

//     // Capture a photo and send it
//     if (cameraRef.current) {
//       const photo = await cameraRef.current.takePictureAsync();
//       console.log('Photo taken:', photo.uri);

//       // Send via WhatsApp/SMS/Email (this will need implementation for each platform)
//       // You can use expo-sharing or expo-sms to send the captured photo/video
//       await sendMedia(photo.uri);
//     }
//   };

//   const sendMedia = async (uri: string) => {
//     // Example sending via SMS
//     const { result } = await SMS.sendSMSAsync(
//       ['+1234567890'], // replace with emergency contact numbers
//       'Emergency! Check the photo I sent.'
//     );
//     console.log('SMS send result:', result);

//     // If using WhatsApp, you can use expo-sharing to send the media
//     if (await Sharing.isAvailableAsync()) {
//       await Sharing.shareAsync(uri);
//     }
//   };

//   const toggleCameraFacing = () => {
//     setFacing((current) => (current === 'back' ? 'front' : 'back'));
//   };

//   const loadSirenSound = async () => {
//     const { sound } = await Audio.Sound.createAsync(
//       require('./assets/siren.mp3'), // Path to your siren sound file
//       { shouldPlay: false }
//     );
//     setSound(sound);
//   };

//   const pickImage = async () => {
//     let result = await launchImageLibraryAsync({
//       mediaTypes: MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });
//     if (!result.cancelled) {
//       console.log('Selected image:', result.uri);
//       await sendMedia(result.uri);
//     }
//   };

//   if (!permission) {
//     return <View style={styles.container}><Text style={styles.message}>Checking permissions...</Text></View>;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>We need your permission to show the camera</Text>
//         <Button mode="contained" onPress={requestPermission}>Grant Permission</Button>
//       </View>
//     );
//   }

//   return (
//     <PaperProvider>
//       <View style={styles.container}>
//         <Camera ref={cameraRef} style={styles.camera} type={facing}>
//           <View style={styles.overlay}>
//             <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
//               <Text style={styles.flipText}>Flip</Text>
//             </TouchableOpacity>
//             <Button
//               mode="contained"
//               onPress={handleSOSPress}
//               buttonColor="#ff4d4d"
//               textColor="white"
//               contentStyle={styles.sosButtonContent}
//               style={styles.sosButton}
//             >
//               SOS
//             </Button>
//             <Button
//               mode="contained"
//               onPress={pickImage}
//               buttonColor="#4caf50"
//               textColor="white"
//               contentStyle={styles.sosButtonContent}
//               style={styles.sosButton}
//             >
//               Pick Image
//             </Button>
//           </View>
//         </Camera>
//       </View>
//     </PaperProvider>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   camera: {
//     flex: 1,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     paddingBottom: 40,
//     backgroundColor: 'transparent',
//   },
//   flipButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     backgroundColor: '#00000070',
//     padding: 10,
//     borderRadius: 8,
//   },
//   flipText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   sosButton: {
//     marginTop: 20,
//   },
//   sosButtonContent: {
//     height: 50,
//     width: 200,
//   },
//   message: {
//     textAlign: 'center',
//     margin: 20,
//     fontSize: 16,
//   },
// });

// export default SosScreen;

