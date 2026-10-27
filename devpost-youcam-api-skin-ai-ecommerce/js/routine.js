(function(root){
  'use strict';
  function build(cart){
    const order=['cleanser','toner','serum','moisturizer','sunscreen'];
    const sort=a=>a.sort((x,y)=>order.indexOf(x.type)-order.indexOf(y.type));
    const ret=p=>p.inci.some(x=>/^(Retinol|Tretinoin)$/i.test(x));
    const acid=p=>p.acid>=5;
    const care=cart.filter(p=>order.includes(p.type));
    const alternate=care.some(ret)&&care.some(acid);
    return {am:sort(care.filter(p=>!ret(p)&&!acid(p))),pm:sort(care.filter(p=>p.type!=='sunscreen'&&(!alternate||!acid(p)))),alternate:alternate?sort(care.filter(p=>p.type!=='sunscreen'&&!ret(p))):[],needsSPF:care.some(p=>ret(p)||acid(p))&&!care.some(p=>p.type==='sunscreen')};
  }
  root.CartRoutine={build};
})(globalThis);
