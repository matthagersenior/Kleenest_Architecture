# Fleet RPC Authorization Matrix — 2026-08-28

## Result

Production Fleet authorization is now explicitly split into three layers:

- **OBSERVE** — authenticated members of Fleet/Enterprise businesses can read shared fleet state.
- **OPERATE** — Fleet managers/controllers can mutate operational state.
- **CONFIGURE** — Fleet metric/controller configuration remains restricted to the existing controller authority.

Platform owners retain their existing privileged path.

## Confirmed production contract

| RPC family | Classification | Authorization boundary |
|---|---|---|
| `has_fleet_access` / `fleet_observe_access` | OBSERVE | Any authenticated member of Fleet/Enterprise business; platform owner |
| `fleet_dashboard_summary_v2` | OBSERVE | Fleet observation access |
| `fleet_service_opportunities_for_business` | OBSERVE | Fleet observation access |
| `get_fleet_leaderboard` | OBSERVE | Fleet observation access |
| `get_fleet_metric_capabilities` | OBSERVE | Fleet observation access |
| `get_fleet_metric_configuration` | OBSERVE | Fleet observation access |
| `get_fleet_metric_values` | OBSERVE | Fleet observation access |
| `get_fleet_network_leaderboard` | OBSERVE | Existing network-level boundary |
| vehicle create/update/delete/status | OPERATE | `fleet_actor_is_manager` + Fleet access where applicable |
| driver create/update/delete/status | OPERATE | `fleet_actor_is_manager` + Fleet access where applicable |
| route create/update/delete/status | OPERATE | `fleet_actor_is_manager` + Fleet access where applicable |
| maintenance create/update/delete/complete | OPERATE | `fleet_actor_is_manager` |
| alert resolution | OPERATE | `fleet_actor_is_manager` |
| route notification publication | OPERATE | `fleet_actor_is_manager` |
| metric definition create/update/assignment | CONFIGURE | `fleet_metric_controller_authorized` |

## Important finding

The prior `has_fleet_access` implementation conflated **workspace/read access** with **manager/controller authority**. That produced a legitimate permission failure for lower-privilege Fleet members even though the product model intended a shared Fleet workspace.

The compatibility function now represents observation/workspace access. Mutation RPCs retain explicit manager/controller checks, so expanding read access does not expand write authority.

## UI implication

A Fleet User should be able to enter the Fleet workspace and observe shared fleet resources without receiving owner/manager controls. Controls for create/update/delete/status/resolve/configure must remain capability-gated by the existing controller contract.

The UI must also distinguish:

`locked by entitlement` ≠ `unauthorized operation` ≠ `session/RPC/network failure`.

## Security verification

`fleet_observe_access(uuid)` is explicitly executable by `authenticated` and explicitly revoked from `anon`.

Supabase security advisors still contain unrelated existing warnings elsewhere in the public schema; those are tracked separately and were not silently folded into this Fleet change.
