-- Tentatives de soumission des codes (une ligne par clic sur "Soumettre les codes")
create table if not exists user_attempts (
  id           bigserial primary key,
  user_id      uuid not null references users(id) on delete cascade,
  attempted_at timestamptz default now()
);

alter table user_attempts enable row level security;

create policy "read attempts"   on user_attempts for select using (true);
create policy "insert attempts" on user_attempts for insert with check (true);

alter publication supabase_realtime add table user_attempts;
