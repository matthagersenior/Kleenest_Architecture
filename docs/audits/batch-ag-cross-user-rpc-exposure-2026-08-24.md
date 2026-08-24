# Batch AG — Cross-user RPC exposure hardening

- Removed authenticated EXECUTE from reward, partner-membership, quest activity, progression, attribution, discovery, preference-usage, and location-identity functions whose parameters permitted caller-selected subjects or internal workflows.
- Verified the targeted functions no longer expose authenticated EXECUTE.
- Preserved application-facing authenticated capability RPCs.
