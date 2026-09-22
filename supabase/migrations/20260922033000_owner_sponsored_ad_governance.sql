-- Owner-sponsored advertising governance and business submission convergence.
-- Kleenest Sponsored remains contextual platform inventory; consumer Remove Ads affects network ads only.

alter table public.sponsored_campaigns
  add column if not exists business_id uuid references public.businesses(id) on delete set null,
  add column if not exists submission_status text not null default 'owner_managed',
  add column if not exists review_note text,
  add column if not exists archived_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='sponsored_campaigns_submission_status_check'
      and conrelid='public.sponsored_campaigns'::regclass
  ) then
    alter table public.sponsored_campaigns
      add constraint sponsored_campaigns_submission_status_check
      check (submission_status in ('owner_managed','draft','submitted','approved','rejected','withdrawn'));
  end if;
end $$;

create index if not exists sponsored_campaigns_business_submission_idx
  on public.sponsored_campaigns(business_id,submission_status,updated_at desc)
  where archived_at is null;

create table if not exists public.sponsorship_runtime_settings (
  singleton boolean primary key default true check (singleton),
  sponsored_serving_enabled boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.sponsorship_runtime_settings(singleton,sponsored_serving_enabled)
values(true,true)
on conflict(singleton) do nothing;

alter table public.sponsorship_runtime_settings enable row level security;
revoke all on table public.sponsorship_runtime_settings from anon,authenticated;
grant all on table public.sponsorship_runtime_settings to service_role;

create or replace function public.business_sponsorship_snapshot(p_business_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path=''
as $function$
declare v_result jsonb;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if not public.business_can_manage(p_business_id) then raise exception 'business management access required' using errcode='42501'; end if;

  select jsonb_build_object(
    'placements',coalesce((
      select jsonb_agg(to_jsonb(a) order by a.surface,a.priority desc)
      from public.ad_placements a
      where a.active=true and a.owner_enabled=true
    ),'[]'::jsonb),
    'campaigns',coalesce((
      select jsonb_agg(
        to_jsonb(c) || jsonb_build_object(
          'placements',coalesce((select jsonb_agg(cp.placement_code) from public.sponsored_campaign_placements cp where cp.campaign_id=c.id),'[]'::jsonb),
          'impressions',(select count(*) from public.sponsored_events e where e.campaign_id=c.id and e.event_type='impression'),
          'clicks',(select count(*) from public.sponsored_events e where e.campaign_id=c.id and e.event_type='click'),
          'dismissals',(select count(*) from public.sponsored_events e where e.campaign_id=c.id and e.event_type='dismiss')
        )
        order by c.updated_at desc
      )
      from public.sponsored_campaigns c
      where c.business_id=p_business_id and c.archived_at is null
    ),'[]'::jsonb),
    'rules',jsonb_build_object(
      'requires_owner_approval',true,
      'hero_is_organic_only',true,
      'paid_can_change_trust',false,
      'sensitive_targeting_allowed',false,
      'allowed_targeting_keys',jsonb_build_array('coarse_region','route_context','amenities','time_bucket','broad_interests'),
      'remove_ads_affects_sponsored',false
    )
  ) into v_result;
  return v_result;
end;
$function$;

create or replace function public.business_upsert_sponsored_campaign(
  p_business_id uuid,
  p_campaign_id uuid,
  p_name text,
  p_headline text,
  p_body text,
  p_cta_label text,
  p_destination_url text,
  p_targeting jsonb,
  p_frequency_cap_daily integer,
  p_impression_cap_total bigint,
  p_placement_codes text[],
  p_submit boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_id uuid:=coalesce(p_campaign_id,gen_random_uuid());
  v_business_name text;
  v_bad_key text;
  v_existing public.sponsored_campaigns;
  v_after jsonb;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if not public.business_can_manage(p_business_id) then raise exception 'business management access required' using errcode='42501'; end if;

  select b.name into v_business_name from public.businesses b where b.id=p_business_id;
  if v_business_name is null then raise exception 'business not found' using errcode='22023'; end if;

  if p_campaign_id is not null then
    select * into v_existing from public.sponsored_campaigns c where c.id=p_campaign_id;
    if not found or v_existing.business_id is distinct from p_business_id then
      raise exception 'campaign does not belong to this business' using errcode='42501';
    end if;
    if v_existing.archived_at is not null then raise exception 'archived campaigns cannot be edited' using errcode='22023'; end if;
    if v_existing.submission_status in ('submitted','approved') then
      raise exception 'submitted or approved campaigns require owner review before editing' using errcode='22023';
    end if;
  end if;

  if nullif(trim(p_name),'') is null or nullif(trim(p_headline),'') is null or nullif(trim(p_destination_url),'') is null then
    raise exception 'campaign name, headline and destination URL are required' using errcode='22023';
  end if;
  if p_destination_url !~* '^https://' then raise exception 'destination URL must use https' using errcode='22023'; end if;
  if coalesce(array_length(p_placement_codes,1),0)=0 then raise exception 'at least one placement is required' using errcode='22023'; end if;

  select keys.key into v_bad_key
  from jsonb_object_keys(coalesce(p_targeting,'{}'::jsonb)) as keys(key)
  where keys.key not in ('coarse_region','route_context','amenities','time_bucket','broad_interests')
  limit 1;
  if v_bad_key is not null then raise exception 'sensitive or unsupported targeting key: %',v_bad_key using errcode='22023'; end if;

  if exists (
    select 1 from public.ad_placements a
    where a.placement_code=any(coalesce(p_placement_codes,array[]::text[]))
      and (not a.active or not a.owner_enabled or position('hero' in lower(a.placement_code))>0 or position('hero' in lower(a.slot))>0)
  ) then raise exception 'selected placement is unavailable for sponsored inventory' using errcode='22023'; end if;

  insert into public.sponsored_campaigns(
    id,business_id,name,sponsor_name,headline,body,cta_label,destination_url,status,submission_status,review_note,
    targeting,frequency_cap_daily,impression_cap_total,owner_priority,created_by,updated_by,updated_at,archived_at
  ) values(
    v_id,p_business_id,trim(p_name),v_business_name,trim(p_headline),nullif(trim(coalesce(p_body,'')),''),
    coalesce(nullif(trim(p_cta_label),''),'Learn more'),trim(p_destination_url),'draft',
    case when p_submit then 'submitted' else 'draft' end,null,
    coalesce(p_targeting,'{}'::jsonb),greatest(1,least(coalesce(p_frequency_cap_daily,2),20)),p_impression_cap_total,0,
    auth.uid(),auth.uid(),now(),null
  )
  on conflict(id) do update set
    name=excluded.name,sponsor_name=excluded.sponsor_name,headline=excluded.headline,body=excluded.body,cta_label=excluded.cta_label,
    destination_url=excluded.destination_url,status='draft',submission_status=excluded.submission_status,review_note=null,
    targeting=excluded.targeting,frequency_cap_daily=excluded.frequency_cap_daily,impression_cap_total=excluded.impression_cap_total,
    updated_by=auth.uid(),updated_at=now();

  delete from public.sponsored_campaign_placements where campaign_id=v_id;
  insert into public.sponsored_campaign_placements(campaign_id,placement_code)
  select v_id,u.code
  from unnest(p_placement_codes) as u(code)
  join public.ad_placements a on a.placement_code=u.code
  where a.active=true and a.owner_enabled=true;

  select to_jsonb(c) || jsonb_build_object(
    'placements',coalesce((select jsonb_agg(cp.placement_code) from public.sponsored_campaign_placements cp where cp.campaign_id=v_id),'[]'::jsonb)
  ) into v_after
  from public.sponsored_campaigns c where c.id=v_id;

  insert into public.relevance_sponsorship_audit(actor_user_id,action,entity_type,entity_key,previous_state,next_state,reason)
  values(auth.uid(),case when p_submit then 'submit' else 'business_upsert' end,'sponsored_campaign',v_id::text,
    case when p_campaign_id is null then null else to_jsonb(v_existing) end,v_after,
    case when p_submit then 'Business submitted sponsored campaign for owner review' else 'Business saved sponsored campaign draft' end);

  return v_after;
end;
$function$;

create or replace function public.business_withdraw_sponsored_campaign(p_business_id uuid,p_campaign_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare v_before jsonb; v_after jsonb;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if not public.business_can_manage(p_business_id) then raise exception 'business management access required' using errcode='42501'; end if;
  select to_jsonb(c) into v_before from public.sponsored_campaigns c
  where c.id=p_campaign_id and c.business_id=p_business_id and c.archived_at is null;
  if v_before is null then raise exception 'campaign not found' using errcode='22023'; end if;

  update public.sponsored_campaigns
  set submission_status='withdrawn',status='ended',updated_by=auth.uid(),updated_at=now()
  where id=p_campaign_id and business_id=p_business_id
  returning to_jsonb(public.sponsored_campaigns) into v_after;

  insert into public.relevance_sponsorship_audit(actor_user_id,action,entity_type,entity_key,previous_state,next_state,reason)
  values(auth.uid(),'withdraw','sponsored_campaign',p_campaign_id::text,v_before,v_after,'Business withdrew sponsored campaign');
  return v_after;
end;
$function$;

create or replace function public.owner_set_sponsorship_enabled(
  p_enabled boolean,
  p_reason text default 'KleenestOS global sponsored serving update'
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare v_before jsonb; v_after jsonb;
begin
  if not public.is_platform_owner_session() then raise exception 'platform owner access required' using errcode='42501'; end if;
  select to_jsonb(s) into v_before from public.sponsorship_runtime_settings s where s.singleton=true;
  insert into public.sponsorship_runtime_settings(singleton,sponsored_serving_enabled,updated_by,updated_at)
  values(true,p_enabled,auth.uid(),now())
  on conflict(singleton) do update set sponsored_serving_enabled=excluded.sponsored_serving_enabled,updated_by=auth.uid(),updated_at=now();
  select to_jsonb(s) into v_after from public.sponsorship_runtime_settings s where s.singleton=true;
  insert into public.relevance_sponsorship_audit(actor_user_id,action,entity_type,entity_key,previous_state,next_state,reason)
  values(auth.uid(),'global_serving','sponsorship_runtime','global',v_before,v_after,p_reason);
  return v_after;
end;
$function$;

create or replace function public.owner_review_sponsored_campaign(
  p_campaign_id uuid,
  p_decision text,
  p_review_note text default null,
  p_reason text default 'KleenestOS sponsored campaign review'
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare v_before jsonb; v_after jsonb;
begin
  if not public.is_platform_owner_session() then raise exception 'platform owner access required' using errcode='42501'; end if;
  if p_decision not in ('approve','reject') then raise exception 'decision must be approve or reject' using errcode='22023'; end if;
  select to_jsonb(c) into v_before from public.sponsored_campaigns c
  where c.id=p_campaign_id and c.business_id is not null and c.archived_at is null;
  if v_before is null then raise exception 'business sponsored campaign not found' using errcode='22023'; end if;

  update public.sponsored_campaigns
  set submission_status=case when p_decision='approve' then 'approved' else 'rejected' end,
      status=case when p_decision='approve' then 'active' else 'draft' end,
      review_note=nullif(trim(coalesce(p_review_note,'')),''),
      updated_by=auth.uid(),updated_at=now()
  where id=p_campaign_id
  returning to_jsonb(public.sponsored_campaigns) into v_after;

  insert into public.relevance_sponsorship_audit(actor_user_id,action,entity_type,entity_key,previous_state,next_state,reason)
  values(auth.uid(),p_decision,'sponsored_campaign',p_campaign_id::text,v_before,v_after,p_reason);
  return v_after;
end;
$function$;

create or replace function public.owner_archive_sponsored_campaign(
  p_campaign_id uuid,
  p_reason text default 'KleenestOS sponsored campaign archive'
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare v_before jsonb; v_after jsonb;
begin
  if not public.is_platform_owner_session() then raise exception 'platform owner access required' using errcode='42501'; end if;
  select to_jsonb(c) into v_before from public.sponsored_campaigns c where c.id=p_campaign_id and c.archived_at is null;
  if v_before is null then raise exception 'campaign not found or already archived' using errcode='22023'; end if;
  update public.sponsored_campaigns
  set status='ended',archived_at=now(),updated_by=auth.uid(),updated_at=now()
  where id=p_campaign_id
  returning to_jsonb(public.sponsored_campaigns) into v_after;
  insert into public.relevance_sponsorship_audit(actor_user_id,action,entity_type,entity_key,previous_state,next_state,reason)
  values(auth.uid(),'archive','sponsored_campaign',p_campaign_id::text,v_before,v_after,p_reason);
  return v_after;
end;
$function$;

create or replace function public.owner_relevance_sponsorship_snapshot()
returns jsonb
language plpgsql
stable
security definer
set search_path=''
as $function$
declare v_result jsonb;
begin
  if not public.is_platform_owner_session() then raise exception 'platform owner access required' using errcode='42501'; end if;
  select jsonb_build_object(
    'sponsored_serving_enabled',coalesce((select s.sponsored_serving_enabled from public.sponsorship_runtime_settings s where s.singleton=true),true),
    'pending_review_count',(select count(*) from public.sponsored_campaigns c where c.submission_status='submitted' and c.archived_at is null),
    'hero_policies',coalesce((select jsonb_agg(to_jsonb(p) order by p.surface_code) from public.organic_hero_policies p),'[]'::jsonb),
    'placements',coalesce((select jsonb_agg(to_jsonb(a) order by a.surface,a.priority desc) from public.ad_placements a),'[]'::jsonb),
    'campaigns',coalesce((
      select jsonb_agg(
        to_jsonb(c) || jsonb_build_object(
          'business_name',(select b.name from public.businesses b where b.id=c.business_id),
          'placements',coalesce((select jsonb_agg(cp.placement_code) from public.sponsored_campaign_placements cp where cp.campaign_id=c.id),'[]'::jsonb),
          'impressions',(select count(*) from public.sponsored_events e where e.campaign_id=c.id and e.event_type='impression'),
          'clicks',(select count(*) from public.sponsored_events e where e.campaign_id=c.id and e.event_type='click'),
          'dismissals',(select count(*) from public.sponsored_events e where e.campaign_id=c.id and e.event_type='dismiss')
        )
        order by c.updated_at desc
      )
      from public.sponsored_campaigns c
      where c.archived_at is null
    ),'[]'::jsonb),
    'rules',jsonb_build_object(
      'hero_is_organic_only',true,
      'paid_can_change_trust',false,
      'sensitive_targeting_allowed',false,
      'allowed_targeting_keys',jsonb_build_array('coarse_region','route_context','amenities','time_bucket','broad_interests'),
      'premium_removes_sponsored',false,
      'remove_ads_affects_sponsored',false,
      'business_campaigns_require_owner_approval',true
    )
  ) into v_result;
  return v_result;
end;
$function$;

create or replace function public.consumer_sponsored_cards(p_surface text,p_context jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path=''
as $function$
declare
  v_user uuid:=auth.uid();
  v_serving_enabled boolean;
  v_result jsonb;
begin
  select coalesce(s.sponsored_serving_enabled,true) into v_serving_enabled
  from public.sponsorship_runtime_settings s where s.singleton=true;
  if coalesce(v_serving_enabled,true)=false then return '[]'::jsonb; end if;

  select coalesce(jsonb_agg(item order by score desc,owner_priority desc),'[]'::jsonb)
  into v_result
  from (
    select jsonb_build_object(
      'campaign_id',c.id,
      'placement_code',p.placement_code,
      'label',c.label,
      'sponsor_name',c.sponsor_name,
      'headline',c.headline,
      'body',c.body,
      'cta_label',c.cta_label,
      'destination_url',c.destination_url,
      'target_location_id',c.target_location_id
    ) as item,
    c.owner_priority,
    (
      case when c.targeting='{}'::jsonb then 1 else 0 end
      + case when c.targeting ? 'coarse_region' and c.targeting->>'coarse_region'=p_context->>'coarse_region' then 8 else 0 end
      + case when c.targeting ? 'route_context' and c.targeting->>'route_context'=p_context->>'route_context' then 6 else 0 end
      + case when c.targeting ? 'time_bucket' and c.targeting->>'time_bucket'=p_context->>'time_bucket' then 3 else 0 end
      + case when c.targeting ? 'amenities' and exists (
          select 1 from jsonb_array_elements_text(coalesce(c.targeting->'amenities','[]'::jsonb)) a
          join jsonb_array_elements_text(coalesce(p_context->'amenities','[]'::jsonb)) b on a.value=b.value
        ) then 5 else 0 end
      + case when c.targeting ? 'broad_interests' and exists (
          select 1 from jsonb_array_elements_text(coalesce(c.targeting->'broad_interests','[]'::jsonb)) a
          join jsonb_array_elements_text(coalesce(p_context->'broad_interests','[]'::jsonb)) b on a.value=b.value
        ) then 4 else 0 end
    ) as score
    from public.sponsored_campaigns c
    join public.sponsored_campaign_placements cp on cp.campaign_id=c.id
    join public.ad_placements p on p.placement_code=cp.placement_code
    where p.surface=p_surface
      and p.active=true and p.owner_enabled=true
      and c.status='active'
      and c.submission_status in ('owner_managed','approved')
      and c.archived_at is null
      and (c.starts_at is null or c.starts_at<=now())
      and (c.ends_at is null or c.ends_at>now())
      and (
        v_user is null
        or (
          select count(*) from public.sponsored_events e
          where e.user_id=v_user and e.campaign_id=c.id and e.event_type='impression'
            and e.created_at>=date_trunc('day',now())
        ) < least(c.frequency_cap_daily,p.frequency_cap_daily)
      )
      and (
        c.impression_cap_total is null
        or (select count(*) from public.sponsored_events e where e.campaign_id=c.id and e.event_type='impression') < c.impression_cap_total
      )
    order by score desc,c.owner_priority desc
    limit 3
  ) ranked;
  return coalesce(v_result,'[]'::jsonb);
end;
$function$;

revoke all on function public.business_sponsorship_snapshot(uuid) from public,anon;
revoke all on function public.business_upsert_sponsored_campaign(uuid,uuid,text,text,text,text,text,jsonb,integer,bigint,text[],boolean) from public,anon;
revoke all on function public.business_withdraw_sponsored_campaign(uuid,uuid) from public,anon;
revoke all on function public.owner_set_sponsorship_enabled(boolean,text) from public,anon;
revoke all on function public.owner_review_sponsored_campaign(uuid,text,text,text) from public,anon;
revoke all on function public.owner_archive_sponsored_campaign(uuid,text) from public,anon;
revoke all on function public.owner_relevance_sponsorship_snapshot() from public,anon;
revoke all on function public.consumer_sponsored_cards(text,jsonb) from public,anon;

grant execute on function public.business_sponsorship_snapshot(uuid) to authenticated;
grant execute on function public.business_upsert_sponsored_campaign(uuid,uuid,text,text,text,text,text,jsonb,integer,bigint,text[],boolean) to authenticated;
grant execute on function public.business_withdraw_sponsored_campaign(uuid,uuid) to authenticated;
grant execute on function public.owner_set_sponsorship_enabled(boolean,text) to authenticated;
grant execute on function public.owner_review_sponsored_campaign(uuid,text,text,text) to authenticated;
grant execute on function public.owner_archive_sponsored_campaign(uuid,text) to authenticated;
grant execute on function public.owner_relevance_sponsorship_snapshot() to authenticated;
grant execute on function public.consumer_sponsored_cards(text,jsonb) to authenticated;
