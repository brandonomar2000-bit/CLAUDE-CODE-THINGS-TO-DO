(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const TAU=Math.PI*2;
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255];}
function rgba(h,a){const[r,g,b]=hex2rgb(h);return`rgba(${r},${g},${b},${a})`;}
function tok(el){const cs=getComputedStyle(el),g=n=>cs.getPropertyValue(n).trim();return{paper:g('--paper'),card:g('--card'),ink:g('--ink'),ink2:g('--ink2'),rule:g('--rule'),a1:g('--art1'),a2:g('--art2'),a3:g('--art3')};}
function fit(cv,maxd=2){const d=Math.min(maxd,devicePixelRatio||1),w=cv.clientWidth,h=cv.clientHeight;const W=Math.max(1,Math.round(w*d)),H=Math.max(1,Math.round(h*d));if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);return[c,w,h];}
const sup=n=>String(n).split('').map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join('');

/* ---------- toast / copy ---------- */
let toastT;
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2200);}
function copy(text,btn){
  const ok=()=>{toast('Copiado. Pégalo en Claude.');if(btn){const o=btn.textContent;btn.textContent='Copiado';setTimeout(()=>btn.textContent=o,1600);}};
  const fail=()=>{const m=$('#modal'),ta=$('#modalTa');ta.value=text;m.hidden=false;ta.focus();ta.select();};
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(ok,fail);}else fail();}catch(e){fail();}
}
$('#modalX').addEventListener('click',()=>$('#modal').hidden=true);

/* ---------- single RAF loop with visibility ---------- */
const tasks=[];
const io=new IntersectionObserver(es=>es.forEach(e=>{const T=e.target.__task;if(T){T.vis=e.isIntersecting;T.dirty=true;}}),{rootMargin:'120px'});
function addTask(el,fn,opts={}){const T={el,fn,vis:false,dirty:true,anim:!!opts.anim};el.__task=T;tasks.push(T);io.observe(el);return T;}
const t0=performance.now();
function frame(now){const t=(now-t0)/1000;for(const T of tasks){if(!T.vis)continue;if(RM&&!T.dirty&&!T.anim)continue;T.dirty=false;try{T.fn(t);}catch(err){console.error(err);T.vis=false;}}requestAnimationFrame(frame);}

/* ---------- background engine ---------- */
const BGS=[];
function bg(sec,init,mode){
  const wrap=document.createElement('div');wrap.className='bgwrap';const cv=document.createElement('canvas');cv.className='bg';cv.setAttribute('aria-hidden','true');wrap.appendChild(cv);sec.prepend(wrap);
  const S={sec,cv,ctx:cv.getContext('2d'),p:0,mx:-9999,my:-9999,taps:[],t:0,w:0,h:0,k:tok(sec),mode};
  const draw=init(S);
  S.T=addTask(wrap,t=>{S.t=t;const r=sec.getBoundingClientRect();S.p=mode==='top'?clamp(-r.top/r.height,0,1):clamp((innerHeight*.5-r.top)/r.height,0,1);
    const cr=cv.getBoundingClientRect();const d=Math.min(1.5,devicePixelRatio||1);const W=Math.round(cr.width*d),H=Math.round(cr.height*d);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}S.w=cr.width;S.h=cr.height;S.ctx.setTransform(d,0,0,d,0,0);S.taps=S.taps.filter(tp=>t-tp.t<4);draw(t);});
  sec.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,select,textarea,a,canvas:not(.bg),.win,.eld,.flip,.pout'))return;const cr=cv.getBoundingClientRect();S.taps.push({x:e.clientX-cr.left,y:e.clientY-cr.top,t:S.t});S.onTap&&S.onTap(e.clientX-cr.left,e.clientY-cr.top);S.T.dirty=true;},{passive:true});
  BGS.push(S);return S;
}
addEventListener('pointermove',e=>{for(const S of BGS){if(!S.T.vis)continue;const r=S.cv.getBoundingClientRect();S.mx=e.clientX-r.left;S.my=e.clientY-r.top;S.T.dirty=true;}},{passive:true});
addEventListener('scroll',()=>{for(const S of BGS)if(S.T.vis)S.T.dirty=true;},{passive:true});

/* ================= MASCOT ================= */
const HATS={
antena:`<line x1="0" y1="2" x2="0" y2="-24" stroke="#6E7A93" stroke-width="3"/><circle class="m-blink" cx="0" cy="-29" r="6.5" fill="#FF7A1A" stroke="#FFC94A" stroke-width="2"/>`,
casco:`<path d="M-48 2 Q-48 -7 -38 -7 L38 -7 Q48 -7 48 2 Z" fill="#E5A800"/><path d="M-34 -6 Q-35 -46 0 -48 Q35 -46 34 -6 Z" fill="#FFD23F" stroke="#C48F00" stroke-width="2"/><rect x="-6" y="-47" width="12" height="41" rx="5" fill="#FFE27A"/><path d="M-18 -18 L-12 -30 L-6 -18 Z" fill="#C48F00"/><path d="M-26 -36 Q-20 -42 -12 -44" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/>`,
quirurgico:`<path d="M-40 0 C-50 -32 -22 -52 0 -50 C24 -52 50 -32 40 0 Z" fill="#5BB8E8" stroke="#2F86B8" stroke-width="2"/><circle cx="-22" cy="-26" r="2.5" fill="#fff" opacity=".5"/><circle cx="18" cy="-36" r="2.5" fill="#fff" opacity=".5"/><circle cx="26" cy="-18" r="2.5" fill="#fff" opacity=".5"/><circle cx="-8" cy="-42" r="2.5" fill="#fff" opacity=".5"/><rect x="-43" y="-7" width="86" height="10" rx="5" fill="#3E9ED0"/><path d="M41 -3 q16 6 11 22 M44 -3 q20 2 20 16" stroke="#3E9ED0" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="0" cy="-25" r="9" fill="#fff"/><path d="M-2.5 -32h5v4.5h4.5v5h-4.5v4.5h-5v-4.5h-4.5v-5h4.5z" fill="#F0484E"/>`,
copa:`<ellipse cx="0" cy="-2" rx="46" ry="8" fill="#14141A"/><path d="M-28 -4 L-25 -64 Q0 -69 25 -64 L28 -4 Z" fill="#22222B"/><rect x="-27" y="-20" width="54" height="11" fill="#E8B04B"/><path d="M-18 -58 L-16 -26" stroke="#fff" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/><circle cx="34" cy="10" r="9" fill="none" stroke="#E8B04B" stroke-width="2.5"/><path d="M43 12 q8 10 2 26" stroke="#E8B04B" stroke-width="1.5" fill="none"/>`,
boina:`<g transform="rotate(30) translate(18 -54)"><rect x="0" y="0" width="5" height="44" rx="2.5" fill="#C9874A"/><rect x="-.5" y="-4" width="6" height="7" fill="#B0B6C4"/><path d="M-1 -4 L6 -4 L4 -16 Q2.5 -21 1 -16 Z" fill="#2F5BFF"/></g><path d="M-46 -4 C-54 -32 -10 -44 18 -40 C48 -36 58 -16 42 -4 Z" fill="#FF2E7E"/><path d="M-40 -3 Q0 6 40 -3" stroke="#C81F63" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="-1" y="-50" width="4" height="12" rx="2" fill="#C81F63"/><circle cx="-22" cy="-24" r="3" fill="#FFB000"/><circle cx="-10" cy="-30" r="2" fill="#2F5BFF"/>`,
birrete:`<path d="M-26 0 L-26 -16 Q0 -22 26 -16 L26 0 Q0 6 -26 0 Z" fill="#1B1640"/><path d="M-54 -24 L0 -42 L54 -24 L0 -6 Z" fill="#2B2463" stroke="#463D9E" stroke-width="2"/><circle cx="0" cy="-24" r="3.5" fill="#FFC94A"/><path d="M0 -24 Q32 -20 40 -14 L40 8" stroke="#FFC94A" stroke-width="2.5" fill="none"/><path d="M36 6 h8 l2 14 h-12z" fill="#FFC94A"/>`,
chef:`<rect x="-27" y="-24" width="54" height="24" rx="4" fill="#fff" stroke="#D9D4E8" stroke-width="2"/><path d="M-30 -22 C-50 -30 -40 -64 -18 -56 C-14 -80 16 -80 20 -56 C42 -64 50 -30 30 -22 Z" fill="#fff" stroke="#D9D4E8" stroke-width="2"/><path d="M-12 -22 V-6 M0 -22 V-6 M12 -22 V-6" stroke="#E6E1F2" stroke-width="2"/>`,
fiesta:`<path d="M-26 0 L0 -68 L26 0 Z" fill="#6B4EFF"/><circle cx="-8" cy="-14" r="4" fill="#FFE14D"/><circle cx="10" cy="-24" r="4" fill="#3FE0C5"/><circle cx="-2" cy="-38" r="3.5" fill="#FF2E7E"/><circle cx="4" cy="-52" r="3" fill="#FFE14D"/><circle cx="12" cy="-8" r="3" fill="#FF2E7E"/><path d="M-26 0 Q0 7 26 0" stroke="#FFE14D" stroke-width="4" fill="none"/><circle cx="0" cy="-70" r="8" fill="#FF2E7E"/>`,
mago:`<path d="M-48 0 Q0 -12 48 0 Q0 9 -48 0Z" fill="#33268F"/><path d="M-28 -3 Q-12 -40 4 -80 Q12 -88 22 -78 Q14 -70 12 -60 Q20 -30 28 -3 Z" fill="#4A37C8"/><rect x="-27" y="-14" width="55" height="8" fill="#FFC94A" transform="skewY(-2)"/><path d="M-6 -36 l2.5 5 5.5 .8 -4 3.8 1 5.4 -5 -2.6 -5 2.6 1 -5.4 -4 -3.8 5.5 -.8z" fill="#FFC94A"/><path d="M10 -56 l1.6 3.2 3.5 .5 -2.5 2.4 .6 3.5 -3.2 -1.7 -3.2 1.7 .6 -3.5 -2.5 -2.4 3.5 -.5z" fill="#FFE68A"/>`,
vaquero:`<path d="M-58 -8 Q-52 6 0 5 Q52 6 58 -8 Q42 1 0 -1 Q-42 1 -58 -8 Z" fill="#8B5A2B"/><path d="M-28 -3 Q-34 -42 -15 -46 Q0 -38 15 -46 Q34 -42 28 -3 Z" fill="#A86B34"/><rect x="-28" y="-14" width="56" height="8" fill="#5C3A1A"/><circle cx="18" cy="-10" r="3.5" fill="#FFC94A"/>`,
vikingo:`<path d="M-34 -18 Q-62 -26 -60 -62 Q-48 -38 -30 -34 Z" fill="#F4ECD8" stroke="#C9BFA6" stroke-width="2"/><path d="M34 -18 Q62 -26 60 -62 Q48 -38 30 -34 Z" fill="#F4ECD8" stroke="#C9BFA6" stroke-width="2"/><path d="M-36 0 Q-36 -42 0 -44 Q36 -42 36 0 Z" fill="#AEB8C8" stroke="#6E7A93" stroke-width="2"/><rect x="-38" y="-9" width="76" height="10" rx="3" fill="#8A96AB"/><rect x="-4" y="-44" width="8" height="36" fill="#8A96AB"/><circle cx="-24" cy="-4" r="2" fill="#5A6680"/><circle cx="24" cy="-4" r="2" fill="#5A6680"/>`,
tetera:`<path d="M-28 -30 Q-48 -24 -30 -6" stroke="#6E7A93" stroke-width="5" fill="none"/><path d="M28 -22 Q44 -26 50 -44 L55 -42 Q52 -18 30 -10 Z" fill="#E9EEF7" stroke="#6E7A93" stroke-width="2"/><ellipse cx="0" cy="-20" rx="31" ry="21" fill="#E9EEF7" stroke="#6E7A93" stroke-width="2"/><path d="M-15 -39 Q0 -50 15 -39 Z" fill="#C9D1DF"/><circle cx="0" cy="-48" r="4.5" fill="#FF7A1A"/><text x="0" y="-14" text-anchor="middle" font-family="monospace" font-weight="700" font-size="13" fill="#FF7A1A">418</text><path d="M52 -50 q4 -8 0 -14 M58 -52 q4 -8 0 -14" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none"/>`,
lentes:`<rect x="-52" y="16" width="108" height="6" fill="#111"/><rect x="-50" y="22" width="28" height="18" fill="#111"/><rect x="14" y="22" width="28" height="18" fill="#111"/><rect x="-46" y="24" width="6" height="6" fill="#fff" opacity=".7"/><rect x="18" y="24" width="6" height="6" fill="#fff" opacity=".7"/><rect x="-40" y="30" width="4" height="4" fill="#fff" opacity=".45"/><rect x="24" y="30" width="4" height="4" fill="#fff" opacity=".45"/>`,
goggles:`<rect x="-80" y="-16" width="152" height="9" fill="#3A2A1E"/><circle cx="-30" cy="-13" r="16" fill="#B8862B" stroke="#7A561A" stroke-width="2"/><circle cx="-30" cy="-13" r="10" fill="#5FD3C8"/><rect x="-36" y="-19" width="5" height="5" fill="#fff" opacity=".85"/><circle cx="18" cy="-13" r="16" fill="#B8862B" stroke="#7A561A" stroke-width="2"/><circle cx="18" cy="-13" r="10" fill="#5FD3C8"/><rect x="12" y="-19" width="5" height="5" fill="#fff" opacity=".85"/><rect x="-14" y="-17" width="16" height="6" fill="#8A6420"/>`,
manzana:`<circle cx="0" cy="-16" r="15" fill="#D7263D"/><circle cx="-6" cy="-21" r="4" fill="#fff" opacity=".45"/><rect x="-1" y="-38" width="3" height="9" fill="#5A3A1A"/><path d="M2 -33 q11 -9 17 -2 q-8 7 -17 2z" fill="#3FA34D"/>`,
laurel:`<path d="M-62 -2 Q0 -34 62 -2" stroke="#4E7A28" stroke-width="4" fill="none"/>`+[-54,-40,-26,-12,12,26,40,54].map((x,i)=>`<ellipse cx="${x}" cy="${-4-Math.round(18*Math.cos(x/62*1.4))}" rx="9" ry="4" fill="${i%2?'#6FA23A':'#5E8C31'}" transform="rotate(${x<0?-35:35} ${x} ${-4-Math.round(18*Math.cos(x/62*1.4))})"/>`).join(''),
corona:`<path d="M-36 0 L-40 -38 L-19 -18 L0 -46 L19 -18 L40 -38 L36 0 Z" fill="#FFC94A" stroke="#D99A1B" stroke-width="2"/><rect x="-36" y="-8" width="72" height="8" fill="#F2B529"/><circle cx="0" cy="-20" r="5" fill="#FF2E7E"/><circle cx="-22" cy="-12" r="3.5" fill="#3FE0C5"/><circle cx="22" cy="-12" r="3.5" fill="#3FE0C5"/><circle cx="0" cy="-48" r="3" fill="#fff"/>`
};
const HAT_NAMES={antena:'Antena',casco:'Casco de obra',quirurgico:'Gorro quirúrgico',copa:'Copa',boina:'Boina',birrete:'Birrete',chef:'Chef',fiesta:'Fiesta',mago:'Mago',vaquero:'Vaquero',vikingo:'Vikingo',tetera:'Tetera 418',goggles:'Lentes industriales',manzana:'Manzana de Newton',laurel:'Laurel',lentes:'Lentes pixel',corona:'Corona secreta'};
const HAT_ORDER=['antena','casco','quirurgico','copa','boina','birrete','chef','fiesta','mago','vaquero','vikingo','tetera','lentes'];
const HAT_QUIP={tetera:'Error 418: soy una tetera. Es un código HTTP real, lo juro.',vikingo:'Saqueo bibliotecas. Con permiso y citando la fuente.',vaquero:'En este pueblo no hay espacio para dos prototipos sin publicar.',chef:'Hoy cocinamos prototipos. Ingrediente secreto: datos reales.',mago:'No es magia. Es un modelo de lenguaje con herramientas. Pero se ve igual.',lentes:'Lentes de pixel. Ya sabes: deal with it.',corona:'Modo leyenda activado. 30 vidas extra, no válidas en exámenes.'};
const QUIPS=['Funciona en mi máquina. Tu máquina es otro tema.','¿Ya probaste apagarlo y volverlo a prender?','No es un bug, es una característica no documentada.','Parece que estás escribiendo una tesis. ¿Te ayudo a estructurarla? Copiarla no.','Cargando inspiración… 99%… 99%… 99%…','Estoy hecho de pixeles cuadrados. Mis abrazos también.','Ctrl+Z existe en el código. En la vida no. Úsalo aquí.','Hola, mundo. Ya, era obligatorio decirlo.','Pide como si le explicaras a un compañero listo que llegó tarde a clase.','Si no me das datos reales, invento ejemplos. Y los marco como ejemplos.'];

