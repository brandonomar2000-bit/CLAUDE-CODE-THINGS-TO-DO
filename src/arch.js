/* ================= ARQUITECTURA VIVA 3D (three.js r147) ================= */
(function(){
'use strict';
const sec=document.getElementById('arquitectura');if(!sec)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const CDN='https://cdn.jsdelivr.net/npm/three@0.147.0/';
const LIBS=['build/three.min.js','examples/js/controls/OrbitControls.js','examples/js/loaders/GLTFLoader.js','examples/js/environments/RoomEnvironment.js','examples/js/objects/Sky.js','examples/js/objects/Water.js'];
const MODEL='assets/car.glb';
const cv=$('#arCv'),load=$('#arLoad'),bar=$('#arBar'),msg=$('#arMsg');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function status(t,p){msg.textContent=t;if(p!=null)bar.style.width=Math.round(clamp(p,0,1)*100)+'%';}
function fail(t){status(t);load.classList.add('err');load.hidden=false;}
function script(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.async=false;s.crossOrigin='anonymous';s.onload=res;s.onerror=()=>rej(new Error(src));document.head.appendChild(s);});}
let booted=false;
new IntersectionObserver((es,o)=>{if(!booted&&es.some(e=>e.isIntersecting)){booted=true;o.disconnect();boot();}},{rootMargin:'700px 0px'}).observe(sec);
async function boot(){
 try{for(let i=0;i<LIBS.length;i++){status('Cargando el motor 3D: '+LIBS[i].split('/').pop(),.03+i*.04);if(i===0&&window.THREE)continue;await script(CDN+LIBS[i]);}}
 catch(e){fail('No se pudo cargar three.js desde jsDelivr. Revisa la conexión y recarga la página.');return;}
 status('Tallando mármol, ónix y nogal…',.3);await new Promise(r=>setTimeout(r,40));
 try{init();}catch(e){console.error(e);fail('El estudio 3D no pudo iniciar en este navegador: '+e.message);}
}

/* ---------- ruido y texturas procedurales ---------- */
const hs=(x,y)=>{const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s);};
function vn(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);const a=hs(ix,iy),b=hs(ix+1,iy),c=hs(ix,iy+1),d=hs(ix+1,iy+1);return a+(b-a)*ux+(c-a)*uy+(a-b-c+d)*ux*uy;}
function fbm(x,y,o){let s=0,a=.5;for(let i=0;i<(o||4);i++){s+=a*vn(x,y);x=x*2.03+1.7;y=y*2.03+9.2;a*=.5;}return s;}
const hex=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255];};
const mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];

function init(){
const T3=window.THREE;
const renderer=new T3.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
const mobile=Math.min(innerWidth,innerHeight)<700;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.25:1.5));
renderer.outputEncoding=T3.sRGBEncoding;renderer.toneMapping=T3.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T3.PCFSoftShadowMap;renderer.localClippingEnabled=true;
const ANISO=renderer.capabilities.getMaxAnisotropy();
function ctex(w,h,fn,rep,srgb=true){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const im=g.createImageData(w,h),d=im.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const col=fn(x/w,y/h);const i=(y*w+x)*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255;}
 g.putImageData(im,0,0);const t=new T3.CanvasTexture(c);if(srgb)t.encoding=T3.sRGBEncoding;t.anisotropy=ANISO;t.wrapS=t.wrapT=T3.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t;}
const ONYX=['#F1E8D8','#C9A27A','#8A6648','#2A221C','#B8B2A9','#DCC7A6','#5E4A3A','#F6F0E4','#9C7B5A','#3B3029'].map(hex);
const tOnyx=ctex(1024,512,(u,v)=>{const w=fbm(u*1.4,v*1.8,5);const b=u*15+w*6.5+fbm(u*5,v*7,3)*1.1+Math.sin(v*3.2+w*4)*.35;const id=Math.floor(b),t=b-id;
 const A=ONYX[((id%10)+10)%10],B=ONYX[(((id+1)%10)+10)%10];let c=mixc(A,B,sm(.7,1,t));const line=Math.abs(t-.33-.08*Math.sin(v*40+u*9))<.012?.55:1;const fine=Math.abs(fbm(u*40+w*3,v*6,3)-.5)<.012?.82:1;const gr=.9+.16*vn(u*300,v*30);return c.map(x=>clamp(x*line*fine*gr,0,255));});
const tFloor=ctex(768,768,(u,v)=>{const tx=Math.floor(u*2),ty=Math.floor(v*2),lu=u*2-tx,lv=v*2-ty,fl=(tx+ty)%2?1:-1;
 const vein=Math.pow(1-Math.abs(Math.sin(((lu*fl+lv)*5+fbm(u*6,v*6,4)*3)*Math.PI)),16);let c=[222,212,196].map(x=>x*(.92+.1*fbm(u*14,v*14,3)));c=mixc(c,[160,152,142],vein*.55);
 if(lu<.005||lv<.005||lu>.995||lv>.995)c=[196,188,178];return c;},[12,10]);
