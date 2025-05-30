import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Text, Button, Card, Paragraph, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";

export default function HomePage() {
  const router = useRouter();

  // State driving whether we have at least one emergency contact
  const [hasEmergencyContact, setHasEmergencyContact] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/women_safety.jpg")}
        style={styles.background}
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>Feel Safe</Text>

            {/* Demo toggle button */}
            <Button
              mode="outlined"
              onPress={() => setHasEmergencyContact((v) => !v)}
              style={{ marginBottom: 20 }}
            >
              {hasEmergencyContact
                ? "Hide Emergency Contact Card"
                : "Show Emergency Contact Card"}
            </Button>

            {/* Conditional Emergency Contact Section */}
            {hasEmergencyContact ? (
              <Card style={[styles.card, { backgroundColor: "#FFF0F0" }]}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.iconWrapper,
                        { backgroundColor: "#DC3545" },
                      ]}
                    >
                      <IconButton
                        icon="phone"
                        size={28}
                        iconColor="#fff"
                        accessibilityLabel="Emergency Contact"
                      />
                    </View>
                    <Text style={styles.cardTitle}>Emergency Contact</Text>
                  </View>
                  <Paragraph style={styles.cardText}>
                    Quickly call emergency services or trusted contacts in case
                    of danger.
                  </Paragraph>
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode="contained"
                    icon="phone"
                    style={[styles.cardButton, { backgroundColor: "#DC3545" }]}
                    onPress={() => router.push("/emergency-contact")}
                  >
                    Call Now
                  </Button>
                </Card.Actions>
              </Card>
            ) : (
              <Text style={styles.fallbackText}>
                No emergency contacts added yet.
              </Text>
            )}

            {/* Location Sharing Section */}
            <Card style={[styles.card, { backgroundColor: "#E8F9F4" }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.iconWrapper, { backgroundColor: "#1ABC9C" }]}
                  >
                    <IconButton
                      icon="map-marker"
                      size={28}
                      iconColor="#fff"
                      accessibilityLabel="Live Location"
                    />
                  </View>
                  <Text style={styles.cardTitle}>Live Location</Text>
                </View>
                <Paragraph style={styles.cardText}>
                  Share your live location with trusted people in case of
                  emergency.
                </Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  icon="share-variant"
                  style={[styles.cardButton, { backgroundColor: "#1ABC9C" }]}
                  onPress={() => router.push("/live-location")}
                >
                  Share Location
                </Button>
              </Card.Actions>
            </Card>

            {/* Nearest Police Station Section */}
            <Card style={[styles.card, { backgroundColor: "#EAF8FF" }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconWrapper,
                      { backgroundColor: "#2196F320" },
                    ]}
                  >
                    <IconButton
                      icon="shield"
                      size={28}
                      iconColor="#2196F3"
                      accessibilityLabel="Nearest Police Station"
                    />
                  </View>
                  <Text style={[styles.cardTitle, { color: "#003C8F" }]}>
                    Nearest Police Station
                  </Text>
                </View>
                <Paragraph style={styles.cardText}>
                  Track your nearest police station in case of any trouble.
                </Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  icon="map-marker-path"
                  buttonColor="#2196F3"
                  textColor="#fff"
                  style={styles.cardButton}
                  onPress={() => router.push("/nearest-police-stations")}
                >
                  Track Now
                </Button>
              </Card.Actions>
            </Card>

            {/* Emergency Notification Section */}
            <Card style={[styles.card, { backgroundColor: "#FFEAEA" }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconWrapper,
                      { backgroundColor: "#FF6B6B20" },
                    ]}
                  >
                    <IconButton
                      icon="bell-alert"
                      size={28}
                      iconColor="#FF6B6B"
                      accessibilityLabel="Send Alert"
                    />
                  </View>
                  <Text style={[styles.cardTitle, { color: "#B00020" }]}>
                    Send Alert
                  </Text>
                </View>
                <Paragraph style={styles.cardText}>
                  Notify authorities immediately in case of emergency or danger.
                </Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  buttonColor="#B00020"
                  textColor="#fff"
                  style={styles.cardButton}
                  icon="bell"
                  onPress={() => router.push("/emergency-notification")}
                >
                  Alert Now
                </Button>
              </Card.Actions>
            </Card>

            {/* Emergency Community Support Section */}
            <Card style={[styles.card, { backgroundColor: "#E3FDFD" }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconWrapper,
                      { backgroundColor: "#03695FB8" },
                    ]}
                  >
                    <IconButton
                      icon="account-group"
                      size={28}
                      iconColor="#fff"
                    />
                  </View>
                  <Text style={styles.cardTitle}>Community Support</Text>
                </View>
                <Paragraph style={styles.cardText}>
                  Quickly reach out to emergency services, chat with someone, or
                  connect with a trusted person for help if you're in danger.
                </Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  icon="account-group"
                  style={[styles.cardButton, { backgroundColor: "#03695FB8" }]}
                  onPress={() => router.push("/community-support")}
                >
                  Support Line
                </Button>
              </Card.Actions>
            </Card>

            {/* Safety Resources Section */}
            <Card style={[styles.card, { backgroundColor: "#FFF5EC" }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.iconWrapper, { backgroundColor: "#A37767" }]}
                  >
                    <IconButton
                      icon="book-open-page-variant"
                      size={28}
                      iconColor="#fff"
                      accessibilityLabel="Safety Resources"
                    />
                  </View>
                  <Text style={styles.cardTitle}>Safety Resources</Text>
                </View>
                <Paragraph style={styles.cardText}>
                  Access safety tips, local emergency resources, and
                  self-defense advice.
                </Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  icon="book"
                  style={[styles.cardButton, { backgroundColor: "#A37767" }]}
                  onPress={() => router.push("/safety-resource")}
                >
                  View Resources
                </Button>
              </Card.Actions>
            </Card>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    position: "relative",
    zIndex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    zIndex: 2,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  fallbackText: {
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 15,
    elevation: 5, // Android shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5, // iOS shadow
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconWrapper: {
    borderRadius: 50,
    padding: 8,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 14,
    color: "#555",
  },
  cardButton: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
});
