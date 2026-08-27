import { MEMBERSHIP_UI, canUseWorkspace, getWorkspaceForMembership, normalizeMembership } from './workspaces.js';

export const MEMBERSHIP_UI_CONTRACT = Object.freeze(
  Object.fromEntries(
    Object.entries(MEMBERSHIP_UI).map(([tier, config]) => [
      tier,
      Object.freeze({
        ...config,
        workspace: getWorkspaceForMembership(tier),
      }),
    ]),
  ),
);

export function resolveMembershipUi(rawMembership, capabilities = []) {
  const membership = normalizeMembership(rawMembership);
  const config = MEMBERSHIP_UI_CONTRACT[membership] || MEMBERSHIP_UI_CONTRACT.free;
  const workspace = config.workspace;
  return Object.freeze({
    membership,
    ...config,
    workspace,
    workspaceAllowed: canUseWorkspace(capabilities, workspace),
    capabilities: [...capabilities],
  });
}

export function canAccessMembershipWorkspace({ membership = 'free', workspace = 'consumer', capabilities = [] } = {}) {
  const ui = MEMBERSHIP_UI_CONTRACT[normalizeMembership(membership)] || MEMBERSHIP_UI_CONTRACT.free;
  if (workspace === 'consumer') return true;
  if (workspace === ui.workspace) return canUseWorkspace(capabilities, workspace);
  return canUseWorkspace(capabilities, workspace);
}