const tWal=ctex(512,512,(u,v)=>{const g=fbm(u*28+fbm(u*4,v*3,3)*2,v*1.6,4);const r=Math.sin((u*90+g*7)*Math.PI);const k=.72+.34*g+.07*r;return[98*k,58*k,34*k];},[2,1]);
const tTeak=ctex(512,512,(u,v)=>{const pl=Math.floor(u*8),g=fbm(u*30+pl,v*2,4);const k=.78+.3*g;const seam=(u*8-pl)<.04?.45:1;return[150*k*seam,98*k*seam,58*k*seam];},[1,1]);
const tTrav=ctex(512,512,(u,v)=>{const b=fbm(u*1.6,v*14,4);let c=mixc([228,214,190],[198,178,148],sm(.3,.75,b));if(vn(u*90,v*260)>.86)c=c.map(x=>x*.7);const tl=(u*4%1<.008||v*4%1<.008)?.86:1;return c.map(x=>x*tl);},[10,8]);
const tGrass=ctex(256,256,(u,v)=>{const k=.65+.55*fbm(u*40,v*40,4);return[54*k,104*k,38*k];},[30,30]);
const tWaterN=(()=>{const N=256,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),im=g.createImageData(N,N),d=im.data;const W=[[1,2,.9,.3],[3,-1,.5,1.7],[-2,5,.35,2.3],[6,3,.22,.4],[-7,-4,.15,4.1],[9,-8,.1,1.1],[13,5,.07,2.9]];
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let dx=0,dy=0;const u=x/N,v=y/N;for(const[kx,ky,a,ph]of W){const s=Math.cos(2*Math.PI*(kx*u+ky*v)+ph)*a*2*Math.PI;dx+=s*kx;dy+=s*ky;}
  let nx=-dx*.012,ny=-dy*.012,nz=1;const l=Math.hypot(nx,ny,nz);const i=(y*N+x)*4;d[i]=(nx/l*.5+.5)*255;d[i+1]=(ny/l*.5+.5)*255;d[i+2]=(nz/l*.5+.5)*255;d[i+3]=255;}
 g.putImageData(im,0,0);const t=new T3.CanvasTexture(c);t.wrapS=t.wrapT=T3.RepeatWrapping;return t;})();
const tShadow=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const gr=g.createRadialGradient(128,128,10,128,128,128);gr.addColorStop(0,'rgba(0,0,0,.85)');gr.addColorStop(.55,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);return new T3.CanvasTexture(c);})();

/* ---------- materiales ---------- */
const M={
 onyx:new T3.MeshPhysicalMaterial({map:tOnyx,roughness:.16,clearcoat:.7,clearcoatRoughness:.12}),
 floor:new T3.MeshPhysicalMaterial({map:tFloor,roughness:.14,clearcoat:.5,clearcoatRoughness:.1}),
 walnut:new T3.MeshStandardMaterial({map:tWal,roughness:.42}),
 brass:new T3.MeshStandardMaterial({color:0xC9A04A,metalness:1,roughness:.26}),
 plaster:new T3.MeshStandardMaterial({color:0xD9D3CA,roughness:.92}),
 white:new T3.MeshStandardMaterial({color:0xF3F0EA,roughness:.55}),
 steel:new T3.MeshStandardMaterial({color:0x1b1d22,metalness:.85,roughness:.35}),
 glass:new T3.MeshPhysicalMaterial({color:0xa8c8d6,metalness:0,roughness:.03,transparent:true,opacity:.26,envMapIntensity:1.8,depthWrite:false}),
 dglass:new T3.MeshPhysicalMaterial({color:0x0e151b,metalness:.3,roughness:.06,clearcoat:1,envMapIntensity:1.6}),
 nero:new T3.MeshPhysicalMaterial({color:0x0b0b0e,roughness:.07,clearcoat:1,clearcoatRoughness:.04}),
 fabric:new T3.MeshStandardMaterial({color:0x5c5853,roughness:.97}),
 chain:new T3.MeshStandardMaterial({color:0xC99A6C,metalness:1,roughness:.32}),
 leaf:new T3.MeshStandardMaterial({color:0x3f5a2a,roughness:.85,side:T3.DoubleSide}),
 palm:new T3.MeshStandardMaterial({color:0x3f7a2c,roughness:.75,side:T3.DoubleSide}),
 bark:new T3.MeshStandardMaterial({color:0x7a6450,roughness:.95}),
 trav:new T3.MeshStandardMaterial({map:tTrav,roughness:.6}),
 grass:new T3.MeshStandardMaterial({map:tGrass,roughness:.95}),
 teak:new T3.MeshStandardMaterial({map:tTeak,roughness:.55}),
 hull:new T3.MeshPhysicalMaterial({color:0xF7F7F5,roughness:.18,clearcoat:1,clearcoatRoughness:.05}),
 concrete:new T3.MeshStandardMaterial({color:0xBEB8AE,roughness:.88}),
 pool:new T3.MeshPhysicalMaterial({color:0x29b6d8,roughness:.04,metalness:0,clearcoat:1,transparent:true,opacity:.9,emissive:0x0a7fa8,emissiveIntensity:0}),
 warm:new T3.MeshStandardMaterial({color:0x2a2018,emissive:0xFFB46B,emissiveIntensity:0}),
 lamp:new T3.MeshStandardMaterial({color:0xffffff,emissive:0xFFF1DC,emissiveIntensity:1.2})};
const archMats=[M.onyx,M.walnut,M.brass,M.plaster,M.white,M.steel,M.glass,M.dglass,M.chain,M.concrete,M.warm,M.lamp];

const add=(parent,geo,mat,x,y,z,o={})=>{const m=new T3.Mesh(geo,mat);m.position.set(x,y,z);if(o.ry)m.rotation.y=o.ry;if(o.rx)m.rotation.x=o.rx;if(o.rz)m.rotation.z=o.rz;m.castShadow=o.cast!==false;m.receiveShadow=o.recv!==false;parent.add(m);return m;};
const box=(p,w,h,d,mat,x,y,z,o)=>add(p,new T3.BoxGeometry(w,h,d),mat,x,y,z,o);
function makeSky(){const s=new T3.Sky();s.scale.setScalar(4500);const u=s.material.uniforms;u.turbidity.value=7;u.rayleigh.value=2.2;u.mieCoefficient.value=.005;u.mieDirectionalG.value=.8;return s;}

