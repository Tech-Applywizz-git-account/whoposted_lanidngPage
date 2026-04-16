create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  order_id text not null,
  transaction_id text,
  transaction_status text,
  amount numeric,
  currency text default 'USD',
  payer_email text,
  payer_name text,
  full_response jsonb,
  full_name text,
  mobile_number text,
  country_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Check if RLS is enabled, if not enable it
alter table public.transactions enable row level security;

-- Allow insert access for service role (Edge Functions)
create policy "Enable insert for service role" on public.transactions
  for insert
  with check (true);

-- Allow select access for service role
create policy "Enable select for service role" on public.transactions
  for select
  using (true);
