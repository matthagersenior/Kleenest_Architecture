import { useMemo } from 'react';
import { getNavigationForWorkspace, getAvailableWorkspaces } from '../../domain/workspaces.js';
import { canAccessMembershipWorkspace, resolveMembershipUi } from '../../domain/membershipUiContract.js';

export function useWorkspaceAccess({ capabilities = [], membershipTier, presentationTier, workspaceModel, owner, previewTier, previewProduct, user, effectiveWorkspace }) {
  return useMemo(() => {
    const previewCapabilities = previewProduct?.capabilities || [];
    const effectiveCapabilities = previewTier
      ? Array.from(new Set(['consumer', ...previewCapabilities]))
      : (owner ? Array.from(new Set([...capabilities, 'owner', 'business', 'fleet', 'enterprise'])) : capabilities);
    const activeMembership = previewTier || membershipTier || 'free';
    const membershipUi = resolveMembershipUi(activeMembership, effectiveCapabilities);
    const membershipWorkspaceAllowed = canAccessMembershipWorkspace({ membership: activeMembership, workspace: effectiveWorkspace, capabilities: effectiveCapabilities });
    const navigationAllowed = getNavigationForWorkspace(effectiveWorkspace, effectiveCapabilities).length > 0;
    const allowed = effectiveWorkspace === 'admin' ? owner : (previewTier ? membershipWorkspaceAllowed : (membershipWorkspaceAllowed && navigationAllowed));
    const availableWorkspaces = previewTier
      ? [effectiveWorkspace]
      : (owner ? getAvailableWorkspaces(effectiveCapabilities) : ((workspaceModel?.availableWorkspaces?.length) ? workspaceModel.availableWorkspaces : ['consumer']));
    const displayedTier = previewTier
      ? (previewTier.replaceAll('_', ' '))
      : (owner ? 'Owner' : (workspaceModel?.membershipLabel || presentationTier || membershipUi.label || 'Free'));
    return { effectiveCapabilities, activeMembership, membershipUi, allowed, availableWorkspaces, displayedTier, authenticated: Boolean(user) };
  }, [capabilities, membershipTier, presentationTier, workspaceModel, owner, previewTier, previewProduct, user, effectiveWorkspace]);
}
