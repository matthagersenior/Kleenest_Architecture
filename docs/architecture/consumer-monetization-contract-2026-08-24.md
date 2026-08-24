# Consumer Monetization Contract — 2026-08-24

## Canonical rule

Free consumer accounts receive the complete consumer feature set and are monetized through advertising. The $5 consumer membership provides the same consumer capabilities with advertising removed.

## Feature model

- Free: all consumer capabilities + ads
- $5 Premium: all consumer capabilities + no ads
- Business/Fleet/Enterprise/Admin capabilities remain separately authorized organizational capabilities.

## UX requirements

Consumer surfaces must not gate core/premium consumer functionality by membership tier. Do not render consumer feature locks, disabled premium controls, upgrade-to-unlock dialogs, or fake premium previews solely because the account is Free.

Subscription messaging should communicate the actual value proposition: the same Kleenest experience without ads.

## Advertising

Advertising is an orthogonal monetization capability. It must be evaluated independently from consumer feature access. Free users are eligible for ads; $5 Premium users are not.

## Backend

The authoritative entitlement layer must expose consumer feature access independently from ad eligibility. Client presentation must consume those authoritative results rather than infer access from tier labels.
