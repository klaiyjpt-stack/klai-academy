-- =====================================================================
-- 실시간 시간표 + 수업기록 (알파 우선, 전 프로그램 공용)
-- Supabase SQL 에디터에 붙여넣고 Run. 1회만.
-- =====================================================================

-- 1) 실시간 시간표 (단일 원본)
create table if not exists timetable (
  id         uuid primary key default gen_random_uuid(),
  subject    text not null,                 -- 정독(=원어민)·독해·단어&Extra·알파·문법·영어도서관
  level      text,                          -- 반 등급(초등 Advanced2, IB Y1 …) 관리목록
  day        text not null,                 -- 'mon'|'tue'|'wed'|'thu'|'fri'
  time_slot  text not null,                 -- '1시'..'8시'
  name_kor   text not null,
  code       text,                          -- 영문이름+숫자 (참고용, 형제 공유 가능)
  status     text not null default 'confirmed',  -- 'confirmed'(운영) | 'draft'(미확정 수정안)
  active     boolean not null default true,
  sort       int not null default 0,
  updated_at timestamptz not null default now()
);
-- 이미 timetable 있으면: alter table timetable add column if not exists status text not null default 'confirmed';
create index if not exists idx_timetable_slot on timetable(subject, day, time_slot) where active;
create index if not exists idx_timetable_name on timetable(name_kor);

-- 2) 수업 기록 (전 프로그램 공용, 학생×날짜)
create table if not exists session_records (
  id          uuid primary key default gen_random_uuid(),
  program     text not null,
  code        text not null,
  name_kor    text,
  date        date not null default current_date,
  attend      text,        -- 'present'|'late'|'absent'|'makeup'
  homework    text,        -- 'done'|'none'
  book        text,        -- 학습교재
  progress    text,        -- Unit·페이지
  result      text,        -- 결과 기록
  remark      text,        -- 특이사항
  distributed text,        -- 교재배부 기록
  created_by  uuid,
  updated_at  timestamptz not null default now(),
  unique(program, code, date)
);
create index if not exists idx_sr_week on session_records(date);

-- 3) Realtime 활성화 (교실 화면이 구독)
alter publication supabase_realtime add table timetable;
alter publication supabase_realtime add table session_records;

-- 4) RLS — 로그인(스태프) 사용자만 읽기/쓰기.
--    (학생·학부모 계정에는 노출 안 함. 추후 role 기반으로 조일 수 있음.)
alter table timetable        enable row level security;
alter table session_records  enable row level security;

create policy tt_auth on timetable
  for all to authenticated using (true) with check (true);
create policy sr_auth on session_records
  for all to authenticated using (true) with check (true);

-- 알림(주간 월~금 집계)은 원장 페이지 JS에서 session_records 조회 후 계산.
--   숙제 미완료 >= 2 / 주  또는  결석+지각 >= 1 / 주  → 알림.
