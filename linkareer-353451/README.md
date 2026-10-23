# 먼저살기 달력 시연 웹

ROUND 5. 여섯 장면과 상담사 화면. `docs/spec-demo.md` 및 `_codex/demo-feedback-4.md` 반영.

## 실행

`index.html`을 브라우저에서 연다. 설치, 서버, 외부 CDN 없이 동작한다. 글꼴을 포함해 인터넷 없이 열 수 있다. 상담사는 `#counselor` 또는 `full.html`로 연다. `submission/먼저살기달력.html`은 코드와 글꼴을 합친 첨부용 파일이다.

청년과 상담사 문의함은 같은 브라우저의 저장 공간을 사용한다. 실제 기관으로 보내지 않는다. 배포 주소는 첫 방문에 인터넷이 필요하며, 서비스 워커가 파일 저장을 마치면 오프라인으로 다시 열 수 있다. 캐시 버전은 `firstliving-static-v5`다.

## 장면

1. 보호종료 첫 두 달: 날짜와 지역 입력, 동의, 사전 신청일과 마감, 신청일에 따른 150만원 또는 0원, 교육 및 신청 기록, 되돌리기.
2. 지역마다 다른 정착금: 서울, 구리, 충남, 대전. 지역별 근거와 확인 상태. 미확인 금액과 횟수는 계산 제외.
3. 집 고르기: 두 집의 12개월 잔액, 지원이 두 달 늦을 때, 월별 표, 가정 구분, CSV. 혼인·무주택은 확인 필요로 표시.
4. 말로 쓴 상황: 사전 처리한 두 사례, 빠진 조건 질문, 날짜가 없을 때 직접 입력. 임의 입력은 자동으로 분석하지 않는다.
5. 막힌 칸: 상담 문자 편집과 동의, 문의함, 오프라인 보관과 재전송, 상담사 답변.
6. 이미 늦은 청년: 지난 14개월 700만원과 남은 신청 기간, 오늘 할 일, 신청 기록.

상담사 화면은 가상 청년 10명을 마감순으로 정렬하고 검색, 필터, 빈 상태, 문의 답변, 한글 CSV 내보내기를 지원한다. 전세임대의 미입력 조건도 확인 필요 건수에 포함한다.

## 5차 변경

- 기존 15개 파일을 `poc/web-old/`로 옮기고 검증된 화면, 데이터, 글꼴을 새 작업 폴더에서 재사용했다.
- Python 기준 코드에 맞춰 조기 보호종료의 정착금은 만 15세 전이면 제외한다. 이 검사는 5년 경과 검사보다 먼저 한다.
- 전세임대 판정의 대상 상태는 유지하며, 혼인·무주택을 입력받지 않았다는 확인 문장을 추가했다. 집 선택 카드와 상담사 확인 건수에 반영한다.
- 설명과 서비스 정보에서 자료를 공공기관 자료 7개와 보도기사 2개로 구분한다. 집 비교의 가정값도 별도로 안내한다.
- 출처 9개의 본문은 화면 근거 발췌만 남겼다. 출처마다 제목, 주소, 열람일과 40~286자 발췌를 보관한다. 비건뉴스는 77자, 문화일보는 229자다. 화면에서 쓰지 않는 AI 추출 원문도 배포 파일에서 뺐다. 실험 원본은 `docs/experiments/`에 보존한다.
- 날짜 없는 상황에서 직접 입력을 누를 때 빈 날짜를 계산하던 오류를 수정했다. 입력값은 빈칸으로 유지한다.
- DOM 검사의 고정 15ms 대기를 실제 역할 화면 전환을 기다리는 방식으로 바꿨다.

## 파일과 디자인

`index.html`, `full.html`, `style.css`, `app.js`, `engine.js`, `data.js`, `sw.js`가 실행 파일이다. `test-engine.mjs`, `test-ui.mjs`, `test-web.mjs`, `shot.mjs`는 검사 도구다. 나머지는 이 설명과 글꼴 및 라이선스다.

