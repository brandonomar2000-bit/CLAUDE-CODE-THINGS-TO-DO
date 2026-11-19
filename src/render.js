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
uniform float uPal;uniform float uBoom;uniform float uFlash;
uniform sampler2D uSim;uniform float uSimOn;uniform vec2 uSimTx;uniform vec2 uRight;
uniform float uBlack;uniform float uWin;uniform float uBoost;uniform float uLamp[6];uniform float uLampT[6];
float sdCap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
vec3 boomOff(float k){if(uBoom<0.)return vec3(0);float b=uBoom,back=smoothstep(4.,5.,b);
 float an=k*2.1+.5;vec2 d=vec2(cos(an),sin(an));float tt=min(b,1.25);
 return vec3(d.x*tt*2.3,max(0.,tt*3.4-4.9*tt*tt*.95),d.y*tt*2.3)*(1.-back);}
float logs(vec3 p){vec3 o0=boomOff(0.),o1=boomOff(1.),o2=boomOff(2.);
 float d=sdCap(p-o0,vec3(-1.1,.16,-.45),vec3(1.1,.16,.45),.17);
 d=min(d,sdCap(p-o1,vec3(-.5,.16,1.05),vec3(.5,.18,-1.05),.16));
 d=min(d,sdCap(p-o2,vec3(-.95,.42,.15),vec3(.9,.30,-.25),.13));return d;}
float stones(vec3 p){float a=atan(p.z,p.x);float id=floor(a/6.2831853*13.+.5);float an=id/13.*6.2831853;
 vec3 q=p-vec3(cos(an)*1.5,.07,sin(an)*1.5);float r=.17+.05*h21(vec2(id,3.));vec3 e=vec3(r*1.3,r*.85,r*1.05);
 return (length(q/e)-1.)*min(min(e.x,e.y),e.z);}
vec3 lampPos(int k){float a=float(k)*1.0472+.35;return vec3(cos(a)*9.,3.2,sin(a)*9.);}
float poles(vec3 p){float d=1e3;for(int k=0;k<6;k++){vec3 lp=lampPos(k);vec2 q=p.xz-lp.xz;d=min(d,max(length(q)-.06,p.y-3.1));d=min(d,length(p-lp)-.16);}return d;}
float occ(vec3 p){return min(logs(p),stones(p));}
float scn(vec3 p){return min(min(p.y,occ(p)),poles(p));}
float softSh(vec3 ro,vec3 rd,float mt){float res=1.,t=.03;for(int i=0;i<26;i++){float h=occ(ro+rd*t);res=min(res,8.*h/t);t+=clamp(h,.03,.3);if(res<.02||t>mt)break;}return clamp(res,0.,1.);}
vec3 hsv(float h,float s,float v){vec3 k=clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);return v*mix(vec3(1.),k,s);}
vec3 bb(float x){x=max(x,0.);return vec3(1.,.36,.07)*pow(x,1.1)*1.6+vec3(.6,.5,.2)*pow(x,2.4)+vec3(.2,.3,.6)*pow(x,4.)*.6;}
vec3 flameCol(float x,float h){x=max(x,0.);
 if(uPal<.5)return bb(x);
 if(uPal<1.5){vec3 bl=vec3(.10,.30,1.)*pow(x,1.1)*1.9+vec3(.55,.75,1.)*pow(x,3.)*.5;return mix(bl,bb(x)*.85,smoothstep(.9,2.,h));}
 if(uPal<2.5)return vec3(.12,1.,.48)*pow(x,1.1)*1.6+vec3(.75,1.,.9)*pow(x,3.)*.55;
 if(uPal<3.5)return vec3(1.,.04,.035)*pow(x,1.05)*2.+vec3(1.,.42,.36)*pow(x,3.2)*.4;
 return hsv(fract(h*.32-T*.22),.9,1.)*pow(x,1.1)*1.7+vec3(1.)*pow(x,3.4)*.4;}
vec3 lightCol(){if(uPal<.5)return vec3(1.,.52,.2);if(uPal<1.5)return vec3(.45,.6,1.);if(uPal<2.5)return vec3(.35,1.,.55);if(uPal<3.5)return vec3(1.,.14,.1);return hsv(fract(.15-T*.22),.75,1.);}
vec4 simBL(vec2 uv){vec2 st=uv/uSimTx-.5;vec2 i=floor(st),f=fract(st);vec2 a=(i+.5)*uSimTx;
 vec4 A=texture2D(uSim,a),B=texture2D(uSim,a+vec2(uSimTx.x,0.)),C=texture2D(uSim,a+vec2(0.,uSimTx.y)),D=texture2D(uSim,a+uSimTx);return mix(mix(A,B,f.x),mix(C,D,f.x),f.y);}
float fireD(vec3 p,int o){float h=p.y-.15;if(h<0.||h>3.4)return 0.;
 float gas=step(.5,uPal)*step(uPal,1.5);float H=(2.1+1.1*uK)*uBoost;
 vec2 sway=vec2(sin(h*1.7-T*2.3),cos(h*1.3-T*1.9))*.12*h*(1.-gas*.7);
 float r=length(p.xz+sway);float w=(.95*uK+.15)*uBoost*(1.-pow(clamp(h/H,0.,1.),.8))*(1.-gas*.35);
 float shape=1.-smoothstep(0.,w,r);
 float n=fbm3(vec3(p.x*1.7,h*1.25-T*(2.4+gas*1.6),p.z*1.7),o);
 float alive=uBoom<0.?1.:smoothstep(4.,5.2,uBoom);
 return max(shape*(mix(n,.6+.28*n,gas)*1.9-.45)-h*.08,0.)*3.2*alive;}
