(function () {
  'use strict';
  const D = window.DEMO_DATA, E = CalendarEngine, engine = E.create(D.benefits);
  const B = Object.fromEntries(D.benefits.benefits.map(b => [b.id, b]));
  const TODAY = D.people.today, KEY = 'firstliving-calendar-v1', RETENTION = 30 * 86400000;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = value => Number.isFinite(value) ? value.toLocaleString('ko-KR') + '원' : '확인 필요';
  const man = value => Number.isFinite(value) ? (value / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 2 }) + '만원' : '확인 필요';
  const dateText = (value, year = true) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '날짜 확인 필요';
    const d = new Date(value + 'T00:00:00Z');
    if (!Number.isFinite(d.getTime())) return '날짜 확인 필요';
    return `${year ? d.getUTCFullYear() + '년 ' : ''}${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일(${['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()]})`;
  };
  // 한 파일 배포에서도 저작권 고지와 라이선스 전문을 함께 제공합니다.
  const FONT_LICENSE = "Copyright (c) 2021, Kil Hyung-jin (https://github.com/orioncactus/pretendard),\nwith Reserved Font Name Pretendard.\n\nThis Font Software is licensed under the SIL Open Font License, Version 1.1.\nThis license is copied below, and is also available with a FAQ at:\nhttps://scripts.sil.org/OFL\n\n\n-----------------------------------------------------------\nSIL OPEN FONT LICENSE Version 1.1 - 26 February 2007\n-----------------------------------------------------------\n\nPREAMBLE\nThe goals of the Open Font License (OFL) are to stimulate worldwide\ndevelopment of collaborative font projects, to support the font creation\nefforts of academic and linguistic communities, and to provide a free and\nopen framework in which fonts may be shared and improved in partnership\nwith others.\n\nThe OFL allows the licensed fonts to be used, studied, modified and\nredistributed freely as long as they are not sold by themselves. The\nfonts, including any derivative works, can be bundled, embedded, \nredistributed and/or sold with any software provided that any reserved\nnames are not used by derivative works. The fonts and derivatives,\nhowever, cannot be released under any other type of license. The\nrequirement for fonts to remain under this license does not apply\nto any document created using the fonts or their derivatives.\n\nDEFINITIONS\n\"Font Software\" refers to the set of files released by the Copyright\nHolder(s) under this license and clearly marked as such. This may\ninclude source files, build scripts and documentation.\n\n\"Reserved Font Name\" refers to any names specified as such after the\ncopyright statement(s).\n\n\"Original Version\" refers to the collection of Font Software components as\ndistributed by the Copyright Holder(s).\n\n\"Modified Version\" refers to any derivative made by adding to, deleting,\nor substituting -- in part or in whole -- any of the components of the\nOriginal Version, by changing formats or by porting the Font Software to a\nnew environment.\n\n\"Author\" refers to any designer, engineer, programmer, technical\nwriter or other person who contributed to the Font Software.\n\nPERMISSION & CONDITIONS\nPermission is hereby granted, free of charge, to any person obtaining\na copy of the Font Software, to use, study, copy, merge, embed, modify,\nredistribute, and sell modified and unmodified copies of the Font\nSoftware, subject to the following conditions:\n\n1) Neither the Font Software nor any of its individual components,\nin Original or Modified Versions, may be sold by itself.\n\n2) Original or Modified Versions of the Font Software may be bundled,\nredistributed and/or sold with any software, provided that each copy\ncontains the above copyright notice and this license. These can be\nincluded either as stand-alone text files, human-readable headers or\nin the appropriate machine-readable metadata fields within text or\nbinary files as long as those fields can be easily viewed by the user.\n\n3) No Modified Version of the Font Software may use the Reserved Font\nName(s) unless explicit written permission is granted by the corresponding\nCopyright Holder. This restriction only applies to the primary font name as\npresented to the users.\n\n4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font\nSoftware shall not be used to promote, endorse or advertise any\nModified Version, except to acknowledge the contribution(s) of the\nCopyright Holder(s) and the Author(s) or with their explicit written\npermission.\n\n5) The Font Software, modified or unmodified, in part or in whole,\nmust be distributed entirely under this license, and must not be\ndistributed under any other license. The requirement for fonts to\nremain under this license does not apply to any document created\nusing the Font Software.\n\nTERMINATION\nThis license becomes null and void if any of the above conditions are\nnot met.\n\nDISCLAIMER\nTHE FONT SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND,\nEXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF\nMERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT\nOF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE\nCOPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,\nINCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL\nDAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING\nFROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM\nOTHER DEALINGS IN THE FONT SOFTWARE.";
  const ICON_LICENSE = "MIT License\n\nCopyright (c) 2026 먼저살기 달력 contributors\n\nThe inline SVG icons in app.js and CSS brand mark are original geometric\nartwork created for this project. They do not use third-party logos.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n";
  function licenseNotices() {
    return '<details class="license-notice"><summary>Pretendard 글꼴 저작권과 이용 조건</summary><pre>' + esc(FONT_LICENSE) + '</pre></details><details class="license-notice"><summary>아이콘 저작권과 이용 조건</summary><pre>' + esc(ICON_LICENSE) + '</pre></details>';
  }
  const paths = {
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-14 5h3m4 0h3"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    chat: '<path d="M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0Z"/><path d="M7 9h10M7 13h6"/>',
    settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="m9 5 7 7-7 7"/>',
    file: '<path d="M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h6"/>',
    wifi: '<path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20h.01"/>',
    shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6zM8 11l3 3 5-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    leaf: '<path d="M20 3C7 2 2 10 7 17c7 5 15-2 13-14ZM5 21 16 9"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 1c0 2-3 2-3 5M12 18h.01"/>',
    edit: '<path d="m4 16-1 5 5-1L21 7l-4-4ZM14 6l4 4"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
  let storageAvailable = true;
  const initial = { profile: { ...D.people.personas[0], apply_date: '2027-01-13' }, consent: false, applied: false, education: false, offline: false, messages: [], region: '서울', reminders: false };
  function read() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (s.savedAt && Date.now() - s.savedAt > RETENTION) { localStorage.removeItem(KEY); return {}; }
      return s;
    } catch (_) { storageAvailable = false; return {}; }
  }
  let state = { ...structuredClone(initial), ...read() };
  if (!Array.isArray(state.messages)) state.messages = [];
  let scene = 1, storyIndex = 0, storyResult = false, compare = false, delay = true, lateResult = false;
  let focusBeforeSheet, toastTimer, query = '', filter = 'all', viewCounselor = false;
  const defaultCounselor = document.body.dataset.mode === 'counselor';
  const youthShell = $('#app-view').innerHTML;
  const disclaimer = $('.disclaimer').outerHTML;
  let mountedMode = '';
  function mountView() {
    const mode = viewCounselor ? 'counselor' : 'youth';
    document.body.dataset.mode = mode;
    document.title = '먼저살기 달력 | ' + (viewCounselor ? '상담사 보기' : '내 달력');
    if (mountedMode === mode) return;
    $('#app-view').innerHTML = viewCounselor
      ? `<header class="deskbar"><a class="brand" href="#scene-1"><span class="brand-icon" aria-hidden="true"></span>먼저살기 <span>달력</span></a><span>서울 자립지원전담기관</span><button class="secondary" data-action="settings">도움말</button></header><main id="screen" class="counselor" tabindex="-1"></main>${disclaimer}`
      : youthShell;
    mountedMode = mode;
  }
  if (location.protocol === 'file:' && window.name.startsWith('firstliving:')) {
    try { state = { ...state, ...JSON.parse(window.name.slice(12)) }; save(); } catch (_) { /* 손상된 전달값은 사용하지 않음 */ }
    window.name = '';
  }
  function save() {
    try { state.savedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(state)); storageAvailable = true; return true; }
    catch (_) { storageAvailable = false; return false; }
  }
  function toast(text) {
    $('#toast').textContent = text; $('#toast').classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4200);
  }
  function sheet(title, body) {
    focusBeforeSheet = document.activeElement;
    $('#sheet-title').textContent = title; $('#sheet-content').innerHTML = body;
    if (!$('#sheet').open) $('#sheet').showModal();
    $('#sheet').scrollTop = 0;
    $('#sheet [data-action=close]').focus({ preventScroll: true });
  }
  function closeSheet() { $('#sheet').close(); focusBeforeSheet?.focus({ preventScroll: true }); }
  const badge = (text, tone = '') => `<span class="badge ${tone}">${esc(text)}</span>`;
  const button = (text, action, cls = 'primary wide', extra = '') => `<button class="${cls}" data-action="${action}" ${extra}>${text}</button>`;
  const intro = (eyebrow, title, subtitle) => `<div class="intro"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}</div>`;
  const facts = rows => `<dl>${rows.map(([k, v]) => `<div class="fact-row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const regionOptions = selected => ['서울', '경기 구리', '충남', '대전'].map(r => `<option ${r === selected ? 'selected' : ''}>${r}</option>`).join('');
  const stories = ['다음 달 15일에 그룹홈에서 나가요. 서울 살고 편의점 알바 해요. 초등학교 3학년 때부터 여기 있었어요.', '곧 나간대요. 친구랑 같이 살 수도 있어요.'];
  const scenes = [
    { title: '내 날짜를 알면,\n놓칠 돈이 줄어요.', story: '보호가 끝나기 전, 민지는 아직 아무 지원도 신청하지 않았어요.', action: '내 달력을 열고 신청 날짜를 바꿔 보세요.', success: '2월 3일에는 150만원, 1월 13일까지는 놓치는 돈 0원.', name: '보호종료 첫 두 달', short: '신청 날짜를 바꿔 보세요' },
    { title: '사는 곳이 바뀌면,\n지원도 달라져요.', story: '민지는 서울을 떠나 구리나 충남에 살 생각이에요.', action: '지역을 선택하고 금액의 근거를 확인하세요.', success: '지역별 금액과 분할 시기, 확인이 필요한 조건을 구분해요.', name: '지역마다 다른 정착금', short: '지역을 골라 보세요' },
    { title: '집을 고르기 전,\n통장부터 살펴봐요.', story: '정착금이 들어오기 전에 보증금을 내야 한다면 어떨까요?', action: '두 집을 고르고 12개월 잔액을 비교하세요.', success: '첫 달 부족한 돈과 지원이 두 달 늦게 올 때까지 확인해요.', name: '집 고르기', short: '두 집을 비교해 보세요' },
    { title: '어려운 말 없이,\n내 이야기로 시작해요.', story: '공문 용어를 몰라도 평소 쓰는 말로 상황을 적을 수 있어요.', action: '상황을 정리하고 비어 있는 칸을 확인하세요.', success: '모르는 날짜는 추측하지 않고 먼저 물어요.', name: '말로 쓴 상황', short: '상황을 정리해 보세요' },
    { title: '답이 없는 칸은,\n사람에게 물어요.', story: '16세에 보호가 끝난 유나는 소급 기간의 시작일을 몰라요.', action: '문자를 고쳐 보내고 상담사 문의함을 여세요.', success: '원문에 없는 조건은 계산하지 않고 상담사와 확인해요.', name: '막힌 칸', short: '상담사에게 물어보세요' },
    { title: '조금 늦었어도,\n오늘부터 챙겨요.', story: '도윤은 보호가 끝난 지 1년이 넘어서야 자립수당을 알았어요.', action: '오늘 신청하면 받을 수 있는 조건을 확인하세요.', success: '이미 지난 700만원과 앞으로 신청할 수 있는 기간을 나눠 봐요.', name: '이미 늦은 청년', short: '지금 신청하면 확인하세요' }
  ];
  function renderShell() {
    const s = scenes[scene - 1];
    $('#tour').innerHTML = `<span><strong>시연 · 장면 ${scene}/6</strong><span class="tour-task">${s.short}</span></span>${button(scene === 6 ? '처음' : '다음', 'next', '')}`;
    $('#scene-panel').innerHTML = `<div class="panel-mark">먼저살기 달력</div><h2>${s.title.replace('\n', '<br>')}</h2><p>${s.story}</p><div class="panel-detail"><span>지금 할 일</span><p>${s.action}</p></div><div class="panel-detail"><span>성공 확인</span><p>${s.success}</p></div><div class="scene-index">${scenes.map((v, i) => `<a href="#scene-${i + 1}" class="${i + 1 === scene ? 'active' : ''}" ${i + 1 === scene ? 'aria-current="step"' : ''} aria-label="장면 ${i + 1}. ${v.name}">${String(i + 1).padStart(2, '0')}</a>`).join('')}</div><div class="panel-foot"><span>보호가 끝나는 날부터<br>놓치는 돈이 없게.</span><a href="#counselor" data-action="counselor">상담사 보기 ${icon('arrow')}</a></div>`;
    $('#tabs').innerHTML = [{ label: '내 달력', n: 1, i: 'calendar' }, { label: '지원 찾기', n: 2, i: 'leaf' }, { label: '집 비교', n: 3, i: 'home' }, { label: '상담', n: 5, i: 'chat' }].map(t => `<a href="#scene-${t.n}" class="${scene === t.n ? 'active' : ''}" ${scene === t.n ? 'aria-current="page"' : ''}>${icon(t.i)}${t.label}</a>`).join('') + `<button data-action="settings">${icon('settings')}설정</button>`;
    $('[data-action=notifications]').innerHTML = icon('bell');
    renderConnection();
  }
  function revealResult(selector) {
    const target = $(selector);
    const phone = $('.phone');
    if (!target || !phone) return;
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s3'));
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    if (window.matchMedia('(max-width: 850px)').matches) {
      window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - $('#tour').getBoundingClientRect().height - gap), behavior });
    } else {
      phone.scrollTo({ top: phone.scrollTop + target.getBoundingClientRect().top - phone.getBoundingClientRect().top - gap, behavior });
    }
  }
  function offline() { return state.offline || navigator.onLine === false; }
  function renderConnection() {
    if (!$('#connection')) return;
    $('#connection').innerHTML = `${icon(offline() ? 'clock' : 'check')}<span>${!storageAvailable ? '기기 저장을 쓸 수 없어요. 기록을 내보내 주세요.' : offline() ? '오프라인으로 보고 있어요. 마지막으로 맞춘 날 10월 23일' : '기기에 보관 중 · 마지막으로 맞춘 날 10월 23일'}</span>`;
  }
  function render() {
    if (viewCounselor) { renderCounselor(); return; }
    renderShell();
    $('#screen').innerHTML = [calendarPage, regionPage, housingPage, storyPage, askPage, latePage][scene - 1]();
  }
  function calendarPage() {
    const p = state.profile, a = engine.allowance(p, TODAY);
    const deadline = a.deadline, late = (a.lost_won || 0) > 0;
    const laterDate = deadline ? E.shift(deadline, 21) : '';
    const possibleLoss = deadline ? engine.allowance({ ...p, apply_date: laterDate }, TODAY).lost_won : 0;
    const laterMonth = laterDate ? Number(laterDate.slice(5, 7)) : 0;
    const onTimeLabel = deadline ? `${Number(deadline.slice(5, 7))}월 ${Number(deadline.slice(8))}일` : '';
    const lateLabel = laterDate ? `${laterMonth}월 ${Number(laterDate.slice(8))}일` : '';
    return `${intro('민지의 달력 ' + badge('가명'), '첫 자립, 놓치지 않게.', '보호가 끝나는 날부터 놓치는 돈이 없게.')}
      <div class="row"><span class="small muted">${esc(p.region)} · 보호종료 ${dateText(p.end_date, false)}</span>${button('내 정보 ' + icon('edit'), 'onboard', 'text-button')}</div>
      ${a.status !== '대상' ? `<div class="callout"><h2>${esc(a.status)}</h2><p>${esc(a.why || '')}</p>${button('정보 확인', 'onboard', 'text-button')}</div>` : !deadline ? `<div class="callout warning"><h2>소급 시작일을 확인해 주세요</h2><p>조기 보호종료의 60일 시작일은 원문에 없어요. 날짜와 금액을 계산하지 않았어요.</p><a href="#scene-5">상담사에게 묻기</a></div>` : `<section class="card hero"><div class="row">${badge(state.applied ? '신청 기록 완료' : '자립수당 신청 마감')} ${icon('calendar')}</div><h2>${dateText(deadline, false)}까지</h2><p class="hero-loss">신청 안 하면 <strong>${man(possibleLoss)}</strong>을<br>놓칠 수 있어요.</p><p>${laterMonth}월에 신청하면 신청한 달 전의 수당은<br>돌려받지 못하는 조건이에요.</p><div class="hero-bottom"><span class="small">매달 ${man(B.allowance.amount_won)} 자립수당</span>${button('근거 보기 ' + icon('arrow'), 'basis-allowance', 'text-button')}</div></section>`}
      ${!state.consent ? button('내 달력 보기', 'onboard') : `<div class="callout">${icon('check')} 내 달력을 ${storageAvailable ? '이 기기에 저장했어요.' : '열었어요. 저장은 사용할 수 없어요.'}</div>`}
      <div class="section-title"><h2>오늘 할 일</h2><span>한 번에 하나씩</span></div>
      <button class="card task-card wide" data-action="task"><span class="task-icon">${icon(state.applied ? 'check' : 'file')}</span><span class="grow"><strong class="task-title">${state.applied ? '자립수당 신청을 마쳤어요' : state.education ? '준비물을 챙겨 신청하세요' : '자립교육 이수증 받기'}</strong><span class="task-description">${state.applied ? '신청 기록 보기와 되돌리기' : '이수증이 있으면 다음 단계로 가요'}</span></span>${icon('arrow')}</button>
      <div class="section-title"><h2>놓치지 않을 날짜</h2>${badge('내 일정')}</div>
      <div class="card timeline">${a.open ? `<div class="timeline-item"><strong>${dateText(a.open)}</strong><p>${state.applied ? '신청 기록을 남겼어요' : '이날부터 미리 신청할 수 있어요'}</p></div>` : ''}<div class="timeline-item"><strong>${dateText(p.end_date)}</strong><p>보호가 끝나는 날</p></div>${deadline && !state.applied ? `<div class="timeline-item"><strong>${dateText(deadline)}</strong><p>자립수당 소급 신청 마감</p>${badge('보호종료일 포함 60일', 'green')}</div>` : ''}</div>
      ${deadline ? `<section class="card"><h3>신청 날짜를 바꾸면?</h3><label class="gap-top">신청할 날짜<input id="apply-date" type="date" value="${esc(p.apply_date || deadline)}" min="${a.open}" max="${E.years(p.end_date, B.allowance.rules.within_years_after_end)}"></label><div class="actions">${button(onTimeLabel, 'on-time', 'secondary')}${button(lateLabel, 'late-date', 'secondary')}</div><div id="loss-result" class="callout ${late ? 'danger' : ''} gap-top" role="status">${lossText(a)}</div></section>` : ''}
      ${button('이렇게 계산했어요', 'calculation', 'text-button wide')}`;
  }
  function lossText(a) {
    if (a.status === '신청 기간 지남') return '<strong>보호종료 뒤 5년이 지나 신청할 수 없어요</strong><p>신청 날짜를 다시 확인해 주세요.</p>';
    if (a.warn) return `<strong>${dateText(a.open)}부터 신청할 수 있어요.</strong>`;
    if (!Number.isFinite(a.lost_won)) return '소급 시작일을 상담사에게 확인해 주세요.';
    return a.lost_won > 0 ? `<strong>${a.lost_months === 3 && state.profile.end_date === '2026-11-15' ? '11월, 12월, 1월분' : `지난 ${a.lost_months}달분`} ${man(a.lost_won)}을 못 받아요</strong><p>늦게 신청하면 신청한 달부터 받는 조건이에요.</p>` : '<strong>놓치는 돈 0원</strong><p>마감 안에 신청하면 보호가 끝난 달부터 받는 조건이에요.</p>';
  }
  function regionPage() {
    const r = state.region, reg = B.settle.by_region[r];
    return `${intro('지원 찾기', '사는 곳에 맞춰<br>정착금을 확인해요.', '최종 금액과 지급 시기는 담당 기관에서 확인해 주세요.')}
      <div class="region-options" role="group" aria-label="지역 선택">${['서울', '경기 구리', '충남', '대전'].map(region => button(region === '경기 구리' ? '구리' : region, 'region', region === r ? 'selected' : '', `data-region="${region}" aria-pressed="${region === r}"`)).join('')}</div>
      <div class="card"><div class="row"><h2>${r} 자립정착금</h2>${badge(reg?.status || '확인 필요', reg ? '' : 'warn')}</div><p class="result-amount gap-top">${reg ? man(reg.amount_won) : '1,000만~2,000만원'}</p><p class="subtitle">${reg ? '자립을 시작할 때 받는 지원금이에요.' : '지역 확인 필요. 합계에 넣지 않았어요.'}</p>
      ${r === '경기 구리' ? facts(reg.split.map(s => [s.when, man(s.amount_won)])) : r === '충남' ? facts([['지급 횟수', '2회 분할'], ['나누는 시기', badge('확인 필요', 'warn')]]) : r === '서울' ? facts([['확인 기준', '2024년 서울시 발표'], ['2026년 금액과 분할', badge('확인 필요', 'warn')]]) : facts([['지역별 금액', '주소지 담당자에게 확인'], ['계산에 포함', '포함하지 않음']])}
      ${button('근거 보기 ' + icon('arrow'), 'basis-region', 'text-button wide')}${button('신청 방법 보기', 'settle-guide', 'secondary wide')}</div>
      <div class="section-title"><h2>함께 확인할 지원</h2></div><div class="card"><div class="row"><h3>자립수당</h3>${badge('확인됨', 'green')}</div><p class="result-amount">매달 ${man(B.allowance.amount_won)}</p><p class="subtitle">일하고 있어도 다른 조건을 함께 확인해요.</p>${button('근거 보기', 'basis-amount', 'text-button')}</div>
      ${r === '서울' ? `<div class="card"><div class="row"><h3>대중교통비 ${man(B.seoul_transit.amount_won)}</h3>${badge('확인 필요', 'warn')}</div><p class="subtitle">매달 받는지, 몇 번 받는지 원문에 없어요.<br>달력과 잔액 계산에는 넣지 않았어요.</p>${button('근거 보기', 'basis-transit', 'text-button')}</div>` : ''}
      ${button('이렇게 계산했어요', 'calculation', 'text-button wide')}`;
  }
  function housingPage() {
    const eligibility = engine.jeonse(D.people.personas[0], TODAY);
    return `${intro('집 비교', '계약하기 전에,<br>남는 돈을 살펴봐요.', '서울에 사는 민지의 입력값으로 비교해요.')}
      <label class="card house"><input type="checkbox" id="house-a" checked><span><strong class="task-title">민간 원룸</strong><span class="task-description">보증금 ${man(D.housing.input.a_deposit)} · 월세 ${man(D.housing.input.a_rent)}<br>12월에 바로 입주</span></span></label>
      <label class="card house"><input type="checkbox" id="house-b" checked><span><strong class="task-title">전세임대</strong><span class="task-description">전세금 ${man(D.housing.input.b_jeonse)}<br>입주까지 ${D.housing.input.b_wait_months}달 대기</span><span class="task-description gap-top">${badge('확인 필요')}<br>${esc(eligibility.check)}</span><span class="task-description">2024년 LH 발표 기준, 2026년 공고로 확인</span></span></label>
      ${button('12개월 비교', 'compare')}${button('생활비와 계산 조건 보기', 'assumptions', 'text-button wide')}
      <div id="housing-result">${compare ? housingResult() : `<div class="empty">${icon('home')}<h3>보증금 낼 달까지 함께 봐요</h3><p>두 집을 선택하면 월별 잔액을 비교할 수 있어요.</p></div>`}</div>` ;
  }
  function housingResult() {
    const h = engine.housingCompare(D.housing.input);
    const a = h['민간 월세·제때'], b = h['전세임대·제때'], bd = h['전세임대·2달 늦게'];
    return `<div class="section-title"><h2>12개월 통장 잔액</h2><span>2026년 12월부터</span></div><div class="card"><div class="legend"><span><i class="gray"></i>민간 원룸</span><span><i></i>전세임대</span></div>${chart(h)}<label class="check"><input id="delay-toggle" type="checkbox" ${delay ? 'checked' : ''}>지원이 2달 늦게 오면 <span class="small muted">점선</span></label><p class="small muted">지원 시점은 계산을 위한 가정이에요. 실제 지급일과 달라요.</p></div>
      <div class="card danger"><p class="small">민간 원룸의 첫 달 잔액</p><p class="result-amount">${man(a.flow[0].balance)}</p><p>정착금을 받기 전에 보증금을 내면 모자라요.</p><p class="subtitle">보증금은 정착금이 들어온 뒤 내도 되는지 집주인과 날짜를 맞춰 보세요.</p></div>
      <div class="card"><h3>전세임대의 가장 낮은 잔액</h3>${facts([['제때 들어오면', `<strong>${man(b.min)}</strong>`], ['2달 늦게 들어오면', `<strong>${man(bd.min)}</strong>`]])}<p class="small muted">2024년 LH 발표 기준, 2026년 공고로 확인</p>${button('지원 조건 근거', 'basis-jeonse', 'text-button')}</div>
      ${button('월별 금액 보기', 'monthly', 'secondary wide')}<div class="actions">${button('비교 기록 저장', 'save-housing', 'secondary')}${button(icon('download') + '내보내기', 'export-housing', 'secondary')}</div>` ;
  }
  function chart(h) {
    const min = -5000000, max = 35000000, x = i => 40 + i * 23, y = v => 190 - (v - min) / (max - min) * 170;
    const lines = Object.entries(h).filter(([k]) => delay || !k.includes('2달')).map(([k, v]) => `<polyline class="${k.startsWith('민간') ? 'line-a' : 'line-b'} ${k.includes('2달') ? 'delayed' : ''}" points="${v.flow.map((f, i) => `${x(i)},${y(f.balance).toFixed(2)}`).join(' ')}"/>`).join('');
    return `<svg class="chart" viewBox="0 0 310 226" role="img" aria-label="12개월 통장 잔액. 민간 원룸 첫 달 마이너스 105만원. 전세임대 최저 420만원, 지원이 두 달 늦으면 320만원."><title>두 집의 12개월 통장 잔액 비교</title>${[0, 10000000, 20000000, 30000000].map(v => `<line class="axis" x1="40" y1="${y(v)}" x2="293" y2="${y(v)}"/><text x="0" y="${y(v) + 4}">${(v / 10000).toLocaleString('ko-KR')}</text>`).join('')}<text x="0" y="12">만원</text>${lines}<circle cx="40" cy="${y(h['민간 월세·제때'].flow[0].balance)}" r="4" fill="var(--muted)"/><text x="40" y="218">12월</text><text x="150" y="218">5월</text><text x="273" y="218">11월</text></svg>`;
  }
  function storyPage() {
    const story = state.storyDraft ?? stories[storyIndex === 0 ? 0 : 1];
    return `${intro('내 이야기', '평소 쓰는 말로<br>알려 주세요.', '정확히 모르는 건 비워 두어도 괜찮아요.')}
      <div class="actions">${button('날짜를 아는 상황', 'story-known', 'secondary')}${button('날짜를 모르는 상황', 'story-unknown', 'secondary')}</div><label class="gap-top">지금 내 상황<textarea id="story-input" maxlength="2000">${esc(story)}</textarea></label><p class="small muted">키보드의 마이크로 말해서 입력할 수도 있어요.<br>이름, 연락처, 시설 이름은 적지 마세요.</p>${button('정리하기', 'organize', 'primary wide gap-top')}<div id="story-result">${storyResult ? storyResultHTML() : ''}</div>` ;
  }
  function storyResultHTML() {
    const s = storyIndex === 0 ? D.story0 : D.story9;
    return `<div class="section-title"><h2>이렇게 정리했어요</h2>${badge('직접 확인해 주세요')}</div><div class="card">${facts([['지역', s.region || '확인 필요'], ['보호가 끝나는 날', s.end_date ? dateText(s.end_date) : '확인 필요'], ['2년 이상 보호', s.care_years_2plus === true ? '예' : '확인 필요'], ['일하고 있나요', s.working === true ? '예' : '확인 필요'], ['종료 유형', s.end_type || '확인 필요'], ['원가정 복귀', s.returned_home === false ? '아니요' : '확인 필요']])}</div><div class="callout ${s.end_date ? '' : 'warning'}"><strong>${s.end_date ? '두 가지만 더 알려 주세요' : '날짜와 지역부터 확인할게요'}</strong><p>${s.end_date ? '아래 답을 확인하기 전에는 달력을 만들지 않아요.' : '종료 날짜를 모르니 아직 달력을 만들 수 없어요.'}</p></div>${s.asks.map(q => `<p class="question">${esc(q)}</p>`).join('')}${button('빠진 정보 채우기', 'story-complete', 'secondary wide')}${button('이렇게 계산했어요', 'calculation', 'text-button wide')}`;
  }
  function askPage() {
    const msgs = state.messages.filter(m => m.person === '유나');
    const latest = msgs[msgs.length - 1];
    return `${intro('유나의 상담 ' + badge('가명'), '애매한 조건은<br>함께 확인해요.', '서울에서 16세에 보호가 끝났고, 올해 3월에 만 18세가 됐어요.')}
      <div class="card"><div class="row"><h2>자립수당 소급 시작일</h2>${badge('확인 필요', 'warn')}</div><p class="gap-top">60일을 보호종료일부터 셀까요,<br>만 18세가 된 날부터 셀까요?</p><p class="subtitle">원문에 없어 날짜와 금액을 계산하지 않았어요.</p>${button('근거 보기', 'basis-early', 'text-button')}</div>
      ${latest ? `<div class="callout"><strong>${latest.status === 'queued' ? '기기에 보관했어요' : latest.reply ? '상담사가 답변했어요' : '문의함에 보냈어요'}</strong><p>${latest.status === 'queued' ? '다시 연결한 뒤 보내기를 눌러 주세요.' : latest.reply ? esc(latest.reply) : '문의 내용을 상담사 보기에서 확인할 수 있어요.'}</p>${latest.status === 'queued' ? button('다시 보내기', 'retry', 'secondary wide') : ''}</div>` : ''}
      ${button('상담사에게 묻기', 'compose')}<div class="card gap-top"><span class="task-icon">${icon('shield')}</span><h3 class="gap-top">내가 확인한 뒤에만 보내요</h3><p class="subtitle">물어볼 문장을 미리 적어 드려요.<br>내용을 고친 뒤 직접 보낼 수 있어요.</p><p class="small muted gap-top">이름과 연락처는 넣지 않았어요. 청년과 상담사 화면은 이 브라우저의 저장 공간으로 연결돼요.</p></div><a class="secondary wide" href="#counselor" data-action="counselor">상담사 보기 ${icon('arrow')}</a>${button('연결 상태 바꾸기', 'connection', 'text-button wide')}` ;
  }
  function latePage() {
    const p = D.people.personas[4], a = engine.allowance(p, TODAY);
    return `${intro('도윤의 달력 ' + badge('가명'), '지금부터<br>하나씩 챙겨 봐요.', '보호종료 2025년 8월 31일. 자립정착금은 이미 받았어요.')}
      ${!lateResult ? `<div class="card"><span class="task-icon">${icon('calendar')}</span><h2 class="gap-top">아직 신청할 수 있는<br>지원이 있어요.</h2><p class="subtitle">수당을 뒤늦게 알았어도 괜찮아요.<br>오늘 기준으로 확인해 볼게요.</p></div>${button('지금 신청하면?', 'late-result')}` : `<div class="card"><p class="small muted">이미 지난 기간</p><p class="result-amount muted">${man(a.lost_won)}</p><p>지난 ${a.lost_months}달 치는 돌려받을 수 없어요.</p><p class="subtitle">놓친 기간보다 지금 할 수 있는 일부터 챙겨요.</p></div><div class="card hero">${badge('지금 신청할 수 있는 조건')}<h2>오늘 신청하면<br>10월분부터 받는 조건이에요.</h2><p>최종 지급은 주민센터에서 확인해요.</p><p>매달 ${man(B.allowance.amount_won)} 자립수당</p><div class="hero-bottom"><p>${dateText(E.years(p.end_date, 5))}까지<br>보호종료 5년 이내 대상이에요.</p></div></div><div class="section-title"><h2>오늘 할 일 하나</h2></div><button class="card task-card wide" data-action="late-task"><span class="task-icon">${icon('file')}</span><span class="grow"><strong class="task-title">${state.lateEducation ? '행정복지센터에서 신청하기' : '자립교육 이수증 받기'}</strong><span class="task-description">${state.lateApplied ? '신청 기록을 남겼어요' : '이수증을 챙긴 뒤 주소지 행정복지센터로 가세요'}</span></span>${icon('arrow')}</button><p class="small muted">받을 수 있는 조건이에요. 주민센터에서 최종 확인해 주세요.</p>${button('근거 보기', 'basis-allowance', 'text-button wide')}`}` ;
  }
  const sourceNames = { 'easylaw-allowance.txt': '찾기쉬운 생활법령정보', 'gov24-allowance.txt': '정부24', 'ncrc-faq.txt': '아동권리보장원', 'seoul-welfare-allowance.txt': '서울시 복지 소식', 'vegannews-60days.txt': '비건뉴스에서 인용한 2026년 안내', 'seoul-mediahub.txt': '서울시 내 손안에 서울', 'guri-settle.txt': '구리시 청년 지원 안내', 'gov24-chungnam-settle.txt': '정부24 충청남도 안내', 'munhwa-jeonse.txt': '문화일보에서 인용한 2024년 LH 발표' };
  function basis(kind) {
    let title, sources, status, note = '';
    if (kind === 'allowance') { title = '소급 신청 마감의 근거'; sources = [B.allowance.sources[5], B.allowance.sources[1]]; status = B.allowance.status.retro_days; note = '보호가 끝난 날을 첫날로 세어 60일째를 계산해요. 조기 보호종료의 시작일은 별도 확인이 필요해요.'; }
    else if (kind === 'amount') { title = '자립수당 금액의 근거'; sources = [B.allowance.sources[0], B.allowance.sources[2]]; status = B.allowance.status.amount_won; }
    else if (kind === 'region') { const r = B.settle.by_region[state.region] || B.settle.other_region; title = `${state.region} 정착금의 근거`; sources = [r.source]; status = r.status; note = r.note || (state.region === '충남' ? '나누는 시기와 각 회차의 금액은 원문에 없어요.' : state.region === '대전' ? '지역의 확정 금액이 아니에요. 달력과 합계에 넣지 않았어요.' : '퇴소한 해와 다음 해에 나누어 받는 조건이에요.'); }
    else if (kind === 'transit') { title = '대중교통비의 근거'; sources = B.seoul_transit.sources; status = '확인 필요'; note = '금액은 한 곳에서 확인했어요. 단위와 횟수는 원문에 없어 계산에 넣지 않았어요.'; }
    else if (kind === 'jeonse') { title = '전세임대 지원의 근거'; sources = B.jeonse.sources; status = '한 곳 확인'; note = '2024년 LH 발표 기준, 2026년 공고로 확인. 무주택 여부와 혼인 여부도 확인해야 해요.'; }
    else { title = '조기 보호종료는 확인이 필요해요'; sources = [B.allowance.sources[5]]; status = '확인 필요'; note = B.allowance.open_questions[0]; }
    sheet(title, `${badge(status, status === '확인 필요' ? 'warn' : '')}<p class="gap-top">${esc(note || '받을 수 있는 조건을 안내해요. 주민센터에서 최종 확인해 주세요.')}</p>${sources.map(s => `<blockquote>${esc(s.quote)}</blockquote><p class="small"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(sourceNames[s.file] || '안내문 원문')} ${icon('arrow')}</a><br>열람일 2026년 10월 23일</p>`).join('')}<p class="small muted">확인됨: 공식 원문 여러 곳을 대조했어요.<br>한 곳 확인: 공식 원문 한 곳 또는 보도에서 확인했어요.<br>확인 필요: 근거가 없어 계산에서 뺐어요.</p>`);
  }
  function onboard(fromStory = false) {
    const s = storyIndex === 0 ? D.story0 : D.story9;
    const p = fromStory ? { ...state.profile, region: s.region || '', end_date: s.end_date || '', end_type: '', returned_home: false } : state.profile;
    sheet(fromStory ? '빠진 정보를 확인해 주세요' : '내 달력 만들기', `<p>가입 없이 시작해요. 이름과 연락처는 받지 않아요.</p><form id="profile-form" class="form-grid"><label>보호가 끝나는 날<input name="end_date" type="date" min="2000-01-01" max="${E.years(p.end_date || TODAY, B.allowance.rules.within_years_after_end)}" value="${esc(p.end_date)}" required></label><label class="check"><input id="unknown-date" type="checkbox">정확한 날짜를 몰라요</label><label>사는 지역<select name="region" required><option value="">지역 선택</option>${regionOptions(p.region)}</select></label><label>보호가 끝나는 유형<select name="end_type" required><option value="">유형 선택</option>${['만기', '연장', '조기'].map(t => `<option value="${t}" ${p.end_type === t ? 'selected' : ''}>${{ 만기: '만 18세 이후 정해진 날에 끝나요', 연장: '보호 기간을 연장했어요', 조기: '만 18세 전에 끝났어요' }[t]}</option>`).join('')}</select></label><label>생년월일<input name="birth" type="date" min="1980-01-01" max="2026-10-23" value="${esc(p.birth)}" required></label><label>보호가 시작된 달<input name="care_start" type="month" min="1990-01" max="2035-12" value="${esc(p.care_start)}" required></label><label>보호가 끝난 뒤 부모님 댁으로 돌아가나요?<select name="returned_home" required>${fromStory ? '<option value="">답 선택</option>' : ''}<option value="no" ${!fromStory && !p.returned_home ? 'selected' : ''}>아니요</option><option value="yes" ${p.returned_home ? 'selected' : ''}>예</option></select></label><label class="check"><input name="still_in_care" type="checkbox" ${p.still_in_care ? 'checked' : ''}>보호 중에 시설만 옮겨요</label><label class="check"><input name="other_law_allowance" type="checkbox" ${p.other_law_allowance ? 'checked' : ''}>다른 법령의 자립수당을 받고 있어요</label><div class="callout"><strong>이 기기에만 보관해요</strong><p>입력한 날짜와 지역, 신청 기록, 상담 문장은 서버로 보내지 않아요. 마지막 저장일부터 30일 뒤 다시 열 때 지워요. 설정에서 바로 지울 수도 있어요.</p><label class="check"><input name="consent" type="checkbox" ${state.consent ? 'checked' : ''} required>기기 보관 안내를 확인했어요</label></div><p id="profile-error" class="error" role="alert"></p><button class="primary wide" type="submit">내 달력 보기</button></form>`);
  }
  function task(late = false) {
    const done = late ? state.lateApplied : state.applied;
    const education = late ? state.lateEducation : state.education;
    sheet(done ? '신청 기록' : education ? '신청할 준비가 됐어요' : '오늘은 이수증부터 챙겨요', `<p>${done ? '직접 남긴 신청 기록이에요. 실제 접수 결과는 신청 기관에서 확인해 주세요.' : '자립교육을 듣고 이수증을 저장해 주세요. 국민연금공단 재무상담 확인서로 대신할 수도 있어요.'}</p><div class="card"><h3>준비물</h3><ul>${B.allowance.documents.map(d => `<li>${esc(d)}</li>`).join('')}</ul></div><p><strong>주소지 행정복지센터</strong>에서 신청하거나 복지로에서 온라인으로 신청해요. 대리 신청은 방문만 가능해요.</p><div class="actions"><a class="secondary" target="_blank" rel="noopener noreferrer" href="https://www.bokjiro.go.kr/">복지로 열기</a><a class="secondary" href="tel:129">129에 문의</a></div><div class="gap-top">${done ? button('신청 기록 되돌리기', late ? 'undo-late' : 'undo-apply', 'secondary wide') : education ? button('신청함', late ? 'apply-late' : 'apply') : button('이수증을 받았어요', late ? 'education-late' : 'education')}</div><p class="small muted gap-top">신청 기록은 지원 기관의 접수 내역과 자동으로 연결되지 않아요.</p>`);
  }
  function assumptions() {
    const c = D.housing.input;
    const rows = [['시작할 때 통장 잔액', c.start_balance, '민지가 입력한 가정'], ['월 근로소득', c.wage, '민지가 입력한 가정'], ['집세를 뺀 월 생활비', c.living, '민지가 입력한 가정'], ['원룸 보증금', c.a_deposit, '집 조건 가정'], ['원룸 월세', c.a_rent, '집 조건 가정'], ['전세금', c.b_jeonse, '집 조건 가정'], ['대기 중 월 주거비', c.b_wait_cost, '집 조건 가정'], ['입주 후 월 관리비', c.b_upkeep, '집 조건 가정'], ['전세임대 본인 보증금', B.jeonse.rules.self_deposit_won, '2024년 LH 발표']];
    sheet('생활비와 계산 조건', `<p class="small muted">월세와 생활비, 입주 대기는 계산을 위한 가정이에요. 지원 조건은 아래 근거를 따로 표시했어요.</p><div class="table-wrap"><table class="compact-table"><thead><tr><th>항목</th><th>값</th><th>단위</th><th>근거</th></tr></thead><tbody>${rows.map(([k, v, src]) => `<tr><td>${k}</td><td>${v.toLocaleString('ko-KR')}</td><td>원</td><td>${src}</td></tr>`).join('')}</tbody></table></div>${facts([['시작하는 달', '2026년 12월'], ['입주 대기', '2개월'], ['민지 나이', '만 18세'], ['전세임대 월 임대료', '22세 이하 무이자 조건'], ['자립수당', '첫 달에 11월분과 12월분을 함께 받는 가정'], ['자립정착금', '두 번째 달에 2,000만원을 받는 가정']])}<p class="small muted">정착금이 들어올 시점은 확인된 지급 일정이 아니에요. 이사비와 중개수수료, 보증금 반환은 계산하지 않았어요. 비교는 입력한 조건의 통장 잔액이며 지급을 보장하지 않아요.</p><p class="small">2024년 LH 발표 기준, 2026년 공고로 확인</p>`);
  }
  function monthly() {
    const h = engine.housingCompare(D.housing.input), keys = Object.keys(h);
    sheet('월별 잔액 확인', `<p class="small muted">단위는 원이에요. 늦게 받는 경우도 전체 지원금은 같고 받는 달만 달라요.</p><div class="table-wrap"><table class="compact-table"><thead><tr><th>월</th><th>원룸</th><th>전세임대</th></tr></thead><tbody>${h[keys[0]].flow.map((r, i) => `<tr><td>${r.month}</td><td>${money(r.balance)}</td><td>${money(h[keys[2]].flow[i].balance)}</td></tr>`).join('')}</tbody></table></div><p class="gap-top">지원이 2달 늦게 오면</p><div class="table-wrap"><table class="compact-table"><thead><tr><th>월</th><th>원룸</th><th>전세임대</th></tr></thead><tbody>${h[keys[1]].flow.map((r, i) => `<tr><td>${r.month}</td><td>${money(r.balance)}</td><td>${money(h[keys[3]].flow[i].balance)}</td></tr>`).join('')}</tbody></table></div>${button('비교 기록 내보내기', 'export-housing', 'secondary wide gap-top')}`);
  }
  function compose() {
    sheet('상담사에게 물어보기', `<p class="small muted">받는 곳: 서울 자립지원전담기관 문의함</p><label>물어볼 문자<textarea id="message-input" maxlength="1500" rows="9">${esc(state.draft ?? D.ask)}</textarea></label><p class="small muted gap-top">이름과 연락처는 넣지 않았어요. 문장에 개인정보를 덧붙이지 말아 주세요.</p><label class="check"><input id="send-consent" type="checkbox">내용을 확인했고, 이 기기 문의함에 보관할게요.</label><p class="small muted">마지막 저장일부터 30일 뒤 다시 열 때 지워요. 외부로 전송하지 않아요.</p><p class="error" id="send-error" role="alert"></p>${button(offline() ? '보관하기' : '보내기', 'send', 'primary wide gap-top')}`);
  }
  function settings() {
    sheet('설정과 도움말', `<div class="stack">${button('처음부터 내 정보 입력', 'onboard', 'secondary wide')}${button('말로 쓴 상황 정리', 'go-story', 'secondary wide')}${button('알림 설정', 'notifications', 'secondary wide')}${button('연결 상태와 다시 보내기', 'connection', 'secondary wide')}${button('내 기록 내보내기', 'export-records', 'secondary wide')}${button('이 서비스는', 'about', 'secondary wide')}${button('개인정보와 기기 보관', 'privacy', 'secondary wide')}${button('이 기기의 기록 지우기', 'clear-confirm', 'secondary wide')}</div><p class="gap-top"><strong>막히면 도움을 요청하세요</strong></p><p class="small"><a href="tel:129">보건복지상담센터 129</a><br><a href="tel:16700002">전세임대 콜센터 1670-0002</a></p><p class="small muted">다운로드한 폴더의 파일은 인터넷 없이 열 수 있어요. 웹 주소는 첫 방문에 인터넷이 필요해요. 화면 파일을 모두 저장한 뒤에는 같은 주소를 오프라인으로 다시 열 수 있어요. 공용 컴퓨터에서는 사용한 뒤 기록을 지워 주세요.</p>`);
  }
  function connection() {
    const queued = state.messages.filter(m => m.status === 'queued').length;
    sheet('연결 상태', `<div class="callout"><strong>${offline() ? '오프라인으로 사용 중이에요' : '연결되어 있어요'}</strong><p>마지막으로 맞춘 날 10월 23일</p></div><p>저장한 달력은 연결이 끊겨도 볼 수 있어요. 문의는 기기에 보관하고 다시 연결한 뒤 보내세요.</p>${facts([['보내기를 기다리는 문의', `${queued}건`], ['기기 저장', storageAvailable ? '사용 가능' : '사용 불가']])}<label class="check"><input id="offline-toggle" type="checkbox" ${state.offline ? 'checked' : ''}>데이터 연결 끄기</label>${queued ? button('다시 보내기', 'retry', 'primary wide gap-top') : ''}<p class="small muted gap-top">이 설정은 앱 안에서 연결이 끊긴 상황을 재현해요. 실제 네트워크 설정은 바꾸지 않아요.</p>`);
  }
  function peopleRows() {
    return D.people.personas.map((original, i) => {
      const p = i === 0 ? state.profile : original;
      const results = engine.plan(p, TODAY), a = results[0];
      const applied = i === 0 ? state.applied : i === 4 ? state.lateApplied : false;
      const days = a.deadline ? E.days(TODAY, a.deadline) : null;
      const checks = results.filter(b => b.check || b.status === '확인 필요').length;
      const lost = a.status === '대상' && a.deadline ? (engine.allowance({ ...p, apply_date: a.deadline < TODAY ? TODAY : E.shift(a.deadline, 21) }, TODAY).lost_won || 0) : null;
      const name = original.name.split('(')[0];
      return { name, p, a, applied, days, checks, lost, status: applied ? '신청 기록 있음' : a.status === '대상' ? '신청 가능 조건' : a.status, i };
    }).sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity));
  }
  function renderCounselor() {
    $('#tour').innerHTML = '<span><strong>시연 · 상담사 보기</strong><span class="tour-task">청년이 보낸 문의를 확인하세요</span></span><a href="#scene-5" data-action="youth">청년 보기</a>';
    const rows = peopleRows();
    const shown = rows.filter(r => (!query || `${r.name} ${r.p.region}`.includes(query)) && (filter === 'all' || filter === 'check' && r.checks > 0 || filter === 'urgent' && r.days !== null && r.days <= 14 && !r.applied));
    const visibleMessages = state.messages.filter(m => m.status !== 'queued');
    $('#screen').innerHTML = `<div class="title-row"><div><p class="eyebrow">상담사 보기</p><h1>오늘 챙길 청년</h1><p class="subtitle">마감이 가까운 순으로 확인하세요. 기준일 ${dateText(TODAY)}</p></div>${button(icon('download') + '기록 내보내기', 'export-counselor', 'secondary')}</div><div class="metrics"><div class="card"><span class="muted">맡은 청년</span><strong>${rows.length}명</strong></div><div class="card"><span class="muted">마감 임박 또는 지남</span><strong>${rows.filter(r => r.days !== null && r.days <= 14 && !r.applied).length}명</strong></div><div class="card"><span class="muted">답변할 문의</span><strong>${visibleMessages.filter(m => !m.reply).length}건</strong></div></div><section class="card"><div class="filters"><label>이름이나 지역 검색<input id="people-search" type="search" placeholder="가명 또는 지역을 입력하세요" value="${esc(query)}"></label><label>확인할 상태<select id="people-filter"><option value="all" ${filter === 'all' ? 'selected' : ''}>전체 청년</option><option value="urgent" ${filter === 'urgent' ? 'selected' : ''}>14일 안 마감 또는 지남</option><option value="check" ${filter === 'check' ? 'selected' : ''}>확인 필요 있음</option></select></label></div><p class="small muted">${shown.length}명 표시. 마감을 알 수 없는 청년은 목록 끝에 있어요. 금액은 미신청 상태를 가정했어요.</p><div class="table-wrap"><table><thead><tr><th>이름 (가명)</th><th>지역</th><th>보호종료일</th><th>자립수당 상태</th><th>마감까지</th><th>놓칠 금액</th><th>확인 필요</th></tr></thead><tbody>${shown.map(r => `<tr><td>${button(esc(r.name), 'person', 'text-button', `data-person="${r.i}"`)}</td><td>${esc(r.p.region)}</td><td>${dateText(r.p.end_date)}</td><td>${badge(r.status, r.applied ? 'green' : '')}</td><td>${r.applied ? '신청 기록 완료' : r.days === null ? '확인 필요' : r.days < 0 ? `${Math.abs(r.days)}일 지남` : `${r.days}일 남음`}</td><td>${r.applied ? '신청 결과 확인' : money(r.lost)}</td><td>${r.checks}개</td></tr>`).join('')}</tbody></table></div>${shown.length ? '' : `<div class="empty">${icon('help')}<h3>찾는 청년이 없어요</h3><p>이름이나 지역을 바꾸거나 필터를 풀어 주세요.</p>${button('검색 초기화', 'reset-search', 'secondary gap-top')}</div>`}</section><div class="section-title"><h2>받은 문의함</h2><span>새 문의는 자동으로 반영돼요</span></div>${visibleMessages.length ? visibleMessages.slice().reverse().map(m => `<article class="card inbox-item"><div><div class="row"><h3>${esc(m.person)}의 문의</h3>${badge(m.reply ? '답변 완료' : '답변 기다림', m.reply ? 'green' : '')}</div><p class="small muted">${dateText(TODAY)} · 소급 시작일 확인</p><p>${esc(m.text)}</p>${m.reply ? `<div class="callout"><strong>남긴 답변</strong><p>${esc(m.reply)}</p></div>` : ''}</div><form class="reply-form" data-message="${esc(m.id)}"><label>답변 남기기<textarea name="reply" maxlength="1000" required placeholder="공식 확인 결과와 다음 할 일을 적어 주세요">${esc(m.reply || '')}</textarea></label><button class="primary wide gap-top" type="submit">답변 저장</button></form></article>`).join('') : `<div class="card empty">${icon('chat')}<h3>아직 받은 문의가 없어요</h3><p>청년이 보내기를 누르면 이곳에서 확인할 수 있어요.</p><a class="secondary gap-top" href="#scene-5" data-action="youth">청년 상담 화면 열기</a></div>`}`;
  }
  function download(name, rows) {
    const csv = '\uFEFF' + rows.map(row => row.map(value => {
      let text = String(value ?? '확인 필요');
      if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    }).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast('한글 항목 이름으로 기록을 내보냈어요.');
  }
  function exportHousing() {
    const h = engine.housingCompare(D.housing.input);
    download('집비교-12개월.csv', [['구분', '지급 시점', '월', '들어온 지원금 (원)', '주거비 (원)', '통장 잔액 (원)', '자료 구분'], ...Object.entries(h).flatMap(([key, result]) => result.flow.map(r => [key.split('·')[0], key.split('·')[1], r.month, money(r.in), money(r.housing), money(r.balance), '시연용 모의 데이터; 실제 지급일은 확인 필요']))]);
  }
  function exportRecords() {
    const a = engine.allowance(state.profile, TODAY);
    download('먼저살기-내기록.csv', [['항목', '내용', '근거'], ['지역', state.profile.region, '입력한 정보'], ['보호종료일', dateText(state.profile.end_date), '입력한 정보'], ['소급 신청 마감', dateText(a.deadline), '보호종료일 포함 60일; 조기종료는 확인 필요'], ['교육 이수증', state.education ? '받음' : '준비 중', '직접 남긴 기록'], ['신청 기록', state.applied ? '신청함' : '신청 전', '접수 결과는 기관에 확인'], ...state.messages.map(m => ['상담 문의', m.text, m.status === 'queued' ? '기기 보관 중' : '문의함 저장']), ...state.messages.filter(m => m.reply).map(m => ['상담 답변', m.reply, '상담사 보기에서 남긴 기록']), ['자료 구분', '시연용 모의 데이터', '실제 지급 여부는 주민센터가 정합니다']]);
  }
  function navigate(n) { if (scene === n && location.hash === '#scene-' + n) render(); else location.hash = 'scene-' + n; }
  function changeApply(value) {
    const a = engine.allowance(state.profile, TODAY);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < a.open) { toast('미리 신청할 수 있는 날 이후로 골라 주세요.'); return; }
    state.profile.apply_date = value; save(); render();
  }
  function goCounselor() {
    save();
    location.hash = 'counselor';
  }
  async function action(name, target) {
    if (name.startsWith('basis-')) { basis(name.slice(6)); return; }
    switch (name) {
      case 'next': navigate(scene === 6 ? 1 : scene + 1); break;
      case 'close': closeSheet(); break;
      case 'onboard': onboard(); break;
      case 'story-complete': onboard(true); break;
      case 'on-time': changeApply(engine.allowance(state.profile, TODAY).deadline); break;
      case 'late-date': changeApply(E.shift(engine.allowance(state.profile, TODAY).deadline, 21)); break;
      case 'task': task(); break;
      case 'late-task': task(true); break;
      case 'education': state.education = true; save(); closeSheet(); render(); toast('이수증을 받은 것으로 기록했어요. 이제 신청할 준비물을 챙겨요.'); break;
      case 'education-late': state.lateEducation = true; save(); closeSheet(); render(); toast('이수증을 기록했어요. 주소지 행정복지센터에서 신청해 주세요.'); break;
      case 'apply': case 'apply-late':
        state[name === 'apply' ? 'applied' : 'lateApplied'] = true; save(); closeSheet(); render(); toast('신청 기록을 남겼어요. 기록에서 되돌릴 수 있어요.'); break;
      case 'undo-apply': case 'undo-late': state[name === 'undo-apply' ? 'applied' : 'lateApplied'] = false; save(); closeSheet(); render(); toast('신청 전 상태로 되돌렸어요.'); break;
      case 'region': state.region = target.dataset.region; save(); render(); break;
      case 'settle-guide': sheet('자립정착금 신청하기', '<p>먼저 아동복지시설 또는 가정위탁지원센터에 문의해 주세요.</p><ol><li>담당자와 지역별 금액을 확인해요.</li><li>자립정착금 사용계획서를 작성해요.</li><li>센터나 시설에서 관할 시군구청에 신청해요.</li></ol><p class="small muted">사용계획서는 정착금을 어디에 쓸지 적는 서류예요. 지역의 서식을 담당자에게 받아 주세요.</p>'); break;
      case 'compare':
        if (!$('#house-a').checked || !$('#house-b').checked) { toast('비교할 집 두 곳을 모두 선택해 주세요.'); return; }
        compare = true; $('#housing-result').innerHTML = housingResult(); revealResult('#housing-result'); break;
      case 'assumptions': assumptions(); break;
      case 'monthly': monthly(); break;
      case 'save-housing': state.housingSaved = true; toast(save() ? '집 비교 기록을 이 기기에 저장했어요.' : '기기에 저장할 수 없어요. 내보내기를 눌러 주세요.'); break;
      case 'export-housing': exportHousing(); break;
      case 'story-known': case 'story-unknown': storyIndex = name === 'story-known' ? 0 : 9; state.storyDraft = stories[storyIndex === 0 ? 0 : 1]; storyResult = false; save(); render(); break;
      case 'organize': {
        const text = $('#story-input').value.trim();
        if (!text) { toast('상황을 한 문장 이상 적어 주세요.'); $('#story-input').focus(); return; }
        const index = stories.findIndex(s => s === text);
        if (index < 0) { sheet('직접 입력해 주세요', '<p>이 화면에서는 미리 정리한 두 상황을 확인할 수 있어요. 새로 쓴 글은 자동으로 분석하지 않아요.</p><p>쓴 내용은 기기에 남겨 두고, 날짜와 지역을 직접 입력할 수 있어요.</p>' + button('내 정보 입력', 'onboard')); return; }
        storyIndex = index === 0 ? 0 : 9; storyResult = true;
        $('#story-result').innerHTML = '<div role="status" aria-label="상황 정리 중"><div class="skeleton"></div><div class="skeleton"></div><p class="small muted">정리한 조건을 불러오고 있어요.</p></div>';
        await new Promise(resolve => setTimeout(resolve, 180));
        if ($('#story-result')) { $('#story-result').innerHTML = storyResultHTML(); revealResult('#story-result'); }
        break;
      }
      case 'compose': compose(); break;
      case 'send': {
        const text = $('#message-input').value.trim();
        if (!text) { $('#send-error').textContent = '보낼 내용을 적어 주세요.'; return; }
        if (!$('#send-consent').checked) { $('#send-error').textContent = '내용과 기기 보관 안내를 먼저 확인해 주세요.'; return; }
        if (/(?:01[016789][ -]?\d{3,4}[ -]?\d{4}|\b\d{6}-[1-4]\d{6}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,})/i.test(text)) { $('#send-error').textContent = '연락처나 개인 식별 번호를 지운 뒤 보내 주세요.'; return; }
        const queued = offline();
        state.messages.push({ id: String(Date.now()), person: '유나', text, status: queued ? 'queued' : 'sent', reply: '' }); state.draft = text;
        const saved = save();
        if (!saved) { state.messages.pop(); $('#send-error').textContent = '기기 저장을 사용할 수 없어 보내지 못했어요. 브라우저 저장 설정을 확인해 주세요.'; return; }
        closeSheet(); render(); toast(queued ? '연결이 끊겨 기기에 보관했어요. 연결한 뒤 다시 보내 주세요.' : '상담사 문의함에 보냈어요.'); break;
      }
      case 'retry': {
        if (offline()) { toast('아직 연결이 끊겨 있어요. 연결한 뒤 다시 보내 주세요.'); return; }
        const pending = state.messages.filter(m => m.status === 'queued');
        pending.forEach(m => { m.status = 'sent'; });
        if (!save()) { pending.forEach(m => { m.status = 'queued'; }); toast('문의함에 저장하지 못했어요. 기기 저장 설정을 확인해 주세요.'); return; }
        if ($('#sheet').open) closeSheet(); render(); toast('보관한 문의를 보냈어요.'); break;
      }
      case 'late-result': lateResult = true; render(); break;
      case 'settings': settings(); break;
      case 'connection': connection(); break;
      case 'go-story': closeSheet(); navigate(4); break;
      case 'notifications': sheet('신청 날짜를 잊지 않게', `<p>자립수당 마감은 ${dateText(engine.allowance(state.profile, TODAY).deadline)}이에요.</p><p>앱을 열면 마감과 오늘 할 일을 확인할 수 있어요. 브라우저 알림을 거절해도 달력은 계속 쓸 수 있어요.</p>${button('알림 허용', 'allow-notifications', 'primary wide')}<p class="small muted gap-top">이 정적 사이트는 앱이 닫힌 동안 예약 알림을 보내지 않아요. 휴대폰 달력에도 마감을 등록해 주세요.</p>${button('알림 없이 계속', 'close', 'text-button wide')}`); break;
      case 'allow-notifications': {
        let permission = 'denied';
        try { if ('Notification' in window) permission = await Notification.requestPermission(); } catch (_) { /* 권한 거부 시 달력 사용 유지 */ }
        state.reminders = permission === 'granted'; save(); closeSheet(); toast(state.reminders ? '브라우저 알림 권한을 허용했어요. 마감은 앱에서도 확인해 주세요.' : '알림 없이도 괜찮아요. 앱에서 마감 날짜를 확인해 주세요.'); break;
      }
      case 'calculation': sheet('이렇게 계산했어요', '<h3>AI로 정리한 것</h3><p>공공기관 자료 7개와 보도기사 2개에서 조건을 뽑았어요. 청년이 쓴 상황을 항목으로 정리하고, 상담사에게 물어볼 문장을 썼어요. 처리 결과는 미리 계산해 실었어요.</p><p>시험: 135칸 중 131칸 일치. 틀린 4칸은 원문에 없는 값을 채운 경우(지급 단위·횟수·기간)였고, 사람이 확인해 비웠어요.</p><p>말로 쓴 상황 정리는 미리 AI로 처리한 두 사례만 보여 줘요. 다른 글은 직접 입력으로 안내해요.</p><p>숫자마다 근거 문장과 출처를 붙이고, 확인 정도(확인됨·한 곳 확인·확인 필요)를 함께 표시해요.</p><h3>규칙으로 계산한 것</h3><p>지원 대상 조건과 신청 마감, 놓치는 금액은 코드로 계산해요. 보호종료일을 첫날로 세어 60일째가 소급 신청 마감이에요. 사전 신청은 보호종료 30일 전부터 가능해요.</p><h3>확인하지 못한 것</h3><p>조기 보호종료의 소급 시작일, 지역별 미확인 금액과 교통비의 지급 횟수는 계산에 넣지 않았어요.</p><p class="small muted">10명의 가상 청년을 손으로 계산한 정답 51칸과 대조했어요.</p>'); break;
      case 'about': sheet('먼저살기 달력은', '<p>보호가 끝나는 날부터 놓치는 돈이 없게, 지원과 신청 마감을 함께 챙겨요.</p><p>조건표 최종 확인 2026년 10월 23일</p><p>공공기관 자료 7개와 보도기사 2개에서 AI가 조건을 뽑고 사람이 원문과 대조했어요.</p><p>시험: 135칸 중 131칸 일치. 틀린 4칸은 원문에 없는 값을 채운 경우(지급 단위·횟수·기간)였고, 사람이 확인해 비웠어요.</p><p>말로 쓴 상황 정리는 미리 AI로 처리한 두 사례만 보여 줘요. 다른 글은 직접 입력으로 안내해요.</p><p class="small muted">정확한 지급 여부는 주민센터가 정해요. 2026년 전세임대 조건과 서울 정착금은 공고를 다시 확인해야 해요.</p><p class="small muted">글꼴: Pretendard 1.3.9, SIL Open Font License 1.1.<br>아이콘: 이 웹을 위해 작성한 인라인 SVG, MIT.</p>' + licenseNotices()); break;
      case 'privacy': sheet('개인정보와 기기 보관', '<p>가입과 이름, 전화번호 없이 쓸 수 있어요. 입력한 생년월일과 보호 시작일, 보호종료일, 지역, 상담 문장, 신청 기록은 이 브라우저에만 저장해요.</p><p>마지막으로 저장한 날부터 30일이 지난 뒤 다시 열면 기록을 지워요. 설정에서 즉시 삭제할 수도 있어요. 브라우저를 닫았을 때 자동 삭제를 실행하지는 못해요.</p><p>외부 원문 링크를 누르면 해당 사이트가 열려요. 문의와 답변은 이 브라우저 안에서만 주고받아요.</p>'); break;
      case 'clear-confirm': sheet('이 기기의 기록을 지울까요?', '<p>입력한 정보와 신청 기록, 상담 문의와 답변을 지워요. 필요하면 먼저 내보내 주세요.</p>' + button('기록 내보내기', 'export-records', 'secondary wide') + button('기록 지우기', 'clear', 'danger-button wide gap-top')); break;
      case 'clear':
        try { localStorage.removeItem(KEY); } catch (_) { /* 이미 사용할 수 없는 저장 공간 */ }
        state = structuredClone(initial); state.messages = []; closeSheet(); render(); toast('저장한 기록을 지웠어요. 처음의 가상 청년 정보로 돌아왔어요.'); break;
      case 'export-records': exportRecords(); break;
      case 'counselor': goCounselor(); break;
      case 'youth': navigate(5); break;
      case 'reset-search': query = ''; filter = 'all'; renderCounselor(); break;
      case 'export-counselor': download('먼저살기-상담기록.csv', [['이름 (가명)', '지역', '보호종료일', '자립수당 상태', '마감까지 남은 날', '놓칠 금액', '확인 필요 수', '자료 구분'], ...peopleRows().map(r => [r.name, r.p.region, dateText(r.p.end_date), r.status, r.applied ? '신청 기록 완료' : r.days === null ? '확인 필요' : `${r.days}일`, r.applied ? '신청 결과 확인' : money(r.lost), `${r.checks}개`, '시연용 모의 데이터'])]); break;
      case 'person': {
        const r = peopleRows().find(v => v.i === Number(target.dataset.person));
        sheet(`${r.name}의 지원 조건`, facts([['지역', esc(r.p.region)], ['보호종료일', dateText(r.p.end_date)], ['자립수당', esc(r.status)], ['신청 가능일', dateText(r.a.open)], ['소급 마감', dateText(r.a.deadline)]]) + `<p>${esc(r.a.check || r.a.why || '받을 수 있는 조건이며, 주민센터에서 최종 확인해야 해요.')}</p>`); break;
      }
    }
  }
  document.addEventListener('click', e => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    e.preventDefault(); action(target.dataset.action, target);
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'message-input') { state.draft = e.target.value; save(); }
    if (e.target.id === 'story-input') { state.storyDraft = e.target.value; save(); storyResult = false; $('#story-result').innerHTML = ''; }
    if (e.target.id === 'people-search') {
      query = e.target.value; const pos = e.target.selectionStart; renderCounselor(); $('#people-search').focus(); $('#people-search').setSelectionRange(pos, pos);
    }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'apply-date') changeApply(e.target.value);
    if (e.target.id === 'delay-toggle') { delay = e.target.checked; $('#housing-result').innerHTML = housingResult(); $('#delay-toggle').focus(); }
    if (e.target.id === 'offline-toggle') { state.offline = e.target.checked; save(); renderConnection(); connection(); }
    if (e.target.id === 'people-filter') { filter = e.target.value; renderCounselor(); }
    if (e.target.id === 'unknown-date') {
      const field = $('#profile-form [name=end_date]'); field.disabled = e.target.checked;
      $('#profile-error').textContent = e.target.checked ? '날짜를 확인한 뒤 달력을 만들 수 있어요. 시설 담당자에게 보호종료일을 물어봐 주세요.' : '';
    }
  });
  document.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'profile-form') {
      const f = e.target, values = new FormData(f);
      if ($('#unknown-date').checked) { $('#profile-error').textContent = '정확한 보호종료일을 먼저 확인해 주세요. 아직 달력을 만들지 않았어요.'; return; }
      const end = values.get('end_date'), birth = values.get('birth'), care = values.get('care_start');
      if (birth >= end || care > end.slice(0, 7) || care < birth.slice(0, 7)) { $('#profile-error').textContent = '태어난 날, 보호 시작일, 보호종료일의 순서를 확인해 주세요.'; return; }
      state.profile = { ...state.profile, end_date: end, birth, care_start: care, region: values.get('region'), end_type: values.get('end_type'), returned_home: values.get('returned_home') === 'yes', still_in_care: values.has('still_in_care'), other_law_allowance: values.has('other_law_allowance'), apply_date: E.shift(end, 59) };
      state.consent = true; state.applied = false; state.region = state.profile.region;
      const saved = save(); closeSheet(); navigate(1); render(); toast(saved ? '내 달력을 이 기기에 저장했어요.' : '달력을 열었지만 기기에 저장하지 못했어요. 기록을 내보내 주세요.');
    }
    if (e.target.matches('.reply-form')) {
      const text = new FormData(e.target).get('reply').trim();
      if (!text) { toast('답변 내용을 적어 주세요.'); return; }
      const m = state.messages.find(v => v.id === e.target.dataset.message);
      if (!m) { toast('문의가 없어요. 화면을 다시 열어 주세요.'); return; }
      m.reply = text;
      if (save()) { renderCounselor(); toast('답변을 남겼어요. 청년 화면에서도 볼 수 있어요.'); } else toast('답변을 저장하지 못했어요.');
    }
  });
  function route() {
    if ($('#sheet').open) closeSheet();
    viewCounselor = location.hash === '#counselor' || (!location.hash && defaultCounselor);
    mountView();
    const n = /^#scene-([1-6])$/.exec(location.hash);
    scene = n ? Number(n[1]) : 1; render();
    if ($('.phone')) $('.phone').scrollTop = 0;
    window.scrollTo(0, 0);
    $('#screen').focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('storage', e => { if (e.key === KEY) { state = { ...structuredClone(initial), ...read() }; render(); } });
  window.addEventListener('online', () => { renderConnection(); toast('다시 연결됐어요. 보관한 문의를 보낼 수 있어요.'); });
  window.addEventListener('offline', () => { renderConnection(); toast('연결이 끊겼어요. 저장한 달력은 계속 볼 수 있어요.'); });
  $('#sheet').addEventListener('click', e => { if (e.target === $('#sheet')) { const r = $('#sheet').getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeSheet(); } });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* 파일 실행과 기기 기록은 계속 사용할 수 있음 */ });
  }
  if ('ResizeObserver' in window && $('#tour')) {
    new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty('--tour-height', `${entry.target.getBoundingClientRect().height}px`);
    }).observe($('#tour'));
  }
  route();
})();
