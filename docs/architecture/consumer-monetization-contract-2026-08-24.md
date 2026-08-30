# Consumer Monetization Contract — 2026-08-24

## Canonical rule

Free consumer accounts receive the complete consumer feature set and are monetized through advertising. Consumer Premium is a one-time $5 purchase that provides the same consumer capabilities with advertising removed.

## Feature model

- Free: all consumer capabilities + ads
- $5 one-time Premium purchase: all consumer capabilities + no ads
- Business/Fleet/Enterprise/Admin capabilities remain separately authorized organizational capabilities.

## UX requirements

Consumer surfaces must not gate core consumer functionality by membership tier. Do not render consumer feature locks, disabled premium controls, upgrade-to-unlock dialogs, or fake premium previews solely because the account is Free.

Premium messaging must communicate the actual value proposition: pay $5 once to remove ads from the complete Kleenest consumer experience. Do not describe Consumer Premium as monthly, annual, recurring, or a subscription.

## Advertising

Advertising is an orthogonal monetization capability. It must be evaluated independently from consumer feature access. Free users are eligible for ads; Consumer Premium users are not.

## Backend

The authoritative entitlement layer must expose consumer feature access independently from ad eligibility. Client presentation must consume those authoritative results rather than infer access from tier labels.
