# Batch F — Social / Family / Business parity

## Social

Production exposes `follows`, social post tables, activity, challenge entries, messages, and reports. The reference app has a dedicated `follows.js` consumer. Its historical follow mutation writes directly to `follows`, while Production also exposes the authoritative `follow_user(p_user_id)` RPC. Architecture therefore canonicalizes follow creation through the RPC while retaining read/unfollow behavior only where the reference contract is explicit.

## Family

Production contains `family_groups`, `family_members`, `family_accounts`, and `family_invites`, with RPCs `create_family_group`, `invite_family_member`, `accept_family_invite`, and `family_has_premium_access`. Architecture now exposes those as a separate `family` domain. No family implementation was found in the reference app search, so this is a backend-capability parity addition rather than a copied UI service.

## Messaging

Production has a `messages` table and `notify_new_message` trigger, but the reference-app search did not establish a verified client messaging contract. Architecture therefore does **not** invent send/read/delete message RPCs yet.

## Business

The reference app contains substantial business surfaces: dashboard, location management, QR management, campaigns, contests, events, promotions, review analytics, performance, intelligence, and entitlements. The reference business service is already largely RPC-backed. Architecture now creates one business management boundary instead of copying `business.js`, `businessCampaigns.js`, and `businessReviews.js` separately. Verified RPC families include `get_business_dashboard`, `business_list_locations`, `business_manage_location`, `business_manage_qr`, `business_list_campaigns`, `business_manage_campaign`, `business_list_contests`, `business_create_contest`, `business_update_contest`, `business_delete_contest`, `business_list_events`, `business_manage_event`, `business_promotion_detail`, `business_manage_promotion`, `business_summary_analytics`, `business_location_intelligence`, `business_review_analytics`, and `business_reply_review`. fileciteturn95file0L2-L2

## Architecture decision

Business entitlement checks remain a cross-cutting requirement. The reference app explicitly checks plan features before QR/campaign/contest/event/promotion mutations. fileciteturn95file0L2-L2

## Not promoted

Direct messaging mutations, social post mutations, family UI consumers, and any business operation without a verified Production RPC remain pending rather than being guessed.
