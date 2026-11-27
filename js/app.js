/* CU ML Club: events shelf with the robot octopus, team, join form.
   Data (events, team, form options) lives in js/data.js.
   Needs three.js r128 (vendor/three.min.js); without WebGL the page falls back to a static picture. */
{
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// ---------- language: interface texts in js/i18n.js, event/team texts in js/data.js ----------
const I=window.I18N;
let LANG=(()=>{try{const s=localStorage.getItem('cuml-lang');if(s&&I[s])return s}catch(e){}return /^(ru|kk|be|uk)/i.test(navigator.language||'')?'ru':'en'})();
const i18=(k,v)=>{let s=(I[LANG]&&I[LANG][k])??I.en[k]??k;if(v)for(const x in v)s=s.split('{'+x+'}').join(v[x]);return s};
const txt=v=>v&&typeof v==='object'?(v[LANG]??v.en??''):(v??'');
const typeName=ty=>I.en['type.'+ty]?i18('type.'+ty):'';
const SAMPLE=CLUB.events;
const ROLES=CLUB.roles;

let S={events:[],reg:{},join:null};
try{const j=JSON.parse(localStorage.getItem('cuml-v1')||'null');if(j&&typeof j==='object')S=Object.assign(S,j)}catch(e){}
const save=()=>{try{localStorage.setItem('cuml-v1',JSON.stringify(S))}catch(e){}};
const all=()=>SAMPLE.concat(S.events);
const byId=id=>all().find(e=>e.id===id);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const fd=iso=>{const d=new Date(iso),lc=LANG==='ru'?'ru-RU':'en-GB';return{wd:cap(d.toLocaleDateString(lc,{weekday:'short'})),day:d.getDate(),mon:d.toLocaleDateString(lc,{month:'short'}),time:d.toLocaleTimeString(lc,{hour:'2-digit',minute:'2-digit'}),full:cap(d.toLocaleDateString(lc,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}};
const taken=e=>Math.min(e.seats,e.taken+(S.reg[e.id]?1:0));
let filter='all';
const track=$('#track'),stage=$('#stage'),fly=$('#fly'),oarea=$('#oarea'),cv=$('#oc');

const cardHTML=e=>{const d=fd(e.date),t=taken(e),inn=!!S.reg[e.id],left=e.seats-t;
 return `<article class="card t-${esc(e.type)}${inn?' in':''}" data-id="${esc(e.id)}">
 <div class="ctop"><span class="tag">${typeName(e.type)}</span><span class="when">${d.time}</span></div>
 <div class="date">${d.wd} ${d.day} ${d.mon}</div>
 <h3>${esc(txt(e.title))}</h3>
 <p class="meta">${esc(txt(e.where))}<br>${esc(txt(e.dur))}</p>
 <div class="seat"><div class="bar"><i style="width:${Math.round(t/e.seats*100)}%"></i></div>${left>0?i18('card.left',{left,seats:e.seats}):i18('card.full')}</div>
 <button class="btn" data-open="${esc(e.id)}">${i18(inn?'card.in':e.type==='community'?'card.ask':'card.join')}</button></article>`};
const list=()=>all().filter(e=>filter==='all'||e.type===filter).sort((a,b)=>a.date<b.date?-1:1);
function render(){const L=list();track.innerHTML=L.length?L.map(cardHTML).join(''):`<p class="empty">${i18('empty')}</p>`;return[...track.querySelectorAll('.card')]}

/* ---------- robot octopus ---------- */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const chips=$('#chips'),shint=$('#shint'),bar2=$('#bar2'),navEv=$('#navEv'),navEl=document.querySelector('nav.top');
const N=16,K=.42;
let GL=false,R,scene,cam,oct,mg,parts=[],tipI,tipLed,brain,brainGlow,eyeGlow,W=1,H=1,VW=1,VH=1,OH=1,ppu=1,sc=1,home=null,homeS={x:0,y:0},drift=0,SR=null,dealt=false;
const TN=[];
let V,B,P,T2,W3,UPV,Pp,Zv,Mid,SM,WM,Q,S3;
function envMap(){
 const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');
 const gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#5a4fa8');gr.addColorStop(.5,'#241f3f');gr.addColorStop(1,'#0c0a14');
 g.fillStyle=gr;g.fillRect(0,0,1024,512);
 g.fillStyle='#ffffff';g.fillRect(340,30,340,90);g.fillRect(60,150,90,170);g.fillRect(860,140,80,190);
 g.fillStyle='#9f86ff';g.fillRect(500,330,240,40);
 const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.encoding=THREE.sRGBEncoding;
 const pm=new THREE.PMREMGenerator(R);const e=pm.fromEquirectangular(t).texture;pm.dispose();t.dispose();return e;
}
function initGL(){
 if(!window.THREE)return false;
 R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
 R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;
 V=new THREE.Vector3();B=new THREE.Vector3();P=new THREE.Vector3();T2=new THREE.Vector3();W3=new THREE.Vector3();
 UPV=new THREE.Vector3(0,1,0);Pp=new THREE.Vector3();Zv=new THREE.Vector3();Mid=new THREE.Vector3();S3=new THREE.Vector3();
 SM=new THREE.Matrix4();WM=new THREE.Matrix4();Q=new THREE.Quaternion();
 const C=h=>new THREE.Color(h).convertSRGBToLinear();
 scene=new THREE.Scene();scene.environment=envMap();
 cam=new THREE.PerspectiveCamera(30,1,0.1,100);cam.position.set(0,0,16);
 scene.add(new THREE.HemisphereLight(0xffffff,0xd6cff5,0.35));
 const key=new THREE.DirectionalLight(0xffffff,1.4);key.position.set(5,10,7);scene.add(key);
 const fill=new THREE.DirectionalLight(0xffffff,0.45);fill.position.set(-7,3,5);scene.add(fill);
 const rim=new THREE.DirectionalLight(0x8f74ff,1.1);rim.position.set(-3,5,-8);scene.add(rim);
 const ACC='#7c5cff';
 const M={
  body:new THREE.MeshStandardMaterial({color:C('#6f55e6'),roughness:.25,metalness:.15}),
  seam:new THREE.MeshStandardMaterial({color:C('#25213a'),roughness:.45,metalness:.55}),
  tyre:new THREE.MeshStandardMaterial({color:C('#1b1828'),roughness:.75,metalness:.1}),
  hub:new THREE.MeshStandardMaterial({color:C('#e9e4ff'),roughness:.3,metalness:.3,emissive:C('#b9a6ff'),emissiveIntensity:.35}),
  led:new THREE.MeshBasicMaterial({color:C('#e2d8ff')}),
  ledHot:new THREE.MeshBasicMaterial({color:C('#d8ccff')}),
  metal:new THREE.MeshStandardMaterial({color:C('#cfcbe0'),roughness:.22,metalness:.95}),
  dark:new THREE.MeshStandardMaterial({color:C('#2b2640'),roughness:.35,metalness:.7}),
  board:new THREE.MeshStandardMaterial({color:C('#2b2356'),roughness:.5,metalness:.3,emissive:C('#3a2aa8'),emissiveIntensity:.5}),
  glass:new THREE.MeshPhysicalMaterial({color:C('#f1ecff'),roughness:.02,metalness:0,transparent:true,opacity:.09,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:2.2,side:THREE.DoubleSide,depthWrite:false}),
  lens:new THREE.MeshPhysicalMaterial({color:C('#06050b'),roughness:.05,metalness:.4,clearcoat:1,clearcoatRoughness:.02})
 };
 const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(190,170,255,1)');r.addColorStop(.35,'rgba(124,92,255,.55)');r.addColorStop(1,'rgba(124,92,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t})();
 const glow=(s,o)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:o||1}));sp.scale.set(s,s,1);return sp};
 const mesh=(g,m,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);return o};
 oct=new THREE.Group();scene.add(oct);
 mg=new THREE.Group();oct.add(mg);
 // glass dome over a machine brain
 const prof=[[1.0,0],[1.16,.35],[1.24,.9],[1.19,1.5],[1.02,2.02],[.76,2.42],[.42,2.68],[.05,2.78]].map(a=>new THREE.Vector2(a[0],a[1]));
 const dome=mesh(new THREE.LatheGeometry(prof,64),M.glass);dome.renderOrder=3;mg.add(dome);
 {const cap=mesh(new THREE.TorusGeometry(.2,.05,10,24),M.dark,0,2.74,0);cap.rotation.x=Math.PI/2;mg.add(cap)}
 mg.add(mesh(new THREE.CylinderGeometry(.17,.24,1.9,20),M.dark,0,1.05,0));
 for(let i=0;i<6;i++){const t=mesh(new THREE.TorusGeometry(.42-.04*i,.045,10,36),M.metal,0,.35+i*.3,0);t.rotation.x=Math.PI/2;mg.add(t)}
 const chipG=new THREE.BoxGeometry(.1,.1,.03),capG=new THREE.CylinderGeometry(.035,.035,.12,10);
 for(let i=0;i<7;i++){
  const a=i/7*Math.PI*2,y=.75+(i%3)*.36,rr=.58;
  const b=mesh(new THREE.BoxGeometry(.44,.58,.035),M.board,Math.sin(a)*rr,y,Math.cos(a)*rr);b.rotation.y=a;b.rotation.z=(i%2?.12:-.12);mg.add(b);
  for(let k=0;k<4;k++){const ch=mesh(chipG,k%2?M.led:M.dark,Math.sin(a)*(rr+.03)+Math.cos(a)*(-.12+.08*k),y-.16+.11*k,Math.cos(a)*(rr+.03)-Math.sin(a)*(-.12+.08*k));ch.rotation.y=a;mg.add(ch)}
  mg.add(mesh(capG,M.metal,Math.sin(a)*(rr+.06),y+.22,Math.cos(a)*(rr+.06)));
 }
 for(let i=0;i<12;i++){
  const a=i/12*Math.PI*2,a2=a+.9;
  const pts=[new THREE.Vector3(Math.sin(a)*.95,.05,Math.cos(a)*.95),new THREE.Vector3(Math.sin(a)*.95,.7,Math.cos(a)*.95),new THREE.Vector3(Math.sin(a2)*.5,1.3,Math.cos(a2)*.5),new THREE.Vector3(Math.sin(a2)*.2,1.75,Math.cos(a2)*.2)];
  mg.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.022,6),i%4===0?M.led:M.seam));
 }
 brain=mesh(new THREE.IcosahedronGeometry(.26,1),M.ledHot,0,2.0,0);mg.add(brain);
 brainGlow=glow(1.6,.9);brainGlow.position.set(0,2.0,0);mg.add(brainGlow);
 const pl=new THREE.PointLight(0x8c6cff,2.2,4.5);pl.position.set(0,1.6,0);mg.add(pl);
 // collar and lens eye
 mg.add(mesh(new THREE.CylinderGeometry(1.06,.96,.52,64),M.body,0,-.2,0));
 [[1.07,.04],[.97,-.45]].forEach(r=>{const t=mesh(new THREE.TorusGeometry(r[0],.035,10,64),M.seam,0,r[1],0);t.rotation.x=Math.PI/2;mg.add(t)});
 const boltG=new THREE.SphereGeometry(.03,8,6);
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2;if(Math.abs(Math.sin(a/2))<.2)continue;mg.add(mesh(boltG,M.seam,Math.sin(a)*1.03,-.2,Math.cos(a)*1.03))}
 mg.add(mesh(new THREE.CylinderGeometry(.92,.7,.3,48),M.dark,0,-.6,0));
 const eye=new THREE.Group();eye.position.set(0,-.12,1.0);mg.add(eye);eyeG=eye;
 const hous=mesh(new THREE.CylinderGeometry(.6,.64,.4,48),M.body);hous.rotation.x=Math.PI/2;eye.add(hous);
 eye.add(mesh(new THREE.TorusGeometry(.52,.06,12,48),M.seam,0,0,.2));
 eye.add(mesh(new THREE.TorusGeometry(.45,.045,12,48),M.led,0,0,.22));
 const lens=mesh(new THREE.SphereGeometry(.4,40,24),M.lens,0,0,.12);lens.scale.z=.6;eye.add(lens);
 eye.add(mesh(new THREE.TorusGeometry(.2,.014,8,40),M.led,0,0,.34));
 eye.add(mesh(new THREE.SphereGeometry(.05,12,8),new THREE.MeshBasicMaterial({color:0xffffff}),-.13,.13,.35));
 eyeGlow=glow(1.9,.7);eyeGlow.position.set(0,0,.18);eye.add(eyeGlow);
 // arms: modular segments with rollers, one instanced mesh per part
 const prof2=[[0,-.5],[.84,-.5],[.96,-.45],[1,-.34],[1,.34],[.96,.45],[.84,.5],[0,.5]].map(a=>new THREE.Vector2(a[0],a[1]));
 const canG=new THREE.LatheGeometry(prof2,24),cylG=new THREE.CylinderGeometry(1,1,1,20),boxG=new THREE.BoxGeometry(1,1,1);
 const wheelG=new THREE.CylinderGeometry(1,1,1,16);wheelG.rotateZ(Math.PI/2);
 const L4=(x,y,z,sx,sy,sz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(sx,sy,sz));
 parts=[
  {g:canG,m:M.body,loc:[[0,0,0,1,.8,1]]},
  {g:cylG,m:M.seam,loc:[[0,-.5,0,.86,.14,.86]]},
  {g:boxG,m:M.led,loc:[[.98,0,0,.07,.42,.24],[-.98,0,0,.07,.42,.24]]},
  {g:wheelG,m:M.tyre,loc:[[0,-.22,-.92,.5,.28*K,.28],[0,.2,-.92,.5,.28*K,.28]]},
  {g:wheelG,m:M.hub,loc:[[0,-.22,-.92,.56,.13*K,.13],[0,.2,-.92,.56,.13*K,.13]]}
 ];
 parts.forEach(p=>{p.L=p.loc.map(a=>L4(...a));p.im=new THREE.InstancedMesh(p.g,p.m,8*N*p.L.length);p.im.frustumCulled=false;oct.add(p.im)});
 tipI=new THREE.InstancedMesh(new THREE.SphereGeometry(1,16,12),M.body,8);tipI.frustumCulled=false;oct.add(tipI);
 tipLed=new THREE.InstancedMesh(new THREE.TorusGeometry(1,.12,8,24),M.led,8);tipLed.frustumCulled=false;oct.add(tipLed);
 for(let i=0;i<8;i++){
  const a=i/8*Math.PI*2+Math.PI/8;
  const d=new THREE.Vector3(Math.sin(a),0,Math.cos(a));
  const L0=.58+.04*((i*5)%3),lens=[];for(let j=0;j<N;j++)lens.push(L0*Math.pow(.93,j));
  const mk=()=>Array.from({length:N+1},()=>new THREE.Vector3());
  TN.push({i,d,P:new THREE.Vector3().crossVectors(d,UPV).normalize(),root:d.clone().multiplyScalar(.82).add(new THREE.Vector3(0,-.62,0)),lens,ph:i*1.37,w:0,job:null,tgt:new THREE.Vector3(),fkS:mk(),fkW:mk(),fk:mk(),ik:mk(),p:mk(),tipS:{x:0,y:0},rootS:{x:0,y:0}});
 }
 return true;
}
// The canvas covers the whole window (so the octopus can leave the stage); all logic works in
// stage-local pixels and these two convert using the stage's current position (SR).
function toS(v){P.copy(v).project(cam);return{x:(P.x+1)/2*VW-SR.left,y:(1-P.y)/2*VH-SR.top}}
function toW(x,y,z){x+=SR.left;y+=SR.top;P.set(x/VW*2-1,-(y/VH)*2+1,0.5).unproject(cam);P.sub(cam.position).normalize();const t=(z-cam.position.z)/P.z;return new THREE.Vector3().copy(cam.position).addScaledVector(P,t)}
const ZP=()=>1.4*sc;
function layout(){
 if(!GL)return;
 bar2.style.top=(navEl.offsetHeight+10)+'px';$('#skip').style.top=bar2.style.top;
 const top=bar2.offsetTop+bar2.offsetHeight+14;
 // phones: the nav, filter bar and shelf leave almost no height, so let the stage grow
 // until the octopus can span the screen width (its height is about half its arm span)
 const sw=stage.clientWidth;oarea.style.minHeight=sw<700?Math.round(top+sw*0.505)+'px':'';
 W=stage.clientWidth;H=stage.clientHeight;OH=oarea.offsetHeight;VW=innerWidth;VH=innerHeight;SR=stage.getBoundingClientRect();
 R.setSize(VW,VH);cam.aspect=VW/VH;cam.updateProjectionMatrix();cam.updateMatrixWorld();
 ppu=VH/(2*16*Math.tan(15*Math.PI/180));
 sc=Math.min((OH-top)*0.93/(5.2*ppu),W*0.94/(10.4*ppu));oct.scale.setScalar(sc);
 homeS={x:W/2,y:top+3.1*sc*ppu};home=toW(homeS.x,homeS.y,0);
}
// standing pose: arms rise out, arc down to the floor, tips curl up
function poseStand(tn,t){
 const p=tn.fkS;p[0].copy(tn.root);
 let th=.18+.06*Math.sin(t*.7+tn.ph);
 const curl=1.05+.12*Math.sin(t*.5+tn.ph);
 for(let j=0;j<N;j++){const s=(j+1)/N;
  th+=-.22*(1-s)+curl*s*s*s+.03*Math.sin(t*1.1+tn.ph+j*.45);
  const L=tn.lens[j];p[j+1].copy(p[j]).addScaledVector(tn.d,L*Math.cos(th)).addScaledVector(UPV,L*Math.sin(th));}
}
// swimming pose: arms trail behind in a bundle and pulse like a jet
function poseSwim(tn,t,pulse){
 const p=tn.fkW;p[0].copy(tn.root);
 let th=-1.42+0.32*pulse;
 for(let j=0;j<N;j++){const s=(j+1)/N;
  th+=0.01+0.1*Math.sin(t*7-j*0.55)*(0.3+s)+0.35*s*s*s;
  const L=tn.lens[j];p[j+1].copy(p[j]).addScaledVector(tn.d,L*Math.cos(th)).addScaledVector(UPV,L*Math.sin(th));}
}
function fabrik(p,T,lens){
 const n=p.length-1;B.copy(p[0]);
 for(let it=0;it<8;it++){
  p[n].copy(T);
  for(let j=n-1;j>=0;j--){V.subVectors(p[j],p[j+1]);const l=V.length()||1e-6;p[j].copy(p[j+1]).addScaledVector(V,lens[j]/l)}
  p[0].copy(B);
  for(let j=0;j<n;j++){V.subVectors(p[j+1],p[j]);const l=V.length()||1e-6;p[j+1].copy(p[j]).addScaledVector(V,lens[j]/l)}
 }
}
function writeTN(tn){
 const p=tn.p,ai=tn.i;
 for(let j=0;j<N;j++){
  V.subVectors(p[j+1],p[j]);const L=V.length()||1e-6;V.multiplyScalar(1/L);
  Pp.copy(tn.P).addScaledVector(V,-tn.P.dot(V));if(Pp.lengthSq()<1e-6)Pp.set(1,0,0);Pp.normalize();
  Zv.crossVectors(Pp,V);
  const r=K*tn.lens[j];
  SM.makeBasis(Pp,V,Zv);SM.scale(S3.set(r,L,r));Mid.addVectors(p[j],p[j+1]).multiplyScalar(.5);SM.setPosition(Mid);
  for(const part of parts)for(let k=0;k<part.L.length;k++){WM.multiplyMatrices(SM,part.L[k]);part.im.setMatrixAt((ai*N+j)*part.L.length+k,WM)}
 }
 const r=K*tn.lens[N-1];
 WM.compose(p[N],Q.identity(),S3.set(r*.9,r*.9,r*.9));tipI.setMatrixAt(ai,WM);
 SM.makeBasis(Pp,Zv,V);SM.scale(S3.set(r*.75,r*.75,r*.75));SM.setPosition(p[N]);tipLed.setMatrixAt(ai,SM);
}

