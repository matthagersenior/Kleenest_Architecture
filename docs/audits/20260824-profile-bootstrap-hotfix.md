# Profile bootstrap hotfix

- Restored authenticated EXECUTE on `ensure_current_user_profile()`.
- Kept anonymous EXECUTE revoked.
- The client profile service explicitly calls this RPC when the authenticated user's profile row is absent.
- The live RLS policy on `profiles` already restricts reads/writes to the authenticated user's own row.
- This closes a regression introduced while hardening internal SECURITY DEFINER RPC exposure.
- The screenshot symptom is consistent with a profile bootstrap path failing: authenticated identity is present while optional account/profile fields remain empty.
