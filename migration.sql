-- ═══════════════════════════════════════════════════════════════════
-- LBN4E — Migration Supabase (v28)
-- Coller dans : Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- ─── Tables ────────────────────────────────────────────────────────

-- Configuration de l'app (une seule ligne, éditée par l'admin)
create table if not exists app_config (
  id          int  primary key default 1,
  data        jsonb not null default '{}',
  updated_at  timestamptz default now(),
  constraint  single_row check (id = 1)
);

-- Insérer la ligne vide si elle n'existe pas encore
insert into app_config (id, data)
values (1, '{}')
on conflict (id) do nothing;

-- Utilisateurs (pseudo uniquement — la page est déjà protégée par un mot de passe)
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  pseudo      text unique not null,
  created_at  timestamptz default now(),
  constraint  pseudo_length check (char_length(pseudo) between 2 and 24)
);

-- Indices débloqués par utilisateur (27 possibles : 9 jeux × 3 niveaux)
create table if not exists user_indices (
  user_id     uuid not null references users(id) on delete cascade,
  game_id     text not null,
  level       int  not null check (level between 1 and 3),
  unlocked_at timestamptz default now(),
  primary key (user_id, game_id, level)
);

-- ─── Row Level Security ────────────────────────────────────────────

alter table app_config   enable row level security;
alter table users        enable row level security;
alter table user_indices enable row level security;

-- app_config : lecture/écriture publique (le mot de passe admin protège dans l'app)
create policy "read app_config"  on app_config for select using (true);
create policy "write app_config" on app_config for all    using (true) with check (true);

-- users : lecture publique + insertion libre (site déjà protégé)
create policy "read users"   on users for select using (true);
create policy "insert users" on users for insert with check (char_length(pseudo) between 2 and 24);

-- user_indices : lecture publique + insertion libre
create policy "read indices"   on user_indices for select using (true);
create policy "insert indices" on user_indices for insert with check (true);

-- ─── Realtime ──────────────────────────────────────────────────────
-- Active le classement temps réel sur les indices
-- (Activer aussi dans : Dashboard → Database → Replication → user_indices)
alter publication supabase_realtime add table user_indices;
alter publication supabase_realtime add table users;
