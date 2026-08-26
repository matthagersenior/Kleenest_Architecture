-- Maps Core: restore Government & public discovery from canonical service records.
-- Some public-facing government locations are ingested as service/public-safety
-- records, so category matching must use stable source/name semantics rather
-- than a nonexistent or environment-specific boolean column.

DO $$
DECLARE
  fn text;
  original text;
BEGIN
  SELECT pg_get_functiondef(
    'public.map_network_nearby_v1(double precision,double precision,integer,integer,text,text,text[])'::regprocedure
  ) INTO fn;

  original := fn;

  fn := replace(
    fn,
    '(lower(p_category)=''government'' and lower(coalesce(p.category,l.place_type,'''')) like ''%government%'')',
    '(lower(p_category)=''government'' and (
      lower(coalesce(p.category,l.place_type,'''')) like ''%government%''
      OR lower(coalesce(l.name,'''')) like any(array[
        ''%city hall%'',''%town hall%'',''%county office%'',''%courthouse%'',
        ''%court house%'',''%municipal%'',''%public library%'',''%library district%'',
        ''%post office%'',''%dmv%'',''%department of motor vehicles%''
      ])
      OR lower(coalesce(l.source_metadata->>''government'','''')) in (''true'',''yes'')
      OR lower(coalesce(l.source_metadata->>''is_government'','''')) in (''true'',''yes'')
    ))'
  );

  IF fn = original THEN
    RAISE EXCEPTION 'government category predicate not found; refusing rewrite';
  END IF;

  -- The original function used p_category as both a function parameter and
  -- a CTE column alias, which caused the final category projection to read
  -- the source row category instead of the requested map category.
  fn := replace(fn, 'p.category as p_category', 'p.category as place_category');
  fn := replace(fn, 'r.p_category', 'r.place_category');

  -- Ensure a requested Government category is surfaced as Government in the
  -- canonical map response regardless of its source-side category.
  fn := replace(
    fn,
    'when lower(coalesce(p_category,''''))=''cooling_center'' then ''cooling_center'' when r.brand_name is not null',
    'when lower(coalesce(p_category,''''))=''cooling_center'' then ''cooling_center'' when lower(coalesce(p_category,''''))=''government'' then ''government'' when r.brand_name is not null'
  );

  EXECUTE fn;
END $$;

grant execute on function public.map_network_nearby_v1(double precision,double precision,integer,integer,text,text,text[]) to anon,authenticated;
