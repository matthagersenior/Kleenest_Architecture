import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, requireSupabase } from './infrastructure/supabase/client.js';
import { createIdentityService } from './domains/identity/auth.js';
import { createProfileService } from './domains/identity/profile.js';
import { createIdentitySnapshot } from './domains/identity/identity-snapshot.js';
import { createEntitlementService, evaluateProfileCapabilities, getMembershipTier, shouldShowAds, isPlatformOwner } from './domains/entitlements/access.js';
import { createBillingService } from './domains/billing/catalog.js';import { createCommerceService } from './domains/billing/commerce.js';import { createSupportService } from './domains/support/requests.js';
import { createMapNetworkService } from './domains/maps/network.js');
