const CACHE_KEY = 'kleenest.route.cache.v1';
const MAX_ROUTES = 20;
function storage() { return typeof window === 'undefined' || !window.localStorage ? null : window.localStorage; }
function readAll() { try { const value = JSON.parse(storage()?.getItem(CACHE_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
function writeAll(routes) { storage()?.setItem(CACHE_KEY, JSON.stringify(routes.slice(0, MAX_ROUTES))); }
function routeKey(route) {
  return route.key || [route.locationId || '', route.origin, route.destination, JSON.stringify(route.waypoints || [])].join('|');
}
export function createRouteCache() {
  return Object.freeze({
    list: () => readAll(),
    get: key => readAll().find(route => route.key === key) || null,
    getForLocation: locationId => locationId == null ? null : readAll().find(route => route.locationId === locationId) || null,
    put: route => {
      if (!route?.origin || !route?.destination) throw new Error('A route with origin and destination is required.');
      const key = routeKey(route);
      const entry = { ...route, key, cachedAt: new Date().toISOString() };
      writeAll([entry, ...readAll().filter(item => item.key !== key)]);
      return entry;
    },
    remove: key => writeAll(readAll().filter(route => route.key !== key)),
    clearForLocation: locationId => writeAll(readAll().filter(route => route.locationId !== locationId)),
    clear: () => storage()?.removeItem(CACHE_KEY),
  });
}
