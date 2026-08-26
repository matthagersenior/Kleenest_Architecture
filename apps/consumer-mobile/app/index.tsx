import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

const cards = [
  { href: '/map', title: 'Find a restroom', body: 'Use the live Kleenest map or ask naturally for what you need.' },
  { href: '/route', title: 'Plan a route', body: 'Build your trip around trusted restroom stops.' },
  { href: '/checkin', title: 'Check in', body: 'Verify a real-world visit with GPS or a Kleenest QR.' },
  { href: '/qr', title: 'QR engagement', body: 'Redeem an eligible Kleenest QR and continue the engagement loop.' },
  { href: '/rewards', title: 'Rewards', body: 'See server-authoritative progression and reward history.' },
  { href: '/notifications', title: 'Stay in the loop', body: 'Arrivals, rewards, QR activity, reviews and community updates.' },
];

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.eyebrow}>KLEENEST</Text>
      <Text style={styles.title}>Find a better bathroom when you need one.</Text>
      <Text style={styles.subtitle}>Live location intelligence, community trust signals and smarter trips in one consumer experience.</Text>
      <Link href="/map" asChild><Pressable style={styles.primary}><Text style={styles.primaryText}>Open the map</Text></Pressable></Link>
      <View style={styles.grid}>
        {cards.map(card => <Link key={card.href} href={card.href as never} asChild><Pressable style={styles.card}><Text style={styles.cardTitle}>{card.title}</Text><Text style={styles.cardBody}>{card.body}</Text></Pressable></Link>)}
      </View>
      <View style={styles.ai}><Text style={styles.aiTitle}>Ask Kleenest naturally</Text><Text style={styles.aiBody}>“Find me an accessible bathroom with a changing table nearby.”</Text><Link href="/map" style={styles.link}>Try semantic discovery →</Link></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({page:{padding:24,gap:18,backgroundColor:'#fff',flexGrow:1},eyebrow:{fontSize:12,fontWeight:'800',letterSpacing:2,marginTop:16},title:{fontSize:34,fontWeight:'800',lineHeight:39},subtitle:{fontSize:16,lineHeight:24,color:'#5b6470'},primary:{backgroundColor:'#111827',padding:16,borderRadius:14,alignItems:'center'},primaryText:{color:'#fff',fontSize:16,fontWeight:'800'},grid:{gap:12},card:{padding:18,borderWidth:1,borderColor:'#e5e7eb',borderRadius:16,backgroundColor:'#fafafa'},cardTitle:{fontSize:18,fontWeight:'800'},cardBody:{marginTop:6,color:'#5b6470',lineHeight:21},ai:{padding:18,borderRadius:16,backgroundColor:'#f3f4f6',gap:8},aiTitle:{fontSize:17,fontWeight:'800'},aiBody:{fontSize:15,lineHeight:22,fontStyle:'italic'},link:{fontWeight:'700'}});