function mascotSVG(id){
 const O='#D97757',DK='#A8502F',TP='#EC9B7C',SD='#8E3F25';
 const box=(x,y,w,h,d=8)=>`<path d="M${x} ${y}L${x+d} ${y-d}H${x+w+d}L${x+w} ${y}Z" fill="${TP}"/><path d="M${x+w} ${y}L${x+w+d} ${y-d}V${y+h-d}L${x+w} ${y+h}Z" fill="${DK}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}b)"/>`;
 let grid='';for(let x=54;x<182;x+=16)grid+=`<path d="M${x} 80V144" stroke="#000" stroke-opacity=".06"/>`;for(let y=96;y<144;y+=16)grid+=`<path d="M38 ${y}H182" stroke="#000" stroke-opacity=".06"/>`;
 return`<svg viewBox="0 0 220 200" aria-hidden="true" shape-rendering="crispEdges"><defs>
<linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E58C6B"/><stop offset=".55" stop-color="${O}"/><stop offset="1" stop-color="#C4653F"/></linearGradient></defs>
<ellipse cx="114" cy="186" rx="70" ry="7" fill="#000" opacity=".25" shape-rendering="auto"/>
<g class="c-float">
<g class="c-flame"><rect x="98" y="160" width="10" height="10" fill="#FFC94A"/><rect x="112" y="160" width="10" height="10" fill="#FF7A1A"/><rect x="104" y="170" width="10" height="8" fill="#FF7A1A" opacity=".8"/></g>
<g class="c-legA"><rect x="56" y="144" width="9" height="16" fill="${O}"/><rect x="65" y="144" width="3" height="16" fill="${SD}"/><rect x="136" y="144" width="9" height="16" fill="${O}"/><rect x="145" y="144" width="3" height="16" fill="${SD}"/></g>
<g class="c-legB"><rect x="76" y="144" width="9" height="16" fill="${O}"/><rect x="85" y="144" width="3" height="16" fill="${SD}"/><rect x="156" y="144" width="9" height="16" fill="${O}"/><rect x="165" y="144" width="3" height="16" fill="${SD}"/></g>
${box(22,104,16,18,6)}
<g class="c-armR">${box(182,104,16,18,6)}</g>
${box(38,80,144,64,8)}
${grid}
<rect x="38" y="80" width="144" height="4" fill="#fff" opacity=".22"/>
<g class="c-eyes"><rect x="68" y="92" width="16" height="24" fill="#1F1E1D"/><rect x="136" y="92" width="16" height="24" fill="#1F1E1D"/><rect x="71" y="95" width="5" height="5" fill="#fff" opacity=".85"/><rect x="139" y="95" width="5" height="5" fill="#fff" opacity=".85"/></g>
<rect class="c-lid" x="66" y="90" width="20" height="28" fill="#E3876A"/><rect class="c-lid" x="134" y="90" width="20" height="28" fill="#E3876A"/>
<g class="c-x"><path d="M68 94L84 114M84 94L68 114M136 94L152 114M152 94L136 114" stroke="#1F1E1D" stroke-width="5"/></g>
<g class="m-hat" transform="translate(114 74) rotate(-6)"></g>
</g></svg>`;}
const mascots=[];
function makeMascot(host,id,own){host.insertAdjacentHTML('beforeend',mascotSVG(id));const svg=host.querySelector('svg');const M={svg,hat:svg.querySelector('.m-hat'),pup:svg.querySelector('.c-eyes'),cur:'',own:!!own};mascots.push(M);return M;}
let curHat='antena';
function hatOn(M,h){if(!HATS[h]||M.cur===h)return;M.cur=h;M.hat.innerHTML=`<g class="hh">${HATS[h]}</g>`;M.hat.setAttribute('transform',h==='lentes'?'translate(114 74)':'translate(114 74) rotate(-6)');M.svg.classList.remove('pop');void M.svg.getBoundingClientRect();M.svg.classList.add('pop');}
function setHat(h){if(!HATS[h])return;curHat=h;for(const M of mascots){if(M.own)continue;M.cur=h;M.hat.innerHTML=`<g class="hh">${HATS[h]}</g>`;M.hat.setAttribute('transform',h==='lentes'?'translate(114 74)':'translate(114 74) rotate(-6)');M.svg.classList.remove('pop');void M.svg.getBoundingClientRect();M.svg.classList.add('pop');}
  $$('.hatchip').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hat===h)));}
addEventListener('pointermove',e=>{for(const M of mascots){const r=M.svg.getBoundingClientRect();if(!r.width)continue;const cx=r.left+r.width*.5,cy=r.top+r.height*.5;const dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1;const m=Math.min(4,d/50);M.pup.setAttribute('transform',`translate(${Math.round(dx/d*m)} ${Math.round(dy/d*m*.7)})`);}},{passive:true});
function typeInto(el,txt){if(el.__tt)clearInterval(el.__tt);if(RM){el.textContent=txt;return;}let i=0;el.textContent='';el.__tt=setInterval(()=>{i+=2;el.textContent=txt.slice(0,i);if(i>=txt.length)clearInterval(el.__tt);},14);}

/* ================= HERO ================= */
const heroM=makeMascot($('#heroM'),'hm');
const dockM=makeMascot($('#dockM'),'dm');
setHat('antena');
const hatChips=$('#hatChips');
[...HAT_ORDER,'corona'].forEach(h=>{const b=document.createElement('button');b.className='hatchip'+(h==='corona'?' locked':'');b.dataset.hat=h;b.textContent=h==='corona'?'Corona 🔒':HAT_NAMES[h];b.setAttribute('aria-pressed',String(h==='antena'));
  b.addEventListener('click',()=>{if(h==='corona'&&!konamiDone){typeInto($('#heroBub'),'La corona se gana con el código secreto. Pista: está al final de la página.');return;}setHat(h);typeInto($('#heroBub'),HAT_QUIP[h]||`Sombrero: ${HAT_NAMES[h]}. ¿Me queda?`);});hatChips.appendChild(b);});
let qi=0;
$('#heroM').addEventListener('click',()=>{const i=(HAT_ORDER.indexOf(curHat)+1)%HAT_ORDER.length;const h=HAT_ORDER[i];setHat(h);typeInto($('#heroBub'),HAT_QUIP[h]||QUIPS[qi++%QUIPS.length]);});
const TICK=['Funciona en mi máquina™','¿Ya probaste apagar y prender?','404: miedo no encontrado','Ctrl+Z para la vida (solo aquí)','No es un bug, es una feature','Cargando 99%…','Error 418: soy una tetera','Hola, mundo','↑↑↓↓←→←→BA','sudo haz-mi-tarea → permiso denegado','Un prototipo feo publicado le gana a uno perfecto en tu cabeza'];
$('#ticker').innerHTML=[...TICK,...TICK].map(s=>`<span>${s}</span>`).join('');

/* hero background: low-poly blob + glyphs + stars */
function icosphere(n){const t=(1+Math.sqrt(5))/2;const nv=v=>{const l=Math.hypot(...v);return v.map(c=>c/l);};
  let V=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(nv);
  let F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  for(let i=0;i<n;i++){const cache=new Map();const mid=(a,b)=>{const k=a<b?a*1e4+b:b*1e4+a;if(cache.has(k))return cache.get(k);V.push(nv([(V[a][0]+V[b][0])/2,(V[a][1]+V[b][1])/2,(V[a][2]+V[b][2])/2]));cache.set(k,V.length-1);return V.length-1;};
    const NF=[];for(const[a,b,c]of F){const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);NF.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]);}F=NF;}
  return{V,F};}