/* ---------- escena 1: showroom ---------- */
const A=new T3.Scene();A.background=new T3.Color(0x0a0a0c);
const pmrem=new T3.PMREMGenerator(renderer);
const roomEnv=pmrem.fromScene(new T3.RoomEnvironment(),.04).texture;A.environment=roomEnv;
const skyA=makeSky();A.add(skyA);
{const g=new T3.Group();A.add(g);
 add(g,new T3.PlaneGeometry(26,18),M.floor,0,0,0,{rx:-Math.PI/2,cast:false});
 box(g,20,4.9,.25,M.onyx,0,1.2+2.45,-7,{cast:true});
 box(g,20,1.2,.35,M.walnut,0,.6,-6.95);
 for(let i=0;i<9;i++){const x=-8+i*2;const fr=new T3.Group();fr.position.set(x,.6,-6.76);g.add(fr);
  box(fr,1.7,.04,.03,M.brass,0,.42,0,{cast:false});box(fr,1.7,.04,.03,M.brass,0,-.42,0,{cast:false});box(fr,.04,.88,.03,M.brass,-.83,0,0,{cast:false});box(fr,.04,.88,.03,M.brass,.83,0,0,{cast:false});}
 box(g,20,.05,.06,M.brass,0,1.22,-6.8,{cast:false});
 box(g,.3,6.2,14,M.plaster,-10,3.1,0);box(g,.3,6.2,14,M.plaster,10,3.1,0);
 for(let i=0;i<14;i++)box(g,.08,4.6,.18,M.walnut,9.8,2.3,-5.5+i*.85);
 const cy=6.2;box(g,8,.3,14,M.plaster,-6,cy,0);box(g,4,.3,14,M.plaster,8,cy,0);box(g,8,.3,4,M.plaster,2,cy,5);box(g,8,.3,2,M.plaster,2,cy,-6);
 add(g,new T3.PlaneGeometry(8,8),M.glass,2,cy+.6,-1,{rx:-Math.PI/2,cast:false,recv:false});
 for(let i=0;i<6;i++)box(g,8,.22,.16,M.steel,2,cy+.45,-4.6+i*1.45);
 box(g,.18,.3,8,M.steel,-1.9,cy+.45,-1);box(g,.18,.3,8,M.steel,5.9,cy+.45,-1);
 [[-6,-3],[-6,3],[8,-3],[8,3],[-3,5.5],[6,5.5]].forEach(([x,z])=>add(g,new T3.CylinderGeometry(.13,.13,.03,20),M.lamp,x,cy-.16,z,{cast:false}));
 const chand=new T3.Group();chand.position.set(-5,0,-2.2);g.add(chand);
 add(chand,new T3.CylinderGeometry(1.95,1.95,.12,48),M.steel,0,cy-.2,0,{cast:false});
 const rings=[[1.75,2.0,420],[1.4,1.6,330],[1.05,1.3,240],[.7,1.05,160]];let n=0;rings.forEach(r=>n+=r[2]);
 const im=new T3.InstancedMesh(new T3.CylinderGeometry(.012,.012,1,5),M.chain,n);const dm=new T3.Object3D();let k=0;
 rings.forEach(([rad,len,cnt],ri)=>{for(let i=0;i<cnt;i++){const a=i/cnt*Math.PI*2;const l=len*(.92+.16*Math.sin(a*6+ri))*(1+.08*Math.sin(a*14));dm.position.set(Math.cos(a)*rad,cy-.26-l/2,Math.sin(a)*rad);dm.scale.set(1,l,1);dm.updateMatrix();im.setMatrixAt(k++,dm.matrix);}});
 chand.add(im);const cl=new T3.PointLight(0xFFD3A0,.9,9,2);cl.position.set(0,cy-1.2,0);chand.add(cl);
 add(g,new T3.CylinderGeometry(2.6,2.6,.04,64),M.nero,-5,.02,-2.2,{cast:false});
 for(let i=0;i<8;i++){const geo=new T3.CylinderGeometry(1.55,1.55,.48,24,1,false,i*Math.PI/4+.04,Math.PI/4-.08);const s=add(g,geo,M.fabric,-5,.28,-2.2);s.scale.set(1,1,1);}
 add(g,new T3.CylinderGeometry(.55,.62,.5,32),M.fabric,-5,.29,-2.2);
 add(g,new T3.CylinderGeometry(.05,.07,1.6,8),M.bark,-5,1.3,-2.2);
 for(let i=0;i<9;i++){const a=i*2.4,r=.25+.18*(i%3);add(g,new T3.IcosahedronGeometry(.32+.06*(i%2),1),M.leaf,-5+Math.cos(a)*r,1.9+(i%3)*.22,-2.2+Math.sin(a)*r);}
}
const turn=new T3.Group();turn.position.set(2.6,0,.6);A.add(turn);
add(turn,new T3.CylinderGeometry(3.3,3.3,.08,72),M.nero,0,.04,0,{cast:false});
add(turn,new T3.TorusGeometry(3.3,.02,8,96),M.brass,0,.08,0,{rx:Math.PI/2,cast:false});
const sunA=new T3.DirectionalLight(0xffffff,2);sunA.castShadow=true;sunA.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(sunA.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:60});sunA.shadow.bias=-.0004;sunA.shadow.normalBias=.03;A.add(sunA,sunA.target);sunA.target.position.set(2,0,0);
const hemiA=new T3.HemisphereLight(0xfff4e6,0x2a221c,.35);A.add(hemiA);
const keyA=new T3.SpotLight(0xffffff,1.4,30,.55,.7,1);keyA.position.set(5,5.6,6);keyA.target.position.set(2.6,.5,.6);keyA.castShadow=true;keyA.shadow.mapSize.set(1024,1024);A.add(keyA,keyA.target);
const fillA=new T3.SpotLight(0xffe0bf,.8,24,.7,.8,1);fillA.position.set(-2,5.6,4);fillA.target.position.set(2.6,.4,0);A.add(fillA,fillA.target);

