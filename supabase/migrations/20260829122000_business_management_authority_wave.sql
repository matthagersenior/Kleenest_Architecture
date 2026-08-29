-- Business management authority wave: contest mutation is an authenticated business operation.
revoke execute on function public.business_manage_contest(uuid,uuid,text,jsonb) from anon;
grant execute on function public.business_manage_contest(uuid,uuid,text,jsonb) to authenticated;
