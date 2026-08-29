-- Community realtime wave: publish canonical social state changes so
-- subscribed runtime surfaces can converge without polling.
do $$
begin
  alter table public.social_activity replica identity full;
exception when undefined_table then null;
end $$;

do $$
begin
  alter table public.messages replica identity full;
exception when undefined_table then null;
end $$;

do $$
begin
  alter table public.follows replica identity full;
exception when undefined_table then null;
end $$;

-- Add tables to the Supabase realtime publication when available.
do $$
begin
  alter publication supabase_realtime add table public.social_activity;
exception when duplicate_object then null when undefined_table then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null when undefined_table then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.follows;
exception when duplicate_object then null when undefined_table then null;
end $$;
