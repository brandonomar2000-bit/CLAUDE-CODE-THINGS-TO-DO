/* ================= RENDER: agua, tierra, fuego, aire ================= */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=$('#rxCv');if(!cv)return;
const gl=cv.getContext('webgl',{antialias:false,alpha:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});
if(!gl){$('#rxFail').hidden=false;return;}

const HEAD=`precision highp float;
uniform vec2 R;uniform float T;uniform float uSun;uniform float uK;uniform vec2 uCam;uniform float uQ;
float h21(vec2 p){p=fract(p*vec2(233.34,851.73));p+=dot(p,p+23.45);return fract(p.x*p.y);}
float h31(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yxz+33.33);return fract((p.x+p.y)*p.z);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
 return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),u.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),u.x),u.y),
            mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),u.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),u.x),u.y),u.z);}
float fbm2(vec2 p){float a=.5,s=0.;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){s+=a*n2(p);p=m*p;a*=.5;}return s;}
float fbm3(vec3 p,int o){float a=.5,s=0.;for(int i=0;i<6;i++){if(i>=o)break;s+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
vec3 sunDir(){float e=uSun;return normalize(vec3(cos(e)*.45,sin(e),cos(e)*.89));}
float dayF(){return smoothstep(-.12,.12,sunDir().y);}
vec3 sunCol(){float y=sunDir().y;return mix(vec3(1.,.42,.18),vec3(1.,.93,.85),smoothstep(0.,.45,y))*3.2*dayF();}
vec3 sky(vec3 rd){vec3 s=sunDir();float y=max(rd.y,0.);
 vec3 day=mix(vec3(.50,.66,.90),vec3(.08,.24,.62),pow(y,.38));
 float low=1.-smoothstep(-.05,.45,s.y);
 vec3 dusk=mix(vec3(1.,.5,.26),vec3(.22,.24,.52),pow(y,.38));
 vec3 c=mix(day,dusk,low*.9);
 c=mix(vec3(.012,.018,.05),c,dayF());
 float sd=max(dot(rd,s),0.);
 c*=.85;c+=vec3(1.,.62,.35)*pow(sd,10.)*.22*dayF()+vec3(1.,.92,.8)*pow(sd,2500.)*24.*dayF();
 c+=vec3(.9,.95,1.)*step(.9985,h21(floor(rd.xz/max(rd.y,.05)*240.)))*(1.-dayF())*step(0.,rd.y)*.8;
 return c;}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
vec3 post(vec3 c,vec2 q){c=aces(c);c=pow(c,vec3(1./2.2));c*=.6+.4*pow(16.*q.x*q.y*(1.-q.x)*(1.-q.y),.18);c+=(h21(q*R+fract(T))-.5)/128.;return c;}
vec3 camRay(vec2 uv,float fov){float y=uCam.x,p=uCam.y;vec3 f=vec3(cos(p)*sin(y),sin(p),cos(p)*cos(y));vec3 r=normalize(cross(f,vec3(0,1,0)));vec3 u=cross(r,f);return normalize(uv.x*r+uv.y*u+fov*f);}
`;

