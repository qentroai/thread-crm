-- Thread CRM — Supabase schema
-- Paste this into Supabase Dashboard → SQL Editor → New query → Run

-- ============================================================
-- 1. TABLES
-- ============================================================

create table accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  name text not null,
  industry text,
  website text,
  source text, -- "how we met"
  created_at timestamptz not null default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  linkedin text,
  notes text,
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  account_id uuid not null references accounts(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  stage text not null default 'New'
    check (stage in ('New','Contacted','Engaged','Qualified','Proposal','Customer','Lost')),
  pre_lost_stage text, -- remembers stage to return to on reopen
  lost_reason text,
  next_action text,
  next_action_due date,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table stage_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  lead_id uuid not null references leads(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  changed_at timestamptz not null default now()
);

create table interactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  lead_id uuid not null references leads(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  type text not null check (type in ('message','meeting','note','agent_task')),
  channel text,
  summary text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table agent_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  lead_id uuid not null references leads(id) on delete cascade,
  agent_type text not null check (agent_type in ('research','contact_lookup','message_draft')),
  input text,
  output text,
  status text not null default 'pending_approval'
    check (status in ('pending_approval','approved','discarded')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. INDEXES (keep lookups fast as data grows)
-- ============================================================

create index idx_contacts_account on contacts(account_id);
create index idx_leads_account on leads(account_id);
create index idx_leads_stage on leads(stage);
create index idx_stage_history_lead on stage_history(lead_id);
create index idx_interactions_lead on interactions(lead_id);
create index idx_agent_tasks_lead on agent_tasks(lead_id);

-- ============================================================
-- 3. ROW-LEVEL SECURITY — only you can read/write your rows
-- ============================================================

alter table accounts enable row level security;
alter table contacts enable row level security;
alter table leads enable row level security;
alter table stage_history enable row level security;
alter table interactions enable row level security;
alter table agent_tasks enable row level security;

create policy "owner full access" on accounts
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner full access" on contacts
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner full access" on leads
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner full access" on stage_history
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner full access" on interactions
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner full access" on agent_tasks
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ============================================================
-- Done. Next: enable email/password (or magic link) auth under
-- Authentication → Providers, then sign yourself up as the one user.
-- ============================================================
