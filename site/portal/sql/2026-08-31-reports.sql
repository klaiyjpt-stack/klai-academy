-- =====================================================================
-- 리포트/자료 (시험지 사진 → 리포트 생성 요청, 영상자료) + Storage
-- 로그인 전용 RLS. 반자동: status='대기' 를 원장 페이지가 알림.
-- =====================================================================

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  program text,                       -- 알파·문법·독해·영어도서관·원어민
  report_type text not null,          -- 알파성장리포트·월말평가·단어시험·단원평가·영상
  media_type text not null default 'sheet',  -- 'sheet'(시험지사진) | 'video'(영상)
  name_kor text,                      -- 대상 학생 (선택)
  files jsonb not null default '[]',  -- [저장 URL, ...]
  comment text,                       -- 멘트/전달사항
  status text not null default '대기', -- '대기'(생성요청) | '생성됨' | '발송'
  teacher text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reports_status on reports(status);
create index if not exists idx_reports_program on reports(program);

alter table reports enable row level security;
do $$ begin
  create policy reports_auth on reports for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- Storage 버킷 (시험지 사진·영상). public=true → 추후 학부모 페이지에서 열람.
insert into storage.buckets (id, name, public) values ('reports','reports', true)
  on conflict (id) do nothing;
do $$ begin
  create policy reports_obj_read on storage.objects for select using (bucket_id='reports');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy reports_obj_write on storage.objects for insert to authenticated with check (bucket_id='reports');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy reports_obj_mod on storage.objects for update to authenticated using (bucket_id='reports');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy reports_obj_del on storage.objects for delete to authenticated using (bucket_id='reports');
exception when duplicate_object then null; end $$;
