-- =====================================================================
-- KLAI Portal · Supabase schema + RLS
-- 실행: Supabase SQL Editor 에 붙여넣고 Run. (역할·권한·결제 비공개의 핵심)
-- =====================================================================

-- ---------- ENUM ----------
create type role_type       as enum ('director','admin','teacher','parent','student');
create type class_type      as enum ('level','individual');           -- 레벨반(원어민) / 개별학습(알파·클라이)
create type score_type      as enum ('vocab','monthly','final','other');
create type attend_status   as enum ('present','late','absent','makeup');
create type portfolio_type  as enum ('alpha_report','monthly_report','video','photo');
create type perm_level      as enum ('edit','view','hidden');

-- ---------- 계정/프로필 ----------
create table families (
  id uuid primary key default gen_random_uuid(),
  name text
);
-- 로그인 계정 1개 = profiles 1행 (auth.users 와 1:1)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role role_type not null,
  name text not null,
  english_id text,                 -- 학생: 영어이름+숫자 (매칭 키)
  family_id uuid references families(id),
  active boolean not null default true,
  created_at timestamptz default now()
);

-- ---------- 반 / 학생 ----------
create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type class_type not null default 'level',
  teacher_id uuid references profiles(id),   -- 담당 선생님
  active boolean not null default true
);
create table students (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid unique references profiles(id) on delete cascade, -- 학생 로그인 계정
  parent_profile_id  uuid references profiles(id),                          -- 학부모 로그인 계정
  english_id text not null,          -- = profiles.english_id (매칭 키)
  korean_name text not null,
  class_id uuid references classes(id),
  grade text,                        -- 초/중/고 등
  alpha_level text,                  -- 알파 레벨 (파이널 후 자동+관리자 확정)
  active boolean not null default true
);
-- 반이동 이력 (기록은 학생에 귀속되므로 이동해도 데이터 유지)
create table class_moves (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  class_id uuid references classes(id),
  from_date date not null,
  note text
);

-- ---------- 성적 / 출결 / 숙제 ----------
create table scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  score_type score_type not null,
  test_name text,                    -- 예: 단어시험 Day5
  correct int,                       -- 맞은 개수
  total int,                         -- 총 문항 (평가마다 다름)
  grade text,                        -- 등급/통과 등
  date date not null default current_date,
  is_public boolean not null default false,   -- 기본 비공개, 선생님이 공개시에만 게시
  created_by uuid references profiles(id)
);
create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  date date not null,
  status attend_status not null,
  source text default 'teacher',     -- 선생님이 포털에서 직접 기록
  unique(student_id, date)
);
create table class_homework (        -- 반별 숙제(공지)
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,               -- 자유 입력 (원아워, 클래스카드 등)
  assigned_date date not null default current_date
);
create table homework_done (         -- 학생별 완료 체크
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  class_homework_id uuid references class_homework(id) on delete cascade,
  done boolean not null default false
);

-- ---------- 레슨플랜 / 포트폴리오 / 메모 ----------
create table lesson_plans (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  book_code text,                    -- ph1, z11, keystone ...
  month text,                        -- 2026-08
  plan jsonb,                        -- 생성기 결과(날짜/레슨/페이지/숙제)
  is_public boolean not null default false,
  created_by uuid references profiles(id)
);
create table lesson_plan_images (    -- 원어민 레슨플랜 이미지 게시
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  image_url text not null,
  label text,
  is_public boolean not null default true
);
create table portfolio (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  ptype portfolio_type not null,     -- 알파리포트/원어민월말리포트/영상/사진
  title text,
  url text not null,                 -- 유튜브(비공개) 링크 또는 이미지 URL
  is_public boolean not null default false
);
create table teacher_notes (         -- 선생님 내부 메모 (학생·학부모 절대 비노출)
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ---------- 프로그램 링크 / 교재 ----------
create table programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  visible boolean not null default true,
  sort int default 0
);
create table books (
  id uuid primary key default gen_random_uuid(),
  name text not null, series text, level text
);
create table inventory (
  book_id uuid primary key references books(id) on delete cascade,
  stock int not null default 0
);
create table book_distribution (     -- 배부 리스트 → 학생 수업진도 매칭
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  book_id uuid references books(id),
  date date not null default current_date
);
create table orders (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id),
  qty int, supplier text, status text default 'draft'
);
-- 결제/수강료는 이코딩에서 관리 → 포털 DB에 저장하지 않음(학생 노출 원천 차단)

-- ---------- 부원장/관리자 대시보드 권한 ----------
create table admin_permissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  dashboard text not null,           -- dashboard, students, move, accounts, programs, books, pay, staff
  level perm_level not null default 'hidden',
  unique(profile_id, dashboard)
);

-- =====================================================================
-- RLS 헬퍼 (SECURITY DEFINER 로 재귀 방지)
-- =====================================================================
create or replace function fn_role() returns role_type
  language sql stable security definer set search_path=public as $$
  select role from profiles where id = auth.uid()
$$;
create or replace function fn_is_admin() returns boolean
  language sql stable security definer set search_path=public as $$
  select coalesce(fn_role() in ('director','admin'), false)
$$;
create or replace function fn_is_staff() returns boolean
  language sql stable security definer set search_path=public as $$
  select coalesce(fn_role() in ('director','admin','teacher'), false)
