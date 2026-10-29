/* Council Watch: local-first, no analytics, no automatic external requests. */
'use strict';
const $ = selector => document.querySelector(selector);
const plain = value => typeof value === 'string' ? value : '';
const esc = value => plain(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
const textOf = value => plain(value) || plain(value?.en);
const number = value => Number.isFinite(value) ? value.toLocaleString('en-US') : 'Not recorded';
const DAY = 86400000, STORAGE = 'council-watch-v2';
const COMMENT_URL = 'https://www.seattle.gov/council/committees/public-comment';
const PEW_URL = 'https://www.pewresearch.org/wp-content/uploads/sites/20/2026/07/PJ_26.07.16_engagement_topline.pdf';
let data = window.CW_SAMPLE, run = window.CW_RUN;
const defaults = () => ({profile:'aurora',interests:['housing','transportation'],consent:false,saved:[],drafts:{},expires:0});
let state = defaults();
function readState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE) || '{}');
    if (s.expires > Date.now() && Array.isArray(s.saved) && s.drafts && typeof s.drafts === 'object') {
      state = {...defaults(),...s};
      state.saved = s.saved.filter(r => r && typeof r.id === 'string' && ['draft','calendar'].includes(r.kind) && Date.now()-Date.parse(r.at)<7*DAY);
      state.drafts = Object.fromEntries(Object.entries(s.drafts).filter(([id,d]) => d && typeof d.text === 'string' && state.saved.some(r => r.id === id && r.kind === 'draft')));
      if (!['aurora','rainier-beach'].includes(state.profile)) state.profile='aurora';
      if (!Array.isArray(state.interests)) state.interests=defaults().interests;
    } else localStorage.removeItem(STORAGE);
  } catch { /* File URLs and private browsing may deny storage. */ }
}
readState();
let scene=1,view='onboard',selected='126453',modal='',returnFocus,toastTimer,loadingTimer,search='',filter='all',offlineOverride=false;
let activeDraft={name:'',text:'',stance:'question'},undoText='';
const paths = {
  pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  arrow:'M5 12h14 M13 6l6 6-6 6',back:'M19 12H5 M11 6l-6 6 6 6',check:'M5 12l4 4L19 6',close:'m6 6 12 12 M6 18 18 6',
  calendar:'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2 M7 2v4 M17 2v4 M3 10h18 M7 14h3 M14 14h3',
  home:'m3 10 9-7 9 7 M5 9v12h14V9 M9 21v-8h6v8',book:'M4 3h13a3 3 0 0 1 3 3v15H6a3 3 0 0 1 0-6h14 M4 3v15 M8 7h8 M8 11h6',
  info:'M12 16v-4 M12 8h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',external:'M14 3h7v7 M10 14 21 3 M10 3H3v18h18v-7',
  bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M9 21h6',shield:'m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z M8 12l3 3 5-6',
  mail:'M3 5h18v14H3Z m0 0 9 8 9-8',copy:'M8 8h13v13H8Z M16 8V3H3v13h5',download:'M12 3v12 m-5-5 5 5 5-5 M3 16v5h18v-5',
  wifi:'m3 3 18 18 M2 8a16 16 0 0 1 3-2 M9 4a16 16 0 0 1 13 4 M5 12a11 11 0 0 1 5-3 M15 10a11 11 0 0 1 4 2 M8 16a6 6 0 0 1 5-2 M12 20h.01',
  clock:'M12 6v6l4 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',search:'M16 16l5 5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  building:'M3 21h18 M5 21V7l7-4 7 4v14 M9 9h1 M14 9h1 M9 13h1 M14 13h1 M10 21v-4h4v4',leaf:'M20 3C9 2 3 7 5 14c2 7 14 7 15-11Z M4 21 15 9'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.info}"/></svg>`;
const button = (action,label,kind='primary',ico='',extra='') => `<button type="button" class="${kind}" data-action="${action}" ${extra}>${ico?icon(ico):''}${label}</button>`;
const link = (url,label,kind='source') => safeURL(url) ? `<a class="${kind}" href="${esc(safeURL(url))}" target="_blank" rel="noopener noreferrer">${esc(label)}${icon('external')}</a>` : '';
const profiles = {'aurora':{short:'Bitter Lake Playfield',label:'Near Bitter Lake Playfield (District 5)',district:5},'rainier-beach':{short:'Rainier Beach',label:'Near Rainier Beach (District 2)',district:2}};
const topics = {housing:'Housing',transportation:'Transportation',parks:'Parks',schools:'Schools','budget & taxes':'Budget'};
const scenes = [
  ['A little closer\nto your city.','Pick your area and interests','You want to know what the council is deciding near your home.','Keep Bitter Lake Playfield and choose your interests. Tap Find my items.','A weekly list with a nearby item and the next comment deadline.'],
  ['A change nearby.\nA source to check.','Read the nearby item','A utilities bill covers three parcels near Bitter Lake Playfield.','Read the short summary, then open the original on page 5.','See the 0.46 mi match and the actual status, without guessing what will be built.'],
  ['Before the meeting.\nBefore you miss it.','Save the next deadline','A citywide truck safety bill matches your transportation interest.','Use Add to calendar on the first card in This week.','Download an October 26 reminder for the 10:00 AM Pacific cutoff.'],
  ['Your words.\nYour say.','Make the draft your own','You have a question about the truck safety proposal.','Choose a stance, add your name and edit. Copy it or open your email app.','Your draft is ready. You send it. Nothing is sent by Council Watch.'],
  ['No local match.\nStill in the loop.','Try another place','You switched from Bitter Lake Playfield to Rainier Beach.','Read the three citywide items, or switch back with one tap.','An honest empty state, with useful citywide decisions below it.'],
  ['For the whole city.\nFor you, too.','Read a citywide item','Some decisions affect the whole city and have no street address.','Read the truck safety proposal and its source.','Citywide is clearly labelled. There is no invented distance.'],
  ['When we are unsure,\nyou should know.','Check the original','A zoning item could not be summarized reliably.','Open the original agenda on page 8.','No unsupported summary, location or generated comment.']
];
function item(id) { return data.items.find(i=>i.id===id) || window.CW_SAMPLE.items.find(i=>i.id===id); }
function title(i) { return textOf(i?.editorial?.title) || plain(i?.card?.what_changes) || plain(i?.matter_file) || 'Council item'; }
function date(iso,opts={}) { const d=new Date(iso);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',month:'short',day:'numeric',...opts}).format(d):'Date not confirmed'; }
function passed(i) { return Date.parse(i?.deadlines?.written || i?.meeting_at) < Date.now(); }
function reviewed(i) { return i.needs_review || (!i.editorial&&!i.card) || !i.source_pages?.some(s=>s.page&&safeURL(s.url)); }
function source(i) { const s=i.source_pages?.find(s=>safeURL(s.url)&&s.url.includes('.pdf')) || {url:i.agenda_url};return link(s.url+(Number.isInteger(s.page)?'#page='+s.page:''),'Read the original'+(Number.isInteger(s.page)?' (page '+s.page+')':'')); }
function distance(i) { return data.matches?.[state.profile]?.find(m=>m.item_id===i.id&&m.kind==='near')?.distance_mi; }
function persist(force=false) {
  if(!state.consent&&!force)return false;
  try {state.expires=Date.now()+7*DAY;const stored=state.consent?state:{...state,profile:'aurora',interests:['housing','transportation']};localStorage.setItem(STORAGE,JSON.stringify(stored));return true;}
  catch {toast('Storage is unavailable. Copy or download your work.');return false;}
}
function toast(message) {$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3800);}
function footer() {
  const summary = data.sample!==false ? 'Sample summaries — replaced by NVIDIA Nemotron via Nebius Token Factory on the next weekly run.' : `Summaries by NVIDIA Nemotron on Nebius Token Factory · Context by Tavily · Updated ${date(data.generated_at,{hour:'numeric',minute:'2-digit'})} PT`;
  $('#disclosure').innerHTML=`<p>${esc(summary)}</p><p>Only 13% of U.S. adults attended a local government meeting in the past year <a href="${PEW_URL}" target="_blank" rel="noopener noreferrer">(Pew Research Center, 2025).</a></p>`;
}
function shell() {
  const s=scenes[scene-1];
  $('#guide').innerHTML=`<div class="guide-copy"><span class="guide-tag">Demo · Scene ${scene}/7</span><span class="guide-task">${s[1]}</span></div>${button('next',scene===7?'Restart':'Next','primary','arrow')}`;
  $('#appbar').innerHTML=`<div class="brand"><span class="brandmark">${icon('building')}</span>Council Watch</div><span class="city-label">${icon('pin')}Seattle</span>`;
  $('#tabbar').innerHTML=[['home','This week','home'],['records','Saved','book'],['about','About','info']].map(([a,l,ic])=>`<button type="button" data-action="${a}" ${(['about','run','help'].includes(view)?a==='about':view==='records'?a==='records':a==='home')?'aria-current="page"':''}>${icon(ic)}${l}</button>`).join('');
  $('#story').innerHTML=`<p class="eyebrow">Council Watch / A guided walkthrough</p><h2>${s[0]}</h2>${['Situation','What to do','What success looks like'].map((l,n)=>`<section class="story-block"><h3>${l}</h3><p>${s[n+2]}</p></section>`).join('')}<div class="story-steps" aria-label="Choose a scene">${scenes.map((_,n)=>button('scene',String(n+1),'','',`data-scene="${n+1}" aria-label="Scene ${n+1}" ${scene===n+1?'aria-current="step"':''}`)).join('')}</div><p class="story-foot">Real Seattle records. No account or API key needed.</p>`;
  footer();connection();
}
function mapGraphic(detail=false) {
 return `<svg viewBox="0 0 340 ${detail?150:112}" role="img" aria-label="Schematic of Bitter Lake Playfield and the Aurora Avenue parcels. Not a navigation map."><rect width="340" height="160" fill="var(--paper)"/><path class="map-block" d="M12 12h57v33H12z M12 64h57v70H12z M190 12h58v35h-58z M277 10h54v39h-54z M277 76h54v60h-54z"/><path class="map-street" d="M85 0v160M263 0v160M0 57h340M0 143h340"/><rect x="101" y="69" width="76" height="65" rx="12" class="map-park"/><circle class="map-radius" cx="139" cy="${detail?95:61}" r="58"/><circle class="map-ring" cx="139" cy="${detail?95:61}" r="58"/><text class="map-label" x="12" y="25">Bitter Lake</text><text class="map-label" x="276" y="67">Aurora Ave N</text>${detail?'<path class="map-route" d="M139 95h77V115h47"/><circle cx="263" cy="115" r="7" class="map-marker"/><text class="map-label" x="194" y="101">3 parcels</text>':''}<circle cx="139" cy="${detail?95:61}" r="9" class="map-marker"/><text class="map-label" x="105" y="${detail?143:100}">Your area</text></svg>`;
}
function place() {const p=profiles[state.profile];return `<div class="place">${icon('pin')}<div><strong>Near ${p.short}</strong><p class="small">District ${p.district} &nbsp; / &nbsp; 0.5 mi radius</p></div>${button('profile','Switch place','text-button')}</div>`;}
function onboarding() {
 return `<div class="page-head"><p class="eyebrow">Your weekly council update</p><h1>What’s happening<br>near your home?</h1><p class="muted">Local decisions, simply explained.<br>Time to read. Time to have your say.</p></div><div class="intro-map">${mapGraphic()}</div><form id="onboard"><label for="location">Start with a place in Seattle</label><input id="location" name="location" list="landmarks" value="${esc(profiles[state.profile].label)}" autocomplete="off" required aria-describedby="location-error"><datalist id="landmarks">${Object.values(profiles).map(p=>`<option value="${p.label}"></option>`).join('')}</datalist><p id="location-error" class="error-text" role="alert"></p><fieldset><legend>What matters to you?</legend><div class="chips">${Object.entries(topics).map(([key,label])=>button('topic',label,'chip-button','',`data-topic="${key}" aria-pressed="${state.interests.includes(key)}"`)).join('')}</div></fieldset><label class="consent"><input type="checkbox" id="consent" ${state.consent?'checked':''}>Remember my place and interests on this device for 7 days. Optional.</label><button class="primary full" type="submit">Find my items${icon('arrow')}</button><p class="privacy-note">${icon('shield')}No account or location permission needed. Your place stays on this device.</p></form>`;
}
function card(i,pinned=false) {
  const d=distance(i),isPast=passed(i),uncertain=reviewed(i);
  return `<article class="card ${pinned&&!isPast?'pinned':''}" data-item="${esc(i.id)}"><div class="card-meta"><span class="badge ${pinned&&!isPast?'danger':'neutral'}">${pinned&&!isPast?icon('clock')+'Comment by '+esc(date(i.deadlines.written,{weekday:'short',month:undefined,day:undefined,hour:'numeric',minute:'2-digit'})):Number.isFinite(d)?d.toFixed(2)+' mi from you':i.citywide?'Citywide':'Location not confirmed'}</span><span class="small">${esc(i.matter_file)}</span></div><button class="card-link" data-action="item" data-id="${esc(i.id)}"><h3>${uncertain?'Check the original':esc(title(i))}</h3><p class="muted">${uncertain?'We could not verify a summary for this item.':esc(textOf(i.editorial?.what)||i.card?.what_changes||'Read the council record.')}</p></button>${pinned&&!isPast?`<p class="small mt">${date(i.deadlines.written,{hour:'numeric',minute:'2-digit'})} Pacific, for distribution before the meeting.</p>${button('calendar','Add to calendar','primary full','calendar',`data-id="${i.id}"`)}<p class="small mt">${link(i.agenda_url+'#page=2','Comment instructions (page 2)')}</p>`:`<p class="small mt">${i.action==='passed'?'Passed':isPast?'Meeting ended':'On the agenda'} / ${date(i.meeting_at)}</p>`}${source(i)}</article>`;
}
function matches() {
 const ids=new Set((data.matches?.[state.profile]||[]).map(m=>m.item_id));
 return data.items.filter(i=>ids.has(i.id)&&(!state.interests.length||i.topics?.some(t=>state.interests.includes(t))));
}
function feed() {
 const near=matches().filter(i=>Number.isFinite(distance(i)));
 const city=matches().filter(i=>i.citywide&&!reviewed(i));
 const upcoming=[...city].filter(i=>!passed(i)).sort((a,b)=>Date.parse(a.deadlines.written)-Date.parse(b.deadlines.written));
 const pin=upcoming.find(i=>i.id==='126615'&&i.deadlines.written===upcoming[0]?.deadlines.written)||upcoming[0];
 const empty=near.length===0;
 const nDays=pin?Math.max(0,Math.ceil((Date.parse(pin.deadlines.written)-Date.now())/DAY)):0;
 const cityItems=[...(pin?[pin]:[]),...city.filter(i=>i!==pin)].slice(0,empty?3:2);
 return `${place()}${empty?`<section class="empty"><div class="empty-symbol">${icon('leaf')}</div><h1>Nothing near you<br>this week</h1><p>No items within 0.5 mi match your interests.<br>Here are decisions for the whole city.</p>${state.profile==='rainier-beach'?button('switch-back','Back to Bitter Lake Playfield','text-button','back'):''}</section>`:`<div class="page-head"><p class="eyebrow">Week of ${date(data.week_of+'T12:00:00-07:00')}</p><h1>This week</h1><p class="muted">${near.length} ${near.length===1?'item':'items'} near you${pin?' / next deadline in '+nDays+' days':''}</p></div><div class="notice">${icon('bell')}<span>Your update is ready. ${near.length} nearby ${near.length===1?'item':'items'} and ${cityItems.length} citywide items to catch up on.</span></div>`}<div class="section-head"><h2>${empty?'Across the city':'Coming up first'}</h2><span class="small">${empty?'3 items':'Pacific Time'}</span></div><div class="stack">${cityItems.map((i,n)=>card(i,n===0&&!!pin)).join('')}</div>${!empty?`<div class="section-head"><h2>Near your place</h2><span class="small">Within 0.5 mi</span></div><div class="stack">${near.map(i=>card(i)).join('')}</div>`:''}${button('all','Search all council items','secondary full mt','search')}<div class="section-head"><h2>Meeting changes</h2></div>${cancelled()}`;
}
function cancelled() { const event=data.events?.find(e=>e.id===6912&&e.cancelled);return event?`<div class="cancelled"><span class="badge neutral">Cancelled</span><p class="mt"><s>${esc(event.name)} / Oct 27, 2:00 PM</s></p><p class="small">The council lists this meeting as cancelled.</p>${link(event.url,'Check the meeting record')}</div>`:'<p class="small">No cancelled meetings in this update.</p>'; }
function detail(i) {
 if(!i)return '<h1>Item unavailable</h1><p class="mt">Return to This week and choose another item.</p>';
 const d=distance(i),uncertain=reviewed(i);
 const top=`${button('home','This week','text-button back','back')}${place()}<div class="card-meta"><span class="badge">${Number.isFinite(d)?d.toFixed(2)+' mi from you':i.citywide?'Citywide':'Location not confirmed'}</span><span class="small">${esc(i.matter_file)}</span></div>`;
 if(uncertain)return `${top}<h1 class="detail-title">Check the original</h1><p class="muted">${esc(i.body)} / ${date(i.meeting_at)}</p><section class="review-state"><div class="empty-symbol">${icon('book')}</div><p>We couldn’t summarize this one reliably — check the original.</p>${source(i)}</section><p class="small mt">We do not show a summary or draft without reliable source support.</p>`;
 const what=textOf(i.editorial?.what)||plain(i.card?.what_changes);
 const why=i.id==='126453'?'The parcels at 11762, 12004 and 12020 Aurora Ave N are 0.46 mi from you. The title does not say what will be built.':textOf(i.editorial?.why)||plain(i.card?.why_it_matters_to_you);
 return `${top}<div class="detail-hero"><h1 class="detail-title">${esc(title(i))}</h1><div class="row"><span class="badge neutral">${i.action==='passed'?'Passed':passed(i)?'Meeting ended':'Scheduled'}</span><span class="small">${date(i.meeting_at)}</span></div>${source(i)}</div><section class="detail-section"><h2>What changes</h2><p>${esc(what)}</p></section><section class="detail-section"><h2>Why it matters to you</h2><p>${esc(why)}</p></section>${Number.isFinite(d)?`<div class="local-map">${mapGraphic(true)}<p class="map-caption">${d.toFixed(2)} mi from your place. Schematic, not a route.</p></div>`:''}<section class="detail-section"><h2>Who decides</h2><p>${esc(i.body)}<br>${date(i.meeting_at,{hour:'numeric',minute:'2-digit'})} Pacific</p></section>${passed(i)?`<div class="notice">${icon('clock')}<span>The pre-meeting comment cutoff has passed. Follow the council’s decision.</span></div>${link(i.legistar_url,'Watch the vote and read the record')}`:`<div class="notice">${icon('clock')}<span>Comment by ${date(i.deadlines.written,{weekday:'short',hour:'numeric',minute:'2-digit'})} Pacific for distribution before the meeting.</span></div>${button('draft','Draft a comment','primary full mt','mail',`data-id="${i.id}"`)}${button('calendar','Add to calendar','secondary full mt','calendar',`data-id="${i.id}"`)}`}<section class="detail-section mt"><h2>Local context</h2>${news(i)}</section>`;
}
function news(i) {
 const valid=(i.news||[]).filter(n=>safeURL(n.url)&&plain(n.title));
 if(valid.length)return valid.slice(0,3).map(n=>`<div class="news-slot"><div>${link(n.url,n.title)}<p>${esc(plain(n.source))}</p></div></div>`).join('');
 return `<div class="news-slot">${icon('book')}<div><h3>Local reporting</h3><p>No verified article in this update.</p></div></div><div class="news-slot">${icon('search')}<div><h3>More background</h3><p>News links will appear after the next Tavily run.</p></div></div>`;
}
function records() {
 return `<div class="page-head"><p class="eyebrow">On this device</p><h1>Saved for later</h1><p class="muted">Your drafts and calendar downloads.<br>Kept for 7 days. Nothing is sent for you.</p></div>${state.saved.length?`<div class="stack">${state.saved.map(r=>{const i=item(r.id);return i?`<article class="card"><span class="badge neutral">${r.kind==='draft'?'Comment draft':'Calendar reminder'}</span><h3>${esc(title(i))}</h3><p class="small">${esc(i.matter_file)} / ${date(r.at)}</p>${button(r.kind==='draft'?'draft':'item',r.kind==='draft'?'Edit draft':'Read item','text-button','',`data-id="${i.id}"`)}</article>`:'';}).join('')}</div><div class="stack mt">${button('csv','Export records as CSV','secondary','download')}${button('print','Print or save as PDF','secondary','book')}</div>`:`<div class="empty"><div class="empty-symbol">${icon('book')}</div><h2>Nothing saved yet</h2><p class="mt">Save a comment draft or download a calendar reminder to find it here.</p>${button('home','See this week’s items','primary full mt')}</div>`}`;
}
function about() {return `<div class="page-head"><p class="eyebrow">Open by design</p><h1>How it works</h1><p class="muted">Public records in. Clear, sourced decisions out. You stay in control.</p></div><ol class="pipeline"><li><div><strong>Read the council agenda</strong><p>Seattle Legistar provides the public records.</p></div></li><li><div><strong>Find the places and topics</strong><p>NVIDIA Nemotron Nano on Nebius Token Factory extracts the details.</p></div></li><li><div><strong>Match your neighborhood</strong><p>Geocode public places and compare distance and interests.</p></div></li><li><div><strong>Explain what matters</strong><p>NVIDIA Nemotron Super on Nebius Token Factory writes the explanation.</p></div></li><li><div><strong>Add local context</strong><p>Tavily finds news, with links you can check.</p></div></li><li><div><strong>Prepare your comment</strong><p>Review the draft and send it yourself.</p></div></li></ol><div class="notice">${icon('info')}<span>${run.offline?'Last run was offline (no model calls). Read the run log for what actually happened.':'Read the run log for measured usage and failures.'}</span></div><div class="stack mt">${button('run','Run log','primary','book')}${button('help','Privacy and help','secondary','shield')}${button('offline','Use saved data offline','secondary','wifi')}</div>`;}
function runPage() {
 const models=Object.entries(run.models||{}),known=Number.isFinite(run.cost_usd);
 const rows=models.map(([name,m])=>`<tr><th scope="row">${esc(name)}</th><td>${number(m.calls)}</td><td>${number(m.prompt_tokens)}</td><td>${number(m.completion_tokens)}</td></tr>`).join('');
 return `${button('about','About','text-button back','back')}<div class="page-head"><p class="eyebrow">Pipeline transparency</p><h1>Run log</h1><p class="muted">${date(run.started||data.generated_at,{year:'numeric',hour:'numeric',minute:'2-digit'})} Pacific</p></div>${run.offline?`<div class="notice">${icon('info')}<span>Last run was offline (no model calls)</span></div>`:''}<table><caption>Latest run</caption><tbody><tr><th scope="row">Public items</th><td>${number(run.items)}</td></tr><tr><th scope="row">Nebius model calls</th><td>${run.offline?'0':models.length?number(models.reduce((n,[,m])=>n+(Number.isFinite(m.calls)?m.calls:0),0)):'Not recorded'}</td></tr><tr><th scope="row">Input tokens</th><td>${run.offline?'0':models.length?number(models.reduce((n,[,m])=>n+(Number.isFinite(m.prompt_tokens)?m.prompt_tokens:0),0)):'Not recorded'}</td></tr><tr><th scope="row">Output tokens</th><td>${run.offline?'0':models.length?number(models.reduce((n,[,m])=>n+(Number.isFinite(m.completion_tokens)?m.completion_tokens:0),0)):'Not recorded'}</td></tr><tr><th scope="row">Cost (USD)</th><td>${known?'$'+run.cost_usd.toFixed(4):'Not measured'}</td></tr><tr><th scope="row">Tavily calls</th><td>${number(run.tavily_calls)}</td></tr><tr><th scope="row">Failures</th><td>${number(Array.isArray(run.failures)?run.failures.length:0)}</td></tr></tbody></table><h2 class="mt">Models</h2><p class="muted mt">${run.offline?'NVIDIA Nemotron Nano and NVIDIA Nemotron Super are planned on Nebius Token Factory. Neither was called in this run.':'Model IDs and usage below come from the run record.'}</p>${models.length?`<div class="table-wrap"><table><caption>Measured model usage</caption><thead><tr><th>Model</th><th>Calls</th><th>Input tokens</th><th>Output tokens</th></tr></thead><tbody>${rows}</tbody></table></div>`:''}<h2 class="mt">Failures</h2><p class="muted mt">${run.failures?.length?`${run.failures.length} requests need review. Check the pipeline logs before publishing a new update.`:'No failures recorded. An offline run does not test model or search services.'}</p>`;
}
function help() {return `${button('about','About','text-button back','back')}<div class="page-head"><h1>Privacy and help</h1></div><div class="stack"><section class="card"><h2>Your place stays here</h2><p class="muted mt">No account, tracking or location permission. Choose one of two Seattle public landmarks. Other addresses are not supported yet.</p></section><section class="card"><h2>Saved for 7 days</h2><p class="muted mt">Remembering preferences is optional. Saving a draft stores it in this browser. Expired records are deleted on your next visit. Downloaded files and emails have their own retention rules.</p></section><section class="card"><h2>You send it</h2><p class="muted mt">Council Watch never sends email. If you have no email app, copy the draft and address it to council@seattle.gov. Comments become public records.</p>${link(COMMENT_URL,'Council comment instructions')}${link('https://www.seattle.gov/council/meet-the-council','Contact the council')}</section>${button('clear','Delete saved information','secondary')}</div>`;}
function results() {
 const query=search.trim().toLowerCase();const items=data.items.filter(i=>(!query||[i.matter_file,i.title,title(i)].some(t=>plain(t).toLowerCase().includes(query)))&&(filter==='all'||filter==='citywide'&&i.citywide||filter==='near'&&Number.isFinite(distance(i))));
 return `<p class="result-count" role="status">${items.length.toLocaleString('en-US')} ${items.length===1?'item':'items'}</p>${items.length?`<div class="stack">${items.map(i=>card(i)).join('')}</div>`:'<div class="empty"><h2>No matching items</h2><p class="mt">Try a bill number, a street or a different filter.</p></div>'}`;
}
function allItems() {return `${button('home','This week','text-button back','back')}<h1>All council items</h1><label class="searchbox" for="search">Search by bill number or topic<input id="search" type="search" value="${esc(search)}" placeholder="Try CB 121292 or Aurora"></label><div class="chips">${[['all','All'],['near','Nearby'],['citywide','Citywide']].map(([k,l])=>button('filter',l,'chip-button','',`data-filter="${k}" aria-pressed="${filter===k}"`)).join('')}</div><div id="results">${results()}</div>`;}
function render() {shell();const screens={onboard:onboarding,feed,detail:()=>detail(item(selected)),records,about,run:runPage,help,all:allItems};$('#content').innerHTML=(screens[view]||feed)();}
function show(v) {clearTimeout(loadingTimer);closeModal(false);view=v;render();$('#scroll-area').scrollTop=0;$('#content').focus({preventScroll:true});}
function route() {
 clearTimeout(loadingTimer);closeModal(false);scene=Number(location.hash.match(/^#scene-([1-7])$/)?.[1]||1);
 state.profile=scene===5?'rainier-beach':'aurora';view=['onboard','detail','feed','detail','feed','detail','detail'][scene-1];selected=scene===2?'126453':scene===7?'126469':'126615';
 render();$('#scroll-area').scrollTop=0;if(scene===4)openDraft(selected);
}
function go(n) {if(location.hash==='#scene-'+n)route();else location.hash='scene-'+n;}
function openModal(html,label) {
 if(!modal)returnFocus=document.activeElement;modal=label;
 $('#overlay').innerHTML=`<div class="sheet-backdrop"><section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(label)}"><div class="handle"></div>${html}</section></div>`;
 for(const id of ['scroll-area','appbar','tabbar'])$('#'+id).inert=true;
 requestAnimationFrame(()=>$('.sheet button')?.focus({preventScroll:true}));
}
function closeModal(focus=true) {$('#overlay').innerHTML='';modal='';for(const id of ['scroll-area','appbar','tabbar'])$('#'+id).inert=false;if(focus&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
function draftText(i,stance,name='') {
 const real=plain(i.drafts?.[stance]);
 if(real)return real.replaceAll('[Your name]',name.trim()||'[Your name]').replaceAll('[Your address or neighborhood]',profiles[state.profile].label);
 const positions=i.id==='126615'?{support:'I support developing recommendations for truck side guards. Please explain the expected safety benefits and how you will evaluate the results.',oppose:'I have concerns about moving forward before the costs and effects on contractors are clear. Please address those questions before adopting new requirements.',question:'How would the proposed truck side guards protect people walking or biking? What costs and implementation steps will the council consider?'}:{support:'I support the intent of this proposal. Please explain the expected benefits and how the city would evaluate its results.',oppose:'I have concerns about this proposal. Please clarify its costs and effects on residents before moving forward.',question:'What outcomes are expected from this proposal? How would the city evaluate its costs and effects on residents?'};
 return `Dear Seattle City Council,\n\nI am writing about ${i.matter_file}, ${title(i).toLowerCase()}.\n\n${positions[stance]||positions.question}\n\nPlease include my comment in the public record.\n\nThank you,\n${name.trim()||'[Your name]'}`;
}
function mailURL(i,body) {return 'mailto:council@seattle.gov?subject='+encodeURIComponent('Public comment: '+i.matter_file)+'&body='+encodeURIComponent(body);}
function openDraft(id,keep=false) {
 const i=item(id);if(!i||reviewed(i)){toast('Check the original before preparing a comment.');return;}
 selected=id;if(!keep){const d=state.drafts[id];activeDraft=d?{...d}:{name:'',stance:'question',text:draftText(i,'question')};undoText=activeDraft.text;}
 const d=activeDraft;
 openModal(`<div class="sheet-top"><div><p class="eyebrow">${esc(i.matter_file)} / Your comment</p><h2>Make it your own</h2></div>${button('close',icon('close'),'icon-button','', 'aria-label="Close draft"')}</div><p class="small">Review the facts and edit freely. You send it.</p><div class="segmented" role="group" aria-label="Choose a stance">${[['support','Support'],['oppose','Oppose'],['question','Question']].map(([key,label])=>button('stance',label,'','',`data-stance="${key}" aria-pressed="${d.stance===key}"`)).join('')}</div><label for="draft-name">Your name (optional)</label><input id="draft-name" maxlength="80" value="${esc(d.name)}" placeholder="Add your name" autocomplete="off"><label class="mt" for="draft-text">Your comment</label><textarea id="draft-text">${esc(d.text)}</textarea><div class="draft-tools">${button('undo','Undo changes','text-button')}${button('save-draft','Save draft','text-button','book')}</div><div class="sheet-actions"><a class="primary" id="email" href="${esc(mailURL(i,d.text))}">${icon('mail')}Open in email</a>${button('copy','Copy','secondary','copy')}</div><div id="draft-status" role="status"></div><p class="small">Saved drafts stay here for 7 days. Comments you send become public records.</p>${link(COMMENT_URL,'Sign up to speak by phone (opens 1 hr before)')}<p class="small">${date(i.deadlines?.remote_signup_opens,{hour:'numeric',minute:'2-digit'})} Pacific. In person: sign up by ${date(i.deadlines?.in_person_signup,{hour:'numeric',minute:'2-digit'})} Pacific.</p>`,'Draft a comment');
}
function syncDraft() {if(!$('#draft-text'))return;activeDraft.text=$('#draft-text').value;activeDraft.name=$('#draft-name').value;$('#email').href=mailURL(item(selected),activeDraft.text);}
function draftSuccess() {$('#draft-status').innerHTML=`<div class="notice mt">${icon('check')}<span>Your draft is ready. You send it.</span></div>`;}
function saveRecord(id,kind) {state.saved=state.saved.filter(r=>r.id!==id||r.kind!==kind);state.saved.unshift({id,kind,at:new Date().toISOString()});return persist(true);}
function download(name,content,type) {const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function calendar(id) {
 const i=item(id);if(!i||passed(i)){toast('The pre-meeting cutoff has passed. Check the meeting record.');return;}
 const stamp=s=>new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const clean=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 const cutoff=i.deadlines.written;
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Council Watch//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+i.id+'@councilwatch.local','DTSTAMP:'+stamp(Date.now()),'DTSTART:'+stamp(cutoff),'DTEND:'+stamp(Date.parse(cutoff)+900000),'SUMMARY:'+clean(i.matter_file+' - Send written comments'),'DESCRIPTION:'+clean('Send to council@seattle.gov before '+date(cutoff,{hour:'numeric',minute:'2-digit'})+' Pacific for distribution before the meeting. Later comments enter the public record after the meeting. '+i.agenda_url+'#page=2'),'URL:'+safeURL(i.legistar_url),'BEGIN:VALARM','TRIGGER:-PT1H','ACTION:DISPLAY','DESCRIPTION:One hour until the pre-meeting comment cutoff','END:VALARM','END:VEVENT','END:VCALENDAR'];
 const folded=lines.map(line=>{let out='',count=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(count+n>73){out+='\r\n ';count=1;}out+=c;count+=n;}return out;}).join('\r\n')+'\r\n';
 download(i.matter_file.replaceAll(' ','-')+'.ics',folded,'text/calendar;charset=utf-8');saveRecord(id,'calendar');toast('Added to your calendar');
 // The downloaded file must be opened/imported by the user's calendar app.
 const cardEl=document.querySelector(`[data-item="${id}"]`);if(cardEl&&!cardEl.querySelector('.calendar-note'))cardEl.insertAdjacentHTML('beforeend','<p class="small calendar-note">Calendar file downloaded. Open it to finish adding the reminder.</p>');
}
function connection() {$('#connection').innerHTML=offlineOverride||!navigator.onLine?`<div class="notice">${icon('wifi')}<div>You’re offline — showing the saved update from ${date(data.generated_at)}.${button('reconnect','Try again','text-button')}</div></div>`:'';}
function showProfile() {openModal(`<div class="sheet-top"><h2>Switch place</h2>${button('close',icon('close'),'icon-button','','aria-label="Close places"')}</div><p class="muted">A public landmark is enough. Your place stays on this device.</p><div class="stack mt">${Object.entries(profiles).map(([id,p])=>button('set-profile',esc(p.label),'secondary','pin',`data-profile="${id}"`)).join('')}</div>`,'Switch place');}
function exportCSV() {const rows=[['Bill number','Item','Record type','Saved at (Pacific)','Source'],...state.saved.map(r=>{const i=item(r.id);return [plain(i?.matter_file),title(i),r.kind==='draft'?'Comment draft':'Calendar reminder',date(r.at,{year:'numeric',hour:'numeric',minute:'2-digit'}),safeURL(i?.agenda_url)];})];const cell=v=>'"'+plain(v).replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';download('council-watch-records.csv','\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8');toast('Records downloaded.');}
document.addEventListener('submit',e=>{
 if(e.target.id!=='onboard')return;e.preventDefault();const value=$('#location').value.trim().toLowerCase();const match=Object.entries(profiles).find(([,p])=>[p.label.toLowerCase(),p.short.toLowerCase()].includes(value));
 if(!match){$('#location-error').textContent='We support two Seattle landmarks right now. Choose Bitter Lake Playfield or Rainier Beach from the list.';$('#location').setAttribute('aria-invalid','true');$('#location').focus();return;}
 state.profile=match[0];state.consent=$('#consent').checked;persist();view='feed';shell();$('#content').innerHTML='<div role="status" aria-label="Finding your items"><div class="skeleton"></div><div class="skeleton tall"></div></div>';
 loadingTimer=setTimeout(()=>{render();$('#scroll-area').scrollTop=0;toast('Your weekly update is ready.');},180);
});
document.addEventListener('input',e=>{
 if(e.target.id==='search'){search=e.target.value;$('#results').innerHTML=results();}
 if(e.target.id==='draft-text')syncDraft();
 if(e.target.id==='draft-name'){
  const old=activeDraft.name.trim()||'[Your name]',next=e.target.value.trim()||'[Your name]',area=$('#draft-text');
  if(area.value.includes('[Your name]'))area.value=area.value.replaceAll('[Your name]',next);
  else if(area.value.endsWith(old))area.value=area.value.slice(0,-old.length)+next;
  syncDraft();
 }
});
document.addEventListener('focusin',e=>{if(e.target.id==='draft-text')undoText=e.target.value;});
document.addEventListener('click',async e=>{
 if(e.target.closest('#email')){syncDraft();draftSuccess();return;}
 const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action,id=b.dataset.id||selected;
 switch(action){
 case 'next':go(scene===7?1:scene+1);break;
 case 'scene':go(Number(b.dataset.scene));break;
 case 'home':show('feed');break;
 case 'item':selected=id;show('detail');break;
 case 'records':case 'about':case 'run':case 'help':case 'all':show(action);break;
 case 'topic':{const key=b.dataset.topic;state.interests=state.interests.includes(key)?state.interests.filter(t=>t!==key):[...state.interests,key];b.setAttribute('aria-pressed',String(state.interests.includes(key)));break;}
 case 'filter':filter=b.dataset.filter;render();break;
 case 'profile':showProfile();break;
 case 'set-profile':state.profile=b.dataset.profile;persist();show('feed');break;
 case 'switch-back':state.profile='aurora';persist();show('feed');break;
 case 'draft':openDraft(id);break;
 case 'close':closeModal();break;
 case 'stance':syncDraft();undoText=activeDraft.text;activeDraft.stance=b.dataset.stance;activeDraft.text=draftText(item(selected),activeDraft.stance,activeDraft.name);openDraft(selected,true);break;
 case 'undo':{const current=$('#draft-text').value;$('#draft-text').value=undoText||draftText(item(selected),activeDraft.stance,activeDraft.name);undoText=current;syncDraft();toast('Previous text restored.');break;}
 case 'save-draft':syncDraft();state.drafts[selected]={...activeDraft};if(saveRecord(selected,'draft')){draftSuccess();toast('Draft saved on this device for 7 days.');}break;
 case 'copy':{syncDraft();let copied=false;try{await navigator.clipboard.writeText(activeDraft.text);copied=true;}catch{$('#draft-text').focus();$('#draft-text').select();try{copied=document.execCommand('copy');}catch{}}if(copied){draftSuccess();toast('Draft copied.');}else toast('Text selected. Use your device’s Copy command.');break;}
 case 'calendar':calendar(id);break;
 case 'csv':exportCSV();break;
 case 'print':window.print();break;
 case 'offline':offlineOverride=true;show('feed');toast('Using the saved update. Drafts can still be saved.');break;
 case 'reconnect':offlineOverride=false;connection();if(navigator.onLine){await refreshData();toast('Connection checked. Your saved drafts are here.');}else toast('Still offline. Your saved work stays here.');break;
 case 'clear':openModal(`<div class="sheet-top"><h2>Delete saved information?</h2>${button('close',icon('close'),'icon-button','','aria-label="Close"')}</div><p class="muted">Remove preferences, drafts and reminder records from this browser. Downloaded files will stay on your device.</p><div class="sheet-actions">${button('confirm-clear','Delete','primary')}${button('close','Keep it','secondary')}</div>`,'Delete saved information');break;
 case 'confirm-clear':try{localStorage.removeItem(STORAGE);localStorage.removeItem('council-watch-v1');}catch{}state=defaults();show('records');toast('Saved information deleted.');break;
 }
});
document.addEventListener('keydown',e=>{
 if(!modal)return;if(e.key==='Escape'){closeModal();return;}
 if(e.key==='Tab'){const targets=[...$('.sheet').querySelectorAll('button,a,input,textarea')].filter(el=>!el.disabled),first=targets[0],last=targets[targets.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
async function refreshData() {
 if(location.protocol==='file:'||!navigator.onLine||offlineOverride)return;
 try {
  const [w,r]=await Promise.all([fetch('data/week.json').then(res=>res.ok?res.json():fetch('data/week.sample.json').then(x=>x.json())),fetch('data/run.json').then(res=>res.ok?res.json():run)]);
  if(Array.isArray(w?.items)&&w.matches){data=w;if(!('sample'in data))data.sample=!!data.offline;}
  if(r&&typeof r==='object'&&!Array.isArray(r))run=r;
  if(!modal&&!['onboard','all'].includes(view))render();else footer();
 } catch { /* The bundled file snapshot remains usable when fetch fails. */ }
}
window.addEventListener('hashchange',route);
window.addEventListener('pageshow',e=>{if(e.persisted)route();});
window.addEventListener('offline',connection);
window.addEventListener('online',()=>{offlineOverride=false;connection();refreshData();});
window.addEventListener('storage',e=>{if(e.key===STORAGE){state=defaults();readState();if(view==='records')render();}});
route();refreshData();
if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>toast('Offline setup could not finish. You can still download this app’s files.'));
