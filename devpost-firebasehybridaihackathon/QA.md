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