/* ---------- AGUA: suma de ondas con dispersion w = sqrt(g k), Fresnel, espuma ---------- */
const WATER=HEAD+`
float seaH(vec2 p,int N){float h=0.,a=.5*uK,f=.2,k=2.4,an=.35;
 for(int i=0;i<9;i++){if(i>=N)break;vec2 d=vec2(cos(an),sin(an));
  float x=dot(d,p)*f+T*sqrt(9.8*f)*.75+n2(p*f*.4+float(i)*7.)*2.4;
  h+=a*(pow(.5+.5*sin(x),k)*2.-1.);an+=2.39996;f*=1.68;a*=.5;k=max(1.1,k-.2);}
 return h;}
void main(){vec2 q=gl_FragCoord.xy/R,uv=(2.*gl_FragCoord.xy-R)/R.y;
 vec3 ro=vec3(T*1.2,2.6+uK*1.6,T*.6);vec3 rd=camRay(uv,1.7);
 vec3 col=sky(rd);vec3 s=sunDir();
 if(rd.y<.02){
  float tp=0.,tm=.2,hit=0.;int ST=int(110.*uQ);
  for(int i=0;i<240;i++){if(i>=ST)break;vec3 p=ro+rd*tm;float d=p.y-seaH(p.xz,4);if(d<0.){hit=1.;break;}tp=tm;tm+=max(d*.65,.02+tm*.006);if(tm>500.)break;}
  float t=tm;
  if(hit>.5){for(int i=0;i<7;i++){float m=(tp+tm)*.5;vec3 p=ro+rd*m;if(p.y-seaH(p.xz,4)<0.)tm=m;else tp=m;}t=tm;}
  else t=min(-ro.y/min(rd.y,-1e-4),900.);
  vec3 p=ro+rd*t;int NN=int(5.+3.*uQ);float e=.01+t*.0025;
  float hc=seaH(p.xz,NN);
  vec3 n=normalize(vec3(seaH(p.xz-vec2(e,0),NN)-seaH(p.xz+vec2(e,0),NN),2.*e,seaH(p.xz-vec2(0,e),NN)-seaH(p.xz+vec2(0,e),NN)));
  n=normalize(mix(n,vec3(0,1,0),smoothstep(60.,400.,t)));
  float fr=pow(clamp(1.-dot(n,-rd),0.,1.),5.);fr=.02+.98*fr;fr=min(fr,.9);
  vec3 refl=sky(reflect(rd,n));
  float lit=max(dot(n,s),0.);
  vec3 deep=vec3(.002,.018,.04);
  vec3 body=deep+vec3(.02,.13,.15)*(.35+.65*lit)*dayF();
  float crest=clamp(hc/(.9*uK+.01)*.5+.5,0.,1.);
  body+=vec3(.04,.30,.27)*pow(crest,2.)*pow(max(dot(rd,s),0.)*.6+.4,2.)*dayF();
  col=mix(body,refl,fr);
  vec3 hv=normalize(s-rd);col+=sunCol()*pow(max(dot(n,hv),0.),700.)*4.;
  float foam=smoothstep(.55,.95,crest)*smoothstep(.35,.7,n2(p.xz*2.2+T*.6)+n2(p.xz*6.)*.5);
  col=mix(col,vec3(.85,.9,.92)*(.15+.85*dayF())*(.4+.6*lit),foam*.55*smoothstep(150.,10.,t));
  vec3 hz=sky(normalize(vec3(rd.x,.015,rd.z)));col=mix(hz,col,exp(-t*.0035));
 }
 gl_FragColor=vec4(post(col,q),1.);}`;

