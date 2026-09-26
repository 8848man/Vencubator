# 운영 Analytics 확인

Firebase 프로젝트: vencubator-18a95. 연결 웹 스트림: G-0GFT3M8ZG3.
Google tag로 같은 GA4 스트림에 전송한다. Firebase SDK/Firestore/Hosting 추가 설치 없음.

1. Firebase 콘솔 → 프로젝트 → Analytics 대시보드. 상세 분석은 연결된 Google Analytics에서 연다.
2. GA4 실시간에서 운영 사이트 방문 후 landing_view / app_open 확인. 일반 보고서는 24~48시간 걸릴 수 있다.
3. 이벤트 보고서에서 project_create / lesson_start / lesson_answer / application_save / field_task_plan / evidence_save 확인.
4. 탐색의 유입경로에서 app_open → project_create → lesson_start → application_save → field_task_plan → evidence_save 설정. 단순 이벤트 횟수의 나눗셈은 사용자 전환율이 아니다. 기간·반복·신규/기존 사용자를 구분한다.
5. 학습 영역별로 보려면 관리 → 맞춤 정의에 이벤트 범위 concept/step/stage/app_version을 등록한다. 프로젝트 ID는 등록하지 않는다.

운영 호스트만 전송한다. localhost/preview/lab/DNT=1 제외. 본인 점검은 ?internal=1(세션 유지), 다시 수집하려면 ?internal=0. 과거 로컬 이벤트는 업로드하지 않는다.
이름/아이디어/답안/프로젝트 ID/원본 UTM은 보내지 않는다. URL query/hash·referrer 제외, 광고 개인화/Google signals 비활성화.
GA4 관리 → 데이터 스트림 → 웹 스트림에서 **향상된 측정의 폼 상호작용·사이트 검색·외부 클릭**을 끄고 명세 이벤트로 분석하는 것을 권장한다. 원격 콘솔 설정은 코드만으로 확인할 수 없다.

evidence_save는 체험판에서 사용자가 기록을 저장한 행동이며 실제 사업 성과가 아니다. 광고 차단·DNT·네트워크 문제로 누락될 수 있어 업무 원장으로 사용하지 않는다.
로컬 대시보드와 GA4 Data API 인증은 미구현. 콘솔은 별도 호스팅 없이 사용 가능. 프로젝트 저장은 여전히 localStorage.

출처: https://support.google.com/analytics/answer/11198161 · https://developers.google.com/analytics/devguides/collection/ga4/troubleshoot
