import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const cards = [
  ['Locations', 'Claim, verify and manage canonical locations.'],
  ['Restroom Health', 'See cleanliness, availability, accessibility and confidence signals.'],
  ['QR & Promotions', 'Turn physical visits into measurable engagement.'],
  ['Campaigns', 'Create campaigns and connect exposure to conversion.'],
  ['Analytics & ROI', 'Measure visits, check-ins, redemptions and engagement.'],
];

export default function BusinessHome() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>KLEENEST BUSINESS</Text>
      <Text style={styles.title}>Manage. Engage. Measure.</Text>
      <Text style={styles.subtitle}>Your restroom presence and customer engagement, in one place.</Text>
      {cards.map(([title, description]) => (
        <View key={title} style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardText}>{description}</Text>
        </View>
      ))}
      <Link href="/locations" style={styles.link}>Open locations →</Link>
      <Link href="/analytics" style={styles.link}>Open analytics →</Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { fontSize: 16, lineHeight: 23 },
  card: { padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', gap: 6 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardText: { fontSize: 14, lineHeight: 20 },
  link: { fontSize: 16, fontWeight: '700', paddingVertical: 8 },
});
