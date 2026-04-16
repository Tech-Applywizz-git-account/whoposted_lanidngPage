-- Simply disable RLS (if that's what you want, but be careful!)
alter table public.transactions disable row level security;

-- Even with RLS disabled, ensure the table exists correctly
create table if not exists public.transactions (
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