/* ---------- escena 2: villa con yate ---------- */
const B=new T3.Scene();
const skyB=makeSky();B.add(skyB);
const water=new T3.Water(new T3.PlaneGeometry(3000,3000),{textureWidth:mobile?256:512,textureHeight:mobile?256:512,waterNormals:tWaterN,sunDirection:new T3.Vector3(),sunColor:0xffffff,waterColor:0x0a3646,distortionScale:2.6,fog:false});
water.rotation.x=-Math.PI/2;B.add(water);
const villa=new T3.Group();B.add(villa);
{const g=villa;
 box(g,46,1.2,26,M.trav,0,.6,-6,{cast:false});
 add(g,new T3.PlaneGeometry(10,20),M.grass,17,1.205,-8,{rx:-Math.PI/2,cast:false});
 box(g,14,.02,5.2,M.pool,-4,1.19,1.6,{cast:false});
 [[-4,1.26,-1.1,14.6,.12,.4],[-4,1.26,4.3,14.6,.12,.4],[-11.2,1.26,1.6,.4,.12,5.6],[3.2,1.26,1.6,.4,.12,5.6]].forEach(([x,y,z,w,h,d])=>box(g,w,h,d,M.trav,x,y,z));
 box(g,14,3.2,.06,M.glass,-5,2.8,-5.9,{cast:false,recv:false});box(g,.06,3.2,8,M.glass,-12,2.8,-9.9,{cast:false,recv:false});
 box(g,14,.25,8.2,M.white,-5,1.32,-9.9);box(g,13.8,3,.2,M.onyx,-5,2.8,-13.85);
 box(g,13.6,.08,7.8,M.warm,-5,4.3,-9.9,{cast:false});
 for(let i=0;i<4;i++)box(g,.14,3.2,.14,M.steel,-11.8+i*4.5,2.8,-6);
 box(g,4,.8,1.4,M.fabric,-7,1.8,-11.5);box(g,2.6,.5,1.4,M.walnut,-2.5,1.7,-11.5);
 box(g,18,3.2,9.2,M.white,-4,6,-8.6);box(g,17.6,1.5,.08,M.dglass,-4,6.1,-3.98,{cast:false});
 for(let i=0;i<34;i++)box(g,.1,3.1,.16,M.walnut,-12.6+i*.52,6,-3.9);
 box(g,20,.32,11.5,M.white,-4,7.76,-8.4);
 box(g,7.5,3.2,8,M.concrete,8,2.8,-10);box(g,7.1,2.8,.05,M.steel,8,2.6,-5.98,{cast:false});
 box(g,6.4,.05,3,M.concrete,8,1.23,-4,{cast:false});
 const dock=new T3.Group();g.add(dock);dock.position.set(15.5,0,0);
 add(dock,new T3.BoxGeometry(3.4,.18,18),M.teak,0,.62,16);
 for(let i=0;i<8;i++){add(dock,new T3.CylinderGeometry(.14,.14,2,10),M.bark,-1.6,0,8+i*2.4);add(dock,new T3.CylinderGeometry(.14,.14,2,10),M.bark,1.6,0,8+i*2.4);}
 for(let i=0;i<6;i++)box(dock,3.4,.16,.5,M.trav,0,1.08-i*.09,6.6+i*.5);
 const lights=[];for(let i=0;i<3;i++){const L=new T3.PointLight(0xFFB46B,0,14,2);L.position.set(-10+i*5,3.6,-9.5);g.add(L);lights.push(L);}
 const poolL=new T3.PointLight(0x2bd6ff,0,12,2);poolL.position.set(-4,1.1,1.6);g.add(poolL);lights.push(poolL);
 g.userData.lights=lights;}
function palm(x,z,s){const g=new T3.Group();g.position.set(x,1.2,z);const lean=new T3.Vector3((Math.random()-.5)*1.4,0,(Math.random()-.5)*1.4);
 const curve=new T3.CatmullRomCurve3([new T3.Vector3(0,0,0),new T3.Vector3(lean.x*.3,2.5*s,lean.z*.3),new T3.Vector3(lean.x,5.5*s,lean.z),new T3.Vector3(lean.x*1.2,7.5*s,lean.z*1.2)]);
 add(g,new T3.TubeGeometry(curve,24,.2*s,8),M.bark,0,0,0);const top=curve.getPoint(1);
 for(let i=0;i<10;i++){const geo=new T3.PlaneGeometry(.7*s,3.4*s,1,8);const p=geo.attributes.position;for(let j=0;j<p.count;j++){const y=p.getY(j)+1.7*s;p.setZ(j,-y*y*.12/s);p.setX(j,p.getX(j)*(1-Math.abs(y-1.7*s)/(2.4*s)));}geo.translate(0,1.7*s,0);geo.computeVertexNormals();
  const m=new T3.Mesh(geo,M.palm);m.position.copy(top);m.rotation.set(-1.1,i/10*Math.PI*2,0,'YXZ');m.castShadow=true;g.add(m);}
 B.add(g);}