`:root`에 기본색 7개, 글자 12/14/16/20/28/36px, 4px 간격 단계, 둥글기 12/24px, 그림자 2종, 180ms 전환을 정의한다. 주색은 짙은 초록 `#205845`, 경고는 `#855115`, 위험은 `#ab3733`이다. 성공은 주색을 재사용한다. 모바일은 문서 스크롤, 데스크톱은 390px 휴대폰 프레임과 장면 설명이다. 줄바꿈과 표의 내부 스크롤을 유지해 문서 가로 넘침을 방지한다.

## 자산과 출처

- Pretendard 1.3.9: 기존 공식 배포본을 재사용. SIL Open Font License 1.1 전문은 `fonts/OFL.txt`. 공식 저장소: https://github.com/orioncactus/pretendard/tree/v1.3.9
- 직접 만든 인라인 SVG 아이콘: MIT, `LICENSE-ICONS.txt`.
- 두 라이선스 전문은 설정의 서비스 정보에서도 읽을 수 있고 첨부 HTML에도 포함된다.
- 지원 조건은 제공된 `docs/experiments/benefits.json`, 근거는 `docs/sources/`. 금액과 기존 근거 인용문은 바꾸지 않았다. 공공기관 로고, 인물 사진, 생성 이미지는 사용하지 않았다.

## 검증

```sh
node --check poc/web/app.js
node poc/web/test-engine.mjs
DOM_ROOT=/private/tmp/rehearsal-qa ONEFILE=submission/먼저살기달력.html node poc/web/test-ui.mjs
PW_ROOT=/Users/minguseo/Code/Gongmojeon/worker node poc/web/test-web.mjs
PW_ROOT=/Users/minguseo/Code/Gongmojeon/worker node poc/web/test-web.mjs http://localhost:8000/
PW_ROOT=/Users/minguseo/Code/Gongmojeon/worker node poc/web/test-web.mjs "file://$PWD/submission/먼저살기달력.html" --onefile
PW_ROOT=/Users/minguseo/Code/Gongmojeon/worker node poc/web/shot.mjs
```

HTTP 검사는 웹 폴더를 제공하는 로컬 서버를 실행한 뒤 사용한다. 검사 라이브러리는 웹 실행에 필요하지 않다.

DOM 검사 131개가 폴더형과 첨부 HTML을 포함해 통과했다. 문의와 답변 연동, 뒤로가기, 미입력 날짜의 직접 입력, 출처 발췌만 배포하는 조건을 확인했다.

계산: 가상 청년 51/51칸, 집 비교 48개월 전체 필드 원 단위 일치. 만 14세 제외와 15세 당일, 5년 경과 검사 순서, 전세임대 미확인 조건 반례를 추가했다. HTML은 두 진입점과 첨부 파일의 태그 짝과 중복 식별자를 검사한다.

`shot.mjs`는 390×844, 1280×800에서 장면과 결과를 `_codex/shots/demo-<장면>-<폭>.png`로 저장한다. 기존 22장에 `demo-3-conditions-390.png`, `demo-3-conditions-1280.png`를 더해 전세임대 확인 문구도 캡처한다. 페이지 가로 넘침, 날것의 데이터 노출, 시연 띠와 바텀시트, 상담사 표 정렬을 검사한다.

이번 환경에서는 Chromium이 `MachPortRendezvousServer Permission denied`로 시작하지 못했다. 따라서 5차의 file/http/첨부 HTML 실브라우저 검사와 화면 캡처는 외부 Claude 실행이 필요하다. 이전 회차의 통과 결과를 이번 회차의 통과로 간주하지 않는다.

## 남은 범위

- 실제 알림 권한, 서비스 워커 오프라인 재방문, 390px·1280px 시각 검수는 외부 브라우저에서 확인해야 한다.
- 보고서 캡처 3장과 PDF를 갱신해야 한다. 동기화 검사 결과는 `DEMO-SYNC: ok=1 stale=4`다. 제출 준비 완료 상태가 아니다.
- 공개 배포와 영상 갱신은 하지 않았다.
- 개인 기록은 마지막 저장일부터 30일 뒤 앱을 다시 열 때 삭제한다. 앱이 닫힌 동안 자동 실행하지 않는다.
- 실시간 AI 추론, 실제 상담 전송과 복지 신청, 예약 푸시는 구현 범위 밖이다.
