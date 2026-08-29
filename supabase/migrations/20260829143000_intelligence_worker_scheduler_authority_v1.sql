-- Canonical privileged queue workers. Keep these functions inaccessible to browser roles.
-- pg_cron executes them as its configured database role; no authenticated/anon grant is required.
revoke execute on function public.process_intelligence_notification_jobs(integer) from public,anon,authenticated;
revoke execute on function public.process_intelligence_action_jobs(integer) from public,anon,authenticated;

-- Reassert the two authoritative queue workers as active cron jobs without duplicating names.
do $$
begin
  if not exists(select 1 from cron.job where jobname='kleenest-intelligence-notification-worker') then
    perform cron.schedule('kleenest-intelligence-notification-worker','* * * * *','select public.process_intelligence_notification_jobs(50);');
  end if;
  if not exists(select 1 from cron.job where jobname='kleenest-intelligence-action-worker') then
    perform cron.schedule('kleenest-intelligence-action-worker','*/5 * * * *','select public.process_intelligence_action_jobs(50);');
  end if;
end $$;

comment on function public.process_intelligence_notification_jobs(integer) is 'Privileged canonical notification queue worker; invoked by pg_cron, never directly by browser roles.';
comment on function public.process_intelligence_action_jobs(integer) is 'Privileged canonical action queue worker; invoked by pg_cron, never directly by browser roles.';
