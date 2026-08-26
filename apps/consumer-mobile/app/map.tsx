import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createKleenestSupabaseClient } from '@kleenest/mobile-core';

export default function MapScreen() {
  const client = useMemo(() => { try { return createKleenestSupabaseClient(); } catch { return null; } }, []);
  const [query,setQuery] = useState('');
  const [coords,setCoords] = useState<{latitude:number;longitude:number}|null>(null);
  const [results,setResults] = useState<any[]>([]);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');

  useEffect(() => { void locate(); }, []);
  const locate = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') { setMessage('Location permission is off. You can still describe what you need after signing in.'); return; }
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setCoords({ latitude: current.coords.latitude, longitude: current.coords.longitude });
  };
  const search = async () => {
    if (!client) return setMessage('Mobile configuration is missing.');
    if (!query.trim()) return setMessage('Describe what you need, for example: accessible bathroom with changing table.');
    setBusy(true); setMessage('Interpreting your request against canonical Kleenest data.');
    try {
      const { data, error } = await client.rpc('semantic_location_search', { p_query: query.trim(), p_lat: coords?.latitude ?? null, p_lng: coords?.longitude ?? null, p_radius_m: 16093, p_limit: 25 });
      if (error) throw error;
      setResults(Array.isArray(data?.results) ? data.results : []);
      setMessage(data?.results?.length ? `Found ${data.results.length} canonical matches.` : 'No matching locations were found. Try a broader request.');
    } catch (error:any) { setMessage(error?.message || 'Search could not be completed.'); }
    finally { setBusy(false); }
  };
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>DISCOVER</Text><Text style={styles.title}>Tell Kleenest what you need.</Text>
    <Text style={styles.subtitle}>AI interprets your request. Canonical Kleenest location data decides what is actually true.</Text>
    <TextInput value={query} onChangeText={setQuery} onSubmitEditing={search} placeholder="Accessible bathroom with a changing table nearby" style={styles.input} multiline />
    <View style={styles.row}><Pressable style={styles.primary} onPress={search} disabled={busy}>{busy?<ActivityIndicator color="#fff"/>:<Text style={styles.primaryText}>Search</Text>}</Pressable><Pressable style={styles.secondary} onPress={locate}><Text style={styles.secondaryText}>{coords?'Location ready':'Use my location'}</Text></Pressable></View>
    {!!message && <Text style={styles.message}>{message}</Text>}
    {results.map((place:any)=><Link key={place.id} href={`/location/${place.id}` as never} asChild><Pressable style={styles.result}><Text style={styles.resultTitle}>{place.name}</Text><Text style={styles.resultAddress}>{place.address || [place.city,place.state].filter(Boolean).join(', ')}</Text><Text style={styles.signal}>Trust {place.recommendation_score ?? '—'} · {place.distance_meters != null ? `${(place.distance_meters/1609.344).toFixed(1)} mi` : 'distance unavailable'}</Text></Pressable></Link>)}
  </ScrollView>;
}
const styles=StyleSheet.create({page:{padding:20,gap:14,backgroundColor:'#fff',flexGrow:1},eyebrow:{fontSize:12,fontWeight:'800',letterSpacing:2},title:{fontSize:30,fontWeight:'800'},subtitle:{fontSize:15,lineHeight:22,color:'#5b6470'},input:{minHeight:100,borderWidth:1,borderColor:'#d1d5db',borderRadius:14,padding:14,textAlignVertical:'top',fontSize:16},row:{flexDirection:'row',gap:10},primary:{flex:1,backgroundColor:'#111827',padding:15,borderRadius:12,alignItems:'center'},primaryText:{color:'#fff',fontWeight:'800'},secondary:{flex:1,borderWidth:1,borderColor:'#d1d5db',padding:15,borderRadius:12,alignItems:'center'},secondaryText:{fontWeight:'700'},message:{color:'#5b6470',lineHeight:20},result:{padding:16,borderWidth:1,borderColor:'#e5e7eb',borderRadius:14,gap:5},resultTitle:{fontSize:17,fontWeight:'800'},resultAddress:{color:'#4b5563'},signal:{fontSize:13,fontWeight:'700'}});
