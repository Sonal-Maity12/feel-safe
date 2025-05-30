import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Title, Divider } from 'react-native-paper';

const SafetyResourcesScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Safety Resources</Title>

      {/* Safety Tips */}
      <Card style={styles.card}>
        <Card.Title title="Safety Tips" titleStyle={styles.cardTitle} />
        <Card.Content style={styles.cardContent}>
          <Text>• Always stay aware of your surroundings.</Text>
          <Text>• Share your live location with a trusted contact.</Text>
          <Text>• Avoid isolated areas, especially at night.</Text>
          <Text>• Trust your instincts—leave if you feel uncomfortable.</Text>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Local Emergency Resources */}
      <Card style={styles.card}>
        <Card.Title title="Local Emergency Resources" titleStyle={styles.cardTitle} />
        <Card.Content style={styles.cardContent}>
          <Text>📞 Emergency Services: 100 (Police) / 112 (General)</Text>
          <Text>🏥 Nearby Hospital: City Health Center, 24/7 ER</Text>
          <Text>👮‍♂️ Local Police Station: 1.2 km from your location</Text>
          <Text>📍 Women's Helpline: 1091</Text>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Self-Defense Advice */}
      <Card style={styles.card}>
        <Card.Title title="Self-Defense Advice" titleStyle={styles.cardTitle} />
        <Card.Content style={styles.cardContent}>
          <Text>• Learn basic moves like wrist release and palm strikes.</Text>
          <Text>• Carry a whistle or personal alarm.</Text>
          <Text>• Use items like keys or bags to defend if needed.</Text>
          <Text>• Consider taking a self-defense class near you.</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default SafetyResourcesScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: 'center',
    color: 'red', // Dark color for main screen title
    fontWeight: 'bold',

  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'pink', // Light background for the card
  },
  cardTitle: {
    color: '#1a237e', // Dark indigo for card titles
    fontWeight: 'bold',
    fontSize: 20,

  },
  cardContent: {
    backgroundColor: 'pink', // Match card background
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  divider: {
    marginVertical: 10,
  },
});
