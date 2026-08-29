-- Consumer evidence wave: converge location photo writes on the check-in-attributed contract.
-- The legacy 8-argument overload has no evidence-session binding and must not remain
-- callable by authenticated clients. The 9-argument overload enforces user/location/
-- check-in attribution and storage-path ownership.
revoke execute on function public.submit_location_photo_record(uuid, text, text, text, text, bigint, integer, integer) from anon, authenticated;
grant execute on function public.submit_location_photo_record(uuid, text, text, text, text, bigint, integer, integer, uuid) to authenticated;
revoke execute on function public.submit_location_photo_record(uuid, text, text, text, text, bigint, integer, integer, uuid) from anon;
