# 학부모 페이지 계획 (feat/parent-page)

작성 2026-09-02. 워크트리 `~/개발/klai-parent-page`, 브랜치 `feat/parent-page` (feat/student-page 기반).

## 목표
학부모가 로그인하면 **자녀의 학습 상황**을 한 화면에서 본다. 선생님·원어민이 발행한 것만 노출.

## 자녀 학습 데이터 출처 (기존 테이블 재사용, 새 테이블 없음)
| 표시 항목 | 출처 | 필터 |
|---|---|---|
| 반 숙제·공지 | `class_daily.class_memo` | `class_memo_published=true`, 내 자녀 반 |
| 성적·출결 요약 | `class_records` | `published=true`, `student_code=자녀코드` |
| 리포트(시험지→생성물) | `reports` | `media_type='sheet'`, `status='발송'`, `name_kor=자녀이름` |
| 영상(영어도서관 월1회) | `reports` | `media_type='video'`, `status='발송'` (반 공용) |
| 결제·상담·프로그램 | 외부 링크 | (기존 유지) |

## 자녀 매칭 (핵심 미결정)
학생 로그인ID = 영어이름+숫자 (예 `Elin1136`) = `class_records.student_code`(전체ID로 통일 완료).
학부모 계정↔자녀 연결 방식은 **아직 미정** → 당장은 아래 순서로 자녀코드 확보:
1. `user_metadata.child_code` 있으면 사용
2. 없으면 localStorage `klai_child_code`
3. 둘 다 없으면 대시보드에서 **자녀 로그인ID 1회 입력**(저장) → "자녀 변경"으로 수정
- 자녀 이름은 `class_records`(student_code→student_name)에서 얻음.
- **원장 결정 필요**: 학부모 계정 생성 시 `user_metadata.child_code`(형제면 배열)를 넣어주면 입력 없이 자동. 형제 다자녀는 코드 목록으로 확장.

## 반 매칭
자녀코드 → `class_records`에서 (teacher, class_name) distinct → 그 반의 발행 `class_daily.class_memo` 표시. (원어민 반 메모가 핵심; 다른 과목도 class_records 있으면 함께)

## RLS 주의
현재 class_records/class_daily/reports RLS = `to authenticated using(true)` → 로그인한 학부모가 API로 타 학생 데이터도 읽을 수 있음(민감). **후속 과제**: 자녀 코드로 제한하는 RLS(예: student_code 기반) 또는 뷰. 지금은 화면에서 자기 자녀만 노출.

## 미완/후속
- 학부모↔자녀 계정 자동 연결(metadata) — 원장 계정발급 정책 확정 후
- 다자녀 전환 UI(자녀 여러 명)
- 리포트 "생성물" 파일 필드 정리(현재 files=업로드 원본; 최종 리포트 PDF 별도 저장 시 그 필드 노출)
- reports RLS 자녀 제한
- 알림톡/문자 발송(원장 페이지 알림과 연계)
