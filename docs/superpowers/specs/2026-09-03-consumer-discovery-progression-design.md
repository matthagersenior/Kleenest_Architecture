# Kleenest Consumer Discovery + Progression Architecture

**Date:** 2026-09-03

## Purpose

Kleenest is not merely a restroom review application. The consumer product is a real-world discovery network in which people discover missing places and restrooms, document them, improve their data, verify observations, and build a trusted map together. The progression system makes those useful real-world contributions visible, rewarding, competitive, and durable.

This design restores two first-class consumer pillars that exist only partially or are fragmented in the current architecture: **Discovery/Contribution** and **Progression/Engagement**.

## Product loop

The canonical consumer loop is:

`Explore → Discover missing/incomplete place → Contribute evidence → Establish/strengthen canonical location → Verify/reverify → Earn XP/progression → Advance objectives/rankings → Discover next useful action`

Reviewing a restroom remains valuable but is only one contribution type. A user must not be required to complete a verified visit before helping Kleenest discover a missing location.

## 1. Canonical discovery model

### Discovery methods

Users may initiate a place discovery using any of these methods:

1. **Live GPS/on-site discovery** — current device coordinates and timestamp establish strong proximity evidence.
2. **Map-pin discovery** — user drops or adjusts a pin on the map.
3. **Address discovery** — user enters/searches an address and resolves it to coordinates.
4. **Place/business search** — user searches by business/place identity and selects or creates the missing candidate.
5. **Remote/manual discovery** — user contributes a known location while away from it.
6. **Photo-assisted discovery** — photos supplement identity, location and restroom evidence when available.

Remote discovery is explicitly supported. Physical presence is a confidence and reward signal, not a prerequisite for creating a candidate.

### Discovery lifecycle

A discovery moves through explicit trust states rather than pretending every new record is equally verified:

- `candidate` — newly submitted, possibly remote or minimally documented.
- `located` — coordinates/address sufficiently resolved.
- `documented` — meaningful identity/restroom/amenity evidence exists.
- `on_site_observed` — contribution includes credible live proximity evidence.
- `community_confirmed` — independent contributors agree on material facts.
- `verified` — Kleenest verification rules reach the required confidence threshold.
- `stale` — important facts need reverification because evidence aged or conflicted.
- `disputed` — material contradictory evidence requires resolution.

All discovery mutations preserve source, contributor, timestamp, method, location confidence, evidence provenance, freshness and contradiction state.

### Duplicate prevention

Before creating a canonical location, discovery searches existing canonical locations and external candidates by coordinates, address, normalized identity and source IDs. Probable duplicates are offered to the contributor as existing places to improve. A new canonical location is created only when the candidate cannot reasonably be matched.

## 2. Contribution model

A discovery can be progressively enriched instead of forcing one giant form. Contributions include:

- place/business name and category;
- address and GPS position;
- restroom existence/access status;
- access restrictions and hours;
- photos of place/restroom/signage where appropriate;
- accessibility and accessible-stall information;
- family/changing facilities;
- stalls, urinals, sinks and other fixture quantities;
- showers, vending and other supported amenities;
- cleanliness/condition observations;
- occupancy/crowding observations where privacy-safe;
- corrections to stale or inaccurate fields;
- verification/reverification of another contributor's observations.

Every field-level observation carries provenance and confidence. External-source claims, remote community claims, on-site community observations, business assertions and independently confirmed observations remain distinguishable.

## 3. Evidence tiers and XP weighting

XP measures useful trusted contribution, not tapping or screen time.

Evidence tiers are ordered:

1. **Remote assertion** — useful but lowest confidence/reward.
2. **Remote corroborated evidence** — address/source/photo evidence increases confidence.
3. **GPS-proximate discovery** — device proximity supports the discovery.
4. **On-site live evidence** — fresh observation captured while physically present; higher XP.
5. **Independent confirmation** — another qualified contributor confirms material facts; both original discovery value and verifier value may receive recognition.
6. **Verified/high-confidence contribution** — evidence crosses canonical verification threshold; delayed verification bonuses may be awarded to contributors who materially established the truth.

On-site live evidence MUST award more XP than an otherwise equivalent remote discovery. Verification strength, novelty, completeness, freshness and downstream usefulness can multiply base XP.

XP is never awarded merely for repeatedly submitting the same fact. Idempotency, per-action cooldowns, duplicate detection, diminishing returns and anomaly/fraud controls protect the economy.

## 4. Canonical progression engine

All engagement concepts consume a single authoritative progression event stream. There are not separate reward engines for quests, badges and contests.

A progression event includes at minimum:

