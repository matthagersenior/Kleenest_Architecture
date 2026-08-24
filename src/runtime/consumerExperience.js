export const consumerExperience = {
  principles: [
    'Free and Premium share the complete consumer capability set.',
    'Free is monetized by advertising; Premium removes advertising.',
    'Every consumer action should lead naturally to discovery, trust, utility, contribution, or progression.',
    'Technical identifiers never belong in the consumer interaction model.',
  ],
  journeys: {
    discovery: ['/','/map','/place/:id'],
    trust: ['/check-in','/evidence','/place/:id'],
    utility: ['/route','/map'],
    engagement: ['/play/quest','/games','/activity'],
    community: ['/community','/profile'],
  },
};

export const consumerActionLabels = {
  discover: 'Find a restroom',
  verify: 'Verify a visit',
  evidence: 'Add evidence',
  review: 'Share your experience',
  route: 'Plan a route',
  quest: 'Explore Trust Quests',
  games: 'Open Game Center',
  community: 'Join the community',
};
