// import React, { useState, useEffect } from "react";
// import { View, StyleSheet, Image, Text, TouchableOpacity, Alert, Modal } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Button, Title, TextInput } from "react-native-paper";
// import { useRouter } from "expo-router";
// import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Function to get user credentials from AsyncStorage
// const getUserCredentials = async () => {
//   try {
//     const userData = await AsyncStorage.getItem("@user_credentials");
//     return userData ? JSON.parse(userData) : null; // Parse and return user data
//   } catch (error) {
//     console.error("Failed to retrieve user credentials:", error);
//     return null;
//   }
// };

// export default function ProfileScreen() {
//   const router = useRouter();
//   const [username, setUsername] = useState<string>("");
//   const [profilePicture, setProfilePicture] = useState<string | null>(null);
//   const [bio, setBio] = useState<string>("Tell us about yourself.");
//   const [isEditing, setIsEditing] = useState<boolean>(false); // To toggle edit mode
//   const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false); // To toggle modal
//   const [isProcessing, setIsProcessing] = useState<boolean>(false); // For loading state

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const saved = await getUserCredentials();
//         if (saved) {
//           setUsername(saved.username || "Guest");
//           setProfilePicture(saved.profilePicture || null);
//           setBio(saved.bio || "Tell us about yourself.");
//         }
//       } catch (error) {
//         console.error("Failed to fetch user data:", error);
//       }
//     };
//     fetchUserData();
//   }, []);

//   // Save changes made in edit mode
//   const saveProfileChanges = async () => {
//     try {
//       // Ensure bio, username, and profile picture are set before saving
//       if (!username || !bio) {
//         Alert.alert("Error", "Username and Bio are required.");
//         return;
//       }
//       // Save the profile changes (You should integrate AsyncStorage here)
//       setIsEditing(false); // Exit edit mode after saving
//       Alert.alert("Profile Updated", "Your profile has been updated successfully!");
//     } catch (error) {
//       console.error("Failed to save user data:", error);
//       Alert.alert("Error", "Failed to update profile.");
//     }
//   };

//   // Open the options modal for selecting image
//   const openImageOptionsModal = () => {
//     setShowOptionsModal(true);
//   };

//   // Close the modal
//   const closeImageOptionsModal = () => {
//     setShowOptionsModal(false);
//   };

//   // Handle Camera option
//   const takePhoto = async () => {
//     setIsProcessing(true);
//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: false,
//       quality: 1,
//     });
//     if (!result.canceled) {
//       manipulateImage(result.assets[0].uri);
//     }
//     setIsProcessing(false);
//     closeImageOptionsModal();
//   };

//   // Handle Gallery option
//   const pickImageFromGallery = async () => {
//     setIsProcessing(true);
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         quality: 1,
//       });

//       if (!result.canceled && result.assets?.length > 0) {
//         const uri = result.assets[0].uri;
//         manipulateImage(uri);
//       }
//     } catch (error) {
//       console.error("Error picking image from gallery:", error);
//     }
//     setIsProcessing(false);
//     closeImageOptionsModal();
//   };

//   // Handle AI Avatar generation
//   const generateAIAvatar = async () => {
//     setIsProcessing(true);
//     // Replace this with actual AI Avatar generation logic
//     Alert.alert("Feature Under Development", "AI Avatar generation is coming soon.");
//     setIsProcessing(false);
//     closeImageOptionsModal();
//   };

//   // Image manipulation (resize, compress, and format)
//   const manipulateImage = async (uri: string) => {
//     try {
//       const manipulated = await ImageManipulator.manipulateAsync(
//         uri, // the image URI you want to manipulate
//         [{ resize: { width: 300 } }], // resize the image to 300px width
//         {
//           compress: 0.7, // reduce image quality to 70%
//           format: ImageManipulator.SaveFormat.JPEG, // save as JPEG format
//         }
//       );
//       setProfilePicture(manipulated.uri); // set the manipulated image URI to state
//     } catch (error) {
//       console.error("Error manipulating image: ", error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Title style={styles.title}>Profile</Title>

//       {/* Profile Picture Section */}
//       <TouchableOpacity onPress={openImageOptionsModal} disabled={isProcessing}>
//         <View style={styles.profilePictureContainer}>
//           {profilePicture ? (
//             <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
//           ) : (
//             <Ionicons
//               name="person-circle-outline"
//               size={80}
//               color="gray"
//               accessibilityLabel="Select profile picture"
//             />
//           )}
//         </View>
//       </TouchableOpacity>

