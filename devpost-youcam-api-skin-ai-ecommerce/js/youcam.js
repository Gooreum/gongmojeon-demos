(function(root){
  'use strict';
  const C=root.CART_CONFIG;
  let shopper='mina',mode='recorded',session='';
  const errorMessages={
    daily_cap:['실시간 점검 한도를 모두 사용했어요. 하루 5회 또는 심사 기간 전체 22회까지 가능해요.','Live checks are used up: 5 per UTC day or 22 across the judging period.'],
    total_cap:['심사 기간의 실시간 점검을 모두 사용했어요.','Live checks for the judging period are used up.'],
    error_src_face_too_small:['얼굴이 사진 너비의 60%를 넘게 다시 찍어 주세요.','Retake with your face covering more than 60% of the image width.'],
    error_src_face_not_found:['얼굴을 찾지 못했어요. 정면에서 다시 찍어 주세요.','No face found. Retake a front-facing photo.'],
    timeout:['60초 안에 분석을 마치지 못했어요.','Analysis did not finish within 60 seconds.'],
    unavailable:['실시간 연결을 준비 중이에요. 가상 고객으로 계속할 수 있어요.','Live checks are not connected yet. Continue with a sample shopper.'],
    offline:['인터넷 연결을 확인해 주세요. 사진은 보내지 않았어요.','You’re offline. Your photo has not been sent.'],
    error_face_not_found:['얼굴을 찾지 못했어요. 정면에서 다시 찍어 주세요.','No face found. Retake a front-facing photo.'],
    error_face_position_invalid:['얼굴 전체가 보이도록 정면에서 다시 찍어 주세요.','Keep your whole face centered and facing forward.'],
    error_face_position_too_small:['얼굴이 작아요. 카메라 가까이 와 주세요.','Move closer to the camera.'],
    error_face_not_forward_facing:['얼굴을 정면으로 돌려 주세요.','Look straight at the camera.'],
    InvalidParameters:['사진을 처리하지 못했어요. 다른 사진으로 다시 시도해 주세요.','This photo could not be processed. Try another photo.'],
    unauthorized:['실시간 연결을 확인하고 있어요. 가상 고객으로 계속해 주세요.','Live checks need attention. Continue with a sample shopper.'],
    network:['연결이 끊겼어요. 다시 시도하거나 가상 고객으로 계속해 주세요.','Connection interrupted. Retry or continue with a sample shopper.'],
    bad_response:['분석 결과가 불완전해요. 다시 시도해 주세요.','The analysis result is incomplete. Please retry.'],
    no_fixture:['이 고객의 색상 착용 사진은 아직 없어요. 미나의 사진으로 비교해 주세요.','Try-on images for this shopper are not available. Compare shades with Mina.']
  };
  function fail(code){const e=new Error(code);e.code=code;return e;}
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  async function jsonFetch(url,options={},deadline=Date.now()+C.TIMEOUT_MS){
    const controller=new AbortController(),remaining=deadline-Date.now();if(remaining<=0)throw fail('timeout');
    const timer=setTimeout(()=>controller.abort(),remaining);
    try{const response=await fetch(url,{...options,signal:controller.signal});let body;try{body=await response.json();}catch{throw fail('bad_response');}
      if(!response.ok)throw fail(body.reason||body.error_code||(response.status===401?'unauthorized':'network'));return body;
    }catch(e){if(e.name==='AbortError')throw fail('timeout');if(e.code)throw e;throw fail('network');}finally{clearTimeout(timer);}
  }
  function url(path){if(!C.PROXY_URL)throw fail('unavailable');return C.PROXY_URL.replace(/\/$/,'')+path;}
  function configure(person,next='recorded'){shopper=person;mode=next;session='';}
  async function fixture(kind){await delay(650);const key=shopper+'-'+kind;
    if(location.protocol==='file:'){const result=root.CART_DATA.responses[key];if(!result)throw fail('no_fixture');return structuredClone(result);}
    try{return await jsonFetch('data/responses/'+key+'.json');}catch(e){if(!root.CART_DATA.responses[key])throw fail('no_fixture');return structuredClone(root.CART_DATA.responses[key]);}
  }
  async function uploadSelfie(blob){
    if(mode==='recorded'){await delay(650);return 'recorded:'+shopper;}
    if(C.MODE!=='live'||!C.PROXY_URL)throw fail('unavailable');if(!navigator.onLine)throw fail('offline');
    const deadline=Date.now()+C.TIMEOUT_MS;
    const body=await jsonFetch(url('/s2s/v2.0/file'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({files:[{content_type:blob.type,file_name:'selfie.'+(blob.type==='image/png'?'png':'jpg'),file_size:blob.size}]})},deadline);
    const file=body.data?.files?.[0],request=file?.requests?.[0];session=body.cart_session||'';
    if(!file?.file_id||!request?.url)throw fail('bad_response');
    const target=new URL(request.url);if(target.protocol!=='https:')throw fail('bad_response');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.max(1,deadline-Date.now()));
    try{const headers={...request.headers};delete headers['Content-Length'];delete headers['content-length'];
      const r=await fetch(target.href,{method:'PUT',headers,body:blob,signal:controller.signal});if(!r.ok)throw fail('network');
    }catch(e){if(e.name==='AbortError')throw fail('timeout');throw fail('network');}finally{clearTimeout(timer);}
    return file.file_id;
  }
  async function task(kind,payload){
    const deadline=Date.now()+C.TIMEOUT_MS;
    const headers={'Content-Type':'application/json','X-Cart-Session':session};
    const created=await jsonFetch(url('/s2s/v2.0/task/'+kind),{method:'POST',headers,body:JSON.stringify(payload)},deadline);
    if(!created.data?.task_id)throw fail('bad_response');
    while(Date.now()<deadline){await delay(Math.min(C.POLL_MS,Math.max(0,deadline-Date.now())));
      const result=await jsonFetch(url('/s2s/v2.0/task/'+kind+'/'+encodeURIComponent(created.data.task_id)),{headers:{'X-Cart-Session':session}},deadline);
      if(result.data?.task_status==='success')return result;
      if(result.data?.task_status==='error')throw fail(result.data.error_code||result.data.error||result.data.failure_reason||'bad_response');
    }throw fail('timeout');
  }
  const analyzeSkin=id=>mode==='recorded'?fixture('skin-analysis'):task('skin-analysis',{src_file_id:id,dst_actions:['oiliness','redness','moisture','acne'],format:'json'});
  const analyzeTone=id=>mode==='recorded'?fixture('skin-tone'):task('skin-tone-analysis',{src_file_id:id,face_angle_strictness_level:'high'});
  const tryFoundation=(id,hex)=>{
    if(mode==='recorded'){const product=root.CART_DATA.products.find(p=>p.hex===hex);return fixture('makeup-vto-'+(product?.id||'missing'));}
    return task('makeup-vto',{src_file_id:id,effects:[{category:'foundation',palettes:[{color:hex,colorIntensity:50,glowIntensity:20,coverageIntensity:50}]}],version:'1.0'});
  };
  function parseSkin(response){const output=response.data?.results?.output;if(!Array.isArray(output))throw fail('bad_response');const scores={};for(const item of output){if(['oiliness','redness','moisture','acne'].includes(item.type)&&Number.isFinite(item.raw_score)&&item.raw_score>=1&&item.raw_score<=100)scores[item.type]=item.raw_score;}if(Object.keys(scores).length!==4)throw fail('bad_response');return scores;}
  function parseTone(response){const value=response.data?.results?.color?.skin_color;if(!/^#[a-f\d]{6}$/i.test(value||''))throw fail('bad_response');return value;}
  function parseVTO(response){const r=response.data?.results;const value=r?.url||r?.[0]?.download_url;if(typeof value!=='string'||!(/^(https:\/\/|img\/vto-real\/)/.test(value)))throw fail('bad_response');return value;}
  root.YouCam={configure,uploadSelfie,analyzeSkin,analyzeTone,tryFoundation,parseSkin,parseTone,parseVTO,errorMessages};
})(globalThis);
