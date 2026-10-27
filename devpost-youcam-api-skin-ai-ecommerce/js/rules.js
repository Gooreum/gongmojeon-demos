(function(root){
  'use strict';
  // Product preferences calibrated on three recordings, not clinical thresholds.
  const thresholds=Object.freeze({oiliness:55,moisture:45,redness:65});
  const valid=n=>Number.isFinite(n)&&n>=1&&n<=100;
  const near=(key,value)=>valid(value)&&Math.abs(value-thresholds[key])<=5;
  function metricState(key,values){
    const value=values[key];
    if(!valid(value))return 'unavailable';
    if(near(key,value))return 'borderline';
    if(value<(thresholds[key]||0))return ({oiliness:'highOil',moisture:'dry',redness:'highRedness'})[key];
    return 'balanced';
  }
  function evaluate(cart,scores,tone,products,rules){
    const hasRet=cart.some(p=>p.inci.some(i=>/^(Retinol|Tretinoin)$/i.test(i)));
    const hasAcid=cart.some(p=>p.acid>=5);
    return cart.map(p=>{
      let status='keep',reason='compatible',rule='',metric='',alternatives=[];
      if(p.type==='foundation'){
        if(!/^#[a-f0-9]{6}$/i.test(tone||'')){status='borderline';reason='missing';}
        else if(root.CartColor.compare(tone,p.hex).distance>5){
          alternatives=products.filter(x=>x.type==='foundation'&&x.id!==p.id&&root.CartColor.compare(tone,x.hex).distance<=5)
            .sort((a,b)=>root.CartColor.compare(tone,a.hex).distance-root.CartColor.compare(tone,b.hex).distance).slice(0,2).map(x=>x.id);
          status=alternatives.length?'swap':'borderline';reason=alternatives.length?'shade':'noShade';
        }
      }else if(!['oiliness','redness','moisture','acne'].every(k=>valid(scores[k]))){status='borderline';reason='missing';}
      else if(p.inci.includes('Tretinoin')&&cart.some(x=>x.inci.includes('Benzoyl Peroxide'))){status='borderline';reason='prescription';rule='bp-tretinoin';}
      else if((p.fragrance||p.acid>=5||p.inci.includes('Retinol'))&&near('redness',scores.redness)){status='borderline';reason='borderline';metric='redness';}
      else if(scores.redness<65&&(p.fragrance||p.acid>=5||p.inci.includes('Retinol'))){status='swap';reason='redness';rule='gentle';metric='redness';alternatives=[p.type==='toner'?'hydra-toner':p.type==='serum'?'calm-serum':'gentle-cream'];}
      else if(hasRet&&p.acid>=5){status='remove';reason='conflict';rule='retinol-acid';}
      else if(p.texture==='rich'&&p.type==='moisturizer'&&near('oiliness',scores.oiliness)){status='borderline';reason='borderline';metric='oiliness';}
      else if(p.texture==='rich'&&p.type==='moisturizer'&&scores.oiliness<55){status='swap';reason='oiliness';rule='light';metric='oiliness';alternatives=['gel-cream'];}
      else if(p.alcoholHigh&&near('moisture',scores.moisture)){status='borderline';reason='borderline';metric='moisture';}
      else if(p.alcoholHigh&&scores.moisture<45){status='swap';reason='dry';rule='dry-alcohol';metric='moisture';alternatives=['hydra-toner'];}
      const conflict=hasRet&&hasAcid&&(p.acid>=5||p.inci.includes('Retinol'));
      if(conflict&&!rule)rule='retinol-acid';
      return {id:p.id,status,reason,rule,metric,alternatives:alternatives.filter(id=>products.some(x=>x.id===id)),conflict,source:rules.find(r=>r.id===rule)?.source||''};
    });
  }
  root.CartRules={evaluate,metricState,thresholds};
})(globalThis);
