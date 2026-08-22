import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, requireSupabase } from './infrastructure/supabase/client.js';
import { createIdentityService } from './domains/identity/auth.js';
import { createProfileService } from './domains/identity/profile.js';
import { createIdentitySnapshot } from './domains/identity/identity-snapshot.js';
import { createEntitlementService, evaluateProfileCapabilities } from './domains/entitlements/access.js';
import { createMapNetworkService } from './domains/maps/network.js';
import { createLiveNetworkService } from './domains/live/network.js';
import { createRoutingService } from './domains/routing/route.js';
import { createNotificationInboxService } from './domains/notifications/inbox.js';

const AppContext = createContext(null);
export function AppProvider({ children }) {
  const services = useMemo(() => {
    if (!supabase) return null;
    return Object.freeze({
      identity: createIdentityService(supabase, { appUrl: path => `${window.location.origin}${path}` }),
      profile: createProfileService(supabase), entitlements: createEntitlementService(supabase),
      maps: createMapNetworkService(supabase), live: createLiveNetworkService(supabase),
      routing: createRoutingService(supabase), notifications: createNotificationInboxService(supabase),
    });
  }, []);
  const [state, setState] = useState({ loading: true, user: null, profile: null, entitlements: [], capabilities: ['consumer'], error: null });
  useEffect(() => {
    let active = true;
    if (!services) { setState(value => ({ ...value, loading: false })); return undefined; }
    const load = async (sessionUser = null) => {
      try {
        const user = sessionUser || await services.identity.getCurrentUser();
        if (!user) { if (active) setState({ loading: false, user: null, profile: null, entitlements: [], capabilities: ['consumer'], error: null }); return; }
        const [profile, entitlements] = await Promise.all([services.profile.get(user.id), services.entitlements.getCurrentUserEntitlements()]);
        if (active) setState({ loading: false, user, profile, entitlements, capabilities: evaluateProfileCapabilities(profile, entitlements), error: null });
      } catch (error) { if (active) setState(value => ({ ...value, loading: false, error })); }
    };
    void load();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => void load(session?.user || null));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [services]);
  const value = useMemo(() => ({ ...state, services, identitySnapshot: createIdentitySnapshot({ user: state.user, profile: state.profile, entitlements: state.entitlements, loading: state.loading, error: state.error }), configured: Boolean(supabase), requireSupabase }), [services, state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useAppContext() { const context = useContext(AppContext); if (!context) throw new Error('useAppContext must be used inside AppProvider.'); return context; }
