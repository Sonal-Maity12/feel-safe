// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Linking,
//   Alert,
//   Platform,
//   Share,
// } from "react-native";
// import * as Location from "expo-location";
// import MapView, { Marker } from "react-native-maps";
// import { Button } from "react-native-paper";

// const LiveLocationPage: React.FC = () => {
//   const [location, setLocation] = useState<Location.LocationObject | null>(null);
//   const [watching, setWatching] = useState(false);
//   const [permissionDenied, setPermissionDenied] = useState(false);
//   const watchId = useRef<Location.LocationSubscription | null>(null);

//   const requestPermissions = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission denied", "Location access is required.");
//       setPermissionDenied(true);
//       return false;
//     }
//     setPermissionDenied(false);
//     return true;
//   };

//   const startLiveLocation = async () => {
//     const granted = await requestPermissions();
//     if (!granted) return;

//     setWatching(true);

//     const subscription = await Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.High,
//         timeInterval: 5000,
//         distanceInterval: 10,
//       },
//       (loc) => {
//         setLocation(loc);
//       }
//     );

//     watchId.current = subscription;
//   };

//   const stopLiveLocation = () => {
//     if (watchId.current) {
//       watchId.current.remove();
//       watchId.current = null;
//     }
//     setWatching(false);
//   };

//   const shareCurrentLocation = async () => {
//     if (!location) return;
//     const { latitude, longitude } = location.coords;
//     const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
//     try {
//       await Share.share({
//         message: `Here's my current location: ${googleMapsUrl}`,
//       });
//     } catch {
//       Alert.alert("Error", "Could not share location.");
//     }
//   };

//   useEffect(() => {
//     return () => {
//       stopLiveLocation();
//     };
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}> Sharing Live Location </Text>

//       {permissionDenied ? (
//         <Text style={styles.info}>
//           Location permission denied. Please enable it in settings.
//         </Text>
//       ) : !location ? (
//         <Text style={styles.info}>Waiting for location...</Text>
//       ) : (
//         <MapView
//           style={styles.map}
//           region={{
//             latitude: location.coords.latitude,
//             longitude: location.coords.longitude,
//             latitudeDelta: 0.005,
//             longitudeDelta: 0.005,
//           }}
//         >
//           <Marker
//             coordinate={{
//               latitude: location.coords.latitude,
//               longitude: location.coords.longitude,
//             }}
//             title="You're here"
//             pinColor="red"
//           />
//         </MapView>
//       )}

//       <View style={styles.buttons}>
//         {!watching ? (
//           <Button mode="contained" onPress={startLiveLocation}>
//             Start Sharing
//           </Button>
//         ) : (
//           <Button mode="contained" onPress={stopLiveLocation} buttonColor="red">
//             Stop Sharing
//           </Button>
//         )}

//         <Button onPress={shareCurrentLocation} style={{ marginTop: 10 }}>
//           Share Current Location
//         </Button>
//       </View>
//     </View>
//   );
// };

// export default LiveLocationPage;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: Platform.OS === "ios" ? 60 : 40,
//     paddingHorizontal: 16,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   info: {
//     textAlign: "center",
//     color: "#777",
//     marginVertical: 20,
//   },
//   map: {
//     flex: 1,
//     borderRadius: 10,
//     minHeight: 300,
//   },
//   buttons: {
//     marginTop: 20,
//     paddingBottom: 20,
//   },
// });

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Button } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";

