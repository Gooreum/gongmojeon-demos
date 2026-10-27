/* Cart Check YouCam proxy. API keys exist only in Worker secrets. */
const ORIGIN = 'https://gooreum.github.io';
const API = 'https://yce-api-01.makeupar.com';
const PREFIX = '/s2s/v2.0/';
const CORS = {'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods':'GET, POST, OPTIONS', 'Access-Control-Allow-Headers':'Content-Type, X-Cart-Session', 'Vary':'Origin', 'Cache-Control':'no-store'};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{...CORS,'Content-Type':'application/json'}});
const kinds=['skin-analysis','skin-tone-analysis','makeup-vto'];
export function allowedPath(path,method){
  if(path===PREFIX+'file')return method==='POST';
  const match=path.match(/^\/s2s\/v2\.0\/task\/(skin-analysis|skin-tone-analysis|makeup-vto)(?:\/([^/]+))?$/);
  return !!match&&(match[2]?method==='GET':method==='POST');
}
export function sanitize(path,body){
  if(path===PREFIX+'file'){
    const f=body.files?.[0];
    if(body.files?.length!==1||!f||!['image/jpeg','image/png'].includes(f.content_type)||!Number.isInteger(f.file_size)||f.file_size<1||f.file_size>=10*1024*1024)throw new Error('invalid_file');
    return {files:[{content_type:f.content_type,file_size:f.file_size,file_name:f.content_type==='image/png'?'selfie.png':'selfie.jpg'}]};
  }
  if(typeof body.src_file_id!=='string'||body.src_file_id.length>512)throw new Error('invalid_file');
  const common={src_file_id:body.src_file_id};
  if(path.endsWith('skin-analysis'))return {...common,dst_actions:['oiliness','redness','moisture','acne'],format:'json'};
  if(path.endsWith('skin-tone-analysis'))return {...common,face_angle_strictness_level:'high'};
  const color=body.effects?.[0]?.palettes?.[0]?.color;
  if(!/^#[a-f\d]{6}$/i.test(color||''))throw new Error('invalid_color');
  return {...common,effects:[{category:'foundation',palettes:[{color,colorIntensity:50,glowIntensity:20,coverageIntensity:50}]}],version:'1.0'};
}
export default {
  async fetch(request,env){
    if(request.headers.get('Origin')!==ORIGIN)return new Response('Forbidden',{status:403});
    const path=new URL(request.url).pathname;
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
    if(!allowedPath(path,request.method))return json({reason:'path_not_allowed'},403);
    if(!env.YOUCAM_API_KEY||!env.CHECK_GATE||!env.DAILY_COUNTS)return json({reason:'unavailable'},503);
    // A single coordinator is appropriate for this deliberately tiny daily budget.
    // KV is a reporting mirror; atomic DO storage enforces the cap under concurrency.
    return env.CHECK_GATE.get(env.CHECK_GATE.idFromName('cart-check-budget')).fetch(request);
  }
};
export class CheckGate {
  constructor(ctx,env){this.ctx=ctx;this.env=env;}
  async fetch(request){
    const path=new URL(request.url).pathname,day=new Date().toISOString().slice(0,10),upload=path===PREFIX+'file';
    let body,session=request.headers.get('X-Cart-Session'),kind=path.slice(PREFIX.length).split('/')[1];
    if(request.method==='POST'){
      const text=await request.text();if(text.length>8192)return json({reason:'invalid_body'},400);
      try{body=sanitize(path,JSON.parse(text));}catch{return json({reason:'invalid_body'},400);}
    }
    if(upload){
      const cap=Math.max(1,Math.min(5,Number(this.env.DAILY_CAP)||5));
      // TOTAL_CAP keeps the whole judging period inside the free API unit balance.
      const total=Math.max(1,Math.min(22,Number(this.env.TOTAL_CAP)||22));
      const count=await this.ctx.storage.transaction(async txn=>{const n=await txn.get('day:'+day)||0,all=await txn.get('total')||0;if(n>=cap||all>=total)return -1;await txn.put('day:'+day,n+1);await txn.put('total',all+1);return n+1;});
      if(count<0)return json({reason:'daily_cap'},429);
      this.ctx.waitUntil(this.env.DAILY_COUNTS.put(day,String(count),{expirationTtl:172800}));
      session=crypto.randomUUID();
    }else{
      if(!session||!kinds.includes(kind))return json({reason:'unauthorized'},403);
      const allowed=await this.ctx.storage.transaction(async txn=>{
        const state=await txn.get('session:'+session);
        if(!state||state.expires<Date.now())return false;
        if(request.method==='GET')return state.tasks.includes(path);
        if(body.src_file_id!==state.fileId)return false;
        const limit=kind==='makeup-vto'?3:1;
        if((state.counts[kind]||0)>=limit)return false;
        state.counts[kind]=(state.counts[kind]||0)+1;await txn.put('session:'+session,state);return true;
      });
      if(!allowed)return json({reason:'session_limit'},429);
    }
    let response,result;
    try{
      response=await fetch(API+path,{method:request.method,headers:{Authorization:'Bearer '+this.env.YOUCAM_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(55000),redirect:'error'});
      result=await response.json();
    }catch{return json({reason:'timeout'},504);}
    if(!response.ok)return json({reason:response.status===401?'unauthorized':result.error_code||'upstream_error'},response.status);
    if(upload){
      const file=result.data?.files?.[0];if(!file?.file_id||!file.requests?.[0]?.url)return json({reason:'bad_response'},502);
      await this.ctx.storage.put('session:'+session,{fileId:file.file_id,expires:Date.now()+3600000,counts:{},tasks:[]});
      await this.ctx.storage.setAlarm(Date.now()+3600000);
      // This session token limits each upload to two analyses and three try-ons.
      return json({...result,cart_session:session});
    }
    if(request.method==='POST'&&result.data?.task_id){
      await this.ctx.storage.transaction(async txn=>{const state=await txn.get('session:'+session);if(state){state.tasks.push(PREFIX+'task/'+kind+'/'+encodeURIComponent(result.data.task_id));await txn.put('session:'+session,state);}});
    }
    return json(result);
  }
  async alarm(){
    const sessions=await this.ctx.storage.list({prefix:'session:'});let active=false;
    for(const [key,value] of sessions){if(value.expires<Date.now())await this.ctx.storage.delete(key);else active=true;}
    const days=await this.ctx.storage.list({prefix:'day:'});for(const [key] of days)if(Date.parse(key.slice(4))<Date.now()-3*86400000)await this.ctx.storage.delete(key);
    if(active)await this.ctx.storage.setAlarm(Date.now()+3600000);
  }
}
