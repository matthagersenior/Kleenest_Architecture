const CACHE_KEY = 'kleenest.route.cache.v2';
const ACTIVE_KEY = 'kleenest.route.active.v1';
const MAX_ROUTES = 20;
function storage() { return typeof window === 'undefined' || !window.localStorage ? null : window.localStorage; }
function readAll() { try { const value = JSON.parse(storage()?.getItem(CACHE_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
function writeAll(routes) { storage()?.setItem(CACHE_KEY, JSON.stringify(routes.slice(0, MAX_ROUTES))); }
function routeKey(route) { return route.key || [route.routeId || '', route.locationId || '', route.origin, route.destination, JSON.stringify(route.waypoints || [])].join('|'); }
function readActive() { try { return JSON.parse(storage()?.getItem(ACTIVE_KEY) || 'null'); } catch { return null; } }
function writeActive(route) { if (route) storage()?.setItem(ACTIVE_KEY, JSON.stringify(route)); else storage()?.removeItem(ACTIVE_KEY); }
export function createRouteCache() {
  return Object.freeze({
    list: () => readAll(),
    get: key => readAll().find(route => route.key === key) || null,
    getForLocation: locationId => locationId == null ? null : readAll().find(route => String(route.locationId) === String(locationId)) || null,
    getActive: () => readActive(),
    put: route => {
      if (!route?.origin || !route?.destination) throw new Error('A route with origin and destination is required.');
      const key = routeKey(route); const entry = { ...route, key, cachedAt: new Date().toISOString() };
      writeAll([entry, ...readAll().filter(item => item.key !== key)]); return entry;
    },
    setActive: route => { if (!route?.routeId) return route || null; const entry = { ...route, activeAt: new Date().toISOString() }; writeActive(entry); return entry; },
    updateActive: patch => { const current = readActive(); if (!current) return null; const next = { ...current, ...patch, activeAt: new Date().toISOString() }; writeActive(next); return next; },
    clearActive: () => writeActive(null),
    remove: key => writeAll(readAll().filter(route => route.key !== key)),
    clearForLocation: locationId => writeAll(readAll().filter(route => String(route.locationId) !== String(locationId))),
    clear: () => { storage()?.removeItem(CACHE_KEY); writeActive(null); },
  });
}