//       {/* Username Section */}
//       {isEditing ? (
//         <TextInput
//           label="Username"
//           value={username}
//           onChangeText={setUsername}
//           style={styles.input}
//         />
//       ) : (
//         <Text style={styles.usernameText}>{username}</Text>
//       )}

//       {/* Bio Section */}
//       {isEditing ? (
//         <TextInput
//           label="Bio"
//           value={bio}
//           onChangeText={setBio} // Allows you to change the bio
//           multiline
//           style={[styles.input, styles.bioInput]}
//         />
//       ) : (
//         <Text style={styles.bioText}>{bio}</Text> // Display current bio when not editing
//       )}

//       {/* Edit and Save Button */}
//       {isEditing ? (
//         <Button mode="contained" onPress={saveProfileChanges} style={styles.button}>
//           Save
//         </Button>
//       ) : (
//         <Button mode="outlined" onPress={() => setIsEditing(true)} style={styles.button}>
//           Edit Profile
//         </Button>
//       )}

//       {/* Logout Button */}
//       <Button mode="contained" onPress={() => router.push("/login")} style={[styles.button, styles.logoutButton]}>
//         Logout
//       </Button>

//       {/* Modal for image selection */}
//       <Modal
//         visible={showOptionsModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={closeImageOptionsModal}
//       >
//         <View style={styles.modalBackground}>
//           <View style={styles.modalContainer}>
//             <Button mode="outlined" onPress={takePhoto} style={styles.modalButton} disabled={isProcessing}>
//               📸 Take a Photo
//             </Button>
//             <Button mode="outlined" onPress={pickImageFromGallery} style={styles.modalButton} disabled={isProcessing}>
//               🖼️ Choose from Gallery
//             </Button>
//             <Button mode="outlined" onPress={generateAIAvatar} style={styles.modalButton} disabled={isProcessing}>
//               🤖 Generate AI Avatar
//             </Button>
//             <Button mode="outlined" onPress={closeImageOptionsModal} style={styles.modalButton}>
//               Cancel
//             </Button>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 16,
//     backgroundColor: "#fff",
//   },
//   title: {
//     textAlign: "center",
//     marginBottom: 20,
//     fontSize: 30,
//     color: "purple",
//     width: 100,
//   },
//   profilePictureContainer: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   profilePicture: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//   },
//   usernameText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "black",
//     marginBottom: 10,
//   },
//   bioText: {
//     fontSize: 16,
//     color: "gray",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     width: "100%",
//     marginBottom: 20,
//   },
//   bioInput: {
//     height: 100,
//     textAlignVertical: "top",
//   },
//   button: {
//     width: "100%",
//     marginBottom: 10,
//   },
//   logoutButton: {
//     backgroundColor: "red",
//   },
//   modalBackground: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContainer: {
//     backgroundColor: "white",
//     padding: 20,
//     borderRadius: 10,
//     width: "80%",
//   },
//   modalButton: {
//     marginBottom: 10,
//   },
// });