/* ---------- TIERRA: bloques con recorrido DDA, sombras, AO, agua ---------- */
const EARTH=HEAD+`
const float WL=7.;
float terr(vec2 c){float h=fbm2(c*.021)*34.*uK;h+=(1.-abs(n2(c*.06)*2.-1.))*5.*uK;return h-4.;}
float Hc(vec2 c){return floor(terr(c));}
float dda(vec3 ro,vec3 rd,int MX,out vec3 nrm,out vec3 cell){
 cell=floor(ro);vec3 st=sign(rd);vec3 tD=1./max(abs(rd),vec3(1e-5));vec3 tM=(st*(cell-ro)+st*.5+.5)*tD;nrm=vec3(0,1,0);float t=0.;
 for(int i=0;i<300;i++){if(i>=MX)break;if(cell.y<Hc(cell.xz))return t;if(cell.y>48.&&st.y>=0.)break;
  vec3 m=step(tM,tM.yzx)*step(tM,tM.zxy);t=dot(tM,m);tM+=m*tD;cell+=m*st;nrm=-m*st;}
 return -1.;}
float solid(vec3 c){return step(c.y,Hc(c.xz)-1.);}
vec3 blockCol(vec3 cell,vec3 nrm,vec3 p){
 float H=Hc(cell.xz);float dep=H-1.-cell.y;
 vec2 fuv=nrm.y!=0.?p.xz:(nrm.x!=0.?p.zy:p.xy);vec2 lc=fract(fuv);vec2 tx=floor(lc*8.);
 float v=h21(tx+cell.xz*13.1+cell.y*7.7);float vv=.82+.3*v;
 vec3 grass=vec3(.16,.40,.07),dirt=vec3(.36,.23,.13),stone=vec3(.40,.40,.43),snow=vec3(.9,.93,.98),sand=vec3(.80,.72,.48);
 vec3 c;
 if(H<=WL+1.)c=sand;
 else if(H>22.){c=dep<.5&&nrm.y>.5?snow:stone;if(dep<.5&&nrm.y<.5&&lc.y>.75)c=snow;}
 else if(H>17.)c=stone;
 else{if(dep<.5){c=nrm.y>.5?grass:dirt;if(nrm.y<.5&&lc.y>.8-v*.12)c=grass;}else c=dirt;}
 return c*vv;}
void main(){vec2 q=gl_FragCoord.xy/R,uv=(2.*gl_FragCoord.xy-R)/R.y;
 vec3 ro=vec3(T*3.,15.+14.*uK,T*1.8+40.);vec3 rd=camRay(uv,1.5);vec3 s=sunDir();
 vec3 nrm,cell;int ST=int(140.*uQ);float t=dda(ro,rd,ST,nrm,cell);
 vec3 bg=sky(rd);vec3 col=bg;float tw=rd.y<0.?(WL-ro.y)/rd.y:-1.;
 float tt=t>0.?t:1e4;
 if(t>0.){vec3 p=ro+rd*t;vec3 alb=blockCol(cell,nrm,p);
  vec3 n2_,c2;float sh=dda(p+nrm*.002+s*.001,s,int(56.*uQ),n2_,c2)>0.?0.:1.;
  vec3 t1=abs(nrm.y)>.5?vec3(1,0,0):vec3(0,1,0);vec3 t2=cross(nrm,t1);vec3 cn=cell+nrm;
  float ao=1.-.17*(solid(cn+t1)+solid(cn-t1)+solid(cn+t2)+solid(cn-t2));
  vec2 lc=fract(nrm.y!=0.?p.xz:(nrm.x!=0.?p.zy:p.xy));float edge=smoothstep(0.,.06,min(min(lc.x,1.-lc.x),min(lc.y,1.-lc.y)));
  float dif=max(dot(nrm,s),0.)*sh;
  vec3 amb=sky(normalize(nrm+vec3(0,.6,0)))*.55;
  col=alb*(sunCol()*dif*.62+amb*ao*.9+vec3(.03,.035,.05))*(.8+.2*edge);
  col=mix(sky(normalize(vec3(rd.x,.03,rd.z))),col,exp(-t*.0032));}
 if(tw>0.&&tw<tt){vec3 p=ro+rd*tw;vec3 n=normalize(vec3((n2(p.xz*1.3+T)-.5)*.12,1.,(n2(p.zx*1.3-T*.8)-.5)*.12));
  float fr=.02+.98*pow(1.-max(dot(n,-rd),0.),5.);vec3 refl=sky(reflect(rd,n));
  float dep=t>0.?(t-tw):30.;vec3 under=(t>0.?col:vec3(.02,.06,.08))*exp(-dep*vec3(.45,.16,.09));
  vec3 w=mix(under+vec3(.01,.05,.07)*dayF(),refl,fr);w+=sunCol()*pow(max(dot(reflect(rd,n),s),0.),300.)*2.;
  col=mix(sky(normalize(vec3(rd.x,.03,rd.z))),w,exp(-tw*.0032));}
 gl_FragColor=vec4(post(col,q),1.);}`;

