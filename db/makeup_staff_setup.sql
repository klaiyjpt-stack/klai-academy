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

-- KLAI 포털 — 보강 관리(실장 업무). 결석→사유판정→일정→문자→완료. 재보강X, 1회 변동O.
create table if not exists makeup (
  id            uuid primary key default gen_random_uuid(),
  student_name  text not null,
  student_code  text,
  klass         text,                    -- 반
  parent_phone  text,                    -- 학부모 연락처(문자 발송용)
  abs_date      date,                    -- 결석일
  reason        text,                    -- personal(개인사정)=보강불가 / school(학교일정) / sick(병결) / family(초상)
  proof         text,                    -- 증빙: 약봉투/진료확인서/-
  makeup_at     timestamptz,             -- 보강 일시(리마인더 조회용)
  changed       boolean default false,   -- 일정 변경된 적 있음(표시용)
  history       text,                    -- 일정 변경 이력(줄바꿈 누적)
  status        text default 'new',      -- new(대상확인) / scheduled(일정확정) / done(완료) / na(보강불가) / cancel
  notified      boolean default false,   -- 보강 안내 문자 보냄
  reminded      boolean default false,   -- 보강 전 확인 문자 보냄
  note          text,
  created_at    timestamptz default now()
);
create index if not exists idx_makeup_status on makeup(status);
alter table makeup enable row level security;
drop policy if exists makeup_auth on makeup;
create policy makeup_auth on makeup for all to authenticated using (true) with check (true);

-- PostgREST 스키마 캐시 강제 갱신
notify pgrst, 'reload schema';
