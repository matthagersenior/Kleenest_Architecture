# Batch F — Social / Family / Business parity

## Social

Production exposes `follows`, social post tables, activity, challenge entries, messages, and reports. The reference app has a dedicated `follows.js` consumer. The reference consumer directly writes `follows`. Production also exposes `follow_user(p_user_id)`, but the current Production function definition inserts into `user_follows`, while the live schema query found `follows` and did not find `user_follows`.

**Current status: BLOCKED.** Architecture must not wire follow creation until the Production function/table contract is repaired or explicitly replaced. Do not create parallel `follows` and `user_follows` stores.

## Family

Production contains `family_groups`, `family_members`, `family_accounts`, and `family_invites`, with RPCs `create_family_group`, `invite_family_member`, `accept_family_invite`, and `family_has_premium_access`. Architecture exposes those as a separate `family` domain. No family implementation was found in the reference app search, so this is a backend-capability parity addition rather than a copied UI service.

## Messaging

Production has a `messages` table and `notify_new_message` trigger, but the reference-app search did not establish a verified client messaging contract. Architecture therefore does **not** invent send/read/delete message RPCs yet.

## Business

The reference app contains substantial business surfaces: dashboard, location management, QR management, campaigns, contests, events, promotions, review analytics, performance, intelligence, and entitlements. The reference business service is largely RPC-backed. Architecture creates one business management boundary instead of copying `business.js`, `businessCampaigns.js`, and `businessReviews.js` separately.

The live Production routine inventory also exposes a much larger business surface than the first Architecture wrapper currently covers, including media, memberships, certifications/perks, preferred-location analytics, QR detail/analytics, campaign/event/promotion detail and analytics, partner management, location metrics, engagement, growth, visitors, and ROI.

## Architecture decision

Business entitlement checks remain cross-cutting. The reference app explicitly checks plan features before QR/campaign/contest/event/promotion mutations. fileciteturn196file0L2-L2

## Not promoted yet

Direct messaging mutations, social post mutations, family UI consumers, and business operations without a verified consumer/backend contract remain pending rather than being guessed.

## Interoperability warning

Business, Enterprise and Fleet all consume canonical location facts. Business-managed location records must resolve to `locations.id`; they must not create a parallel place/location identity. Business intelligence and performance should consume the same activity/evidence events used by consumer and Fleet surfaces.