/* ---------- FUEGO: volumen con ruido fractal y emision de cuerpo negro ---------- */
const FIRE=HEAD+`
float sdCap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float logs(vec3 p){float d=sdCap(p,vec3(-1.1,.16,-.45),vec3(1.1,.16,.45),.17);d=min(d,sdCap(p,vec3(-.5,.16,1.05),vec3(.5,.18,-1.05),.16));d=min(d,sdCap(p,vec3(-.95,.42,.15),vec3(.9,.30,-.25),.13));return d;}
float scn(vec3 p){return min(p.y,logs(p));}
float fireD(vec3 p,int o){float h=p.y-.15;if(h<0.||h>3.4)return 0.;
 float H=2.1+1.1*uK;
 vec2 sway=vec2(sin(h*1.7-T*2.3),cos(h*1.3-T*1.9))*.12*h;
 float r=length(p.xz+sway);
 float w=(.95*uK+.15)*(1.-pow(clamp(h/H,0.,1.),.8));
 float shape=1.-smoothstep(0.,w,r);
 float n=fbm3(vec3(p.x*1.7,h*1.25-T*2.4,p.z*1.7),o);
 return max(shape*(n*1.9-.45)-h*.08,0.)*3.2;}
vec3 bb(float x){x=max(x,0.);return vec3(1.,.36,.07)*pow(x,1.1)*1.6+vec3(.6,.5,.2)*pow(x,2.4)+vec3(.2,.3,.6)*pow(x,4.)*.6;}
float flick(){return .8+.12*sin(T*13.)+.08*sin(T*29.+1.3)+.06*n2(vec2(T*7.,.3));}
void main(){vec2 q=gl_FragCoord.xy/R,uv=(2.*gl_FragCoord.xy-R)/R.y;
 float yw=uCam.x,pt=clamp(uCam.y,-.6,.15);vec3 ro=vec3(sin(yw)*-4.6,1.25-pt*3.,cos(yw)*-4.6);
 vec3 ta=vec3(0,1.,0);vec3 f=normalize(ta-ro),rr=normalize(cross(f,vec3(0,1,0))),uu=cross(rr,f);vec3 rd=normalize(uv.x*rr+uv.y*uu+1.7*f);
 vec3 L=vec3(0,.75,0);float fl=flick()*(.6+.6*uK);
 vec3 col=vec3(.006,.005,.01)+vec3(.02,.018,.03)*max(rd.y,0.);
 float t=0.;float th=-1.;for(int i=0;i<90;i++){vec3 p=ro+rd*t;float d=scn(p);if(d<.002){th=t;break;}t+=d;if(t>30.)break;}
 if(th>0.){vec3 p=ro+rd*th;vec2 e=vec2(.002,0);vec3 n=normalize(vec3(scn(p+e.xyy)-scn(p-e.xyy),scn(p+e.yxy)-scn(p-e.yxy),scn(p+e.yyx)-scn(p-e.yyx)));
  vec3 ld=L-p;float dl=length(ld);ld/=dl;float lit=max(dot(n,ld),0.)*fl*7./(1.+dl*dl*1.6);
  bool isLog=logs(p)<.01;
  vec3 alb=isLog?vec3(.09,.06,.045)*(.6+.8*n2(p.xz*vec2(20.,4.))):vec3(.16,.14,.13)*(.55+.6*fbm2(p.xz*3.));
  if(!isLog){float stone=smoothstep(.45,.55,n2(p.xz*2.5));alb=mix(alb,vec3(.22,.2,.19),stone*.6);}
  col=alb*vec3(1.,.5,.2)*lit+alb*vec3(.03,.035,.06);
  if(isLog){float ember=smoothstep(.7,.86,n3(p*14.+vec3(0,T*.4,0)))*smoothstep(.5,.0,p.y-.05+length(p.xz)*.18);col+=bb(.75)*ember*fl*.9;}
  col*=exp(-th*.03);}
 float tmax=th>0.?th:30.;
 vec3 acc=vec3(0);float tr=1.;
 float t0=max(0.,length(ro.xz)-1.8);int ST=int(70.*uQ);float dt=4./float(ST);
 float j=h21(gl_FragCoord.xy+fract(T*3.))*dt;
 int OC=uQ>1.2?5:4;
 for(int i=0;i<160;i++){if(i>=ST)break;float tc=t0+j+float(i)*dt;if(tc>tmax)break;vec3 p=ro+rd*tc;
  float d=fireD(p,OC);if(d>.001){float h=p.y-.15;float temp=d*(1.15-h*.26)*fl;acc+=tr*bb(temp)*d*dt*2.6;tr*=exp(-d*dt*.9);if(tr<.02)break;}}
 col=col*tr+acc;
 for(int k=0;k<18;k++){float fk=float(k);float life=fract(T*.35+fk*.137);vec3 sp=vec3(sin(fk*3.1+T*.7)*.5*(1.-life)+sin(life*9.+fk)*.25,.4+life*4.2*(.6+.4*uK),cos(fk*2.3)*.4*(1.-life));
  vec3 w=sp-ro;float tp=dot(w,rd);if(tp<0.||tp>tmax)continue;float dd=length(w-rd*tp);col+=vec3(1.,.55,.15)*exp(-dd*dd*9000.)*(1.-life)*3.*fl;}
 gl_FragColor=vec4(post(col*1.15,q),1.);}`;

