create or replace function public.get_business_location_cap(p_business_id uuid)
returns integer language sql stable security invoker set search_path=public,pg_temp as $$
 select case when lower(coalesce(b.service_tier,b.tier,b.plan,'')) in ('growth','business_growth') then 5 else null end
 from public.businesses b where b.id=p_business_id;
$$;
create or replace function public.business_engagement_authorized(p_business_id uuid)
returns boolean language sql stable security invoker set search_path=public,pg_temp as $$
 select exists(select 1 from public.businesses b where b.id=p_business_id and lower(coalesce(b.service_tier,b.tier,b.plan,'')) in ('growth','business_growth','enterprise'));
$$;
create or replace function public.business_qr_authorized(p_business_id uuid)
returns boolean language sql stable security invoker set search_path=public,pg_temp as $$
 select exists(select 1 from public.businesses b where b.id=p_business_id and lower(coalesce(b.service_tier,b.tier,b.plan,'')) in ('standard','growth','business_growth','enterprise'));
$$;
create or replace function public.business_enterprise_authorized(p_business_id uuid)
returns boolean language sql stable security invoker set search_path=public,pg_temp as $$
 select exists(select 1 from public.businesses b where b.id=p_business_id and lower(coalesce(b.service_tier,b.tier,b.plan,'')) in ('growth','business_growth','enterprise'));
$$;
create or replace function public.business_fleet_authorized(p_business_id uuid)
returns boolean language sql stable security invoker set search_path=public,pg_temp as $$
 select exists(select 1 from public.businesses b where b.id=p_business_id and lower(coalesce(b.service_tier,b.tier,b.plan,''))='enterprise');
$$;
grant execute on function public.get_business_location_cap(uuid) to authenticated;
grant execute on function public.business_engagement_authorized(uuid) to authenticated;
grant execute on function public.business_qr_authorized(uuid) to authenticated;
grant execute on function public.business_enterprise_authorized(uuid) to authenticated;
grant execute on function public.business_fleet_authorized(uuid) to authenticated;
