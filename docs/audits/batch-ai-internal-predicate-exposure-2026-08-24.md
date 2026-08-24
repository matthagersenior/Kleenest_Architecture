# Batch AI — internal predicate/capability exposure

- Removed authenticated EXECUTE from internal preferred-location eligibility predicates.
- Removed client EXECUTE from business authorization/context helpers.
- Removed client EXECUTE from QR/profile bootstrap helpers that are implementation internals.
- Removed client EXECUTE from entitlement/tier helper functions; client-facing entitlement behavior remains through supported application APIs.
- Re-queried all targeted signatures and confirmed authenticated EXECUTE is false.