/* ---------- jobs: pull the button, deal, sort ---------- */
let cjobs=[],collectAfter=null,curtain=null,curtainEl=null,needIntro=false,lift=0,liftT=0,poseT=0;
let eyeG=null,peckT=-1e9,flareT=-1e9,teamQ=false,jobs=[],pull=null,backT=null,pending=null,introS=null,introDone=false,rotEnd=0;
const ease=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
const outBack=u=>{const c=1.6,v=u-1;return 1+(c+1)*v*v*v+c*v*v};
const cl01=u=>Math.max(0,Math.min(1,u));
const RE=450,CA=760,RL=350,SWIM=2.6,SET=1.1;
const showSkip=()=>{$('#skip').hidden=!(jobs.length||pull||cjobs.length)};
function place(j,x,y,r,s){j.cl.style.transform=`translate(${(x-j.cw/2).toFixed(1)}px,${(y-14).toFixed(1)}px) rotate(${r.toFixed(1)}deg) scale(${s.toFixed(3)})`}
function setPressed(f){chips.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.f===f)))}
function rel(el){const r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();return{x:r.left-s.left+r.width/2,y:r.top-s.top+r.height/2}}
function skip(){
 stopPush();
 if(cjobs.length){finishCollect();return}
 if(pull){const P=pull;P.chip.style.transform='';P.tn.job=null;pull=null;
  // a pull with its own follow-up (the Team button) just jumps to it; a filter/Events pull deals at once
  if(P.after){showSkip();P.after(null);return}
  filter=P.chip.dataset.f;setPressed(filter);render();dealt=true}
 jobs.forEach(j=>{j.c.classList.remove('wait');j.cl.remove();if(j.tn)j.tn.job=null});jobs=[];fly.innerHTML='';showSkip();
 if(dealt)bar2.classList.add('on');
}
function deal(f){filter=f;setPressed(f);dealt=true;shint.hidden=true;if(!GL||RM)bar2.classList.add('on');navEv.classList.remove('pulse');const cs=render();if(!GL||RM){cs.forEach(c=>c.classList.remove('wait'))}return cs}
function startPull(chip,after){
 const f=chip.dataset.f;
 if(!GL||RM){if(after)after(null);else deal(f);return}
 if(!introDone){if(!after)pending=chip;return}
 if(cp>0.02){if(after)teamQ=true;else pending=chip;return}
 if(pull||curtain||cjobs.length)return;
 skip();clearTimeout(backT);
 const c=rel(chip),tn=pickTN(c.x);if(!tn){if(after)after(null);else deal(f);return}
 pull={chip,tn,st:1,ts:performance.now(),c0:c,tx:c.x,after};tn.job=pull;shint.hidden=true;showSkip();
}
function runSort(cards,gap,origin){
 jobs.forEach(j=>{j.c.classList.remove('wait');j.cl.remove();if(j.tn)j.tn.job=null});jobs=[];fly.innerHTML='';clearTimeout(backT);
 if(!cards.length||!GL||RM){cards.forEach(c=>c.classList.remove('wait'));bar2.classList.add('on');return}
 bar2.classList.remove('on');
 const now=performance.now(),cw=cards[0].offsetWidth,ps=W<600?0.42:0.52;
 track.scrollTo({left:0});
 cards.forEach((c,i)=>{
  c.classList.add('wait');
  const cl=c.cloneNode(true);cl.classList.remove('wait');cl.classList.add('flying');cl.style.width=cw+'px';fly.appendChild(cl);
  const lf=cards.length===1?Math.random()<.5:i%2===0;
  const j={c,cl,cw,px:W*(lf?0.06+Math.random()*0.2:0.74+Math.random()*0.2),py:OH*(0.3+Math.random()*0.4),rot:(Math.random()-0.5)*50,ps,
   f0:now+i*70,o:origin,fy:-240-Math.random()*160,t0:now+(origin?1000:800)+i*(gap||480),tn:null,st:0,tx:0};
  if(origin)place(j,origin.x,origin.y,0,0.08);else place(j,j.px,j.fy,j.rot,ps);
  jobs.push(j);
 });
 showSkip();
}
function pickTN(x){let best=null,bs=1e9;for(const t of TN){if(t.job)continue;const s=Math.abs(t.rootS.x-x)+(t.d.z<0?70:0)+Math.random()*30;if(s<bs){bs=s;best=t}}return best}
function slotS(j){const r=j.c.getBoundingClientRect();return{x:r.left-SR.left+r.width/2,y:r.top-SR.top+14}}
function updatePull(now){
 if(!pull)return;
 const e=now-pull.ts,tn=pull.tn,c=pull.c0;
 if(pull.st===1){
  const u=cl01(e/520);tn.w=Math.max(tn.w,ease(u));tn.tgt.copy(toW(c.x,c.y,ZP()));
  if(u>=1){pull.st=2;pull.ts=now}
 }else if(pull.st===2){
  const u=cl01(e/480),k=ease(u);
  let dx=homeS.x+drift-c.x,dy=homeS.y-c.y;const l=Math.hypot(dx,dy)||1;dx=dx/l*70*k;dy=dy/l*70*k;
  tn.w=1;tn.tgt.copy(toW(c.x+dx,c.y+dy,ZP()));
  pull.chip.style.transform=`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${(1+0.1*k).toFixed(3)})`;
  if(u>=1){
   const chip=pull.chip,o={x:c.x+dx,y:c.y+dy};
   chip.style.transition='transform .5s cubic-bezier(.3,1.7,.5,1)';chip.style.transform='';
   setTimeout(()=>{chip.style.transition=''},520);
   const af=pull.after;tn.job=null;pull=null;showSkip();
   if(af)af(o);else runSort(deal(chip.dataset.f),420,o);
  }
 }
}
function updateJobs(now){
 let done=0;
 for(const j of jobs){
  if(j.st===3){done++;continue}
  if(j.st===0){
   const u=cl01((now-j.f0)/650);
   if(j.o){const k=1-Math.pow(1-u,3),mx=(j.o.x+j.px)/2,my=Math.min(j.o.y,j.py)-OH*0.25;
    const x=(1-k)*(1-k)*j.o.x+2*(1-k)*k*mx+k*k*j.px,y=(1-k)*(1-k)*j.o.y+2*(1-k)*k*my+k*k*j.py;
    place(j,x,y,j.rot-(1-k)*540,0.08+(j.ps-0.08)*k);}
   else place(j,j.px,j.fy+(j.py-j.fy)*outBack(u),j.rot,j.ps);
   if(now>=j.t0&&u>=1){const tn=pickTN(j.px);if(tn){j.tn=tn;tn.job=j;j.st=1;j.ts=now;j.tx=j.px;
    track.scrollTo({left:Math.max(0,j.c.offsetLeft-(track.clientWidth-j.cw)/2),behavior:'smooth'})}}
   continue;
  }
  const e=now-j.ts,tn=j.tn;
  if(j.st===1){
   const u=cl01(e/RE);tn.w=Math.max(tn.w,ease(u));tn.tgt.copy(toW(j.px,j.py,ZP()));
   place(j,j.px,j.py+Math.sin(e/50)*1.5,j.rot,j.ps);
   if(u>=1){j.st=2;j.ts=now}
  }else if(j.st===2){
   const u=cl01(e/CA),k=ease(u),s=slotS(j);
   const tx=j.px+(s.x-j.px)*k,ty=j.py+(s.y-j.py)*k-Math.sin(Math.PI*k)*OH*0.22;
   j.tx=tx;tn.w=1;tn.tgt.copy(toW(tx,ty,ZP()));
   const m=0.75*Math.sin(Math.PI*u);
   place(j,tx+(tn.tipS.x-tx)*m,ty+(tn.tipS.y-ty)*m,j.rot*(1-k),j.ps+(1-j.ps)*k);
   if(u>=1){j.st=4;j.ts=now;j.c.classList.remove('wait');j.cl.remove()}
  }else if(j.st===4){
   tn.w=1-ease(cl01(e/RL));if(e>=RL){tn.job=null;j.st=3}
  }
 }
 if(jobs.length&&done===jobs.length){jobs=[];showSkip();bar2.classList.add('on');liftT=1;backT=setTimeout(startPush,350)}
}
/* ---------- after a deal: one arm shoves the shelf back to the first card ---------- */
let push=null;
// the card the arm leans on: the rightmost one whose left edge is still in the left part of the stage
function pushCard(){let best=null;for(const c of track.querySelectorAll('.card:not(.wait)')){const r=c.getBoundingClientRect(),x=r.left-SR.left;if(x>W*0.04&&x<W*0.7)best={x,y:r.top-SR.top+10}}return best}
function startPush(){
 if(!GL||RM||push||pull||jobs.length||cjobs.length||curtain)return;
 const s0=track.scrollLeft;if(s0<4)return;
 SR=stage.getBoundingClientRect();const p=pushCard()||{x:W*0.3,y:OH*0.8};
 const tn=pickTN(p.x);if(!tn){track.scrollTo({left:0,behavior:'smooth'});return}
 push={tn,st:1,ts:performance.now(),lt:performance.now(),s0,dur:Math.max(700,Math.min(1600,s0*0.9)),x:p.x,y:p.y,tx:p.x};
 tn.job=push;track.style.scrollSnapType='none';
}
function stopPush(){
 if(!push)return;
 if(push.st<3)track.scrollLeft=0;
 push.tn.job=null;push=null;track.style.scrollSnapType='';
}
function updatePush(now){
 if(!push)return;
 const P0=push,e=now-P0.ts,tn=P0.tn,dt=Math.min(0.05,(now-P0.lt)/1000);P0.lt=now;
 const aim=()=>{const p=pushCard();if(p){const k=Math.min(1,dt*14);P0.x+=(p.x-P0.x)*k;P0.y+=(p.y-P0.y)*k}P0.tx=P0.x;tn.tgt.copy(toW(P0.x-4,P0.y,ZP()))};
 if(P0.st===1){ // reach for the edge of a card
  const u=cl01(e/420);tn.w=Math.max(tn.w,ease(u));aim();
  if(u>=1){P0.st=2;P0.ts=now}
 }else if(P0.st===2){ // shove: the shelf slides back while the arm keeps leaning on a card
  const u=cl01(e/P0.dur),k=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  track.scrollLeft=P0.s0*(1-k);tn.w=1;aim();
  if(u>=1){track.scrollLeft=0;track.style.scrollSnapType='';P0.st=3;P0.ts=now}
 }else{ // let go
  tn.w=1-ease(cl01(e/RL));if(e>=RL){tn.job=null;push=null}
 }
}
/* ---------- Team: collect the cards back, pull Team, close the scene ---------- */
function collect(after,only){
 stopPush();
 const cards=only||[...track.querySelectorAll('.card:not(.wait)')];
 bar2.classList.remove('on');liftT=0;
 if(!cards.length){after();return}
 collectAfter=after;track.scrollTo({left:0});
 const now=performance.now();
 cjobs=cards.map((c,i)=>({c,cw:c.offsetWidth,t0:now+250+i*330,st:0,tn:null,tx:0,cl:null}));
 showSkip();
}
function finishCollect(){cjobs.forEach(j=>{j.c.classList.add('wait');if(j.cl)j.cl.remove();if(j.tn)j.tn.job=null});cjobs=[];const f=collectAfter;collectAfter=null;showSkip();if(f)f()}
function gulp(){navEv.classList.remove('gulp');void navEv.offsetWidth;navEv.classList.add('gulp')}
function updateCollect(now){
 if(!cjobs.length)return;
 let done=0;
 for(const j of cjobs){
  if(j.st===3){done++;continue}
  if(j.st===0){if(now>=j.t0){const s=slotS(j),tn=pickTN(s.x);if(tn){j.tn=tn;tn.job=j;j.st=1;j.ts=now;j.tx=s.x;
    track.scrollTo({left:Math.max(0,j.c.offsetLeft-(track.clientWidth-j.cw)/2),behavior:'smooth'})}}continue}
  const e=now-j.ts,tn=j.tn;
  if(j.st===1){
   const s=slotS(j),u=cl01(e/380);tn.w=Math.max(tn.w,ease(u));tn.tgt.copy(toW(s.x,s.y,ZP()));j.tx=s.x;
   if(u>=1){j.s0=s;j.cl=j.c.cloneNode(true);j.cl.classList.add('flying');j.cl.style.width=j.cw+'px';fly.appendChild(j.cl);j.c.classList.add('wait');place(j,s.x,s.y,0,1);j.st=2;j.ts=now}
  }else if(j.st===2){
   const u=cl01(e/650),k=ease(u),t=rel(navEv),s=j.s0;
   const tx=s.x+(t.x-s.x)*k,ty=s.y+(t.y-s.y)*k-Math.sin(Math.PI*k)*OH*0.18;j.tx=tx;
   tn.w=1;tn.tgt.copy(toW(tx,ty,ZP()));const m=.75*Math.sin(Math.PI*u);
   place(j,tx+(tn.tipS.x-tx)*m,ty+(tn.tipS.y-ty)*m,-260*k,1-0.92*k);
   if(u>=1){j.cl.remove();j.cl=null;gulp();j.st=4;j.ts=now}
  }else if(j.st===4){tn.w=1-ease(cl01(e/RL));if(e>=RL){tn.job=null;j.st=3}}
 }
 if(done===cjobs.length){cjobs=[];const f=collectAfter;collectAfter=null;showSkip();if(f)f()}
}
function buildCurtain(){
 curtainEl=document.createElement('div');curtainEl.className='curtain';curtainEl.setAttribute('aria-hidden','true');
 const inner=document.createElement('div');inner.className='ct';
 ['#team','#join'].forEach(s=>{const n=document.querySelector(s).cloneNode(true);n.removeAttribute('id');n.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));inner.appendChild(n)});
 inner.querySelectorAll('input,select,textarea,button,a').forEach(x=>x.tabIndex=-1);
 const hem=document.createElement('div');hem.className='hem';
 curtainEl.append(inner,hem);document.body.appendChild(curtainEl);
}
function startCurtain(){
 if(!curtainEl)buildCurtain();
 const Hv=innerHeight;curtainEl.style.height=Hv+'px';curtainEl.style.setProperty('--navh',navEl.offsetHeight+'px');
 curtainEl.style.display='block';curtainEl.style.transform=`translateY(${-Hv}px)`;cv.style.zIndex='26';navEl.classList.add('solid');
 const free=TN.filter(t=>!t.job).sort((a,b)=>a.rootS.x-b.rootS.x),n=free.length;
 const grips=[[free[0],-1],[free[1],-0.45],[free[n-2],0.45],[free[n-1],1]];
 const b=homeS.y-lift*OH*0.07;
 curtain={st:1,ts:performance.now(),grips,b0:b,hem:-20,base:b,cs:1,Hv};
 grips.forEach(g=>g[0].job=curtain);liftT=0;
}
// how hard the curtain pulls up right now: a tug every 2.8 s, then he hauls it back
function tug(t){const p=(t%2.8)/2.8;if(p<.25)return ease(p/.25);if(p<.55){const q=(p-.25)/.3;return 1-ease(q)-Math.sin(q*Math.PI)*0.12}return 0}
function updateCurtain(now){
 if(!curtain)return;
 const c=curtain,e=now-c.ts,Hv=c.Hv,SMALL=0.6;
 let hem,base,wv=1;
 if(c.st===1){const u=cl01(e/480);hem=14;base=c.b0;wv=ease(u);if(u>=1){c.st=2;c.ts=now}}
 else if(c.st===2){const u=cl01(e/1500),k=ease(u);c.cs=1-(1-SMALL)*k;
  const head=3.0*sc*c.cs*ppu,rb=Hv-head*0.35,rh=rb-head-24;hem=14+(rh-14)*k;base=c.b0+(rb-c.b0)*k;if(u>=1){c.st=3;c.ts=now}}
 else if(c.st===3){const t=e/1000,r=tug(t),head=3.0*sc*c.cs*ppu,rb=Hv-head*0.35,rh=rb-head-24;
  hem=rh-6-44*r+Math.sin(t*23)*1.4+Math.sin(t*37)*0.8;base=rb-20*r+Math.sin(t*19)*2}
 else{const u=cl01(e/850);hem=c.h0+(Hv-c.h0)*ease(Math.min(1,u*1.6));base=c.bb+Hv*0.9*u*u;wv=1-ease(cl01(u*2.2));if(u>=1){endCurtain();return}}
 c.hem=hem;c.base=base;
 curtainEl.style.transform=`translateY(${(hem-Hv).toFixed(1)}px)`;
 const gx=Math.max(70,3.0*sc*c.cs*ppu*1.15);
 c.grips.forEach(([tn,o])=>{tn.w=wv;tn.tgt.copy(toW(W/2+o*gx,hem-9,ZP()*c.cs))});
}
function endCurtain(){
 const t=document.getElementById('team');
 window.scrollTo({top:t.offsetTop-navEl.offsetHeight,behavior:'auto'});
 curtainEl.style.display='none';cv.style.zIndex='';
 curtain.grips.forEach(g=>g[0].job=null);curtain=null;needIntro=true;oct.visible=false;oct.scale.setScalar(sc);
}
/* ---------- the octopus crawls down the page with the scroll and dives into the logo ---------- */
// The scroll position between the events shelf and the About block is the octopus's place on a wavy
// path from the shelf to the empty logo frame: scrolling down he crawls along it (a little behind the
// finger), shrinking to the frame's size; at the end he dives in and the drawn logo appears.
// Scrolling back up he climbs out and crawls back to the shelf.
const aboutPic=document.getElementById('aboutPic');
let cp=0,crawlV=0,inLogo=false,inT=0,blank=false;
const homeAnchor=()=>({x:homeS.x,y:homeS.y-lift*OH*0.07,s:sc});
// The pose of the drawn octopus in the logo, as fractions of the picture: where the eye is, how big it
// is (sets his scale), how the head leans, and where the eight arm curls end. Near the end of the crawl
// he blends into this pose so that the drawing can take over from him.
// arms: each drawn arm traced from where it leaves the body to the end of its curl (percent of the picture)
const LOGO={eye:[0.615,0.445],eyeR:0.067,lean:-0.52,arms:[
 [[46.7,53.3],[40.8,54.6],[35.8,51.7],[32.9,48.3],[32.1,41.7],[32.1,35],[31.7,29.2],[31.3,25.8],[28.3,22.5],[23.3,21.3],[19.2,23.3],[17.5,26.7],[17.9,30],[20,32.1],[20.6,31.4]],
 [[43.3,46.7],[40.4,42.9],[37.9,37.5],[37.3,32.5],[39.2,25.8],[42.7,22.5],[46.7,22.5],[50,24.2],[51.7,26.7],[50.4,29.2],[49.2,28.6]],
 [[53.3,61.7],[50.8,65],[48.3,74.2],[43.3,80],[37.5,84.2],[29.2,86.3],[20,86.3],[16.3,82.5],[16.7,78.8],[18.3,78.3]],
 [[54.2,62.5],[54.6,65.4],[57.1,72.5],[59.3,77.1],[65.8,80.8],[76.3,82.3],[80,79.2],[79.6,75],[77.1,73.3],[76.3,74.4]],
 [[61.7,64.2],[65.8,68.3],[70,70.4],[79.2,67.5],[87.9,65.4],[94.2,68.3],[96.3,75],[94.2,79.2],[91.3,78.3],[91.9,76.6]],
 [[69.2,56.7],[72.1,60.4],[79.2,60],[83.8,58.3],[85.8,51.7],[86.7,45],[89.6,36.7],[93.3,36.7],[96.3,41.7],[95.8,45.8],[93.3,47.5],[92.4,46.2]],
 [[52,55],[49,57.5],[47,60.5],[47.5,63]],   // tucked under the body
 [[64,52],[68,53],[71,55.5],[70.5,58]]      // tucked under the body
].map(a=>a.map(q=>[q[0]/100,q[1]/100]))};
// a point at fraction f of the way along a traced arm (by length)
function armAt(a,f){
 if(!a.L){a.L=[0];for(let i=1;i<a.length;i++)a.L.push(a.L[i-1]+Math.hypot(a[i][0]-a[i-1][0],a[i][1]-a[i-1][1]))}
 const d=f*a.L[a.L.length-1];let i=1;while(i<a.length-1&&a.L[i]<d)i++;
 const u=(d-a.L[i-1])/((a.L[i]-a.L[i-1])||1);return[a[i-1][0]+(a[i][0]-a[i-1][0])*u,a[i-1][1]+(a[i][1]-a[i-1][1])*u];
}
let lq=0,glowB=0;
const logoImg=aboutPic&&aboutPic.querySelector('img');
function logoAnchor(){ // the picture itself (the frame is tilted 2deg, so take its centre and unrotated size)
 const b=logoImg.getBoundingClientRect(),T=logoImg.offsetWidth,r={left:b.left+b.width/2-T/2,top:b.top+b.height/2-T/2};
 return{x:r.left+T*LOGO.eye[0]-SR.left,y:r.top+T*LOGO.eye[1]-SR.top,s:LOGO.eyeR*T/(0.6*ppu),T,l:r.left-SR.left,t:r.top-SR.top};
}
// 0: on the shelf (the whole stage still on screen), 1: in the picture (frame a bit below mid-screen)
// 0..1: shelf -> logo picture; 1..2: logo -> perched by the team, arms plugged into the members
function crawlTarget(){
 const B=logoAnchor(),s0=Math.max(0,SR.height-VH),s1=Math.max(s0+200,B.y-VH*0.55),y=-SR.top;
 if(y<=s1||!teamList)return cl01((y-s0)/(s1-s0));
 const s1b=s1+VH*0.3,s2=Math.max(s1b+200,perch().gy-VH*0.55); // he rests in the logo for a while first
 if(y<=s2||!dock||dock.hidden)return y<=s1b?1:1+cl01((y-s1b)/(s2-s1b));
 // 2..3: plugged into the team for a while, then carries the free-spot card down into the join form
 const s2b=s2+VH*0.25,d=dock.getBoundingClientRect(),s3=Math.max(s2b+200,d.top-SR.top+d.height/2-VH*0.5);
 return y<=s2b?2:2+cl01((y-s2b)/(s3-s2b));
}
/* ---------- About -> Team: he climbs out of the logo, crawls to the team and plugs an arm into each member ---------- */
const teamList=document.getElementById('teamList');
// where he sits: in the free space to the right of the "Team" heading
const teamH=document.querySelector('#team h2');
function perch(){
 const g=teamList.getBoundingClientRect(),h=teamH.getBoundingClientRect(),l=g.left-SR.left,t=g.top-SR.top,hy=h.top+h.height/2-SR.top;
 return W<700?{x:l+g.width-48,y:hy,s:sc*0.8,gy:t+g.height*0.5}
             :{x:l+g.width*0.62,y:hy+10,s:sc*0.7,gy:t+g.height*0.5};
}
// The cable an arm lays to a member's avatar, kept off the text: from the body down to the gap above the
// first row of cards (via the right margin on phones), along that gap, down the left margin for lower
// rows, then into the avatar. Corners are rounded.
function cableRoute(i,r0){
 const cards=members(),c=cards[i],a=avatarAt(i);if(!c||!a)return null;
 const g=teamList.getBoundingClientRect(),gl=g.left-SR.left-8,gr=g.right-SR.left+7,cr=c.getBoundingClientRect();
 const y0=cards[0].getBoundingClientRect().top-SR.top-12,ct=cr.top-SR.top,row0=ct<=y0+20,o=(i%3)*3;
 let pts;
 if(W<700)pts=[[r0.x,r0.y],[gr-o,r0.y+14],[gr-o,y0-o],[gl+o,y0-o],[gl+o,a.y],[a.x,a.y]];
 else if(row0)pts=[[r0.x,r0.y],[r0.x,y0-o],[a.x,y0-o],[a.x,a.y]];
 else pts=[[r0.x,r0.y],[r0.x,y0-o],[gl+o,y0-o],[gl+o,ct-8],[a.x,ct-8],[a.x,a.y]];
 for(let k=0;k<3;k++){const q=[pts[0]];for(let j=0;j<pts.length-1;j++){const A=pts[j],B=pts[j+1];
  q.push([A[0]*0.75+B[0]*0.25,A[1]*0.75+B[1]*0.25],[A[0]*0.25+B[0]*0.75,A[1]*0.25+B[1]*0.75])}q.push(pts[pts.length-1]);pts=q}
 return pts;
}
const sm=u=>{u=cl01(u);return u*u*(3-2*u)};
const members=()=>teamList.querySelectorAll('.member:not(.ghost)');
function avatarAt(i){const m=members()[i],a=m&&m.querySelector('.av');if(!a)return null;const r=a.getBoundingClientRect();return{x:r.left+r.width/2-SR.left,y:r.top+r.height/2-SR.top}}
/* ---------- Team -> Join: he unplugs, carries the "free spot" card down and docks it in the form ---------- */
const dock=document.getElementById('dock');let gT={x:0,y:0,r:0};
const ghostEl=()=>document.getElementById('ghost');
// where he sits at the end: right above the dock slot at the top of the form
function perch2(){const d=dock.getBoundingClientRect(),P=perch();return{x:d.left+d.width/2-SR.left,y:d.top-SR.top-1.3*P.s*ppu,s:P.s}}
// the card's path: from its place in the team list into the dock; returns where its top-centre handle is
function placeGhost(){
 const g=ghostEl();if(!g||!dock||dock.hidden||g.classList.contains('joined'))return null;
 const q=cp-2,e=sm((q-0.25)/0.65);
 if(q<=0){if(gT.x||gT.y||gT.r||g.style.width){gT={x:0,y:0,r:0};g.style.transform='';g.style.width='';g.classList.remove('carried','docked')}}
 else{
  // on the way the card widens from its team-list cell to the full width of the form, so it fills in
  // horizontally there; its top-left corner goes onto the slot's top-left corner
  const d=dock.getBoundingClientRect(),wn=(members()[0]||g).offsetWidth;
  g.style.width=(wn+(d.width-wn)*e).toFixed(1)+'px';
  const b=g.getBoundingClientRect(),nl=b.left+b.width/2-gT.x-g.offsetWidth/2,nt=b.top+b.height/2-gT.y-g.offsetHeight/2;
  const dx=(d.left-nl)*e+Math.sin(Math.PI*e)*W*0.05,dy=(d.top-nt)*e,r=Math.sin(Math.PI*e)*6;
  gT={x:dx,y:dy,r};g.style.transform=`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) rotate(${r.toFixed(2)}deg)`;
  if(e>=0.999){const h=g.offsetHeight;if(Math.abs(dock.offsetHeight-h)>1)dock.style.height=h+'px'} // the slot grows with the card
  g.classList.toggle('carried',e>0.001&&e<0.999);g.classList.toggle('docked',e>=0.999);
 }
 const b=g.getBoundingClientRect();return{x:b.left+b.width/2-SR.left,y:b.top+6-SR.top};
}
function updateCrawl(dt,now){
 if(!aboutPic||!GL||RM)return;
 const tg=crawlTarget();
 if(needIntro){ // after the Team curtain the page is below the logo: he is already inside the picture
  if(tg<0.99)return;
  needIntro=false;introDone=true;cp=tg;inT=-1e9;feetFresh=true;
  if(Math.abs(tg-1)<0.015){lq=1;inLogo=true;oct.visible=false;aboutPic.classList.remove('vacant')}else{inLogo=false;oct.visible=true}
 }
 const busy=jobs.length||pull||cjobs.length||curtain||push||!introDone;
 const prev=cp,goal=busy?0:tg;
 cp+=(goal-cp)*Math.min(1,dt*5);if(Math.abs(goal-cp)<0.002)cp=goal;
 crawlV=crawlV*0.85+0.15*Math.abs(cp-prev)/Math.max(dt,1e-3);
 lq=cp<=1?cl01((cp-0.8)/0.18):cl01(1-(cp-1)/0.18);lq=lq*lq*(3-2*lq);
 if(!inLogo&&cp>=0.985&&cp<=1.015){inLogo=true;inT=now;aboutPic.classList.remove('vacant','merge');void aboutPic.offsetWidth;aboutPic.classList.add('merge')}
 else if(inLogo&&(cp<0.95||cp>1.05)){inLogo=false;aboutPic.classList.add('vacant');oct.visible=true}
 if(inLogo&&now-inT>950)oct.visible=false;
 glowB=Math.max(inLogo?Math.max(0,1-(now-inT)/800):lq*0.35,Math.max(0,1-(now-peckT)/260)*0.6,Math.max(0,1-(now-flareT)/1200)*1.2);
 // while crawling he goes over the event cards (at home the cards sit in front of his legs)
 if(!curtain){const z=cp>0.02?'5':'';if(cv.style.zIndex!==z)cv.style.zIndex=z}
 if(joining&&cp<=2.0005)finishJoin();
 if(prev>0&&cp===0){oct.scale.setScalar(sc);onHome()}
}
function crawlPose(now){
 if(cp>2&&dock&&!dock.hidden){ // team -> above the dock in the join form
  const P=perch(),J=perch2(),q=cp-2,e=sm((q-0.2)/0.65),amp=W*0.08;
  const x=P.x+(J.x-P.x)*e+Math.sin(Math.PI*e)*amp,y=P.y+(J.y-P.y)*e,m=Math.sin(Math.PI*e);
  return{x,y:y+Math.sin(now*0.011)*Math.min(1,crawlV*3)*P.s*ppu*0.12,s:P.s,rot:(J.x>P.x?-1:1)*0.25*m,stand:1,pulse:0};
 }
 if(cp>1){ // logo -> perch by the team
  const L=logoAnchor(),P=perch(),q=cp-1,k=q*q*(3-2*q),amp=W*0.12;
  const x=L.x+(P.x-L.x)*q+Math.sin(q*Math.PI*2)*amp,y=L.y+(P.y-L.y)*q;
  const dx=(P.x-L.x)+Math.cos(q*Math.PI*2)*Math.PI*2*amp,dy=P.y-L.y;
  const ang=Math.max(-0.8,Math.min(0.8,Math.atan2(dx,Math.abs(dy)+1))),m=Math.sin(Math.PI*q),s=L.s+(P.s-L.s)*k;
  return{x:x+(L.x-x)*lq,y:y+(L.y-y)*lq+Math.sin(now*0.011)*Math.min(1,crawlV*3)*s*ppu*0.12*(1-lq),s,rot:-ang*m*0.35*(1-lq)+LOGO.lean*lq,stand:1,pulse:0};
 }
 const A=homeAnchor(),B=logoAnchor(),p=cp,k=p*p*(3-2*p),amp=W*0.16;
 const x=A.x+(B.x-A.x)*p+Math.sin(p*Math.PI*2)*amp,y=A.y+(B.y-A.y)*p;
 const dx=(B.x-A.x)+Math.cos(p*Math.PI*2)*Math.PI*2*amp,dy=B.y-A.y;
 const ang=Math.max(-0.8,Math.min(0.8,Math.atan2(dx,Math.abs(dy)+1))),m=Math.sin(Math.PI*p);
 // near the end the wavy path gives way to the exact spot of the drawn eye
 return{x:x+(B.x-x)*lq,y:y+(B.y-y)*lq+Math.sin(now*0.011)*Math.min(1,crawlV*3)*A.s*ppu*0.12*(1-lq),s:A.s+(B.s-A.s)*k,rot:-ang*m*0.35*(1-lq)+LOGO.lean*lq,stand:1,pulse:0};
}
/* ---------- crawling gait: tips grip the page, the body pulls itself along, arms step forward ---------- */
// Each arm has a foothold in page coordinates (so it stays put on the page while you scroll). When the
// body has moved on and a foothold is too far from where that arm should be, the arm lets go and reaches
// forward along the direction of travel. Neighbouring arms never step together; faster crawling means
// more and quicker steps. Standing still, he just holds on with all eight.
const FEET=[185,150,220,115,65,-40,30,-5].map(a=>a*Math.PI/180);
let feet=null,lastBody=null,bodyV={x:0,y:0},feetFresh=false;
function updateFeet(now,dt,bx,by){
 if(!(cp>0.02)||curtain||!oct.visible&&!inLogo){
  if(feet){feet.forEach(f=>{if(f.tn.job===f)f.tn.job=null});feet=null;if(teamList)members().forEach(m=>m.classList.remove('linked'))}
  if(cp<=2)placeGhost();
  return;
 }
 const s=oct.scale.x,R=3.1*s*ppu;
 if(!feet){
  feet=[...TN].sort((a,b)=>a.d.x-b.d.x).map((tn,i)=>{const f={tn,a:FEET[i],x:tn.tipS.x,y:tn.tipS.y,st:null};tn.job=f;return f});
  // give each arm a drawn arm in the same angular order around the eye, so arms never cross
  const ang=a=>{let d=a*180/Math.PI;return d<-90?d+360:d};
  const la=LOGO.arms.map(a=>{const m=a[Math.floor(a.length/2)];return{a,ang:ang(Math.atan2(m[1]-LOGO.eye[1],m[0]-LOGO.eye[0]))}}).sort((x,y)=>x.ang-y.ang);
  [...feet].sort((a,b)=>ang(a.a)-ang(b.a)).forEach((f,i)=>{f.arm=la[i].a;f.logo=f.arm[f.arm.length-1];
   let c=0;f.fr=[0].concat(f.tn.lens.map(l=>c+=l)).map(v=>v/c)}); // where each joint sits along the arm
  assignMembers();
  feetFresh=false;
  lastBody={x:bx,y:by};bodyV={x:0,y:0};
 }
 const id=Math.max(dt,1e-3),k6=Math.min(1,dt*6);
 bodyV.x+=((bx-lastBody.x)/id-bodyV.x)*k6;bodyV.y+=((by-lastBody.y)/id-bodyV.y)*k6;lastBody={x:bx,y:by};
 const sp=Math.hypot(bodyV.x,bodyV.y),dx=sp>2?bodyV.x/sp:0,dy=sp>2?bodyV.y/sp:0,lead=Math.min(1,sp/(R*3))*R*0.55;
 const ideal=f=>({x:bx+Math.cos(f.a)*R+dx*lead,y:by+Math.sin(f.a)*R*0.85+dy*lead});
 let stepping=feet.filter(f=>f.st).length;
 const maxStep=sp>R*4?4:2;
 const q=Math.min(cp,2)-1,unplug=1-sm((cp-2)/0.15);
 for(const f of feet)if(f.mem!=null){f.pw=sm((q-0.6-0.045*f.order)/0.12)*unplug}else f.pw=0;
 const hw=sm((cp-2.05)/0.2),handle=placeGhost();
 for(const f of feet)f.hw=f.hold&&handle?hw:0;
 const ms=members();for(const f of feet)if(f.mem!=null&&ms[f.mem]){const on=f.pw>0.95;
  if(on&&f.mem===celebrate&&!ms[f.mem].classList.contains('linked')){celebrate=-1;flareT=now;confetti(ms[f.mem].querySelector('.av'))}
  ms[f.mem].classList.toggle('linked',on)}
 const cand=feet.filter(f=>!f.st&&f.pw<0.1&&!(f.hw>0.1)).map(f=>{const g=ideal(f);return{f,e:Math.hypot(f.x-g.x,f.y-g.y)}}).sort((a,b)=>b.e-a.e);
 for(const c of cand){
  if(lq>0.3||stepping>=maxStep||c.e<R*0.45)break;
  const i=feet.indexOf(c.f);if((feet[i-1]&&feet[i-1].st)||(feet[i+1]&&feet[i+1].st))continue;
  c.f.st={t0:now,dur:Math.max(130,260-sp*0.08),x0:c.f.x,y0:c.f.y};stepping++;
 }
 for(const f of feet){
  const tn=f.tn;tn.w=Math.min(1,tn.w+dt*4);
  let x=f.x,y=f.y,z=0.35*s;
  if(f.st){ // lift, swing forward in a small arc, plant a bit ahead
   const u=cl01((now-f.st.t0)/f.st.dur),k=ease(u),g=ideal(f);
   x=f.st.x0+(g.x+dx*R*0.25-f.st.x0)*k;y=f.st.y0+(g.y+dy*R*0.25-f.st.y0)*k;
   const ox=x-bx,oy=y-by,ol=Math.hypot(ox,oy)||1,b=Math.sin(Math.PI*u);
   x+=ox/ol*b*R*0.18;y+=oy/ol*b*R*0.18;z+=b*1.4*s;
   if(u>=1){f.x=x;f.y=y;f.st=null}
  }
  if(lq>0){ // reach for the arm curls of the drawing
   const L=logoAnchor(),gx=L.l+L.T*f.logo[0],gy=L.t+L.T*f.logo[1];
   x+=(gx-x)*lq;y+=(gy-y)*lq;
   if(lq>0.5&&!f.st){f.x=gx;f.y=gy}
  }
  if(f.hw>0){x+=(handle.x-x)*f.hw;y+=(handle.y-y)*f.hw;if(f.hw>0.98){f.x=handle.x;f.y=handle.y;f.st=null}}
  if(f.pw>0){ // reach for the member's avatar
   const a=avatarAt(f.mem);
   if(a){x+=(a.x-x)*f.pw;y+=(a.y-y)*f.pw;if(f.pw>0.98){f.x=a.x;f.y=a.y;f.st=null}}
  }
  tn.tgt.copy(toW(x,y,z));
 }
}
// one arm per team member: members in angular order seen from the perch, each takes the free arm
// pointing closest to it; one spare arm (pointing most downwards) carries the free-spot card
function assignMembers(){
 if(!feet||!teamList)return;
 const ang=a=>{let d=a*180/Math.PI;return d<-90?d+360:d},P=perch(),used=new Set();
 feet.forEach(f=>{f.mem=null;f.order=0;f.hold=false});
 [...members()].map((m,i)=>{const a=avatarAt(i);return{i,ang:ang(Math.atan2(a.y-P.y,a.x-P.x))}}).sort((x,y)=>x.ang-y.ang)
  .forEach(m=>{let best=null,bd=1e9;for(const f of feet){if(used.has(f))continue;const d=Math.abs(ang(f.a)-m.ang);if(d<bd){bd=d;best=f}}
   if(best){used.add(best);best.mem=m.i;best.order=m.i}});
 let hb=null,hd=1e9;for(const f of feet){if(used.has(f))continue;const d=Math.abs(ang(f.a)-90);if(d<hd){hd=d;hb=f}}if(hb)hb.hold=true;
}
/* ---------- he watches you fill in the form ---------- */
// The eye turns to the field you are filling in (to the text cursor in text fields), or follows the
// pointer over the form; the head leans the same way; each keystroke gets a little nod and a blink of
// light. With nothing to watch he glances around now and then.
const jform=document.getElementById('jform');let ptr=null,lookA={y:0,x:0},glance={t:0,x:0,y:0};
const mctx=document.createElement('canvas').getContext('2d');
function caretPoint(el){
 const r=el.getBoundingClientRect();let x=r.left+r.width/2,y=r.top+r.height/2;
 if(el.matches('input[type=text],input[type=email],input:not([type])')){
  mctx.font=getComputedStyle(el).font;x=Math.min(r.right-10,r.left+12+mctx.measureText(el.value).width)}
 else if(el.tagName==='TEXTAREA'){const lines=el.value.split('\n'),last=lines[lines.length-1];mctx.font=getComputedStyle(el).font;
  x=Math.min(r.right-10,r.left+12+mctx.measureText(last).width%Math.max(1,r.width-24));y=Math.min(r.bottom-10,r.top+18+(lines.length-1)*22)}
 return{x,y};
}
function updateLook(now,dt){
 if(!eyeG)return;
 let tx=null,ty=null;
 const atForm=cp>2.6&&oct.visible,ae=document.activeElement;
 if(atForm&&ae&&jform.contains(ae)&&ae!==jform&&ae.tagName!=='BUTTON'){const c=caretPoint(ae);tx=c.x;ty=c.y}
 else if(atForm&&ptr&&now-ptr.t<2500){tx=ptr.x;ty=ptr.y}
 let yaw=0,pitch=0;
 if(tx!=null){
  W3.set(0,0,0);eyeG.localToWorld(W3);const e=toS(W3),dx=tx-(e.x+SR.left),dy=ty-(e.y+SR.top);
  yaw=Math.max(-0.7,Math.min(0.7,Math.atan2(dx,420)));pitch=Math.max(-0.6,Math.min(0.6,Math.atan2(dy,420)));
 }else{ // idle glances
  if(now>glance.t){glance={t:now+1800+Math.random()*2600,x:(Math.random()-0.5)*0.7,y:(Math.random()-0.5)*0.4}}
  if(cp>0.02&&!inLogo){yaw=glance.x;pitch=glance.y}
 }
 const k=Math.min(1,dt*9);lookA.y+=(yaw-lookA.y)*k;lookA.x+=(pitch-lookA.x)*k;
 eyeG.rotation.set(lookA.x,lookA.y,0);
 const nod=Math.max(0,1-(now-peckT)/220);
 mg.rotation.z+=-lookA.y*0.18;mg.rotation.x=lookA.x*0.12+nod*0.12;mg.position.y=nod*0.1;
}
if(jform){
 jform.addEventListener('pointermove',e=>{ptr={x:e.clientX,y:e.clientY,t:performance.now()}});
 jform.addEventListener('pointerleave',()=>{ptr=null});
 jform.addEventListener('input',()=>{peckT=performance.now()});
}
/* ---------- after sending the form: he carries your card up into the team ---------- */
let joining=false,celebrate=-1;
function startJoin(){
 const g=ghostEl();if(!g)return;
 if(!GL||RM||!dock||dock.hidden||cp<2.5){finishJoin();return}
 joining=true;flareT=performance.now();
 // scroll up to the team: the octopus carries the card back the way it came
 setTimeout(()=>{const r=teamList.getBoundingClientRect();
  window.scrollTo({top:Math.max(0,r.top+scrollY+r.height/2-innerHeight*0.55),behavior:'smooth'})},450);
}
function finishJoin(){
 joining=false;const g=ghostEl();if(!g)return;
 gT={x:0,y:0,r:0};g.style.transform='';g.style.width='';g.classList.remove('ghost','carried','docked');g.classList.add('joined');
 updateGhost();
 if(feet){assignMembers();celebrate=members().length-1}
 else setTimeout(()=>confetti(g.querySelector('.av')),300);
}
function confetti(el){
 if(!el||RM)return;
 const r=el.getBoundingClientRect(),x0=r.left+r.width/2,y0=r.top+r.height/2,box=document.createElement('div');
 box.className='confetti';document.body.appendChild(box);
 const C=['#5b4cf0','#9a92f7','#e4e2f4','#7c5cff','#b9a6ff'];
 for(let i=0;i<34;i++){
  const s=document.createElement('i'),a=Math.random()*Math.PI*2,d=70+Math.random()*170,w=5+Math.random()*6;
  s.style.cssText=`left:${x0}px;top:${y0}px;width:${w}px;height:${w*0.6}px;background:${C[i%C.length]}`;box.appendChild(s);
  s.animate([{transform:'translate(-50%,-50%) rotate(0deg)',opacity:1},
   {transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d*0.7-40}px) rotate(${Math.random()*540}deg)`,opacity:1,offset:0.55},
   {transform:`translate(${Math.cos(a)*d*1.15}px,${Math.sin(a)*d*0.7+90}px) rotate(${Math.random()*900}deg)`,opacity:0}],
   {duration:1200+Math.random()*500,easing:'cubic-bezier(.2,.7,.4,1)',fill:'forwards'});
 }
 setTimeout(()=>box.remove(),1900);
}
function onHome(){if(teamQ){teamQ=false;pending=null;runTeam();return}if(pending){const p=pending;pending=null;startPull(p)}}
function onIntroDone(){introDone=true;if(teamQ){teamQ=false;pending=null;runTeam();return}if(!dealt)navEv.classList.add('pulse');if(pending){const p=pending;pending=null;startPull(p)}}

let last=performance.now(),tt=0,vis=true;
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min(0.05,(now-last)/1000);last=now;
 SR=stage.getBoundingClientRect();
 updateCrawl(dt,now);
 const idle=!vis&&!jobs.length&&!pull&&!push&&!curtain&&introDone&&(cp===0||(inLogo&&!oct.visible));
 if(idle&&blank)return;blank=idle;
 if(introS===null)introS=now;
 tt+=RM?0:dt;
 // intro: swim in, then stand up
 const it=(now-introS)/1000;let px,py,rot,stand,pulse=0;
 if(curtain){px=homeS.x;py=curtain.base;rot=0;stand=1;oct.scale.setScalar(sc*curtain.cs)}
 else if(cp>0){const d=crawlPose(now);px=d.x;py=d.y;rot=d.rot;stand=d.stand;pulse=d.pulse;oct.scale.setScalar(d.s)}
 else if(RM||it>=SWIM+SET){px=homeS.x;py=homeS.y;rot=0;stand=1;if(!introDone)onIntroDone()}
 else if(it<SWIM){
  const u=it/SWIM,e=cl01(1-Math.pow(1-u,2.4)+0.03*Math.sin(u*Math.PI*6)*(1-u));
  const S0={x:-0.15*W,y:H+80},C0={x:0.2*W,y:OH*0.1},E0=homeS;
  px=(1-e)*(1-e)*S0.x+2*(1-e)*e*C0.x+e*e*E0.x;py=(1-e)*(1-e)*S0.y+2*(1-e)*e*C0.y+e*e*E0.y;
  const tx=2*(1-e)*(C0.x-S0.x)+2*e*(E0.x-C0.x),ty=2*(1-e)*(C0.y-S0.y)+2*e*(E0.y-C0.y);
  rot=Math.atan2(-ty,tx)-Math.PI/2;rot=rot*(1-Math.pow(u,3));rotEnd=rot;
  stand=0;pulse=Math.max(0,Math.sin(it*7.5));
 }else{
  const u=(it-SWIM)/SET;px=homeS.x;py=homeS.y-Math.sin(Math.PI*u)*12;rot=rotEnd*(1-ease(u));stand=outBack(u);
 }
 lift+=(liftT-lift)*Math.min(1,dt*1.8);if(!curtain&&cp===0)py-=lift*OH*0.07;
 poseT+=RM?0:dt*(curtain&&curtain.st===3?3:1);
 // lean toward whatever a tentacle is busy with
 let sx=0,n=0;for(const j of jobs)if(j.st===1||j.st===2){sx+=j.tx;n++}
 for(const j of cjobs)if(j.st===1||j.st===2){sx+=j.tx;n++}
 if(pull){sx+=pull.tx;n++}
 if(push&&push.st<3){sx+=push.tx;n++}
 const dp=n?Math.max(-W*0.22,Math.min(W*0.22,(sx/n-W/2)*0.45)):0;
 drift+=(dp-drift)*Math.min(1,dt*2.2);
 const hw=toW(px+drift,py,0);
 oct.position.set(hw.x,hw.y+(stand>=1&&cp===0?Math.sin(tt*1.1)*0.06*sc:0),0);
 oct.rotation.x=0.3*stand*(1-lq);oct.rotation.z=rot-drift/ppu*0.04;
 mg.rotation.z=Math.sin(tt*0.9)*0.03;updateLook(now,dt);
 oct.updateMatrixWorld(true);
 updatePull(now);updatePush(now);updateJobs(now);updateCollect(now);updateCurtain(now);updateFeet(now,dt,px+drift,py);
 for(const tn of TN){
  poseStand(tn,poseT);
  if(stand<1){poseSwim(tn,tt,pulse);for(let j=0;j<=N;j++)tn.fk[j].lerpVectors(tn.fkW[j],tn.fkS[j],stand)}
  else for(let j=0;j<=N;j++)tn.fk[j].copy(tn.fkS[j]);
  if(!tn.job)tn.w=Math.max(0,tn.w-dt*2.5);
  if(tn.w>0){
   for(let j=0;j<=N;j++)tn.ik[j].copy(tn.fk[j]);
   T2.copy(tn.tgt);oct.worldToLocal(T2);fabrik(tn.ik,T2,tn.lens);
   for(let j=0;j<=N;j++)tn.p[j].lerpVectors(tn.fk[j],tn.ik[j],tn.w);
  }else for(let j=0;j<=N;j++)tn.p[j].copy(tn.fk[j]);
  if(lq>0&&tn.job&&tn.job.arm){ // final pose: every joint goes onto the traced line of its drawn arm
   const f=tn.job,L=logoAnchor(),z=0.2*oct.scale.x;
   for(let j=1;j<=N;j++){const q=armAt(f.arm,f.fr[j]);W3.copy(toW(L.l+L.T*q[0],L.t+L.T*q[1],z));oct.worldToLocal(W3);tn.p[j].lerp(W3,lq)}
  }
  if(tn.job&&tn.job.hw>0){
   const f=tn.job,g=ghostEl();
   if(g){const b=g.getBoundingClientRect(),h={x:b.left+b.width/2-SR.left,y:b.top+6-SR.top};
    W3.copy(tn.root);oct.localToWorld(W3);const r0=toS(W3),z=0.3*oct.scale.x,dl=Math.hypot(h.x-r0.x,h.y-r0.y);
    const cx=(r0.x+h.x)/2+dl*0.12,cy=(r0.y+h.y)/2;
    for(let j=1;j<=N;j++){const u=f.fr[j],v=1-u;W3.copy(toW(v*v*r0.x+2*v*u*cx+u*u*h.x,v*v*r0.y+2*v*u*cy+u*u*h.y,z));oct.worldToLocal(W3);tn.p[j].lerp(W3,f.hw)}}
  }
  if(tn.job&&tn.job.pw>0){
   const f=tn.job,a=avatarAt(f.mem);
   if(a){
    W3.copy(tn.root);oct.localToWorld(W3);const r0=toS(W3),z=0.3*oct.scale.x,route=cableRoute(f.mem,r0);
    if(route)for(let j=1;j<=N;j++){const q=armAt(route,f.fr[j]);W3.copy(toW(q[0],q[1],z));oct.worldToLocal(W3);tn.p[j].lerp(W3,f.pw)}
   }
  }
  W3.copy(tn.p[N]);oct.localToWorld(W3);tn.tipS=toS(W3);
  W3.copy(tn.root);oct.localToWorld(W3);tn.rootS=toS(W3);
  writeTN(tn);
 }
 parts.forEach(q=>q.im.instanceMatrix.needsUpdate=true);tipI.instanceMatrix.needsUpdate=tipLed.instanceMatrix.needsUpdate=true;
 brain.rotation.y=tt*.8;{const pu=.75+.25*Math.sin(tt*2.4);brainGlow.material.opacity=.6+.35*pu;eyeGlow.material.opacity=.45+.3*pu+glowB;eyeGlow.scale.setScalar(1.9*(1+glowB*1.4));brainGlow.material.opacity+=glowB*0.5}
 R.render(scene,cam);
}
try{GL=initGL()}catch(err){console.error(err);GL=false}
if(!GL||RM){
 if(!GL)stage.classList.add('nogl');
 deal('all');introDone=true;
 if(GL){layout();new ResizeObserver(()=>layout()).observe(stage);requestAnimationFrame(frame)}
}else{
 layout();
 new ResizeObserver(()=>layout()).observe(stage);addEventListener('resize',()=>layout());
 if(aboutPic)aboutPic.classList.add('vacant');
 if(dock){dock.hidden=false;sizeDock()}
 new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe(stage);
 render().forEach(c=>c.classList.add('wait'));shint.hidden=false;
 requestAnimationFrame(frame);
}

/* ---------- events UI ---------- */
// Filters: the octopus carries the cards that don't match back into the Events button and the rest
// slide together; cards that come back are pulled out of Events and put on the shelf.
// Tapping the active filter again, or All, brings every card back. Without WebGL or with reduced
// motion the cards just fade out and in.
let fseq=0;
function applyFilter(f){
 if(pull||cjobs.length||curtain)return;
 if(jobs.length||push)skip();
 if(f===filter&&f!=='all')f='all';
 if(f===filter)return;
 filter=f;setPressed(f);
 const seq=++fseq,anim=!RM&&typeof Element.prototype.animate==='function';
 const keep=new Set(list().map(e=>e.id));
 const out=[...track.querySelectorAll('.card')].filter(c=>!keep.has(c.dataset.id));
 if(GL&&!RM&&introDone&&dealt&&cp<0.02){
  const back=()=>{
   const first=new Map([...track.querySelectorAll('.card')].filter(c=>keep.has(c.dataset.id)).map(c=>[c.dataset.id,c.getBoundingClientRect()]));
   const cs=render();track.scrollLeft=0;
   const fresh=cs.filter(c=>!first.has(c.dataset.id));
   fresh.forEach(c=>c.classList.add('wait'));
   cs.forEach(c=>{const a=first.get(c.dataset.id);if(!a)return;const b=c.getBoundingClientRect(),dx=a.left-b.left;
    if(dx)c.animate([{transform:`translateX(${dx}px)`},{transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})});
   if(fresh.length)runSort(fresh,420,rel(navEv));else{bar2.classList.add('on');liftT=1}
  };
  if(out.length)collect(back,out);else back();
  return;
 }
 const relayout=()=>{
  if(seq!==fseq)return;
  const first=new Map([...track.querySelectorAll('.card')].filter(c=>keep.has(c.dataset.id)).map(c=>[c.dataset.id,c.getBoundingClientRect()]));
  const cs=render();track.scrollLeft=0;
  if(!anim)return;
  let k=0;
  cs.forEach(c=>{
   const a=first.get(c.dataset.id),b=c.getBoundingClientRect();
   if(a){const dx=a.left-b.left,dy=a.top-b.top;if(dx||dy)c.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:380,easing:'cubic-bezier(.2,.8,.2,1)'})}
   else c.animate([{opacity:0,transform:'translateY(14px) scale(.92)'},{opacity:1,transform:'none'}],{duration:320,delay:60+k++*45,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});
  });
 };
 if(!anim||!out.length){relayout();return}
 Promise.all(out.map(c=>c.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(14px) scale(.88)'}],{duration:200,easing:'ease-in',fill:'forwards'}).finished)).then(relayout,relayout);
}
chips.addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(b)applyFilter(b.dataset.f)});
const mainChip=navEv;
$('#shuffle').addEventListener('click',()=>startPull(chips.querySelector('[aria-pressed="true"]')||chips.querySelector('[data-f]')));
$('#skip').addEventListener('click',skip);
navEv.addEventListener('click',e=>{e.preventDefault();
 if(window.scrollY>40){window.scrollTo({top:0,behavior:RM?'auto':'smooth'});setTimeout(()=>startPull(navEv),650)}else startPull(navEv)});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:RM?'auto':'smooth'})});
const navTeam=document.querySelector('.links a[href="#team"]');
// Team: the octopus pulls the Team button and closes the curtain. If the page is scrolled a bit
// (short screens, phones) it first scrolls back up to the octopus; during its entrance it waits for it.
function runTeam(){
 if(curtain||(pull&&pull.after))return;
 if(!introDone||cp>0.02){teamQ=true;return}
 if(jobs.length||push||pull||cjobs.length)skip();
 startPull(navTeam,()=>startCurtain());
}
navTeam.addEventListener('click',e=>{
 if(!GL||RM||window.scrollY>stage.offsetHeight*0.6)return; // already down by the team: plain jump
 e.preventDefault();
 if(curtain||(pull&&pull.after)||teamQ)return;
 if(window.scrollY>4){teamQ=true;window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>{teamQ=false;runTeam()},700);return}
 runTeam();
});
const tryRelease=e=>{if(!curtain)return;e.preventDefault();if(curtain.st===3){curtain.h0=curtain.hem;curtain.bb=curtain.base;curtain.st=4;curtain.ts=performance.now()}};
addEventListener('wheel',tryRelease,{passive:false});addEventListener('touchmove',tryRelease,{passive:false});
addEventListener('keydown',e=>{if(curtain&&['ArrowDown','ArrowUp','PageDown','PageUp',' ','End','Home'].includes(e.key))tryRelease(e)});
addEventListener('scroll',()=>{if(needIntro&&window.scrollY<stage.offsetHeight*0.35){needIntro=false;introS=null;introDone=false;oct.visible=true;navEv.classList.remove('pulse')}},{passive:true});
const solid=()=>navEl.classList.toggle('solid',window.scrollY>stage.offsetHeight-90);
window.addEventListener('scroll',solid,{passive:true});solid();
const step=d=>{const c=track.querySelector('.card');track.scrollBy({left:d*((c?c.offsetWidth:250)+16),behavior:'smooth'})};
$('#prev').addEventListener('click',()=>step(-1));$('#next').addEventListener('click',()=>step(1));
track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}});
track.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openDlg(b.dataset.open)});

const dlg=$('#dlg'),db=$('#db');
$('#dx').addEventListener('click',()=>dlg.close());
dlg.addEventListener('close',()=>{dlgId=null});
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
function refreshCard(id){
 skip();const old=track.querySelector(`.card[data-id="${CSS.escape(id)}"]`),e=byId(id);
 if(old&&e){const t=document.createElement('div');t.innerHTML=cardHTML(e);old.replaceWith(t.firstElementChild)}
}
let dlgId=null;
function openDlg(id){
 const e=byId(id);if(!e)return;dlgId=id;
 const d=fd(e.date),t=taken(e),r=S.reg[e.id],full=e.seats-t<=0;
 const facts=[[i18('d.when'),`${d.full}, ${d.time}`],[i18('d.length'),txt(e.dur)],[i18('d.where'),txt(e.where)],[i18('d.places'),full?i18('d.full'):i18('d.placesLeft',{left:e.seats-t,seats:e.seats})]];
 if(e.metric)facts.push([i18('d.metric'),txt(e.metric)]);if(e.data)facts.push([i18('d.data'),txt(e.data)]);if(e.speaker)facts.push([i18('d.speaker'),txt(e.speaker)]);
 if(e.org)facts.push([i18('d.org'),txt(e.org)]);if(e.roles&&e.roles.length)facts.push([i18('d.looking'),e.roles.map(txt).join(', ')]);
 let form='';
 if(r)form=`<p class="ok">${esc(i18('d.youreIn',{n:r.name}))}</p><button class="btn" id="unreg" style="margin-top:10px">${i18('d.cancel')}</button>`;
 else{
  const extra=e.type==='club'?`<div class="row"><div><label for="rl">${i18('d.level')}</label><select id="rl"><option>${i18('lvl.beg')}</option><option>${i18('lvl.mid')}</option><option>${i18('lvl.adv')}</option></select></div><div><label for="rm">${i18('d.taking')}</label><select id="rm"><option>${i18('d.solo')}</option><option>${i18('d.withTeam')}</option><option>${i18('d.match')}</option></select></div></div>`
   :e.type==='community'?`<label for="rm">${i18('d.role')}</label><select id="rm">${(e.roles&&e.roles.length?e.roles:ROLES).map(x=>`<option>${esc(txt(x))}</option>`).join('')}</select>`:'';
  form=`<form id="rform"><div class="row"><div><label for="rn">${i18('d.name')}</label><input id="rn" required maxlength="40"></div><div><label for="re">${i18('d.email')}</label><input id="re" type="email" required maxlength="80"></div></div>${extra}
  <button class="btn pri" type="submit" style="margin-top:16px">${i18(full?'d.waitlist':e.type==='community'?'d.ask':'d.register')}</button></form>`;
 }
 db.innerHTML=`<div class="t-${esc(e.type)}"><span class="tag">${typeName(e.type)}</span></div><h2 style="margin:12px 44px 0 0;font-size:26px">${esc(txt(e.title))}</h2>
 <p class="lead">${esc(txt(e.about))}</p><dl class="facts">${facts.map(f=>`<dt>${f[0]}</dt><dd>${esc(f[1])}</dd>`).join('')}</dl>${form}`;
 const rf=$('#rform');
 if(rf)rf.addEventListener('submit',ev=>{ev.preventDefault();S.reg[e.id]={name:$('#rn').value.trim(),email:$('#re').value.trim(),role:$('#rm')?$('#rm').value:'',level:$('#rl')?$('#rl').value:''};save();refreshCard(e.id);openDlg(e.id)});
 const ur=$('#unreg');if(ur)ur.addEventListener('click',()=>{delete S.reg[e.id];save();refreshCard(e.id);openDlg(e.id)});
 if(!dlg.open)dlg.showModal();
}

/* ---------- team ---------- */
const TEAM=CLUB.team;
const renderTeam=()=>{$('#teamList').innerHTML=TEAM.map(m=>{const n=txt(m.n);return `<div class="member"><div class="av">${esc(n.charAt(0))}</div><div><b>${esc(n)}</b><span>${esc(txt(m.r))}</span></div><p>${esc(txt(m.d))}</p></div>`}).join('')+ghostHTML();gT={x:0,y:0,r:0};updateGhost();sizeDock()};
renderTeam();
// the "free spot" card: the octopus carries it into the join form, and it fills in as you type
function ghostHTML(){return `<div class="member ${S.join?'joined':'ghost'}" id="ghost"><div class="av" id="gAv">?</div><div><b id="gName"></b><span id="gRole"></span></div><p id="gDesc"></p></div>`}
function updateGhost(){
 const g=document.getElementById('ghost');if(!g)return;
 const joined=g.classList.contains('joined'),typed=(($('#jn')||{}).value||'').trim();
 const n=joined?S.join.name:typed,roles=joined?(S.join.help||[]):[...document.querySelectorAll('#jroles input:checked')].map(x=>x.value);
 $('#gAv').textContent=n?n.charAt(0).toUpperCase():'?';$('#gName').textContent=n||i18('ghost.name');
 $('#gRole').textContent=roles.length?roles.join(', '):i18('ghost.role');
 $('#gDesc').textContent=joined||joining?i18('ghost.welcome'):i18('ghost.desc');
 g.classList.toggle('filled',!!n);
 const ds=dock&&dock.querySelector('span');if(ds)ds.textContent=i18(joined?'dock.joined':'dock.label');
 sizeDock();
}
// the slot is as tall as the card will be once it is form-wide (measured off-screen in the same frame)
function sizeDock(){const g=document.getElementById('ghost');if(!dock||!g||dock.hidden||g.classList.contains('docked'))return;
 const w0=g.style.width;g.style.width=dock.clientWidth+'px';const h=g.offsetHeight;g.style.width=w0;dock.style.height=h+'px'}
/* ---------- join ---------- */
const HELP=CLUB.help;
const renderHelp=()=>{const on=[...document.querySelectorAll('#jroles input')].map(x=>x.checked);
 $('#jroles').innerHTML=HELP.map((r,i)=>`<label><input type="checkbox" value="${esc(txt(r))}"${on[i]?' checked':''}>${esc(txt(r))}</label>`).join('')};
renderHelp();
$('#jform').addEventListener('submit',e=>{
 e.preventDefault();const n=$('#jn').value.trim();if(!n)return;
 S.join={name:n,email:$('#je').value.trim(),year:$('#jy').value,level:$('#jl').value,help:[...document.querySelectorAll('#jroles input:checked')].map(x=>x.value),note:$('#jm').value.trim()};save();
 const g=document.getElementById('ghost'),first=g&&!g.classList.contains('joined');
 if(first){ // freeze the card with what was typed, then send it up to the team
  $('#gName').textContent=n;$('#gAv').textContent=n.charAt(0).toUpperCase();
  $('#gRole').textContent=S.join.help.length?S.join.help.join(', '):i18('ghost.role');$('#gDesc').textContent=i18('ghost.welcome');
 }
 e.target.reset();$('#jok').textContent=i18('join.ok',{n});
 if(first)startJoin();else updateGhost();
});
$('#jform').addEventListener('input',()=>{if(!joining)updateGhost()});$('#jform').addEventListener('change',()=>{if(!joining)updateGhost()});
addEventListener('resize',sizeDock);

/* ---------- language switch ---------- */
function applyStatic(){
 document.documentElement.lang=LANG;
 document.querySelectorAll('[data-i18n]').forEach(x=>{x.textContent=i18(x.dataset.i18n)});
 document.querySelectorAll('[data-i18n-html]').forEach(x=>{x.innerHTML=i18(x.dataset.i18nHtml)});
 document.querySelectorAll('[data-i18n-aria]').forEach(x=>x.setAttribute('aria-label',i18(x.dataset.i18nAria)));
 document.querySelectorAll('[data-i18n-alt]').forEach(x=>x.setAttribute('alt',i18(x.dataset.i18nAlt)));
 document.querySelectorAll('[data-i18n-ph]').forEach(x=>x.setAttribute('placeholder',i18(x.dataset.i18nPh)));
}
function setLang(l){
 if(!I[l]||l===LANG||curtain||(pull&&pull.after))return;
 skip();LANG=l;try{localStorage.setItem('cuml-lang',l)}catch(e){}
 applyStatic();
 const cs=render();if(!dealt)cs.forEach(c=>c.classList.add('wait'));
 renderTeam();renderHelp();
 if(curtainEl){curtainEl.remove();curtainEl=null}
 if(dlg.open&&dlgId)openDlg(dlgId);
 $('#jok').textContent='';
}
$('#lang').addEventListener('click',()=>setLang(LANG==='ru'?'en':'ru'));
applyStatic();
}
