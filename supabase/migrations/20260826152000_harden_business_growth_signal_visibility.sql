drop policy if exists business_growth_signals_read_authenticated on public.business_growth_signals;
create policy business_growth_signals_read_member
on public.business_growth_signals
for select to authenticated
using (exists (select 1 from public.business_members bm where bm.business_id = business_growth_signals.business_id and bm.user_id = auth.uid()));

 drop policy if exists follows_read on public.follows;
create policy follows_read_connected
on public.follows
for select to authenticated
using (follower_id = auth.uid() or following_id = auth.uid());

 drop policy if exists notification_events_authenticated_read on public.notification_events;
create policy notification_events_authenticated_read
on public.notification_events
for select to authenticated
using (actor_user_id = auth.uid() or audience_scope in ('public','community'));
