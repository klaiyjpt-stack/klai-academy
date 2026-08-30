# seed-students 이관 리포트

- 생성일: 2026-08-31
- 원본: 구글시트 export(마크다운) — 개별 학생 시간표 그리드 블록만 파싱
- 생성 SQL: `site/portal/sql/seed-students.sql`
- 적용 규칙 개정: (1) `원서` 단독 → 정독 매핑 추가, (2) HH:MM·범위표기를 앞 시(hour)만 취해 `N시`로 정규화, 7시 허용시간 추가(6시30분만 별도 유지)

## 요약
- 학생 수: **89명**
- 총 INSERT 행 수: **815행** (중복 173행 제거 후)
- 이번 개정으로 새로 포함: HH:MM/범위표기 반영 **132행**, 저녁 7시반 **32행**, 원서(단독)→정독 **8행**
- delete 첫 줄에서 `status <> 'draft'` 만 삭제(수정안 draft 보존), status 생략(기본 confirmed)

## 레벨별 학생 수 (학생×레벨 기준)
- (빈칸/기간라벨 그리드): 68명
- 초등 Advanced2: 12명
- 초등 Inter_progress: 11명
- 중등 Premium: 11명
- 초등 Advanced 1: 9명
- 초등 basic: 5명
- 초등 엘리아 speaking1: 4명
- 초등 Inter_progress + 영도: 1명
- 9월 초등 basic: 1명
- 초등 (5학년): 1명
- 중등 프리미엄: 1명
- 초등 Inter_grow: 1명
- 성과영어: 1명

## 레벨별 행 수
- (빈칸): 529행
- 초등 Advanced2: 84행
- 초등 Inter_progress: 58행
- 초등 Advanced 1: 54행
- 중등 Premium: 39행
- 초등 basic: 15행
- 초등 엘리아 speaking1: 12행
- 초등 (5학년): 7행
- 초등 Inter_progress + 영도: 6행
- 중등 프리미엄: 5행
- 초등 Inter_grow: 3행
- 성과영어: 2행
- 9월 초등 basic: 1행

## 과목별 행 수
- 정독: 225행
- 문법: 224행
- 단어&Extra: 128행
- 독해: 114행
- 영어도서관: 69행
- 알파: 55행

## 최종 허용 time_slot
- 1시,2시,3시,4시,5시,6시,6시30분,7시,8시
- N시XX분/HH:MM은 앞 시로 floor (예 4시30분→4시, 3:10→3시). `6:30`·`6시30분`만 6시30분 유지

## skip(제외) 셀 집계
- unknown_subject(허용 과목 외, 예 엘리아 sp/wt·EVT·리딩): 82칸
- time_not_allowed(허용 시간대 외, 예 13:50·16:00 차량/외부일정): 22칸
- no_time(시간표기 자체가 없는 메모): 168칸

### 대표 skip 사례 (중복 제거 상위 20)
- [time_not_allowed:13시] `13:50 헤링턴2차` (L139)
- [time_not_allowed:14시] `14:55 대동초` (L184)
- [time_not_allowed:16시] `16:00 하원차량` (L187)
- [time_not_allowed:17시] `17:00 하원차량` (L187)
- [unknown_subject] `3시 엘리아 sp/wt` (L196)
- [unknown_subject] `3시 EVT` (L196)
- [unknown_subject] `3시 엘리아 sp/영도` (L204)
- [unknown_subject] `4시 EVT` (L696)
- [unknown_subject] `4시 리딩` (L723)
- [unknown_subject] `5시 리딩` (L747)
- [unknown_subject] `3:30~4:50 수학` (L757)
- [unknown_subject] `3시 미완료학습` (L757)
- [unknown_subject] `5시40분~7시 유도` (L760)
- [time_not_allowed:15시] `15:42 이편한` (L769)
- [time_not_allowed:15시] `15:45 이편한` (L769)
- [unknown_subject] `3시 리딩` (L777)
- [unknown_subject] `6시 리딩` (L815)
- [unknown_subject] `6:30 수학학원` (L883)
- [unknown_subject] `2:10~ 3:00 EVT` (L898)
- [unknown_subject] `3:10~ 4:00 EVT` (L899)

## 주의사항
- `13:50 헤링턴2차`·`14:55 대동초`·`16:00 하원차량` 등 실제 수업이 아닌 외부일정/차량 메모는 13시·14시·16시로 파싱돼 허용시간대 밖으로 제외됨(정상).
- level 빈칸 행: 하단 그리드 상단 라벨이 "이름"·월(3월/9월 등) 기간표기라 반등급으로 인정하지 않고 빈칸 처리. 상단 블록에 실제 반등급이 있던 그리드는 레벨이 채워짐.
- 이름 정규화: 말미 `(숫자)`·`(4학년)`·`(11월~)` 괄호, 앞 `25년 10월` 날짜, `/뒷이름`, 말미 숫자메모 제거.
- 원어민 class1/2·ZOOM 상단 시간표: 셀이 학생명이라 그리드 자체 제외(유효행 0).
- 중복 제거 기준: (name, day, time_slot, subject). 같은 학생의 구/신 버전 그리드가 다른 셀이면 각각 보존.

## 제외(탈회)
- 박지현(탈회): name_kor='박지현' 행 전부 insert 제외.
