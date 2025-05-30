import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Network from "expo-network";
import * as SMS from "expo-sms";
import MapView, { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const NearestPoliceStation = () => {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const pulseAnim = useRef(new Animated.Value(1)).current;
  let subscriber: Location.LocationSubscription | null = null;

  useEffect(() => {
    const animatePulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const startWatchingLocation = async () => {
      try {
        const { isConnected, isInternetReachable } =
          await Network.getNetworkStateAsync();
        if (!isConnected || !isInternetReachable) {
          setErrorMsg("No internet connection. Please check your network.");
          return;
        }

        const isLocationEnabled = await Location.hasServicesEnabledAsync();
        if (!isLocationEnabled) {
          setErrorMsg("Location services are disabled. Please enable GPS.");
          return;
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied.");
          return;
        }

        // Start pulse animation after permissions
        animatePulse();

        // Start watching location
        subscriber = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          (loc) => {
            setLocation(loc.coords);
            setRegion({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        );
      } catch (err) {
        setErrorMsg("Something went wrong while accessing location.");
        console.error(err);
      }
    };

    startWatchingLocation();

    // Cleanup function for unmounting
    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, []);

  const handleCenterOnMe = () => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const openDeviceMaps = () => {
    if (!location) return;

    const { latitude, longitude } = location;

    const url = Platform.select({
      ios: `http://maps.apple.com/?q=police+station&ll=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=police+station`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error("Error opening map:", err);
        setErrorMsg("Unable to open the maps app.");
      });
    }
  };

  const sendLocationToPolice = async () => {
    if (!location) {
      setErrorMsg("Location not available yet.");
      return;
    }

    const { latitude, longitude } = location;
    const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const message = `I need help. My location is here: ${locationLink}`;

    const policeNumber = "03325932647"; // Replace with real number if needed

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      SMS.sendSMSAsync([policeNumber], message);
    } else {
      setErrorMsg("SMS service is not available on this device.");
    }
  };

  return (
    <LinearGradient colors={["#e3f2fd", "#ffffff"]} style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="local-police" size={28} color="#1565c0" />
        <Text style={styles.headerText}>Nearest Police Station</Text>
      </View>

      {errorMsg ? (
        <View style={styles.messageBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : location && region ? (
        <>
          <MapView
            style={styles.map}
            region={region}
            showsUserLocation={true}
            followsUserLocation={true}
            showsMyLocationButton={true}
          >
            <Marker coordinate={region}>
              <View style={styles.pulsingMarkerWrapper}>
                <Animated.View
                  style={[
                    styles.pulse,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <View style={styles.markerDot} />
              </View>
            </Marker>
          </MapView>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.centerButton}
              onPress={handleCenterOnMe}
            >
              <MaterialIcons name="my-location" size={24} color="#fff" />
              <Text style={styles.centerText}>Center on Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={openDeviceMaps}
            >
              <MaterialIcons name="location-searching" size={24} color="#fff" />
              <Text style={styles.refreshText}>Open Nearby Police Stations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={sendLocationToPolice}
            >
              <MaterialIcons name="send" size={24} color="#fff" />
              <Text style={styles.refreshText}>Send My Location to Police</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1565c0" />
          <Text style={styles.loadingText}>Locating you on the map...</Text>
        </View>
      )}
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Adjust this padding as needed to ensure it doesn't push the map down
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#e3f2fd",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0d47a1",
    marginLeft: 10,
  },
  mapContainer: {
    flex: 1, // Allow the map to take the remaining space
    width: "100%",
    height: "60%", // Use a percentage height instead of a fixed height
  },
  map: {
    width: "100%",
    height: 300, // Fixed height for the map (adjust as needed)
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1565c0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 15,
    elevation: 2,
  },
  centerText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1565c0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 15,
    elevation: 2,
  },
  refreshText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  pulsingMarkerWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
  },
  pulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(21, 101, 192, 0.3)",
    position: "absolute",
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1565c0",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 2,
  },
  customUserLocationMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1565c0",
    borderColor: "#fff",
    borderWidth: 2,
  },
  messageBox: {
    backgroundColor: "#ffebee",
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#1565c0",
  },
});

export default NearestPoliceStation;
