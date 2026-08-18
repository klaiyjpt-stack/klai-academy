-- ============================================================
-- KLAI 포털 — 선생님 반 기록 (기존 입시앱 DB에 '추가만')
-- 프로젝트: ipsi-material (hxlzccwqxamtsjrrtcdq)
-- 안전: 전부 create if not exists · 기존 테이블 안 건드림.
-- 식별: 데모 명단 그대로 → (teacher, class_name, date, student_code) 키.
--       나중에 실제 students 연결 시 student_id 컬럼만 추가하면 됨.
-- ============================================================

-- 1) 학생별 성적·출결·태도·영상·개별메모 (한 셀 = 학생·날짜·평가 1건)
create table if not exists class_records (
  id            uuid primary key default gen_random_uuid(),
  teacher       text not null,              -- "NEZ (Class 1)"
  class_name    text not null,              -- "2:00 ZOOM 4-2"
  date          date not null,
  eval          text not null,              -- 단어시험 / 월말평가 / 레벨테스트
  student_code  text not null,              -- "4217"
  student_name  text,                       -- 이연서 (표시용)
  attendance    text check (attendance in ('present','late','absent','excused')),
  homework      boolean,
  score         integer,
  max           integer,
  attitude      smallint,                   -- 0 우수 / 1 양호 / 2 노력요망
  note          text,
  note_type     text check (note_type in ('general','repeat','sensitive')),
  note_public   boolean default false,      -- 민감=항상 false 강제(앱단)
  video_url     text,
  video_public  boolean default false,
  published     boolean default false,      -- 학생·학부모 노출 여부
  updated_at    timestamptz default now(),
  unique (teacher, class_name, date, eval, student_code)
);
create index if not exists idx_crec_lookup on class_records(teacher, class_name, date);

-- 2) 반 전체 메모(공개) + 강사 일지(비공개) — 반·날짜당 1행
create table if not exists class_daily (
  id                    uuid primary key default gen_random_uuid(),
  teacher               text not null,
  class_name            text not null,
  date                  date not null,
  class_memo            text,               -- 반 전체 공개 메모
  class_memo_published  boolean default false,
  teacher_log           text,               -- 강사 일지(비공개)
  updated_at            timestamptz default now(),
  unique (teacher, class_name, date)
);

-- ============================================================
-- RLS — 지금은 '선생님 저장'만: 로그인(authenticated) = 전체 / anon = 차단
--   (학생·학부모 토큰 열람 정책은 다음 단계에서 추가)
-- ============================================================
alter table class_records enable row level security;
alter table class_daily   enable row level security;

drop policy if exists crec_auth on class_records;
create policy crec_auth on class_records for all
  to authenticated using (true) with check (true);

drop policy if exists cday_auth on class_daily;
create policy cday_auth on class_daily for all
  to authenticated using (true) with check (true);

-- 끝. 실행 후 PostgREST 캐시 자동 갱신(수 초). 선생님 페이지에서 저장 연결.