// OR
import React, { useState, useEffect } from "react";
// import { View, StyleSheet, Image, Text, TouchableOpacity, Alert, Modal } from "react-native";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ImageBackground,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Button, Title, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Function to get user credentials from AsyncStorage
const getUserCredentials = async () => {
  try {
    const userData = await AsyncStorage.getItem("@user_credentials");
    return userData ? JSON.parse(userData) : null; // Parse and return user data
  } catch (error) {
    console.error("Failed to retrieve user credentials:", error);
    return null;
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [bio, setBio] = useState<string>("Tell us about yourself.");
  const [isEditing, setIsEditing] = useState<boolean>(false); // To toggle edit mode
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false); // To toggle modal
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // For loading state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const saved = await getUserCredentials();
        if (saved) {
          setUsername(saved.username || "Guest");
          setProfilePicture(saved.profilePicture || null);
          setBio(saved.bio || "Tell us about yourself.");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Save changes made in edit mode
  const saveProfileChanges = async () => {
    try {
      if (!username.trim() || !bio.trim()) {
        Alert.alert("Error", "Username and Bio are required.");
        return;
      }

      // Save the profile changes to AsyncStorage
      const userData = {
        username,
        profilePicture,
        bio,
      };

      await AsyncStorage.setItem("@user_credentials", JSON.stringify(userData));
      setIsEditing(false);
      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully!"
      );
    } catch (error) {
      console.error("Failed to save user data:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  // Open the options modal for selecting image
  const openImageOptionsModal = () => {
    setShowOptionsModal(true);
  };

  // Close the modal
  const closeImageOptionsModal = () => {
    setShowOptionsModal(false);
  };

  // Handle Camera option
  const takePhoto = async () => {
    setIsProcessing(true);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      manipulateImage(result.assets[0].uri);
    }
    setIsProcessing(false);
    closeImageOptionsModal();
  };

  // Handle Gallery option
  const pickImageFromGallery = async () => {
    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        manipulateImage(uri);
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);
    }
    setIsProcessing(false);
    closeImageOptionsModal();
  };

  // Handle AI Avatar generation
  const generateAIAvatar = async () => {
    setIsProcessing(true);
    // Replace this with actual AI Avatar generation logic
    Alert.alert(
      "Feature Under Development",
      "AI Avatar generation is coming soon."
    );
    setIsProcessing(false);
    closeImageOptionsModal();
  };

  // Image manipulation (resize, compress, and format)
  const manipulateImage = async (uri: string) => {
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri, // the image URI you want to manipulate
        [{ resize: { width: 300 } }], // resize the image to 300px width
        {
          compress: 0.7, // reduce image quality to 70%
          format: ImageManipulator.SaveFormat.JPEG, // save as JPEG format
        }
      );
      setProfilePicture(manipulated.uri); // set the manipulated image URI to state
    } catch (error) {
      console.error("Error manipulating image: ", error);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/profile-background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Title style={styles.title}>Profile</Title>

        {/* Profile Picture Section */}
        <TouchableOpacity
          onPress={openImageOptionsModal}
          disabled={isProcessing}
        >
          <View style={styles.profilePictureContainer}>
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.profilePicture}
              />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={80}
                color="gray"
                accessibilityLabel="Select profile picture"
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Username Section */}
        {isEditing ? (
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
        ) : (
          <Text style={styles.usernameText}>{username}</Text>
        )}

        {/* Bio Section */}
        {isEditing ? (
          <TextInput
            label="Bio"
            value={bio}
            onChangeText={setBio} // Allows you to change the bio
            multiline
            style={[styles.input, styles.bioInput]}
          />
        ) : (
          <Text style={styles.bioText}>{bio}</Text> // Display current bio when not editing
        )}

        {/* Edit and Save Button */}
        {isEditing ? (
          <Button
            mode="contained"
            onPress={saveProfileChanges}
            style={styles.button}
          >
            Save
          </Button>
        ) : (
          <Button
            mode="outlined"
            onPress={() => setIsEditing(true)}
            style={styles.button}
          >
            Edit Profile
          </Button>
        )}

        {/* Logout Button */}
        <Button
          mode="contained"
          onPress={() => router.push("/login")}
          style={[styles.button, styles.logoutButton]}
        >
          Logout
        </Button>

        {/* Modal for image selection */}
        <Modal
          visible={showOptionsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeImageOptionsModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Button
                mode="outlined"
                onPress={takePhoto}
                style={styles.modalButton}
                disabled={isProcessing}
              >
                📸 Take a Photo
              </Button>
              <Button
                mode="outlined"
                onPress={pickImageFromGallery}
                style={styles.modalButton}
                disabled={isProcessing}
              >
                🖼 Choose from Gallery
              </Button>
              <Button
                mode="outlined"
                onPress={generateAIAvatar}
                style={styles.modalButton}
                disabled={isProcessing}
              >
                🤖 Generate AI Avatar
              </Button>
              <Button
                mode="outlined"
                onPress={closeImageOptionsModal}
                style={styles.modalButton}
              >
                Cancel
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.85)", // make it slightly transparent white
    margin: 16,
    borderRadius: 20,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  input: {
    width: "100%",
    marginBottom: 20,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    width: "100%",
    marginBottom: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  background: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 30,
    color: "purple",
  },
  usernameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#e63946",
  },
  modalButton: {
    marginBottom: 10,
    backgroundColor: "#f4a261",
  },
});