palm(-19,2.5,1);palm(12,3.4,.9);palm(19,-4,1.1);palm(-21,-11,.95);palm(21,-14,1);
function rrect(w,h,r){const s=new T3.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
const yacht=new T3.Group();B.add(yacht);
{const L=20,Bm=5.2;const hs2=f=>{const s=new T3.Shape();const b=Bm/2*f,l=L*f;s.moveTo(0,-b*.92);s.lineTo(l*.6,-b);s.quadraticCurveTo(l*.93,-b*.8,l,0);s.quadraticCurveTo(l*.93,b*.8,l*.6,b);s.lineTo(0,b*.92);s.lineTo(0,-b*.92);return s;};
 const hg=new T3.ExtrudeGeometry(hs2(1),{depth:2.4,bevelEnabled:true,bevelThickness:.22,bevelSize:.22,bevelSegments:3,curveSegments:28});hg.rotateX(-Math.PI/2);
 const P=hg.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i),x=P.getX(i);const f=clamp(y/1.4,0,1);P.setZ(i,P.getZ(i)*(.42+.58*Math.sqrt(f)));if(x>L*.7)P.setY(i,y+(x-L*.7)*.06*(1-f));}hg.computeVertexNormals();
 const hull=new T3.Mesh(hg,M.hull);hull.castShadow=hull.receiveShadow=true;hull.position.y=-.9;yacht.add(hull);
 const bg=new T3.ExtrudeGeometry(hs2(1),{depth:.42,bevelEnabled:true,bevelThickness:.24,bevelSize:.24,bevelSegments:2,curveSegments:28});bg.rotateX(-Math.PI/2);const band=new T3.Mesh(bg,M.dglass);band.position.y=.35;band.scale.set(.985,1,1.01);yacht.add(band);
 const dg=new T3.ExtrudeGeometry(hs2(.97),{depth:.06,bevelEnabled:false,curveSegments:28});dg.rotateX(-Math.PI/2);const deck=new T3.Mesh(dg,M.teak);deck.position.set(.3,1.72,0);deck.receiveShadow=true;yacht.add(deck);
 const lvl=(w,d,h,x,y,mat)=>{const g=new T3.ExtrudeGeometry(rrect(w,d,.9),{depth:h,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:2});g.rotateX(-Math.PI/2);const m=new T3.Mesh(g,mat);m.position.set(x,y,0);m.castShadow=m.receiveShadow=true;yacht.add(m);return m;};
 lvl(11,4.3,1.5,8,1.78,M.hull);lvl(11.06,4.36,.62,8,2.25,M.dglass);lvl(7.4,3.8,1.25,7.6,3.36,M.hull);lvl(7.46,3.86,.55,7.6,3.72,M.dglass);
 lvl(6.4,3.9,.12,7.2,5.3,M.hull);[[4.6,1.6],[4.6,-1.6],[9.6,1.6],[9.6,-1.6]].forEach(([x,z])=>add(yacht,new T3.CylinderGeometry(.05,.05,.7,8),M.steel,x,4.95,z));
 const arch=add(yacht,new T3.TorusGeometry(1.7,.12,10,32,Math.PI),M.hull,8.2,4.7,0,{ry:Math.PI/2});
 add(yacht,new T3.CylinderGeometry(.18,.18,.2,16),M.steel,8.2,6.5,0);
 box(yacht,2,.12,4.4,M.teak,-.9,.55,0);
 yacht.position.set(23,0,15);yacht.rotation.y=Math.PI/2+.06;}
const stars=(()=>{const N=1400,g=new T3.BufferGeometry(),p=new Float32Array(N*3);for(let i=0;i<N;i++){const u=Math.random(),v=Math.random()*.5+.5;const th=u*Math.PI*2,ph=Math.acos(v*2-1);p[i*3]=Math.sin(ph)*Math.cos(th)*1600;p[i*3+1]=Math.abs(Math.cos(ph))*1600+40;p[i*3+2]=Math.sin(ph)*Math.sin(th)*1600;}
 g.setAttribute('position',new T3.BufferAttribute(p,3));const m=new T3.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false});const s=new T3.Points(g,m);B.add(s);return s;})();
const sunB=new T3.DirectionalLight(0xffffff,3);sunB.castShadow=true;sunB.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(sunB.shadow.camera,{left:-34,right:34,top:34,bottom:-34,near:1,far:200});sunB.shadow.bias=-.0005;sunB.shadow.normalBias=.04;B.add(sunB,sunB.target);sunB.target.position.set(0,0,-4);
const hemiB=new T3.HemisphereLight(0xcfe3ff,0x5a4a3a,.5);B.add(hemiB);
const moon=new T3.DirectionalLight(0x8aa8ff,0);moon.position.set(-40,60,30);B.add(moon);
const carSlotB=new T3.Group();carSlotB.position.set(8,1.25,-3.4);carSlotB.rotation.y=.35;B.add(carSlotB);

/* ---------- camara y controles ---------- */
const camera=new T3.PerspectiveCamera(38,1,.05,6000);
const controls=new T3.OrbitControls(camera,cv);controls.enableDamping=true;controls.dampingFactor=.08;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=2.2;controls.maxDistance=140;controls.autoRotateSpeed=.55;
const CAMS={showroom:{'360°':[[9.4,3,9.4],[2.6,.9,.6]],'Faros':[[4.6,.95,6.6],[2.6,.7,.6]],'Lobby':[[-1,3.4,9.5],[-4.6,2.4,-4]],'Planta':[[2.6,19,.62],[2.6,0,.6]]},
 villa:{'Fachada':[[-4,6,24],[-4,4.5,-8]],'Yate':[[38,6,27],[25,2,15]],'Auto':[[13,2.6,2.2],[8,1.8,-3.4]],'Planta':[[0,78,.1],[0,0,-2]],'Aérea':[[40,22,44],[0,3,-4]]}};
