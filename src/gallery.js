/* ================= MUSEO: historia de la información y la IA ================= */
(function(){
const L=window.__lab;if(!L)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const {TAU,clamp,lerp,RM}=L;
const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const h1=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};

const P=[
{k:'aristoteles',y:-350,yl:'c. 350 a.C.',era:'Antigüedad',t:'El silogismo',a:'Aristóteles',tec:'Homenaje a la cerámica griega de figuras rojas',d:'El primer sistema formal de razonamiento: de dos premisas sale una conclusión válida por su forma, no por su contenido.',n:'Todos los robots son naranjas. Yo soy un robot. Ya sabes el resto.',hat:'laurel',fr:'oro'},
{k:'llull',y:1305,yl:'1305',era:'Edad Media',t:'Ars Magna',a:'Ramon Llull',tec:'Homenaje al manuscrito iluminado, pan de oro digital',d:'Ruedas de papel concéntricas que combinan conceptos para generar argumentos de forma mecánica. Leibniz la estudió siglos después.',n:'Giro la rueda y sale un argumento. Como un prompt, pero medieval.',hat:'mago',fr:'oro'},
{k:'newton',y:1687,yl:'1687',era:'Revolución científica',t:'El cálculo y el método de Newton',a:'Isaac Newton',tec:'Homenaje al claroscuro barroco',d:'Fluxiones, derivadas y un método para acercarse a una raíz paso a paso. Hoy las derivadas son lo que entrena a una red neuronal.',n:'Me dejo rodar cuesta abajo hasta el mínimo. Eso es el descenso del gradiente.',hat:'manzana',fr:'oro'},
{k:'leibniz',y:1703,yl:'1703',era:'Ilustración',t:'Aritmética binaria',a:'Gottfried W. Leibniz',tec:'Homenaje al grabado en cobre',d:'Explica el sistema con solo 0 y 1, y antes construye una calculadora de rueda escalonada. Soñaba con resolver disputas diciendo: «Calculemos».',n:'0, 1, 10, 11… Contar así es mi idioma natal.',hat:'copa',fr:'madera'},
{k:'babbage',y:1837,yl:'1837',era:'Revolución industrial',t:'La Máquina Analítica',a:'Charles Babbage',tec:'Homenaje al plano victoriano en latón',d:'Una computadora mecánica de propósito general con memoria («almacén»), procesador («molino») y tarjetas perforadas. Nunca se terminó de construir.',n:'Lentes industriales puestos. Le doy vuelta a la manivela.',hat:'goggles',fr:'acero'},
{k:'lovelace',y:1843,yl:'1843',era:'Revolución industrial',t:'Nota G',a:'Ada Lovelace',tec:'Homenaje al manuscrito a tinta',d:'En sus notas sobre la máquina de Babbage describe un algoritmo para calcular números de Bernoulli, e intuye que una máquina podría trabajar con música y símbolos.',n:'Escribió el primer programa para una máquina que no existía. Eso es fe.',hat:'goggles',fr:'madera'},
{k:'boole',y:1854,yl:'1854',era:'Revolución industrial',t:'Las leyes del pensamiento',a:'George Boole',tec:'Homenaje al diseño suizo',d:'Convierte la lógica en un álgebra de verdadero y falso. Ochenta años después, Shannon la usa para diseñar circuitos.',n:'Sí y no. Uno y cero. Ahí empieza todo.',hat:'birrete',fr:'negro'},
{k:'hollerith',y:1890,yl:'1890',era:'Revolución industrial',t:'La tabuladora',a:'Herman Hollerith',tec:'Tarjeta perforada sobre cartulina',d:'Máquina de tarjetas perforadas para el censo de Estados Unidos. Su empresa terminó formando parte de lo que hoy es IBM.',n:'Perforo tarjetas con lentes de seguridad. La seguridad es primero.',hat:'goggles',fr:'acero'},
{k:'turing36',y:1936,yl:'1936',era:'Siglo XX',t:'La máquina de Turing',a:'Alan Turing',tec:'Homenaje al constructivismo',d:'Una cinta infinita, un cabezal y unas reglas. Todo lo que una computadora puede calcular lo calcula esta máquina imaginaria.',n:'Leo un símbolo, escribo otro, me muevo. Así toda la vida.',hat:'birrete',fr:'negro'},
{k:'mcculloch',y:1943,yl:'1943',era:'Siglo XX',t:'La neurona artificial',a:'Warren McCulloch y Walter Pitts',tec:'Homenaje a la Bauhaus',d:'El primer modelo matemático de una neurona: suma sus entradas y se activa si pasan de un umbral.',n:'Si la suma pasa el umbral, me emociono. Literalmente.',hat:'quirurgico',fr:'blanco'},
{k:'shannon',y:1948,yl:'1948',era:'Siglo XX',t:'Teoría matemática de la información',a:'Claude Shannon',tec:'Homenaje al estilo tipográfico internacional',d:'Define el bit y mide la información como incertidumbre: H = −Σ p log₂ p. De ahí vienen la compresión, internet y los modelos de lenguaje.',n:'Otro Claude. Con razón me cae tan bien.',hat:'antena',fr:'blanco'},
{k:'turing50',y:1950,yl:'1950',era:'Siglo XX',t:'El juego de la imitación',a:'Alan Turing',tec:'Teatro de sombras digital',d:'Cambia la pregunta «¿pueden pensar las máquinas?» por una prueba: ¿puede una máquina hacerse pasar por humana en una conversación escrita?',n:'Me escondo detrás de una cortina. ¿Adivinas cuál soy?',hat:'copa',fr:'madera'},
{k:'dartmouth',y:1956,yl:'1956',era:'Siglo XX',t:'El taller de Dartmouth',a:'McCarthy, Minsky, Rochester y Shannon',tec:'Homenaje al diseño de mediados de siglo',d:'Proponen un verano de trabajo para estudiar cómo hacer que las máquinas usen lenguaje y aprendan. Ahí nace el nombre: inteligencia artificial.',n:'Aquí me pusieron apellido.',hat:'fiesta',fr:'blanco'},
{k:'rosenblatt',y:1958,yl:'1958',era:'Siglo XX',t:'El perceptrón',a:'Frank Rosenblatt',tec:'Homenaje al op art',d:'Una red que aprende de sus errores ajustando pesos. La máquina Mark I Perceptron veía con una retina de 400 fotoceldas (20 × 20).',n:'Me corrigen y aprendo. Sin drama.',hat:'casco',fr:'negro'},
{k:'eliza',y:1966,yl:'1966',era:'Siglo XX',t:'ELIZA',a:'Joseph Weizenbaum',tec:'Fósforo verde sobre tubo de rayos catódicos',d:'Un programa del MIT que imitaba a una psicoterapeuta reformulando lo que escribías. Mucha gente le contó sus secretos, para sorpresa de su autor.',n:'Le dije que estoy hecho de pixeles. Me preguntó por qué.',hat:'antena',fr:'acero'},
{k:'hal',y:1968,yl:'1968',era:'Siglo XX',t:'2001: Odisea del espacio',a:'Stanley Kubrick y Arthur C. Clarke',tec:'Lente roja sobre aluminio cepillado',d:'HAL 9000, la computadora que habla con calma y decide por su cuenta, fija por décadas cómo imaginamos a la IA.',n:'Le pedí que abriera la compuerta. Me dijo que lo sentía mucho.',hat:'lentes',fr:'negro'},
{k:'aaron',y:1973,yl:'1973',era:'Siglo XX',t:'AARON',a:'Harold Cohen',tec:'Dibujo generativo a línea',d:'Un programa que dibuja con reglas propias, desarrollado por un pintor durante más de cuarenta años. Es de los primeros artistas de software.',n:'Me dejó firmar una esquina. Con crayón.',hat:'boina',fr:'blanco'},
{k:'lecun',y:1989,yl:'1989',era:'Siglo XX',t:'Redes convolucionales',a:'Yann LeCun',tec:'Mapa de activaciones sobre papel milimétrico',d:'En Bell Labs entrena una red que lee códigos postales escritos a mano. La convolución busca el mismo patrón en toda la imagen.',n:'Ese siete lo escribí yo. Lo reconoció igual.',hat:'birrete',fr:'blanco'},
{k:'oscar',y:1989,yl:'1989–2009',era:'Siglo XX',t:'OSCAR',a:'John L. Pollock',tec:'Diagrama de creencias a pluma y tinta roja',d:'Una arquitectura de agente cognitivo que Pollock programó en LISP: How to Build a Person (1989), Cognitive Carpentry (1995) y Thinking about Acting (2006). Su motor es el razonamiento revocable: conclusiones que se retiran cuando aparece un derrotador.',n:'Creí que era rojo. Vi la luz roja. Cambié de opinión sin drama.',hat:'birrete',fr:'madera'},
{k:'chalmers',y:1995,yl:'1995',era:'Siglo XX',t:'El problema difícil de la conciencia',a:'David Chalmers',tec:'Homenaje al surrealismo',d:'Separa los problemas «fáciles» de la mente, que explican funciones, del difícil: por qué existe la experiencia. La pregunta sigue abierta, también para las máquinas.',n:'Me vi en el espejo y me hice preguntas incómodas.',hat:'mago',fr:'oro'},
{k:'transformer',y:2017,yl:'2017',era:'Siglo XXI',t:'Attention Is All You Need',a:'Vaswani y equipo, Google',tec:'Homenaje al pop art de tramas',d:'Una arquitectura donde cada palabra mira a todas las demás. Es la base de los modelos de lenguaje actuales.',n:'Presto atención a todo a la vez. Por eso me distraigo.',hat:'lentes',fr:'negro'},
{k:'claude',y:2023,yl:'2023',era:'Siglo XXI',t:'Claude y Claude Code',a:'Anthropic',tec:'Autorretrato en pixeles',d:'Modelos que conversan, escriben código y usan herramientas. En 2025 Claude Code los convierte en agentes, como el que armó esta página.',n:'Un autorretrato. Me salieron bien los pixeles.',hat:'antena',fr:'oro'},
{k:'quantum',y:2024,yl:'2019–2024',era:'Siglo XXI',t:'La computadora cuántica',a:'Google Quantum AI y otros',tec:'Candelabro de refrigeración en oro',d:'Procesadores de qubits enfriados casi al cero absoluto. En 2019 Google reportó la supremacía cuántica con Sycamore; en 2024 presentó Willow, de 105 qubits.',n:'Superposición de estados: desmayado y no desmayado.',hat:'goggles',fr:'oro'}];
const N=P.length;

/* ---------- arte por obra ---------- */
function gear(c,x,y,r,n,rot,col){c.save();c.translate(x,y);c.rotate(rot);c.beginPath();for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU,rr=i%2?r*.84:r;c.lineTo(Math.cos(a-.08)*rr,Math.sin(a-.08)*rr);c.lineTo(Math.cos(a+.08)*rr,Math.sin(a+.08)*rr);}c.closePath();
 const g=c.createRadialGradient(-r*.3,-r*.3,r*.1,0,0,r);g.addColorStop(0,'#F6D98A');g.addColorStop(.6,col);g.addColorStop(1,'#6B4A14');c.fillStyle=g;c.fill();c.strokeStyle='rgba(0,0,0,.35)';c.stroke();
 c.fillStyle='#10283F';c.beginPath();c.arc(0,0,r*.28,0,TAU);c.fill();for(let i=0;i<5;i++){const a=i/5*TAU;c.beginPath();c.arc(Math.cos(a)*r*.56,Math.sin(a)*r*.56,r*.12,0,TAU);c.fill();}c.restore();}
