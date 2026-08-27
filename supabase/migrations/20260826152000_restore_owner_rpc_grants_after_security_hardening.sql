-- Owner control-plane RPCs are authenticated entry points.
-- Authorization remains enforced inside each function; anonymous execution stays revoked.
revoke execute on function public.admin_data_integrity_summary() from anon;
grant execute on function public.admin_data_integrity_summary() to authenticated;
revoke execute on function public.admin_crud_gateway(text,text,uuid,jsonb) from anon;
grant execute on function public.admin_crud_gateway(text,text,uuid,jsonb) to authenticated;
