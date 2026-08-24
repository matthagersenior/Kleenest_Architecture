import { useEffect } from 'react';
import { useAppContext } from '../AppContext.jsx';

const CHANNEL = 'kleenest-universal-network';

export default function UniversalNetworkEventBridge() {
  const { configured, services } = useAppContext();
  useEffect(() => {
    if (!configured || !services?.liveNetwork?.subscribe) return undefined;
    const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
    let active = true;
    const unsubscribe = services.liveNetwork.subscribe(event => {
      if (!active || !event) return;
      emit('kleenest:network-event', event);
      if (event.type === 'notification' || event.notification_id || event.notification) emit('kleenest:notification', event);
      if (event.user_id || event.location_id || event.latitude != null) emit('kleenest:location-signal', event);
      if (String(event.type || '').startsWith('FLEET_')) emit('kleenest:fleet-event', event);
      if (String(event.type || '').startsWith('BUSINESS_') || event.campaign_id || event.promotion_id) emit('kleenest:business-event', event);
      if (event.enterprise_id || event.network_id || event.outcome_id) emit('kleenest:enterprise-event', event);
    });
    const channel = services.liveNetwork.broadcastChannel?.(CHANNEL);
    return () => { active = false; if (typeof unsubscribe === 'function') unsubscribe(); channel?.unsubscribe?.(); };
  }, [configured, services]);
  return null;
}
