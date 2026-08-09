# KLAI Portal (클라이 어학원 학습 포털)

평택 클라이 어학원의 **공개 홈페이지 + 로그인 학습 포털**을 하나로 구축하는 프로젝트입니다.

## 기술 스택
- **Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui**
- **Supabase**: PostgreSQL(데이터), Auth(계정), Storage(이미지·영상), RLS(권한/보안)
- **Vercel** 배포, **PWA**(설치형 웹앱, iOS/Android), 영상은 YouTube 비공개(Unlisted)
- 연동: 이코딩(출결·결제, 엑셀 가져오기/링크), Google Sheets(월간레포트), 카카오 채널

## 역할(로그인 계정)
- 원장(director) · 부원장/관리자(admin, 대시보드별 권한 원장이 지정) · 선생님(teacher) · 학부모(parent) · 학생(student)
- 계정은 **학원에서만 생성·배부**. 학생 아이디 = 영어이름+숫자. 학생/학부모 계정은 가정당 함께 자동 생성.
- **결제·수강료 정보는 학부모만, 학생은 절대 볼 수 없음** (RLS로 강제).

## 폴더
- `supabase/schema.sql` — 전체 테이블 + RLS 권한 정책 (백엔드의 핵심)
- `app/` — Next.js 페이지(라우트)
- `lib/` — Supabase 클라이언트 등 공용 코드
- `.env.example` — 필요한 환경변수 목록

## 실행 (Claude Code / 본인 Mac에서)
> 이 클라우드 세션이 아니라 **본인 컴퓨터의 Claude Code / 터미널**에서 실행합니다.
1. `npm install`
2. Supabase 프로젝트 생성 → `supabase/schema.sql` 실행(SQL editor) → URL·anon key 확보
3. `.env.example` 를 `.env.local` 로 복사 후 키 입력
4. `npm run dev` → http://localhost:3000
5. 배포: Vercel 연결 후 환경변수 등록

## 디자인 시안(이미 제작됨, HTML)
`../학원전용페이지/` 폴더의 시안들을 각 라우트로 이식합니다:
- 클라이_공개홈페이지_시안.html → `/` (공개 홈페이지)
- 클라이_학생페이지_시안.html → `/student`
- 클라이_학부모페이지_시안.html → `/parent`
- 클라이_선생님페이지_시안.html / _영어_시안.html → `/teacher`
- 클라이_원장관리자페이지_시안.html → `/admin`
- klai_lesson_plan_generator.html → `/teacher/lesson-plan` (레슨플랜 생성기)

## 도메인
- 서비스 도메인: **amyschool.kr** (가비아 구매). 배포 후 Vercel Settings > Domains 에 추가하고 가비아 DNS에 레코드 설정.
  - 루트 `amyschool.kr`: A 레코드 @ → `76.76.21.21`
  - `www.amyschool.kr`: CNAME → `cname.vercel-dns.com`
  - (정확한 값은 Vercel 대시보드가 보여주는 값을 사용. HTTPS는 Vercel 자동 발급)
