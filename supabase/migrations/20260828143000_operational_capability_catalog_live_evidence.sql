create or replace function public.admin_operational_capability_catalog()
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not exists (
    select 1 from public.profiles
    where id=auth.uid()
      and (is_admin=true or lower(coalesce(role::text,'')) in ('admin','owner','platform_admin'))
  ) then raise exception 'admin authorization required'; end if;

  with catalog(resource,workspace,category,expected_status) as (values
    ('ad_placements','consumer','monetization','backend_present_ui_gap'),
    ('feature_access_events','platform','telemetry','wired'),
    ('data_feature_events','platform','telemetry','backend_present_ui_gap'),
    ('user_engagement_daily','consumer','analytics','backend_present_ui_gap'),
    ('business_growth_signals','business','growth','backend_present_ui_gap'),
    ('business_search_boosts','business','growth','backend_present_ui_gap'),
    ('business_progression_events','business','progression','backend_present_ui_gap'),
    ('business_earned_perks','business','rewards','backend_present_ui_gap'),
    ('business_geofences','business','geofencing','backend_present_ui_gap'),
    ('fleet_alerts','fleet','operations','backend_present_ui_gap'),
    ('fleet_driver_scorecards','fleet','operations','backend_present_ui_gap'),
    ('fleet_maintenance_records','fleet','maintenance','backend_present_ui_gap'),
    ('fleet_metric_definitions','fleet','metrics','wired'),
    ('fleet_metric_assignments','fleet','metrics','wired'),
    ('fleet_metric_snapshots','fleet','metrics','wired'),
    ('fleet_operational_events','fleet','operations','wired'),
    ('fleet_performance_events','fleet','operations','wired'),
    ('fleet_route_updates','fleet','routing','backend_present_ui_gap'),
    ('fleet_routes','fleet','routing','backend_present_ui_gap'),
    ('fleet_vehicle_daily_metrics','fleet','metrics','backend_present_ui_gap'),
    ('fleet_vehicles','fleet','operations','backend_present_ui_gap'),
    ('fleet_drivers','fleet','operations','backend_present_ui_gap'),
    ('enterprise_engagement_events','enterprise','engagement','backend_present_ui_gap'),
    ('enterprise_intelligence_events','enterprise','intelligence','wired'),
    ('enterprise_partner_network_metrics','enterprise','analytics','wired'),
    ('qr_attribution_events','business','qr','backend_present_ui_gap'),
    ('qr_engagement_programs','business','qr','backend_present_ui_gap'),
    ('qr_intelligence_events','business','qr','backend_present_ui_gap'),
    ('qr_redemptions','business','qr','backend_present_ui_gap'),
    ('notification_deliveries','platform','notifications','wired'),
    ('notification_events','platform','notifications','wired'),
    ('notification_push_deliveries','platform','notifications','wired'),
    ('notification_push_subscriptions','platform','notifications','wired'),
    ('location_confidence','consumer','provenance','wired'),
    ('location_data_conflicts','consumer','provenance','wired'),
    ('location_observations','consumer','provenance','wired'),
    ('location_quality_observations','consumer','provenance','wired'),
    ('location_quality_reviews','consumer','provenance','wired'),
    ('location_verification_campaigns','consumer','verification','backend_present_ui_gap'),
    ('location_verification_observations','consumer','verification','backend_present_ui_gap'),
    ('location_verification_targets','consumer','verification','backend_present_ui_gap'),
    ('external_data_datasets','platform','provenance','wired'),
    ('external_data_sources','platform','provenance','wired'),
    ('external_import_jobs','platform','ingestion','backend_present_ui_gap'),
    ('external_location_records','platform','ingestion','wired'),
    ('external_observations','platform','ingestion','wired'),
    ('offline_packs','consumer','offline','wired'),
    ('offline_pack_locations','consumer','offline','wired'),
    ('offline_pack_businesses','consumer','offline','wired'),
    ('offline_pack_events','consumer','offline','wired'),
    ('route_discovery_sessions','consumer','routing','backend_present_ui_gap'),
    ('route_discovery_cells','consumer','routing','backend_present_ui_gap'),
    ('route_discovery_locations','consumer','routing','backend_present_ui_gap'),
    ('map_discovery_cache','consumer','maps','wired'),
    ('live_network_events','consumer','live','wired'),
    ('geofence_events','consumer','geofencing','wired')
  ), evidence as (
    select
      c.resource,c.workspace,c.category,c.expected_status,
      to_regclass(format('public.%I',c.resource)) is not null as resource_exists,
      case when to_regclass(format('public.%I',c.resource)) is null then null
           else (select greatest(pc.reltuples,0)::bigint from pg_class pc where pc.oid=to_regclass(format('public.%I',c.resource))) end as estimated_rows
    from catalog c
  ), reconciled as (
    select resource,workspace,category,
      case
        when not resource_exists then 'missing_backend'
        when expected_status='wired' then 'backend_present_unverified'
        else 'backend_present_ui_gap'
      end as status,
      resource_exists as exists,
      estimated_rows
    from evidence
  )
  select jsonb_build_object(
    'generated_at',now(),
    'source','live_schema_evidence',
    'summary',jsonb_build_object(
      'total',count(*),
      'backend_present_unverified',count(*) filter(where status='backend_present_unverified'),
      'backend_present_ui_gap',count(*) filter(where status='backend_present_ui_gap'),
      'missing_backend',count(*) filter(where status='missing_backend')
    ),
    'items',coalesce(jsonb_agg(to_jsonb(reconciled) order by workspace,category,resource),'[]'::jsonb)
  ) into v_result
  from reconciled;
  return v_result;
end;
$$;

revoke all on function public.admin_operational_capability_catalog() from public;
revoke all on function public.admin_operational_capability_catalog() from anon;
grant execute on function public.admin_operational_capability_catalog() to authenticated;
