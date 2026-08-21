-- KLAI 포털 — 강사 명단(이름만, 자주 변동). 로그인은 학원 대표 계정 공용.
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort int default 0,
  active boolean default true,
  created_at timestamptz default now()
);
alter table staff enable row level security;
drop policy if exists staff_auth on staff;
create policy staff_auth on staff for all to authenticated using (true) with check (true);

-- 현재 roster의 반(선생님) 이름으로 시드(있으면 무시)
insert into staff (name, sort)
select teacher, min(sort) from roster group by teacher
on conflict (name) do nothing;