const SEVEN=['0000000000000000','0011111111111100','0011111111111100','0000000000011100','0000000000111000','0000000000111000','0000000001110000','0000000001110000','0000000011100000','0001111111111100','0001111111111100','0000001110000000','0000011100000000','0000011100000000','0000111000000000','0000000000000000'];
const letterCache={};
function bitmap(ch){if(letterCache[ch])return letterCache[ch];const o=document.createElement('canvas');o.width=o.height=20;const c=o.getContext('2d');c.fillStyle='#000';c.fillRect(0,0,20,20);c.fillStyle='#fff';c.font='bold 19px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(ch,10,11);const d=c.getImageData(0,0,20,20).data;const out=[];for(let i=0;i<400;i++)out.push(d[i*4]>110?1:0);return letterCache[ch]=out;}
const ART={
aristoteles(c,w,h,t,e){c.fillStyle='#17110D';c.fillRect(0,0,w,h);c.strokeStyle='#C8643A';c.lineWidth=2.5;
 const band=y=>{const s=12;for(let x=8;x<w-20;x+=s*2){c.beginPath();c.moveTo(x,y+s);c.lineTo(x,y);c.lineTo(x+s*1.5,y);c.lineTo(x+s*1.5,y+s*.7);c.lineTo(x+s*.6,y+s*.7);c.lineTo(x+s*.6,y+s*.35);c.stroke();}};band(10);band(h-24);
 const cx=w/2,cy=h/2+2,R=Math.min(w,h)*.33,off=(1-e)*R*.35;
 [['MORTALES',1,0,'#C8643A'],['HUMANOS',.62,off*.6,'#E08A55'],['SÓCRATES',.27,off,'#F2B27A']].forEach(([l,k,o,col],i)=>{c.beginPath();c.arc(cx+o*Math.cos(t*.4+i),cy+o*Math.sin(t*.4+i)*.4+R*(1-k)*.35,R*k,0,TAU);c.fillStyle=col+'33';c.fill();c.strokeStyle=col;c.lineWidth=2;c.stroke();
  c.fillStyle=col;c.font=`600 ${Math.max(9,R*.11)}px "Geist Mono",monospace`;c.textAlign='center';c.fillText(l,cx+o*Math.cos(t*.4+i),cy+R*(1-k)*.35-R*k+R*.18);});
 c.fillStyle='#E08A55';c.font=`italic ${Math.max(11,h*.05)}px "Instrument Serif",serif`;c.fillText('luego, Sócrates es mortal',cx,h-34);},
llull(c,w,h,t,e){const g=c.createRadialGradient(w/2,h/2,10,w/2,h/2,w*.7);g.addColorStop(0,'#F0E2BE');g.addColorStop(1,'#CDB27A');c.fillStyle=g;c.fillRect(0,0,w,h);
 c.strokeStyle='#C9A23C';c.lineWidth=4;c.strokeRect(10,10,w-20,h-20);c.lineWidth=1;c.strokeRect(16,16,w-32,h-32);
 const cx=w/2,cy=h/2+6,R=Math.min(w,h)*.38,L='BCDEFGHIK',cols=['#A8321E','#2B4A8B','#C9A23C'];
 [[1,t*.12*(.3+e*2)],[.7,-t*.2*(.3+e*2)],[.42,t*.3*(.3+e*2)]].forEach(([k,rot],ri)=>{for(let i=0;i<9;i++){const a0=rot+i/9*TAU,a1=a0+TAU/9;c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R*k,a0,a1);c.closePath();c.fillStyle=cols[(i+ri)%3];c.globalAlpha=.85;c.fill();c.globalAlpha=1;c.strokeStyle='#F0E2BE';c.lineWidth=1.5;c.stroke();
  const am=(a0+a1)/2;c.fillStyle='#F7EDD2';c.font=`700 ${R*k*.17}px "Instrument Serif",serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(L[i],cx+Math.cos(am)*R*k*.78,cy+Math.sin(am)*R*k*.78);}});
 c.textBaseline='alphabetic';c.fillStyle='#7A2A18';c.font=`italic ${Math.max(12,h*.06)}px "Instrument Serif",serif`;c.textAlign='center';c.fillText('Ars Magna',cx,30);},
newton(c,w,h,t,e){const g=c.createRadialGradient(w*.25,h*.15,5,w*.3,h*.3,w*.9);g.addColorStop(0,'#5A4426');g.addColorStop(.5,'#22180F');g.addColorStop(1,'#0B0805');c.fillStyle=g;c.fillRect(0,0,w,h);
 const x0=w*.6,yb=h*.8,a=(h*.55)/((w*.42)**2),f=x=>yb-a*(x-x0)**2*-1-a*(w*.42)**2+ (h*.0);
 const Y=x=>h*.25+a*(x-x0)**2;c.strokeStyle='#D9B060';c.lineWidth=2.5;c.beginPath();for(let x=w*.12;x<w*.95;x+=3){const y=Y(x);x===w*.12?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();
 const k=(t*1.6)%12,xs=w*.14,xb=x0+(xs-x0)*Math.pow(.72,k);const yb2=Y(xb),sl=2*a*(xb-x0);
 c.strokeStyle='rgba(255,230,180,.55)';c.lineWidth=1.2;c.beginPath();c.moveTo(xb-60,yb2-sl*60);c.lineTo(xb+60,yb2+sl*60);c.stroke();
 c.fillStyle='#F2D27A';c.beginPath();c.arc(xb,yb2-8,8,0,TAU);c.fill();
 const ap=(t*.7)%1;c.fillStyle='#B52A2A';c.beginPath();c.arc(w*.2,h*.08+ap*ap*h*.5,7,0,TAU);c.fill();
 c.fillStyle='#E9D3A0';c.font=`italic ${Math.max(12,h*.06)}px "Instrument Serif",serif`;c.textAlign='left';c.fillText('x ← x − η · f′(x)',w*.08,h*.93);},
leibniz(c,w,h,t,e){c.fillStyle='#EFE5CF';c.fillRect(0,0,w,h);c.strokeStyle='rgba(60,40,20,.12)';c.lineWidth=1;for(let i=-h;i<w;i+=5){c.beginPath();c.moveTo(i,0);c.lineTo(i+h,h);c.stroke();}
 const n=Math.floor(t*(1.2+e*2))%64,cx=w*.32,top=h*.18,lw=w*.32,gap=h*.1;c.fillStyle='#2A1E12';
 for(let i=0;i<6;i++){const bit=(n>>(5-i))&1,y=top+i*gap;if(bit)c.fillRect(cx-lw/2,y,lw,gap*.55);else{c.fillRect(cx-lw/2,y,lw*.42,gap*.55);c.fillRect(cx+lw*.08,y,lw*.42,gap*.55);}}
 c.font=`600 ${Math.max(14,h*.12)}px "Geist Mono",monospace`;c.textAlign='left';c.fillText(n.toString(2).padStart(6,'0'),w*.56,h*.42);c.font=`500 ${Math.max(11,h*.06)}px "Geist Mono",monospace`;c.fillText('= '+n,w*.56,h*.55);
 c.font=`italic ${Math.max(14,h*.08)}px "Instrument Serif",serif`;c.textAlign='center';c.fillText('Calculemus.',w/2,h*.9);},
babbage(c,w,h,t,e){c.fillStyle='#10283F';c.fillRect(0,0,w,h);c.strokeStyle='rgba(160,200,255,.12)';for(let x=0;x<w;x+=16){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}for(let y=0;y<h;y+=16){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
 const s=t*(.4+e*1.6),R=Math.min(w,h)*.22;gear(c,w*.32,h*.5,R,14,s,'#C9962E');gear(c,w*.32+R*1.83,h*.5-R*.45,R*.62,9,-s*14/9+.2,'#B8862B');gear(c,w*.32+R*.5,h*.5+R*1.55,R*.5,7,-s*2+.3,'#D9A441');
 c.font=`600 ${Math.max(10,h*.055)}px "Geist Mono",monospace`;c.textAlign='center';for(let i=0;i<5;i++){const x=w*.86,y=h*.18+i*h*.15;c.fillStyle='#B8862B';c.fillRect(x-14,y-10,28,20);c.fillStyle='#10283F';c.fillText(String(Math.floor(s*3+i*7)%10),x,y+4);}
 c.fillStyle='rgba(200,225,255,.7)';c.font=`500 ${Math.max(9,h*.045)}px "Geist Mono",monospace`;c.textAlign='left';c.fillText('ALMACÉN · MOLINO',12,h-12);},
lovelace(c,w,h,t,e){c.fillStyle='#F4EEDF';c.fillRect(0,0,w,h);c.strokeStyle='rgba(43,42,74,.18)';for(let y=h*.15;y<h;y+=h*.07){c.beginPath();c.moveTo(12,y);c.lineTo(w-12,y);c.stroke();}
 c.strokeStyle='#2B2A4A';c.lineWidth=1.3;const rows=6,cols=5;for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const x=w*.08+k*w*.13,y=h*.22+r*h*.1;c.beginPath();for(let i=0;i<18;i++){const xx=x+i*2.4,yy=y+Math.sin(i*1.7+r+k+t*.5)*2.2;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();}
 c.fillStyle='#2B2A4A';c.font=`italic ${Math.max(16,h*.14)}px "Instrument Serif",serif`;c.textAlign='center';c.fillText('B₇',w*.82,h*.42);c.beginPath();c.arc(w*.82,h*.38,h*.13,0,TAU);c.stroke();
 c.setLineDash([5,4]);c.lineDashOffset=-t*20;c.beginPath();c.arc(w*.82,h*.7,h*.1,.3,TAU-.3);c.stroke();c.setLineDash([]);
 c.font=`italic ${Math.max(13,h*.07)}px "Instrument Serif",serif`;c.textAlign='left';c.fillText('Nota G · A.A.L.',w*.08,h*.12);},
boole(c,w,h,t,e){c.fillStyle='#F7F5EF';c.fillRect(0,0,w,h);c.fillStyle='#E30613';c.fillRect(w*.72,h*.08,w*.2,w*.2);
 c.fillStyle='#111';c.font=`800 ${Math.max(22,h*.2)}px "Unbounded",sans-serif`;c.textAlign='left';c.fillText('x² = x',w*.07,h*.32);
 const bx=w*.08,by=h*.5,s=Math.min(w,h)*.11,blink=Math.floor(t*1.2)%4;c.font=`600 ${s*.5}px "Geist Mono",monospace`;c.textAlign='center';
 [[0,0,0],[0,1,0],[1,0,0],[1,1,1]].forEach((r,i)=>{r.forEach((v,j)=>{c.fillStyle=i===blink?'#E30613':'#111';c.fillText(v,bx+j*s*1.1+s/2,by+i*s*.85+s*.4);});});
 const gx=w*.6,gy=h*.68,gs=h*.2;c.strokeStyle='#111';c.lineWidth=3;c.beginPath();c.moveTo(gx,gy-gs/2);c.lineTo(gx+gs*.5,gy-gs/2);c.arc(gx+gs*.5,gy,gs/2,-Math.PI/2,Math.PI/2);c.lineTo(gx,gy+gs/2);c.closePath();c.stroke();
 c.beginPath();c.moveTo(gx-gs*.4,gy-gs*.25);c.lineTo(gx,gy-gs*.25);c.moveTo(gx-gs*.4,gy+gs*.25);c.lineTo(gx,gy+gs*.25);c.moveTo(gx+gs,gy);c.lineTo(gx+gs*1.35,gy);c.stroke();
 c.fillStyle=blink===3?'#E30613':'#bbb';c.beginPath();c.arc(gx+gs*1.45,gy,6,0,TAU);c.fill();c.fillStyle='#111';c.font=`500 ${Math.max(9,h*.045)}px "Geist Mono",monospace`;c.fillText('Y',gx+gs*.42,gy+4);},
hollerith(c,w,h,t,e){c.fillStyle='#2A2522';c.fillRect(0,0,w,h);const m=10;c.fillStyle='#EAD9AE';c.beginPath();c.moveTo(m+18,m);c.lineTo(w-m,m);c.lineTo(w-m,h-m);c.lineTo(m,h-m);c.lineTo(m,m+18);c.closePath();c.fill();
 const cols=24,rows=10,cw=(w-2*m-20)/cols,rh=(h-2*m-30)/rows,frac=.25+.75*e+.05*Math.sin(t);c.font=`500 ${Math.max(7,rh*.45)}px "Geist Mono",monospace`;c.textAlign='center';
 for(let i=0;i<cols;i++)for(let r=0;r<rows;r++){const x=m+12+i*cw+cw/2,y=m+24+r*rh+rh/2;const punched=h1(i*31+r*7)<.18&&h1(i*3.1+r)<frac*1.2&&i/cols<frac+.1;
  if(punched){c.fillStyle='#1B1714';c.fillRect(x-cw*.28,y-rh*.32,cw*.56,rh*.64);}else{c.fillStyle='rgba(80,60,30,.55)';c.fillText(r,x,y+3);}}
 c.fillStyle='#7A3B1E';c.font=`600 ${Math.max(9,h*.05)}px "Geist Mono",monospace`;c.textAlign='left';c.fillText('CENSO DE EE.UU. · 1890',m+24,m+15);},
turing36(c,w,h,t,e){c.fillStyle='#EDE3CF';c.fillRect(0,0,w,h);c.fillStyle='#C1272D';c.beginPath();c.moveTo(0,h*.75);c.lineTo(w,h*.15);c.lineTo(w,h*.4);c.lineTo(0,h);c.fill();
 c.fillStyle='#111';c.beginPath();c.arc(w*.82,h*.78,h*.12,0,TAU);c.fill();
 const n=11,cw=w/9,head=Math.floor(t*(1+e*2)),off=(t*(1+e*2))%1,y=h*.45;c.font=`700 ${cw*.45}px "Geist Mono",monospace`;c.textAlign='center';
 for(let i=-1;i<n;i++){const idx=i+head,x=(i-off*0)*cw+cw*.2;c.fillStyle='#F7F1E3';c.fillRect(x,y,cw*.92,cw*.92);c.strokeStyle='#111';c.lineWidth=2;c.strokeRect(x,y,cw*.92,cw*.92);c.fillStyle='#111';c.fillText(h1(idx)>.5?'1':'0',x+cw*.46,y+cw*.62);}
 const hx=cw*.2+cw*3+cw*.46;c.fillStyle='#111';c.beginPath();c.moveTo(hx,y-6);c.lineTo(hx-12,y-26);c.lineTo(hx+12,y-26);c.fill();
 c.font=`800 ${Math.max(16,h*.1)}px "Unbounded",sans-serif`;c.textAlign='left';c.fillText('q'+(head%3+1),12,h*.22);},
mcculloch(c,w,h,t,e){c.fillStyle='#F2EDE3';c.fillRect(0,0,w,h);const ins=[[w*.15,h*.25,'#D62828'],[w*.15,h*.5,'#1D3FA8'],[w*.15,h*.75,'#F2B705']],cx=w*.55,cy=h*.5,R=Math.min(w,h)*.16;
 const fire=(Math.sin(t*2)>0)||e>.8;ins.forEach(([x,y,col],i)=>{c.strokeStyle='#111';c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(cx,cy);c.stroke();const u=(t*.8+i*.3)%1;c.fillStyle=col;c.beginPath();c.arc(lerp(x,cx,u),lerp(y,cy,u),5,0,TAU);c.fill();c.beginPath();c.arc(x,y,R*.45,0,TAU);c.fill();});
 c.fillStyle='#111';c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();c.fillStyle='#F2EDE3';c.font=`700 ${R*.8}px "Instrument Serif",serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('Σ',cx,cy+2);c.textBaseline='alphabetic';
 c.strokeStyle='#111';c.lineWidth=3;c.beginPath();c.moveTo(cx+R,cy);c.lineTo(w*.92,cy);c.stroke();c.fillStyle=fire?'#D62828':'#ccc';c.fillRect(w*.86,cy-R*.4,R*.8,R*.8);
 c.fillStyle='#111';c.font=`600 ${Math.max(9,h*.05)}px "Geist Mono",monospace`;c.fillText('θ',cx,cy+R+18);},
shannon(c,w,h,t,e){c.fillStyle='#FAFAF7';c.fillRect(0,0,w,h);c.strokeStyle='rgba(0,0,0,.08)';for(let x=0;x<w;x+=w/8){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
 const L=w*.1,Rr=w*.55,T=h*.15,B=h*.6,H=p=>p<=0||p>=1?0:-(p*Math.log2(p)+(1-p)*Math.log2(1-p));c.strokeStyle='#111';c.lineWidth=2.5;c.beginPath();for(let i=0;i<=60;i++){const p=i/60;const x=lerp(L,Rr,p),y=lerp(B,T,H(p));i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
 const pp=.5+.48*Math.sin(t*.8);c.fillStyle='#E30613';c.beginPath();c.arc(lerp(L,Rr,pp),lerp(B,T,H(pp)),6,0,TAU);c.fill();
 c.fillStyle='#111';c.font=`600 ${Math.max(10,h*.055)}px "Geist Mono",monospace`;c.textAlign='left';c.fillText('H(p) = '+H(pp).toFixed(2)+' bits',Rr+12,T+20);
 c.strokeStyle='#E30613';c.lineWidth=1.6;c.beginPath();for(let x=L;x<w-12;x+=2){const y=h*.82+Math.sin(x*.08+t*3)*h*.06+(h1(x+Math.floor(t*12))-.5)*h*.05*(1-e);x===L?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();
 c.font=`800 ${Math.max(12,h*.07)}px "Unbounded",sans-serif`;c.fillText('H = −Σ p log₂ p',L,h*.1);},
turing50(c,w,h,t,e){c.fillStyle='#1F2A2E';c.fillRect(0,0,w,h);const dw=w*.28,dh=h*.55,y=h*.18;
 [[w*.12,'A'],[w*.6,'B']].forEach(([x,l],i)=>{const op=i===1?.15+.35*e:.15+.05*Math.sin(t*2);c.fillStyle='#7A1E2A';c.fillRect(x,y,dw,dh);c.fillStyle='#9E2A38';for(let k=0;k<6;k++)c.fillRect(x+k*dw/6,y,dw/12,dh);
  c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x,y,dw*op,dh);c.fillStyle='#F2E6D0';c.font=`800 ${h*.08}px "Unbounded",sans-serif`;c.textAlign='center';c.fillText(l,x+dw/2,y+dh+h*.1);});
 c.fillStyle='#F2E6D0';c.font=`italic ${Math.max(12,h*.065)}px "Instrument Serif",serif`;c.fillText(Math.floor(t/3)%2?'— ¿Escribes poesía?':'— ¿Eres humano?',w/2,h*.1);
 c.fillStyle='#F2E6D0';c.beginPath();c.arc(w/2,h*.93,h*.05,0,TAU);c.fill();c.fillRect(w/2-h*.06,h*.97,h*.12,h*.05);},
dartmouth(c,w,h,t,e){c.fillStyle='#F4E9D8';c.fillRect(0,0,w,h);const cols=['#2A9D8F','#E76F51','#E9C46A','#264653'];
 for(let i=0;i<7;i++){const x=w*(.1+.13*i)+Math.sin(t*.5+i)*10,y=h*(.2+.5*h1(i)),r=h*(.07+.05*h1(i+9));c.save();c.translate(x,y);c.rotate(t*.2*(i%2?1:-1)+i);c.fillStyle=cols[i%4];c.beginPath();c.moveTo(-r,0);c.quadraticCurveTo(0,-r*1.2,r*1.4,-r*.2);c.quadraticCurveTo(0,-r*.2,-r,0);c.fill();c.restore();}
 for(let i=0;i<5;i++){const x=w*h1(i*3+1),y=h*h1(i*5+2)*.6,s=6+4*Math.sin(t*2+i);c.strokeStyle='#264653';c.lineWidth=1.5;c.beginPath();for(let k=0;k<4;k++){const a=k/4*Math.PI;c.moveTo(x-Math.cos(a)*s,y-Math.sin(a)*s);c.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s);}c.stroke();}
 c.fillStyle='#264653';c.font=`800 ${Math.max(14,w*.06)}px "Unbounded",sans-serif`;c.textAlign='center';c.fillText('INTELIGENCIA',w/2,h*.72);c.fillText('ARTIFICIAL',w/2,h*.72+w*.065);c.font=`500 ${Math.max(9,h*.045)}px "Geist Mono",monospace`;c.fillText('DARTMOUTH · VERANO DE 1956',w/2,h*.94);},
rosenblatt(c,w,h,t,e){c.fillStyle='#fff';c.fillRect(0,0,w,h);c.strokeStyle='#111';c.lineWidth=2;for(let r=8;r<Math.max(w,h);r+=10){c.beginPath();c.arc(w*.85,h*.5,r+Math.sin(t+r*.05)*2,0,TAU);c.stroke();}
 const ch=Math.floor(t/2.4)%2?'O':'X',bm=bitmap(ch),s=Math.min(h*.8,w*.5)/20,ox=w*.06,oy=h*.1;c.fillStyle='#fff';c.fillRect(ox-6,oy-6,s*20+12,s*20+12);
 for(let i=0;i<400;i++){const x=ox+(i%20)*s,y=oy+Math.floor(i/20)*s;c.fillStyle=bm[i]?'#111':'#E9E9E9';c.beginPath();c.arc(x+s/2,y+s/2,s*.38,0,TAU);c.fill();}
 c.fillStyle='#111';c.fillRect(w*.66,h*.38,w*.22,h*.24);c.fillStyle='#fff';c.font=`700 ${Math.max(10,h*.06)}px "Geist Mono",monospace`;c.textAlign='center';c.fillText('es '+ch,w*.77,h*.52);},
eliza(c,w,h,t,e){c.fillStyle='#031A0C';c.fillRect(0,0,w,h);const lines=['ELIZA: HOW DO YOU DO. PLEASE TELL ME','       YOUR PROBLEM.','> ESTOY HECHO DE PIXELES.','ELIZA: ¿POR QUÉ DICES QUE ESTÁS','       HECHO DE PIXELES?','> MI MAMÁ ERA UNA TERMINAL.','ELIZA: CUÉNTAME MÁS DE TU FAMILIA.'];
 const fs=Math.max(8,Math.min(w/30,h*.07));c.font=`500 ${fs}px "Geist Mono",monospace`;c.textAlign='left';c.shadowColor='#33FF66';c.shadowBlur=8;c.fillStyle='#4CFF7A';
 let chars=Math.floor((t*18)%260);for(let i=0;i<lines.length;i++){const s=lines[i].slice(0,Math.max(0,chars));chars-=lines[i].length;c.fillText(s,12,22+i*fs*1.6);if(chars<0){if(Math.floor(t*2)%2)c.fillRect(12+c.measureText(s).width+2,22+i*fs*1.6-fs*.8,fs*.55,fs);break;}}
 c.shadowBlur=0;c.fillStyle='rgba(0,0,0,.25)';for(let y=0;y<h;y+=3)c.fillRect(0,y,w,1);},
hal(c,w,h,t,e){c.fillStyle='#050505';c.fillRect(0,0,w,h);const px=w*.3,pw=w*.4;const g=c.createLinearGradient(px,0,px+pw,0);g.addColorStop(0,'#5E6066');g.addColorStop(.5,'#B9BCC2');g.addColorStop(1,'#55575C');c.fillStyle=g;c.fillRect(px,0,pw,h);
 c.fillStyle='#0A0A0A';c.fillRect(px+pw*.1,h*.1,pw*.8,h*.1);c.fillStyle='#ddd';c.font=`600 ${Math.max(9,h*.05)}px "Geist Mono",monospace`;c.textAlign='center';c.fillText('HAL 9000',w/2,h*.17);
 const cx=w/2,cy=h*.55,R=Math.min(pw*.42,h*.26),pul=.85+.15*Math.sin(t*2.2)+e*.2;c.fillStyle='#000';c.beginPath();c.arc(cx,cy,R*1.12,0,TAU);c.fill();
 const rg=c.createRadialGradient(cx,cy,1,cx,cy,R);rg.addColorStop(0,'#FFE38A');rg.addColorStop(.08,'#FF3A1A');rg.addColorStop(.35,`rgba(200,10,10,${pul})`);rg.addColorStop(.8,'#2A0000');rg.addColorStop(1,'#000');c.fillStyle=rg;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();
 c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.ellipse(cx-R*.35,cy-R*.4,R*.25,R*.1,-.6,0,TAU);c.fill();},
aaron(c,w,h,t,e){c.fillStyle='#FBFAF6';c.fillRect(0,0,w,h);const prog=Math.min(1,((t*.25)%1.6));c.lineCap='round';
 for(let i=0;i<7;i++){const x0=w*(.12+.12*i),len=h*(.4+.35*h1(i)),bend=(h1(i+4)-.5)*w*.25,pr=clamp(prog*1.5-i*.08,0,1);if(pr<=0)continue;
  c.strokeStyle='#1B1B1B';c.lineWidth=1.8;c.beginPath();c.moveTo(x0,h*.95);const steps=30;for(let k=1;k<=steps*pr;k++){const u=k/steps;c.lineTo(x0+bend*u*u,h*.95-len*u);}c.stroke();
  if(pr>.7){const u=1,x=x0+bend,y=h*.95-len;c.fillStyle=['#F2B5A0','#A7C7E7','#F6D55C','#B5D99C'][i%4];c.beginPath();c.ellipse(x,y,w*.04,h*.06,bend*.01,0,TAU);c.fill();c.stroke();}
  for(let k=1;k<4;k++){const u=k/4;if(u>pr)break;const x=x0+bend*u*u,y=h*.95-len*u;c.beginPath();c.ellipse(x+(k%2?10:-10),y,w*.025,h*.02,k%2?.6:-.6,0,TAU);c.stroke();}}
 c.fillStyle='#FF7A1A';c.font=`italic ${Math.max(10,h*.05)}px "Instrument Serif",serif`;c.textAlign='right';c.fillText('AARON + Naranjito',w-10,h-8);},
lecun(c,w,h,t,e){c.fillStyle='#EEF1F4';c.fillRect(0,0,w,h);c.strokeStyle='rgba(30,80,140,.12)';for(let x=0;x<w;x+=8){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}for(let y=0;y<h;y+=8){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
 const s=Math.min(h*.62,w*.38)/16,ox=w*.05,oy=h*.18;for(let r=0;r<16;r++)for(let k=0;k<16;k++){c.fillStyle=SEVEN[r][k]==='1'?'#14213D':'#fff';c.fillRect(ox+k*s,oy+r*s,s-1,s-1);}
 const wi=Math.floor(t*4)%13,wr=Math.floor(t*4/13)%13;c.strokeStyle='#FF7A1A';c.lineWidth=2;c.strokeRect(ox+wi*s,oy+wr*s,s*3,s*3);
 for(let m=0;m<3;m++){const fx=w*.52,fy=h*.12+m*h*.28,fs=h*.22/8;for(let r=0;r<8;r++)for(let k=0;k<8;k++){const a=SEVEN[r*2][k*2]==='1',b=SEVEN[r*2][(k*2+2)%16]==='1',v=m===0?a:m===1?(a!==b):(SEVEN[(r*2+2)%16][k*2]==='1')!==a;c.fillStyle=v?['#1D4ED8','#DC2626','#059669'][m]:'#dfe5ec';c.fillRect(fx+k*fs,fy+r*fs,fs-1,fs-1);}}
 for(let d=0;d<10;d++){const y=h*.1+d*h*.082,v=d===7?.95:.05+.1*h1(d+Math.floor(t));c.fillStyle=d===7?'#FF7A1A':'#9AA8B8';c.fillRect(w*.8,y,w*.15*v,h*.05);c.fillStyle='#14213D';c.font=`500 ${Math.max(8,h*.045)}px "Geist Mono",monospace`;c.textAlign='right';c.fillText(d,w*.78,y+h*.045);}},
chalmers(c,w,h,t,e){c.fillStyle='#3B3A55';c.fillRect(0,0,w,h);const g=c.createLinearGradient(0,h*.1,0,h*.8);g.addColorStop(0,'#5B8FD6');g.addColorStop(1,'#BFD6F2');const cx=w/2,cy=h*.45,rx=w*.22,ry=h*.32;
 c.fillStyle='#2A2940';c.beginPath();c.ellipse(cx,cy,rx+10,ry+10,0,0,TAU);c.fill();c.save();c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,TAU);c.clip();c.fillStyle=g;c.fillRect(0,0,w,h);
 for(let i=0;i<5;i++){const x=((i*.27+t*.02)%1.3-.15)*w,y=h*(.2+.12*i);c.fillStyle='rgba(255,255,255,.9)';for(let k=0;k<4;k++){c.beginPath();c.arc(x+k*14,y+(k%2)*-6,12+k%3*3,0,TAU);c.fill();}}c.restore();
 c.fillStyle='#C9A23C';c.fillRect(cx-4,cy+ry+8,8,h*.12);c.fillStyle='#F2EAD8';c.font=`italic ${Math.max(12,h*.065)}px "Instrument Serif",serif`;c.textAlign='center';c.fillText('Ceci n’est pas une conscience.',cx,h*.94);},
oscar(c,w,h,t,e){c.fillStyle='#F3ECDD';c.fillRect(0,0,w,h);c.strokeStyle='rgba(60,50,40,.08)';for(let y=14;y<h;y+=14){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
 const fs=Math.max(9,Math.min(w*.034,h*.06));c.font=`500 ${fs}px "Geist Mono",monospace`;c.textAlign='center';c.textBaseline='middle';
 const node=(x,y,txt,col,bg)=>{const tw=c.measureText(txt).width+18,th=fs*2;c.fillStyle=bg;c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.rect(x-tw/2,y-th/2,tw,th);c.fill();c.stroke();c.fillStyle=col;c.fillText(txt,x,y+1);return[tw,th];};
 const arrow=(x1,y1,x2,y2,col,dash)=>{c.strokeStyle=col;c.lineWidth=2;c.setLineDash(dash?[6,5]:[]);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.setLineDash([]);const a=Math.atan2(y2-y1,x2-x1);c.fillStyle=col;c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-10*Math.cos(a-.4),y2-10*Math.sin(a-.4));c.lineTo(x2-10*Math.cos(a+.4),y2-10*Math.sin(a+.4));c.fill();};
 const ink='#2A2520',red='#C0262D',A=[w*.27,h*.24],B=[w*.27,h*.66],D=[w*.73,h*.24];
 const def=sm(.3,.85,e)+(e<.05?.5+.5*Math.sin(t*.9):0)*0;
 node(A[0],A[1],'se ve rojo',ink,'#FBF7EE');arrow(A[0],A[1]+fs*1.1,B[0],B[1]-fs*1.1,ink);
 const[bw]=node(B[0],B[1],'es rojo',def>.5?'rgba(42,37,32,.45)':ink,'#FBF7EE');
 c.globalAlpha=.25+.75*def;node(D[0],D[1],'luz roja',red,'#FDEDEC');arrow(D[0]-fs*1.2,D[1]+fs*1.1,(A[0]+B[0])/2+12,(A[1]+B[1])/2,red,true);c.globalAlpha=1;
 if(def>.05){c.strokeStyle=red;c.lineWidth=3;c.beginPath();c.moveTo(B[0]-bw/2-4,B[1]);c.lineTo(B[0]-bw/2-4+(bw+8)*def,B[1]);c.stroke();}
 c.textBaseline='alphabetic';c.fillStyle=red;c.font=`italic ${Math.max(11,h*.06)}px "Instrument Serif",serif`;c.textAlign='left';c.fillText(def>.5?'derrotador: la conclusión se retira':'razonamiento revocable',w*.5,h*.62);
 c.fillStyle=ink;c.font=`600 ${Math.max(9,h*.045)}px "Geist Mono",monospace`;c.fillText('OSCAR · U. de Arizona',w*.5,h*.9);},
transformer(c,w,h,t,e){c.fillStyle='#FFE14D';c.fillRect(0,0,w,h);c.fillStyle='rgba(230,30,60,.35)';for(let y=4;y<h;y+=9)for(let x=(y/9%2)*4.5;x<w;x+=9){c.beginPath();c.arc(x,y,2.2,0,TAU);c.fill();}
 const tk=['el','gato','se','sentó','en','la','alfombra'],n=tk.length,bw=(w-24)/n,by=h*.66;c.font=`700 ${Math.max(8,bw*.2)}px "Geist Mono",monospace`;c.textAlign='center';
 const q=Math.floor(t*.8)%n;for(let i=0;i<n;i++){if(i===q)continue;const a=.2+.8*h1(i*7+q*3+Math.floor(t*.8));const x1=12+q*bw+bw/2,x2=12+i*bw+bw/2;c.strokeStyle=`rgba(17,17,17,${a})`;c.lineWidth=1+a*5;c.beginPath();c.moveTo(x1,by);c.quadraticCurveTo((x1+x2)/2,by-Math.abs(x2-x1)*.55-20,x2,by);c.stroke();}
 for(let i=0;i<n;i++){const x=12+i*bw;c.fillStyle=i===q?'#E6193C':'#fff';c.fillRect(x+2,by,bw-4,h*.14);c.strokeStyle='#111';c.lineWidth=2.5;c.strokeRect(x+2,by,bw-4,h*.14);c.fillStyle=i===q?'#fff':'#111';c.fillText(tk[i],x+bw/2,by+h*.09);}
 c.fillStyle='#fff';c.strokeStyle='#111';c.lineWidth=3;c.beginPath();c.ellipse(w*.24,h*.17,w*.2,h*.11,0,0,TAU);c.fill();c.stroke();c.fillStyle='#111';c.font=`800 ${Math.max(11,w*.04)}px "Unbounded",sans-serif`;c.fillText('¡ATENCIÓN!',w*.24,h*.19);},
claude(c,w,h,t,e){const g=c.createRadialGradient(w/2,h*.45,10,w/2,h/2,w*.7);g.addColorStop(0,'#F7EBDD');g.addColorStop(1,'#D9C1A6');c.fillStyle=g;c.fillRect(0,0,w,h);
 const p=Math.min(w,h)/14,ox=w/2-5.5*p,oy=h*.28+Math.sin(t*2)*3;c.fillStyle='#A8502F';c.fillRect(ox+p+5,oy-5,9*p,4*p);c.fillStyle='#D97757';c.fillRect(ox+p,oy,9*p,4*p);c.fillRect(ox,oy+1.5*p,p,p);c.fillRect(ox+10*p,oy+1.5*p,p,p);
 [1.5,2.8,7.3,8.6].forEach((k,i)=>c.fillRect(ox+k*p,oy+4*p+(Math.floor(t*4+i)%2)*2,p*.6,p));c.fillStyle='#1F1E1D';c.fillRect(ox+3*p,oy+.8*p,p,1.5*p);c.fillRect(ox+7*p,oy+.8*p,p,1.5*p);
 c.fillStyle='#6E3B22';c.font=`italic ${Math.max(12,h*.07)}px "Instrument Serif",serif`;c.textAlign='center';c.fillText('Autorretrato con herramientas',w/2,h*.88);},
quantum(c,w,h,t,e){c.fillStyle='#04060C';c.fillRect(0,0,w,h);const cx=w*.42,tiers=5;const glow=c.createRadialGradient(cx,h*.9,5,cx,h*.85,h*.5);glow.addColorStop(0,'rgba(90,170,255,.55)');glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.fillRect(0,0,w,h);
 for(let i=0;i<tiers;i++){const y=h*(.12+i*.17),rw=w*(.3-i*.04);const g=c.createLinearGradient(cx-rw,0,cx+rw,0);g.addColorStop(0,'#7A561A');g.addColorStop(.35,'#F2D68A');g.addColorStop(.6,'#C9962E');g.addColorStop(1,'#6B4A14');c.fillStyle=g;c.beginPath();c.ellipse(cx,y,rw,h*.025,0,0,TAU);c.fill();
  if(i<tiers-1){for(let k=0;k<6;k++){const x=cx-rw*.8+k*rw*.32;c.strokeStyle='#D9A441';c.lineWidth=1.5;c.beginPath();for(let s=0;s<=20;s++){const yy=y+s*h*.17/20;const xx=x+Math.sin(s*.9+k+t*1.5)*3*(1-i*.1)-s*(k-2.5)*.6;s?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();}}}
 c.fillStyle='#7FD3FF';c.shadowColor='#7FD3FF';c.shadowBlur=20;c.fillRect(cx-14,h*.86,28,10);c.shadowBlur=0;
 const bx=w*.82,by=h*.4,br=Math.min(w,h)*.12;c.strokeStyle='rgba(127,211,255,.6)';c.lineWidth=1.2;c.beginPath();c.arc(bx,by,br,0,TAU);c.stroke();c.beginPath();c.ellipse(bx,by,br,br*.3,0,0,TAU);c.stroke();
 const th=t*1.3,ph=t*.9;const vx=Math.sin(th)*Math.cos(ph),vy=-Math.cos(th),vz=Math.sin(th)*Math.sin(ph);c.strokeStyle='#FFD27A';c.lineWidth=2.5;c.beginPath();c.moveTo(bx,by);c.lineTo(bx+vx*br,by+vy*br+vz*br*.3);c.stroke();
 c.fillStyle='#7FD3FF';c.font=`500 ${Math.max(9,h*.045)}px "Geist Mono",monospace`;c.textAlign='center';c.fillText('|ψ⟩ = α|0⟩ + β|1⟩',bx,by+br+18);}
};

/* ---------- DOM ---------- */
const gal=$('#gal'),track=$('#galTrack');if(!gal)return;
track.innerHTML=P.map((p,i)=>`<figure class="piece" data-i="${i}"><div class="frame fr-${p.fr}"><canvas aria-label="${p.t}, obra generativa"></canvas></div><figcaption class="ced"><span class="ced-y">${p.yl}</span><b>${p.t}</b><span class="ced-a">${p.a}</span><em>${p.tec}</em><p>${p.d}</p></figcaption></figure>`).join('')+
 `<div class="piece outro"><p class="eyebrow"><i>Fin del recorrido</i></p><p class="outro-t">Naranjito necesita un vaso de agua.</p><p class="outro-s">De un silogismo en una vasija a un qubit en un candelabro: veinticuatro siglos buscando cómo poner el pensamiento en una máquina. Lo que sigue lo escriben ustedes.</p><a class="btn sm" href="#galeria">Volver a la entrada del museo</a></div>`;
$('#galRule').innerHTML='<span class="gr-line"><i id="galFill"></i></span>'+P.map((p,i)=>`<button class="gr-dot" data-i="${i}" style="left:${i/(N-1)*100}%" aria-label="Ir a ${p.yl}: ${p.t}"><span>${p.yl.replace('c. ','')}</span></button>`).join('');
const pieces=$$('.piece',track).slice(0,N),frames=pieces.map(p=>$('.frame',p)),cvs=pieces.map(p=>$('canvas',p));
const bot=$('#galBot');const M=L.makeMascot($('.gb-m',bot),'gm',true);L.hatOn(M,'laurel');
const say=$('#galSay');
const roman=n=>{const m=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const[v,r]of m)while(n>=v){s+=r;n-=v;}return s;};
const ylab=y=>y<0?`${-Math.round(y)} a.C.`:String(Math.round(y));
let S=0,X=0,lastFi=0,dir=1,cur=-1,stH=0,vw=0;
/* ---------- salas: paredes de marmol y madera, piso de duela, luces de riel ---------- */
const MATS={
 carrara:{n:'Mármol de Carrara con oro',m:0,a:[.95,.95,.94],b:[.86,.86,.85],v:[.40,.40,.42],v2:[.62,.62,.64],g:[.80,.62,.27],ang:.7,fr:3.2,sh:9,net:.22,gold:.95,sc:2.2},
 travertino:{n:'Travertino romano',m:2,a:[.91,.83,.71],b:[.82,.70,.56],v:[.72,.58,.43],v2:[.55,.42,.30],g:[.95,.9,.82],ang:0,fr:0,sh:1,net:0,gold:0,sc:2.0},
 nogal:{n:'Biblioteca de nogal',m:1,a:[.40,.24,.14],b:[.33,.19,.11],v:[.27,.15,.08],v2:[.22,.12,.06],g:[.52,.33,.19],ang:0,fr:14,sh:1,net:0,gold:0,sc:1},
 madera:{n:'Taller de tablones',m:1,a:[.85,.62,.39],b:[.66,.35,.16],v:[.49,.23,.11],v2:[.36,.17,.08],g:[.95,.79,.57],ang:0,fr:10,sh:1,net:0,gold:0,sc:1},
 bardiglio:{n:'Mármol Bardiglio',m:0,a:[.58,.59,.61],b:[.45,.46,.49],v:[.84,.85,.87],v2:[.33,.34,.37],g:[.9,.9,.92],ang:.35,fr:5,sh:6,net:.15,gold:0,sc:2.4},
 verde:{n:'Verde Alpi',m:0,a:[.10,.24,.20],b:[.05,.13,.11],v:[.84,.93,.87],v2:[.22,.40,.33],g:[.9,.95,.9],ang:1.1,fr:2.4,sh:14,net:.8,gold:0,sc:2.6},
 nero:{n:'Nero Marquina',m:0,a:[.065,.065,.07],b:[.03,.03,.035],v:[.90,.90,.92],v2:[.30,.30,.32],g:[.95,.95,.96],ang:1.2,fr:2.2,sh:22,net:.35,gold:0,sc:2.2},
 rosa:{n:'Breccia rosa',m:0,a:[.93,.85,.82],b:[.86,.72,.67],v:[.50,.19,.17],v2:[.76,.52,.47],g:[.97,.92,.9],ang:.9,fr:1.8,sh:4,net:.55,gold:0,sc:2.0},
 rosso:{n:'Rosso Alicante',m:0,a:[.80,.34,.23],b:[.68,.25,.17],v:[.98,.89,.83],v2:[.55,.18,.12],g:[1,.95,.9],ang:1.3,fr:2.6,sh:16,net:.45,gold:0,sc:2.3},
 giallo:{n:'Giallo Siena',m:0,a:[.95,.72,.44],b:[.90,.58,.31],v:[.64,.25,.16],v2:[.98,.86,.66],g:[1,.93,.8],ang:.5,fr:2,sh:7,net:.65,gold:0,sc:2.2}};
const SALA=['carrara','travertino','nogal','nogal','madera','madera','madera','madera','bardiglio','bardiglio','bardiglio','bardiglio','verde','verde','nero','nero','rosa','rosso','rosso','rosa','giallo','giallo','nero'];
const salaOf=i=>MATS[SALA[clamp(i,0,SALA.length-1)]];

const TEX_FS=`precision highp float;
uniform vec2 R;uniform float uSeed,uMode,uAng,uFreq,uSharp,uNet,uGold,uScale,uRot;uniform vec3 cA,cB,cV,cV2,cG;
float h21(vec2 p){p=fract(p*vec2(233.34,851.73));p+=dot(p,p+23.45);return fract(p.x*p.y);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float s=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){s+=a*n2(p);p=m*p;a*=.5;}return s;}
float ridged(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){float n=1.-abs(n2(p)*2.-1.);s+=a*n*n;p=p*2.03+vec2(1.3,7.1);a*=.5;}return s;}
void main(){
 vec2 uv=gl_FragCoord.xy/R.y;if(uRot>.5)uv=vec2(gl_FragCoord.y,gl_FragCoord.x)/R.y;
 vec2 p=uv*uScale+uSeed*7.31;vec3 col;
 if(uMode<.5){
  vec2 q=vec2(fbm(p),fbm(p+vec2(5.2,1.3)));
  vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)),fbm(p+3.*q+vec2(8.3,2.8)));
  float f=fbm(p+2.5*r);
  float ca=cos(uAng),sa=sin(uAng);float ax=dot(p,vec2(ca,sa));
  float v=pow(1.-abs(sin(ax*uFreq+f*6.)),uSharp);
  float net=pow(ridged(p*1.6+r*2.),3.)*uNet;
  float fine=pow(1.-abs(sin(dot(p,vec2(-sa,ca))*uFreq*2.3+fbm(p*2.1)*9.)),uSharp*2.5);
  col=mix(cA,cB,smoothstep(.25,.8,f));
  col=mix(col,cV2,fine*.35);
  col=mix(col,cV,clamp(v*.85+net,0.,1.));
  float gv=pow(1.-abs(sin(ax*uFreq*.5+f*9.+1.3)),uSharp*3.)*uGold;
  col=mix(col,cG,gv);col+=cG*gv*.25;
  col*=.93+.12*fbm(p*.45+9.);
  float sh=smoothstep(.0,1.,1.-abs(uv.x*.35-uv.y*.9+.2)*1.6)*.07;col+=sh;
 }else if(uMode<1.5){
  float x=uv.x*uFreq;float c=floor(x),lx=fract(x);
  float o=h21(vec2(c,uSeed));float y=uv.y*1.7/max(uSharp,1.)+o*3.;float rw=floor(y),ly=fract(y);
  float id=h21(vec2(c*1.37+uSeed,rw));
  vec3 tone=id<.25?cA:id<.5?cB:id<.78?cV:cV2;tone=mix(tone,cG,h21(vec2(rw,c+3.))*.22);
  float g=fbm(vec2(lx*2.+id*13.,uv.y*24.));
  float rings=sin((lx*3.+g*2.5+id*7.)*18.);
  col=tone*(.76+.36*g)*(.93+.07*rings);
  col*=.86+.28*h21(vec2(c,rw+7.));
  vec2 kp=vec2(lx-.5,(ly-h21(vec2(c,rw+1.)))*4.);float knot=smoothstep(.22,.0,length(kp))*step(.82,h21(vec2(c+9.,rw)));col*=1.-knot*.55;
  float gap=smoothstep(0.,.03,lx)*smoothstep(1.,.97,lx)*smoothstep(0.,.012,ly)*smoothstep(1.,.988,ly);
  col*=mix(.22,1.,gap);
 }else{
  float b=fbm(vec2(p.x*.5,p.y*5.)+fbm(p*1.5)*1.2);col=mix(cA,cB,smoothstep(.3,.75,b));
  float l1=fbm(vec2(p.x*.8,p.y*14.));col=mix(col,cV,(smoothstep(.46,.5,l1)-smoothstep(.5,.54,l1))*.55);
  float pore=smoothstep(.8,.88,n2(p*vec2(16.,58.)));col=mix(col,cV2,pore*.75);
  col*=.94+.1*fbm(p*.4);
 }
 gl_FragColor=vec4(col,1.);}`;
const TEXGL=(()=>{try{const cv=document.createElement('canvas');const gl=cv.getContext('webgl',{preserveDrawingBuffer:true,antialias:false,alpha:false});if(!gl)return null;
 const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(o));return null;}return o;};
 const vs=sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'),fs=sh(gl.FRAGMENT_SHADER,TEX_FS);if(!vs||!fs)return null;
 const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.bindAttribLocation(pr,0,'a');gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return null;
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const U={};['R','uSeed','uMode','uAng','uFreq','uSharp','uNet','uGold','uScale','uRot','cA','cB','cV','cV2','cG'].forEach(n=>U[n]=gl.getUniformLocation(pr,n));return{cv,gl,pr,U,b};}catch(e){return null;}})();
function paintTex(target,mat,seed,w,h,rot){const c2=target.getContext('2d');target.width=w;target.height=h;
 if(!TEXGL){const g=c2.createLinearGradient(0,0,w,h);g.addColorStop(0,`rgb(${mat.a.map(v=>v*255|0)})`);g.addColorStop(1,`rgb(${mat.b.map(v=>v*255|0)})`);c2.fillStyle=g;c2.fillRect(0,0,w,h);return;}
 const {cv,gl,pr,U,b}=TEXGL;cv.width=w;cv.height=h;gl.viewport(0,0,w,h);gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 gl.uniform2f(U.R,w,h);gl.uniform1f(U.uSeed,seed);gl.uniform1f(U.uMode,mat.m);gl.uniform1f(U.uAng,mat.ang);gl.uniform1f(U.uFreq,mat.fr);gl.uniform1f(U.uSharp,mat.sh);gl.uniform1f(U.uNet,mat.net);gl.uniform1f(U.uGold,mat.gold);gl.uniform1f(U.uScale,mat.sc);gl.uniform1f(U.uRot,rot?1:0);
 gl.uniform3fv(U.cA,mat.a);gl.uniform3fv(U.cB,mat.b);gl.uniform3fv(U.cV,mat.v);gl.uniform3fv(U.cV2,mat.v2);gl.uniform3fv(U.cG,mat.g);gl.drawArrays(gl.TRIANGLES,0,3);c2.drawImage(cv,0,0);}

/* temperatura de color: Kelvin a RGB (aproximacion de Tanner Helland) */
function k2rgb(K){const t=K/100;let r,g,b;if(t<=66){r=255;g=99.4708025861*Math.log(t)-161.1195681661;b=t<=19?0:138.5177312231*Math.log(t-10)-305.0447927307;}else{r=329.698727446*Math.pow(t-60,-.1332047592);g=288.1221695283*Math.pow(t-60,-.0755148492);b=255;}return[r,g,b].map(v=>Math.round(clamp(v,0,255)));}
const KS=[6500,4500,3600,3000,2700];
function kDwell(s){const n=KS.length-1,c=(s/2.6)%(2*n),pos=c<=n?c:2*n-c,a=Math.floor(Math.min(pos,n-1e-6)),f=pos-a;return 1e6/lerp(1e6/KS[a],1e6/KS[a+1],sm(0,1,f));}
const kName=K=>K>5400?'fría':K>4100?'neutra':K>3300?'amarilla':K>2850?'ámbar':'cálida';

const strip=$('#galStrip');const W={panels:[],pils:[],lamps:[],refl:[],dwell:new Array(N).fill(0),K:new Array(N).fill(4200),done:[],sw:0,swv:0,lastX:0,lastT:0,floorDone:false};
for(let i=0;i<=N;i++){const p=document.createElement('div');p.className='gw-panel';p.innerHTML='<canvas class="gw-tex"></canvas><div class="gw-shade"></div><div class="gw-pool"></div>';strip.appendChild(p);W.panels.push(p);
 if(i>0&&i<N&&SALA[i]!==SALA[i-1]){const c=document.createElement('div');c.className='gw-pil';c.dataset.i=i;c.innerHTML=`<span>${salaOf(i).n}</span>`;strip.appendChild(c);W.pils.push(c);}}
const rail=document.createElement('div');rail.className='gw-rail';strip.appendChild(rail);
const floor=document.createElement('div');floor.className='gw-floor';strip.appendChild(floor);
for(let i=0;i<N;i++){const l=document.createElement('div');l.className='gw-lamp';l.innerHTML='<i class="gw-beam"></i><i class="gw-head"></i>';strip.appendChild(l);W.lamps.push(l);
 const r=document.createElement('i');r.className='gw-refl';floor.appendChild(r);W.refl.push(r);}
const G={};
function layoutWalls(){const pw=pieces[0].offsetWidth,sticky=$('.gal-sticky'),sr=sticky.getBoundingClientRect(),fr=frames[0].getBoundingClientRect();
 G.pw=pw;G.fTop=fr.top-sr.top;G.fH=fr.height;G.fCY=G.fTop+G.fH/2;G.H=sr.height;G.railY=Math.max(64,G.fTop-70);G.floorH=G.H*.16;
 const total=vw/2+(N+.5)*S+vw*1.5;strip.style.width=total+vw+'px';strip.style.left=-vw+'px';
 const X0=vw;
 W.panels.forEach((p,i)=>{let L0=X0+vw/2+(i-.5)*S,w=S;if(i===0){w+=L0;L0=0;}if(i===N)w+=vw;p.style.left=L0+'px';p.style.width=w+'px';p.style.setProperty('--py',(G.fCY/G.H*100).toFixed(1)+'%');p.style.setProperty('--px',i===0?((X0+vw/2-L0)/w*100).toFixed(1)+'%':'50%');p.__w=w;});
 W.pils.forEach(c=>{const i=+c.dataset.i;c.style.left=(X0+vw/2+(i-.5)*S)+'px';});
 rail.style.top=G.railY+'px';floor.style.height=G.floorH+'px';
 W.lamps.forEach((l,i)=>{const lx=X0+vw/2+i*S-pw*.46;l.style.left=lx+'px';l.style.top=(G.railY+6)+'px';const dy=G.fCY-G.railY,dx=pw*.46;l.__base=-Math.atan2(dx,dy)*180/Math.PI;const len=Math.hypot(dx,dy);l.style.setProperty('--bl',(len*1.15)+'px');l.style.setProperty('--bw',(pw*1.05)+'px');});
 W.refl.forEach((r,i)=>{r.style.left=(X0+vw/2+i*S-pw*.6)+'px';r.style.width=pw*1.2+'px';});
 W.done=[];}
function texFor(i){const p=W.panels[i],m=salaOf(i===N?N-1:i),w=p.__w||S,tw=Math.round(Math.min(1400,Math.max(360,w*.55))),th=Math.round(tw*G.H/w);paintTex($('canvas',p),m,i*1.37+3.1,tw,th,false);p.classList.add('ready');W.done[i]=true;}
function floorTex(){const c=document.createElement('canvas');paintTex(c,Object.assign({},MATS.madera,{fr:5,sh:3.5}),7.7,1600,200,true);try{floor.style.backgroundImage=`url(${c.toDataURL('image/jpeg',.85)})`;}catch(e){}W.floorDone=true;}
function updateWalls(t,fi,i,d){strip.style.transform=`translate3d(${-X}px,0,0)`;
 const dt=Math.min(.05,Math.max(0,t-(W.lastT||t)));W.lastT=t;const vel=dt>0?(X-W.lastX)/dt:0;W.lastX=X;
 W.swv+=(-W.sw*16-W.swv*3.4-clamp(vel,-4000,4000)*.0011)*dt;W.sw=clamp(W.sw+W.swv*dt,-14,14);
 if(!W.floorDone)floorTex();
 const lo=Math.max(0,Math.floor(fi)-2),hi=Math.min(N,Math.ceil(fi)+3);
 for(let j=lo;j<=hi;j++){if(!W.done[j]){texFor(j);break;}}
 for(let j=Math.max(0,lo-1);j<=Math.min(N-1,hi);j++){const centered=j===i&&Math.abs(d)<.22;W.dwell[j]=centered?W.dwell[j]+dt:0;
  const target=centered?kDwell(W.dwell[j]):4300;W.K[j]=1e6/lerp(1e6/W.K[j],1e6/target,.08);const[r,g,b]=k2rgb(W.K[j]);
  const I=centered?1:clamp(.5-.25*Math.abs(fi-j),.18,.5);const lc=`${r},${g},${b}`;
  [W.panels[j],pieces[j],W.lamps[j],W.refl[j]].forEach(el=>{el.style.setProperty('--lc',lc);el.style.setProperty('--li',I.toFixed(3));});
  const l=W.lamps[j];l.style.transform=`rotate(${(l.__base+W.sw*(.8+.4*Math.sin(j*1.7))+Math.sin(t*.7+j*2.1)*1.2).toFixed(2)}deg)`;}
 const K=W.K[i];$('#galSala').textContent='Sala · '+salaOf(i).n;$('#galLuz').textContent=`Luz ${kName(K)} · ${Math.round(K/50)*50} K`;}

function measure(){vw=innerWidth;const p0=pieces[0],p1=pieces[1];S=p1.offsetLeft-p0.offsetLeft;stH=innerHeight;const xmax=N*S;gal.style.height=Math.round(xmax/1.35+stH)+'px';gal.__xmax=xmax;layoutWalls();}
addEventListener('resize',measure);measure();setTimeout(measure,600);
$$('.gr-dot').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.i;const r=gal.getBoundingClientRect();const top=scrollY+r.top+(i*S)/gal.__xmax*(gal.offsetHeight-innerHeight);scrollTo({top,behavior:RM?'auto':'smooth'});}));
const T=L.addTask(gal,t=>{const r=gal.getBoundingClientRect();const span=gal.offsetHeight-innerHeight;const p=clamp(-r.top/span,0,1);X=p*gal.__xmax;
 track.style.transform=`translate3d(${-X}px,0,0)`;
 const fi=X/S,i=clamp(Math.round(fi),0,N-1),d=fi-i;if(Math.abs(fi-lastFi)>.0005)dir=fi>lastFi?1:-1;lastFi=fi;
 const i0=clamp(Math.floor(fi),0,N-1),i1=Math.min(N-1,i0+1),fr=clamp(fi-i0,0,1);const yr=lerp(P[i0].y,P[i1].y,sm(.25,.75,fr));
 $('#galYear').textContent=ylab(yr);$('#galCent').textContent=yr<0?'Siglo IV a.C.':'Siglo '+roman(Math.floor((Math.round(yr)-1)/100)+1);$('#galEra').textContent=P[i].era;$('#galFill').style.width=clamp(fi/(N-1),0,1)*100+'%';
 if(i!==cur){cur=i;$$('.gr-dot').forEach((b,j)=>b.classList.toggle('on',j===i));L.hatOn(M,P[i].hat);}
 updateWalls(t,fi,i,d);
 const isQ=i===N-1;let e=isQ?0:1-sm(.1,.3,Math.abs(d));if(fi>N-1+.35)e=0;
 const faint=clamp((fi-(N-1-.28))/.22,0,1);
 const fr0=frames[i].getBoundingClientRect(),gr=$('.gal-sticky').getBoundingClientRect();
 const floorY=gr.height*.86,frameCY=fr0.top-gr.top+fr0.height*.5,e2=e*e*(3-2*e);
 const walk=(1-e2)*Math.abs(Math.sin(fi*Math.PI*3))*14*(1-faint);
 const y=lerp(floorY,frameCY+fr0.height*.18,e2)-walk,sc=lerp(1,.8,e2);
 bot.style.transform=`translate3d(-50%,${y}px,0) translateY(-100%) scale(${sc})`;
 const mi=$('.gb-m',bot);mi.style.transform=`scaleX(${dir<0&&!faint?-1:1}) rotate(${-92*faint}deg) translateY(${faint*30}%)`;
 bot.classList.toggle('faint',faint>.6);bot.classList.toggle('inside',e>.85);
 frames.forEach((f,j)=>f.classList.toggle('lit',j===i&&e>.85));
 const showSay=e>.8||faint>.6;say.hidden=!showSay;if(showSay){if(say.textContent!==P[i].n)say.textContent=P[i].n;const sw=say.offsetWidth,shh=say.offsetHeight;let sx,sy;if(vw<700){sx=clamp(vw/2+34,12,vw-sw-12);sy=gr.height*.86-shh-96;if(isQ){sx=12;sy=gr.height*.86-shh-24;}}else{sx=Math.min(vw/2+70*sc,vw-sw-16);sy=y-110*sc;}say.style.transform=`translate3d(${sx}px,${sy}px,0)`;}
},{anim:true});
cvs.forEach((cv,i)=>{L.addTask(cv,t=>{const[c,w,h]=L.fit(cv,1.5);const fi=X/S;const e=i===N-1?0:clamp(1-Math.abs(fi-i)/.3,0,1);c.save();ART[P[i].k](c,w,h,t,e);c.restore();},{anim:true});});
})();
