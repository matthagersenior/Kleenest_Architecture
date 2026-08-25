-- Repair production migration drift for the Fleet capability gate.
-- Fleet product-facing access checks run from authenticated browser sessions.
-- Keep the function private from PUBLIC/anon while allowing authenticated users
-- to reach its internal SECURITY DEFINER authorization logic.

revoke execute on function public.has_fleet_access(uuid) from public;
grant execute on function public.has_fleet_access(uuid) to authenticated;
