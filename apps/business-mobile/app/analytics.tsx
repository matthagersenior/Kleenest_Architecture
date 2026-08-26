import { Text, View, StyleSheet, ScrollView } from 'react-native';

const metrics = ['Visitors', 'Check-ins', 'Reviews', 'QR engagement', 'Promotion redemptions', 'Restroom health'];
export default function Analytics() {
  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Business Intelligence</Text>
    <Text style={styles.subtitle}>Turn canonical consumer activity into operational and marketing decisions.</Text>
    {metrics.map(metric => <View key={metric} style={styles.card}><Text style={styles.heading}>{metric}</Text><Text>Connect this metric to the authoritative Business analytics RPC and show trend, period and confidence.</Text></View>)}
  </ScrollView>;
}
const styles=StyleSheet.create({container:{padding:24,gap:16},title:{fontSize:30,fontWeight:'800'},subtitle:{fontSize:16,lineHeight:22},card:{padding:18,borderWidth:1,borderColor:'#ddd',borderRadius:16,gap:8},heading:{fontSize:18,fontWeight:'700'}});
