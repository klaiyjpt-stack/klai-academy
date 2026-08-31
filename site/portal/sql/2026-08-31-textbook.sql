-- =====================================================================
-- 교재관리 (마스터·입출고·배부) — Supabase. 포털 네이티브.
-- 로그인 전용(authenticated) RLS.
-- =====================================================================

-- 교재 마스터 (유일 원본)
create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- 교재명
  series text,                        -- 클라이교재 | 알파교재 | 자체교재
  area text,                          -- grammar/영맥 · reading · 알파buildup · AlphaFull · 시험대비용 등
  price int default 0,                -- 금액
  min_stock int default 0,            -- 최소보유수량
  base_stock int default 0,           -- 기초재고(실사수량)
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists idx_books_name on books(name);

-- 입출고 (입고·조정)  ※ 학생 배부는 book_dist가 자동 차감 개념
create table if not exists book_io (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  io_type text not null,              -- '입고' | '조정' | '배부'(대량)
  book text not null,                 -- 교재명 (books.name 참조)
  qty int not null,                   -- 입고 +, 조정 ±
  staff text,                         -- 담당
  note text,
  created_by uuid,
  updated_at timestamptz not null default now()
);
create index if not exists idx_bookio_date on book_io(date);

-- 배부 (학생 교재 배부 → 청구)
create table if not exists book_dist (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  bill_month text,                    -- 청구월 (전달11~당월10) — 저장 시 계산해 넣음
  name_kor text not null,             -- 학생
  program text,                       -- 알파/문법/독해/영어도서관 (선생님 페이지 구분)
  area text,                          -- 영역
  book text not null,                 -- 교재명
  amount int default 0,               -- 금액 (books에서 자동)
  teacher text,                       -- 담당교사
  created_by uuid,
  updated_at timestamptz not null default now()
);
create index if not exists idx_dist_billmonth on book_dist(bill_month);
create index if not exists idx_dist_date on book_dist(date);
create index if not exists idx_dist_name on book_dist(name_kor);

-- RLS: 로그인(스태프)만
alter table books     enable row level security;
alter table book_io   enable row level security;
alter table book_dist enable row level security;
do $$ begin
  create policy books_auth on books for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy bookio_auth on book_io for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy dist_auth on book_dist for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- 재고 = books.base_stock + Σ입고 + Σ조정 − Σ배부(book_dist) − Σ입출고배부
--   → 앱/포털 JS에서 계산. 청구월 규칙: 전달 11 ~ 당월 10 = 당월 청구.
