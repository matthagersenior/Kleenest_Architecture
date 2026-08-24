create index if not exists live_network_events_type_created_idx on public.live_network_events(event_type,created_at desc);
create index if not exists live_network_events_location_created_idx on public.live_network_events(location_id,created_at desc);