float ballD(vec3 p){if(uBoom<0.||uBoom>3.6)return 0.;float b=uBoom;float R=.4+2.8*(1.-exp(-b*2.6));vec3 c=vec3(0.,.7+b*.8,0.);vec3 v=p-c;float d=length(v);
 float n=fbm3(p*1.3-vec3(0.,b*1.6,0.)+v/(d+.001)*b,4);
 float shell=1.-smoothstep(R*.5,R,d+(n-.5)*R*.7);
 return shell*max(n*1.6-.32,0.)*3.*(1.-smoothstep(1.4,3.6,b));}
float flick(){return .8+.12*sin(T*13.)+.08*sin(T*29.+1.3)+.06*n2(vec2(T*7.,.3));}
vec3 skyB(vec3 rd){return sky(rd)*(1.-.94*uBlack);}
vec3 city(vec3 rd){vec3 c=skyB(rd);float day=dayF()*(1.-uBlack),night=1.-day*.8;
 float y=rd.y;c+=vec3(1.,.5,.18)*exp(-max(y,0.)*26.)*.42*night*(.08+.92*uWin);
 float a=atan(rd.z,rd.x);float cx=a*36.;float id=floor(cx),fx=fract(cx);
 float hb=.016+.075*pow(h21(vec2(id,1.)),2.2)+step(.92,h21(vec2(id,7.)))*.07;
 if(y>-.01&&y<hb&&fx>.05&&fx<.95){vec3 bc=mix(vec3(.022,.02,.028),c*.4,.4*day);
  vec2 wc=vec2(fx*7.,y*520.);vec2 wi=floor(wc),wf=fract(wc);
  float lit=step(.6-.28*night,h21(wi+id*13.1))*step(.22,wf.x)*step(wf.x,.78)*step(.28,wf.y)*step(wf.y,.82);
  lit*=step(fract(id*.618+.13),uWin);
  vec3 wcol=mix(vec3(1.,.6,.2),vec3(1.,.84,.48),h21(wi+5.3+id));wcol=mix(wcol,vec3(1.,.42,.12),step(.78,h21(wi*1.7+id)));
  c=bc+wcol*lit*(.35+1.1*night)*(.88+.12*sin(T*1.7+id*3.));}
 return c;}
vec3 floorAlb(vec3 p){float r=length(p.xz);
 vec2 q=p.xz*vec2(1.2,1.85);float row=floor(q.y);q.x+=mod(row,2.)*.5;vec2 id=floor(q),f=fract(q);
 float gr=smoothstep(0.,.035,f.x)*smoothstep(1.,.965,f.x)*smoothstep(0.,.05,f.y)*smoothstep(1.,.95,f.y);
 float hv=h21(id+3.7);vec3 c=hv<.3?vec3(.66,.46,.37):hv<.55?vec3(.74,.58,.47):hv<.8?vec3(.57,.51,.47):vec3(.71,.58,.40);
 c*=.8+.32*fbm2(p.xz*5.+id*3.1);c*=.9+.16*n2(p.xz*46.);c=mix(vec3(.13,.11,.1),c,gr);
 float gv=smoothstep(6.6,7.4,r);vec2 gi=floor(p.xz*26.);vec3 grav=mix(vec3(.62,.5,.45),vec3(.42,.38,.36),h21(gi))*(.55+.6*h21(gi+9.));c=mix(c,grav,gv);
 c*=mix(.3,1.,smoothstep(.35,1.35,r));return c;}