/* ---------- AIRE: nubes volumetricas, Beer-Lambert, Henyey-Greenstein ---------- */
const AIR=HEAD+`
const float LO=-4.,HI=1.2;
float cloudD(vec3 p,int o){if(p.y<LO||p.y>HI)return 0.;float hn=(p.y-LO)/(HI-LO);
 float prof=smoothstep(0.,.18,hn)*smoothstep(1.,.45,hn);
 vec3 w=vec3(T*.35,0.,T*.14)*(.4+uK);
 vec3 qq=p*.26+w;float b=fbm3(qq,o);
 float cov=.72-.2*uK;
 return max((b-cov+.12*hn)*prof*1.9,0.)*3.;}
float hg(float c,float g){float g2=g*g;return (1.-g2)/(12.566*pow(1.+g2-2.*g*c,1.5));}
void main(){vec2 q=gl_FragCoord.xy/R,uv=(2.*gl_FragCoord.xy-R)/R.y;
 vec3 ro=vec3(0.,2.1,T*1.1);vec3 rd=camRay(uv,1.55);vec3 s=sunDir();
 vec3 bg=sky(rd);
 if(rd.y<0.){float tg=(ro.y+9.)/-rd.y;vec3 g=ro+rd*tg;vec3 land=mix(vec3(.05,.08,.06),vec3(.12,.12,.09),fbm2(g.xz*.05))*(.3+.7*dayF())*max(s.y,.05);bg=mix(sky(normalize(vec3(rd.x,.02,rd.z))),land,exp(-tg*.012));}
 float t0,t1;
 if(rd.y<0.){t0=max((HI-ro.y)/rd.y,0.);t1=(LO-ro.y)/rd.y;}else if(ro.y<HI){t0=0.;t1=(HI-ro.y)/max(rd.y,1e-3);}else{t0=0.;t1=0.;}
 t1=min(t1,t0+45.);
 int ST=int(56.*uQ);float dt=(t1-t0)/float(ST);float tr=1.;vec3 acc=vec3(0);
 float cs=dot(rd,s);float ph=mix(hg(cs,.65),hg(cs,-.25),.35)*3.;
 vec3 sc=sunCol();vec3 amb=mix(vec3(.25,.3,.42),vec3(.6,.7,.85),dayF())*(.15+.85*dayF());
 float j=h21(gl_FragCoord.xy+fract(T*7.))*dt;
 int OC=uQ>1.2?5:4;
 for(int i=0;i<140;i++){if(i>=ST||t1<=t0)break;vec3 p=ro+rd*(t0+j+float(i)*dt);float d=cloudD(p,OC);
  if(d>.002){float od=0.;for(int k=1;k<6;k++){od+=cloudD(p+s*float(k)*.35,3);}float Tl=exp(-od*.35*1.7);float pw=1.-exp(-d*2.);
   float hn=(p.y-LO)/(HI-LO);vec3 L=sc*Tl*pw*(ph*.9+.12)+amb*(.18+.5*hn);
   acc+=tr*L*d*dt;tr*=exp(-d*dt*1.25);if(tr<.015)break;}}
 vec3 col=bg*tr+acc;
 float fogT=1.-exp(-max(t0,0.)*.004);col=mix(col,sky(rd),fogT*.3);
 col+=sc*pow(max(cs,0.),40.)*.06*tr;
 gl_FragColor=vec4(post(col,q),1.);}`;