const ICO=icosphere(2);
const RAMP=[[0,[31,23,96]],[.42,[106,76,240]],[.72,[255,122,26]],[1,[255,214,130]]];
function ramp(v){v=clamp(v,0,1);for(let i=1;i<RAMP.length;i++){if(v<=RAMP[i][0]){const a=RAMP[i-1],b=RAMP[i],t=(v-a[0])/(b[0]-a[0]);return[0,1,2].map(j=>Math.round(lerp(a[1][j],b[1][j],t)));}}return RAMP[RAMP.length-1][1];}
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
bg($('#inicio'),S=>{
  const stars=Array.from({length:110},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.5+.4,s:Math.random()*.6+.2}));
  const G=['∫','Σ','</>','ψ','ATG','§','♪','∞','λ','{ }','π','Δ','∂','¶','H₂O','f(x)'];
  const gl=Array.from({length:22},(_,i)=>({g:G[i%G.length],x:Math.random(),y:Math.random(),z:.4+Math.random()*.9,s:12+Math.random()*16}));
  const L=(()=>{const v=[-.5,-.7,.6],l=Math.hypot(...v);return v.map(c=>c/l);})();
  const P=new Array(ICO.V.length);
  return t=>{
    const c=S.ctx,w=S.w,h=S.h,k=S.k;c.clearRect(0,0,w,h);
    const mxn=S.mx>-9000?S.mx/w-.5:0,myn=S.my>-9000?S.my/h-.5:0;
    for(const s of stars){const y=((s.y-t*.006*s.s-S.p*.4)%1+1)%1;c.fillStyle=rgba(k.ink,.18+.22*Math.sin(t*s.s*2.4+s.x*30));c.fillRect(s.x*w-mxn*10*s.s,y*h,s.r,s.r);}
    c.textAlign='center';
    for(const g of gl){const y=((g.y-t*.01*g.z)%1+1)%1;c.font=`500 ${g.s}px "Geist Mono", ui-monospace, monospace`;c.fillStyle=rgba(k.a2,.10+.08*g.z);c.fillText(g.g,g.x*w-mxn*40*g.z,y*h-myn*30*g.z);}
    const st=$('#heroStage').getBoundingClientRect(),cr=S.cv.getBoundingClientRect();
    const cx=st.left-cr.left+st.width/2,cy=st.top-cr.top+st.height*.52,R=Math.min(st.width,st.height)*.47;
    const ry=t*.22+mxn*1.1,rx=-.3+myn*.7,cy_=Math.cos(ry),sy=Math.sin(ry),cxr=Math.cos(rx),sxr=Math.sin(rx);
    const taps=S.taps.map(tp=>{let dx=(tp.x-cx)/R,dy=(tp.y-cy)/R,dz=.7;const l=Math.hypot(dx,dy,dz);return{dx:dx/l,dy:dy/l,dz:dz/l,t:tp.t};});
    const V=ICO.V;
    for(let i=0;i<V.length;i++){let[x,y,z]=V[i];
      let d=1+.24*Math.sin(3.1*x+t*1.1)*Math.sin(2.7*y+t*.9)*Math.sin(2.3*z+t*.7)+.05*Math.sin(5*y+t*2);
      for(const tp of taps){const a=t-tp.t;if(a<0||a>3)continue;const dd=x*tp.dx+y*tp.dy+z*tp.dz;d+=.16*Math.exp(-a*1.5)*Math.sin(dd*6-a*9);}
      x*=d;y*=d;z*=d;let X=x*cy_+z*sy,Z=-x*sy+z*cy_;let Y=y*cxr-Z*sxr;Z=y*sxr+Z*cxr;P[i]=[X,Y,Z];}
    const D=4.2,ex=S.p*2.2,faces=[];
    for(let f=0;f<ICO.F.length;f++){const[a,b,cc]=ICO.F[f],A=P[a],B=P[b],C=P[cc];
      const u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const nl=Math.hypot(...n)||1;n=n.map(q=>q/nl);
      const m=[(A[0]+B[0]+C[0])/3,(A[1]+B[1]+C[1])/3,(A[2]+B[2]+C[2])/3];if(n[0]*m[0]+n[1]*m[1]+n[2]*m[2]<0)n=n.map(q=>-q);
      const e=ex*(.4+hash(f)*1.2),o=[n[0]*e+m[0]*e*.3,n[1]*e+m[1]*e*.3,n[2]*e];
      const vx=-(m[0]+o[0]),vy=-(m[1]+o[1]),vz=D-(m[2]+o[2]);if(n[0]*vx+n[1]*vy+n[2]*vz<=0)continue;
      faces.push({A,B,C,o,n,z:m[2]+o[2]});}
    faces.sort((p,q)=>p.z-q.z);
    const alpha=clamp(1-S.p*1.3,0,1);if(alpha<=0)return;
    c.lineJoin='round';
    for(const F of faces){const pr=V=>{const z=V[2]+F.o[2],s=R*(D-1)/(D-z);return[cx+(V[0]+F.o[0])*s,cy+(V[1]+F.o[1])*s];};
      const p1=pr(F.A),p2=pr(F.B),p3=pr(F.C);
      const li=Math.max(0,F.n[0]*L[0]+F.n[1]*L[1]+F.n[2]*L[2]);const rim=Math.pow(1-Math.abs(F.n[2]),2);
      const col=ramp(li*.95+.05-rim*.25);const fill=`rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
      c.beginPath();c.moveTo(p1[0],p1[1]);c.lineTo(p2[0],p2[1]);c.lineTo(p3[0],p3[1]);c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=fill;c.lineWidth=.8;c.stroke();
      c.strokeStyle=`rgba(255,240,220,${.08*alpha})`;c.lineWidth=.6;c.stroke();}
  };
},'top');

/* ================= QUE ES ================= */
const SCRIPTS=[
 {p:'Hazme un simulador de péndulo doble para explicar caos en Física I',s:['Plan: integración RK4, 3 controles, trazo de las puntas','Escribiendo <b>pendulo.html</b>','Probando en Chromium: <b>0 errores</b> en consola, revisado en celular','Publicado. Te paso el link privado.']},
 {p:'Quiero un modelo SIR con vacunación para mi clase de Salud Pública',s:['Plan: modelo S-I-R, 4 sliders, cuadrícula de 200 personas','Escribiendo <b>sir.html</b> y textos de ayuda','Verificando: S + I + R = 100% cada día','Publicado, con la nota «modelo didáctico, no pronóstico».']},
 {p:'Compara D\'Hondt y Sainte-Laguë con los resultados de mi distrito',s:['Me falta el CSV oficial. ¿Me lo pasas? Mientras, uso partidos de ejemplo','Calculando escaños con <b>3 fórmulas</b> e índice de Gallagher','Dibujando el hemiciclo y probando 10 a 200 escaños','Publicado. Los datos de ejemplo van marcados.']},
 {p:'Haz una caja de ritmos pentatónica para el taller de música',s:['Plan: 16 pasos, 5 notas + bombo, Web Audio','Escribiendo <b>ritmos.html</b> con sonido sintetizado','Probando: el audio arranca solo tras un clic, como pide el navegador','Publicado. Súbele al volumen.']}
];
(function terminal(){const el=$('#term');
  if(RM){const s=SCRIPTS[0];el.innerHTML=`<div class="pr">${s.p}</div>`+s.s.map((x,i)=>`<div class="${i===s.s.length-1?'ok':'st'}">${i===s.s.length-1?'✓':'·'} ${x}</div>`).join('');return;}
  let si=0;const run=()=>{const s=SCRIPTS[si++%SCRIPTS.length];el.innerHTML='<div class="pr"></div>';const pr=el.firstChild;let i=0;
    const ty=setInterval(()=>{i++;pr.innerHTML=s.p.slice(0,i)+'<span class="caret"></span>';if(i>=s.p.length){clearInterval(ty);pr.textContent=s.p;let j=0;
      const st=setInterval(()=>{if(j>=s.s.length){clearInterval(st);setTimeout(run,3200);return;}const d=document.createElement('div');const last=j===s.s.length-1;d.className=last?'ok':'st';d.innerHTML=(last?'✓ ':'· ')+s.s[j];el.appendChild(d);j++;},700);}},34);};
  run();})();
const AUTO=[
 {t:'Autocompletar',d:'Sugiere la siguiente palabra o la siguiente línea de código. Tú haces todo lo demás.',e:'Como el teclado de tu celular, pero leyó mucho más.',n:[0,1],a:[0]},
 {t:'Chat',d:'Contesta, explica y redacta. Tú copias, pegas, ejecutas y regresas a preguntar cuando algo falla.',e:'Útil para entender. Lento para construir.',n:[0,1],a:[0]},
 {t:'Agente',d:'Además de responder, actúa: lee tus archivos, escribe código, lo ejecuta, ve el error y lo corrige. Te entrega algo que funciona. Claude Code, Codex o Cursor en modo agente son de esta familia. Esta sesión es un agente.',e:'Le pides el resultado, no las instrucciones.',n:[0,1,2],a:[0,1]},
 {t:'Equipo de agentes',d:'Un agente coordina a otros que trabajan en paralelo: uno investiga, otro programa, otro revisa. Sirve cuando el trabajo de verdad se puede repartir.',e:'Una investigación con un subagente por fuente.',n:[0,1,2,3],a:[0,1,2]}
];
function setAuto(v){const A=AUTO[v];$('#autoO').textContent=A.t;$('#autoT').textContent=A.t;$('#autoD').textContent=A.d;$('#autoE').textContent=A.e;
  $$('#autoNodes .node').forEach(n=>n.classList.toggle('on',A.n.includes(+n.dataset.n)));$$('#autoNodes .arrow').forEach(n=>n.classList.toggle('on',A.a.includes(+n.dataset.a)));}
$('#autoR').addEventListener('input',e=>setAuto(+e.target.value));setAuto(2);
const PIPE=[['Entiendo y planeo','Leo tu pedido. Pregunto solo si la respuesta cambia el resultado.'],['Uso herramientas','Terminal, búsqueda web, tus archivos y conectores.'],['Construyo','Escribo el código, el contenido y las gráficas.'],['Pruebo','Abro un navegador, reviso errores y cómo se ve en celular.'],['Publico','Te paso un link privado. Tú decides con quién compartirlo.']];
$('#pipe').insertAdjacentHTML('beforeend',PIPE.map((p,i)=>`<div class="pstep"><span class="n">${i+1}</span><h3 class="halo">${p[0]}</h3><p class="halo">${p[1]}</p></div>`).join(''));
/* matrix-ish rain */
bg($('#que-es'),S=>{const CH='AGENTEPROMPTCONTEXTOTOKEN01{}<>∑∫λ#$%&ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';let cols=[];
  const mk=w=>{const n=Math.ceil(w/20);cols=Array.from({length:n},(_,i)=>({x:i*20+10,y:Math.random()*1.4-.4,sp:.05+Math.random()*.12,ch:Array.from({length:18},()=>CH[Math.random()*CH.length|0])}));};
  S.onTap=(x,y)=>{for(const cl of cols)if(Math.abs(cl.x-x)<90){cl.y=y/S.h;cl.sp=.25+Math.random()*.2;}};
  let lt=0;return t=>{const c=S.ctx,w=S.w,h=S.h,k=S.k;if(!cols.length||Math.abs(cols.length*20-w)>40)mk(w);const dt=Math.min(.05,t-lt);lt=t;c.clearRect(0,0,w,h);c.font='500 14px "Geist Mono", ui-monospace, monospace';c.textAlign='center';
    for(const cl of cols){if(!RM)cl.y+=cl.sp*dt*(1+S.p);if(cl.y>1.3){cl.y=-.3;cl.sp=.05+Math.random()*.12;}if(Math.random()<.02)cl.ch[Math.random()*18|0]=CH[Math.random()*CH.length|0];
      const near=S.mx>-9000?Math.exp(-((cl.x-S.mx)**2)/(2*120*120)):0;
      for(let j=0;j<18;j++){const y=cl.y*h-j*19;if(y<-20||y>h+20)continue;const a=(j===0?.5:.22*(1-j/18))*(1+near*1.6);c.fillStyle=j===0?rgba(k.ink,Math.min(.9,a)):rgba(k.a2,Math.min(.7,a));c.fillText(cl.ch[j],cl.x,y);}}};});

/* ================= INVENTARIO ================= */
const CATS={crear:{n:'Crear',c:'#FF6A00'},codigo:{n:'Código',c:'#6B4EFF'},investigar:{n:'Investigar',c:'#0E9F7E'},archivos:{n:'Archivos',c:'#D6336C'},conectar:{n:'Conectar',c:'#2F6BFF'},auto:{n:'Automatizar',c:'#A56A00'}};
const ELS=[
{s:'Pg',n:'Páginas interactivas',cat:'crear',xp:1,que:'Una página web completa, con animación y controles, publicada en claude.ai con un link privado que tú decides compartir. Esta demo es una.',pide:'Hazme una página interactiva que explique el ciclo del agua con un slider de temperatura. Que funcione en celular y no parezca plantilla.',da:'El link a la página publicada y su archivo HTML.',ojo:'Es privada hasta que tú la compartes.'},
{s:'Ap',n:'Apps con memoria',cat:'crear',xp:2,que:'Páginas que guardan lo que la gente hace en ellas: encuestas, listas de inscripción, tableros que llenan varias personas.',pide:'Arma una hoja de inscripción para el Jam donde cada equipo registre nombre, carrera y problema elegido, y todos vean la lista actualizada.',da:'Una app publicada con su propia base de datos compartida.',ojo:'Quien abra el link ve lo que escribieron los demás.'},
{s:'Sl',n:'Presentaciones',cat:'crear',xp:1,que:'Diapositivas 16:9 para exponer, que se descargan como PowerPoint o PDF.',pide:'Convierte mis notas sobre la Revolución de Ayutla en 10 diapositivas con línea de tiempo y una pregunta para debatir al final.',da:'Un deck navegable con descarga a .pptx o PDF.',ojo:'Revisa fechas y nombres. Verificar también es tu trabajo.'},
{s:'Dc',n:'Documentos vivos',cat:'crear',xp:1,que:'Documentos que editamos juntos, con comentarios, que se exportan a Word, PDF o Markdown.',pide:'Escribe el protocolo de mi proyecto de servicio social con objetivos, metodología y cronograma, y deja comentarios donde falte información.',da:'Un documento editable y comentado.',ojo:'Ideal para borradores. La voz final la pones tú.'},
{s:'Hc',n:'Hojas de cálculo',cat:'crear',xp:1,que:'Tablas con fórmulas para presupuestos, bitácoras y registros, descargables en Excel.',pide:'Hazme el presupuesto del colectivo para el semestre con categorías, fórmulas de total y una columna de pendiente o pagado.',da:'Una hoja compartible y descargable en .xlsx.',ojo:''},
{s:'Tb',n:'Tableros de datos',cat:'crear',xp:2,que:'Páginas de gráficas y cifras donde cada número dice de dónde salió.',pide:'Con este CSV de asistencia arma un tablero por mes y por carrera, con la tendencia y los tres hallazgos principales.',da:'Un tablero publicado con gráficas y fuentes.',ojo:'Sin datos tuyos, uso ejemplos marcados como ejemplos.'},
{s:'Pz',n:'Pizarrón infinito',cat:'crear',xp:1,que:'Un lienzo compartido con bloques, flechas y secciones para mapas mentales y lluvias de ideas, con cursores en vivo.',pide:'Haz un pizarrón con los 6 problemas que salieron en el Jam, agrupados por área, con flechas entre los que se relacionan.',da:'Un pizarrón que el equipo reacomoda en vivo.',ojo:''},
{s:'Cd',n:'Código en terminal',cat:'codigo',xp:2,que:'Escribo y ejecuto Python, JavaScript y más en una computadora Linux en la nube: análisis de datos, scripts, pruebas.',pide:'Analiza este Excel de encuestas, limpia las respuestas vacías, calcula promedios por pregunta y hazme una gráfica de cada una.',da:'Resultados, gráficas y el código que los produjo.',ojo:'Esa computadora es temporal: lo importante se guarda en un repositorio o se publica.'},
{s:'Gh',n:'Repositorios',cat:'codigo',xp:3,que:'Trabajo dentro de proyectos de GitHub: leo el código, hago cambios en una rama y abro pull requests.',pide:'Revisa el repo de la página del colectivo, arregla el menú en celular y abre un pull request explicando el cambio.',da:'Una rama con commits y, si lo pides, un pull request.',ojo:'Solo subo cambios cuando me lo pides.'},
{s:'Ai',n:'Apps con IA',cat:'codigo',xp:3,que:'Te ayudo a construir tu propia aplicación que usa un modelo de Claude por API: tutores, clasificadores, chatbots.',pide:'Ayúdame a construir un tutor que haga preguntas socráticas sobre termodinámica usando la API de Claude, con interfaz web simple.',da:'Código que funciona y una explicación de costos.',ojo:'La API necesita cuenta y clave propias.'},
{s:'Bw',n:'Búsqueda web',cat:'investigar',xp:1,que:'Busco en internet y te digo de dónde salió cada dato.',pide:'Busca qué convocatorias de financiamiento para proyectos estudiantiles de ciencia abren este semestre y haz una tabla con fechas y requisitos.',da:'Una respuesta con enlaces a sus fuentes.',ojo:'Las fuentes se revisan. Los enlaces se abren.'},
{s:'Ip',n:'Investigación profunda',cat:'investigar',xp:3,que:'Varios subagentes investigan en paralelo y yo junto sus hallazgos en un informe con citas.',pide:'Investiga a fondo cómo se ha regulado la IA en educación superior en América Latina y dame un informe comparativo por país.',da:'Un informe narrativo con fuentes.',ojo:'Tarda y cuesta más que una búsqueda simple.'},
{s:'Ac',n:'Auditar citas',cat:'investigar',xp:2,que:'Comparo tus citas contra sus fuentes: si son literales y si la fuente de verdad sostiene lo que afirmas.',pide:'Revisa las citas de mi ensayo contra los PDFs que te paso y marca cuáles no coinciden o no sostienen mi argumento.',da:'Un reporte cita por cita.',ojo:'Úsalo antes de entregar cualquier trabajo evaluado.'},
{s:'Of',n:'PDF, Word, Excel, PPT',cat:'archivos',xp:1,que:'Leo y creo archivos de oficina: extraigo tablas de PDFs, lleno formularios, armo Word y PowerPoint.',pide:'Extrae las tablas de este informe en PDF a un Excel y resume en una cuartilla de Word los hallazgos.',da:'Los archivos listos para descargar.',ojo:''},
{s:'Cx',n:'Conectores',cat:'conectar',xp:2,que:'Me conecto a tus herramientas. En esta sesión hay Google Drive y Adobe; Notion, Slack, Figma o Linear funcionan si los autorizas.',pide:'Busca en mi Drive las minutas del colectivo de este semestre y hazme un resumen de acuerdos pendientes.',da:'Trabajo hecho con tus archivos reales.',ojo:'Cada conector se autoriza aparte, en la configuración de claude.ai.'},
{s:'Nv',n:'Navegador',cat:'auto',xp:2,que:'Abro un navegador automatizado para probar tu prototipo, tomar capturas y encontrar errores.',pide:'Abre mi prototipo en tamaño celular y escritorio, toma capturas y dime qué se ve roto.',da:'Capturas y una lista de problemas.',ojo:'No entra a tus cuentas personales.'},
{s:'Pr',n:'Tareas programadas',cat:'auto',xp:2,que:'Programo trabajo que corre solo: cada lunes, cada hora o una vez en una fecha.',pide:'Cada lunes a las 9, revisa las convocatorias nuevas y mándame un resumen.',da:'Una tarea que se ejecuta aunque no estés.',ojo:''},
{s:'Ag',n:'Subagentes',cat:'auto',xp:3,que:'Divido un trabajo grande entre varios agentes que trabajan a la vez y le reportan a uno.',pide:'Con subagentes, revisa en paralelo las leyes de transparencia de cinco estados y compáralas en una tabla.',da:'Varias líneas de trabajo, ya integradas.',ojo:'Úsalo cuando el trabajo de verdad se puede repartir.'}
];
let catFilter=null,selEl=0;
function renderInv(){const pt=$('#ptable');pt.innerHTML=ELS.map((e,i)=>`<button class="el${catFilter&&e.cat!==catFilter?' dim':''}" style="--c:${CATS[e.cat].c}" data-i="${i}" aria-pressed="${i===selEl}"><span class="z"><span>${i+1}</span><span>${'●'.repeat(e.xp)}</span></span><span class="sym">${e.s}</span><span class="nm">${e.n}</span></button>`).join('');
  pt.querySelectorAll('.el').forEach(b=>b.addEventListener('click',()=>{selEl=+b.dataset.i;renderInv();showEl();}));}
function showEl(){const e=ELS[selEl],C=CATS[e.cat],d=$('#eld');d.style.setProperty('--c',C.c);
  d.innerHTML=`<div class="eld-top"><div class="eld-sq"><span>${selEl+1}</span><b>${e.s}</b><em>xp ${e.xp}</em></div><div style="display:grid;gap:6px;min-width:0"><span class="cat">${C.n}</span><h3>${e.n}</h3></div></div>
  <dl><div><dt>Qué es</dt><dd>${e.que}</dd></div><div><dt>Pídelo así</dt><dd class="pq">${e.pide}</dd></div><div><dt>Te entrego</dt><dd>${e.da}</dd></div>${e.ojo?`<div><dt>Ojo</dt><dd>${e.ojo}</dd></div>`:''}</dl>
  <div class="row"><button class="btn solid sm" id="elCopy" style="--art1:${C.c};--on1:#fff">Copiar este prompt</button><button class="btn sm" id="elNext">Siguiente elemento</button></div>`;
  $('#elCopy').addEventListener('click',e2=>copy(e.pide,e2.currentTarget));$('#elNext').addEventListener('click',()=>{selEl=(selEl+1)%ELS.length;renderInv();showEl();});}
$('#filters').innerHTML=`<button aria-pressed="true" data-c="">Todas</button>`+Object.entries(CATS).map(([k,v])=>`<button aria-pressed="false" data-c="${k}" style="--c:${v.c}"><i></i>${v.n}</button>`).join('');
$$('#filters button').forEach(b=>b.addEventListener('click',()=>{catFilter=b.dataset.c||null;$$('#filters button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(catFilter&&ELS[selEl].cat!==catFilter)selEl=ELS.findIndex(e=>e.cat===catFilter);renderInv();showEl();}));
renderInv();showEl();
bg($('#inventario'),S=>{return t=>{const c=S.ctx,w=S.w,h=S.h,k=S.k,g=26;c.clearRect(0,0,w,h);
  for(let y=g/2;y<h;y+=g)for(let x=g/2;x<w;x+=g){let a=.07+.05*Math.sin(x*.018+y*.011+t*1.2+S.p*8);let hot=0;
    if(S.mx>-9000){const d2=(x-S.mx)**2+(y-S.my)**2;hot=Math.exp(-d2/(2*110*110));}
    for(const tp of S.taps){const age=t-tp.t,r=age*520,dd=Math.hypot(x-tp.x,y-tp.y);if(Math.abs(dd-r)<26)hot+=.9*(1-age/4);}
    a+=hot*.5;const s=2.2+hot*3.4;c.fillStyle=hot>.25?rgba(k.a1,Math.min(.85,a)):rgba(k.a2,Math.max(.03,a));c.fillRect(x-s/2,y-s/2,s,s);}};});

/* ================= AREA BACKGROUNDS ================= */
bg($('#area-1'),S=>{const Q=[{x:.28,y:.4,q:1},{x:.72,y:.62,q:-1}];let sign=1;
  S.onTap=(x,y)=>{sign=-sign;Q.push({x:x/S.w,y:y/S.h,q:sign,born:S.t});if(Q.length>7)Q.splice(2,1);};
  return t=>{const c=S.ctx,w=S.w,h=S.h,k=S.k;c.clearRect(0,0,w,h);
    c.strokeStyle=rgba(k.ink,.05);c.lineWidth=1;c.beginPath();for(let x=0;x<w;x+=24){c.moveTo(x+.5,0);c.lineTo(x+.5,h);}for(let y=0;y<h;y+=24){c.moveTo(0,y+.5);c.lineTo(w,y+.5);}c.stroke();
    c.strokeStyle=rgba(k.ink,.12);c.beginPath();for(let x=0;x<w;x+=120){c.moveTo(x+.5,0);c.lineTo(x+.5,h);}for(let y=0;y<h;y+=120){c.moveTo(0,y+.5);c.lineTo(w,y+.5);}c.stroke();
    const P=Q.map((q,i)=>{const o=i<2?Math.sin(t*.25+i*2+S.p*4)*.06:0;return{x:(q.x+o)*w,y:(q.y+Math.cos(t*.2+i)*(i<2?.05:0))*h,q:q.q};});
    if(S.mx>-9000)P.push({x:S.mx,y:S.my,q:.6});
    const sp=44;c.lineWidth=1.4;
    for(let y=sp/2;y<h;y+=sp)for(let x=sp/2;x<w;x+=sp){let ex=0,ey=0;for(const p of P){const dx=x-p.x,dy=y-p.y,r2=dx*dx+dy*dy+900,r3=r2*Math.sqrt(r2);ex+=p.q*dx/r3;ey+=p.q*dy/r3;}
      const m=Math.hypot(ex,ey)||1e-9,a=clamp(Math.log10(m*1e6)/3.2,0.05,1);const ux=ex/m,uy=ey/m,L=13;
      c.strokeStyle=rgba(k.a2,a*.55);c.beginPath();c.moveTo(x-ux*L/2,y-uy*L/2);c.lineTo(x+ux*L/2,y+uy*L/2);c.lineTo(x+ux*L/2-ux*4-uy*3,y+uy*L/2-uy*4+ux*3);c.stroke();}
    for(const p of P.slice(0,Q.length)){c.fillStyle=p.q>0?rgba(k.a1,.9):rgba(k.a3,.9);c.beginPath();c.arc(p.x,p.y,11,0,TAU);c.fill();c.fillStyle=k.paper;c.font='700 14px "Geist Mono",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(p.q>0?'+':'−',p.x,p.y+1);
      c.strokeStyle=rgba(p.q>0?k.a1:k.a3,.3);c.beginPath();c.arc(p.x,p.y,18+4*Math.sin(t*3),0,TAU);c.stroke();}
    c.textBaseline='alphabetic';c.textAlign='left';c.fillStyle=rgba(k.ink,.35);c.font='500 10px "Geist Mono",monospace';c.fillText('CAMPO ELÉCTRICO · TOCA PARA AGREGAR CARGAS · ILUSTRACIÓN',16,h-16);};});

bg($('#area-2'),S=>{const cells=Array.from({length:22},()=>({x:Math.random(),y:Math.random(),r:24+Math.random()*46,vx:(Math.random()-.5)*.01,vy:(Math.random()-.5)*.01,ph:Math.random()*TAU}));
  S.onTap=(x,y)=>{const a=Math.random()*TAU;for(const s of[-1,1])cells.push({x:x/S.w,y:y/S.h,r:22,vx:Math.cos(a)*.05*s,vy:Math.sin(a)*.05*s,ph:Math.random()*TAU,grow:1});while(cells.length>40)cells.shift();};
  let lt=0;return t=>{const c=S.ctx,w=S.w,h=S.h,k=S.k,dt=Math.min(.05,t-lt);lt=t;c.clearRect(0,0,w,h);
    for(const cl of cells){if(!RM){cl.x+=cl.vx*dt;cl.y+=cl.vy*dt;cl.vx*=.995;cl.vy*=.995;cl.vx+=(Math.random()-.5)*.002;cl.vy+=(Math.random()-.5)*.002;if(cl.grow&&cl.r<46)cl.r+=dt*8;}
      const px=cl.x*w,py=((cl.y-S.p*.25)%1+1)%1*h;
      if(S.mx>-9000){const dx=px-S.mx,dy=py-S.my,d=Math.hypot(dx,dy);if(d<160&&d>1){cl.vx+=dx/d*.004;cl.vy+=dy/d*.004;}}
      if(cl.x<-.1)cl.x=1.1;if(cl.x>1.1)cl.x=-.1;
      c.beginPath();for(let i=0;i<=28;i++){const a=i/28*TAU,rr=cl.r*(1+.07*Math.sin(a*3+t+cl.ph)+.04*Math.sin(a*5-t*1.3));const X=px+Math.cos(a)*rr,Y=py+Math.sin(a)*rr;i?c.lineTo(X,Y):c.moveTo(X,Y);}
      c.closePath();c.fillStyle=rgba(k.a2,.07);c.fill();c.strokeStyle=rgba(k.a2,.3);c.lineWidth=1.5;c.stroke();
      c.fillStyle=rgba(k.a1,.16);c.beginPath();c.arc(px+cl.r*.18*Math.cos(cl.ph),py+cl.r*.18*Math.sin(cl.ph),cl.r*.28,0,TAU);c.fill();
      c.fillStyle=rgba(k.a3,.25);for(let j=0;j<5;j++){const a=cl.ph+j*1.3+t*.2;c.fillRect(px+Math.cos(a)*cl.r*.6,py+Math.sin(a)*cl.r*.55,2,2);}}
    c.fillStyle=rgba(k.ink,.4);c.font='500 10px "Geist Mono",monospace';c.fillText('CÉLULAS · TOCA PARA QUE SE DIVIDAN · ILUSTRACIÓN',16,h-16);};});

bg($('#area-3'),S=>{const N=Array.from({length:48},(_,i)=>({x:Math.random(),y:Math.random(),vx:0,vy:0,b:i%3}));
  S.onTap=(x,y)=>{N.push({x:x/S.w,y:y/S.h,vx:(Math.random()-.5)*.02,vy:(Math.random()-.5)*.02,b:Math.random()*3|0,ring:S.t});while(N.length>72)N.shift();};
  let lt=0;return t=>{const c=S.ctx,w=S.w,h=S.h,k=S.k,dt=Math.min(.05,t-lt);lt=t;c.clearRect(0,0,w,h);const cols=[k.a1,k.a2,k.a3];
    const C=[[.18,.5],[.5,.28],[.82,.62]],pol=clamp((S.p-.1)*1.4,0,1);
    for(const n of N){if(!RM){n.vx+=(Math.random()-.5)*.0008+(C[n.b][0]-n.x)*.0006*pol;n.vy+=(Math.random()-.5)*.0008+(C[n.b][1]-n.y)*.0006*pol;
      if(S.mx>-9000){const dx=S.mx/w-n.x,dy=S.my/h-n.y,d=Math.hypot(dx,dy);if(d<.2){n.vx+=dx*.002;n.vy+=dy*.002;}}
      n.vx*=.96;n.vy*=.96;n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>1)n.vx*=-1;if(n.y<0||n.y>1)n.vy*=-1;n.x=clamp(n.x,0,1);n.y=clamp(n.y,0,1);}}
    c.lineWidth=1;for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const a=N[i],b=N[j],dx=(a.x-b.x)*w,dy=(a.y-b.y)*h,d=Math.hypot(dx,dy);if(d<150){const al=(1-d/150)*(a.b===b.b?.35:.12);c.strokeStyle=a.b===b.b?rgba(cols[a.b],al):rgba(k.ink,al);c.beginPath();c.moveTo(a.x*w,a.y*h);c.lineTo(b.x*w,b.y*h);c.stroke();}}
    for(const n of N){c.fillStyle=rgba(cols[n.b],.75);c.beginPath();c.arc(n.x*w,n.y*h,3.4,0,TAU);c.fill();if(n.ring){const a=t-n.ring;if(a<1.6){c.strokeStyle=rgba(cols[n.b],.6*(1-a/1.6));c.beginPath();c.arc(n.x*w,n.y*h,6+a*60,0,TAU);c.stroke();}}}
    c.fillStyle=rgba(k.ink,.35);c.font='500 10px "Geist Mono",monospace';c.fillText(`RED DE ACTORES · POLARIZACIÓN ${Math.round(pol*100)}% CON EL SCROLL · ILUSTRACIÓN`,16,h-16);};});

let AUDIO_LVL=0;
bg($('#area-4'),S=>{const blots=[];S.onTap=(x,y)=>blots.push({x,y,t:S.t,r:30+Math.random()*50});
  const nz=(x,y,t)=>(Math.sin(x*.011+t*.6)+Math.sin(y*.013-t*.4)+Math.sin((x+y)*.007+t*.3))/3;
  return t=>{const c=S.ctx,w=S.w,h=S.h,k=S.k,g=22;c.clearRect(0,0,w,h);const lv=AUDIO_LVL;
    for(let y=g/2;y<h;y+=g)for(let x=g/2;x<w;x+=g){let v=.5+.5*nz(x,y+S.p*600,t);let near=0;if(S.mx>-9000)near=Math.exp(-((x-S.mx)**2+(y-S.my)**2)/(2*90*90));
      const r=.6+v*v*5.4*(.6+lv*2.6)+near*4;c.fillStyle=rgba(k.a1,.2);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
    c.globalCompositeOperation='multiply';
    for(let y=g;y<h;y+=g*2)for(let x=g;x<w;x+=g*2){const v=.5+.5*nz(y,x,t*.7+3);const r=.5+v*v*7*(.6+lv*2);c.fillStyle=rgba(k.a2,.12);c.beginPath();c.arc(x+3,y+2,r,0,TAU);c.fill();}
    for(const b of blots){const a=t-b.t;if(a>4)continue;c.fillStyle=rgba(k.a2,.22*(1-a/4));c.beginPath();for(let i=0;i<=20;i++){const an=i/20*TAU,rr=(b.r+a*16)*(1+.18*Math.sin(an*5+b.r));i?c.lineTo(b.x+Math.cos(an)*rr,b.y+Math.sin(an)*rr):c.moveTo(b.x+Math.cos(an)*rr,b.y+Math.sin(an)*rr);}c.fill();}
    c.globalCompositeOperation='source-over';c.fillStyle=rgba(k.ink,.4);c.font='500 10px "Geist Mono",monospace';c.fillText('TRAMA RISO · REACCIONA AL AUDIO DE LA CAJA DE RITMOS · ILUSTRACIÓN',16,h-16);};});

bg($('#jam'),S=>{const parts=[];S.onTap=(x,y)=>{if(RM)return;for(let i=0;i<40;i++){const a=Math.random()*TAU,s=2+Math.random()*6;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-4,r:Math.random()*6,c:i%3,l:0});}};
  return t=>{const c=S.ctx,w=S.w,h=S.h,k=S.k;c.clearRect(0,0,w,h);const cx=w*.86,cy=h*.32,R=Math.min(w,h)*.42;
    for(let i=0;i<5;i++){c.strokeStyle=rgba(k.ink,.1);c.lineWidth=1.2;c.setLineDash([2,10+i*3]);c.lineDashOffset=-t*(10+i*6)*(i%2?1:-1);c.beginPath();c.arc(cx,cy,R*(.35+i*.17),0,TAU);c.stroke();}
    c.setLineDash([]);for(let i=0;i<180;i++){const a=i/180*TAU,big=i%15===0;c.strokeStyle=rgba(k.ink,big?.3:.12);c.lineWidth=big?2:1;c.beginPath();c.moveTo(cx+Math.cos(a)*R*(big?1.02:1.05),cy+Math.sin(a)*R*(big?1.02:1.05));c.lineTo(cx+Math.cos(a)*R*1.1,cy+Math.sin(a)*R*1.1);c.stroke();}
    const ha=-Math.PI/2+t*.25+S.p*TAU;c.strokeStyle=rgba(k.ink,.35);c.lineWidth=3;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ha)*R,cy+Math.sin(ha)*R);c.stroke();
    c.fillStyle=rgba(k.card,.18);c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,ha-.5,ha);c.closePath();c.fill();
    const cols=[k.a2,k.a3,k.card];for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.vy+=.18;p.x+=p.vx;p.y+=p.vy;p.r+=.1;p.l++;if(p.l>140){parts.splice(i,1);continue;}c.save();c.translate(p.x,p.y);c.rotate(p.r);c.fillStyle=cols[p.c];c.fillRect(-5,-2.5,10,5);c.restore();}};});

bg($('#glosario'),S=>{return t=>{const c=S.ctx,w=S.w,h=S.h,k=S.k,g=48;c.clearRect(0,0,w,h);c.lineWidth=1.2;
  for(let y=g/2;y<h;y+=g)for(let x=g/2;x<w;x+=g){const v=.5+.5*Math.sin(x*.03+y*.02+t*.8);let near=0;if(S.mx>-9000)near=Math.exp(-((x-S.mx)**2+(y-S.my)**2)/(2*120*120));
    const s=3+v*3+near*6;c.strokeStyle=near>.3?rgba(k.a1,.25+near*.5):rgba(k.a2,.1+v*.12);c.beginPath();c.moveTo(x-s,y);c.lineTo(x+s,y);c.moveTo(x,y-s);c.lineTo(x,y+s);c.stroke();}};});

/* ================= WINDOWS: prompts + minimize ================= */
const PROMPTS={
pendulo:'Haz un simulador de péndulo doble para explicar caos en Física I. Integra con RK4, dibuja dos péndulos que empiezan separados por 10⁻ⁿ radianes, deja el trazo de las puntas y muestra la separación en metros. Sliders: ángulo inicial, diferencia inicial y razón de masas. Estética de plano técnico azul. Pruébalo en celular antes de publicar.',
fourier:'Quiero un visualizador de series de Fourier: el usuario dibuja una figura con el dedo y la página la reconstruye con epiciclos (círculos que giran). Usa la transformada discreta con 200 muestras, ordena los términos por amplitud y deja un slider para el número de círculos. Incluye corazón, estrella e infinito como ejemplos.',
sir:'Simulador SIR de epidemias para Salud Pública: sliders de R₀, días de contagio, vacunación inicial y reducción de contactos. Gráfica de susceptibles, infectados y recuperados en 200 días, línea de capacidad hospitalaria ilustrativa, y una cuadrícula de 200 personas que cambia con el día. Muestra R efectivo, pico y total. Aclara que es un modelo didáctico, no un pronóstico.',
adn:'Hazme un traductor de ADN a proteína para Biología: pego una secuencia, encuentra el codón de inicio, transcribe a ARNm, traduce con el código genético estándar y colorea los aminoácidos por propiedad química. Agrega un botón que mute una base al azar y explique si la mutación es silenciosa, de sentido erróneo o sin sentido.',
elec:'Simulador de sistemas electorales para Ciencia Política: cinco partidos ficticios con sliders de votos, número de escaños y umbral mínimo. Compara D\'Hondt, Sainte-Laguë y Hare con resto mayor en una tabla, dibuja el hemiciclo del método elegido, calcula el índice de Gallagher y deja marcar partidos para ver si una coalición alcanza mayoría.',
pd:'Recrea el torneo de Axelrod del dilema del prisionero iterado para Relaciones Internacionales: siete estrategias (ojo por ojo, generoso, rencoroso, Pavlov, siempre coopera, siempre traiciona, aleatorio), rondas y ruido ajustables, ranking por puntos por ronda, y un modo para jugar 10 rondas contra un rival misterioso que se revela al final.',
seq:'Haz una caja de ritmos pentatónica de 16 pasos con Web Audio: cinco notas más bombo, control de tempo y forma de onda, botón de patrón aleatorio con buen gusto. El sonido arranca solo con un clic. Estética risográfica rosa y azul, y que el fondo reaccione al volumen.',
render:'Haz un módulo de render en tiempo real con WebGL y cuatro escenas en shaders: océano con suma de ondas y reflejos Fresnel; mundo de bloques con trazado de rayos DDA, sombras y oclusión ambiental; fogata volumétrica con emisión de cuerpo negro; mar de nubes volumétricas con dispersión Henyey-Greenstein. Controles de hora del sol, intensidad y calidad (modo papa, auto, máximo), cámara que se arrastra y contador de FPS con resolución adaptativa.',
arq:'Haz un estudio 3D de arquitectura con three.js: un showroom de lujo (muro de ónix, lambrín de nogal con latón, tragaluz con vigas, candil de cadenas, piso de mármol) y una villa frente al mar con alberca, muelle y yate. Carga un auto glTF con licencia abierta, con variantes de pintura y faros encendibles. Controles de hora del sol con sombras, corte de sección, vista de alambre tipo AutoCAD y cámaras predefinidas. Materiales procedurales, sin fotos.',
zipf:'Herramienta de humanidades digitales: pego un texto en español y calcula palabras totales, distintas, hápax y razón tipo/token; muestra las 14 palabras más frecuentes y una gráfica log-log de rango contra frecuencia con la recta de Zipf. Opción para quitar palabras vacías. Incluye fragmentos de Cervantes y Sor Juana como ejemplo.'
};
$$('.win[data-prompt]').forEach(w=>{const key=w.dataset.prompt,txt=PROMPTS[key];const ov=document.createElement('div');ov.className='win-prompt';ov.hidden=true;
  ov.innerHTML=`<span class="eyebrow" style="margin:0"><i>?</i> El prompt que arma este prototipo</span><blockquote></blockquote><div class="row"><button class="btn solid sm" data-a="copy">Copiar prompt</button><button class="btn sm" data-a="close">Volver al prototipo</button></div><p style="font-size:.85rem;color:var(--ink2)">Pégalo en una sesión de Claude Code o en claude.ai y pide que lo publique como Artifact. Luego itera: «más grande», «agrega un modo oscuro», «explica cada slider».</p>`;
  ov.querySelector('blockquote').textContent=txt;w.appendChild(ov);
  w.querySelector('.wb-q').addEventListener('click',()=>{ov.hidden=!ov.hidden;});
  ov.querySelector('[data-a=copy]').addEventListener('click',e=>copy(txt,e.currentTarget));ov.querySelector('[data-a=close]').addEventListener('click',()=>ov.hidden=true);
  w.querySelector('.wb-min').addEventListener('click',e=>{w.classList.toggle('min');e.currentTarget.textContent=w.classList.contains('min')?'□':'_';});});

/* range fill */
function fillR(r){const p=(r.value-r.min)/(r.max-r.min)*100;r.style.setProperty('--v',p+'%');}
document.addEventListener('input',e=>{if(e.target.type==='range')fillR(e.target);});

/* ================= P1: DOUBLE PENDULUM ================= */
(function(){const cv=$('#pdCv'),k=tok($('#area-1'));const g=9.81,l1=1,l2=1;let m1=1,m2=1,st,trails,time=0,paused=false,dirty=true;
  function der(s){const[a1,a2,w1,w2]=s,d=a1-a2,den=2*m1+m2-m2*Math.cos(2*a1-2*a2);
    const A1=(-g*(2*m1+m2)*Math.sin(a1)-m2*g*Math.sin(a1-2*a2)-2*Math.sin(d)*m2*(w2*w2*l2+w1*w1*l1*Math.cos(d)))/(l1*den);
    const A2=(2*Math.sin(d)*(w1*w1*l1*(m1+m2)+g*(m1+m2)*Math.cos(a1)+w2*w2*l2*m2*Math.cos(d)))/(l2*den);return[w1,w2,A1,A2];}
  function rk(s,h){const k1=der(s),k2=der(s.map((v,i)=>v+k1[i]*h/2)),k3=der(s.map((v,i)=>v+k2[i]*h/2)),k4=der(s.map((v,i)=>v+k3[i]*h));return s.map((v,i)=>v+h/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]));}
  const tip=s=>[l1*Math.sin(s[0])+l2*Math.sin(s[1]),l1*Math.cos(s[0])+l2*Math.cos(s[1])];
  function reset(){const a=+$('#pdAng').value*Math.PI/180,dl=+$('#pdDelta').value;m2=+$('#pdMass').value;st=[[a,a,0,0],[a+Math.pow(10,-dl),a,0,0]];trails=[[],[]];time=0;dirty=true;
    $('#pdAngO').textContent=$('#pdAng').value+'°';$('#pdDeltaO').textContent='10'+sup(dl).replace(/^/,'⁻')+' rad';$('#pdMassO').textContent=m2.toFixed(1);}
  ['pdAng','pdDelta','pdMass'].forEach(id=>$('#'+id).addEventListener('input',reset));$('#pdReset').addEventListener('click',reset);
  $('#pdPause').addEventListener('click',e=>{paused=!paused;e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.textContent=paused?'Seguir':'Pausa';T.anim=!paused;});
  reset();
  const T=addTask(cv,()=>{const[c,w,h]=fit(cv);if(!paused){for(let i=0;i<4;i++){st=st.map(s=>rk(s,1/240));time+=1/240;}st.forEach((s,i)=>{trails[i].push(tip(s));if(trails[i].length>260)trails[i].shift();});}
    const sc=Math.min(w,h)/4.7,ox=w/2,oy=h*.42;c.clearRect(0,0,w,h);
    c.strokeStyle=rgba(k.ink,.07);c.lineWidth=1;c.beginPath();for(let r=1;r<=2;r++){c.moveTo(ox+r*sc,oy);c.arc(ox,oy,r*sc,0,TAU);}c.stroke();
    c.setLineDash([3,5]);c.beginPath();c.moveTo(ox,oy-2.2*sc);c.lineTo(ox,oy+2.2*sc);c.moveTo(ox-2.2*sc,oy);c.lineTo(ox+2.2*sc,oy);c.stroke();c.setLineDash([]);
    const cols=[k.a1,k.a2];
    trails.forEach((tr,i)=>{for(let j=1;j<tr.length;j++){c.strokeStyle=rgba(cols[i],j/tr.length*.85);c.lineWidth=1.6;c.beginPath();c.moveTo(ox+tr[j-1][0]*sc,oy+tr[j-1][1]*sc);c.lineTo(ox+tr[j][0]*sc,oy+tr[j][1]*sc);c.stroke();}});
    st.forEach((s,i)=>{const x1=ox+l1*Math.sin(s[0])*sc,y1=oy+l1*Math.cos(s[0])*sc,x2=x1+l2*Math.sin(s[1])*sc,y2=y1+l2*Math.cos(s[1])*sc;
      c.strokeStyle=rgba(k.ink,.85);c.lineWidth=2.4;c.beginPath();c.moveTo(ox,oy);c.lineTo(x1,y1);c.lineTo(x2,y2);c.stroke();
      c.fillStyle=cols[i];c.beginPath();c.arc(x1,y1,6+m1*2,0,TAU);c.fill();c.beginPath();c.arc(x2,y2,5+m2*3,0,TAU);c.fill();});
    c.fillStyle=k.ink;c.beginPath();c.arc(ox,oy,4,0,TAU);c.fill();
    c.fillStyle=rgba(k.ink,.5);c.font='500 10px "Geist Mono",monospace';c.fillText('l₁ = l₂ = 1 m · g = 9.81 m/s²',10,18);
    const a=tip(st[0]),b=tip(st[1]),sep=Math.hypot(a[0]-b[0],a[1]-b[1]);$('#pdT').textContent=time.toFixed(1)+' s';$('#pdSep').textContent=sep<1e-3?sep.toExponential(1)+' m':sep.toFixed(3)+' m';},{anim:true});
})();

/* ================= P2: FOURIER ================= */
(function(){const cv=$('#frCv'),k=tok($('#area-1'));const N=200;let pts=[],coef=[],K=30,ph=0,trace=[],drawing=false,raw=[],name='corazón';
  function norm(P){let mx=0,my=0;P.forEach(p=>{mx+=p[0];my+=p[1];});mx/=P.length;my/=P.length;let r=0;P.forEach(p=>{r=Math.max(r,Math.hypot(p[0]-mx,p[1]-my));});return P.map(p=>[(p[0]-mx)/r,(p[1]-my)/r]);}
  function resample(P,n){const Q=[...P,P[0]],d=[0];for(let i=1;i<Q.length;i++)d.push(d[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]));const L=d[d.length-1]||1,out=[];let j=1;
    for(let i=0;i<n;i++){const tg=i/n*L;while(j<d.length-1&&d[j]<tg)j++;const s=(tg-d[j-1])/((d[j]-d[j-1])||1);out.push([lerp(Q[j-1][0],Q[j][0],s),lerp(Q[j-1][1],Q[j][1],s)]);}return out;}
  function dft(P){const n=P.length,o=[];for(let q=0;q<n;q++){let re=0,im=0;for(let j=0;j<n;j++){const a=TAU*q*j/n,ca=Math.cos(a),sa=Math.sin(a);re+=P[j][0]*ca+P[j][1]*sa;im+=P[j][1]*ca-P[j][0]*sa;}o.push({f:q<=n/2?q:q-n,amp:Math.hypot(re,im)/n,ph:Math.atan2(im,re)});}return o.sort((a,b)=>b.amp-a.amp);}
  function setPts(P,nm){pts=norm(resample(P,N));coef=dft(pts);trace=[];ph=0;name=nm;$('#frName').textContent=nm;T&&(T.dirty=true);}
  const PRE={heart:()=>Array.from({length:300},(_,i)=>{const t=i/300*TAU;return[16*Math.sin(t)**3,-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))];}),
    star:()=>{const v=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?.42:1;v.push([Math.cos(a)*r,Math.sin(a)*r]);}return v;},
    inf:()=>Array.from({length:300},(_,i)=>{const t=i/300*TAU,d=1+Math.sin(t)**2;return[Math.cos(t)/d,Math.sin(t)*Math.cos(t)/d];})};
  const NAMES={heart:'corazón',star:'estrella',inf:'infinito'};
  $$('#frPreset button').forEach(b=>b.addEventListener('click',()=>{$$('#frPreset button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));setPts(PRE[b.dataset.p](),NAMES[b.dataset.p]);}));
  $('#frRange').addEventListener('input',e=>{K=+e.target.value;$('#frRangeO').textContent=K;$('#frK').textContent=`${K} de ${N}`;trace=[];});
  const pos=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];};
  cv.addEventListener('pointerdown',e=>{drawing=true;raw=[pos(e)];cv.setPointerCapture(e.pointerId);});
  cv.addEventListener('pointermove',e=>{if(!drawing)return;const p=pos(e),l=raw[raw.length-1];if(Math.hypot(p[0]-l[0],p[1]-l[1])>2)raw.push(p);T.dirty=true;});
  const end=()=>{if(!drawing)return;drawing=false;if(raw.length>12){setPts(raw,'tu dibujo');$$('#frPreset button').forEach(x=>x.setAttribute('aria-pressed','false'));}raw=[];};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  let T=null;setPts(PRE.heart(),'corazón');
  T=addTask(cv,()=>{const[c,w,h]=fit(cv);c.clearRect(0,0,w,h);const sc=Math.min(w,h)*.36,cx=w/2,cy=h/2;
    c.strokeStyle=rgba(k.ink,.12);c.lineWidth=1;c.setLineDash([3,4]);c.beginPath();pts.forEach((p,i)=>i?c.lineTo(cx+p[0]*sc,cy+p[1]*sc):c.moveTo(cx+p[0]*sc,cy+p[1]*sc));c.closePath();c.stroke();c.setLineDash([]);
    if(drawing){c.strokeStyle=k.a3;c.lineWidth=3;c.beginPath();raw.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();return;}
    let x=cx,y=cy;for(let i=0;i<K;i++){const q=coef[i],r=q.amp*sc,a=q.f*ph+q.ph,nx=x+r*Math.cos(a),ny=y+r*Math.sin(a);
      if(r>.6){c.strokeStyle=rgba(k.ink,.16);c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();}c.strokeStyle=rgba(k.a2,.7);c.beginPath();c.moveTo(x,y);c.lineTo(nx,ny);c.stroke();x=nx;y=ny;}
    trace.push([x,y]);c.strokeStyle=k.a1;c.lineWidth=2.6;c.lineCap='round';c.beginPath();trace.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.fillStyle=k.a1;c.beginPath();c.arc(x,y,4,0,TAU);c.fill();
    ph+=TAU/N*(RM?2:1);if(ph>=TAU){ph-=TAU;trace=[];}},{anim:true});
})();

/* ================= P3: SIR ================= */
(function(){const cv=$('#sirCv'),k=tok($('#area-2'));let data=[],day=60;const grid=$('#sirGrid');grid.innerHTML='<i></i>'.repeat(200);const dots=[...grid.children];
  function run(){const R0=+$('#sirR0').value,D=+$('#sirD').value,v=+$('#sirV').value/100,m=+$('#sirM').value/100,gm=1/D,b=R0*(1-m)*gm;
    let S=Math.max(0,1-v-.001),I=.001,R=v;data=[[S,I,R]];for(let d=1;d<=200;d++){for(let q=0;q<10;q++){const inf=b*S*I*.1,rec=gm*I*.1;S=Math.max(0,S-inf);I+=inf-rec;R+=rec;}data.push([S,I,R]);}
    let pk=0,pd=0;data.forEach((x,i)=>{if(x[1]>pk){pk=x[1];pd=i;}});const tot=data[200][2]+data[200][1]-v;
    $('#sirR0O').textContent=R0.toFixed(1);$('#sirDO').textContent=D;$('#sirVO').textContent=Math.round(v*100)+'%';$('#sirMO').textContent=Math.round(m*100)+'%';
    $('#sirRe').textContent=(R0*(1-m)*(1-v)).toFixed(2);$('#sirPk').textContent=(pk*100).toFixed(1)+'%';$('#sirPd').textContent=pk<.0015?'sin brote':pd;$('#sirTot').textContent=(Math.max(0,tot)*100).toFixed(1)+'%';upGrid();T.dirty=true;}
  function upGrid(){const[S,I,R]=data[day];const nR=Math.round(R*200),nI=Math.round(I*200);dots.forEach((d,i)=>{d.className=i<nR?'r':i<nR+nI?'i':'';});$('#sirDayO').textContent=day;}
  ['sirR0','sirD','sirV','sirM'].forEach(id=>$('#'+id).addEventListener('input',run));
  $('#sirDay').addEventListener('input',e=>{day=+e.target.value;upGrid();T.dirty=true;});
  const st=cv.parentElement;st.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),l=40,rr=12;const d=Math.round(clamp((e.clientX-r.left-l)/(r.width-l-rr),0,1)*200);if(d!==day){day=d;$('#sirDay').value=d;fillR($('#sirDay'));upGrid();T.dirty=true;}});
  const T=addTask(cv,()=>{const[c,w,h]=fit(cv);c.clearRect(0,0,w,h);const L=40,Rr=12,Tp=14,B=26,X=d=>L+d/200*(w-L-Rr),Y=v=>Tp+(1-v)*(h-Tp-B);
    c.font='500 10px "Geist Mono",monospace';c.fillStyle=rgba(k.ink,.55);c.strokeStyle=rgba(k.ink,.1);c.lineWidth=1;
    [0,.25,.5,.75,1].forEach(v=>{c.beginPath();c.moveTo(L,Y(v)+.5);c.lineTo(w-Rr,Y(v)+.5);c.stroke();c.textAlign='right';c.fillText(Math.round(v*100)+'%',L-6,Y(v)+3);});
    [0,50,100,150,200].forEach(d=>{c.textAlign='center';c.fillText(d+(d===200?' días':''),Math.min(X(d),w-Rr-18),h-8);});
    c.setLineDash([5,4]);c.strokeStyle=rgba(k.a1,.7);c.beginPath();c.moveTo(L,Y(.1));c.lineTo(w-Rr,Y(.1));c.stroke();c.setLineDash([]);c.textAlign='right';c.fillStyle=k.a1;c.fillText('capacidad hospitalaria (ilustrativa)',w-Rr-4,Y(.1)-5);
    c.beginPath();c.moveTo(X(0),Y(0));data.forEach((x,i)=>c.lineTo(X(i),Y(x[1])));c.lineTo(X(200),Y(0));c.closePath();c.fillStyle=rgba(k.a1,.22);c.fill();
    [[0,k.a2],[1,k.a1],[2,k.a3]].forEach(([j,col])=>{c.strokeStyle=col;c.lineWidth=2.4;c.beginPath();data.forEach((x,i)=>i?c.lineTo(X(i),Y(x[j])):c.moveTo(X(i),Y(x[j])));c.stroke();});
    c.strokeStyle=rgba(k.ink,.55);c.lineWidth=1;c.beginPath();c.moveTo(X(day),Tp);c.lineTo(X(day),h-B);c.stroke();
    [[0,k.a2],[1,k.a1],[2,k.a3]].forEach(([j,col])=>{c.fillStyle=col;c.beginPath();c.arc(X(day),Y(data[day][j]),4.5,0,TAU);c.fill();c.strokeStyle=k.card;c.lineWidth=2;c.stroke();});});
  run();
})();

/* ================= P4: DNA ================= */
(function(){const B='TCAG',AA='FFLLSSSSYY**C*WWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
  /* standard code: index 16*i+4*j+k over TCAG; TGA stop, TGG Trp */
  const TABLE='FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
  const tr=c=>{const i=B.indexOf(c[0]),j=B.indexOf(c[1]),q=B.indexOf(c[2]);return TABLE[16*i+4*j+q];};
  const N3={A:'Ala',R:'Arg',N:'Asn',D:'Asp',C:'Cys',Q:'Gln',E:'Glu',G:'Gly',H:'His',I:'Ile',L:'Leu',K:'Lys',M:'Met',F:'Phe',P:'Pro',S:'Ser',T:'Thr',W:'Trp',Y:'Tyr',V:'Val','*':'Paro'};
  const NM={A:'alanina',R:'arginina',N:'asparagina',D:'ácido aspártico',C:'cisteína',Q:'glutamina',E:'ácido glutámico',G:'glicina',H:'histidina',I:'isoleucina',L:'leucina',K:'lisina',M:'metionina',F:'fenilalanina',P:'prolina',S:'serina',T:'treonina',W:'triptófano',Y:'tirosina',V:'valina','*':'codón de paro'};
  const k=tok($('#area-2'));const CL={h:{n:'hidrofóbico',c:'#E8A33D',s:'AVILMFWP'},p:{n:'polar',c:k.a2,s:'STCYNQG'},a:{n:'ácido',c:k.a1,s:'DE'},b:{n:'básico',c:k.a3,s:'KRH'},x:{n:'paro',c:'#6B6B80',s:'*'}};
  const cls=a=>Object.values(CL).find(c=>c.s.includes(a));
  $('#aaLeg').innerHTML=Object.values(CL).map(c=>`<span><i style="--c:${c.c}"></i>${c.n}</span>`).join('');
  const EX='CCGCATGTCTGAACTTCGTGAAAATCCAGGCCTTTGGTACACCGAAGCGTAAGGC';let seq=EX,mut=-1;
  const ta=$('#dnaIn');ta.value=EX;
  function parse(){const s=seq,st=s.indexOf('ATG');const sq=$('#dnaSeq'),cd=$('#dnaCod');
    if(st<0){sq.textContent=s||'(vacía)';cd.innerHTML='';$('#dnaInfo').textContent='sin ATG';return null;}
    const cods=[];let end=s.length;for(let i=st;i+3<=s.length;i+=3){const c=s.slice(i,i+3),a=tr(c);cods.push({c,a,i});if(a==='*'){end=i+3;break;}}
    let html='';for(let i=0;i<s.length;i++){const ch=s[i];let cl='';if(i===mut)cl='mu';else if(i>=st&&i<st+3)cl='st';html+=cl?`<span class="${cl}">${ch}</span>`:ch;if(i>=st&&i<end&&(i-st)%3===2&&i<end-1)html+=' ';}
    sq.innerHTML=html;cd.innerHTML=cods.map(o=>{const C=cls(o.a);const isM=mut>=o.i&&mut<o.i+3;return`<span class="cod${isM?' mut':''}" style="--c:${C.c}" title="${NM[o.a]}"><span>${o.c.replace(/T/g,'U')}</span><b>${N3[o.a]}</b></span>`;}).join('');
    const prot=cods.map(o=>o.a).join('');$('#dnaInfo').textContent=`inicio en la base ${st+1} · ${prot.replace('*','').length} aminoácidos`;return{st,cods,end};}
  ta.addEventListener('input',()=>{seq=ta.value.toUpperCase().replace(/U/g,'T').replace(/[^ACGT]/g,'');mut=-1;const r=parse();$('#dnaMsg').textContent=r?'Proteína: '+r.cods.map(o=>o.a).join('').replace('*',' · paro'):'No encontré un codón de inicio ATG. Agrega uno.';});
  $('#dnaEx').addEventListener('click',()=>{seq=EX;ta.value=EX;mut=-1;parse();$('#dnaMsg').textContent='Ejemplo cargado. Proteína: MSELRENPGLWYTEA, y paro.';});
  $('#dnaMut').addEventListener('click',()=>{const r=parse();if(!r||r.cods.length<3)return;const lo=r.st+3,hi=r.end-3;if(hi<=lo)return;const p=lo+Math.floor(Math.random()*(hi-lo));
    const old=seq[p],nb='ACGT'.replace(old,'')[Math.random()*3|0];const ci=Math.floor((p-r.st)/3),oc=r.cods[ci].c,pos=(p-r.st)%3,nc=oc.slice(0,pos)+nb+oc.slice(pos+1);const oa=tr(oc),na=tr(nc);
    seq=seq.slice(0,p)+nb+seq.slice(p+1);ta.value=seq;mut=p;parse();
    const kind=oa===na?`Silenciosa: ${oc}→${nc} sigue codificando ${NM[oa]}. La proteína no cambia.`:na==='*'?`Sin sentido: ${oc}→${nc} ahora es codón de paro. La proteína se corta en el aminoácido ${ci}.`:`De sentido erróneo: ${NM[oa]} cambió a ${NM[na]} en la posición ${ci+1}. ${cls(oa)===cls(na)?'Misma familia química: quizá tolerable.':'Cambió de familia química: puede afectar el plegamiento.'}`;
    $('#dnaMsg').textContent=`Base ${p+1}: ${old}→${nb}. ${kind}`;});
  parse();$('#dnaMsg').textContent='Proteína: MSELRENPGLWYTEA, y paro. Prueba a mutarla.';
})();

/* ================= P5: ELECTORAL ================= */
(function(){const cv=$('#elCv'),k=tok($('#area-3'));
  const P=[{n:'Partido del Ctrl+Z',c:'#E8B04B',v:34},{n:'Frente Wi-Fi Libre',c:'#E05A47',v:27},{n:'Movimiento Café de Olla',c:'#7FB3FF',v:19},{n:'Liga de la Siesta',c:'#C49BFF',v:12},{n:'Unión Memera',c:'#4FD1A5',v:8}];
  let method='dh',coal=new Set([0]),res={};
  const box=$('#elParties');box.innerHTML=P.map((p,i)=>`<div class="party" style="--pc:${p.c}"><span class="sw" style="background:${p.c}"></span><span class="pn">${p.n}</span><span class="pv" id="pv${i}"></span><input type="range" min="0" max="60" value="${p.v}" data-i="${i}" aria-label="Votos de ${p.n}"></div>`).join('');
  box.querySelectorAll('input').forEach(r=>{fillR(r);r.addEventListener('input',()=>{P[+r.dataset.i].v=+r.value;calc();});});
  function alloc(m,votes,S,thr){const tot=votes.reduce((a,b)=>a+b,0)||1,vv=votes.map(v=>v/tot*100>=thr?v:0),seats=votes.map(()=>0),sum=vv.reduce((a,b)=>a+b,0);if(!sum)return seats;
    if(m==='hare'){const q=sum/S;let gv=0;const rem=vv.map((v,i)=>{const s=Math.floor(v/q);seats[i]=s;gv+=s;return[v/q-s,i];}).filter(x=>vv[x[1]]>0).sort((a,b)=>b[0]-a[0]);for(let j=0;gv<S;j=(j+1)%rem.length){seats[rem[j][1]]++;gv++;}}
    else{const dv=m==='dh'?s=>s+1:s=>2*s+1;for(let x=0;x<S;x++){let best=-1,bi=-1;vv.forEach((v,i)=>{if(!v)return;const q=v/dv(seats[i]);if(q>best){best=q;bi=i;}});seats[bi]++;}}return seats;}
  const gal=(vp,s,S)=>Math.sqrt(.5*vp.reduce((a,v,i)=>a+(v-s[i]/S*100)**2,0));
  function calc(){const S=+$('#elSeats').value,thr=+$('#elThr').value,votes=P.map(p=>p.v),tot=votes.reduce((a,b)=>a+b,0)||1,vp=votes.map(v=>v/tot*100);
    $('#elSeatsO').textContent=S;$('#elThrO').textContent=thr+'%';$('#elHint').textContent=S+' escaños · mayoría '+(Math.floor(S/2)+1);
    res={dh:alloc('dh',votes,S,thr),sl:alloc('sl',votes,S,thr),hare:alloc('hare',votes,S,thr)};
    P.forEach((p,i)=>$('#pv'+i).textContent=vp[i].toFixed(1)+'%');
    $('#elBody').innerHTML=P.map((p,i)=>{const mx=Math.max(res.dh[i],res.sl[i],res.hare[i]),mn=Math.min(res.dh[i],res.sl[i],res.hare[i]);const cel=m=>`<td class="${mx!==mn&&res[m][i]===mx?'hi':''}">${res[m][i]}</td>`;
      return`<tr><td><span class="sw" style="background:${p.c}"></span>${p.n}${vp[i]<thr?' <small style="color:var(--ink2)">(bajo umbral)</small>':''}</td><td>${vp[i].toFixed(1)}%</td>${cel('dh')}${cel('sl')}${cel('hare')}<td><input type="checkbox" class="chk" data-c="${i}" ${coal.has(i)?'checked':''} aria-label="Incluir ${p.n} en la coalición" style="accent-color:${p.c}"></td></tr>`;}).join('');
    $$('#elBody input[data-c]').forEach(ch=>ch.addEventListener('change',()=>{const i=+ch.dataset.c;ch.checked?coal.add(i):coal.delete(i);verdict();T.dirty=true;}));
    $('#g1').textContent=gal(vp,res.dh,S).toFixed(2);$('#g2').textContent=gal(vp,res.sl,S).toFixed(2);$('#g3').textContent=gal(vp,res.hare,S).toFixed(2);verdict();T.dirty=true;}
  function verdict(){const S=+$('#elSeats').value,maj=Math.floor(S/2)+1,s=res[method];const top=s.indexOf(Math.max(...s));const cs=[...coal].reduce((a,i)=>a+s[i],0);
    let t=s[top]>=maj?`${P[top].n} gobierna sola con ${s[top]} de ${S}.`:`Nadie llega a ${maj}. Toca negociar.`;
    if(coal.size)t+=` Tu coalición suma ${cs}: ${cs>=maj?'alcanza mayoría.':'le faltan '+(maj-cs)+'.'}`;$('#elVer').textContent=t;}
  $$('#elMethod button').forEach(b=>b.addEventListener('click',()=>{method=b.dataset.m;$$('#elMethod button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));verdict();T.dirty=true;}));
  ['elSeats','elThr'].forEach(id=>$('#'+id).addEventListener('input',calc));
  function layout(N){const rows=clamp(Math.round(Math.sqrt(N)/1.25),2,11),r0=.38,rs=[];for(let i=0;i<rows;i++)rs.push(r0+(1-r0)*(rows===1?1:i/(rows-1)));const sr=rs.reduce((a,b)=>a+b,0);
    let ns=rs.map(r=>Math.max(1,Math.round(N*r/sr)));let diff=N-ns.reduce((a,b)=>a+b,0);let ii=rows-1;while(diff!==0){ns[ii]+=Math.sign(diff);diff-=Math.sign(diff);ii=(ii-1+rows)%rows;}
    const seats=[];rs.forEach((r,i)=>{const n=ns[i];for(let j=0;j<n;j++){const a=n===1?Math.PI/2:Math.PI*(1-j/(n-1));seats.push({r,a});}});seats.sort((p,q)=>q.a-p.a||p.r-q.r);
    const gap=Math.min((1-r0)/Math.max(1,rows-1),Math.min(...rs.map((r,i)=>Math.PI*r/Math.max(1,ns[i]-1))));return{seats,dot:gap*.47};}
  const T=addTask(cv,()=>{const[c,w,h]=fit(cv);c.clearRect(0,0,w,h);const S=+$('#elSeats').value,s=res[method];if(!s)return;const{seats,dot}=layout(S);const cx=w/2,cy=h*.9,sc=Math.min(w/2.15,h*.84);
    const owner=[];s.forEach((n,i)=>{for(let j=0;j<n;j++)owner.push(i);});
    seats.forEach((st,i)=>{const o=owner[i];const x=cx+Math.cos(st.a)*st.r*sc,y=cy-Math.sin(st.a)*st.r*sc;c.beginPath();c.arc(x,y,dot*sc,0,TAU);c.fillStyle=o==null?rgba(k.ink,.15):P[o].c;c.globalAlpha=coal.size&&o!=null&&!coal.has(o)?.35:1;c.fill();c.globalAlpha=1;});
    c.fillStyle=k.ink;c.textAlign='center';c.font=`800 ${Math.round(sc*.16)}px "Unbounded",system-ui,sans-serif`;c.fillText(Math.max(...s),cx,cy-sc*.06);c.font='500 10px "Geist Mono",monospace';c.fillStyle=rgba(k.ink,.6);c.fillText('ESCAÑOS DEL PRIMERO',cx,cy+4);
    c.strokeStyle=rgba(k.ink,.35);c.setLineDash([3,4]);c.beginPath();c.moveTo(cx,cy-sc*1.04);c.lineTo(cx,cy-sc*.3);c.stroke();c.setLineDash([]);});
  calc();
})();

/* ================= P6: PRISONER ================= */
(function(){const STR=[
 {n:'Ojo por ojo',f:(m,o)=>o.length?o[o.length-1]:'C',d:'empieza cooperando y luego copia tu jugada anterior'},
 {n:'Ojo por ojo generoso',f:(m,o,r)=>!o.length||o[o.length-1]==='C'?'C':(r()<1/3?'C':'D'),d:'copia, pero perdona una de cada tres traiciones'},
 {n:'Pavlov',f:(m,o)=>!m.length?'C':(m[m.length-1]===o[o.length-1]?'C':'D'),d:'si le fue bien repite, si le fue mal cambia'},
 {n:'Rencoroso',f:(m,o)=>o.includes('D')?'D':'C',d:'coopera hasta la primera traición, y nunca perdona'},
 {n:'Siempre coopera',f:()=>'C',d:'paz incondicional'},
 {n:'Aleatorio',f:(m,o,r)=>r()<.5?'C':'D',d:'lanza una moneda'},
 {n:'Siempre traiciona',f:()=>'D',d:'realismo sin matices'}];
  const pay=(a,b)=>a==='C'?(b==='C'?3:0):(b==='C'?5:1);
  const mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  let seed=7;
  function match(A,B,R,nz,r){const ha=[],hb=[];let sa=0,sb=0;for(let i=0;i<R;i++){let a=A.f(ha,hb,r),b=B.f(hb,ha,r);if(r()<nz)a=a==='C'?'D':'C';if(r()<nz)b=b==='C'?'D':'C';ha.push(a);hb.push(b);sa+=pay(a,b);sb+=pay(b,a);}return[sa,sb];}
  function tour(){const R=+$('#pdRounds').value,nz=+$('#pdNoise').value/100,r=mul(seed);$('#pdRoundsO').textContent=R;$('#pdNoiseO').textContent=Math.round(nz*100)+'%';
    const tot=STR.map(()=>0);for(let i=0;i<STR.length;i++)for(let j=i;j<STR.length;j++){const[a,b]=match(STR[i],STR[j],R,nz,r);if(i===j)tot[i]+=a;else{tot[i]+=a;tot[j]+=b;}}
    const sc=tot.map((t,i)=>({i,v:t/(R*STR.length)})).sort((a,b)=>b.v-a.v);
    $('#pdBars').innerHTML=sc.map((s,ix)=>`<div class="bar"><span title="${STR[s.i].d}">${ix===0?'🏆 ':''}${STR[s.i].n}</span><span class="bt"><i style="width:${s.v/5*100}%"></i></span><b>${s.v.toFixed(2)}</b></div>`).join('');
    const w=STR[sc[0].i];$('#pdNote').textContent=`Gana «${w.n}»: ${w.d}. Puntos promedio por ronda, de 0 a 5. ${nz>0?'Con ruido, perdonar empieza a pagar.':'Sube el ruido y mira quién sufre.'}`;}
  ['pdRounds','pdNoise'].forEach(id=>$('#'+id).addEventListener('input',tour));$('#pdRerun').addEventListener('click',()=>{seed=(Math.random()*1e9)|0;tour();});tour();
  let opp,mh=[],oh=[],me=0,op=0;const rr=Math.random;
  function newOpp(){opp=STR[Math.random()*STR.length|0];mh=[];oh=[];me=0;op=0;draw();$('#pdReveal').textContent='Nuevo rival. ¿Confías o no confías?';}
  function draw(){$('#pdHist').innerHTML=mh.map((m,i)=>`<div><i class="${m}">${m==='C'?'C':'T'}</i><i class="${oh[i]}">${oh[i]==='C'?'C':'T'}</i></div>`).join('');$('#pdMe').textContent=me;$('#pdOp').textContent=op;$('#pdRound').textContent=`Ronda ${mh.length} de 10`;}
  function play(a){if(mh.length>=10)return;const b=opp.f(oh,mh,rr);mh.push(a);oh.push(b);me+=pay(a,b);op+=pay(b,a);draw();
    if(mh.length===10)$('#pdReveal').textContent=`Tu rival era «${opp.n}»: ${opp.d}. ${me>op?'Le ganaste.':me===op?'Empate técnico.':'Te ganó.'} En el torneo importa el total, no ganarle a cada uno.`;
    else $('#pdReveal').textContent=b==='C'?'Tu rival cooperó.':'Tu rival traicionó.';}
  $('#pdC').addEventListener('click',()=>play('C'));$('#pdD').addEventListener('click',()=>play('D'));$('#pdNew').addEventListener('click',newOpp);newOpp();$('#pdReveal').textContent='¿Quién será? Juega diez rondas y te digo.';
})();

/* ================= P7: SEQUENCER ================= */
let AC=null,master=null,analyser=null;
function audio(){if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C();master=AC.createGain();master.gain.value=.2;analyser=AC.createAnalyser();analyser.fftSize=512;master.connect(analyser);analyser.connect(AC.destination);}if(AC.state==='suspended')AC.resume();return AC;}
(function(){const ROWS=[{n:'La',f:440},{n:'Sol',f:392},{n:'Mi',f:329.63},{n:'Re',f:293.66},{n:'Do',f:261.63},{n:'Bombo',f:0}];
  const pat=ROWS.map(()=>Array(16).fill(false));
  const PRE={0:[14],1:[6,10],2:[2,4,12],3:[8],4:[0,11],5:[0,4,8,12]};Object.entries(PRE).forEach(([r,a])=>a.forEach(s=>pat[r][s]=true));
  const g=$('#seqGrid');let html='';ROWS.forEach((r,ri)=>{html+=`<span class="rl">${r.n}</span>`;for(let s=0;s<16;s++)html+=`<button class="${ri===5?'kick ':''}${s%4===0?'q':''}" data-r="${ri}" data-s="${s}" aria-pressed="${pat[ri][s]}" aria-label="${r.n}, paso ${s+1}"></button>`;});g.innerHTML=html;
  const btns=$$('button',g);const sync=()=>btns.forEach(b=>b.setAttribute('aria-pressed',String(pat[b.dataset.r][b.dataset.s])));
  g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const r=+b.dataset.r,s=+b.dataset.s;pat[r][s]=!pat[r][s];b.setAttribute('aria-pressed',String(pat[r][s]));if(pat[r][s]&&audio())trig(r,AC.currentTime+.01);});
  function note(f,t){const o=AC.createOscillator(),gn=AC.createGain(),fl=AC.createBiquadFilter();o.type=$('#seqWave').value;o.frequency.value=f;fl.type='lowpass';fl.frequency.value=2600;gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(.55,t+.008);gn.gain.exponentialRampToValueAtTime(.0001,t+.4);o.connect(fl);fl.connect(gn);gn.connect(master);o.start(t);o.stop(t+.45);}
  function kick(t){const o=AC.createOscillator(),gn=AC.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);gn.gain.setValueAtTime(1,t);gn.gain.exponentialRampToValueAtTime(.001,t+.32);o.connect(gn);gn.connect(master);o.start(t);o.stop(t+.35);}
  const trig=(r,t)=>ROWS[r].f?note(ROWS[r].f,t):kick(t);
  let on=false,cur=0,nextT=0,timer=null,q=[],ph=-1;
  function sched(){const spb=60/+$('#seqBpm').value/4;while(nextT<AC.currentTime+.12){for(let r=0;r<6;r++)if(pat[r][cur])trig(r,nextT);q.push({s:cur,t:nextT});nextT+=spb;cur=(cur+1)%16;}}
  $('#seqPlay').addEventListener('click',e=>{const b=e.currentTarget;if(!on){if(!audio()){toast('Este navegador no tiene Web Audio.');return;}on=true;cur=0;nextT=AC.currentTime+.06;q=[];timer=setInterval(sched,25);sched();b.textContent='Stop';b.setAttribute('aria-pressed','true');T.anim=true;}
    else{on=false;clearInterval(timer);b.textContent='Play';b.setAttribute('aria-pressed','false');btns.forEach(x=>x.classList.remove('ph'));AUDIO_LVL=0;T.anim=false;}});
  $('#seqBpm').addEventListener('input',e=>$('#seqBpmO').textContent=e.target.value+' bpm');
  $('#seqClear').addEventListener('click',()=>{pat.forEach(r=>r.fill(false));sync();});
  $('#seqRand').addEventListener('click',()=>{pat.forEach((r,ri)=>r.fill(false));for(let s=0;s<16;s++){if(ri5(s))pat[5][s]=true;if(Math.random()<.42){pat[Math.random()*5|0][s]=true;}}sync();});
  const ri5=s=>s%4===0||(s===10&&Math.random()<.5);
  const buf=new Uint8Array(512);
  const T=addTask(g,()=>{if(!on||!AC)return;while(q.length&&q[0].t<=AC.currentTime){ph=q.shift().s;btns.forEach(b=>b.classList.toggle('ph',+b.dataset.s===ph));}
    analyser.getByteTimeDomainData(buf);let s=0;for(let i=0;i<buf.length;i++){const v=(buf[i]-128)/128;s+=v*v;}const lv=Math.sqrt(s/buf.length);AUDIO_LVL=lerp(AUDIO_LVL,clamp(lv*3,0,1),.3);BGS.forEach(B=>B.sec.id==='area-4'&&(B.T.dirty=true));});
})();

/* ================= P8: ZIPF ================= */
(function(){const cv=$('#zCv'),k=tok($('#area-4'));
  const TX={q:'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda. El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza, que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza.',
   s:'Hombres necios que acusáis\na la mujer sin razón,\nsin ver que sois la ocasión\nde lo mismo que culpáis:\nsi con ansia sin igual\nsolicitáis su desdén,\n¿por qué queréis que obren bien\nsi las incitáis al mal?\nCombatís su resistencia\ny luego, con gravedad,\ndecís que fue liviandad\nlo que hizo la diligencia.'};
  const STOP=new Set('de la que el en y a los del se las por un para con no una su al lo como más mas pero sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros mi mis tú te ti tu tus ellas era eran ha fue ser es son si así que'.split(' '));
  const ta=$('#zIn');ta.value=TX.q;let ranks=[];
  function run(){const words=(ta.value.toLowerCase().match(/[a-záéíóúüñ]+/g)||[]);const useStop=$('#zStop').checked;const f=new Map();let n=0;
    for(const w of words){if(useStop&&STOP.has(w))continue;n++;f.set(w,(f.get(w)||0)+1);}
    ranks=[...f.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));const hap=ranks.filter(r=>r[1]===1).length;
    $('#zN').textContent=n;$('#zV').textContent=ranks.length;$('#zH').textContent=hap;$('#zT').textContent=n?(ranks.length/n).toFixed(2):'0';
    const mx=ranks[0]?ranks[0][1]:1;$('#zBars').innerHTML=ranks.slice(0,14).map(r=>`<div class="zb"><span>${r[0]}</span><span class="bt"><i style="width:${r[1]/mx*100}%"></i></span><b>${r[1]}</b></div>`).join('')||'<p style="color:var(--ink2)">Pega un texto para empezar.</p>';T.dirty=true;}
  ta.addEventListener('input',run);$('#zStop').addEventListener('change',run);
  $$('#zSample button').forEach(b=>b.addEventListener('click',()=>{$$('#zSample button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));ta.value=TX[b.dataset.z];run();}));
  const T=addTask(cv,()=>{const[c,w,h]=fit(cv);c.clearRect(0,0,w,h);if(!ranks.length)return;const L=34,B=30,Tp=12,R=10;const mr=Math.log10(ranks.length)||1,mf=Math.log10(ranks[0][1])||1;
    const X=v=>L+v/mr*(w-L-R),Y=v=>Tp+(1-v/mf)*(h-Tp-B);c.strokeStyle=rgba(k.ink,.1);c.lineWidth=1;c.font='500 9px "Geist Mono",monospace';c.fillStyle=rgba(k.ink,.55);
    for(let e=0;e<=Math.ceil(mr);e++){if(e>mr+.01)break;c.beginPath();c.moveTo(X(e),Tp);c.lineTo(X(e),h-B);c.stroke();c.textAlign='center';c.fillText(String(10**e),X(e),h-B+12);}
    for(let e=0;e<=Math.ceil(mf);e++){if(e>mf+.01)break;c.beginPath();c.moveTo(L,Y(e));c.lineTo(w-R,Y(e));c.stroke();c.textAlign='right';c.fillText(String(10**e),L-4,Y(e)+3);}
    c.textAlign='center';c.fillText('rango (log)',(L+w-R)/2,h-4);c.save();c.translate(10,(Tp+h-B)/2);c.rotate(-Math.PI/2);c.fillText('frecuencia (log)',0,0);c.restore();
    c.setLineDash([5,4]);c.strokeStyle=k.a1;c.lineWidth=1.6;c.beginPath();c.moveTo(X(0),Y(mf));c.lineTo(X(Math.min(mr,mf)),Y(mf-Math.min(mr,mf)));c.stroke();c.setLineDash([]);
    ranks.forEach((r,i)=>{c.fillStyle=rgba(k.a2,.75);c.beginPath();c.arc(X(Math.log10(i+1)),Y(Math.log10(r[1])),2.6,0,TAU);c.fill();});
    c.fillStyle=k.a1;c.textAlign='right';c.fillText('Zipf ideal: f ∝ 1/rango',w-R-2,Tp+10);});
  run();
})();

/* ================= IDEAS (tickets) ================= */
const IDEAS={
1:[['Calculadora de vigas','Arrastra cargas y apoyos; ve cortante y momento flector.','Haz una calculadora de vigas simplemente apoyadas: el usuario arrastra cargas puntuales y distribuidas, y la página dibuja los diagramas de cortante y momento flector en kN y m. Que verifique que la suma de fuerzas da cero.'],
 ['Transformaciones lineales','Mueve los vectores base y mira cómo se deforma el plano.','Visualizador de matrices 2×2: arrastro los vectores base y la cuadrícula se deforma en vivo; muestra el determinante como área y los eigenvectores cuando existan.'],
 ['Osciloscopio RC','Carga y descarga de un capacitor con onda cuadrada.','Simula un circuito RC con fuente de onda cuadrada y muéstralo en un osciloscopio virtual; sliders de R, C y frecuencia; resalta la constante de tiempo τ = RC.'],
 ['Rutas de reparto','El problema del viajante con puntos de tu colonia.','Juego del problema del viajante: el usuario pone puntos en un mapa simple, intenta trazar la ruta más corta y luego la compara con vecino más cercano y 2-opt.'],
 ['Puente con sensores','Un gemelo digital de juguete que alerta por carga.','Prototipo de gemelo digital: un puente en 2D con sensores simulados de deformación; al subir el tráfico cambian las lecturas y salta una alerta al pasar el umbral. Rotula todo como simulación.'],
 ['Derivadas a mano alzada','Dibuja una curva y adivina la forma de su derivada.','Juego para Cálculo Diferencial: el usuario dibuja una curva y debe esbozar su derivada; luego la página calcula la derivada numérica, la superpone y da un puntaje.']],
2:[['Depredador y presa','Lotka-Volterra con conejos y linces.','Simulador depredador-presa Lotka-Volterra con sliders de natalidad y caza, gráfica en el tiempo y diagrama de fase; explica qué significa cada parámetro en lenguaje sencillo.'],
 ['Atlas por capas','Piel, músculo y hueso: quita capas del brazo.','Atlas anatómico esquemático del miembro superior hecho en SVG, con capas que se encienden y apagan, nombres al pasar el cursor y un quiz de 10 preguntas al final.'],
 ['Calidad del aire','Tablero con datos abiertos de tu ciudad.','Tablero de calidad del aire con el CSV de datos abiertos que te paso: PM2.5 por mes, días que rebasan la norma y comparación entre estaciones. Cita la fuente en cada gráfica.'],
 ['Casos clínicos','Quiz con retroalimentación razonada.','Quiz de casos clínicos de primer año: cada caso con historia, exploración y 4 opciones; al responder explica por qué cada opción es correcta o no. Uso estrictamente educativo.'],
 ['Tabla periódica viva','Un slider de temperatura cambia el estado de cada elemento.','Tabla periódica interactiva donde un slider de temperatura colorea qué elementos son sólidos, líquidos o gases, con ficha de cada elemento y sus puntos de fusión y ebullición.'],
 ['Diario de sueño grupal','Registro anónimo y patrones del semestre.','App para que el grupo registre horas de sueño de forma anónima, con tablero compartido de promedios por semana y recomendaciones con fuente de salud pública.']],
3:[['Consejo de Seguridad','Votaciones con veto y negociación.','Simulador del Consejo de Seguridad de la ONU: 15 miembros, cinco con veto; el usuario propone una resolución y negocia apoyos; muestra cuándo pasa, cuándo se veta y por qué.'],
 ['¿A dónde va tu peso?','El presupuesto público por cada 100 pesos.','Explicador del presupuesto de egresos con los datos oficiales que te paso: por cada 100 pesos cuánto va a cada rubro, y una sección donde el usuario reparte su propio presupuesto y compara.'],
 ['La ruta de una ley','De la iniciativa a la publicación, paso a paso.','Scrollytelling del proceso legislativo: iniciativa, comisiones, pleno, cámara revisora, sanción y publicación, con una ley real como ejemplo y el tiempo que tomó cada etapa.'],
 ['Mapa de tratados','Quién firmó, quién ratificó y cuándo.','Mapa mundial interactivo de un tratado internacional que elijas: países firmantes y ratificantes por año, línea de tiempo y ficha por país con la fecha y la fuente.'],
 ['Política de transporte','Costo-beneficio de una línea de autobús rápido.','Simulador de política pública para una línea de BRT: sliders de costo, demanda y tarifa; muestra tiempo ahorrado, emisiones y valor presente neto. Marca cada supuesto como supuesto.'],
 ['Lupa legislativa','Análisis de discursos de un debate.','Herramienta para analizar transcripciones de debates legislativos que pega el usuario: palabras clave por grupo parlamentario, intervenciones por orador y citas buscables.']],
4:[['Museo de bolsillo','Una exposición curada, sala por sala.','Museo virtual de una exposición curada por el grupo: salas navegables, cédulas de obra con ficha técnica y un recorrido guiado con texto breve por pieza.'],
 ['Edición crítica','Variantes de un manuscrito lado a lado.','Visor de edición crítica: dos testimonios de un texto en columnas, variantes resaltadas y el aparato crítico al pasar el cursor.'],
 ['Poesía combinatoria','Diez versos por línea, millones de poemas.','Máquina de poesía combinatoria con versos originales del grupo: cada línea tiene diez opciones que se cambian una por una, y muestra cuántas combinaciones existen.'],
 ['Ruta literaria','Los lugares de una novela, en el mapa.','Mapa de una ruta literaria por mi ciudad: los puntos donde ocurre la novela, un fragmento breve en cada uno y un recorrido sugerido a pie con tiempos.'],
 ['La paleta de un cuadro','Extrae y compara colores de obras.','Herramienta que extrae la paleta de color de una imagen que sube el usuario y la compara con paletas típicas de movimientos artísticos, con una explicación de cada uno.'],
 ['Afinador histórico','Escucha la diferencia entre temperamentos.','Comparador de afinaciones con Web Audio: el mismo acorde en temperamento igual, pitagórico y mesotónico, con una explicación visual de las diferencias en cents.']]};
const ROM=['','I','II','III','IV'];
$$('[data-ideas]').forEach(box=>{const a=+box.dataset.ideas;box.innerHTML=IDEAS[a].map((x,i)=>`<article class="ticket"><div class="tm"><span class="tid">IDEA ${ROM[a]}·0${i+1}</span><h3>${x[0]}</h3><p>${x[1]}</p></div><button class="stub" data-a="${a}" data-i="${i}" aria-label="Copiar el prompt de ${x[0]}">Copiar</button></article>`).join('');
  box.querySelectorAll('.stub').forEach(b=>b.addEventListener('click',()=>copy(IDEAS[a][+b.dataset.i][2]+' Publícalo como página interactiva que funcione en celular, y dime qué no pudiste verificar.',b)));});

/* ================= JAM ================= */
const ROS=[['0:00','Rompehielos','10 min','Cada quien dice qué haría si tuviera un becario incansable que programa. La respuesta más absurda gana un sombrero.','Escucha y anota los temas para la ruleta.','Escribir tres verbos de lo que te gustaría automatizar.'],
 ['0:10','Demo en vivo','15 min','Alguien del público dicta un prototipo en voz alta y todos lo ven nacer en la pantalla, errores incluidos.','Construye, prueba y publica en vivo.','Mirar cómo se itera: nadie acierta al primer prompt.'],
 ['0:25','Problemas reales','20 min','Equipos de tres eligen un problema de su carrera. Regla: tiene que dolerle a alguien con nombre y apellido.','Ayuda a convertir la queja en un problema concreto.','Escribir el problema en una sola oración.'],
 ['0:45','Primer prompt','25 min','Usan el armador de prompts de abajo. Meta: un primer prototipo publicado, aunque sea feo.','Arma la primera versión con su link.','Llenar el brief: para quién, qué hace, con qué datos.'],
 ['1:10','Iteración','50 min','Tres rondas de «esto sí, esto no, cambia esto». En cada ronda se gira la ruleta de retos.','Aplica los cambios y explica qué hizo.','Probarlo con alguien de otro equipo y anotar dónde se atora.'],
 ['2:00','Verificación','20 min','Revisar datos, fuentes y que funcione en celular. Lo inventado se marca como ejemplo.','Revisa errores, toma capturas y dice qué no pudo verificar.','Abrir las fuentes y comprobar dos datos a mano.'],
 ['2:20','Demos','30 min','Tres minutos por equipo. Se vota por el más útil y por el más absurdo.','Nada. Ahora brillan ustedes.','Contar el problema, mostrar el prototipo, decir qué sigue.'],
 ['2:50','Cierre','10 min','Qué aprendimos, qué sigue, a quién se lo vamos a enseñar.','Puede dejar programada una tarea de seguimiento.','Compartir el link en el grupo del colectivo.']];
let rosI=3;
function renderRos(){$('#rosList').innerHTML=ROS.map((r,i)=>`<li><button aria-pressed="${i===rosI}" data-i="${i}"><b>${r[0]}</b><span>${r[1]} <small style="color:var(--ink2);font-weight:400">· ${r[2]}</small></span></button></li>`).join('');
  $$('#rosList button').forEach(b=>b.addEventListener('click',()=>{rosI=+b.dataset.i;renderRos();}));const r=ROS[rosI];
  $('#rosCard').innerHTML=`<div class="folio"><span>Minuto ${r[0]} · ${r[2]}</span><span>Bloque ${rosI+1} de ${ROS.length}</span></div><p class="big">${r[1]}</p><p>${r[3]}</p><div class="note"><svg class="face" viewBox="0 0 40 40" aria-hidden="true"><use href="#faceIcon"/></svg><p><small>Qué hace Naranjito</small>${r[4]}</p></div><div class="note" style="grid-template-columns:34px 1fr"><span class="mono" style="font-size:1.4rem;color:var(--art2);letter-spacing:0">✎</span><p style="color:var(--art2)"><small>Qué hacen ustedes</small>${r[5]}</p></div>`;}
renderRos();

const AREAS=[['I','Físico-Matemáticas e Ingenierías','la resonancia en puentes colgantes'],['II','Biológicas, Químicas y de la Salud','cómo una vacuna entrena al sistema inmune'],['III','Ciencias Sociales','cómo se aprueba una ley en el Congreso'],['IV','Humanidades y Artes','las técnicas del muralismo mexicano']];
const FMT=[['sim','simulador interactivo','mover parámetros y ver las consecuencias en tiempo real'],['game','juego educativo','aprender jugando, con retroalimentación inmediata en cada error'],['story','explicador con scroll','entender un proceso paso a paso, como un reportaje interactivo'],['dash','tablero de datos','comparar cifras reales y detectar patrones'],['deck','presentación de 10 diapositivas','exponer el tema en clase con claridad'],['tool','herramienta práctica','resolver una tarea concreta en menos de cinco minutos']];
const AUD=['estudiantes de bachillerato','estudiantes de licenciatura','público general','tomadores de decisión'];
const INT=['deslizadores','arrastrar y soltar','quiz con retroalimentación','comparar escenarios','línea de tiempo','mapa'];
const TONE=[['sobrio','sobrio y académico'],['lúdico','lúdico, con humor y referencias que la gente reconozca'],['editorial','editorial, como revista de diseño']];
const BS={a:0,f:0,au:1,in:new Set([0,3]),t:1,topicEdited:false};
function chips(id,list,isOn,on){const el=$(id);el.innerHTML=list.map((x,i)=>`<button aria-pressed="${isOn(i)}" data-i="${i}">${x}</button>`).join('');el.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{on(+b.dataset.i);build();}));}
function build(){chips('#bArea',AREAS.map(a=>'Área '+a[0]),i=>i===BS.a,i=>{BS.a=i;if(!BS.topicEdited)$('#bTopic').value=AREAS[i][2];});
  chips('#bFmt',FMT.map(f=>f[1]),i=>i===BS.f,i=>BS.f=i);chips('#bAud',AUD,i=>i===BS.au,i=>BS.au=i);chips('#bInt',INT,i=>BS.in.has(i),i=>BS.in.has(i)?BS.in.delete(i):BS.in.add(i));chips('#bTone',TONE.map(t=>t[0]),i=>i===BS.t,i=>BS.t=i);
  const A=AREAS[BS.a],F=FMT[BS.f],topic=$('#bTopic').value.trim()||A[2],ints=[...BS.in].map(i=>INT[i]);
  $('#bBad').textContent=`«hazme una página de ${topic}»`;
  const txt=`Actúa como diseñador(a) de producto y desarrollador(a) front-end.\n\nQuiero un ${F[1]} sobre «${topic}» para ${AUD[BS.au]} (Área ${A[0]}: ${A[1]}).\n\nObjetivo: que quien lo use pueda ${F[2]}.\n\nContenido: usa conceptos y datos reales de la disciplina, con su fuente. Si inventas un ejemplo, márcalo como ejemplo.\n\nInteracción: ${ints.length?ints.join(', '):'la que mejor sirva al objetivo'}. Que abra ya con un ejemplo funcionando, no con una pantalla vacía.\n\nEstilo: ${TONE[BS.t][1]}. Paleta y tipografía propias del tema, nada de plantilla genérica. Que funcione en celular.\n\nEntrega: una sola página publicada como Artifact, con dos líneas que expliquen cómo usarla.\n\nAntes de entregar: pruébala en un navegador, revisa errores en consola y dime qué no pudiste verificar.`;
  $('#bOut').textContent=txt;const sc=Math.min(100,30+(BS.topicEdited?15:8)+ints.length*9+15+12);$('#bScore').textContent=`especificidad ${sc}%`;$('#bMeter').style.width=sc+'%';}
$('#bTopic').value=AREAS[0][2];$('#bTopic').addEventListener('input',()=>{BS.topicEdited=true;build();});
$('#bCopy').addEventListener('click',e=>copy($('#bOut').textContent,e.currentTarget));build();

const RETOS=['Que funcione en celular con una sola mano.','Incluye al menos un dato real con su fuente.','Ningún texto de más de 20 palabras por pantalla.','Que alguien de otra carrera lo entienda en 30 segundos.','Agrega un modo «explícamelo como si tuviera 12 años».','Que tenga un botón que nadie espera.','Usa solo dos colores además del fondo.','Que se pueda usar sin leer instrucciones.','Termina con una pregunta abierta para debatir.','Haz que equivocarse enseñe algo.','Incluye una versión que funcione con lector de pantalla.','Que tenga un easter egg, como esta página.'];
let spinning=false;
$('#rlSpin').addEventListener('click',e=>{if(spinning)return;spinning=true;const out=$('#rlOut');let n=0,max=RM?1:18;const fin=Math.random()*RETOS.length|0;
  const st=()=>{n++;const v=n>=max?fin:Math.random()*RETOS.length|0;out.textContent=`«${RETOS[v]}»`;if(n<max)setTimeout(st,40+n*n*1.4);else{spinning=false;const r=e.target.getBoundingClientRect();confetti(r.left+r.width/2,r.top,60);}};st();});
let tm=600,tmI=null;const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
$('#tmGo').addEventListener('click',e=>{const b=e.currentTarget;if(tmI){clearInterval(tmI);tmI=null;b.textContent='Seguir';return;}b.textContent='Pausa';
  tmI=setInterval(()=>{tm--;$('#tmOut').textContent=fmt(tm);if(tm<=0){clearInterval(tmI);tmI=null;b.textContent='Arrancar';tm=600;dockSay('¡Tiempo! Publiquen lo que tengan. Un prototipo feo publicado le gana a uno perfecto en su cabeza.','Sprint terminado');setHat('fiesta');const r=b.getBoundingClientRect();confetti(r.left+r.width/2,r.top,120);}},1000);});
$('#tmReset').addEventListener('click',()=>{clearInterval(tmI);tmI=null;tm=600;$('#tmOut').textContent=fmt(tm);$('#tmGo').textContent='Arrancar';});

/* ================= GLOSSARY ================= */
const GL=[['Prompt','Lo que escribes. Mientras más claro, menos magia necesitas.','La instrucción en lenguaje natural que le das al modelo. Uno bueno dice objetivo, público, contenido, interacción y cómo verificar.','En un Jam: usa el armador de arriba.'],
 ['Agente','Un chat con manos.','Un modelo que, además de responder, usa herramientas: lee y escribe archivos, ejecuta comandos, navega y corrige su trabajo hasta terminar.','En un Jam: le pides el resultado, no los pasos.'],
 ['Codex','El primo de otra familia.','El agente de programación de OpenAI. En lo esencial hace lo mismo que Claude Code: entiende un proyecto, escribe código y lo prueba.','En un Jam: si dominas uno, entiendes el otro.'],
 ['Claude Code','Donde vive Naranjito.','El agente de programación de Anthropic. Funciona en terminal, en la app de escritorio y en la web. Esta sesión corre en un contenedor en la nube.','En un Jam: es la herramienta de esta demo.'],
 ['Artifact','Tu prototipo con link.','Una página publicada en claude.ai, privada por defecto. Puede ser app, juego, tablero, presentación o documento.','En un Jam: es lo que presentan en la demo.'],
 ['Repositorio','La carpeta con memoria.','Un proyecto guardado con Git, normalmente en GitHub. Guarda cada versión, así que equivocarse sale barato.','En un Jam: útil si el proyecto sigue después.'],
 ['Token','Pedacitos de palabra.','La unidad en que el modelo lee y escribe. Una palabra en español suele ser uno o varios tokens. Importa para costos y límites.','En un Jam: no te preocupes, pero sábelo.'],
 ['Contexto','La memoria de trabajo.','Todo lo que el modelo tiene presente: tus mensajes, archivos y resultados de herramientas. Lo que no está en contexto, no lo sabe.','En un Jam: pásale tus datos y tus apuntes.'],
 ['Alucinación','Inventar con aplomo.','Cuando el modelo afirma algo falso con seguridad. Se combate pidiendo fuentes, verificando datos y marcando los ejemplos.','En un Jam: el bloque de verificación existe por esto.'],
 ['Conector (MCP)','Enchufes a tus apps.','Un protocolo para que el agente use servicios externos como Drive, Notion, Slack o Figma. Cada conector se autoriza aparte.','En un Jam: trae los datos reales del colectivo.'],
 ['Subagente','Clones con tarea.','Agentes auxiliares que trabajan en paralelo, por ejemplo uno por fuente en una investigación, y le reportan al principal.','En un Jam: para investigar varias cosas a la vez.'],
 ['API','La puerta para tu propia app.','La interfaz para usar el modelo desde tu programa. Con ella se construyen tutores, clasificadores o chatbots.','En un Jam: el siguiente nivel, para después.']];
$('#gloss').innerHTML=GL.map((g,i)=>`<button class="flip" aria-pressed="false" aria-label="${g[0]}: voltear tarjeta"><span class="in"><span class="f"><span class="gt">${g[0]}</span><p>${g[1]}</p><small>Toca para voltear · ${String(i+1).padStart(2,'0')}/12</small></span><span class="b"><b>${g[0]}</b><span>${g[2]}</span><em>${g[3]}</em></span></span></button>`).join('');
$$('#gloss .flip').forEach(b=>b.addEventListener('click',()=>b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'))));

/* ================= DOCK / TOUR ================= */
const STEPS=[
 {id:'inicio',hat:'antena',w:'w-hero',txt:'Hola, soy Naranjito: el bichito naranja de Claude Code, versión fan y con sombreros. En diez paradas te enseño qué se puede armar aquí sin saber programar.'},
 {id:'que-es',hat:'birrete',w:'w-term',txt:'Lo básico: un chat te contesta, un agente hace cosas. Mueve el control de autonomía y mira la diferencia.'},
 {id:'inventario',hat:'chef',w:'w-tools',txt:'Mi tabla periódica. Cada elemento es algo que puedo hacer en esta sesión. Toca uno y te doy la receta.'},
 {id:'area-1',hat:'casco',w:'w-a1',txt:'Área I: física, mates e ingenierías. Péndulos caóticos y círculos que dibujan. Toca el fondo para poner cargas eléctricas.'},
 {id:'area-2',hat:'quirurgico',w:'w-a2',txt:'Área II: biología y salud. Una epidemia que frenas con sliders y un ADN que puedes mutar. Toca el fondo y las células se dividen.'},
 {id:'area-3',hat:'copa',w:'w-a3',txt:'Área III: política, gobernanza y mundo. Mismos votos, otro congreso. Y diplomacia en 200 rondas.'},
 {id:'area-4',hat:'boina',w:'w-a4',txt:'Área IV: artes y humanidades. Dale Play a la caja de ritmos y mira cómo baila el fondo. Luego, Cervantes con estadística.'},
 {id:'elementos',hat:'lentes',w:'w-render',txt:'Escenas renderizadas en vivo por tu tarjeta gráfica. Arrastra para mirar, mueve el sol y prueba el modo 5090. La tierra en bloques te va a sonar conocida.'},
 {id:'arquitectura',hat:'casco',w:'w-arq',txt:'Estudio 3D con motor profesional: un showroom de lujo y una villa con yate. Mueve el sol, enciende los faros y corta la casa como en AutoCAD.'},
 {id:'jam',hat:'fiesta',w:'w-jam',txt:'Ahora tú. Arma tu prompt, gira la ruleta de retos y corre el Jam en tres horas. Cada botón azul de «?» en los prototipos también te da su prompt.'},
 {id:'galeria',hat:'goggles',w:'w-museo',txt:'Bienvenido al museo. Baja despacio: el tiempo corre de Aristóteles a la computación cuántica y yo me meto en cada obra.'},
 {id:'glosario',hat:'mago',w:'w-glos',txt:'¿Codex? ¿Token? ¿Alucinación? Voltea las tarjetas. Nadie nace sabiendo. Yo nací ayer.'}];
let stepI=0;const dots=$('#dockDots');dots.innerHTML=STEPS.map(()=>'<i></i>').join('');
function dockSay(txt,lbl){typeInto($('#dockTxt'),txt);if(lbl)$('#dockLbl').textContent=lbl;}
function showStep(i,fromScroll){stepI=clamp(i,0,STEPS.length-1);const s=STEPS[stepI];setHat(s.hat);dockSay(s.txt,`Parada ${stepI+1} de ${STEPS.length}`);
  [...dots.children].forEach((d,j)=>d.classList.toggle('on',j===stepI));$('#dockPrev').disabled=stepI===0;$('#dockNext').textContent=stepI===STEPS.length-1?'Al inicio':'Siguiente';
  if(!fromScroll)document.getElementById(s.id).scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});}
$('#dockNext').addEventListener('click',()=>showStep(stepI===STEPS.length-1?0:stepI+1));
$('#dockPrev').addEventListener('click',()=>showStep(stepI-1));
const setMin=m=>{$('#dockBub').hidden=m;$('#dockBadge').hidden=!m;};
$('#dockX').addEventListener('click',()=>setMin(true));
$('#dockM').addEventListener('click',()=>setMin(!$('#dockBub').hidden));
$('#startTour').addEventListener('click',()=>{setMin(false);showStep(1);});
if(innerWidth<700)setMin(true);
let curSec='inicio';
const secIO=new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;const id=e.target.id;if(id===curSec)return;curSec=id;const i=STEPS.findIndex(s=>s.id===id);
  const w=e.target.dataset.world;document.body.classList.remove(...STEPS.map(s=>s.w));document.body.classList.add(w);
  $$('.cap .links a').forEach(a=>a.classList.toggle('on',a.dataset.s===id));const on=$('.cap .links a.on');if(on){const L=$('.cap .links');L.scrollTo({left:on.offsetLeft-L.clientWidth/2+on.clientWidth/2,behavior:RM?'auto':'smooth'});}
  document.body.classList.toggle('in-museo',id==='galeria');
  if(i>=0)showStep(i,true);});},{rootMargin:'-45% 0px -54% 0px'});
$$('main > section').forEach(s=>secIO.observe(s));
document.body.classList.add('w-hero');$('.cap .links a').classList.add('on');showStep(0,true);

/* ================= EASTER EGGS ================= */
let konamiDone=false;const KON=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];let kp=0,buf='';
addEventListener('keydown',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;kp=key===KON[kp]?kp+1:(key===KON[0]?1:0);
  if(kp===KON.length){kp=0;konamiDone=true;setHat('corona');setMin(false);dockSay(HAT_QUIP.corona,'Código secreto');$$('.hatchip.locked').forEach(b=>{b.classList.remove('locked');b.textContent='Corona secreta';});confetti(innerWidth/2,innerHeight/3,160);}
  if(e.target.closest&&e.target.closest('input,textarea,select'))return;if(e.key.length===1){buf=(buf+e.key.toLowerCase()).slice(-8);
    if(buf.endsWith('sudo')){setMin(false);setHat('vikingo');dockSay('Buen intento. Aquí no hay sudo para la tarea: hay que pedirlo bien. ¿Probaste el armador de prompts?','Permiso denegado');}
    if(buf.endsWith('hola')){setMin(false);dockSay('Hola, mundo. Ahora sí, ya cumplimos con la tradición.','Saludo');}}});
$('#redPill').addEventListener('click',()=>{setMin(false);dockSay('Bienvenido al mundo real: todo esto es HTML, CSS y JavaScript. Y aun así, se siente bien.','Pastilla roja');if(RM)return;document.documentElement.classList.add('glitching');setTimeout(()=>document.documentElement.classList.remove('glitching'),1000);});
$('#bluePill').addEventListener('click',()=>{setHat('antena');setMin(false);dockSay('La historia termina. Despiertas en tu cama y crees lo que quieras creer. Pero el Jam sigue en pie.','Pastilla azul');});

/* confetti */
const CF={cv:null,parts:[],on:false};
function confetti(x,y,n=120){if(RM)return;if(!CF.cv){CF.cv=document.createElement('canvas');CF.cv.className='confetti';document.body.appendChild(CF.cv);}const cols=['#FF7A1A','#FFC94A','#8F7CFF','#FF2E7E','#3FE0C5'];
  for(let i=0;i<n;i++){const a=Math.random()*TAU,sp=3+Math.random()*9;CF.parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-6,r:Math.random()*6.28,vr:(Math.random()-.5)*.4,c:cols[i%5],s:5+Math.random()*6,l:0});}if(!CF.on){CF.on=true;requestAnimationFrame(cfStep);}}
function cfStep(){const cv=CF.cv,d=Math.min(2,devicePixelRatio||1),W=Math.round(innerWidth*d),H=Math.round(innerHeight*d);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,innerWidth,innerHeight);
  CF.parts=CF.parts.filter(p=>p.l<220&&p.y<innerHeight+40);for(const p of CF.parts){p.vy+=.22;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.l++;c.save();c.translate(p.x,p.y);c.rotate(p.r);c.fillStyle=p.c;c.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);c.restore();}
  if(CF.parts.length)requestAnimationFrame(cfStep);else{CF.on=false;c.clearRect(0,0,innerWidth,innerHeight);}}

window.__lab={makeMascot,hatOn,addTask,tok,fit,TAU,clamp,lerp,RM};
/* init ranges + start loop */
$$('input[type=range]').forEach(fillR);
requestAnimationFrame(frame);
})();
