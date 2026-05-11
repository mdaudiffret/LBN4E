-- ═══════════════════════════════════════════════════════════════════
-- LBN4E — Migration Supabase v2 (v29)
-- Coller dans : Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- Codes trouvés par utilisateur (9 possibles : un par position)
create table if not exists user_codes (
  user_id     uuid not null references users(id) on delete cascade,
  code_index  int  not null check (code_index between 0 and 8),
  found_at    timestamptz default now(),
  primary key (user_id, code_index)
);

alter table user_codes enable row level security;

create policy "read codes"   on user_codes for select using (true);
create policy "insert codes" on user_codes for insert with check (true);

-- Realtime pour les codes (optionnel — pour stats admin futures)
alter publication supabase_realtime add table user_codes;
