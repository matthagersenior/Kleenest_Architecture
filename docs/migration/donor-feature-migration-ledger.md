# Donor Feature Migration Ledger

## Purpose

`Kleenest_Architecture` is the forward source. Existing repositories are donor/reference sources. This ledger records working donor capabilities that were verified in commit history and mapped into the existing architecture without changing the canonical architecture or interoperability matrix.

## Verified donor → architecture migrations

| Donor capability / evidence | Donor commit | Architecture destination / evidence | Status |
|---|---|---|---|
| Supabase map + place loading | `711146225f5b9de0c7857be3e3368553c8c04309` | canonical map network + map runtime (`d48c6e8c`, `16b37db7`, `c169e8fc`) | migrated |
| Universal Supabase discovery | `444cc14cedab0e25fe47ace50b4dfa65ca0bbb3d`, `b2ef337d99513b9bd08c507cb1d4dab4ce0a2cb9` | canonical map/discovery/location graph | migrated |
| Supabase authentication/session | `02cbb13e185d0399e2fd16dd0aa2ab60ac10bf0d`, `e065cd824d2b5fd3b28f8383822fb90f574d89e6` | canonical runtime/auth/profile surfaces (`c0f8db5b`, profile service lineage) | migrated |
| Supabase profile service + schema alignment | `362417e0aa8726c0780afd158d927ae5872952ce`, `c7b75547ceb23c46d1bf831a4f15e0d6b09cba42` | canonical profile service (`6ac79538`, `bf7390b8`, `b65dc89e`, `2e1c0f5e`) | migrated |
| Community reviews | `10429d754d2b5fd3b28f8383822fb90f574d89e6` | Community capability/service + verified production RPC reconciliation (`657c27a0`, community parity lineage) | migrated |
| Review media | `0f8ff04a422f480ab7dfef05c0fa0d8844370190` | canonical media capability boundary + Community media service (`4d538cc`, `285039ad`, `2bd25dbc`) | migrated |
| Real check-ins / points | `de210dbed75e94d5671959774774f06554ace018` | canonical check-in/QR/progression graph (`cf8bd898`, `52e7638e`, verified progression lineage) | migrated |
| Rewards refresh / live summary | `99bfe89d66c2cccc4c4289dc45b7fd3a2eb6b6e2` | verified progression/reward contracts (`b82019ee`) | migrated |
| Canonical favorites RPC | `cbfe34e026a0548e16d86d3d1cd0436c89017aba` | canonical consumer/favorite capability lineage and blocker reconciliation (`a7a95c03`) | migrated |
| Location verification RPC | `458924498f5095323019a69beda1873f738ec83e` | verified location quality / bathroom verification authority (`c39d0df`, `86f93fa`) | migrated |
| Route lifecycle production RPCs | `1b65cd6e5b5be274d1673f0ce40f4212c1e70d16` | canonical route lifecycle (`deedf363`, `4124d41`, `384790cd`) | migrated |
| Fleet + Enterprise RPC bridge | `a04c54dae22af18a762761b1b00095cdf6d29113` | canonical Fleet operations, partner capabilities, intelligence and Enterprise services (`0e92791`, `1255c730`, `0707a046`, `d234ebeb`) | migrated |
| Supabase capability contract/control center | `65d8bf8f7fb2c7272dad218079ec939e3e37798d`, `af388d127ff21f26db52ef36882afc45407b011d`, `0d6f6e2c5760477dbda1740151885f70feb1725c` | canonical capability registry/hubs and runtime exposure (`e5011f14`, `5c0dfef`, `03376992`, `dc4b03c`) | migrated |
| Feature navigation / workspace routing | `61f368251344f524fa3218d56c8da6cfed695893`, `b0af3c9ebb3dacc1ddfb8db8e6f8bdcf54322d79`, `c90c49287628f96033390bffbf2a5117e329fcb7` | canonical route/workspace lifecycle and interaction hubs (`ac11abe`, `7ba221f`, `4124d41`, `a7bd765`) | migrated |
| Live location intelligence on place details | `36229f5b27a98ac577fc4f149c867662e9c7b58d` | canonical location/evidence/intelligence graph (`6c1c23af`, verification read-model lineage) | migrated |

## Operating rule

A donor feature is migrated when its working behavior, backend capability, and downstream consumer can be placed into an existing Architecture domain/capability boundary. The architecture and interoperability matrix remain authoritative; donor code is adapted to them rather than changing them merely to match legacy code.

## Next sweep

Continue comparing donor commit history against the Architecture source for any working feature whose capability is not yet represented in the canonical runtime. Treat an absent mapping as a candidate for migration, not as permission to alter the architecture. Stop only for an actual Production contract/security blocker.