$$;
-- 이 학생 데이터를 볼 권한? (본인 학생계정 / 그 학부모 / 담당반 선생님 / 원장·관리자)
create or replace function fn_can_view_student(sid uuid) returns boolean
  language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from students s
    left join classes c on c.id = s.class_id
    where s.id = sid and (
      s.student_profile_id = auth.uid()
      or s.parent_profile_id = auth.uid()
      or c.teacher_id = auth.uid()
      or fn_is_admin()
    ))
$$;
-- 학생 본인 계정인가? (결제 등 민감정보 차단용 – 학생이면 true)
create or replace function fn_is_student() returns boolean
  language sql stable security definer set search_path=public as $$
  select coalesce(fn_role() = 'student', false)
$$;

-- =====================================================================
-- RLS 활성화 + 정책
-- =====================================================================
alter table profiles          enable row level security;
alter table students           enable row level security;
alter table classes            enable row level security;
alter table class_moves        enable row level security;
alter table scores             enable row level security;
alter table attendance         enable row level security;
alter table class_homework     enable row level security;
alter table homework_done      enable row level security;
alter table lesson_plans       enable row level security;
alter table lesson_plan_images enable row level security;
alter table portfolio          enable row level security;
alter table teacher_notes      enable row level security;
alter table programs           enable row level security;
alter table books              enable row level security;
alter table inventory          enable row level security;
alter table book_distribution  enable row level security;
alter table orders             enable row level security;
alter table admin_permissions  enable row level security;
alter table families           enable row level security;

-- profiles: 본인 조회 / 스태프는 전체 조회 / 원장·관리자만 쓰기(계정 생성·배부)
create policy profiles_select on profiles for select using (id = auth.uid() or fn_is_staff());
create policy profiles_write  on profiles for all    using (fn_is_admin()) with check (fn_is_admin());

-- students: 볼 권한자만 / 쓰기는 스태프
create policy students_select on students for select using (fn_can_view_student(id));
create policy students_write  on students for all    using (fn_is_staff()) with check (fn_is_staff());
create policy class_moves_all on class_moves for all using (fn_is_staff()) with check (fn_is_staff());

-- classes/programs/books: 로그인 사용자 조회, 스태프 쓰기
create policy classes_select  on classes  for select using (true);
create policy classes_write   on classes  for all    using (fn_is_staff()) with check (fn_is_staff());
create policy programs_select on programs for select using (true);
create policy programs_write  on programs for all    using (fn_is_admin()) with check (fn_is_admin());
create policy books_select    on books    for select using (true);
create policy books_write     on books    for all    using (fn_is_staff()) with check (fn_is_staff());

-- scores: 학생/학부모는 (본인·자녀 + 공개)만, 스태프는 전체 / 쓰기 스태프
create policy scores_select on scores for select using (
  fn_can_view_student(student_id) and (is_public or fn_is_staff())
);
create policy scores_write  on scores for all using (fn_is_staff()) with check (fn_is_staff());

-- attendance: 볼 권한자 조회(공개개념 없음), 쓰기 스태프(이코딩 가져오기)
create policy attend_select on attendance for select using (fn_can_view_student(student_id));
create policy attend_write  on attendance for all using (fn_is_staff()) with check (fn_is_staff());

-- 숙제
create policy chw_select on class_homework for select using (true);
create policy chw_write  on class_homework for all using (fn_is_staff()) with check (fn_is_staff());
create policy hwd_select on homework_done  for select using (fn_can_view_student(student_id));
create policy hwd_write  on homework_done  for all using (fn_is_staff()) with check (fn_is_staff());

-- 레슨플랜: 공개분은 로그인 조회, 스태프 전체·쓰기
create policy lp_select  on lesson_plans       for select using (is_public or fn_is_staff());
create policy lp_write   on lesson_plans       for all using (fn_is_staff()) with check (fn_is_staff());
create policy lpi_select on lesson_plan_images for select using (is_public or fn_is_staff());
create policy lpi_write  on lesson_plan_images for all using (fn_is_staff()) with check (fn_is_staff());

-- 포트폴리오: 볼 권한자 + 공개, 스태프 쓰기
create policy pf_select on portfolio for select using (fn_can_view_student(student_id) and (is_public or fn_is_staff()));
create policy pf_write  on portfolio for all using (fn_is_staff()) with check (fn_is_staff());

-- 내부 메모: 스태프만 (학생·학부모 원천 차단)
create policy tn_all on teacher_notes for all using (fn_is_staff()) with check (fn_is_staff());

-- 재고/주문/배부: 스태프만
create policy inv_all on inventory        for all using (fn_is_staff()) with check (fn_is_staff());
create policy ord_all on orders           for all using (fn_is_staff()) with check (fn_is_staff());
create policy bd_select on book_distribution for select using (fn_can_view_student(student_id) or fn_is_staff());
create policy bd_write  on book_distribution for all using (fn_is_staff()) with check (fn_is_staff());

-- 권한 매트릭스: 원장·관리자만
create policy perm_all on admin_permissions for all using (fn_is_admin()) with check (fn_is_admin());
create policy fam_all  on families          for all using (fn_is_staff()) with check (fn_is_staff());

-- =====================================================================
-- 메모: 결제·수강료는 이코딩 담당 → 포털 DB에 없음.
--       학부모 페이지는 이코딩 결제 페이지로 링크만 연결(학생 화면엔 결제 요소 자체가 없음).
-- =====================================================================