- actor/user;
- canonical action type;
- canonical location/business when relevant;
- evidence/provenance reference when relevant;
- verification tier;
- base XP;
- applied multipliers/bonuses;
- final XP;
- specialty progression effects;
- objective advancement effects;
- dedupe/idempotency key;
- timestamp and source.

One real-world action may legitimately fan out to several systems. Example: an on-site first discovery can award XP, increase Explorer specialization, advance a quest, increment a badge criterion, score a campaign, advance a journey and affect a discovery leaderboard—without recording six unrelated versions of the action.

## 5. XP economy

The XP catalog must be data-driven and administratively tunable. Categories include:

- discovering a genuinely missing canonical place;
- identifying a restroom at an existing place;
- GPS/on-site evidence bonus;
- first useful photo;
- additional non-duplicate evidence photos;
- address/coordinate completion;
- amenity inventory completeness;
- accessibility documentation;
- fixture quantity documentation;
- fresh cleanliness/condition observation;
- verified check-in/visit;
- substantive review;
- correction accepted;
- stale information reverified;
- independent confirmation;
- contribution later verified by the network;
- helpful/community recognition;
- quest/mission/challenge/journey completion;
- contest placement;
- campaign milestones;
- streak milestones;
- rare/special achievements.

High-value actions are weighted by **novelty × evidence strength × completeness × freshness × verification × usefulness**. Low-value repetitive actions receive little or no XP.

## 6. Levels

### Global level

Every user has one visible Kleenest Level derived from lifetime qualifying XP. The level system must support a long progression curve rather than ending after a handful of levels. Level definitions are data-driven and may include names/titles, XP thresholds, unlocks and visual treatment.

The UI always exposes:

- current level and title;
- lifetime XP;
- XP earned within the current level;
- XP required for next level;
- progress percentage/bar;
- next unlock/reward;
- recent XP ledger with explanations.

### Specialty levels

Users additionally progress independently in specialties such as:

- Explorer — discoveries, new locations and geographic breadth;
- Verifier — confirmations, corrections and reverification;
- Accessibility Scout — accessibility/family facility intelligence;
- Restroom Mapper — amenity/fixture completeness;
- Photographer — useful accepted visual evidence;
- Reviewer — high-quality verified reviews;
- Community Contributor — helpfulness/social contribution;
- Pathfinder — geographic exploration and journey accomplishments.

A user can therefore be Global Level 38 while holding different specialty levels. Specialty XP derives from the same canonical progression events.

## 7. Objective hierarchy

### Quests

Short focused objectives, generally completable in one session or a small number of actions. Examples: discover one missing restroom, verify amenities at three places, add one accessibility observation.

### Missions

Multi-step objectives spanning several related actions or days. A mission has ordered or unordered steps, prerequisites, progress state and completion rewards.

### Challenges

Quantity, skill, geography or time-window goals. They may be daily, weekly, monthly, community-wide, business/location-specific or category-specific.

### Journeys

Long-form chaptered progression paths with prerequisites and durable milestones. Example Explorer journey:

`Neighborhood Scout → City Explorer → Regional Pathfinder → State Explorer → National Pathfinder`

Each chapter contains meaningful objectives and unlocks the next chapter.

### Contests

Competitive time-bounded events with explicit eligibility, scoring rules, start/end time, leaderboard, ties, rewards and anti-abuse rules. Contest scoring may use XP or a dedicated score derived from canonical progression events.

### Campaigns

Campaigns are containers/orchestrators that can combine quests, missions, challenges, journeys, contests and rewards. Campaign scopes include:

- Kleenest-wide;
- geographic;
- seasonal/event;
- business-sponsored;
- enterprise/network;
- nonprofit/community/public-good;
- special verification/data-quality drives.

Campaign sponsorship cannot silently distort trust/confidence. Rewards and verification authority remain separate concerns.

## 8. Badges

Badges are permanent achievement recognition. Badge criteria are data-driven and can inspect canonical progression aggregates/events.

Badge families include discovery, exploration/geography, verification, evidence quality, accessibility, amenity expertise, photos, reviews, cleanliness, stale-data recovery, community helpfulness, streaks, quests, missions, challenges, journeys, contests, campaigns, rankings, QR engagement, Fleet participation where applicable, and rare/secret achievements.

The badge catalog exposes earned, in-progress and locked badges. In-progress badges show understandable progress toward the next threshold. Historical badges remain visible even if criteria/catalog versions later change.

## 9. Rankings and leaderboards

Rankings support multiple scopes and metrics without conflating reputation with raw activity.

Scopes:

