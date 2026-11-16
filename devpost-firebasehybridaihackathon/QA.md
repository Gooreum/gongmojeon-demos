# 5차 자체 검사

Codex 실패 — 대체: 화면 디자인도 Sonnet이 `codex-design.md` 기준으로 기존 색·글꼴·배치 체계를 유지하며 맡았습니다.

## 장면 순서 (PLAN 1~6)

1 택배 사칭, 2 진짜 배송, 3 가족 사칭, 4 은행 사칭(+모양 카드), 5 새 수법(목록 v1→v2), 6 로컬 AI 없음.

## 5차 수정 범위

- `app.js`·`hybrid.js`·`data.js`: 첫 화면 문구, 사용자 체크 2개, 모양 카드, 장면 5, 장면 6 이동, `loadPatterns()`.
- `samples/message-5.*`: 가상 통행료 문자(555-01xx, 가상 도메인, 로고 없음). `render-samples.mjs`가 5장을 렌더합니다.
- `style.css`: 사용자 체크·패턴 칩·개인정보 검사 줄. 모바일에서 Check 버튼이 탭 막대 위에 남도록 미리보기 줄을 줄였습니다.
- `patterns.json`(21장, `toll` 카드 `since: 2`)은 다른 담당 파일이라 읽기만 합니다. `data.js` 번들 사본은 `node poc/web/sync-patterns.mjs` 로 똑같이 맞춥니다. 시험·스크린샷의 임시 toll 카드 주입은 없앴고 장면 5 는 실제 카드로 노랑(v1)에서 빨강(v2)이 됩니다.

## 실행한 검사

```text
PW_ROOT=$ROOT/worker node poc/web/test-web.mjs   -> WEB: 385 assertions passed; zero external requests
PW_ROOT=$ROOT/worker node poc/web/shot.mjs       -> 41 captures (_codex/shots/)
node --check poc/web/app.js hybrid.js
```

새 단언: 사용자 체크가 전송 문자열에 들어감, 모양 카드 개인정보 0개(영어·한국어)와 탐지기 양성 대조, 복사 차단 시 선택 상태, 복사 성공 시 카드 전체 기록, 장면 5 v1 노랑→v2 빨강, 장면 6 전송 0, 외부 요청 0.

## 완료하지 못한 검사

- `test-dom.mjs`는 jsdom이 이 환경에 없어 실행하지 못했습니다. 장면 6 이동과 모양 카드 문구에 맞춰 고쳤으나 실행은 미확인입니다.
- Live(Firebase AI Logic·Firestore)는 설정과 SDK가 없어 검증하지 않았습니다.

---

(아래는 4차 기록)

# 4차 자체 검사

## 수정 범위

- `app.js`: 직접 입력 폼의 `input`·`change`마다 임시 값을 메모리에 보존합니다. 제출 시 검증은 유지했습니다. 직접 입력한 원본의 미리보기 문구를 영어·한국어로 수정했습니다.
- `test-web.mjs`: 390px·1280px 왕복, 전체 화면 캡처, 입력값 유지, 빨강 판정, 미리보기 맥락 선택값과 전송 문자열 일치를 영어·한국어에서 검사합니다.
- `test-dom.mjs`: 실제 앱이 등록한 미디어 쿼리 변경 콜백을 호출해 화면 재생성을 검사합니다.
- `shot.mjs`는 3차 백업과 바이트 단위로 동일합니다. 다른 서비스 화면·스타일·데이터도 변경하지 않았습니다.

## 실행한 검사

수정 전 회귀 검사에서 `en manual draft survives resizing: channel` 오류를 재현했습니다. 수정 후에는 다음 결과를 얻었습니다.

```text
node --check poc/web/app.js
node --check poc/web/test-web.mjs
DOM: 125 assertions passed. HTML: 414 generated fragments balanced.
```

125개 검사에는 기존 장면 5개, 전송 문자열, 공유·CSV, 오프라인 대기, 100건 기록, 유효하지 않은 입력 처리와 새 회귀 검사 28개가 포함됩니다. HTML 검사는 정적 시작 문서와 동적으로 생성한 태그의 닫힘을 확인합니다.

## 완료하지 못한 검사

아래 두 명령을 실행했지만 macOS 샌드박스가 Chromium 시작을 차단했습니다. 두 명령 모두 앱 화면을 열기 전에 종료됐습니다.

```sh
PW_ROOT=/Users/minguseo/Code/Gongmojeon/worker node poc/web/test-web.mjs
PW_ROOT=/Users/minguseo/Code/Gongmojeon/worker node poc/web/shot.mjs
```

```text
browserType.launch: Target page, context or browser has been closed
bootstrap_check_in ... MachPortRendezvousServer ... Permission denied (1100)
```

따라서 4차의 실제 브라우저 검증·스크린샷 생성은 미완료입니다. `demo-5manual`까지 촬영이 끝나는지, 390px·1280px의 실제 가로 넘침과 네트워크 요청 여부는 외부 실행으로 확인해야 합니다. 기존 `_codex/shots/` 캡처는 이번 차수에서 생성한 자료가 아닙니다.

Firebase 설정·SDK·실제 모델이 없어 Live 추론은 검증하지 않았습니다. 제출 폴더에 PDF가 없어 `pdftotext`로 읽을 기획서는 없었습니다. 명세, PLAN, CONTEST를 확인했습니다.

## 묶음 파일과 공개 주소

`poc/shape-check-demo.zip`의 29개 파일을 갱신하고 현재 `poc/web/`와 내용이 같은지 확인했습니다.

`demo-sync.py . --fix-zip` 실행 결과는 `DEMO-SYNC: ok=0 stale=1`입니다. 공개 주소 요청에서 HTTP 오류가 발생해 배포본 확인은 미완료입니다. 이번 작업은 공개 배포를 수행하지 않았습니다.
