/* CIEDE2000, Sharma et al. 2005. Local, dependency-free implementation. */
(function (root) {
  'use strict';
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;
  function lab(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Invalid color');
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v > .04045 ? ((v + .055) / 1.055) ** 2.4 : v / 12.92);
    const [r, g, b] = c;
    const xyz = [(r*.4124564+g*.3575761+b*.1804375)/.95047, r*.2126729+g*.7151522+b*.0721750, (r*.0193339+g*.119192+b*.9503041)/1.08883].map(v => v > 216/24389 ? Math.cbrt(v) : v*841/108 + 4/29);
    return [116*xyz[1]-16, 500*(xyz[0]-xyz[1]), 200*(xyz[1]-xyz[2])];
  }
  function deltaE(a, b) {
    const [L1,a1,b1]=a,[L2,a2,b2]=b;
    const C1=Math.hypot(a1,b1), C2=Math.hypot(a2,b2), C=(C1+C2)/2;
    const G=.5*(1-Math.sqrt(C**7/(C**7+25**7)));
    const A1=(1+G)*a1,A2=(1+G)*a2,c1=Math.hypot(A1,b1),c2=Math.hypot(A2,b2);
    const hue=(x,y)=>(deg(Math.atan2(y,x))+360)%360;
    const h1=hue(A1,b1),h2=hue(A2,b2),dL=L2-L1,dC=c2-c1;
    let dh=h2-h1;
    if(c1*c2===0) dh=0; else if(dh>180) dh-=360; else if(dh < -180) dh+=360;
    const dH=2*Math.sqrt(c1*c2)*Math.sin(rad(dh/2)),l=(L1+L2)/2,c=(c1+c2)/2;
    let h=h1+h2;
    if(c1*c2!==0) h=Math.abs(h1-h2)<=180?h/2:h<360?(h+360)/2:(h-360)/2;
    const T=1-.17*Math.cos(rad(h-30))+.24*Math.cos(rad(2*h))+.32*Math.cos(rad(3*h+6))-.20*Math.cos(rad(4*h-63));
    const sl=1+.015*(l-50)**2/Math.sqrt(20+(l-50)**2),sc=1+.045*c,sh=1+.015*c*T;
    const rt=-2*Math.sqrt(c**7/(c**7+25**7))*Math.sin(rad(60*Math.exp(-(((h-275)/25)**2))));
    return Math.sqrt((dL/sl)**2+(dC/sc)**2+(dH/sh)**2+rt*(dC/sc)*(dH/sh));
  }
  function compare(skin, shade) { const a=lab(skin),b=lab(shade),distance=deltaE(a,b); return {distance,level:distance<2?'match':distance<=5?'close':'different',direction:b[0]>a[0]?'lighter':'darker',undertone:b[2]>a[2]?'warmer':'cooler'}; }
  root.CartColor={lab,deltaE,compare};
})(globalThis);