const LiveLocationPage: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [watching, setWatching] = useState(false);
  const [duration, setDuration] = useState(60);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(duration * 60);
  const [lastKnownLocation, setLastKnownLocation] =
    useState<Location.LocationObject | null>(null);
  const watchId = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contacts.Contact[]>(
    []
  );

  const getContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      setContacts(data.filter((c) => c.phoneNumbers?.length));
    }
  };

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location access is required.");
      return false;
    }
    return true;
  };

  const saveToHistory = async (loc: Location.LocationObject) => {
    console.log("Saved to history:", loc.coords);
  };

  // Updated shareLocation function with default platform set to WhatsApp
  const shareLocation = (
    platform: "whatsapp" | "sms" | "telegram" | "facebook" | "gmail" | "default",
    loc: Location.LocationObject
  ) => {
    const { latitude, longitude } = loc.coords;
    const message = `I'm here: https://www.google.com/maps?q=${latitude},${longitude}\nContact me at: +919547256319 or +919641221680`;

    // Default to WhatsApp if platform is "default"
    if (platform === "default" || platform === "whatsapp") {
      const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open WhatsApp.");
      });
      return;
    }

    if (platform === "sms") {
      selectedContacts.forEach((contact) => {
        const phoneNumber = contact.phoneNumbers?.[0]?.number;
        if (phoneNumber) {
          const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
          Linking.openURL(smsUrl).catch(() => {
            Alert.alert("Error", `Could not send SMS to ${contact.name}`);
          });
        }
      });
      return;
    }

    let url = "";
    if (platform === "telegram") {
      url = `tg://msg?text=${encodeURIComponent(message)}`;
    } else if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        `https://www.google.com/maps?q=${latitude},${longitude}`
      )}`;
    } else if (platform === "gmail") {
      url = `mailto:?subject=My Location&body=${encodeURIComponent(message)}`;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", `Could not open ${platform} app.`);
    });
  };

  const startLiveLocation = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    setWatching(true);

    try {
      watchId.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          if (!loc || !loc.coords) {
            console.warn("Invalid location received", loc);
            return;
          }
          setLocation(loc);
          setLastKnownLocation(loc);
          shareLocation("whatsapp", loc);
          saveToHistory(loc);
        }
      );
    } catch (e) {
      console.error("Error starting location watch:", e);
    }

    const durationToUse = selectedDuration ?? 60;
    setCountdown(durationToUse * 60);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopLiveLocation();
          Alert.alert(
            "Live Sharing Ended",
            `Stopped after ${durationToUse} minutes.`
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopLiveLocation = () => {
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setWatching(false);
  };

  const setTime = (newDuration: number) => {
    setDuration(newDuration);
    setSelectedDuration(newDuration);
    setCountdown(newDuration * 60);
  };

  useEffect(() => {
    return () => {
      stopLiveLocation();
    };
  }, []);

  const locationToShow = location ?? lastKnownLocation;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Live Location Sharing</Text>

      {locationToShow ? (
        <MapView
          style={styles.map}
          region={{
            latitude: locationToShow.coords.latitude,
            longitude: locationToShow.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            coordinate={{
              latitude: locationToShow.coords.latitude,
              longitude: locationToShow.coords.longitude,
            }}
            title={watching ? "You're here (Live)" : "Last Known Location"}
            pinColor={watching ? "red" : "gray"}
          />
        </MapView>
      ) : (
        <Text style={styles.info}>Waiting for location...</Text>
      )}

      {watching && (
        <Text style={styles.countdown}>
          Time left: {Math.floor(countdown / 60)}:
          {(countdown % 60).toString().padStart(2, "0")}
        </Text>
      )}

      {!watching && (
        <View style={styles.durationButtons}>
          {[15, 30, 60].map((d) => (
            <Button
              key={d}
              mode={selectedDuration === d ? "contained" : "outlined"}
              onPress={() => setTime(d)}
              style={styles.buttonGap}
            >
              {d} min
            </Button>
          ))}
        </View>
      )}
      <View style={styles.buttons}>
        {!watching ? (
          <Button mode="contained" onPress={startLiveLocation}>
            Start Sharing
          </Button>
        ) : (
          <Button mode="contained" onPress={stopLiveLocation} buttonColor="red">
            Stop Sharing
          </Button>
        )}

        {locationToShow && (
          <View style={{ marginTop: 10 }}>
            <Button
              onPress={() => shareLocation("sms", locationToShow)}
              mode="outlined"
              style={styles.buttonGap}
              icon="message"
            >
              SMS
            </Button>
            <Button
              onPress={() => shareLocation("telegram", locationToShow)}
              mode="outlined"
              style={styles.buttonGap}
              icon={() => (
                <FontAwesome name="telegram" size={20} color="#0088cc" />
              )}
            >
              Telegram
            </Button>

            <Button
              onPress={() => shareLocation("facebook", locationToShow)}
              mode="outlined"
              style={styles.buttonGap}
              icon="facebook"
            >
              Facebook
            </Button>
            <Button
              onPress={() => shareLocation("gmail", locationToShow)}
              mode="outlined"
              style={styles.buttonGap}
              icon="email"
            >
              Gmail
            </Button>
          </View>
        )}
      </View>

      {/* 👉 Paste below this line */}
      <View>
        <Button onPress={getContacts}>Select Contacts</Button>
        <ScrollView>
          {contacts.map((contact) => (
            <Button
              key={contact.id}
              onPress={() => {
                if (selectedContacts.includes(contact)) {
                  setSelectedContacts(
                    selectedContacts.filter((c) => c.id !== contact.id)
                  );
                } else {
                  setSelectedContacts([...selectedContacts, contact]);
                }
              }}
              mode={
                selectedContacts.includes(contact) ? "contained" : "outlined"
              }
              style={{ marginVertical: 2 }}
            >
              {contact.name}
            </Button>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default LiveLocationPage;

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  info: {
    textAlign: "center",
    color: "#777",
    marginVertical: 20,
  },
  map: {
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttons: {
    marginTop: 20,
  },
  countdown: {
    textAlign: "center",
    marginVertical: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF0000",
  },
  durationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 10,
  },
  buttonGap: {
    marginVertical: 5,
  },
});
