// HomePage.js

import { useRouter } from "expo-router";
import React from "react";
import { View, StyleSheet, ImageBackground, ScrollView } from "react-native";
import { Text, Button, Card, Title, Paragraph } from "react-native-paper";

export default function HomePage() {
  const router = useRouter()
  return (
    <ImageBackground
      source={{ uri: "https://gowoogle.com/assets/images/women_safety.jpg" }} // Replace with a real background image
      style={styles.container}
    >
      <ScrollView style={styles.scrollOverlay}>
        <View style={styles.overlay}>
          {/* App Title */}
          <Text style={styles.title}>Women's Safety App</Text>
          {/* Emergency Contact Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Emergency Contact</Title>
              <Paragraph style={styles.cardText}>
                Quickly call emergency services or trusted contacts in case of
                danger.
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="phone"
                style={styles.button}
                onPress={() => router.push("/emergency-contact")}
              >
                Call Now
              </Button>
            </Card.Actions>
          </Card>

          {/* Location Sharing Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Real-Time Location Tracking</Title>
              <Paragraph style={styles.cardText}>
                Share your real-time location with trusted people in case of
                emergency.
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="share-variant"
                style={styles.button}
                onPress={() => alert("Sharing Location")}
              >
                Share Now
              </Button>
            </Card.Actions>
          </Card>

           {/* Nearest Police Station Section */}
           <Card style={styles.card}>
            <Card.Content>
              <Title>Nearest Police Station</Title>
              <Paragraph style={styles.cardText}>
                Track your nearest police station in case of any trouble.
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="map-marker-path"
                style={styles.button}
                onPress={() => alert("Track Police Station")}
              >
                Track Now
              </Button>
            </Card.Actions>
          </Card>

          {/* Emergency Notification To Authorities Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Emergency Notification To Authorities</Title>
              <Paragraph style={styles.cardText}>
                Quickly inform emergency services or authorities if there's
                danger.
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="bell"
                style={styles.button}
                onPress={() => alert("Calling Emergency Contact")}
              >
                Send
              </Button>
            </Card.Actions>
          </Card>

          {/* Emergency Community Support Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Community Support</Title>
              <Paragraph style={styles.cardText}>
                Quickly reach out to emergency services, chat with someone, or
                connect with a trusted person for help if you're in danger."
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="account-group"
                style={styles.button}
                onPress={() => alert("Calling Emergency Contact")}
              >
               Support Line
              </Button>
            </Card.Actions>
          </Card>

          {/* Safety Resources Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Safety Resources</Title>
              <Paragraph style={styles.cardText}>
                Access safety tips, local emergency resources, and self-defense
                advice.
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="book"
                style={styles.button}
                onPress={() => alert("Opening Safety Resources")}
              >
                View Resources
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent overlay for readability
    width: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
    textAlign: "center",
  },
  card: {
    width: "90%",
    marginBottom: 20,
    borderRadius: 15,
    elevation: 5,
  },
  cardText: {
    color: "#555",
    fontSize: 14,
  },
  button: {
    borderRadius: 10,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  iconButton: {
    margin: 10,
    backgroundColor: "#6200ea", // Icon button color
    padding: 15,
    borderRadius: 50,
    color: "white",
  },
});