void main(){vec2 q=gl_FragCoord.xy/R,uv=(2.*gl_FragCoord.xy-R)/R.y;
 float b=uBoom;vec2 shake=b>=0.&&b<.8?vec2(sin(b*90.),cos(b*77.))*.012*(1.-b/.8)*uFlash:vec2(0.);uv+=shake;
 float yw=uCam.x,pt=clamp(uCam.y,-.6,.15);vec3 ro=vec3(sin(yw)*-4.8,1.3-pt*3.,cos(yw)*-4.8);
 vec3 ta=vec3(0.,1.+.6*uBlack,0.);vec3 f=normalize(ta-ro),rr=normalize(cross(f,vec3(0.,1.,0.))),uu=cross(rr,f);vec3 rd=normalize(uv.x*rr+uv.y*uu+1.65*f);
 float fl=flick()*(.6+.6*uK)*uBoost;float boomL=b>=0.?(1.+7.*exp(-b*1.4)):1.;vec3 Lp=vec3(0.,.75+.5*uBoost-.5+(b>=0.?min(b,1.)*.9:0.),0.);vec3 LC=lightCol();
 vec3 s=sunDir();float sunOn=1.-uBlack;vec3 col;
 float t=0.,th=-1.;for(int i=0;i<96;i++){vec3 p=ro+rd*t;float d=scn(p);if(d<.002){th=t;break;}t+=d;if(t>45.)break;}
 if(th<0.&&rd.y<0.)th=-ro.y/rd.y;
 if(th>0.&&th<400.){vec3 p=ro+rd*th;vec3 n=vec3(0.,1.,0.);float dO=occ(p),dP=poles(p);bool isFloor=p.y<.004&&dO>.006&&dP>.006;
  if(!isFloor||th<30.){vec2 e=vec2(.002,0.);n=normalize(vec3(scn(p+e.xyy)-scn(p-e.xyy),scn(p+e.yxy)-scn(p-e.yxy),scn(p+e.yyx)-scn(p-e.yyx)));}
  vec3 alb;vec3 emi=vec3(0.);
  if(isFloor){alb=floorAlb(p);n=normalize(n+vec3(n2(p.xz*30.)-.5,0.,n2(p.zx*30.)-.5)*.05);}
  else if(dP<.006){alb=vec3(.05,.05,.06);for(int k=0;k<6;k++){vec3 lp=lampPos(k);if(length(p-lp)<.2){emi=vec3(1.,.7,.35)*6.*uLamp[k];if(uLampT[k]>=0.)emi+=vec3(1.,.85,.6)*exp(-uLampT[k]*12.)*30.*uFlash+vec3(1.,.4,.1)*.15;}}}
  else if(logs(p)<.006){alb=vec3(.09,.06,.045)*(.6+.8*n2(p.xz*vec2(20.,4.)));float ember=smoothstep(.7,.86,n3(p*14.+vec3(0.,T*.4,0.)))*smoothstep(.5,0.,p.y-.05+length(p.xz)*.18);emi=flameCol(.75,.2)*ember*fl*.9;}
  else{alb=vec3(.55,.45,.40)*(.6+.5*fbm2(p.xz*9.+p.y*4.));alb*=mix(.35,1.,smoothstep(1.25,1.6,length(p.xz)));}
  float shS=dayF()*sunOn>0.?softSh(p+n*.01,s,10.):0.;
  vec3 sunL=sunCol()*max(dot(n,s),0.)*shS*.55*sunOn;
  vec3 amb=skyB(normalize(n+vec3(0.,1.,0.)))*.28+vec3(1.,.55,.25)*.05*(1.-dayF())*(1.-uBlack);
  vec3 ld=Lp-p;float dl=length(ld);ld/=dl;
  vec3 fireL=LC*fl*boomL*7./(1.+dl*dl*1.3/uBoost)*max(dot(n,ld),0.)*(dl<7.?softSh(p+n*.01,ld,dl):1.);
  vec3 lampL=vec3(0.);for(int k=0;k<6;k++){vec3 lv=lampPos(k)-vec3(0.,.15,0.)-p;float ll=dot(lv,lv);lampL+=vec3(1.,.62,.28)*2.4*uLamp[k]/(1.+ll*.5)*max(dot(n,lv*inversesqrt(ll)),0.);}
  lampL*=(.3+.7*(1.-dayF()));
  col=alb*(sunL+amb+fireL+lampL)+emi;
  if(b>=0.&&isFloor){float rr2=length(p.xz);col+=vec3(1.,.6,.25)*exp(-pow((rr2-b*7.5)*2.2,2.))*max(0.,1.-b/2.2)*2.;}
  vec3 hz=skyB(normalize(vec3(rd.x,.002,rd.z)))+vec3(1.,.5,.18)*.42*(1.-dayF()*.8)*(.06+.94*uWin)*(1.-uBlack*.9);col=mix(hz,col,exp(-th*.03));
 }else col=city(rd);
 float tmax=th>0.?th:45.;vec3 acc=vec3(0.);float tr=1.;
 float ext=(b>=0.&&b<3.6)?4.6:(uSimOn>.5?2.1:1.9*uBoost);float t0=max(0.,length(ro.xz)-ext);int ST=int(70.*uQ);float dt=(ext*2.)/float(ST);
 float j=h21(gl_FragCoord.xy+fract(T*3.))*dt;int OC=uQ>1.2?5:4;
 vec2 fwd=vec2(-uRight.y,uRight.x);float thick=(.32+.22*uK)*(.85+.35*uBoost);
 for(int i=0;i<160;i++){if(i>=ST)break;float tc=t0+j+float(i)*dt;if(tc>tmax)break;vec3 p=ro+rd*tc;float h=p.y-.15;
  if(uSimOn>.5){
   vec2 suv=vec2(.5+dot(p.xz,uRight)/3.5,h/7.);
   if(suv.x>0.&&suv.x<1.&&suv.y>0.&&suv.y<1.){vec4 sm=simBL(suv);float dpt=dot(p.xz,fwd);float th2=max(.14,thick*(1.-.12*h));float fall=exp(-dpt*dpt/(th2*th2));
    float nz=.6+.8*n3(p*vec3(2.4,1.5,2.4)-vec3(0.,T*2.,0.));
    float temp=sm.r*fall*nz;float soot=sm.g*fall*nz;
    if(temp>.004){float tq=min(temp,2.2);float em=smoothstep(.08,.55,temp)*min(temp,1.4);acc+=tr*flameCol(tq*.8*(fl/uBoost)/(.6+.6*uK),h)*em*dt*3.4;}
    acc+=tr*vec3(.055,.045,.04)*soot*dt*(.4+fl*.6)*(.3+.7*(1.-uBlack));
    tr*=exp(-(temp*.55+soot*1.9)*dt*1.6);}
  }else{float d=fireD(p,OC);if(d>.001){float temp=d*(1.15-h*.26)*fl;acc+=tr*flameCol(temp,h)*d*dt*2.6;tr*=exp(-d*dt*.9);}}
  float db=uSimOn>.5?0.:ballD(p);
  if(db>.001){float temp=db*1.3*(1.-b/3.8);vec3 bc=mix(bb(temp),flameCol(temp,1.),.35);acc+=tr*bc*db*dt*2.4;tr*=exp(-db*dt*(.7+b*.5));}
  if(tr<.02)break;}
 col=col*tr+acc;
 for(int k=0;k<18;k++){float fk=float(k);float life=fract(T*.35+fk*.137);vec3 sp=vec3(sin(fk*3.1+T*.7)*.5*(1.-life)+sin(life*9.+fk)*.25,.4+life*4.2*(.6+.4*uK)*uBoost,cos(fk*2.3)*.4*(1.-life));
  vec3 w=sp-ro;float tp=dot(w,rd);if(tp<0.||tp>tmax)continue;float dd=length(w-rd*tp);col+=flameCol(1.,.3)*exp(-dd*dd*9000.)*(1.-life)*1.6*fl*(b<0.||uSimOn>.5?1.:smoothstep(4.,5.,b));}
 if(b>=0.&&b<3.){for(int k=0;k<30;k++){float fk=float(k);float an=fk*2.399;float el=.25+.9*h21(vec2(fk,2.));vec3 dir=normalize(vec3(cos(an),el,sin(an)));float spd=4.+5.*h21(vec2(fk,5.));
  vec3 sp=vec3(0.,.6,0.)+dir*spd*b+vec3(0.,-4.9*b*b,0.);if(sp.y<0.)continue;vec3 w=sp-ro;float tp=dot(w,rd);if(tp<0.)continue;float dd=length(w-rd*tp);col+=vec3(1.,.7,.3)*exp(-dd*dd*2500.)*(1.-b/3.)*3.;}}
 for(int k=0;k<6;k++){float lt=uLampT[k];if(lt<0.)continue;vec3 lp=lampPos(k);
  for(int g=0;g<8;g++){float fg=float(g)+float(k)*8.;float an=fg*2.399;vec2 dh=vec2(cos(an),sin(an))*(.6+1.6*h21(vec2(fg,1.)));float vy=.6+1.8*h21(vec2(fg,4.));
   float tt=min(lt,2.5);vec3 sp=lp+vec3(dh.x*tt,vy*tt-4.9*tt*tt,dh.y*tt);sp.y=max(sp.y,.02);
   vec3 w=sp-ro;float tp=dot(w,rd);if(tp<0.||tp>tmax+.2)continue;float dd=length(w-rd*tp);
   float tw=.5+.5*sin(T*20.+fg*3.);float lum=exp(-lt*4.)*4.+(.25+.6*fl/(1.+dot(sp-Lp,sp-Lp)*.08))*tw;
   col+=vec3(.75,.88,1.)*exp(-dd*dd*30000./(1.+tp*.05))*lum;}}
 if(b>=0.)col+=vec3(1.,.72,.45)*exp(-b*7.)*1.6*uFlash;
 for(int k=0;k<6;k++){vec3 w=lampPos(k)-ro;float tp=dot(w,rd);if(tp<0.||tp>tmax+.3)continue;float dd=length(w-rd*tp);col+=vec3(1.,.66,.3)*exp(-dd*dd*60.)*.5*(.35+.65*(1.-dayF()))*uLamp[k];}
 gl_FragColor=vec4(post(col*1.12,q),1.);}
