import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_ROUTER = 'https://router.project-osrm.org';
type Point = [number, number];
export type MobileRoute = { origin: Point; destination: Point; locationId?: string | null; distanceMeters: number; durationSeconds: number; distanceKm: number; durationMinutes: number; geometry: unknown; steps: Array<{ instruction: string; distanceMeters: number; durationSeconds: number }>; routingProvider: 'osrm'; };

export function createMobileRoutingService(client: SupabaseClient) {
  return Object.freeze({
    async request({ origin, destination, locationId = null }: { origin: Point; destination: Point; locationId?: string | null }): Promise<MobileRoute> {
      const provider = String(process.env.EXPO_PUBLIC_ROUTING_PROVIDER_URL || DEFAULT_ROUTER).replace(/\/$/, '');
      const url = `${provider}/route/v1/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson&steps=true`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Routing provider could not build this route.');
      const payload = await response.json();
      const selected = payload?.routes?.[0];
      if (!selected) throw new Error('No drivable route was found.');
      const route: MobileRoute = {
        origin, destination, locationId,
        distanceMeters: selected.distance, durationSeconds: selected.duration,
        distanceKm: Number((selected.distance / 1000).toFixed(2)),
        durationMinutes: Math.max(1, Math.round(selected.duration / 60)),
        geometry: selected.geometry,
        steps: selected.legs?.flatMap((leg: any) => leg.steps || []).map((step: any) => ({ instruction: step.maneuver?.instruction || step.name || 'Continue', distanceMeters: step.distance, durationSeconds: step.duration })) || [],
        routingProvider: 'osrm',
      };
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        const { error } = await client.from('live_events').insert({ user_id: user.id, event_type: 'user_directions_requested', location_id: locationId, payload: { route } });
        if (error) throw error;
      }
      return route;
    },
    async publishLifecycle(eventType: 'user_route_started' | 'user_approaching_location' | 'user_arrived' | 'user_departed', route: MobileRoute) {
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('Sign in to use route lifecycle actions.');
      const { error } = await client.from('live_events').insert({ user_id: user.id, event_type: eventType, location_id: route.locationId ?? null, payload: { route } });
      if (error) throw error;
    },
  });
}
