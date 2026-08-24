-- Security hardening reconciled against production on 2026-08-24.
-- 1) Pin SECURITY DEFINER functions to trusted schemas.
-- 2) Remove anonymous execution from privileged/admin and internal intelligence/notification commands.

do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef = true
  loop
    execute format(
      'alter function %s set search_path = public, auth, extensions, pg_temp',
      r.signature
    );
  end loop;
end $$;

revoke execute on function public.admin_operational_capability_catalog() from anon;
revoke execute on function public.admin_crud_capability_catalog() from anon;
revoke execute on function public.admin_authorization_v1(uuid) from anon;

revoke execute on function public.create_intelligence_notification(uuid,uuid,text,text,text,text,text,jsonb,integer) from anon;
revoke execute on function public.create_intelligence_action_link(uuid,uuid,text,text,text,jsonb) from anon;
revoke execute on function public.execute_intelligence_action(uuid) from anon;
revoke execute on function public.complete_intelligence_action(uuid,jsonb) from anon;
revoke execute on function public.publish_location_notification(text,uuid,jsonb,text,timestamptz) from anon;
revoke execute on function public.send_prioritized_notification_batch(uuid,uuid[],text,text,text,jsonb) from anon;
