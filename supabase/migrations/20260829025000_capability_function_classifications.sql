create table if not exists public.capability_function_classifications (
  function_signature text primary key,
  domain text not null,
  classification text not null check (classification in ('canonical','supporting','compatibility','legacy','duplicate_candidate','trigger_helper')),
  rationale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.capability_function_classifications enable row level security;

revoke all on table public.capability_function_classifications from anon, authenticated;

comment on table public.capability_function_classifications is 'Governance catalog classifying public function authority and lifecycle status.';
