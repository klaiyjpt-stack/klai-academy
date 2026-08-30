# 알파 선생님 페이지 + 실시간 시간표 · 설계

날짜: 2026-08-30 · 브랜치: `feat/teacher-alpha`

## 목표

- 시간표를 **Supabase 단일 원본**으로 옮기고 **실시간(Realtime)** 반영. 구글시트 폐기.
- 원장 페이지에서 모든 시간표·배정 변동 관리 → 각 교실 화면에 **즉시** 반영.
- 알파 선생님 교실 화면: 실시간 명단 + 수업 기록(출결·교재·결과·특이사항·교재배부).
- (추후) 결과지 → 알파성장리포트 자동생성 → 학부모 페이지 게시. 원어민 영상도 학부모 페이지 게시. **지금은 밴드 유지.**

## 범위

- **이번(MVP)**: 알파 교실 화면 + 실시간 명단 + 수업 기록 저장. 원장 시간표 편집기.
- **제외(추후)**: 학부모 페이지, 리포트 자동생성 포털연동, 원어민/문법 페이지, 교재배부↔청구 스프레드시트 연동.

## 데이터 (Supabase)

기존 라이브 포털은 `roster`·`class_records`·`class_daily`·`staff` 사용 중. 여기에 추가:

### `timetable` (실시간 시간표 · 단일 원본)
```
id          uuid pk
program     text        -- '원어민' | '알파' | '문법'
day         text        -- 'mon'|'tue'|'wed'|'thu'|'fri'
time_slot   text        -- '2:10', '3:10' ...
group_no    int  default 1   -- 같은 요일·시간 병렬반 구분 (예: 금요일 3교실)
name_kor    text
code        text        -- 영문이름+숫자 (학생 식별키)
active      boolean default true
sort        int  default 0
updated_at  timestamptz default now()
```
- Realtime publication에 추가 → 교실 화면이 구독.
- RLS: 스태프(원장·관리자·선생님) 읽기/쓰기. 학생·학부모 접근 없음.

### `session_records` (수업 기록 · 전 프로그램 공용 · 학생×날짜)
모든 수업(원어민·알파·문법)이 이 표에 기록 → 알림을 한 쿼리로 집계.
```
id           uuid pk
program      text        -- '원어민'|'알파'|'문법'
code         text        -- 학생 식별키 (timetable.code 매칭)
name_kor     text
date         date default current_date
attend       text        -- 'present'|'late'|'absent'|'makeup'
homework     text        -- 'done'|'none'  (숙제 완료 여부)
book         text        -- 학습교재 (오늘 나간 교재)
progress     text        -- Unit·페이지 등 진도
result       text        -- 결과 기록 (점수/통과 등)
remark       text        -- 특이사항
distributed  text        -- 교재배부 기록 (배부한 교재명, 있으면)
created_by   uuid
updated_at   timestamptz default now()
unique(program, code, date)
```
- 교재배부는 우선 `distributed`에 기록(추후 청구 시스템 연동은 별도).
- 알파 화면이 우선 이 표에 기록. 원어민(`class_records`)은 추후 이 표로 이관 → 알림이 전 수업 커버.

### 알림 (원장 페이지)
주간(월~일) 집계로 임계 도달 시 원장 페이지에 표시. **전 프로그램 대상.**
- **숙제 미완료 ≥ 2회 / 주** → 알림
- **결석+지각 ≥ 1회 / 주** → 알림
- 둘 중 하나라도 도래하면 해당 학생 알림(사유·횟수·프로그램·반).
- 구현: `session_records`에서 이번 주 범위로 학생별 count 집계하는 뷰/쿼리. 원장 페이지가 조회(+선택적으로 Realtime 구독해 즉시 갱신).
- 표시: 원장 페이지 상단 알림 카드/목록. (추후) 알림톡·이메일 발송은 별도 단계.

## 페이지

### 1. 알파 교실 화면 (`teacher-alpha.html`) — MVP
- 로그인(우선 단독, 추후 로그인 후 자동분기 합류).
- 상단: 요일·시간 선택 → 해당 슬롯 **실시간 명단**(`timetable` 구독). 원장이 명단 바꾸면 즉시 갱신.
- 명단 각 학생 행: 출결 · **숙제(완료/미완료)** · 학습교재 · 진도 · 결과 · 특이사항 · 교재배부 입력 → `session_records` upsert.
- 강사 일지(비공개, 반 단위) — `class_daily` 재사용.
- 도구 카드: 교재배부(AppSheet 앱 링크) 등.
- 데모 폴백: Supabase 연결 없으면 샘플 명단.

### 2. 원장 시간표 편집기 + 알림 (`admin.html`에 섹션 추가) — MVP
- 프로그램·요일·시간 슬롯 그리드. 학생 추가/이동/삭제 → `timetable` 쓰기.
- 저장 즉시 교실 화면에 반영(같은 테이블 구독).
- **알림 카드**: 이번 주 숙제 미완료 ≥2 / 결석+지각 ≥1 학생 목록.

## 작업 순서

| 단계 | 내용 | 실행 주체 |
|---|---|---|
| 1 | `timetable`·`session_records` 생성 + Realtime + RLS + 주간 알림 뷰 SQL | 원장님(Supabase SQL 에디터 1회) |
| 2 | 알파 학생 시드 INSERT (시트에서 추출·거친 이관) | 원장님 1회 |
| 3 | `teacher-alpha.html` 실시간 명단 + 기록(출결·숙제·교재·결과·특이사항·배부) | 배포 |
| 4 | 원장 시간표 편집기 + 알림 카드 | 배포 |
| 5 | 검증(원장 편집 → 교실 화면 즉시 반영 / 임계 도달 → 알림) | — |

## 추후 (이번 범위 아님)

- 학부모 페이지: 결과지·영상 자동 게시.
- 결과지 업로드 → 알파성장리포트 코드 생성 → 학부모 페이지(현재 밴드).
- 원어민 영상 → 학부모 페이지.
- 원어민·문법 교실 화면(같은 컴포넌트 재사용) + `class_records` → `session_records` 이관(알림 전 수업 커버).
- 교재배부 → 교재비 청구(AppSheet/시트) 연동.
- 알림 알림톡·이메일 발송(지금은 원장 페이지 표시만).

## 위험 / 메모

- 시트가 복잡(ZOOM반·교사회의·병렬 시간표 혼재) → 완벽 이관 대신 알파 학생만 거칠게 시드, 원장이 편집기에서 정리.
- service_role 키는 Vercel env에만 있음 → 테이블 생성·시드는 원장님이 SQL로 1회 실행.
- 개인정보(학생 이름) → 시간표는 로그인(스태프) 뒤에서만. 공개 노출 금지.
