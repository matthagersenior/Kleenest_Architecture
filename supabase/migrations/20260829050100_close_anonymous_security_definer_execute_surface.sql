-- SECURITY DEFINER routines in the exposed public schema must not inherit
-- anonymous EXECUTE. Public discovery/read helpers that are SECURITY INVOKER
-- remain available where their RLS contract permits it.

do $$
declare r record;
begin
  for r in
    select p.oid, n.nspname, p.proname,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.prosecdef
      and has_function_privilege('anon', p.oid, 'execute')
  loop
    execute format(
      'revoke execute on function %I.%I(%s) from anon',
      r.nspname, r.proname, r.args
    );
  end loop;
end $$;
