import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Route as RouteIcon, Save, Trash2, UserRound, Truck } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import FleetRoutePerformanceCard from './FleetRoutePerformanceCard.jsx';
import FleetRouteStopPlanner from './FleetRouteStopPlanner.jsx';

const arr = value => Array.isArray(value) ? value : [];
const idOf = value => value?.id || value?.route_id || '';
const labelOf = value => value?.name || value?.title || value?.display_name || idOf(value) || 'Unnamed';

const emptyForm = { name: '', status: 'planned', vehicle_id: '', driver_id: '', scheduled_for: '', distance_miles: '', estimated_minutes: '', stops_count: '0' };

function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1, '0')}-${pad(date.getDate(), '0')}T${pad(date.getHours(), '0')}:${pad(date.getMinutes(), '0')}`;
}

function toIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default function FleetRouteCrudPanel({ businessId }) {
  const { services } = useAppContext();
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [driverCandidates, setDriverCandidates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const driverById = useMemo(() => new Map(drivers.map(driver => [String(driver.id), driver])), [drivers]);
  const vehicleById = useMemo(() => new Map(vehicles.map(vehicle => [String(vehicle.id), vehicle])), [vehicles]);
  const candidateByUserId = useMemo(() => new Map(driverCandidates.map(candidate => [String(candidate.user_id), candidate])), [driverCandidates]);

  const load = async () => {
    if (!businessId) return;
    setLoading(true);
    setError('');
    try {
      const [dashboardResult, candidatesResult] = await Promise.allSettled([
        services.fleet.dashboard(businessId),
        services.fleet.driverAssignmentCandidates ? services.fleet.driverAssignmentCandidates(businessId) : Promise.resolve([])
      ]);
      if (dashboardResult.status !== 'fulfilled') throw dashboardResult.reason;
      const dashboard = dashboardResult.value;
      setRoutes(arr(dashboard?.route_records ?? dashboard?.routes));
      setDrivers(arr(dashboard?.driver_records ?? dashboard?.drivers));
      setVehicles(arr(dashboard?.vehicle_records ?? dashboard?.vehicles));
      setDriverCandidates(candidatesResult.status === 'fulfilled' ? arr(candidatesResult.value) : []);
    } catch (e) {
      setError(e.message || 'Unable to load Fleet routes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [businessId]);
  useEffect(() => {
    const refresh = event => {
      if (!event?.detail?.businessId || String(event.detail.businessId) === String(businessId)) void load();
    };
    window.addEventListener('kleenest:fleet-updated', refresh);
    return () => window.removeEventListener('kleenest:fleet-updated', refresh);
  }, [businessId, services]);
  useEffect(() => {
    if (!businessId || !services?.fleet?.subscribeDispatch) return undefined;
    return services.fleet.subscribeDispatch(businessId, change => {
      window.dispatchEvent(new CustomEvent('kleenest:fleet-updated', { detail: { businessId, reason: 'realtime-dispatch', source: change?.source } }));
    });
  }, [businessId, services]);

  const reset = () => { setEditing(null); setForm(emptyForm); };
  const startCreate = () => { setError(''); setMessage(''); setEditing('new'); setForm(emptyForm); };
  const startEdit = route => {
    setError(''); setMessage(''); setEditing(idOf(route));
    setForm({
      name: route?.name || '', status: route?.status || 'planned', vehicle_id: route?.vehicle_id || '', driver_id: route?.driver_id || '',
      scheduled_for: toLocalDateTime(route?.scheduled_for), distance_miles: route?.distance_miles ?? '', estimated_minutes: route?.estimated_minutes ?? '', stops_count: route?.stops_count ?? 0
    });
  };

  const run = async (key, operation, successMessage) => {
    setBusy(key); setError(''); setMessage('');
    try {
      await operation(); setMessage(successMessage); reset(); await load();
      window.dispatchEvent(new CustomEvent('kleenest:fleet-updated', { detail: { businessId } }));
    } catch (e) { setError(e.message || 'Fleet route operation failed.'); }
    finally { setBusy(''); }
  };

  const save = async event => {
    event.preventDefault();
    if (!form.name.trim()) { setError('Route name is required.'); return; }
    const original = editing === 'new' ? null : routes.find(route => String(idOf(route)) === String(editing));
    const originalStatus = original?.status || 'planned';
    const statusChanged = Boolean(original) && form.status !== originalStatus;
    const payload = {
      name: form.name.trim(), status: original ? originalStatus : form.status, vehicleId: form.vehicle_id || null, driverId: form.driver_id || null,
      scheduledFor: toIso(form.scheduled_for), distanceMiles: form.distance_miles === '' ? null : Number(form.distance_miles),
      estimatedMinutes: form.estimated_minutes === '' ? null : Number(form.estimated_minutes), stopsCount: form.stops_count === '' ? 0 : Number(form.stops_count)
    };
    await run('save-route', async () => {
      if (editing === 'new') return services.fleet.createRoute(businessId, payload);
      const updated = await services.fleet.updateRoute(businessId, editing, payload);
      if (statusChanged) await services.fleet.routeStatus(businessId, editing, form.status);
      return updated;
    }, editing === 'new' ? 'Route created.' : statusChanged ? `Route updated and status changed to ${form.status}.` : 'Route updated.');
  };

  const remove = route => run(`delete-${idOf(route)}`, () => services.fleet.deleteRoute(businessId, idOf(route)), 'Route deleted.');
  const assignmentPayload = (route, overrides = {}) => ({
    name: route.name, status: route.status || 'planned', vehicleId: route.vehicle_id || null, driverId: route.driver_id || null,
    scheduledFor: route.scheduled_for || null, distanceMiles: route.distance_miles ?? null, estimatedMinutes: route.estimated_minutes ?? null,
    stopsCount: route.stops_count ?? 0, metadata: route.metadata || {}, ...overrides
  });
  const assignDriver = (route, driverId) => run(`driver-${idOf(route)}`, () => services.fleet.updateRoute(businessId, idOf(route), assignmentPayload(route, { driverId: driverId || null })), driverId ? 'Driver assigned to route.' : 'Driver removed from route.');
  const assignVehicle = (route, vehicleId) => run(`vehicle-${idOf(route)}`, () => services.fleet.updateRoute(businessId, idOf(route), assignmentPayload(route, { vehicleId: vehicleId || null })), vehicleId ? 'Vehicle assigned to route.' : 'Vehicle removed from route.');
  const assignDriverAccount = (driver, userId) => run(`driver-account-${driver.id}`, () => services.fleet.assignDriverUser(businessId, driver.id, userId || null), userId ? 'Driver app account linked.' : 'Driver app account unlinked.');

  return (
    <section className="detail-panel business-card fleet-route-crud">
      <div className="panel-heading"><div><span className="eyebrow">FLEET DISPATCH</span><h2>Routes & assignments</h2><p className="muted">Create, plan, assign, dispatch, and measure Fleet routes with driver, vehicle, ETA, duration, TTL, dwell, and stop completion metrics.</p></div><RouteIcon size={22} /></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}

      {driverCandidates.length > 0 && drivers.length > 0 && <section className="detail-panel fleet-driver-identity-panel">
        <div className="panel-heading"><div><span className="eyebrow">DRIVER IDENTITY</span><h3>Driver account links</h3><p className="muted">Link Fleet driver records to business-member accounts so assigned-driver timing authority and dispatch notifications use the canonical user identity.</p></div><UserRound size={20} /></div>
        <div className="crud-records">{drivers.map(driver => {
          const linked = driver.user_id ? candidateByUserId.get(String(driver.user_id)) : null;
          return <div className="business-row crud-record-row" key={`driver-account-${driver.id}`}><div className="crud-record-main"><strong>{labelOf(driver)}</strong><span>{driver.user_id ? `App account: ${linked?.display_name || linked?.username || 'Linked business member'}` : 'No app account linked'}</span></div><label className="inline-control"><span>Business member</span><select value={driver.user_id || ''} onChange={e => assignDriverAccount(driver, e.target.value)} disabled={busy === `driver-account-${driver.id}`}><option value="">No app account</option>{driverCandidates.map(candidate => <option key={candidate.user_id} value={candidate.user_id} disabled={Boolean(candidate.assigned_driver_id) && String(candidate.assigned_driver_id) !== String(driver.id)}>{candidate.display_name || candidate.username || 'Business member'} · {candidate.member_role}{candidate.assigned_driver_id && String(candidate.assigned_driver_id) !== String(driver.id) ? ` · assigned to ${candidate.assigned_driver_name || 'another driver'}` : ''}</option>)}</select></label></div>;
        })}</div>
      </section>}

      {editing ? (
        <form className="crud-form" onSubmit={save}>
          <div className="form-row"><label className="form-field"><span>Route name</span><input required value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} /></label><label className="form-field"><span>Status</span><select value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value }))}><option value="planned">Planned</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option></select></label></div>
          <div className="form-row"><label className="form-field"><span>Assign driver</span><select value={form.driver_id} onChange={e => setForm(v => ({ ...v, driver_id: e.target.value }))}><option value="">Unassigned</option>{drivers.map(driver => <option key={driver.id} value={driver.id}>{labelOf(driver)}</option>)}</select></label><label className="form-field"><span>Vehicle</span><select value={form.vehicle_id} onChange={e => setForm(v => ({ ...v, vehicle_id: e.target.value }))}><option value="">No vehicle</option>{vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{labelOf(vehicle)}</option>)}</select></label></div>
          <div className="form-row"><label className="form-field"><span>Scheduled for</span><input type="datetime-local" value={form.scheduled_for} onChange={e => setForm(v => ({ ...v, scheduled_for: e.target.value }))} /></label><label className="form-field"><span>Distance (mi)</span><input type="number" min="0" step="0.1" value={form.distance_miles} onChange={e => setForm(v => ({ ...v, distance_miles: e.target.value }))} /></label></div>
          <div className="form-row"><label className="form-field"><span>Estimated minutes</span><input type="number" min="0" step="1" value={form.estimated_minutes} onChange={e => setForm(v => ({ ...v, estimated_minutes: e.target.value }))} /></label><label className="form-field"><span>Stops</span><input type="number" min="0" step="1" value={form.stops_count} onChange={e => setForm(v => ({ ...v, stops_count: e.target.value }))} /></label></div>
          <div className="hero-actions"><button className="primary" type="submit" disabled={busy === 'save-route'}><Save size={15} />{busy === 'save-route' ? 'Saving…' : editing === 'new' ? 'Create route' : 'Save route'}</button><button className="secondary" type="button" onClick={reset}>Cancel</button></div>
        </form>
      ) : <div className="hero-actions"><button className="primary" type="button" onClick={startCreate}><Plus size={15} />Create route</button><button className="secondary" type="button" onClick={load} disabled={loading}>Refresh routes</button></div>}

      <div className="crud-records">
        {!loading && !routes.length && !editing && <p className="muted">No Fleet routes yet. Create the first route and assign a driver and vehicle when ready.</p>}
        {routes.map(route => {
          const routeId = idOf(route); const driver = driverById.get(String(route.driver_id)); const vehicle = vehicleById.get(String(route.vehicle_id));
          return (
            <article className="business-row crud-record-row fleet-route-record" key={routeId}>
              <div className="crud-record-main"><strong>{labelOf(route)}</strong><span>{route.status || 'planned'} · {route.distance_miles ?? '—'} mi · {route.stops_count ?? 0} stops</span><span>{vehicle ? `Vehicle: ${labelOf(vehicle)}` : 'Vehicle: unassigned'} · {driver ? `Driver: ${labelOf(driver)}` : 'Driver: unassigned'}</span></div>
              <div className="compact-actions route-actions">
                <label className="inline-control"><UserRound size={14} /><span>Driver</span><select value={route.driver_id || ''} onChange={e => assignDriver(route, e.target.value)} disabled={busy === `driver-${routeId}`}><option value="">Unassigned</option>{drivers.map(d => <option key={d.id} value={d.id}>{labelOf(d)}</option>)}</select></label>
                <label className="inline-control"><Truck size={14} /><span>Vehicle</span><select value={route.vehicle_id || ''} onChange={e => assignVehicle(route, e.target.value)} disabled={busy === `vehicle-${routeId}`}><option value="">Unassigned</option>{vehicles.map(v => <option key={v.id} value={v.id}>{labelOf(v)}</option>)}</select></label>
                <button className="icon-button" title="Edit route" onClick={() => startEdit(route)}><Edit3 size={15} /></button>
                <button className="icon-button" title="Delete route" onClick={() => remove(route)} disabled={busy === `delete-${routeId}`}><Trash2 size={15} /></button>
              </div>
              <FleetRouteStopPlanner businessId={businessId} route={route}/>
              <FleetRoutePerformanceCard businessId={businessId} route={route}/>
            </article>
          );
        })}
      </div>
    </section>
  );
}