`;

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
 fuego:{src:FIRE,k:'Intensidad',kv:1,cam:[.4,-.16],sun:.08,nm:'Fuego',tech:'Fluido con emisión',
  ficha:['Fuego','La flama es un fluido simulado en tu tarjeta gráfica: una rejilla de 128 × 256 celdas resuelve las ecuaciones de Navier-Stokes en cada cuadro. El aire caliente flota, se enrosca con el confinamiento de vorticidad y se enfría al subir; el humo pesa y se queda atrás.','Cada química pinta la flama como en la prueba de flama del laboratorio: gas azul por los radicales CH y C₂, cobre verde azulado, estroncio rojo carmín. Si sostienes la intensidad alta o la mueves muy rápido, la presión revienta la hoguera: los faroles truenan uno por uno, la ciudad se apaga y solo queda el fuego creciendo en la oscuridad con sus sombras.','Navier-Stokes · advección semi-lagrangiana · flotación · vorticidad · presión por Jacobi · cuerpo negro · sombras suaves']},
 aire:{src:AIR,k:'Viento y nubes',kv:1,cam:[.5,-.1],sun:.22,nm:'Aire',tech:'Nubes volumétricas',
  ficha:['Aire','Volamos sobre un mar de nubes. Cada nube es densidad en 3D y el rayo la recorre sumando luz, que se atenúa con la ley de Beer-Lambert.','Para cada punto, un rayo corto hacia el sol mide cuánta nube hay en medio. La función de fase de Henyey-Greenstein hace que los bordes brillen a contraluz.','Volumen · Beer-Lambert · fase Henyey-Greenstein · autosombreado']}};

const VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(s));return null;}return s;}
const vs=sh(gl.VERTEX_SHADER,VS);
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
function prog(key){const S=SCENES[key];if(S.p!==undefined)return S.p;const fs=sh(gl.FRAGMENT_SHADER,S.src);if(!fs){S.p=null;return null;}
 const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(p));S.p=null;return null;}
 S.p=p;S.u={};['R','T','uSun','uK','uCam','uQ','uPal','uBoom','uFlash','uSim','uSimOn','uSimTx','uRight','uBlack','uWin','uBoost','uLamp','uLampT'].forEach(n=>S.u[n]=gl.getUniformLocation(p,n));return p;}

/* ---------- fuego: simulacion de fluidos (stable fluids 2D en GPU) ---------- */
const SIM=(()=>{try{
 const W=128,H=256;
 const mkT=t=>{const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,t,null);const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
  const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.bindTexture(gl.TEXTURE_2D,null);return ok?{tex,fb}:null;};
 let type=null;const hf=gl.getExtension('OES_texture_half_float');gl.getExtension('EXT_color_buffer_half_float');
 if(hf&&mkT(hf.HALF_FLOAT_OES))type=hf.HALF_FLOAT_OES;
 if(!type){const ff=gl.getExtension('OES_texture_float');gl.getExtension('WEBGL_color_buffer_float');if(ff&&mkT(gl.FLOAT))type=gl.FLOAT;}
 if(!type)return null;
 const mk=()=>mkT(type);const vel=[mk(),mk()],dye=[mk(),mk()],prs=[mk(),mk()],dv=mk(),cu=mk();
 if([...vel,...dye,...prs,dv,cu].some(x=>!x))return null;
 const VSS='attribute vec2 a;varying vec2 vUv;void main(){vUv=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
 const H0='precision highp float;varying vec2 vUv;uniform vec2 tx;';
 const BL='vec4 bl(sampler2D s,vec2 uv){vec2 st=uv/tx-.5;vec2 i=floor(st),f=fract(st);vec2 a=(i+.5)*tx;return mix(mix(texture2D(s,a),texture2D(s,a+vec2(tx.x,0.)),f.x),mix(texture2D(s,a+vec2(0.,tx.y)),texture2D(s,a+tx),f.x),f.y);}';
 const HH='float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}';
 const NB='float L=texture2D(uX,vUv-vec2(tx.x,0.)).x,R=texture2D(uX,vUv+vec2(tx.x,0.)).x,B=texture2D(uX,vUv-vec2(0.,tx.y)).x,T=texture2D(uX,vUv+vec2(0.,tx.y)).x;';
 const SRC={
  advect:H0+'uniform sampler2D uV,uS;uniform float dt,diss;'+BL+'void main(){vec2 v=texture2D(uV,vUv).xy;gl_FragColor=diss*bl(uS,vUv-dt*v*tx);}',
  curl:H0+'uniform sampler2D uV;void main(){float L=texture2D(uV,vUv-vec2(tx.x,0.)).y,R=texture2D(uV,vUv+vec2(tx.x,0.)).y,B=texture2D(uV,vUv-vec2(0.,tx.y)).x,T=texture2D(uV,vUv+vec2(0.,tx.y)).x;gl_FragColor=vec4(.5*(R-L-T+B),0.,0.,1.);}',
  force:H0+'uniform sampler2D uV,uC,uD;uniform float dt,eps,buoy,time,src,boost,kick;'+HH+
   'void main(){float L=abs(texture2D(uC,vUv-vec2(tx.x,0.)).x),R=abs(texture2D(uC,vUv+vec2(tx.x,0.)).x),B=abs(texture2D(uC,vUv-vec2(0.,tx.y)).x),T=abs(texture2D(uC,vUv+vec2(0.,tx.y)).x),C=texture2D(uC,vUv).x;'+
   'vec2 f=.5*vec2(T-B,R-L);f/=length(f)+1e-4;f*=eps*C*vec2(1.,-1.);'+
   'vec2 v=texture2D(uV,vUv).xy;vec4 d=texture2D(uD,vUv);v+=f*dt;v.y+=dt*(d.r*buoy-d.g*4.);'+
   'vec2 m=vec2((vUv.x-.5)*3.5,vUv.y*7.);float w=(.17+.2*src)*boost;'+
   'float g=exp(-pow(m.x/w,2.)-pow((m.y-.16)/.14,2.));'+
   'float wob=sin(time*5.3+m.x*7.)+.6*sin(time*8.7-m.x*13.)+(hh(floor(vec2(m.x*6.,time*9.)))-.5)*1.6;'+
   'v.y+=g*dt*(55.+40.*src)*boost;v.x+=g*dt*wob*34.;'+
   'float aa=3.1*m.x+1.7*time,bb2=2.3*m.y-2.9*time,cc=5.7*m.x-2.3*time+4.1*m.y,ee=9.3*m.x+3.7*time-7.9*m.y;'+
   'float px=3.1*cos(aa)*sin(bb2)+2.85*cos(cc)+.25*9.3*cos(ee),py=2.3*sin(aa)*cos(bb2)+2.05*cos(cc)-.25*7.9*cos(ee);'+
   'v+=dt*d.r*vec2(py,-px)*8.;'+
   'vec2 kd=m-vec2(0.,.8);float kr=length(kd);v+=kick*(kd/(kr+.05))*exp(-kr*kr*1.2)*900.*dt;v.y+=kick*exp(-kr*kr*.8)*700.*dt;'+
   'v*=.9985;if(vUv.y<tx.y*1.5)v.y=max(v.y,0.);gl_FragColor=vec4(v,0.,1.);}',
  dye:H0+'uniform sampler2D uD;uniform float dt,time,src,boost,kick;'+HH+
   'void main(){vec4 d=texture2D(uD,vUv);vec2 m=vec2((vUv.x-.5)*3.5,vUv.y*7.);float w=(.17+.2*src)*boost;'+
   'float fk=.9+.06*sin(time*11.+m.x*4.)+.04*sin(time*23.-m.x*9.);float g=exp(-pow(m.x/w,2.)-pow((m.y-.16)/.12,2.));'+
   'd.r+=g*dt*(6.+5.*src)*sqrt(boost)*fk;d.g+=g*dt*.12*boost+d.r*dt*.03*smoothstep(.8,3.,m.y);'+
   'vec2 kd=m-vec2(0.,.8);float kr=length(kd);d.r+=kick*exp(-kr*kr*.7)*dt*30.;d.g+=kick*exp(-kr*kr*.5)*dt*8.;'+
   'd.r=min(d.r,2.4);d.g=min(d.g,2.5);gl_FragColor=d;}',
  div:H0+'uniform sampler2D uV;void main(){float L=texture2D(uV,vUv-vec2(tx.x,0.)).x,R=texture2D(uV,vUv+vec2(tx.x,0.)).x,B=texture2D(uV,vUv-vec2(0.,tx.y)).y,T=texture2D(uV,vUv+vec2(0.,tx.y)).y;gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}',
  jac:H0+'uniform sampler2D uX,uDv;void main(){'+NB+'gl_FragColor=vec4((L+R+B+T-texture2D(uDv,vUv).x)*.25,0.,0.,1.);}',
  grad:H0+'uniform sampler2D uX,uV;void main(){'+NB+'gl_FragColor=vec4(texture2D(uV,vUv).xy-.5*vec2(R-L,T-B),0.,1.);}',
  scale:H0+'uniform sampler2D uX;uniform float k;void main(){gl_FragColor=texture2D(uX,vUv)*k;}'};
 const svs=sh(gl.VERTEX_SHADER,VSS);const P={};
 for(const k in SRC){const fs=sh(gl.FRAGMENT_SHADER,SRC[k]);if(!fs)return null;const p=gl.createProgram();gl.attachShader(p,svs);gl.attachShader(p,fs);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(p));return null;}P[k]={p,l:{}};}
 const loc=(q,n)=>n in q.l?q.l[n]:(q.l[n]=gl.getUniformLocation(q.p,n));
 function run(name,target,tex,uni){const q=P[name];gl.useProgram(q.p);gl.bindFramebuffer(gl.FRAMEBUFFER,target.fb);gl.viewport(0,0,W,H);let u=0;
  for(const k in tex){gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,tex[k].tex);gl.uniform1i(loc(q,k),u);u++;}
  gl.uniform2f(loc(q,'tx'),1/W,1/H);for(const k in uni)gl.uniform1f(loc(q,k),uni[k]);
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,3);}
 const sw=a=>{const t=a[0];a[0]=a[1];a[1]=t;};
 let kickN=0,time=0;
 function step(o){const dt=1/60;time+=dt;const kick=kickN>0?1:0;if(kickN>0)kickN--;
  run('curl',cu,{uV:vel[0]},{});
  run('force',vel[1],{uV:vel[0],uC:cu,uD:dye[0]},{dt,eps:o.gas?12:38,buoy:o.gas?34:27,time,src:o.src,boost:o.boost,kick});sw(vel);
  run('dye',dye[1],{uD:dye[0]},{dt,time,src:o.src,boost:o.boost,kick});sw(dye);
  run('advect',vel[1],{uV:vel[0],uS:vel[0]},{dt,diss:.996});sw(vel);
  run('advect',dye[1],{uV:vel[0],uS:dye[0]},{dt,diss:o.cool});sw(dye);
  run('div',dv,{uV:vel[0]},{});
  run('scale',prs[1],{uX:prs[0]},{k:.8});sw(prs);
  for(let i=0;i<20;i++){run('jac',prs[1],{uX:prs[0],uDv:dv},{});sw(prs);}
  run('grad',vel[1],{uX:prs[0],uV:vel[0]},{});sw(vel);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
 return{step,kick(){kickN=10;},tex:()=>dye[0].tex,W,H};
}catch(e){console.error(e);return null;}})();

/* ---------- fuego: sonido sintetizado ---------- */
const SND={ac:null,out:null,on:true,
 ctx(){if(!this.on)return null;try{if(!this.ac){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;this.ac=new C();this.out=this.ac.createGain();this.out.gain.value=.45;this.out.connect(this.ac.destination);}if(this.ac.state==='suspended')this.ac.resume();}catch(e){return null;}return this.ac;},
 noise(dur){const ac=this.ac,b=ac.createBuffer(1,Math.max(1,Math.floor(ac.sampleRate*dur)),ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=ac.createBufferSource();s.buffer=b;return s;},
 env(g,t,a,d){g.gain.setValueAtTime(a,t);g.gain.exponentialRampToValueAtTime(.001,t+d);},
 boom(){const ac=this.ctx();if(!ac)return;const t=ac.currentTime;const n=this.noise(2.3),lp=ac.createBiquadFilter(),g=ac.createGain();lp.type='lowpass';lp.frequency.setValueAtTime(2200,t);lp.frequency.exponentialRampToValueAtTime(55,t+1.9);this.env(g,t,1,2.2);n.connect(lp);lp.connect(g);g.connect(this.out);n.start(t);n.stop(t+2.3);
  const o=ac.createOscillator(),og=ac.createGain();o.type='sine';o.frequency.setValueAtTime(75,t);o.frequency.exponentialRampToValueAtTime(26,t+1);this.env(og,t,1.3,1.3);o.connect(og);og.connect(this.out);o.start(t);o.stop(t+1.4);},
 glass(){const ac=this.ac;if(!ac||!this.on)return;const t=ac.currentTime;
  const p=this.noise(.06),bp=ac.createBiquadFilter(),pg=ac.createGain();bp.type='bandpass';bp.frequency.value=900;this.env(pg,t,1.1,.07);p.connect(bp);bp.connect(pg);pg.connect(this.out);p.start(t);
  const n=this.noise(.6),hp=ac.createBiquadFilter(),g=ac.createGain();hp.type='highpass';hp.frequency.value=2600;this.env(g,t+.01,.6,.5);n.connect(hp);hp.connect(g);g.connect(this.out);n.start(t);n.stop(t+.6);
  for(let i=0;i<6;i++){const o=ac.createOscillator(),og=ac.createGain(),s=t+Math.random()*.18;o.type='triangle';o.frequency.value=2300+Math.random()*4500;og.gain.setValueAtTime(0,t);og.gain.setValueAtTime(.14,s);og.gain.exponentialRampToValueAtTime(.001,s+.2+Math.random()*.35);o.connect(og);og.connect(this.out);o.start(t);o.stop(s+.7);}},
 crackle(){const ac=this.ac;if(!ac||!this.on)return;const t=ac.currentTime;const p=this.noise(.03),bp=ac.createBiquadFilter(),g=ac.createGain();bp.type='bandpass';bp.frequency.value=1100+Math.random()*2800;bp.Q.value=2.5;this.env(g,t,.06+Math.random()*.22,.04);p.connect(bp);bp.connect(g);g.connect(this.out);p.start(t);}};

/* ---------- fuego: explosion, faroles que revientan y apagon ---------- */
const smf=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const FX={boomT:-1,restT:-1,breakAt:[0,0,0,0,0,0],fired:[0,0,0,0,0,0],lamp:new Float32Array(6).fill(1),lampT:new Float32Array(6).fill(-1),win:1,black:0,boost:1,
 start(){this.boomT=0;this.restT=-1;const ord=[0,1,2,3,4,5].sort(()=>Math.random()-.5);ord.forEach((k,i)=>{this.breakAt[k]=.25+i*.21+Math.random()*.06;});this.fired=[0,0,0,0,0,0];SND.boom();if(SIM)SIM.kick();},
 restore(){if(this.boomT>=0&&this.restT<0)this.restT=0;},
 reset(){this.boomT=-1;this.restT=-1;this.lamp.fill(1);this.lampT.fill(-1);this.win=1;this.black=0;this.boost=1;},
 update(dt){if(this.boomT<0){this.reset();return;}
  this.boomT+=dt;if(this.restT>=0)this.restT+=dt;else if(this.boomT>13)this.restT=0;
  const b=this.boomT,r=this.restT;
  for(let k=0;k<6;k++){const ba=this.breakAt[k];
   if(r>=0){const v=smf(0,1.1,r-k*.2);this.lamp[k]=v;this.lampT[k]=v>.5?-1:(b>ba?b-ba:-1);}
   else if(b<ba){this.lamp[k]=(!RM&&b>ba-.45)?(Math.random()<.5?1:.12):1;this.lampT[k]=-1;}
   else{this.lamp[k]=0;this.lampT[k]=b-ba;if(!this.fired[k]){this.fired[k]=1;SND.glass();}}}
  this.win=r>=0?smf(0,2,r):1-smf(.3,1.8,b);
  this.black=smf(.8,2,b)*(r>=0?1-smf(0,2,r):1);
  this.boost=1+.9*this.black;
  if(this.black>.4&&Math.random()<dt*9)SND.crackle();
  if(r>2.6){this.reset();st.heat=0;}}};

const st={scene:'agua',q:'auto',scale:.6,yaw:.6,pitch:-.06,sun:.32,k:1,t:0,last:0,ema:16,fr:0,fpsT:0,fpsN:0,fps:0,pal:0,heat:0,boomT:-1,clock:0,kPrev:1,kT:0,booms:0};
const QM={papa:{s:.33,u:.55},auto:{s:null,u:1},max:{s:null,u:1.6}};
function setScene(key){st.scene=key;const S=SCENES[key];st.yaw=S.cam[0];st.pitch=S.cam[1];st.sun=S.sun;st.k=S.kv;
 $('#rxSun').value=st.sun;$('#rxK').value=st.k;$('#rxKL').firstChild.textContent=S.k+' ';[$('#rxSun'),$('#rxK')].forEach(r=>r.dispatchEvent(new Event('input',{bubbles:true})));
 $$('#rxTabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.s===key)));
 const f=S.ficha;$('#rxName').textContent=S.nm;$('#rxTech').textContent=S.tech;
 $('#rxFicha').innerHTML=`<div class="folio"><span>Cómo se modela · ${f[0]}</span><span>Render en tiempo real</span></div><p class="big">${f[1]}</p><p>${f[2]}</p><p class="mono" style="color:var(--art2);letter-spacing:.08em">${f[3]}</p>`;
 if(key==='tierra'&&!$('#rxFicha').dataset.told){$('#rxFicha').dataset.told='1';}
 const fx=$('#rxFire');if(fx)fx.hidden=key!=='fuego';st.heat=0;st.boomT=-1;FX.reset();
 if(!prog(key))$('#rxFail').hidden=false;T.dirty=true;}
$$('#rxTabs button').forEach(b=>b.addEventListener('click',()=>setScene(b.dataset.s)));
$('#rxSun').addEventListener('input',e=>{st.sun=+e.target.value;const h=Math.round(6+(st.sun+.15)/1.45*7.5);$('#rxSunO').textContent=st.sun<0?'noche':st.sun<.2?'atardecer':st.sun<.6?'tarde':'mediodía';T.dirty=true;});
$('#rxK').addEventListener('input',e=>{const nk=+e.target.value,now=performance.now(),dk=Math.abs(nk-st.k),dtt=Math.max(.016,(now-(st.kT||0))/1000);st.kT=now;if(e.isTrusted)SND.ctx();if(st.scene==='fuego'&&FX.boomT<0&&dk/dtt>1.2)st.heat=Math.min(1,st.heat+dk*.6);st.k=nk;$('#rxKO').textContent=st.k.toFixed(2)+'×';T.dirty=true;});
const PAL=[['Leña','Carbono incandescente: brilla como cuerpo negro entre 1,000 y 1,200 °C.'],['Gas','Combustión completa del metano: el azul viene de los radicales CH y C₂ excitados.'],['Cobre','Las sales de cobre tiñen la flama de verde azulado.'],['Estroncio','Las sales de estroncio dan el rojo carmín de los fuegos artificiales.'],['Arcoíris','Modo fiesta. No existe en la química, pero se ve bonito.']];
$$('#rxPal button').forEach(b=>b.addEventListener('click',()=>{st.pal=+b.dataset.p;$$('#rxPal button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#rxPalN').textContent=PAL[st.pal][1];SND.ctx();T.dirty=true;}));
$('#rxSnd')&&$('#rxSnd').addEventListener('click',e=>{SND.on=!SND.on;e.currentTarget.setAttribute('aria-pressed',String(SND.on));e.currentTarget.textContent=SND.on?'Sonido: sí':'Sonido: no';if(SND.on)SND.ctx();});
$('#rxRestore')&&$('#rxRestore').addEventListener('click',()=>{FX.restore();T.dirty=true;});
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
 const rdt=Math.min(dtm,50)/1000;
 if(st.scene==='fuego'){const rt=Math.min(dtm,250)/1000;
  if(FX.boomT<0){st.heat=Math.min(1,Math.max(0,st.heat+(st.k>1.35?(st.k-1.35)*.5:-.06)*rdt));if(st.heat>=1){FX.start();st.booms++;const bm=$('#rxBoom');if(bm){bm.hidden=false;$('#rxBoomN').textContent=st.booms>1?`Explosión número ${st.booms}. Ya sabes cómo se pone.`:'Los faroles no aguantaron. Apagón.';clearTimeout(bm.__t);bm.__t=setTimeout(()=>bm.hidden=true,2600);}}}
  FX.update(rt);st.boomT=FX.boomT;const hm=$('#rxHeat');if(hm)hm.style.width=(FX.boomT>=0?100:st.heat*100).toFixed(1)+'%';
  const rb=$('#rxRestore');if(rb)rb.hidden=!(FX.boomT>1.5&&FX.restT<0);
  if(SIM&&!document.hidden){const n=Math.min(6,Math.max(1,Math.round(rt*60)));for(let i=0;i<n;i++)SIM.step({src:st.k,boost:FX.boost,gas:st.pal===1,cool:st.pal===1?.972:.979});}
  if(RM&&(FX.boomT>=0||st.heat>0))T.dirty=true;}
 const Q=QM[st.q];let sc=Q.s||st.scale;
 if(st.q==='auto'&&++st.fr%8===0){if(st.ema>30&&st.scale>.28)st.scale*=.86;else if(st.ema<19&&st.scale<Math.min(devicePixelRatio||1,1.25))st.scale*=1.08;}
 const W=Math.max(2,Math.round(cv.clientWidth*sc)),H=Math.max(2,Math.round(cv.clientHeight*sc));if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
 const S=SCENES[st.scene],p=prog(st.scene);if(!p)return;
 gl.viewport(0,0,W,H);gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 gl.uniform2f(S.u.R,W,H);gl.uniform1f(S.u.T,st.t+(st.scene==='tierra'?0:4));gl.uniform1f(S.u.uSun,st.sun);gl.uniform1f(S.u.uK,st.k);gl.uniform2f(S.u.uCam,st.yaw,st.pitch);gl.uniform1f(S.u.uQ,Q.u);gl.uniform1f(S.u.uPal,st.pal);gl.uniform1f(S.u.uBoom,st.scene==='fuego'&&FX.boomT>=0&&FX.boomT<5.4?FX.boomT:-1);if(st.scene==='fuego'){if(SIM){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,SIM.tex());gl.uniform1i(S.u.uSim,0);}gl.uniform1f(S.u.uSimOn,SIM?1:0);gl.uniform2f(S.u.uSimTx,1/128,1/256);gl.uniform2f(S.u.uRight,-Math.cos(st.yaw),Math.sin(st.yaw));gl.uniform1f(S.u.uBlack,FX.black);gl.uniform1f(S.u.uWin,FX.win);gl.uniform1f(S.u.uBoost,FX.boost);gl.uniform1fv(S.u.uLamp,FX.lamp);gl.uniform1fv(S.u.uLampT,FX.lampT);}gl.uniform1f(S.u.uFlash,RM?0:1);
 gl.drawArrays(gl.TRIANGLES,0,3);
 $('#rxHud').textContent=`${st.fps||'—'} FPS · ${W}×${H} · escala ${sc.toFixed(2)} · ${st.scene==='fuego'?(SIM?'fluido 128×256 · Navier-Stokes':'flama procedural (sin texturas flotantes)'):S.tech.toLowerCase()}`;}
setScene('agua');
requestAnimationFrame(frame);
})();
