-- ============================================================
-- KLAI 포털 Phase 2 — 학생 개인 기록 (성적·출결·리포트)
-- 실행: Supabase(ipsi-material) → SQL Editor → 붙여넣고 Run.
-- 안전: 전부 "if not exists" — 여러 번 실행해도 됨.
-- 전제(공유스키마): profiles / classes / students / student_guardians
--   없으면 아래 0)에서 함께 생성.
-- ============================================================

-- 0) 공유 기반 (이미 있으면 건너뜀) --------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','teacher','parent','student')),
  display_name text,
  created_at timestamptz default now()
);
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null, year int,
  teacher_id uuid references profiles(id),
  created_at timestamptz default now()
);
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null, student_no text unique,
  class_id uuid references classes(id),
  user_id uuid references profiles(id),
  active boolean default true,
  created_at timestamptz default now()
);
create table if not exists student_guardians (
  student_id uuid references students(id) on delete cascade,
  guardian_id uuid references profiles(id) on delete cascade,
  relation text, primary key (student_id, guardian_id)
);

-- 1) 성적 -------------------------------------------------------
create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  class_id uuid references classes(id),
  kind text not null default 'etc',       -- word|monthly|level|etc
  title text not null,                     -- 예: 단어시험 Day5
  score numeric, max numeric,              -- 취득/만점 (숫자형)
  grade text,                              -- 예: A · Level 3 통과 (텍스트형)
  date date not null default current_date,
  created_at timestamptz default now()
);
create index if not exists idx_scores_student on scores(student_id);

-- 2) 출결 -------------------------------------------------------
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  class_id uuid references classes(id),
  date date not null,
  status text not null check (status in ('present','absent','late','excused')),
  note text,
  created_at timestamptz default now(),
  unique (student_id, date)
);
create index if not exists idx_attendance_student on attendance(student_id);

-- 3) 리포트 (월말·레벨 결과지) ----------------------------------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  class_id uuid references classes(id),
  title text not null,                     -- 예: 7월 월말 리포트
  period text,                             -- 예: 2026-07
  summary text,                            -- 코멘트·요약
  file_url text,                           -- 결과지 이미지/PDF (Storage)
  status text default 'posted' check (status in ('draft','posted')),
  created_at timestamptz default now()
);
create index if not exists idx_reports_student on reports(student_id);

-- ============================================================
-- RLS — 각자 자기 것만 (학생 본인 / 학부모 자녀 / 강사 담당반 / 원장 전체)
-- ============================================================
alter table students   enable row level security;
alter table classes    enable row level security;
alter table scores     enable row level security;
alter table attendance enable row level security;
alter table reports    enable row level security;

-- 공통 헬퍼: 관리자 여부
create or replace function is_admin() returns boolean language sql stable as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role='admin');
$$;

-- students: 본인/자녀/담당반/관리자 읽기
drop policy if exists students_read on students;
create policy students_read on students for select using (
  user_id = auth.uid()
  or exists (select 1 from student_guardians g where g.student_id = students.id and g.guardian_id = auth.uid())
  or exists (select 1 from classes c where c.id = students.class_id and c.teacher_id = auth.uid())
  or is_admin()
);
drop policy if exists students_write on students;
create policy students_write on students for all using (is_admin()) with check (is_admin());

-- classes: 로그인 사용자 읽기(반 이름 비민감), 쓰기는 관리자
drop policy if exists classes_read on classes;
create policy classes_read on classes for select using (auth.uid() is not null);
drop policy if exists classes_write on classes;
create policy classes_write on classes for all using (is_admin()) with check (is_admin());

-- 기록 3종 공통: 본인 학생행이면 읽기 / 자녀 / 담당반 / 관리자. 쓰기=담당반·관리자.
do $$
declare t text;
begin
  foreach t in array array['scores','attendance','reports'] loop
    execute format('drop policy if exists %I_read on %I', t, t);
    execute format($f$
      create policy %1$I_read on %1$I for select using (
        exists (select 1 from students s where s.id = %1$I.student_id and s.user_id = auth.uid())
        or exists (select 1 from student_guardians g where g.student_id = %1$I.student_id and g.guardian_id = auth.uid())
        or exists (select 1 from classes c where c.id = %1$I.class_id and c.teacher_id = auth.uid())
        or is_admin()
      )$f$, t);
    execute format('drop policy if exists %I_write on %I', t, t);
    execute format($f$
      create policy %1$I_write on %1$I for all using (
        exists (select 1 from classes c where c.id = %1$I.class_id and c.teacher_id = auth.uid()) or is_admin()
      ) with check (
        exists (select 1 from classes c where c.id = %1$I.class_id and c.teacher_id = auth.uid()) or is_admin()
      )$f$, t);
  end loop;
end $$;

-- reports: 학생/학부모는 posted만 (draft 숨김)  ← 위 read를 덮어씀
drop policy if exists reports_read on reports;
create policy reports_read on reports for select using (
  (
    status='posted' and (
      exists (select 1 from students s where s.id = reports.student_id and s.user_id = auth.uid())
      or exists (select 1 from student_guardians g where g.student_id = reports.student_id and g.guardian_id = auth.uid())
    )
  )
  or exists (select 1 from classes c where c.id = reports.class_id and c.teacher_id = auth.uid())
  or is_admin()
);

-- ============================================================
-- 4) 테스트 시드 — test01 계정(uid)에 샘플 기록 (로그인하면 바로 보임)
--    ※ test01 이 아닌 실 uid면 아래 UID만 바꿔서 실행.
-- ============================================================
insert into profiles (id, role, display_name)
values ('0fe68216-7c8b-4d11-b7a6-abc32e4d69be','student','테스트 학생')
on conflict (id) do update set role='student', display_name=excluded.display_name;

insert into classes (id, name, year)
values ('11111111-1111-1111-1111-111111111111','원서반 A',2)
on conflict (id) do nothing;

insert into students (id, name, class_id, user_id, active)
values ('22222222-2222-2222-2222-222222222222','테스트 학생',
        '11111111-1111-1111-1111-111111111111',
        '0fe68216-7c8b-4d11-b7a6-abc32e4d69be', true)
on conflict (id) do update set user_id=excluded.user_id, class_id=excluded.class_id;

insert into scores (student_id, class_id, kind, title, score, max, grade, date) values
 ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','word','단어시험 Day5',18,20,null,'2026-07-10'),
 ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','monthly','7월 월말평가',23,25,null,'2026-07-28'),
 ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','level','알파 레벨테스트',null,null,'Level 3 통과','2026-07-30')
on conflict do nothing;

insert into attendance (student_id, class_id, date, status) values
 ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','2026-08-01','present'),
 ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','2026-08-04','present'),
 ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','2026-08-06','late')
on conflict (student_id, date) do nothing;

insert into reports (student_id, class_id, title, period, summary, status) values
 ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','7월 월말 리포트','2026-07','단어·읽기 꾸준히 향상. 말하기 자신감이 눈에 띄게 늘었어요.','posted')
on conflict do nothing;

-- 끝. 이제 학생 대시보드에서 test01 로그인 → 성적·출결·리포트 표시.
