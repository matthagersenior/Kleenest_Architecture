import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { createKleenestSupabaseClient, createMobileEngagementService } from '@kleenest/mobile-core';

export default function CheckInScreen() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const submitGps = async () => {
    setBusy(true); setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('Location permission is required to verify a GPS visit.');
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const client = createKleenestSupabaseClient();
      const data = await createMobileEngagementService(client).gpsCheckIn({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setResult('Visit verified. Kleenest recorded your real-world contribution.');
      return data;
    } catch (e: any) { setError(e?.message || 'Unable to verify your visit.'); } finally { setBusy(false); }
  };
  const submitQr = async () => {
    if (!code.trim()) return setError('Enter the QR code first.');
    setBusy(true); setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      const position = permission.status === 'granted' ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }) : null;
      const client = createKleenestSupabaseClient();
      const data = await createMobileEngagementService(client).qrCheckIn({ code: code.trim(), latitude: position?.coords.latitude, longitude: position?.coords.longitude });
      setResult('QR check-in verified. Your visit can now drive rewards and trust signals.');
      setCode('');
      return data;
    } catch (e: any) { setError(e?.message || 'Unable to verify that QR check-in.'); } finally { setBusy(false); }
  };
  return <View style={styles.page}>
    <Text style={styles.eyebrow}>REAL-WORLD ENGAGEMENT</Text><Text style={styles.title}>Check in</Text><Text style={styles.body}>Kleenest uses server-authoritative check-in verification. A successful visit can feed trust, points, quests and notifications.</Text>
    <Pressable disabled={busy} style={styles.primary} onPress={submitGps}><Text style={styles.primaryText}>{busy ? 'Verifying…' : 'Verify my visit with GPS'}</Text></Pressable>
    <View style={styles.panel}><Text style={styles.heading}>QR check-in</Text><Text style={styles.body}>Enter a Kleenest QR code to verify the visit.</Text><TextInput value={code} onChangeText={setCode} placeholder="Enter QR code" autoCapitalize="none" style={styles.input}/><Pressable disabled={busy || !code.trim()} style={styles.secondary} onPress={submitQr}><Text style={styles.secondaryText}>Verify QR check-in</Text></Pressable></View>
    {!!result && <Text style={styles.success}>{result}</Text>}{!!error && <Text style={styles.error}>{error}</Text>}
  </View>;
}
const styles=StyleSheet.create({page:{flex:1,padding:24,gap:16,backgroundColor:'#fff'},eyebrow:{fontSize:12,fontWeight:'800',letterSpacing:2,marginTop:18},title:{fontSize:32,fontWeight:'800'},body:{fontSize:15,lineHeight:22,color:'#5b6470'},primary:{padding:16,borderRadius:14,backgroundColor:'#111827',alignItems:'center'},primaryText:{color:'#fff',fontWeight:'800'},panel:{padding:18,borderWidth:1,borderColor:'#e5e7eb',borderRadius:16,gap:12},heading:{fontSize:20,fontWeight:'800'},input:{borderWidth:1,borderColor:'#d1d5db',borderRadius:12,padding:14,fontSize:16},secondary:{padding:14,borderRadius:12,borderWidth:1,borderColor:'#111827',alignItems:'center'},secondaryText:{fontWeight:'800'},success:{padding:14,borderRadius:12,backgroundColor:'#ecfdf5',color:'#065f46'},error:{padding:14,borderRadius:12,backgroundColor:'#fef2f2',color:'#991b1b'}});
