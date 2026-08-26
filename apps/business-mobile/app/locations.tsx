import { Text, View, StyleSheet, ScrollView } from 'react-native';

export default function Locations() {
  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Locations</Text>
    <View style={styles.card}>
      <Text style={styles.heading}>Canonical locations</Text>
      <Text>Claim, verify, activate, configure amenities and manage the restroom profile without creating duplicate locations.</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.heading}>Business health</Text>
      <Text>Consumer observations remain evidence; business controls manage operational facts and responses.</Text>
    </View>
  </ScrollView>;
}
const styles=StyleSheet.create({container:{padding:24,gap:16},title:{fontSize:30,fontWeight:'800'},card:{padding:18,borderWidth:1,borderColor:'#ddd',borderRadius:16,gap:8},heading:{fontSize:18,fontWeight:'700'}});
