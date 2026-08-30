import { useEffect, useMemo, useState } from 'react';
import { Edit3, Lock, Route as RouteIcon, UserRound, Truck } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import FleetRouteCrudPanel from './FleetRouteCrudPanel.jsx';
import FleetOperationalSignalsPanel from './FleetOperationalSignalsPanel.jsx';
import { fleetAccessState } from '../domains/fleet/access.js';

const arr = value => Array.isArray(value) ? value : [];
const idOf = value => value?.id || value?.route_id || '';
const labelOf = value => value?.name || value?.title || value?.display_name || idOf(value) || 'Unnamed';

function ReadOnlyRoutes({ services, businessId }) {
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    services.fleet.dashboard(businessId).then(d => {
      if (!active) return;
      setRoutes(arr(d?.route_records ?? d?.routes));
      setDrivers(arr(d?.driver_records ?? d?.drivers));
      setVehicles(arr(d?.vehicle_records ?? d?.vehicles));
    }).catch(e => { if (active) setError(e.message || 'Unable to load Fleet routes.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [services, businessId]);
  const driverById = useMemo(() => new Map(drivers.map(v => [String(v.id), v])), [drivers]);
  const vehicleById = useMemo(() => new Map(vehicles.map(v => [String(v.id), v])), [vehicles]);
  return <section className="detail-panel business-card fleet-route-readonly">
    <div className="panel-heading"><div><span className="eyebrow">FLEET DISPATCH · VIEW ONLY</span><h2>Routes & assignments</h2><p className="muted"><Lock size={14}/> Fleet User access is read-only. Controller access is required to create, edit, delete, or assign routes.</p></div><RouteIcon size={22}/></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading ? <p className="muted">Loading routes…</p> : routes.length ? routes.map(route => {
      const driver = driverById.get(String(route.driver_id));
      const vehicle = vehicleById.get(String(route.vehicle_id));
      return <article className="business-row crud-record-row" key={idOf(route)}><div className="crud-record-main"><strong>{labelOf(route)}</strong><span>{route.status || 'planned'} · {route.distance_miles ?? '—'} mi · {route.stops_count ?? 0} stops</span><span><Truck size={13}/> {vehicle ? labelOf(vehicle) : 'Vehicle unassigned'} · <UserRound size={13}/> {driver ? labelOf(driver) : 'Driver unassigned'}</span></div></article>;
    }) : <p className="muted">No Fleet routes yet.</p>}
  </section>;
}

export default function FleetRoutesPage() {
  const { services, selectedBusinessId, selectedBusiness, isPlatformOwner, profile } = useAppContext();
  const businessId = selectedBusinessId || selectedBusiness?.business_id || selectedBusiness?.id || '';
  const role = profile?.role || profile?.business_role || profile?.membership_role || '';
  const tier = profile?.business_tier || profile?.tier || '';
  const access = fleetAccessState({ isPlatformOwner, role, businessTier: tier });

  if (!businessId) {
    return <WorkspaceShell workspace="fleet"><section className="empty-state"><RouteIcon size={36}/><h2>No Fleet business selected</h2><p>{isPlatformOwner ? 'Select an owner/demo Fleet business to manage routes.' : 'A Fleet business membership is required to access routes.'}</p></section></WorkspaceShell>;
  }

  return <WorkspaceShell workspace="fleet"><section className="page business-page"><section className="page-header"><div><span className="eyebrow">FLEET · ROUTE DISPATCH</span><h1>Routes</h1><p>{access.operate ? 'Create and manage operational routes, assign drivers and vehicles, schedule work, and control route status from one workspace.' : 'Review operational routes and assignments from your Fleet workspace.'}</p></div></section>{access.observe && <FleetOperationalSignalsPanel businessId={businessId}/>} {access.operate ? <FleetRouteCrudPanel businessId={businessId}/> : access.observe ? <ReadOnlyRoutes services={services} businessId={businessId}/> : <section className="empty-state"><Lock size={36}/><h2>Fleet route access unavailable</h2><p>This business does not grant Fleet route access to the current account.</p></section>}</section></WorkspaceShell>;
}