import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_ROUTER = 'https://router.project-osrm.org';
type Point = [number, number];
export type MobileRoute = { origin: Point; destination: Point; locationId?: string | null; distanceMeters: number; durationSeconds: number; distanceKm: number; durationMinutes: number; geometry: unknown; steps: Array<{ instruction: string; distanceMeters: number; durationSeconds: number }>; routingProvider: 'osrm'; };

const EVENT_TYPES = {
  requested: 'user.directions_requested',
  start: 'user.route_started',
  approaching: 'user.approaching_location',
  arrived: 'user.arrived',
  departed: 'user.departed',
} as const;

async function publish(client: SupabaseClient, eventType: string, route: MobileRoute) {
  const { data, error } = await client.rpc('publish_live_network_event', {
    p_event_type: eventType,
    p_location_id: route.locationId ?? null,
    p_actor_type: 'user',
    p_actor_id: null,
    p_payload: { route, share_fleet: true },
  });
  if (error) throw error;
  return data;
}

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
      await publish(client, EVENT_TYPES.requested, route);
      return route;
    },
    async publishLifecycle(eventType: keyof Pick<typeof EVENT_TYPES, 'start' | 'approaching' | 'arrived' | 'departed'>, route: MobileRoute) {
      await publish(client, EVENT_TYPES[eventType], route);
    },
  });
}
