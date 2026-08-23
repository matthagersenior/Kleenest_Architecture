// Migrated parity contract from the proven Kleenest_App source snapshot.
// These flags describe migration state; runtime behavior remains implemented by canonical domains.
export const REFERENCE_SNAPSHOT='a426c61348c5210b175ad9d62fcc0cf468cc6bfd';
export const consumerParity=Object.freeze({mapDiscovery:'existing',placeDetails:'existing',categories:'existing',checkIns:'existing',rewards:'existing',favorites:'existing',notifications:'existing',following:'existing',amenities:'existing',bathroomVerification:'existing',routes:'existing',locationEvidence:'existing',locationObservations:'existing',locationPhotos:'existing'});
export const gamificationParity=Object.freeze({progression:'existing-foundation',rewardHistory:'existing',badges:'existing',challenges:'existing',leaderboards:'existing'});
export const businessParity=Object.freeze({locations:'existing',reviews:'existing',replies:'existing',analytics:'existing-foundation',qr:'existing-foundation',promotions:'existing',campaigns:'existing',contests:'existing',events:'existing',engagementAttribution:'existing-foundation',roi:'existing'});
export const platformParity=Object.freeze({authentication:'existing',routeAuthorization:'existing',entitlements:'existing',admin:'existing-foundation',enterprise:'backend-capability-canonical-ui-pending',commerce:'stripe-boundary-pending'});
export const FEATURE_PARITY=Object.freeze({consumer:consumerParity,gamification:gamificationParity,business:businessParity,platform:platformParity});
export const getParity=(workspace='consumer')=>FEATURE_PARITY[workspace]||FEATURE_PARITY.consumer;
