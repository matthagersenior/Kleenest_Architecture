-- Expand the canonical external-location source registry with free restroom
-- sources. Adapters must normalize into ingest_external_locations() rather than
-- writing source-specific fields directly into canonical locations.
insert into public.external_data_sources(
  source_key,name,source_url,license_name,license_url,attribution_text,active
) values
(
  'refuge_restrooms','REFUGE Restrooms','https://refugerestrooms.org','REFUGE Restrooms open-source dataset; verify current API terms',
  'https://refugerestrooms.org/api/docs/',
  'Data from REFUGE Restrooms',true
),
(
  'stlouis_open_data','City of St. Louis Open Data','https://www.stlouis-mo.gov/data/',
  'Dataset-specific public-data terms',
  'https://www.stlouis-mo.gov/data/',
  'Source: City of St. Louis Open Data',true
),
(
  'nps','National Park Service','https://www.nps.gov/subjects/developer/api-documentation.htm',
  'U.S. Government open data; dataset-specific terms apply',
  'https://www.nps.gov/subjects/developer/api-documentation.htm',
  'Source: National Park Service',true
),
(
  'transit_gtfs','Transit GTFS feeds','https://gtfs.org/',
  'Feed-specific terms',
  'https://gtfs.org/documentation/overview/',
  'Source: originating transit agency GTFS feed',true
)
on conflict(source_key) do update set
  name=excluded.name,
  source_url=excluded.source_url,
  license_name=excluded.license_name,
  license_url=excluded.license_url,
  attribution_text=excluded.attribution_text,
  active=true,
  updated_at=now();

-- Track reconciliation semantics explicitly. A zero insert count is not a
-- failure when acquisition and canonical persistence both succeeded.
comment on table public.external_import_jobs is
'External ingestion jobs. records_seen is acquired/normalized records; records_imported is newly created canonical locations. Zero records_imported is valid when records_seen > 0 and canonical persistence succeeded.';
