import { useEffect } from 'react';
import { useAppContext } from '../AppContext.jsx';

const EVENT_NAME = 'kleenest:network-event';

export default function UniversalNetworkEventBridge() {
  const { configured, services } = useAppContext();

  useEffect(() => {
    if (!configured || typeof services?.live?.subscribe !== 'function') return undefined;

    let active = true;
    const emit = (name, detail) => {
      if (typeof window === 'undefined' || !active) return;
      window.dispatchEvent(new CustomEvent(name, { detail }));
    };

    const unsubscribe = services.live.subscribe({
      onEvent: ({ eventType, new: event } = {}) => {
        if (!active || !event) return;
        const detail = { ...event, type: event.event_type || eventType || event.type };
        emit(EVENT_NAME, detail);
        if (detail.notification_id || detail.notification) emit('kleenest:notification', detail);
        if (detail.user_id || detail.location_id || detail.latitude != null) emit('kleenest:location-signal', detail);
        if (String(detail.type || '').startsWith('fleet.')) emit('kleenest:fleet-event', detail);
        if (String(detail.type || '').startsWith('business.')) emit('kleenest:business-event', detail);
        if (detail.enterprise_id || detail.network_id || detail.outcome_id) emit('kleenest:enterprise-event', detail);
      }
    });

    return () => {
      active = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [configured, services]);

  return null;
}
