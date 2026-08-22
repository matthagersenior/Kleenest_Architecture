import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, requireSupabase } from './infrastructure/supabase/client.js';
import { createIdentityService } from './domains/identity/auth.js';
import { createProfileService } from './domains/identity/profile.js';
import { createIdentitySnapshot } from './domains/identity/identity-snapshot.js';
import { createEntitlementService, evaluateProfileCapabilities } from './domains/entitlements/access.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const services = useMemo(() => {
    if (!supabase) return null;
    return Object.freeze({
      identity: createIdentityService(supabase, { appUrl: path => `${window.location.origin}${path}` }),
      profile: createProfileService(supabase),
      entitlements: createEntitlementService(supabase),
    });
  }, []);

  const [state, setState] = useState({ loading: true, user: null, profile: null, entitlements: [], capabilities: ['consumer'], error: null });

  useEffect(() => {
    let active = true;
    if (!services) {
      setState(value => ({ ...value, loading: false, error: null }));
      return undefined;
    }

    const load = async (sessionUser = null) => {
      try {
        const user = sessionUser || await services.identity.getCurrentUser();
        if (!user) {
          if (active) setState({ loading: false, user: null, profile: null, entitlements: [], capabilities: ['consumer'], error: null });
          return;
        }
        const [profile, entitlements] = await Promise.all([
          services.profile.getCurrentProfile(),
          services.entitlements.getCurrentUserEntitlements(),
        ]);
        const capabilities = evaluateProfileCapabilities(profile, entitlements);
        if (active) setState({ loading: false, user, profile, entitlements, capabilities, error: null });
      } catch (error) {
        if (active) setState(value => ({ ...value, loading: false, error }));
      }
    };

    void load();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user || null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [services]);

  const value = useMemo(() => ({
    ...state,
    services,
    identitySnapshot: state.user && state.profile ? createIdentitySnapshot(state.user, state.profile, state.entitlements) : null,
    configured: Boolean(supabase),
    requireSupabase,
  }), [services, state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used inside AppProvider.');
  return context;
}