const SCENES={
 agua:{src:WATER,k:'Oleaje',kv:1,cam:[.6,-.11],sun:.32,nm:'Agua',tech:'Suma de 9 ondas',
  ficha:['Agua','La superficie es una suma de ondas que viajan en direcciones distintas. Cada una avanza con la relación de dispersión de aguas profundas, ω = √(g·k): las olas largas corren más rápido que las cortas.','El color sale de mezclar el reflejo del cielo con el azul del fondo según el ángulo de Fresnel. La espuma aparece en las crestas y el brillo del sol es un reflejo especular.','Ondas · Fresnel · reflejo especular · niebla atmosférica']},
 tierra:{src:EARTH,k:'Altura de montañas',kv:1,cam:[3.6,-.46],sun:.7,nm:'Tierra',tech:'Bloques con trazado de rayos',
  ficha:['Tierra','Un mundo de bloques de 1 m generado con ruido fractal. Cada rayo avanza bloque por bloque con el algoritmo DDA de Amanatides y Woo, el mismo truco de los motores de voxeles.','Un segundo rayo hacia el sol decide si el bloque está en sombra. La oclusión ambiental oscurece las esquinas, y el agua refracta y absorbe el rojo primero.','Voxeles · DDA · sombras · oclusión ambiental · agua con absorción']},
 fuego:{src:FIRE,k:'Intensidad',kv:1,cam:[.4,-.18],sun:-.1,nm:'Fuego',tech:'Volumen con emisión',
  ficha:['Fuego','La llama es un volumen. El rayo la atraviesa en 70 a 112 pasos y en cada uno suma luz según la densidad, que sale de ruido fractal que sube con el tiempo.','El color sigue una rampa de cuerpo negro: lo más caliente tiende al amarillo blanco y lo más frío al rojo. La misma llama ilumina el piso y los troncos con un parpadeo.','Volumen · ruido fractal 3D · cuerpo negro · luz puntual con parpadeo · chispas']},
 aire:{src:AIR,k:'Viento y nubes',kv:1,cam:[.5,-.1],sun:.22,nm:'Aire',tech:'Nubes volumétricas',
  ficha:['Aire','Volamos sobre un mar de nubes. Cada nube es densidad en 3D y el rayo la recorre sumando luz, que se atenúa con la ley de Beer-Lambert.','Para cada punto, un rayo corto hacia el sol mide cuánta nube hay en medio. La función de fase de Henyey-Greenstein hace que los bordes brillen a contraluz.','Volumen · Beer-Lambert · fase Henyey-Greenstein · autosombreado']}};

const VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(s));return null;}return s;}
const vs=sh(gl.VERTEX_SHADER,VS);
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
function prog(key){const S=SCENES[key];if(S.p!==undefined)return S.p;const fs=sh(gl.FRAGMENT_SHADER,S.src);if(!fs){S.p=null;return null;}
 const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(p));S.p=null;return null;}
 S.p=p;S.u={};['R','T','uSun','uK','uCam','uQ'].forEach(n=>S.u[n]=gl.getUniformLocation(p,n));return p;}

