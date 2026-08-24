-- Normalize common branded OSM/import records so the shared map can expose them
-- as first-class results without changing verification state.
update public.locations
set source_metadata = jsonb_set(
  coalesce(source_metadata,'{}'::jsonb),
  '{brand}',
  to_jsonb(coalesce(source_metadata->>'brand',source_metadata->>'brand_name')),
  true
)
where coalesce(source_metadata->>'brand','')='' and coalesce(source_metadata->>'brand_name','')<>'';

update public.locations
set source_metadata = jsonb_set(
  coalesce(source_metadata,'{}'::jsonb),
  '{operator}',
  to_jsonb(coalesce(source_metadata->>'operator',source_metadata->>'operator_name')),
  true
)
where coalesce(source_metadata->>'operator','')='' and coalesce(source_metadata->>'operator_name','')<>'';
