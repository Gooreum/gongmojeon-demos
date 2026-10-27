(function () {
  'use strict';
  const D = globalThis.CART_DATA, C = globalThis.CART_CONFIG;
  const $ = s => document.querySelector(s), main = $('#main'), sheet = $('#sheet');
  const memory = {};
  const read = (key, fallback) => { if (Object.hasOwn(memory,key)) return memory[key]; try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); delete memory[key]; return true; } catch { memory[key] = value; return false; } };
  const params = new URLSearchParams(location.search);
  const requestedLanguage = params.get('lang');
  let lang = ['en', 'ko'].includes(requestedLanguage) ? requestedLanguage : C.DEFAULT_LANGUAGE, scene = 1, route = '', screen = 'cart';
  let cart = [], original = [], results = [], choices = {}, person = 'mina', scores = {}, tone = '', fileId = '';
  let comparison = {}, shadeImages = {}, shadeCache = {}, shadeIds = [], selectedShade = '', shadeTarget = '', currentRecord = '';
  let errorCode = '', badPhoto = '', stage = 0, revision = 0, mode = 'recorded', stream, photoBlob, photoURL = '', timer, lastFocus;
  let historyQuery = '', historyFilter = 'all', page = 1, catalogQuery = '', catalogType = 'all';
  let consent = false, undoCart = [], applied = false;
  const KEY = 'cart-check-v5-records', DRAFT = 'cart-check-v5-draft';
  const t = (ko, en) => lang === 'ko' ? ko : en;
  const tx = v => v && typeof v === 'object' ? v[lang] : v || '';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const product = id => D.products.find(p => p.id === id);
  const shopper = id => D.shoppers.find(p => p.id === (id || person)) || D.shoppers[0];
  const num = n => !Number.isFinite(n) ? '—' : new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {minimumFractionDigits:1,maximumFractionDigits:1}).format(n);
  const integer = n => new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US').format(n);
  const money = n => new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {style:'currency',currency:'USD'}).format(n);
  const total = items => items.reduce((sum, p) => sum + p.price, 0);
  const names = () => ({keep:t('유지','Keep'),swap:t('바꾸기','Swap'),remove:t('빼기','Remove'),borderline:t('판단 보류','Review')});
  const metricName = key => ({oiliness:t('유분 조절','Oil control'),redness:t('붉은기','Redness'),moisture:t('수분','Moisture'),acne:t('트러블','Blemishes')})[key];
  const metricState = (key, values) => ({balanced:t('기준 이상','Above threshold'),highOil:t('유분 많음','High oil'),dry:t('건조함','Dry'),highRedness:t('붉은기 높음','High redness'),borderline:t('판단 보류','Review'),unavailable:t('측정값 없음','Unavailable')})[CartRules.metricState(key, values)];
  const paths = {
    leaf:'M20 4c-8-1-15 2-15 9a6 6 0 0 0 6 6c7 0 10-7 9-15ZM4 21 15 10',
    bag:'M5 7h14l1 14H4L5 7ZM9 8V6a3 3 0 0 1 6 0v2',
    check:'m5 12 4 4L19 6',swap:'M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4',
    close:'m6 6 12 12M6 18 18 6',arrow:'M5 12h14m-6-6 6 6-6 6',back:'M19 12H5m6-6-6 6 6 6',
    shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6',
    spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
    camera:'M8 5 6 8H3v12h18V8h-3l-2-3H8ZM16 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
    moon:'M20 14A9 9 0 0 1 10 4a9 9 0 1 0 10 10Z',
    clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2',
    help:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M9 8a3 3 0 0 1 6 1c0 2-3 2-3 4m0 3h.01',
    chart:'M4 3v18h17M8 16v-4m5 4V8m5 8V5',
    download:'M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5',alert:'m12 3 10 18H2L12 3Zm0 5v6m0 3h.01',
    wifi:'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0m-3 4h.01'
  };
  const icon = name => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (paths[name] || paths.leaf) + '"/></svg>';
  const btn = (action, label, cls = 'primary', extra = '') => '<button type="button" class="' + cls + '" data-action="' + action + '" ' + extra + '>' + label + '</button>';
  const badge = status => '<span class="badge ' + status + '">' + icon(status === 'keep' ? 'check' : status === 'swap' ? 'swap' : status === 'remove' ? 'close' : 'alert') + names()[status] + '</span>';
  const back = () => btn('back', icon('back') + t('뒤로','Back'), 'back');
  const note = () => '<p class="source-note" data-response-note>' + esc(mode === 'recorded' ? (lang === 'ko' ? C.RESPONSE_NOTE_KO : C.RESPONSE_NOTE) : t('이 사진으로 받은 실시간 분석 결과입니다.','Results from a live analysis of your photo.')) + '</p>';
  const calibration = () => '<p class="calibration">' + t('세 번의 실제 분석 결과로 맞춘 기준이며, 임상 검증을 거치지 않았어요. 기준값 앞뒤 5점은 판단을 보류해요.','Calibrated on three recorded API calls, not clinically validated. Readings within ±5 of each threshold are held for review.') + '</p>';
  const scoreNote = () => '<p class="caption">' + t('원점수 1~100점. 높을수록 좋은 상태예요.','Raw score 1–100; higher means healthier.') + '</p>';
  function art(p) {
    const jar = p.type === 'moisturizer';
    return '<div class="product-art ' + p.type + '" role="img" aria-label="' + esc(tx(p.name)) + '"><svg viewBox="0 0 48 72" aria-hidden="true">' +
      (jar ? '<rect class="body" x="5" y="30" width="38" height="28" rx="7"/><rect class="cap" x="5" y="25" width="38" height="9" rx="3"/>' : '<rect class="body" x="12" y="20" width="24" height="45" rx="5"/><rect class="cap" x="14" y="7" width="20" height="16" rx="3"/>') +
      '<rect class="label" x="14" y="37" width="20" height="17"/><text x="24" y="49" text-anchor="middle">' + p.code + '</text></svg></div>';
  }
  const meta = p => p.shade ? tx(p.shade) : (p.acid ? p.acid + '% ' + t('글리콜산','glycolic acid') + ' / ' : '') + p.size;
  function row(p, change = '') { return '<article class="product-row">' + art(p) + '<div><h3>' + esc(tx(p.name)) + '</h3><p class="meta">' + esc(meta(p)) + '</p>' + (change ? '<span class="changed">' + esc(change) + '</span>' : '') + '</div><span class="price">' + money(p.price) + '</span></article>'; }
  const steps = n => '<div class="steps"><' + (n === 1 ? 'b' : 'span') + '>01 ' + t('장바구니','Cart') + '</' + (n === 1 ? 'b' : 'span') + '><i></i><' + (n === 2 ? 'b' : 'span') + '>02 ' + t('피부 점검','Skin check') + '</' + (n === 2 ? 'b' : 'span') + '><i></i><' + (n === 3 ? 'b' : 'span') + '>03 ' + t('주문','Checkout') + '</' + (n === 3 ? 'b' : 'span') + '></div>';
  function sceneCopy() {
    return [
      [t('함께 쓰기 전에,\n한 번 더.','A better cart.\nBefore you buy.'),t('레티놀 세럼과 각질 토너를 담았어요. 같은 날 발라도 괜찮을까요?','Retinol and an acid toner are in the cart. Should they go on together?'),t('점검하고 미나를 선택하세요','Check the cart and choose Mina'),t('두 제품의 주의 표시와 근거를 읽고, 토너를 뺀 장바구니를 확인하세요.','Read the pairing advice, then remove the acid toner from the cart.')],
      [t('같은 제품이어도,\n선택은 다르게.','Same cart.\nDifferent skin.'),t('미나와 줄스가 같은 크림과 토너를 골랐어요. 줄스는 유분이 더 많고 수분이 더 적게 측정됐어요.','Mina and Jules chose the same cream and toner. Jules reads oilier and drier.'),t('미나를 점검한 뒤 줄스와 비교하세요','Check Mina, then compare with Jules'),t('미나는 두 제품을 유지하고, 줄스는 크림과 토너를 모두 바꿉니다.','Mina keeps both. Jules swaps both the cream and toner.')],
      [t('붉은 날에는,\n조금 더 순하게.','A gentler choice\nfor today.'),t('붉은기 원점수 56.7점인 아리가 향료가 든 각질 토너를 담았어요.','Ari has a redness raw score of 56.7 and a fragranced acid toner in her cart.'),t('아리를 선택하고 토너를 바꿔 보세요','Choose Ari and swap the toner'),t('붉은기 기준 65점과 대안 성분을 확인한 뒤 수분 토너를 적용하세요.','Review the threshold of 65 and choose the hydrating toner.')],
      [t('화면 속 색보다,\n내 얼굴에서.','Your shade.\nOn your face.'),t('담은 아이보리 색은 미나 피부와 색상 거리가 14.7이에요. 실제 착용 사진으로 비교해요.','Ivory has a color distance of 14.7 from Mina’s skin. Compare real try-on outputs.'),t('미나를 점검하고 색상을 비교하세요','Check Mina and compare shades'),t('샌드 3.2, 허니 4.2를 비교하고 선택한 색을 장바구니에 반영하세요.','Compare Sand at 3.2 and Honey at 4.2, then apply your choice.')],
      [t('사진부터\n확인할게요.','A good check\nstarts here.'),t('어둡거나 얼굴이 작게 찍히면 피부를 분석하기 어려워요.','A dark or distant face cannot be analyzed reliably.'),t('점검을 누르고 사진을 골라 보세요','Start the check and choose a photo'),t('사진을 보내기 전에 원인을 안내합니다. 분석 이용량은 쓰지 않아요.','Get a specific retake tip before upload, without spending API units.')],
      [t('지금 연결이\n어려워도.','Keep going,\neven now.'),t('실시간 점검 한도를 다 썼거나 분석 시간이 길어질 수 있어요.','Live checks may reach their allowance or take too long.'),t('한도 안내를 읽고 계속하세요','Read the limit notice and continue'),t('가상 고객의 실제 분석 기록으로 점검부터 주문까지 마칠 수 있어요.','Continue the full shopping flow with a real recorded shopper result.')],
      [t('고른 제품으로,\n나만의 순서.','Your cart.\nYour routine.'),t('점검한 제품을 고르고 아침과 저녁에 바를 순서를 정리해요.','Apply the changes and take your morning and evening routine with you.'),t('변경 적용 후 사용 순서를 저장하고 주문하세요','Apply changes, save the routine and check out'),t('바뀐 금액과 사용 순서를 확인하세요. 주문에는 내추럴 샌드 230이 담겨요.','See the new total and routine. The order includes Natural Sand 230.')]
    ][scene - 1];
  }
  function shell() {
    const merchant = route === 'merchant';
    const sc = merchant ? [t('더 나은 상품을\n고르도록.','Understand\nthe choices.'),t('상품 담당자는 이 기기의 점검 기록으로 자주 바뀌는 제품과 성분 조합을 확인해요.','The store merchandiser reviews decisions recorded in this browser.'),t('점검 건수와 자주 바뀐 제품을 확인하세요','Review checks and frequently changed products'),t('구매자가 점검하면 숫자가 바뀝니다. 사진과 피부 점수는 보관하지 않아요.','Shopper checks update these totals. No photos or skin scores are stored.')] : sceneCopy();
    document.documentElement.lang = lang;
    document.title = t('카트 체크 | 루멘 앤 리프','Cart Check | Lumen & Leaf');
    $('#tour').hidden = route === 'full';
    $('#tour').innerHTML = '<b>' + t('시연','Demo') + ' · ' + (merchant ? t('운영자','Merchant') : t('장면 ','Scene ') + scene + '/7') + '</b><span class="instruction">' + sc[2] + '</span>' + btn('next',t('다음','Next') + icon('arrow'),'');
    $('#appbar').innerHTML = '<div><div class="brand">' + icon('leaf') + t('루멘 앤 리프','lumen & leaf') + '</div><p class="brand-sub">' + t('나를 위한 스킨케어','THOUGHTFUL SKINCARE') + '</p></div><div class="tools">' + btn('language',lang === 'ko' ? 'EN' : '한국어','','aria-label="' + t('영어로 보기','Switch to Korean') + '"') + btn('help',icon('help'),'','aria-label="' + t('도움말','Help') + '"') + '</div>';
    $('#tabs').innerHTML = [['cart','bag',t('장바구니','Cart')],['history','clock',t('기록','History')],['merchant','chart',t('운영','Merchant')]].map(([a,i,l]) => btn(a,icon(i) + l,'',(screen === a || (a === 'cart' && !['history','merchant'].includes(screen))) ? 'aria-current="page"' : '')).join('');
    $('#disclosure').textContent = t('시연용 모의 데이터','Illustrative store and shoppers for demonstration');
    $('#scene-panel').innerHTML = '<span class="eyebrow">' + t('카트 체크 / ','CART CHECK / ') + (merchant ? t('운영','MERCHANT') : String(scene).padStart(2,'0')) + '</span><h2>' + sc[0].replace('\n','<br>') + '</h2><p class="story">' + sc[1] + '</p><div class="guide"><b>' + t('지금 할 일','TRY THIS') + '</b><p>' + sc[2] + '</p></div><div class="guide"><b>' + t('이렇게 나오면 성공','WHAT TO LOOK FOR') + '</b><p>' + sc[3] + '</p></div><nav class="scene-links" aria-label="' + t('장면 선택','Scenes') + '">' + Array.from({length:7},(_,i) => '<a href="#scene-' + (i+1) + '" class="' + (!merchant && i+1 === scene ? 'active' : '') + '" aria-label="' + t('장면 ','Scene ') + (i+1) + '">' + (i+1) + '</a>').join('') + '</nav><details class="api-list"><summary>' + t('사용한 분석 기술','YouCam APIs used') + '</summary>' + [['YouCam File API','file'],['AI Skin Analysis','task/skin-analysis'],['AI Facial Color Tones','task/skin-tone-analysis'],['AI Makeup VTO','task/makeup-vto']].map(([name,path]) => '<p>' + name + '<code>POST /s2s/v2.0/' + path + '</code></p>').join('') + '<p>' + t('가상 고객은 저장된 실제 응답을 사용합니다. 새 분석 요청은 보내지 않아요.','Sample shoppers replay local real responses without new API calls.') + '</p></details><div class="panel-footer"><a href="#full">' + t('자유롭게 사용','Explore freely') + '</a><a href="#merchant">' + t('운영자 화면','Merchant view') + '</a></div>';
    $('#connection').hidden = navigator.onLine;
    $('#connection').textContent = t('인터넷이 끊겼어요. 선택은 이 기기에 저장돼요.','You’re offline. Your choices are saved on this device.');
  }
  function cartScreen() {
    if (!cart.length) return steps(1) + '<div class="empty">' + icon('bag') + '<h1>' + t('아직 담은 제품이 없어요','Your cart is empty') + '</h1><p>' + t('스킨케어 제품을 담고 점검해 보세요.','Add some skincare to start your check.') + '</p>' + btn('catalog',t('제품 고르기','Browse products')) + (undoCart.length ? btn('undo-empty',t('되돌리기','Undo'),'text-button wide') : '') + '</div>';
    return steps(1) + '<div class="heading"><h1>' + t('장바구니','Your cart') + '</h1><span class="count">' + integer(cart.length) + t('개',' items') + '</span></div><div class="hero"><span class="eyebrow">' + t('결제 전 피부 점검','CART CHECK') + '</span><span class="hero-mark">' + icon('spark') + '</span><h2>' + t('담은 제품,<br>내 피부에도 맞을까요?','Good finds.<br>Right for your skin?') + '</h2><p>' + t('사진 한 장으로 성분 조합과<br>파운데이션 색을 확인해요.','Check ingredient pairings and your foundation shade with one selfie.') + '</p>' + btn('start',t('장바구니 점검','Check my cart') + icon('arrow')) + '</div><div class="trust">' + icon('shield') + t('가입 없이 시작해요. 사진은 앱에 저장하지 않아요.','No sign-up. We never store your photo.') + '</div><div class="product-list">' + cart.map(p => row(p)).join('') + '</div><div class="total"><span>' + t('상품 합계','Subtotal') + '</span><strong>' + money(total(cart)) + '</strong></div><div class="split between">' + btn('empty-cart',t('비우기','Clear cart'),'text-button') + btn('catalog',t('제품 고르기','Browse products'),'text-button') + '</div><p class="caption">' + t('가격은 미국 달러 기준이에요.','Prices are in US dollars.') + '</p>';
  }
  function consentScreen() {
    return steps(2) + back() + '<span class="eyebrow">' + t('사진 한 장으로 시작','ONE SELFIE TO START') + '</span><h1>' + t('누구의 피부를<br>확인할까요?','Whose skin are<br>we checking?') + '</h1><p class="lead">' + t('가상 고객의 실제 분석 결과부터 살펴보세요.','Start with a shopper’s real recorded analysis.') + '</p><div class="shoppers">' + D.shoppers.map(p => '<button class="shopper" data-action="shopper" data-id="' + p.id + '"><img src="img/shoppers-input/' + p.id + '.jpg" width="56" height="64" alt="' + esc(tx(p.name)) + ' ' + t('가상 인물','fictional shopper') + '"><span><b>' + esc(tx(p.name)) + '</b><small>' + esc(tx(p.trait)) + '</small></span>' + icon('arrow') + '</button>').join('') + '</div><details><summary>' + t('내 사진으로 점검하기','Use my own selfie') + '</summary><div class="box privacy"><h3>' + t('사진을 보내기 전에','Before sending your photo') + '</h3><p>' + t('사진은 YouCam 서버에서 처리해요. 업로드한 사진과 생성된 이미지는 30일 뒤 삭제돼요. 이 앱은 사진과 피부 점수를 보관하지 않아요. 제품 선택 기록만 이 기기에 30일 동안 보관해요.','YouCam processes your photo; uploaded and generated images are removed after 30 days. This app stores no photos or skin scores. Product decisions stay on this device for 30 days.') + '</p></div><label class="consent"><input id="consent" type="checkbox" ' + (consent ? 'checked' : '') + '><span>' + t('사진 처리 방식에 동의해요','I agree to this photo processing') + '</span></label><div class="split">' + btn('camera',icon('camera') + t('촬영','Take photo'),'secondary') + btn('upload',t('사진 선택','Choose photo'),'secondary') + '</div><p class="caption">' + t('정면에서 얼굴이 사진 너비의 60%를 넘게 찍어 주세요.','Face forward, with your face covering more than 60% of the image width.') + '</p></details><p class="caption">' + t('질병을 진단하는 서비스가 아닙니다.','Not a medical diagnosis.') + '</p>';
  }
  function loadingScreen() {
    return steps(2) + '<h1>' + t('피부와 제품을<br>함께 확인해요','Getting to know<br>your routine.') + '</h1><div class="loading-portrait"><img src="' + esc(photoURL || 'img/shoppers-input/' + person + '.jpg') + '" alt="' + t('분석 중인 사진','Photo being analyzed') + '"></div><ol class="loading-list">' + [t('사진 준비','Preparing your photo'),t('피부와 색상 확인','Reading skin and tone'),t('성분 조합 점검','Checking ingredient pairings')].map((s,i) => '<li class="' + (i === stage ? 'active' : '') + '">' + icon(i < stage ? 'check' : i === stage ? 'spark' : 'clock') + s + '</li>').join('') + '</ol><div class="skeleton" aria-hidden="true"></div><p role="status" class="caption">' + t('잠시만 기다려 주세요.','Just a moment.') + '</p>' + btn('cancel',t('취소','Cancel'),'text-button wide');
  }
  function reason(r, values = scores) {
    if (r.conflict && r.id === 'retinol' && r.status === 'keep') return t('각질 토너와 같은 날 겹쳐 쓰지 말고 저녁에 번갈아 사용하세요.','Use on alternate evenings; avoid layering with the acid toner.');
    return ({
      compatible:t('이 장바구니에서 추가 주의 사항을 찾지 못했어요.','No additional concerns found in this cart.'),
      conflict:t('레티놀과 함께 쓰면 자극이 생길 수 있어 각질 토너를 빼도록 제안해요.','To reduce potential irritation with retinol, we suggest removing the acid toner.'),
      redness:t('붉은기 ' + num(values.redness) + '점. 향료와 산 성분이 없는 제품을 권해요.','Redness ' + num(values.redness) + '. Consider an option without fragrance or exfoliating acids.'),
      oiliness:t('유분 조절 ' + num(values.oiliness) + '점. 더 가벼운 젤 크림을 권해요.','Oil control ' + num(values.oiliness) + '. Consider a lighter gel cream.'),
      dry:t('수분 ' + num(values.moisture) + '점. 알코올 함량이 높은 토너를 바꿔 보세요.','Moisture ' + num(values.moisture) + '. Consider replacing the high-alcohol toner.'),
      shade:t('담은 색과 피부색의 차이가 커요. 더 가까운 색을 비교해 보세요.','The cart shade is noticeably different. Compare closer shades.'),
      noShade:t('이 매장에는 가까운 색이 없어요. 색상을 억지로 고르지 않아도 괜찮아요.','No close shade in this store. You do not need to force a match.'),
      borderline:t('기준값 앞뒤 5점 안이라 판단을 보류해요. 사용 경험을 함께 살펴보세요.','This reading is within ±5 of a threshold. Review your own experience before changing.'),
      missing:t('측정값이 부족해 판단을 보류해요.','There is not enough measurement data to decide.'),
      prescription:t('처방약은 담당 의료진에게 함께 써도 되는지 확인하세요.','Ask your prescriber before combining prescription treatments.')
    })[r.reason] || t('사용 경험을 함께 확인해 주세요.','Consider your own experience as well.');
  }
  function metric(key, values = scores) {
    const value = values[key];
    if (!Number.isFinite(value)) return '';
    return '<div class="metric"><label>' + metricName(key) + '<b>' + num(value) + '/100</b></label><meter min="1" max="100" value="' + value + '" aria-label="' + metricName(key) + '"></meter><small>' + metricState(key, values) + (CartRules.thresholds[key] ? t(' / 기준 ',' / threshold ') + CartRules.thresholds[key] : '') + '</small></div>';
  }
  function resultCard(r) {
    const p = product(r.id), choice = choices[r.id], chosen = choice && choice !== r.id;
    return '<article class="result-card" data-product="' + p.id + '"><div class="result-head">' + badge(r.status) + (r.conflict ? '<span class="conflict">' + icon('alert') + t('함께 사용 주의','Pairing caution') + '</span>' : '<span class="meta">' + money(p.price) + '</span>') + '</div><div class="product-row">' + art(p) + '<div><h3>' + esc(tx(p.name)) + '</h3><p class="meta">' + esc(meta(p)) + '</p></div></div><p class="reason">' + reason(r) + '</p>' + (chosen ? '<span class="changed">' + (choice === 'remove' ? t('장바구니에서 뺄 예정이에요','Will be removed') : t('선택: ','Selected: ') + esc(tx(product(choice).shade || product(choice).name))) + '</span>' : '') + '<details><summary>' + t('이유 보기','Why this suggestion?') + '</summary>' + (r.metric ? metric(r.metric) + scoreNote() : '') + '<p>' + (r.rule === 'gentle' ? t('붉은기 점수만으로 질환을 판단하지 않아요. 민감한 피부 관리 지침을 참고한 보수적인 제안이에요.','This score does not diagnose a condition. The suggestion cautiously applies sensitive-skin guidance.') : r.rule === 'retinol-acid' ? t('각 성분은 자극을 줄 수 있어요. 함께 바르는 것을 줄이자는 매장 기준이며 모든 사람에게 금지된 조합은 아니에요.','Both ingredients can irritate. Alternating or removing one is our cautious store policy, not a universal incompatibility.') : reason(r)) + '</p>' + (r.source ? '<a href="' + esc(r.source) + '" target="_blank" rel="noopener noreferrer">' + t('근거 읽기','Read source') + '</a>' : '') + '</details><div class="split">' + (r.status === 'swap' ? btn(p.type === 'foundation' ? 'shade' : 'alternative',p.type === 'foundation' ? t('색상 비교','Compare shades') : t('대안 고르기','Choose alternative'), 'secondary','data-id="' + p.id + '"') : r.reason === 'noShade' ? btn('shade',t('색상 확인','Review shades'),'secondary','data-id="' + p.id + '"') : r.status === 'remove' ? btn('remove',t('빼기','Remove'),'secondary','data-id="' + p.id + '"') : '') + (r.status !== 'keep' || chosen ? btn('keep',t('그대로 두기','Keep original'),'text-button','data-id="' + p.id + '"') : '') + '</div></article>';
  }
  function resultsScreen() {
    return steps(2) + '<div class="person-bar"><img src="' + esc(photoURL || 'img/shoppers-input/' + person + '.jpg') + '" alt="' + t('분석한 사진','Analyzed photo') + '"><div><span class="eyebrow">' + t('피부 점검 완료','CHECK COMPLETE') + '</span><p>' + (mode === 'recorded' ? esc(tx(shopper().name)) + t('의 실제 분석 결과','’s recorded result') : t('내 사진의 분석 결과','Your live results')) + '</p></div>' + btn('another',t('다시 선택','Change'),'text-button') + '</div><h1>' + t('이렇게 골라 보세요','A little edit.<br>A better routine.') + '</h1><div class="summary">' + ['keep','swap','remove','borderline'].filter(s => results.some(r => r.status === s)).map(s => '<span class="badge ' + s + '">' + names()[s] + ' ' + results.filter(r => r.status === s).length + '</span>').join('') + '</div>' + (scene === 2 ? btn('compare',t('같은 제품으로 줄스와 비교','Compare the same cart with Jules'),'secondary wide') : '') + '<div class="results-list">' + results.map(resultCard).join('') + '</div>' + note() + calibration() + '<details><summary>' + t('피부 원점수 모두 보기','All skin readings') + '</summary>' + ['oiliness','redness','moisture','acne'].map(k => metric(k)).join('') + scoreNote() + '</details><div class="sticky">' + btn('apply',t('변경 적용','Apply changes') + icon('arrow')) + '</div>';
  }
  function comparisonScreen() {
    return back() + '<span class="eyebrow">' + t('같은 크림과 토너','SAME CREAM AND TONER') + '</span><h1>' + t('피부가 다르면<br>선택도 달라져요','Same cart.<br>Different choices.') + '</h1><div class="compare-grid">' + ['mina','jules'].map(id => {
      const s = comparison[id];
      return '<article class="compare-card" data-person="' + id + '"><img src="img/shoppers-input/' + id + '.jpg" alt="' + esc(tx(shopper(id).name)) + '"><h2>' + esc(tx(shopper(id).name)) + '</h2>' + metric('oiliness', s.scores) + metric('moisture', s.scores) + s.results.map(r => '<div class="compare-item"><h3>' + esc(tx(product(r.id).name)) + '</h3>' + badge(r.status) + '<p>' + (r.status === 'swap' ? esc(tx(product(r.alternatives[0]).name)) : t('지금 제품을 유지해요','Keep the current product')) + '</p></div>').join('') + '</article>';
    }).join('') + scoreNote() + calibration() + note() + btn('use-jules',t('줄스의 선택 적용','Use Jules’s choices'));
  }
  function shadesScreen() {
    const ranked = D.products.filter(p => p.type === 'foundation').sort((a,b) => CartColor.compare(tone,a.hex).distance - CartColor.compare(tone,b.hex).distance);
    const closest = ranked[0], noClose = CartColor.compare(tone, closest.hex).distance > 5;
    if (noClose) return back() + '<span class="eyebrow">' + t('파운데이션 색상','FOUNDATION SHADE') + '</span><h1>' + t('이 매장에는<br>가까운 색이 없어요','No close shade<br>in this store.') + '</h1><div class="box"><p><span class="tone-chip" style="--tone:' + tone + '"></span>' + t('측정한 피부색 ','Measured skin color ') + esc(tone.toUpperCase()) + '</p><p>' + t('가장 가까운 색도 색상 거리가 ','Even the nearest shade has a distance of ') + num(CartColor.compare(tone,closest.hex).distance) + t('으로, 가까운 색 기준 5를 넘어요.','. The close-shade threshold is 5.') + '</p></div><p>' + t('지금 색을 유지하거나 파운데이션을 뺄 수 있어요.','Keep your current shade or remove the foundation.') + '</p>' + btn('remove-foundation',t('파운데이션 빼기','Remove foundation')) + btn('back',t('그대로 두기','Keep original'),'secondary wide') + note();
    return back() + '<span class="eyebrow">' + t('내 얼굴에서 비교','REAL VIRTUAL TRY-ON') + '</span><h1>' + t('조금 더 가까운 색','Find your closer shade.') + '</h1><p><span class="tone-chip" style="--tone:' + tone + '"></span>' + t('측정한 피부색 ','Measured skin color ') + esc(tone.toUpperCase()) + '</p><div class="shade-grid">' + shadeIds.map(id => {
      const p = product(id), d = CartColor.compare(tone,p.hex);
      return '<button class="shade-option" data-action="select-shade" data-id="' + id + '" aria-pressed="' + (selectedShade === id) + '"><img src="' + esc(shadeImages[id]) + '" alt="' + esc(tx(p.shade)) + ' ' + t('실제 가상 착용 결과','real YouCam try-on output') + '"><b><span class="tone-chip" style="--tone:' + p.hex + '"></span>' + esc(tx(p.shade)) + '</b><small>ΔE ' + num(d.distance) + '</small><small>' + (id === shadeTarget ? t('담은 색','In cart') : d.distance <= 5 ? t('가까운 색','Closer shade') : t('차이가 큰 색','Different')) + '</small></button>';
    }).join('') + '</div><div class="comparison-image" id="shade-comparison"><img src="' + esc(shadeImages[selectedShade]) + '" alt="' + t('선택한 색 착용 결과','Selected shade try-on') + '"><img class="overlay" src="' + esc(shadeImages[shadeTarget]) + '" alt="' + t('장바구니 색 착용 결과','Original cart shade try-on') + '"><div class="image-labels"><span>' + t('담은 색','Cart shade') + '</span><span>' + esc(tx(product(selectedShade).shade)) + '</span></div></div><label class="range-label" for="shade-slider">' + t('손잡이를 움직여 두 색을 비교하세요','Drag to compare the two shades') + '</label><input id="shade-slider" type="range" min="0" max="100" value="50"><p class="caption shade-difference">' + t('색상 거리가 작을수록 가까운 색이에요. 5 이하는 가까운 색으로 분류해요. 조명과 화면에 따라 다르게 보일 수 있어요.','Smaller ΔE means closer color; up to 5 is classified as close. Lighting and screens affect appearance.') + '</p>' + note() + '<div class="sticky">' + btn('use-shade',t('이 색으로 바꾸기','Use this shade')) + '</div>';
  }
  function qualityScreen() {
    return back() + '<span class="eyebrow">' + t('사진 보내기 전','BEFORE UPLOAD') + '</span><h1>' + t('얼굴이 잘 보이나요?','A clear face.<br>A better check.') + '</h1><p class="lead">' + t('사진 상태를 확인하고 다시 찍는 방법을 알려 드려요.','Check the photo first and get a specific retake tip.') + '</p><div class="quality-grid">' + [['dark',t('어두운 사진','Too dark')],['small',t('작은 얼굴','Too distant')],['side',t('옆얼굴','Side profile')]].map(([id,label]) => '<button data-action="bad-photo" data-id="' + id + '"><img src="img/precheck/' + id + '.png" alt="' + label + '">' + label + '</button>').join('') + '</div><div class="box"><h3>' + t('이렇게 찍어 주세요','For a usable selfie') + '</h3><p>' + t('창문을 바라보고 정면에서 찍어 주세요. 얼굴이 사진 너비의 60%를 넘고, 짧은 변이 480픽셀 이상이어야 해요.','Face a window and look straight ahead. Your face must cover more than 60% of the width. The short side must be at least 480 pixels.') + '</p></div>' + btn('noface',t('분석 중 얼굴을 못 찾은 경우','When analysis cannot find a face'),'secondary wide') + btn('another',t('다시 찍기','Retake'),'text-button wide');
  }
  function qualityErrorScreen() {
    const message = CartPrecheck.messages[badPhoto] || CartPrecheck.messages.noface;
    return back() + '<div class="error-icon">' + icon('camera') + '</div><h1>' + t('사진을 다시 찍어 주세요','Let’s retake<br>that photo.') + '</h1>' + (['dark','small','side'].includes(badPhoto) ? '<img class="error-photo" src="img/precheck/' + badPhoto + '.png" alt="' + esc(message[lang === 'ko' ? 0 : 1]) + '">' : '') + '<p role="alert">' + esc(message[lang === 'ko' ? 0 : 1]) + '</p><div class="box privacy"><h3>' + (badPhoto === 'noface' ? t('얼굴을 찾지 못했어요','Face not found') : t('분석 이용량을 쓰지 않았어요','No units used')) + '</h3><p>' + (badPhoto === 'noface' ? t('분석 서버에서 얼굴을 인식하지 못했어요. 얼굴이 사진 너비의 60%를 넘게 찍어 주세요.','The analysis service could not recognize a face. Retake with the face over 60% of the width.') : t('업로드 전에 이 기기에서 사진을 확인했어요.','The photo was checked on this device before upload.')) + '</p></div>' + btn('retake',t('다시 찍기','Retake')) + btn('fallback',t('가상 고객으로 계속','Continue with a shopper'),'secondary wide');
  }
  function unavailableScreen() {
    const error = YouCam.errorMessages[errorCode] || YouCam.errorMessages.network;
    return back() + '<div class="error-icon">' + icon('clock') + '</div><h1>' + t('잠시 연결이<br>어려워요','Let’s keep<br>your check going.') + '</h1><p role="alert">' + esc(error[lang === 'ko' ? 0 : 1]) + '</p><div class="box"><h3>' + t('기다리지 않고 계속할 수 있어요','You can continue right now') + '</h3><p>' + t('가상 고객의 실제 분석 기록은 언제든 사용할 수 있어요. 장바구니는 그대로예요.','Real recorded shopper results are always available. Your cart stays as it is.') + '</p></div>' + btn('fallback',t('가상 고객으로 계속','Continue with a shopper')) + (errorCode === 'offline' || errorCode === 'network' ? btn('retry',t('다시 보내기','Retry'),'secondary wide') : '') + (scene === 6 ? '<details><summary>' + t('다른 연결 상황 확인','Other connection cases') + '</summary><div class="stack">' + btn('timeout',t('60초 시간 초과','60-second timeout'),'secondary wide') + btn('total-cap',t('심사 기간 한도 초과','Judging-period limit'),'secondary wide') + btn('offline',t('연결 끊김','Connection lost'),'secondary wide') + '</div></details>' : '');
  }
  function routineHTML(items) {
    const r = CartRoutine.build(items);
    const block = (title, list, symbol) => '<section class="routine-card"><h3>' + icon(symbol) + title + '</h3>' + (list.length ? '<ol>' + list.map(p => '<li>' + esc(tx(p.name)) + '</li>').join('') + '</ol>' : '<p>' + t('담은 제품이 없어요','No products in this routine') + '</p>') + '</section>';
    return '<div id="routine"><div class="routine-grid">' + block(t('아침','Morning'),r.am,'sun') + block(t('저녁','Evening'),r.pm,'moon') + '</div>' + (r.alternate.length ? '<p class="caption">' + t('각질 토너는 레티놀을 쉬는 날 저녁에 사용하세요.','Use the acid toner on evenings without retinol.') + '</p>' : '') + (r.needsSPF ? '<p class="caption">' + t('낮에는 자외선 차단제를 사용하세요. 별도로 담지는 않았어요.','Use sunscreen during the day. None has been added automatically.') + ' <a href="' + D.rules.find(x => x.id === 'sun').source + '" target="_blank" rel="noopener noreferrer">' + t('근거 읽기','Read source') + '</a></p>' : '') + '</div>';
  }
  function updatedScreen() {
    return steps(3) + '<span class="eyebrow">' + t('내 선택을 반영했어요','YOUR CHOICES, APPLIED') + '</span><h1>' + t('이제, 나에게 맞게','Your cart, considered.') + '</h1><div class="product-list">' + cart.map(p => row(p,original.some(x => x.id === p.id) ? '' : t('바꾼 제품','Changed item'))).join('') + original.filter(p => choices[p.id] === 'remove').map(p => '<p class="caption">' + esc(tx(p.name)) + t('을 뺐어요',' removed') + '</p>').join('') + '</div><div class="total"><span>' + t('상품 합계','New subtotal') + '</span><strong>' + money(total(cart)) + '</strong></div><p class="caption">' + t('변경 전 ','Previously ') + money(total(original)) + ' / ' + (total(original) >= total(cart) ? t('줄어든 금액 ','Less by ') : t('늘어난 금액 ','More by ')) + money(Math.abs(total(original)-total(cart))) + '</p>' + btn('undo',t('변경 되돌리기','Undo changes'),'text-button') + '<h2>' + t('바르는 순서도 챙겨요','Take your routine with you') + '</h2>' + routineHTML(cart) + '<div class="split">' + btn('save-routine',icon('download') + t('저장','Save PNG'),'secondary') + btn('copy-routine',t('복사','Copy'),'secondary') + '</div><p class="caption">' + t('질병을 진단하는 서비스가 아닙니다.','Not a medical diagnosis.') + '</p><div class="sticky">' + btn('checkout',t('주문 확인','Checkout') + icon('arrow'),'primary',cart.length ? '' : 'disabled') + '</div>';
  }
  function orderScreen() {
    const rec = records().find(r => r.id === currentRecord);
    return steps(3) + '<div class="success-icon">' + icon('check') + '</div><h1>' + t('주문을 확인했어요','Your order is confirmed.') + '</h1><p class="lead">' + t('고른 제품과 사용 순서를 기록에 보관했어요.','Your products and routine are saved in your history.') + '</p><div class="receipt"><span class="eyebrow">' + t('주문 번호 ','ORDER ') + esc(rec?.order || 'CC-0001') + '</span><div class="total"><span>' + t('주문 합계','Order total') + '</span><strong>' + money(total(cart)) + '</strong></div>' + cart.map(p => '<p>' + esc(tx(p.shade || p.name)) + '</p>').join('') + '</div><p class="caption">' + t('실제 결제나 배송은 발생하지 않아요.','No payment is charged and no shipment is placed.') + '</p>' + routineHTML(cart) + '<div class="split">' + btn('save-routine',t('사용 순서 저장','Save routine'),'secondary') + btn('export-receipt',t('주문 내역 저장','Save receipt'),'secondary') + '</div>' + btn('history',t('기록 보기','View history')) + '<p class="caption">' + t('질병을 진단하는 서비스가 아닙니다.','Not a medical diagnosis.') + '</p>';
  }
  function records() {
    const raw = read(KEY, []);
    if (!Array.isArray(raw)) return [];
    const cutoff = Date.now() - 30*86400000;
    const clean = raw.filter(r => r && typeof r.id === 'string' && Number.isFinite(r.time) && r.time >= cutoff && Array.isArray(r.decisions) && Array.isArray(r.cart) && r.cart.every(id => product(id)) && r.decisions.every(d => d && product(d.id) && ['keep','swap','remove','borderline'].includes(d.status)));
    if (clean.length !== raw.length) write(KEY,clean);
    return clean;
  }
  const dateText = time => new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : 'en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(time));
  function historyScreen() {
    const all = records().reverse(), query = historyQuery.toLowerCase();
    const filtered = all.filter(r => (historyFilter === 'all' || (historyFilter === 'ordered' ? !!r.order : !r.order)) && (!query || r.cart.some(id => (tx(product(id).name) + ' ' + tx(product(id).shade)).toLowerCase().includes(query)) || r.id.toLowerCase().includes(query)));
    const shown = filtered.slice((page-1)*10,page*10);
    return '<span class="eyebrow">' + t('이 기기에만 보관해요','ON THIS DEVICE ONLY') + '</span><h1>' + t('나의 점검 기록','Your check history') + '</h1><p class="lead">' + t('제품 선택 기록은 30일 뒤 지워져요. 사진과 피부 점수는 저장하지 않아요.','Product decisions expire after 30 days. No photos or skin scores are saved.') + '</p><label class="caption" for="history-search">' + t('제품 이름 검색','Search products') + '</label><input id="history-search" type="search" value="' + esc(historyQuery) + '" placeholder="' + t('제품 이름을 입력하세요','Enter a product name') + '"><label class="caption" for="history-filter">' + t('기록 상태','Record status') + '</label><select id="history-filter">' + [['all',t('전체','All')],['ordered',t('주문 완료','Ordered')],['checked',t('점검 완료','Checked')]].map(([v,l]) => '<option value="' + v + '" ' + (historyFilter === v ? 'selected' : '') + '>' + l + '</option>').join('') + '</select><p class="caption">' + integer(filtered.length) + t('건',' records') + '</p>' + (shown.length ? shown.map(r => '<article class="history-row"><h3>' + (r.order ? t('주문 완료','Order confirmed') : t('점검 완료','Check complete')) + '</h3><p>' + dateText(r.time) + '</p><p>' + r.cart.map(id => esc(tx(product(id).name))).join(', ') + '</p><div class="split">' + btn('restore-record',t('다시 담기','Restore cart'),'secondary','data-id="' + esc(r.id) + '"') + btn('delete-record',t('삭제','Delete'),'text-button','data-id="' + esc(r.id) + '"') + '</div></article>').join('') : '<div class="empty">' + icon('clock') + '<h2>' + (all.length ? t('검색 결과가 없어요','No matching records') : t('아직 점검 기록이 없어요','No checks yet')) + '</h2><p>' + t('장바구니를 점검하면 여기에 보관돼요.','Your cart checks will be saved here.') + '</p>' + btn('cart',t('장바구니로','Go to cart')) + '</div>') + (filtered.length > 10 ? '<div class="split">' + btn('prev-page',t('이전','Previous'),'secondary',page === 1 ? 'disabled' : '') + '<span class="caption">' + page + '/' + Math.ceil(filtered.length/10) + '</span>' + btn('next-page',t('다음','Next'),'secondary',page*10 >= filtered.length ? 'disabled' : '') + '</div>' : '') + '<div class="split">' + btn('export-history',t('기록 내보내기','Export CSV'),'secondary',all.length ? '' : 'disabled') + btn('clear-history',t('모두 지우기','Delete all'),'text-button',all.length ? '' : 'disabled') + '</div>';
  }
  function merchantScreen() {
    const all = records(), today = all.filter(r => new Date(r.time).toDateString() === new Date().toDateString());
    const counts = {}, changes = all.flatMap(r => r.decisions).filter(d => ['swap','remove'].includes(d.status));
    changes.forEach(d => counts[d.id] = (counts[d.id] || 0) + 1);
    const ranked = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5);
    const foundations = all.filter(r => r.decisions.some(d => product(d.id).type === 'foundation'));
    const shadeChanges = foundations.filter(r => r.decisions.some(d => product(d.id).type === 'foundation' && d.chosen && d.chosen !== d.id && d.chosen !== 'remove')).length;
    const conflicts = all.filter(r => r.decisions.some(d => d.conflict)).length;
    return '<span class="eyebrow">' + t('상품 담당자','MERCHANDISER') + '</span><h1>' + t('구매 전 점검 현황','Before-checkout insights') + '</h1><p class="lead">' + t('이 브라우저에서 지난 30일 동안 남긴 기록이에요.','From this browser’s last 30 days of activity.') + '</p><div class="stats"><div class="stat"><span>' + t('오늘 점검','Checks today') + '</span><strong data-stat="checks">' + integer(today.length) + '</strong></div><div class="stat"><span>' + t('색상 변경 비율','Shade changes') + '</span><strong>' + (foundations.length ? Math.round(shadeChanges/foundations.length*100) : 0) + '%</strong></div></div><p class="caption">' + t('색상 변경은 적용한 선택만 계산해요. 분모는 파운데이션을 점검한 ','Only applied shade changes count; denominator: ') + foundations.length + t('건이에요.',' checks with foundation.') + '</p><h2>' + t('바꾸거나 빼도록 자주 권한 제품','Most suggested changes') + '</h2>' + (ranked.length ? ranked.map(([id,count],i) => '<div class="ranking-row"><span>' + (i+1) + '. ' + esc(tx(product(id).name)) + '</span><b>' + count + t('건',' checks') + '</b></div>').join('') : '<div class="box"><p>' + t('아직 제품 변경 제안이 없어요. 장바구니에서 점검을 시작하세요.','No product suggestions yet. Start a cart check to see activity here.') + '</p></div>') + '<h2>' + t('가장 흔한 주의 조합','Most common pairing caution') + '</h2><div class="box"><h3>' + t('레티놀과 각질 토너','Retinol with an acid toner') + '</h3><p>' + conflicts + t('건의 점검에서 함께 담았어요.',' checks contained this pairing.') + '</p></div><div class="split">' + btn('export-history',t('기록 내보내기','Export CSV'),'secondary',all.length ? '' : 'disabled') + btn('cart',t('구매자 화면','Shopper view'),'text-button') + '</div><p class="caption">' + t('사진과 피부 점수는 수집하지 않아요. 같은 브라우저의 구매자 선택을 집계해요.','No photos or skin scores are collected. Only decisions in this browser are counted.') + '</p>';
  }
  function render(keepScroll = false) {
    const scroll = main.scrollTop;
    shell();
    main.dataset.screen = screen;
    const screens = {cart:cartScreen,consent:consentScreen,loading:loadingScreen,results:resultsScreen,comparison:comparisonScreen,shades:shadesScreen,quality:qualityScreen,'quality-error':qualityErrorScreen,unavailable:unavailableScreen,updated:updatedScreen,order:orderScreen,history:historyScreen,merchant:merchantScreen};
    main.innerHTML = (screens[screen] || cartScreen)();
    main.scrollTop = keepScroll ? scroll : 0;
  }
  function go(next, keep = false) { screen = next; render(keep); if (!keep) main.focus({preventScroll:true}); }
  function toast(message) { clearTimeout(timer); $('#toast').textContent = message; $('#toast').classList.add('visible'); timer = setTimeout(() => $('#toast').classList.remove('visible'), 2600); }
  function stopCamera() { if (stream) stream.getTracks().forEach(track => track.stop()); stream = undefined; }
  function releasePhoto() { stopCamera(); if (photoURL) URL.revokeObjectURL(photoURL); photoURL = ''; photoBlob = undefined; }
  function closeSheet() { stopCamera(); if (sheet.open) sheet.close(); if (lastFocus?.isConnected) lastFocus.focus(); }
  function openSheet(title, content) {
    lastFocus = document.activeElement;
    sheet.innerHTML = '<div class="sheet-head"><h2 id="sheet-title">' + title + '</h2>' + btn('close-sheet',icon('close'),'','aria-label="' + t('닫기','Close') + '"') + '</div>' + content;
    if (!sheet.open) sheet.showModal();
  }
  function saveDraft() { write(DRAFT,{cart:cart.map(p => p.id),updated:Date.now()}); }
  function saveRecord() {
    currentRecord = 'CC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,5).toUpperCase();
    const record = {id:currentRecord,time:Date.now(),cart:original.map(p => p.id),decisions:results.map(r => ({id:r.id,status:r.status,conflict:!!r.conflict,chosen:r.id}))};
    const saved = write(KEY,[...records(),record]);
    if (!saved) toast(t('기기에 저장할 수 없어 이번 화면에서만 보관해요.','Storage is unavailable; this session keeps the record in memory.'));
  }
  function updateRecord(order = false) {
    const all = records(), rec = all.find(r => r.id === currentRecord);
    if (!rec) return;
    rec.cart = cart.map(p => p.id);
    rec.decisions.forEach(d => d.chosen = choices[d.id] || d.id);
    if (order && !rec.order) rec.order = 'CC-' + new Date().toISOString().slice(0,10).replaceAll('-','') + '-' + String(all.filter(r => r.order).length+1).padStart(4,'0');
    write(KEY,all);
  }
  async function analyze(id, live = false) {
    const token = ++revision;
    if (!live) releasePhoto();
    person = id; mode = live ? 'live' : 'recorded'; original = cart.slice(); choices = {}; applied = false; comparison = {}; shadeCache = {}; stage = 0;
    YouCam.configure(id,mode); go('loading');
    try {
      const uploadedId = await YouCam.uploadSelfie(live ? photoBlob : undefined);
      if (token !== revision) return;
      fileId = uploadedId;
      stage = 1; render();
      const [skin, color] = await Promise.all([YouCam.analyzeSkin(fileId),YouCam.analyzeTone(fileId)]);
      if (token !== revision) return;
      scores = YouCam.parseSkin(skin); tone = YouCam.parseTone(color); stage = 2;
      results = CartRules.evaluate(original,scores,tone,D.products,D.rules);
      results.filter(r => r.status !== 'swap').forEach(r => choices[r.id] = r.status === 'remove' ? 'remove' : r.id);
      saveRecord(); go('results');
    } catch (err) {
      if (token !== revision) return;
      errorCode = err.code || 'network';
      if (['error_src_face_too_small','error_src_face_not_found','error_face_not_found','error_face_position_too_small','error_face_not_forward_facing'].includes(errorCode)) { badPhoto = errorCode.includes('small') ? 'small' : errorCode.includes('forward') ? 'side' : 'noface'; go('quality-error'); }
      else go('unavailable');
    }
  }
  async function compare() {
    const token = ++revision;
    releasePhoto(); mode = 'recorded';
    go('loading');
    try {
      for (const id of ['mina','jules']) {
        YouCam.configure(id,'recorded');
        const fid = await YouCam.uploadSelfie();
        const [skin,color] = await Promise.all([YouCam.analyzeSkin(fid),YouCam.analyzeTone(fid)]);
        if (token !== revision) return;
        const s = YouCam.parseSkin(skin), colorTone = YouCam.parseTone(color);
        comparison[id] = {scores:s,tone:colorTone,results:CartRules.evaluate(original,s,colorTone,D.products,D.rules)};
      }
      person = 'mina'; scores = comparison.mina.scores; tone = comparison.mina.tone; results = comparison.mina.results; choices = Object.fromEntries(results.filter(r => r.status !== 'swap').map(r => [r.id,r.status === 'remove' ? 'remove' : r.id]));
      saveRecord(); YouCam.configure(person,'recorded'); go('comparison');
    } catch (err) { if (token === revision) { errorCode = err.code || 'network'; go('unavailable'); } }
  }
  async function showShades(id) {
    const token = ++revision;
    shadeTarget = id;
    const ranked = D.products.filter(p => p.type === 'foundation' && p.id !== id).sort((a,b) => CartColor.compare(tone,a.hex).distance-CartColor.compare(tone,b.hex).distance);
    if (CartColor.compare(tone,ranked[0].hex).distance > 5 && CartColor.compare(tone,product(id).hex).distance > 5) { go('shades'); return; }
    shadeIds = [id,...ranked.slice(0,2).map(p => p.id)];
    selectedShade = choices[id] !== id && product(choices[id]) ? choices[id] : ranked[0].id;
    stage = 1; go('loading');
    try {
      // A live upload's session token must survive through all three try-ons.
      if (mode === 'recorded') YouCam.configure(person,mode);
      const images = await Promise.all(shadeIds.map(async shade => { const key = fileId + ':' + shade; if (!shadeCache[key]) shadeCache[key] = YouCam.parseVTO(await YouCam.tryFoundation(fileId,product(shade).hex)); return [shade,shadeCache[key]]; }));
      if (token !== revision) return;
      shadeImages = Object.fromEntries(images); go('shades');
    } catch (err) { if (token === revision) { errorCode = err.code || 'network'; go('unavailable'); } }
  }
  function applyChanges() {
    // An absent choice is untouched; an explicit original ID means Keep original.
    results.forEach(r => {
      if (r.status === 'swap' && !Object.hasOwn(choices,r.id)) choices[r.id] = r.alternatives[0] || r.id;
    });
    cart = original.flatMap(p => choices[p.id] === 'remove' ? [] : [product(choices[p.id]) || p]).filter((p,i,all) => all.findIndex(x => x.id === p.id) === i);
    applied = true; saveDraft(); updateRecord(); go('updated'); toast(t('선택한 변경을 적용했어요','Your changes are applied'));
  }
  function alternative(id) {
    const r = results.find(x => x.id === id);
    if (!r) return;
    openSheet(t('더 순한 선택을 골라요','Choose an alternative'),'<p class="lead">' + reason(r) + '</p>' + r.alternatives.map(a => row(product(a)) + '<p class="caption">' + t('향료 없음. 성분: ','No fragrance. Ingredients: ') + esc(product(a).inci.join(', ')) + '</p>' + btn('choose-alternative',t('이 제품으로 바꾸기','Swap to this product'),'primary','data-id="' + a + '" data-from="' + id + '"')).join('') + '<p class="caption">' + t('선택한 뒤 변경 적용을 누르면 장바구니가 바뀌어요.','Apply changes to update your cart after choosing.') + '</p>');
  }
  function catalog() {
    const list = D.products.filter(p => (catalogType === 'all' || p.type === catalogType) && (tx(p.name)+' '+tx(p.shade)).toLowerCase().includes(catalogQuery.toLowerCase()));
    openSheet(t('제품 고르기','Browse products'),'<label class="caption" for="catalog-search">' + t('제품 검색','Search products') + '</label><input id="catalog-search" type="search" value="' + esc(catalogQuery) + '"><label class="caption" for="catalog-filter">' + t('제품 종류','Category') + '</label><select id="catalog-filter">' + [['all',t('전체','All')],['toner',t('토너','Toner')],['moisturizer',t('크림','Moisturizer')],['foundation',t('파운데이션','Foundation')]].map(([v,l]) => '<option value="' + v + '" ' + (catalogType === v ? 'selected' : '') + '>' + l + '</option>').join('') + '</select><div class="catalog-list">' + (list.length ? list.map(p => row(p) + btn('add-product',cart.some(x => x.id === p.id) ? t('담았어요','Added') : t('담기','Add'),'secondary wide','data-id="' + p.id + '" ' + (cart.some(x => x.id === p.id) ? 'disabled' : ''))).join('') : '<p>' + t('검색 결과가 없어요','No matching products') + '</p>') + '</div>');
  }
  function help() {
    openSheet(t('도움말','Help'),'<div class="stack"><div class="box"><h3>' + t('사진 없이도 사용할 수 있나요?','Can I start without a photo?') + '</h3><p>' + t('가상 고객을 선택하면 실제로 받은 분석 기록으로 점검해요. 가입은 필요하지 않아요.','Choose a fictional shopper to replay real API results. No account is needed.') + '</p></div><div class="box"><h3>' + t('사진은 어디에 보관하나요?','Where is my photo stored?') + '</h3><p>' + t('앱에는 보관하지 않아요. 분석 서버의 업로드한 사진과 생성된 이미지는 30일 뒤 삭제돼요. 선택 기록은 기기에 30일 보관하며 기록 화면에서 지울 수 있어요.','Not in this app. YouCam uploaded and generated images are removed after 30 days. Local decisions expire in 30 days and can be deleted in History.') + '</p></div><div class="box"><h3>' + t('점검이 멈췄어요','My check stopped') + '</h3><p>' + t('실시간 점검은 세계 표준시 기준 하루 5회, 심사 기간 전체 22회까지 가능해요. 60초가 지나면 다시 시도하거나 가상 고객으로 계속하세요.','Live checks allow 5 per UTC day and 22 across judging. After 60 seconds, retry or use a recorded shopper.') + '</p></div>' + btn('contact',t('문의 내용 작성','Write a support request'),'secondary wide') + '</div>');
  }
  function routineText(items = cart) {
    const r = CartRoutine.build(items), lines = [t('나의 사용 순서','My skincare routine')];
    for (const [title,list] of [[t('아침','Morning'),r.am],[t('저녁','Evening'),r.pm]]) { lines.push('',title,...(list.length ? list.map((p,i) => (i+1) + '. ' + tx(p.name)) : [t('담은 제품 없음','No products')])); }
    if (r.alternate.length) lines.push('',t('각질 토너는 레티놀을 쉬는 날 저녁에 사용하세요.','Use the acid toner on evenings without retinol.'));
    if (r.needsSPF) lines.push(t('낮에는 자외선 차단제를 사용하세요.','Use sunscreen during the day.'));
    lines.push('',t('질병을 진단하는 서비스가 아닙니다.','Not a medical diagnosis.'),t('시연용 모의 데이터','Illustrative store data for demonstration'));
    return lines.join('\n');
  }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url),30000);
  }
  async function saveRoutine() {
    await document.fonts.ready;
    const lines = routineText().split('\n'), c = document.createElement('canvas'); c.width = 900; c.height = 160 + lines.length*48;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#fbfaf5'; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = '#264e43'; ctx.font = '600 32px Pretendard, Inter, sans-serif';
    lines.forEach((line,i) => ctx.fillText(line,48,72+i*48,804));
    const blob = await new Promise(resolve => c.toBlob(resolve,'image/png'));
    if (!blob) { toast(t('저장하지 못했어요. 복사를 이용해 주세요.','Could not save. Please use Copy.')); return; }
    download(blob,'cart-check-routine.png'); toast(t('사용 순서를 저장했어요','Routine saved'));
  }
  async function copyRoutine() {
    const text = routineText();
    try { await navigator.clipboard.writeText(text); toast(t('사용 순서를 복사했어요','Routine copied')); }
    catch { openSheet(t('사용 순서 복사','Copy your routine'),'<p>' + t('아래 내용을 선택해서 복사해 주세요.','Select and copy the text below.') + '</p><textarea readonly aria-label="' + t('사용 순서','Routine') + '">' + esc(text) + '</textarea>'); sheet.querySelector('textarea').select(); }
  }
  function exportHistory() {
    const cell = v => '"' + String(v).replaceAll('"','""') + '"';
    const rows = [[t('점검 번호','Check number'),t('점검 일시','Checked at'),t('제품','Product'),t('제안','Suggestion'),t('적용한 선택','Applied choice'),t('주문 번호','Order number')]];
    records().forEach(r => r.decisions.forEach(d => rows.push([r.id,new Date(r.time).toISOString(),tx(product(d.id).name),names()[d.status],d.chosen === 'remove' ? t('뺌','Removed') : tx(product(d.chosen)?.shade || product(d.chosen)?.name || product(d.id).name),r.order || t('주문 전','Not ordered')])));
    download(new Blob(['\uFEFF'+rows.map(r => r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'cart-check-records.csv');
    toast(t('기록을 저장했어요','Records exported'));
  }
  function exportReceipt() {
    const record = records().find(r => r.id === currentRecord);
    const text = [t('주문 내역','Order receipt'),t('주문 번호: ','Order: ') + (record?.order || currentRecord),...cart.map(p => tx(p.name) + (p.shade ? ' / ' + tx(p.shade) : '') + '  ' + money(p.price)),t('주문 합계: ','Order total: ') + money(total(cart)),t('실제 결제나 배송은 발생하지 않아요.','No payment or shipment is placed.'),'',routineText()].join('\n');
    download(new Blob([text],{type:'text/plain;charset=utf-8'}),'cart-check-receipt.txt');
  }
  async function camera() {
    if (!consent) { toast(t('먼저 사진 처리에 동의해 주세요','Please agree to photo processing first')); return; }
    openSheet(t('정면으로 찍어 주세요','Face forward'),'<p>' + t('얼굴이 사진 너비의 60%를 넘게 가까이 와 주세요.','Move close enough for your face to cover over 60% of the photo width.') + '</p><video id="camera-video" autoplay playsinline muted></video><p class="caption">' + t('카메라를 준비하고 있어요.','Preparing the camera.') + '</p>');
    try {
      const token = revision;
      const cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:960},height:{ideal:1280}},audio:false});
      if (!sheet.open || token !== revision) { cameraStream.getTracks().forEach(tr => tr.stop()); return; }
      stream = cameraStream;
      $('#camera-video').srcObject = stream;
      sheet.insertAdjacentHTML('beforeend',btn('capture',t('촬영','Take photo')));
    } catch {
      if (!sheet.open) return;
      openSheet(t('카메라를 사용할 수 없어요','Camera unavailable'),'<p>' + t('카메라 권한을 허용하거나 저장한 사진을 골라 주세요.','Allow camera access or choose a saved photo.') + '</p>' + btn('upload',t('사진 선택','Choose photo'),'primary'));
    }
  }
  async function preparePhoto(blob) {
    closeSheet(); releasePhoto(); photoBlob = blob; photoURL = URL.createObjectURL(blob);
    const token = ++revision, check = await CartPrecheck.check(blob);
    if (token !== revision) return;
    if (!check.ok) { badPhoto = check.code; go('quality-error'); return; }
    openSheet(t('얼굴 위치를 확인해 주세요','Check your face framing'),'<img class="error-photo" src="' + esc(photoURL) + '" alt="' + t('선택한 사진','Selected photo') + '"><p>' + t('정면을 보고 있나요? 얼굴 너비가 사진의 60%를 넘는지 확인해 주세요. 자동 얼굴 감지를 지원하지 않는 기기에서는 직접 확인해야 해요.','Are you facing forward with your face wider than 60% of the photo? Devices without face detection require your confirmation.') + '</p><label class="consent"><input id="face-confirm" type="checkbox"><span>' + t('정면이고 얼굴 크기도 충분해요','My face is frontal and large enough') + '</span></label>' + btn('send-photo',t('동의하고 보내기','Confirm and send')) + btn('upload',t('다른 사진 선택','Choose another'),'secondary wide'));
  }
  function resetRoute() {
    revision++; closeSheet(); releasePhoto(); consent = false; results = []; choices = {}; currentRecord = ''; applied = false; mode = 'recorded';
    const hash = location.hash.slice(1), match = /^scene-([1-7])$/.exec(hash);
    route = hash === 'merchant' ? 'merchant' : hash === 'full' ? 'full' : 'scene';
    scene = match ? Number(match[1]) : 1;
    const ids = scene === 2 ? ['rich-cream','astringent'] : scene === 3 ? ['aha','calm-serum','rich-cream'] : scene === 4 ? ['ivory','rich-cream','sunscreen'] : D.defaultCart;
    const draft = read(DRAFT,{});
    cart = (route === 'full' && Array.isArray(draft.cart) && Date.now()-draft.updated < 30*86400000 ? draft.cart : ids).map(product).filter(Boolean);
    original = cart.slice(); screen = route === 'merchant' ? 'merchant' : 'cart'; render();
  }
  async function action(a, el) {
    const id = el.dataset.id;
    if (a === 'next') { location.hash = 'scene-' + (route === 'merchant' || scene === 7 ? 1 : scene+1); return; }
    if (a === 'language') { lang = lang === 'ko' ? 'en' : 'ko'; const url = new URL(location.href); url.searchParams.set('lang',lang); history.replaceState(null,'',url); closeSheet(); render(true); return; }
    if (a === 'close-sheet') { closeSheet(); return; }
    if (a === 'help') { help(); return; }
    if (a === 'contact') { openSheet(t('문의 내용 작성','Write a support request'),'<p>' + t('문의 내용을 파일로 저장할 수 있어요. 아직 문의 전송은 연결하지 않았어요.','You can save a request as a file. Support delivery is not connected yet.') + '</p><textarea id="support-message" maxlength="2000" aria-label="' + t('문의 내용','Support request') + '"></textarea>' + btn('save-support',t('문의 내용 저장','Save request'))); return; }
    if (a === 'save-support') { const text = $('#support-message').value.trim(); if (!text) { toast(t('문의 내용을 입력해 주세요','Enter a support message')); return; } download(new Blob([t('카트 체크 문의\n','Cart Check support request\n')+text],{type:'text/plain;charset=utf-8'}),'cart-check-support.txt'); closeSheet(); toast(t('문의 내용을 저장했어요','Request saved')); return; }
    if (a === 'merchant') { if (location.hash === '#merchant') go('merchant'); else location.hash = 'merchant'; return; }
    if (a === 'history') { revision++; releasePhoto(); historyQuery = ''; historyFilter = 'all'; page = 1; go('history'); return; }
    if (a === 'cart') { revision++; releasePhoto(); if (route === 'merchant') location.hash = 'full'; else go('cart'); return; }
    if (a === 'start') { if (!cart.length) return; if (scene === 5 && route !== 'full') go('quality'); else if (scene === 6 && route !== 'full') { errorCode = 'daily_cap'; go('unavailable'); } else go('consent'); return; }
    if (a === 'shopper') { await analyze(id); return; }
    if (['another','fallback'].includes(a)) { revision++; releasePhoto(); go('consent'); return; }
    if (a === 'compare') { await compare(); return; }
    if (a === 'use-jules') { releasePhoto(); mode = 'recorded'; person = 'jules'; scores = comparison.jules.scores; tone = comparison.jules.tone; results = comparison.jules.results; choices = {}; results.forEach(r => choices[r.id] = r.alternatives[0] || r.id); saveRecord(); applyChanges(); return; }
    if (a === 'alternative') { alternative(id); return; }
    if (a === 'choose-alternative') { choices[el.dataset.from] = id; closeSheet(); render(true); toast(t('대안을 골랐어요. 변경 적용을 눌러 주세요.','Alternative selected. Apply changes when ready.')); return; }
    if (a === 'keep' || a === 'remove') { choices[id] = a === 'keep' ? id : 'remove'; render(true); toast(a === 'keep' ? t('그대로 두기로 했어요','Original product kept') : t('빼기로 했어요. 변경 적용을 눌러 주세요.','Marked for removal. Apply when ready.')); return; }
    if (a === 'shade') { await showShades(id); return; }
    if (a === 'select-shade') { selectedShade = id; render(true); return; }
    if (a === 'use-shade') { choices[shadeTarget] = selectedShade; go('results'); toast(t('색상을 골랐어요. 변경 적용을 눌러 주세요.','Shade selected. Apply changes when ready.')); return; }
    if (a === 'remove-foundation') { choices[shadeTarget] = 'remove'; go('results'); return; }
    if (a === 'apply') { applyChanges(); return; }
    if (a === 'undo') { cart = original.slice(); choices = Object.fromEntries(original.map(p => [p.id,p.id])); applied = false; saveDraft(); updateRecord(); go('results'); toast(t('변경을 되돌렸어요','Changes undone')); return; }
    if (a === 'checkout') { if (!cart.length) return; updateRecord(true); releasePhoto(); go('order'); return; }
    if (a === 'save-routine') { await saveRoutine(); return; }
    if (a === 'copy-routine') { await copyRoutine(); return; }
    if (a === 'export-receipt') { exportReceipt(); return; }
    if (a === 'bad-photo') { badPhoto = id; go('quality-error'); return; }
    if (a === 'noface') { badPhoto = 'noface'; go('quality-error'); return; }
    if (a === 'retake') { releasePhoto(); go('consent'); return; }
    if (['timeout','total-cap','offline'].includes(a)) { errorCode = a === 'total-cap' ? 'total_cap' : a; go('unavailable'); return; }
    if (a === 'retry') { if (photoBlob) await analyze(person,true); else go('consent'); return; }
    if (a === 'back' || a === 'cancel') { revision++; if (screen === 'loading' || screen === 'consent') { releasePhoto(); go('cart'); } else if (['shades','comparison'].includes(screen)) go('results'); else if (screen === 'quality-error') go('quality'); else go('cart'); return; }
    if (a === 'empty-cart') { undoCart = cart.slice(); cart = []; saveDraft(); go('cart'); return; }
    if (a === 'undo-empty') { cart = undoCart.slice(); undoCart = []; saveDraft(); render(); return; }
    if (a === 'catalog') { catalogQuery = ''; catalogType = 'all'; catalog(); return; }
    if (a === 'add-product') { if (product(id) && !cart.some(p => p.id === id)) cart.push(product(id)); saveDraft(); catalog(); render(true); toast(t('장바구니에 담았어요','Added to your cart')); return; }
    if (a === 'export-history') { exportHistory(); return; }
    if (a === 'next-page' || a === 'prev-page') { page += a === 'next-page' ? 1 : -1; render(); return; }
    if (a === 'restore-record') { const r = records().find(r => r.id === id); if (r) { cart = r.cart.map(product); saveDraft(); go('cart'); } return; }
    if (a === 'delete-record') { write(KEY,records().filter(r => r.id !== id)); page = 1; render(); toast(t('기록을 삭제했어요','Record deleted')); return; }
    if (a === 'clear-history') { openSheet(t('모든 기록을 지울까요?','Delete all records?'),'<p>' + t('이 기기의 점검 기록과 주문 기록을 지웁니다. 되돌릴 수 없어요.','This removes this device’s check and order records. It cannot be undone.') + '</p>' + btn('confirm-clear',t('모두 지우기','Delete all'),'secondary wide')); return; }
    if (a === 'confirm-clear') { write(KEY,[]); closeSheet(); render(); return; }
    if (a === 'upload') { if (!consent) { toast(t('먼저 사진 처리에 동의해 주세요','Please agree to photo processing first')); return; } closeSheet(); $('#selfie-file').value = ''; $('#selfie-file').click(); return; }
    if (a === 'camera') { await camera(); return; }
    if (a === 'capture') { const video = $('#camera-video'); if (!video?.videoWidth) return; const c = document.createElement('canvas'); c.width = video.videoWidth; c.height = video.videoHeight; c.getContext('2d').drawImage(video,0,0); const blob = await new Promise(r => c.toBlob(r,'image/jpeg',.9)); if (blob) await preparePhoto(blob); return; }
    if (a === 'send-photo') { if (!$('#face-confirm')?.checked) { toast(t('얼굴 위치를 먼저 확인해 주세요','Confirm your face framing first')); return; } closeSheet(); if (C.MODE !== 'live' || !C.PROXY_URL) { errorCode = 'unavailable'; go('unavailable'); return; } await analyze(person,true); }
  }
  document.addEventListener('click',e => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    Promise.resolve(action(el.dataset.action,el)).catch(() => toast(t('작업을 마치지 못했어요. 다시 시도해 주세요.','Could not finish. Please try again.')));
  });
  document.addEventListener('change',e => {
    const el = e.target;
    if (el.id === 'consent') consent = el.checked;
    if (el.id === 'history-filter') { historyFilter = el.value; page = 1; render(); }
    if (el.id === 'catalog-filter') { catalogType = el.value; catalog(); }
    if (el.id === 'selfie-file' && el.files[0]) preparePhoto(el.files[0]).catch(() => { badPhoto = 'corrupt'; go('quality-error'); });
  });
  document.addEventListener('input',e => {
    const el = e.target;
    if (el.id === 'shade-slider') $('#shade-comparison').style.setProperty('--reveal',el.value+'%');
    if (el.id === 'history-search') { const pos = el.selectionStart; historyQuery = el.value; page = 1; render(true); $('#history-search').focus(); $('#history-search').setSelectionRange(pos,pos); }
    if (el.id === 'catalog-search') { const pos = el.selectionStart; catalogQuery = el.value; catalog(); $('#catalog-search').focus(); $('#catalog-search').setSelectionRange(pos,pos); }
  });
  sheet.addEventListener('cancel',() => stopCamera());
  sheet.addEventListener('click',e => { if (e.target === sheet) { const r = sheet.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeSheet(); } });
  window.addEventListener('hashchange',resetRoute);
  window.addEventListener('online',() => { shell(); toast(t('다시 연결됐어요. 저장한 선택을 이어서 쓸 수 있어요.','Back online. Your saved choices are ready.')); });
  window.addEventListener('offline',() => { saveDraft(); shell(); toast(t('선택을 이 기기에 저장했어요','Choices saved on this device')); });
  window.addEventListener('storage',e => { if (e.key === KEY && ['merchant','history'].includes(screen)) render(true); });
  window.addEventListener('pagehide',() => { revision++; releasePhoto(); });
  if (!location.hash) history.replaceState(null,'','#scene-1');
  resetRoute();
})();