let camAnim=null;
function goCam(scene,name,inst){const c=CAMS[scene][name];if(!c)return;const to={p:new T3.Vector3(...c[0]),t:new T3.Vector3(...c[1])};
 if(inst||RM){camera.position.copy(to.p);controls.target.copy(to.t);controls.update();camAnim=null;}else camAnim={fp:camera.position.clone(),ft:controls.target.clone(),to,k:0};
 $$('#arCams button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.c===name)));}

/* ---------- estado ---------- */
const st={scene:'showroom',hour:17.5,cut:0,lights:false,lightsTouched:false,spin:!RM,plan:false,car:null,gltf:null,heads:[],tails:[],paints:[],headMats:[],tailMats:[],variant:'Carmine Candy',custom:null,envT:0,nf:0};
const planMat=new T3.MeshBasicMaterial({color:0x9fd8ff,wireframe:true,transparent:true,opacity:.42});
const grid=new T3.GridHelper(120,120,0x6fb6ff,0x2c5f9c);grid.material.transparent=true;grid.material.opacity=.55;grid.visible=false;
const clipA=new T3.Plane(new T3.Vector3(0,-1,0),7),clipB=new T3.Plane(new T3.Vector3(0,0,-1),4);
function setCut(){const c=st.cut;clipA.constant=lerp(7.2,2.2,c);clipB.constant=lerp(4,-13,c);const planes=c>.001?[st.scene==='showroom'?clipA:clipB]:[];archMats.forEach(m=>{m.clippingPlanes=planes;m.needsUpdate=true;});$('#arCutO').textContent=c<.01?'sin corte':Math.round(c*100)+'%';}
function sunVec(h){const t=(h-7)/12;let el=Math.sin(Math.PI*clamp(t,0,1))*58;if(t>1)el=-(t-1)*70;if(t<0)el=t*70;const az=-100+t*190;return{el,az,v:new T3.Vector3().setFromSphericalCoords(1,T3.MathUtils.degToRad(90-el),T3.MathUtils.degToRad(az))};}
let envTarget=null;
function updateSun(force){const s=sunVec(st.hour),nf=sm(4,-7,s.el);st.nf=nf;const warmK=sm(1,22,s.el);
 const sc=new T3.Color().setRGB(lerp(1,1,warmK),lerp(.58,.95,warmK),lerp(.32,.88,warmK));
 [skyA,skyB].forEach(sk=>sk.material.uniforms.sunPosition.value.copy(s.v));
 sunA.position.copy(s.v).multiplyScalar(30).add(new T3.Vector3(2,0,0));sunA.color.copy(sc);sunA.intensity=(1-nf)*2.6;
 keyA.intensity=lerp(1.2,2.6,nf);fillA.intensity=lerp(.6,1.4,nf);M.lamp.emissiveIntensity=lerp(.8,3.5,nf);
 sunB.position.copy(s.v).multiplyScalar(90);sunB.color.copy(sc);sunB.intensity=(1-nf)*2.8;hemiB.intensity=lerp(.55,.08,nf);moon.intensity=nf*.35;
 water.material.uniforms.sunDirection.value.copy(s.v).normalize();water.material.uniforms.sunColor.value.copy(sc).multiplyScalar(1-nf*.9);
 stars.material.opacity=nf;M.warm.emissiveIntensity=nf*2.2;M.pool.emissiveIntensity=nf*1.4;villa.userData.lights.forEach((L,i)=>L.intensity=nf*(i===3?2.4:1.6));
 renderer.toneMappingExposure=st.scene==='villa'?lerp(.5,.85,nf):lerp(.72,.42,nf);
 hemiA.intensity=lerp(.32,.06,nf);
 const ei=st.scene==='showroom'?lerp(1,.22,nf):1;A.traverse(o=>{if(o.isMesh&&o.material&&o.material.envMapIntensity!==undefined)o.material.envMapIntensity=(o.material.userData.ei0??(o.material.userData.ei0=o.material.envMapIntensity))*ei;});
 if(!st.lightsTouched)setLights(nf>.5,false);
 const hh=Math.floor(st.hour),mm=Math.round((st.hour-hh)*60);$('#arHourO').textContent=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} · ${nf>.6?'noche':s.el<12?(st.hour<12?'amanecer':'atardecer'):'día'}`;
 const now=performance.now();if(force||now-st.envT>220){st.envT=now;if(st.scene==='villa'||force){const old=envTarget;const sc2=new T3.Scene();sc2.add(skyB);envTarget=pmrem.fromScene(sc2);B.add(skyB);B.environment=envTarget.texture;if(old)old.dispose();}}}

/* ---------- auto ---------- */
const rig=new T3.Group();turn.add(rig);
const headSpots=[],tailLight=new T3.PointLight(0xff1a1a,0,4,2);
function setLights(on,touch){st.lights=on;if(touch)st.lightsTouched=true;$('#arLights').setAttribute('aria-pressed',String(on));
 st.headMats.forEach(m=>{m.emissive.set(0xffffff);m.emissiveIntensity=on?6:.15;});st.tailMats.forEach(m=>{m.emissive.set(0xff1b12);m.emissiveIntensity=on?5:.25;});
 headSpots.forEach(s=>s.intensity=on?3.2:0);tailLight.intensity=on?1.2:0;}
async function selectVariant(name){const g=st.gltf;if(!g)return;const parser=g.parser;const vs=g.userData.variants||[];const vi=vs.indexOf(name);st.variant=name;st.custom=null;
 const jobs=[];st.car.traverse(o=>{if(!o.isMesh||!o.userData.gltfExtensions)return;const ext=o.userData.gltfExtensions.KHR_materials_variants;if(!ext)return;if(!o.userData.origMat)o.userData.origMat=o.material;
  const mp=ext.mappings.find(m=>m.variants.includes(vi));jobs.push((mp?parser.getDependency('material',mp.material):Promise.resolve(o.userData.origMat)).then(mat=>{o.material=mat;parser.assignFinalMaterial(o);}));});
 await Promise.all(jobs);collectMats();setLights(st.lights,false);markPaint();}
function collectMats(){st.headMats=[];st.tailMats=[];st.paints=[];const seen=new Set();st.car.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(!m||seen.has(m))return;seen.add(m);const n=(m.name||'').toLowerCase();
 if(n.includes('headlight'))st.headMats.push(m);else if(n.includes('brakelight')||n.includes('signallight'))st.tailMats.push(m);else if(n.startsWith('paint')){if(!m.userData.c0)m.userData.c0=m.color.clone();st.paints.push(m);}});}
function paintCustom(hexc){st.custom=hexc;st.paints.forEach(m=>{m.color.set(hexc);});markPaint();}
function markPaint(){$$('#arPaint button').forEach(b=>b.setAttribute('aria-pressed',String(st.custom?b.dataset.c===st.custom:b.dataset.v===st.variant)));}
function loadCar(){const ld=new T3.GLTFLoader();status('Cargando el auto (Car Concept, 11.8 MB)…',.45);
 const onLoad=gltf=>{const car=gltf.scene;st.gltf=gltf;st.car=car;gltf.userData.variants=(gltf.userData.gltfExtensions&&gltf.userData.gltfExtensions.KHR_materials_variants?gltf.userData.gltfExtensions.KHR_materials_variants.variants.map(v=>v.name):[]);
  car.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.envMapIntensity=1.2;}}});
  let bb=new T3.Box3().setFromObject(car),size=bb.getSize(new T3.Vector3());const len=Math.max(size.x,size.z);const s=4.6/len;car.scale.setScalar(s);
  bb=new T3.Box3().setFromObject(car);const c=bb.getCenter(new T3.Vector3());car.position.sub(new T3.Vector3(c.x,bb.min.y,c.z));
  const holder=new T3.Group();holder.add(car);holder.updateMatrixWorld(true);
  const find=n=>{let r=null;car.traverse(o=>{if(!r&&o.name===n)r=o;});return r;};const H=find('BodyHeadlights'),Tl=find('BodyTaillights');
  if(H&&Tl){const ph=new T3.Box3().setFromObject(H).getCenter(new T3.Vector3()),pt=new T3.Box3().setFromObject(Tl).getCenter(new T3.Vector3());const f=ph.sub(pt);holder.rotation.y=Math.atan2(-f.x,f.z);}
  holder.updateMatrixWorld(true);
  const hb=H?new T3.Box3().setFromObject(H):null;
  const bbr=new T3.Box3().setFromObject(holder);const front=bbr.max.z,back=bbr.min.z,wid=(bbr.max.x-bbr.min.x)/2;const hy=hb?(hb.min.y+hb.max.y)/2:.75;
  rig.add(holder);
  [-1,1].forEach(sx=>{const sp=new T3.SpotLight(0xf4f8ff,0,40,.42,.55,1.2);sp.position.set(sx*wid*.62,hy,front-.25);sp.target.position.set(sx*wid*.9,0,front+12);rig.add(sp,sp.target);headSpots.push(sp);});
  tailLight.position.set(0,hy+.05,back-.2);rig.add(tailLight);
  const sh=new T3.Mesh(new T3.PlaneGeometry(2.6,5.6),new T3.MeshBasicMaterial({map:tShadow,transparent:true,depthWrite:false,opacity:.8}));sh.rotation.x=-Math.PI/2;sh.position.y=.012;rig.add(sh);
  rig.position.y=.08;
  collectMats();if(st.gltf.userData.variants.length)selectVariant('Carmine Candy');setLights(st.lights,false);
  load.hidden=true;$('#arCarNote').textContent='';};
 const onErr=e=>{if(e)console.warn(e);load.hidden=true;$('#arCarNote').textContent='No se pudo cargar el modelo del auto; el resto del estudio funciona.';};
 const onProg=x=>{if(x.total)status(`Cargando el auto: ${(x.loaded/1048576).toFixed(1)} de ${(x.total/1048576).toFixed(1)} MB`,.45+.5*x.loaded/x.total);};
 const packed=()=>{status('Cargando el auto (versión empaquetada, 11.9 MB)…',.5);const s=document.createElement('script');s.src='assets/car.js';
  s.onload=async()=>{try{const b64=window.__CAR_GZ_B64;window.__CAR_GZ_B64=null;if(!b64||typeof DecompressionStream==='undefined')throw new Error('sin datos o sin DecompressionStream');status('Descomprimiendo el auto…',.85);
   const bin=atob(b64),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
   const buf=await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();ld.parse(buf,'',onLoad,onErr);}catch(err){onErr(err);}};
  s.onerror=()=>onErr(new Error('assets/car.js'));document.head.appendChild(s);};
 ld.load(MODEL,onLoad,onProg,()=>packed());}

/* ---------- cambio de escena y UI ---------- */
function setScene(name){st.scene=name;$$('#arTabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.s===name)));
 if(name==='showroom'){rig.position.set(0,.08,0);rig.rotation.set(0,0,0);turn.add(rig);}else{rig.position.set(0,0,0);rig.rotation.set(0,0,0);carSlotB.add(rig);}
 const sc=cur();grid.parent&&grid.parent.remove(grid);sc.add(grid);
 $('#arName').textContent=name==='showroom'?'Showroom':'Villa con yate';$('#arTech').textContent=name==='showroom'?'Ónix, nogal, latón y mármol · PBR':'Cielo físico, agua con reflejos y sombras';
 $('#arCams').innerHTML=Object.keys(CAMS[name]).map(k=>`<button data-c="${k}" aria-pressed="false">${k}</button>`).join('');$$('#arCams button').forEach(b=>b.addEventListener('click',()=>goCam(st.scene,b.dataset.c)));
 goCam(name,Object.keys(CAMS[name])[name==='showroom'?0:4],true);controls.autoRotate=st.spin&&name==='villa';applyPlan();setCut();updateSun(true);ficha();}
const cur=()=>st.scene==='showroom'?A:B;
function applyPlan(){[A,B].forEach(s=>{s.overrideMaterial=st.plan?planMat:null;});skyA.visible=skyB.visible=!st.plan;water.visible=!st.plan;stars.visible=!st.plan;grid.visible=st.plan;
 A.background=st.plan?new T3.Color(0x0B3A6F):new T3.Color(0x0a0a0c);B.background=st.plan?new T3.Color(0x0B3A6F):null;$('#arPlan').setAttribute('aria-pressed',String(st.plan));}
function ficha(){const f=st.scene==='showroom'?['Showroom','Un garaje de lujo armado con el motor three.js: muro de ónix con vetas onduladas, lambrín de nogal con marcos de latón, tragaluz con vigas de acero, candil de mil cadenas y piso de mármol pulido. El sol entra por el tragaluz y sus sombras se mueven con la hora.','El auto es un modelo glTF real con pintura de capa transparente (clearcoat), cristales y faros emisivos. Los reflejos vienen de un mapa de entorno prefiltrado (PMREM), como en los visores de autos.','three.js · PBR · clearcoat · PMREM · sombras PCF · InstancedMesh']:
 ['Villa con yate','Casa frente al mar con planta baja de cristal, volado con celosía de nogal, alberca infinita, muelle de teca y un yate de 20 metros. El cielo es un modelo físico de dispersión (Rayleigh y Mie) y el agua refleja la escena en tiempo real.','De noche se encienden la casa, la alberca y los faros. El corte de sección rebana la casa como en un plano de AutoCAD, y el modo plano la muestra en alambre sobre cuadrícula.','Cielo físico · agua con reflejo planar · sombras · corte de sección · vista de alambre'];
 $('#arFicha').innerHTML=`<div class="folio"><span>Cómo se modela · ${f[0]}</span><span>Motor 3D en vivo</span></div><p class="big">${f[1]}</p><p>${f[2]}</p><p class="mono" style="color:var(--art1);letter-spacing:.08em">${f[3]}</p>`;}
$$('#arTabs button').forEach(b=>b.addEventListener('click',()=>setScene(b.dataset.s)));
const PAINTS=[['Carmine Candy','#9E1B22','Rojo carmín'],['Pearly Swirly','#E9E4DA','Perla'],['Torched Graphite','#3A3B40','Grafito'],[null,'#D97757','Naranjito'],[null,'#0E2A5C','Azul noche'],[null,'#0F3D2E','Verde inglés']];
$('#arPaint').innerHTML=PAINTS.map(p=>`<button ${p[0]?`data-v="${p[0]}"`:`data-c="${p[1]}"`} aria-pressed="false" title="${p[2]}"><i style="background:${p[1]}"></i><span>${p[2]}</span></button>`).join('');
$$('#arPaint button').forEach(b=>b.addEventListener('click',()=>{if(!st.car)return;if(b.dataset.v)selectVariant(b.dataset.v);else paintCustom(b.dataset.c);}));
$('#arHour').addEventListener('input',e=>{st.hour=+e.target.value;updateSun(false);});
$('#arHour').addEventListener('change',()=>updateSun(true));
$('#arCut').addEventListener('input',e=>{st.cut=+e.target.value;setCut();});
$('#arLights').addEventListener('click',()=>setLights(!st.lights,true));
$('#arSpin').addEventListener('click',e=>{st.spin=!st.spin;e.currentTarget.setAttribute('aria-pressed',String(st.spin));controls.autoRotate=st.spin&&st.scene==='villa';});
$('#arSpin').setAttribute('aria-pressed',String(st.spin));
$('#arPlan').addEventListener('click',()=>{st.plan=!st.plan;applyPlan();});
controls.addEventListener('start',()=>{camAnim=null;$$('#arCams button').forEach(b=>b.setAttribute('aria-pressed','false'));});

/* ---------- bucle ---------- */
let vis=false,last=performance.now(),fpsN=0,fpsT=0,fps=0,tt=0;
new IntersectionObserver(es=>es.forEach(e=>vis=e.isIntersecting),{rootMargin:'80px'}).observe(cv);
function resize(){const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;const pr=renderer.getPixelRatio();if(cv.width!==Math.round(w*pr)||cv.height!==Math.round(h*pr))renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function loop(now){requestAnimationFrame(loop);if(!vis||document.hidden){last=now;return;}const dt=Math.min(.05,(now-last)/1000);last=now;tt+=dt;resize();
 if(camAnim){camAnim.k=Math.min(1,camAnim.k+dt/1.3);const e=camAnim.k*camAnim.k*(3-2*camAnim.k);camera.position.lerpVectors(camAnim.fp,camAnim.to.p,e);controls.target.lerpVectors(camAnim.ft,camAnim.to.t,e);if(camAnim.k>=1)camAnim=null;}
 if(st.scene==='showroom'&&st.spin&&!RM)turn.rotation.y+=dt*.22;
 if(st.scene==='villa'){water.material.uniforms.time.value+=dt*.55;if(!RM){yacht.position.y=Math.sin(tt*.9)*.12;yacht.rotation.z=Math.sin(tt*.7)*.015;yacht.rotation.x=Math.sin(tt*.6+1)*.01;}}
 controls.update();renderer.render(cur(),camera);
 fpsN++;fpsT+=dt;if(fpsT>.5){fps=Math.round(fpsN/fpsT);fpsN=0;fpsT=0;const inf=renderer.info.render;$('#arHud').textContent=`${fps} FPS · ${(inf.triangles/1000).toFixed(0)}k triángulos · ${inf.calls} draw calls · three.js r147`;}}
setScene('showroom');status('Listo el estudio. Falta el auto…',.42);loadCar();requestAnimationFrame(loop);
window.__arq={st,setScene,goCam,setLights,selectVariant,paintCustom,updateSun};
}
})();