const st={scene:'agua',q:'auto',scale:.6,yaw:.6,pitch:-.06,sun:.32,k:1,t:0,last:0,ema:16,fr:0,fpsT:0,fpsN:0,fps:0};
const QM={papa:{s:.33,u:.55},auto:{s:null,u:1},max:{s:null,u:1.6}};
function setScene(key){st.scene=key;const S=SCENES[key];st.yaw=S.cam[0];st.pitch=S.cam[1];st.sun=S.sun;st.k=S.kv;
 $('#rxSun').value=st.sun;$('#rxK').value=st.k;$('#rxKL').firstChild.textContent=S.k+' ';[$('#rxSun'),$('#rxK')].forEach(r=>r.dispatchEvent(new Event('input',{bubbles:true})));
 $$('#rxTabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.s===key)));
 const f=S.ficha;$('#rxName').textContent=S.nm;$('#rxTech').textContent=S.tech;
 $('#rxFicha').innerHTML=`<div class="folio"><span>Cómo se modela · ${f[0]}</span><span>Render en tiempo real</span></div><p class="big">${f[1]}</p><p>${f[2]}</p><p class="mono" style="color:var(--art2);letter-spacing:.08em">${f[3]}</p>`;
 if(key==='tierra'&&!$('#rxFicha').dataset.told){$('#rxFicha').dataset.told='1';}
 if(!prog(key))$('#rxFail').hidden=false;T.dirty=true;}
$$('#rxTabs button').forEach(b=>b.addEventListener('click',()=>setScene(b.dataset.s)));
$('#rxSun').addEventListener('input',e=>{st.sun=+e.target.value;const h=Math.round(6+(st.sun+.15)/1.45*7.5);$('#rxSunO').textContent=st.sun<0?'noche':st.sun<.2?'atardecer':st.sun<.6?'tarde':'mediodía';T.dirty=true;});
$('#rxK').addEventListener('input',e=>{st.k=+e.target.value;$('#rxKO').textContent=st.k.toFixed(2)+'×';T.dirty=true;});
$$('#rxQ button').forEach(b=>b.addEventListener('click',()=>{st.q=b.dataset.q;$$('#rxQ button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 if(st.q==='max')st.scale=Math.min(devicePixelRatio||1,1.5);if(st.q==='auto')st.scale=.6;T.dirty=true;
 const m={papa:'Modo papa: resolución al 33%. Corre hasta en la computadora del ciber.',auto:'Automático: ajusta la resolución para mantener la fluidez.',max:'Modo 5090: resolución completa y más pasos por rayo. Si tu laptop despega, no fue mi culpa.'};$('#rxQN').textContent=m[st.q];}));
let drag=null;
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw:st.yaw,pitch:st.pitch};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{if(!drag)return;st.yaw=drag.yaw-(e.clientX-drag.x)*.006;st.pitch=Math.max(-1.1,Math.min(.6,drag.pitch-(e.clientY-drag.y)*.004));T.dirty=true;});
const up=()=>drag=null;cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
$('#rxShot').addEventListener('click',()=>{st.q='max';$$('#rxQ button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.q==='max')));st.scale=Math.min(devicePixelRatio||1,1.5);T.dirty=true;$('#rxQN').textContent='Modo 5090 activado. Mira el contador de FPS para ver cuánto aguanta tu equipo.';});

let T={dirty:true};const io=new IntersectionObserver(es=>es.forEach(e=>{T.vis=e.isIntersecting;T.dirty=true;}),{rootMargin:'60px'});io.observe(cv);
const t0=performance.now();let paused=false;
function frame(now){requestAnimationFrame(frame);if(!T.vis||document.hidden)return;if(RM&&!T.dirty)return;T.dirty=false;
 const dtm=now-(st.last||now);st.last=now;if(dtm>0&&dtm<3000){st.ema=st.ema*.85+Math.min(dtm,200)*.15;st.fpsN++;st.fpsT+=dtm;if(st.fpsT>500){st.fps=Math.round(1000*st.fpsN/st.fpsT);st.fpsN=0;st.fpsT=0;}}
 if(!RM)st.t+=Math.min(dtm,50)/1000;
 const Q=QM[st.q];let sc=Q.s||st.scale;
 if(st.q==='auto'&&++st.fr%8===0){if(st.ema>30&&st.scale>.28)st.scale*=.86;else if(st.ema<19&&st.scale<Math.min(devicePixelRatio||1,1.25))st.scale*=1.08;}
 const W=Math.max(2,Math.round(cv.clientWidth*sc)),H=Math.max(2,Math.round(cv.clientHeight*sc));if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
 const S=SCENES[st.scene],p=prog(st.scene);if(!p)return;
 gl.viewport(0,0,W,H);gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 gl.uniform2f(S.u.R,W,H);gl.uniform1f(S.u.T,st.t+(st.scene==='tierra'?0:4));gl.uniform1f(S.u.uSun,st.sun);gl.uniform1f(S.u.uK,st.k);gl.uniform2f(S.u.uCam,st.yaw,st.pitch);gl.uniform1f(S.u.uQ,Q.u);
 gl.drawArrays(gl.TRIANGLES,0,3);
 $('#rxHud').textContent=`${st.fps||'—'} FPS · ${W}×${H} · escala ${sc.toFixed(2)} · ${S.tech.toLowerCase()}`;}
setScene('agua');
requestAnimationFrame(frame);
})();
