export const WORKSPACE_PRESENTATION = Object.freeze({
  consumer: {
    title: 'Consumer',
    description: 'Discover places, build trusted location knowledge, and participate.',
  },
  business: {
    title: 'Business',
    description: 'Manage locations, engagement, growth, and location intelligence.',
  },
  fleet: {
    title: 'Fleet',
    description: 'Coordinate field operations, routes, vehicles, and performance.',
  },
  enterprise: {
    title: 'Enterprise',
    description: 'Coordinate networks, partners, operations, and outcomes.',
  },
  admin: {
    title: 'Owner / Admin',
    description: 'Govern the platform, data, capabilities, and operational systems.',
  },
});

export function getWorkspacePresentation(workspace) {
  return WORKSPACE_PRESENTATION[workspace] || WORKSPACE_PRESENTATION.consumer;
}
