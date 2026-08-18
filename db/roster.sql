-- KLAI 포털 — 반 명단(원장 관리). 기존 입시앱 DB에 추가만.
create table if not exists roster (
  id           uuid primary key default gen_random_uuid(),
  teacher      text not null,        -- "NEZ (Class 1)"
  class_name   text not null,        -- "2:00 ZOOM 4-2"
  student_code text not null,        -- "4217"
  student_name text not null,        -- 이연서
  student_en   text,                 -- Leanna
  book         text,                 -- 교재
  active       boolean default true, -- 재원/탈회
  sort         int default 0,
  created_at   timestamptz default now(),
  unique (teacher, class_name, student_code)
);
alter table roster enable row level security;
drop policy if exists roster_auth on roster;
create policy roster_auth on roster for all to authenticated using (true) with check (true);