- global;
- friends/following;
- nearby/local;
- city;
- state;
- national;
- business/location;
- campaign;
- contest;
- specialty/category.

Metrics may include qualifying XP, verified discoveries, verified contributions, accessibility intelligence, useful evidence/photos, helpfulness, journey accomplishments and contest score.

Leaderboards must include minimum-quality/verification rules, abuse controls and privacy choices. Users can participate without exposing precise sensitive location history.

## 10. Consumer surfaces

### Explore

Explore remains the primary map/search surface and gains an obvious **Add / Discover a Place** action. Empty or sparse nearby results should explicitly invite discovery rather than implying the network is complete.

The map can identify incomplete/stale locations that offer useful contribution opportunities.

### Discover / Contribute

A guided workflow supports GPS, map pin, address, place search, remote entry and photos. It performs duplicate matching first, then allows progressive enrichment of identity, restroom status and amenities. The workflow clearly communicates evidence strength and potential progression value without encouraging fabricated data.

### Progress

Progress is a first-class consumer destination showing:

- global level/XP and next level;
- specialty levels;
- current streak;
- recommended nearby progression opportunities;
- active quest;
- missions;
- daily/weekly/monthly challenges;
- current journey/chapter;
- active campaigns;
- live contests;
- rankings;
- badge collection and in-progress badges;
- recent achievements;
- detailed XP history.

### Profile/community

Profiles surface selected level, specialties, badges and achievements while respecting privacy. Community contribution cards can display meaningful verified accomplishment context rather than raw XP alone.

## 11. Recommendation layer

The product should answer **“What useful thing can I do nearby right now?”** Recommendations combine nearby canonical locations with missing/stale information and active progression objectives.

Examples:

- undocumented restroom nearby;
- stale accessibility status worth reverifying;
- location missing photos;
- quest-compatible verification stop;
- active campaign target;
- journey location milestone.

Recommendations never require a user to reveal exact private history publicly.

## 12. Trust, safety and anti-gaming

Progression cannot weaken data integrity.

- Remote claims remain labeled and lower confidence until strengthened.
- On-site status requires credible fresh device/location evidence.
- Duplicate submissions do not repeatedly pay XP.
- Self-confirmation cannot count as independent confirmation.
- Suspicious velocity, impossible travel, repetitive media/evidence and coordinated manipulation are eligible for review or reward withholding.
- Deleting/reversing invalid contributions can reverse provisional XP where policy allows.
- Sponsored campaigns cannot buy verification status.
- Exact private user location history is not exposed on public leaderboards.

## 13. Interoperability

The end-to-end event graph becomes:

`External sources + user discovery → canonical location candidate/match → field observations/evidence → confidence/freshness → map/search/details → verification/reverification → canonical progression event → XP/global + specialty levels → quests/missions/challenges/journeys/badges/campaigns/contests → rankings/recommendations/notifications`

Business, Fleet, Enterprise and Owner consume the same canonical location and progression facts where authorized; they do not create competing consumer location identities or reward ledgers.

## 14. Migration and reuse

Existing Architecture/main progression, badge, quest, contest, campaign, map-discovery, evidence and amenity capabilities should be reused and converged rather than replaced blindly. Existing historical achievements and earned badge recognition must survive migration.

The current architecture already describes Progression as partial and calls out event fan-in, rewards and cross-domain achievements as missing high-value closure. This design makes that closure explicit and couples it to discovery rather than treating progression as an isolated game screen.

## 15. Acceptance criteria

The design is complete when implementation can demonstrate all of the following end-to-end:

1. A signed-in consumer can discover a genuinely missing place remotely by address/map search and create a provisional canonical candidate without checking in.
2. A signed-in consumer can discover a place using live GPS and the system records stronger evidence than an equivalent remote assertion.
3. A consumer can add photos and structured restroom/amenity observations during discovery or later enrichment.
4. Duplicate matching prevents obvious duplicate canonical locations and routes users to improve an existing record.
5. On-site live evidence awards more XP than an otherwise equivalent remote discovery.
6. The same canonical action event can advance XP, specialty progression and eligible objectives idempotently.
7. The Progress surface shows global level, XP-to-next-level, specialties, quests, missions, challenges, journeys, contests, campaigns, badges and rankings.
8. Earned/locked/in-progress badges and historical earned recognition remain available.
9. Rankings support geographic/social/campaign/contest/specialty scopes without exposing precise private location history.
10. Nearby recommendations surface missing/stale data opportunities and objective-compatible actions.
11. Fraud/duplicate/self-confirmation rules prevent obvious XP farming.
12. Existing review/check-in/evidence actions continue to feed the canonical progression engine rather than a parallel reward path.
