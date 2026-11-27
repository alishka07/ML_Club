/* CU ML Club: events shelf with the robot octopus, team, join form.
   Data (events, team, form options) lives in js/data.js.
   Needs three.js r128 (vendor/three.min.js); without WebGL the page falls back to a static picture. */
{
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TYPES={club:'Club hackathon',webinar:'Webinar',community:'Student-run'};
const SAMPLE=CLUB.events;
const ROLES=CLUB.roles;

let S={events:[],reg:{},join:null};
try{const j=JSON.parse(localStorage.getItem('cuml-v1')||'null');if(j&&typeof j==='object')S=Object.assign(S,j)}catch(e){}
const save=()=>{try{localStorage.setItem('cuml-v1',JSON.stringify(S))}catch(e){}};
const all=()=>SAMPLE.concat(S.events);
const byId=id=>all().find(e=>e.id===id);
const fd=iso=>{const d=new Date(iso);return{wd:d.toLocaleDateString('en-GB',{weekday:'short'}),day:d.getDate(),mon:d.toLocaleDateString('en-GB',{month:'short'}),time:d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}),full:d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}};
const taken=e=>Math.min(e.seats,e.taken+(S.reg[e.id]?1:0));
let filter='all';
const track=$('#track'),stage=$('#stage'),fly=$('#fly'),oarea=$('#oarea'),cv=$('#oc');

const cardHTML=e=>{const d=fd(e.date),t=taken(e),inn=!!S.reg[e.id],left=e.seats-t;
 return `<article class="card t-${esc(e.type)}${inn?' in':''}" data-id="${esc(e.id)}">
 <div class="ctop"><span class="tag">${TYPES[e.type]||''}</span><span class="when">${d.time}</span></div>
 <div class="date">${d.wd} ${d.day} ${d.mon}</div>
 <h3>${esc(e.title)}</h3>
 <p class="meta">${esc(e.where)}<br>${esc(e.dur)}</p>
 <div class="seat"><div class="bar"><i style="width:${Math.round(t/e.seats*100)}%"></i></div>${left>0?`${left} of ${e.seats} places left`:'Full, waiting list open'}</div>
 <button class="btn" data-open="${esc(e.id)}">${inn?"You're in":(e.type==='community'?'Ask to join':'Join')}</button></article>`};
const list=()=>all().filter(e=>filter==='all'||e.type===filter).sort((a,b)=>a.date<b.date?-1:1);
function render(){const L=list();track.innerHTML=L.length?L.map(cardHTML).join(''):'<p class="empty">Nothing of this type yet. Run one below.</p>';return[...track.querySelectorAll('.card')]}

/* ---------- robot octopus ---------- */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const chips=$('#chips'),shint=$('#shint'),bar2=$('#bar2'),navEv=$('#navEv'),navEl=document.querySelector('nav.top');
const N=16,K=.42;
let GL=false,R,scene,cam,oct,mg,parts=[],tipI,tipLed,brain,brainGlow,eyeGlow,W=1,H=1,OH=1,ppu=1,sc=1,home=null,homeS={x:0,y:0},drift=0,SR=null,dealt=false;
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
 const eye=new THREE.Group();eye.position.set(0,-.12,1.0);mg.add(eye);
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
function toS(v){P.copy(v).project(cam);return{x:(P.x+1)/2*W,y:(1-P.y)/2*H}}
function toW(x,y,z){P.set(x/W*2-1,-(y/H)*2+1,0.5).unproject(cam);P.sub(cam.position).normalize();const t=(z-cam.position.z)/P.z;return new THREE.Vector3().copy(cam.position).addScaledVector(P,t)}
const ZP=()=>1.4*sc;
function layout(){
 if(!GL)return;
 bar2.style.top=(navEl.offsetHeight+10)+'px';$('#skip').style.top=bar2.style.top;
 const top=bar2.offsetTop+bar2.offsetHeight+14;
 // phones: the nav, filter bar and shelf leave almost no height, so let the stage grow
 // until the octopus can span the screen width (its height is about half its arm span)
 const sw=stage.clientWidth;oarea.style.minHeight=sw<700?Math.round(top+sw*0.505)+'px':'';
 W=stage.clientWidth;H=stage.clientHeight;OH=oarea.offsetHeight;
 R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();cam.updateMatrixWorld();
 ppu=H/(2*16*Math.tan(15*Math.PI/180));
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
let jobs=[],pull=null,backT=null,pending=null,introS=null,introDone=false,rotEnd=0;
const ease=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
const outBack=u=>{const c=1.6,v=u-1;return 1+(c+1)*v*v*v+c*v*v};
const cl01=u=>Math.max(0,Math.min(1,u));
const RE=450,CA=760,RL=350,SWIM=2.6,SET=1.1;
const showSkip=()=>{$('#skip').hidden=!(jobs.length||pull||cjobs.length)};
function place(j,x,y,r,s){j.cl.style.transform=`translate(${(x-j.cw/2).toFixed(1)}px,${(y-14).toFixed(1)}px) rotate(${r.toFixed(1)}deg) scale(${s.toFixed(3)})`}
function setPressed(f){chips.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.f===f)))}
function rel(el){const r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();return{x:r.left-s.left+r.width/2,y:r.top-s.top+r.height/2}}
function skip(){
 if(cjobs.length){finishCollect();return}
 if(pull){pull.chip.style.transform='';pull.tn.job=null;filter=pull.chip.dataset.f;setPressed(filter);pull=null;render();dealt=true}
 jobs.forEach(j=>{j.c.classList.remove('wait');j.cl.remove();if(j.tn)j.tn.job=null});jobs=[];fly.innerHTML='';showSkip();
 if(dealt)bar2.classList.add('on');
}
function deal(f){filter=f;setPressed(f);dealt=true;shint.hidden=true;if(!GL||RM)bar2.classList.add('on');navEv.classList.remove('pulse');const cs=render();if(!GL||RM){cs.forEach(c=>c.classList.remove('wait'))}return cs}
function startPull(chip,after){
 const f=chip.dataset.f;
 if(!GL||RM){if(after)after(null);else deal(f);return}
 if(!introDone){if(!after)pending=chip;return}
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
   const af=pull.after;tn.job=null;pull=null;
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
 if(jobs.length&&done===jobs.length){jobs=[];showSkip();bar2.classList.add('on');liftT=1;backT=setTimeout(()=>track.scrollTo({left:0,behavior:'smooth'}),500)}
}
/* ---------- Team: collect the cards back, pull Team, close the scene ---------- */
function collect(after){
 const cards=[...track.querySelectorAll('.card:not(.wait)')];
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
function onIntroDone(){introDone=true;if(!dealt)navEv.classList.add('pulse');if(pending){const p=pending;pending=null;startPull(p)}}

let last=performance.now(),tt=0,vis=true;
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min(0.05,(now-last)/1000);last=now;
 if(!vis&&!jobs.length&&!pull&&!curtain&&introDone)return;
 if(introS===null)introS=now;
 tt+=RM?0:dt;
 SR=stage.getBoundingClientRect();
 // intro: swim in, then stand up
 const it=(now-introS)/1000;let px,py,rot,stand,pulse=0;
 if(curtain){px=homeS.x;py=curtain.base;rot=0;stand=1;oct.scale.setScalar(sc*curtain.cs)}
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
 lift+=(liftT-lift)*Math.min(1,dt*1.8);if(!curtain)py-=lift*OH*0.07;
 poseT+=RM?0:dt*(curtain&&curtain.st===3?3:1);
 // lean toward whatever a tentacle is busy with
 let sx=0,n=0;for(const j of jobs)if(j.st===1||j.st===2){sx+=j.tx;n++}
 for(const j of cjobs)if(j.st===1||j.st===2){sx+=j.tx;n++}
 if(pull){sx+=pull.tx;n++}
 const dp=n?Math.max(-W*0.22,Math.min(W*0.22,(sx/n-W/2)*0.45)):0;
 drift+=(dp-drift)*Math.min(1,dt*2.2);
 const hw=toW(px+drift,py,0);
 oct.position.set(hw.x,hw.y+(stand>=1?Math.sin(tt*1.1)*0.06*sc:0),0);
 oct.rotation.x=0.3*stand;oct.rotation.z=rot-drift/ppu*0.04;
 mg.rotation.z=Math.sin(tt*0.9)*0.03;
 oct.updateMatrixWorld(true);
 updatePull(now);updateJobs(now);updateCollect(now);updateCurtain(now);
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
  W3.copy(tn.p[N]);oct.localToWorld(W3);tn.tipS=toS(W3);
  W3.copy(tn.root);oct.localToWorld(W3);tn.rootS=toS(W3);
  writeTN(tn);
 }
 parts.forEach(q=>q.im.instanceMatrix.needsUpdate=true);tipI.instanceMatrix.needsUpdate=tipLed.instanceMatrix.needsUpdate=true;
 brain.rotation.y=tt*.8;{const pu=.75+.25*Math.sin(tt*2.4);brainGlow.material.opacity=.6+.35*pu;eyeGlow.material.opacity=.45+.3*pu}
 R.render(scene,cam);
}
try{GL=initGL()}catch(err){console.error(err);GL=false}
if(!GL||RM){
 if(!GL)stage.classList.add('nogl');
 deal('all');introDone=true;
 if(GL){layout();new ResizeObserver(()=>layout()).observe(stage);requestAnimationFrame(frame)}
}else{
 layout();
 new ResizeObserver(()=>layout()).observe(stage);
 new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe(stage);
 render().forEach(c=>c.classList.add('wait'));shint.hidden=false;
 requestAnimationFrame(frame);
}

/* ---------- events UI ---------- */
// Filters only hide the cards that don't match and slide the rest together (no octopus re-deal).
// Tapping the active filter again, or All, brings every card back. Shuffle again still re-deals.
let fseq=0;
function applyFilter(f){
 if(pull||cjobs.length||curtain)return;
 if(jobs.length)skip();
 if(f===filter&&f!=='all')f='all';
 if(f===filter)return;
 filter=f;setPressed(f);
 const seq=++fseq,anim=!RM&&typeof Element.prototype.animate==='function';
 const keep=new Set(list().map(e=>e.id));
 const out=[...track.querySelectorAll('.card')].filter(c=>!keep.has(c.dataset.id));
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
navTeam.addEventListener('click',e=>{
 if(!GL||RM||window.scrollY>40||!introDone||curtain||pull||cjobs.length)return;
 e.preventDefault();if(jobs.length)skip();
 const go=()=>startPull(navTeam,()=>startCurtain());
 if(dealt)collect(()=>{dealt=false;shint.hidden=false;navEv.classList.add('pulse');go()});else go();
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
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
function refreshCard(id){
 skip();const old=track.querySelector(`.card[data-id="${CSS.escape(id)}"]`),e=byId(id);
 if(old&&e){const t=document.createElement('div');t.innerHTML=cardHTML(e);old.replaceWith(t.firstElementChild)}
}
function openDlg(id){
 const e=byId(id);if(!e)return;
 const d=fd(e.date),t=taken(e),r=S.reg[e.id],full=e.seats-t<=0;
 const facts=[['When',`${d.full}, ${d.time}`],['Length',e.dur],['Where',e.where],['Places',full?'Full':`${e.seats-t} of ${e.seats} left`]];
 if(e.metric)facts.push(['Metric',e.metric]);if(e.data)facts.push(['Data',e.data]);if(e.speaker)facts.push(['Speaker',e.speaker]);
 if(e.org)facts.push(['Organiser',e.org]);if(e.roles&&e.roles.length)facts.push(['Looking for',e.roles.join(', ')]);
 let form='';
 if(r)form=`<p class="ok">You're in as ${esc(r.name)}.</p><button class="btn" id="unreg" style="margin-top:10px">Cancel my place</button>`;
 else{
  const extra=e.type==='club'?`<div class="row"><div><label for="rl">Level</label><select id="rl"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div><div><label for="rm">Taking part</label><select id="rm"><option>Solo</option><option>With my team</option><option>Match me with a team</option></select></div></div>`
   :e.type==='community'?`<label for="rm">Your role</label><select id="rm">${(e.roles&&e.roles.length?e.roles:ROLES).map(x=>`<option>${esc(x)}</option>`).join('')}</select>`:'';
  form=`<form id="rform"><div class="row"><div><label for="rn">Name</label><input id="rn" required maxlength="40"></div><div><label for="re">Email</label><input id="re" type="email" required maxlength="80"></div></div>${extra}
  <button class="btn pri" type="submit" style="margin-top:16px">${full?'Join waiting list':e.type==='community'?'Ask to join':'Register'}</button></form>`;
 }
 db.innerHTML=`<div class="t-${esc(e.type)}"><span class="tag">${TYPES[e.type]||''}</span></div><h2 style="margin:12px 44px 0 0;font-size:26px">${esc(e.title)}</h2>
 <p class="lead">${esc(e.about||'')}</p><dl class="facts">${facts.map(f=>`<dt>${f[0]}</dt><dd>${esc(f[1])}</dd>`).join('')}</dl>${form}`;
 const rf=$('#rform');
 if(rf)rf.addEventListener('submit',ev=>{ev.preventDefault();S.reg[e.id]={name:$('#rn').value.trim(),email:$('#re').value.trim(),role:$('#rm')?$('#rm').value:'',level:$('#rl')?$('#rl').value:''};save();refreshCard(e.id);openDlg(e.id)});
 const ur=$('#unreg');if(ur)ur.addEventListener('click',()=>{delete S.reg[e.id];save();refreshCard(e.id);openDlg(e.id)});
 if(!dlg.open)dlg.showModal();
}

/* ---------- team ---------- */
const TEAM=CLUB.team;
$('#teamList').innerHTML=TEAM.map(m=>`<div class="member"><div class="av">${esc(m.n.charAt(0))}</div><div><b>${esc(m.n)}</b><span>${esc(m.r)}</span></div><p>${esc(m.d)}</p></div>`).join('');

/* ---------- join ---------- */
const HELP=CLUB.help;
$('#jroles').innerHTML=HELP.map(r=>`<label><input type="checkbox" value="${esc(r)}">${esc(r)}</label>`).join('');
$('#jform').addEventListener('submit',e=>{
 e.preventDefault();const n=$('#jn').value.trim();if(!n)return;
 S.join={name:n,email:$('#je').value.trim(),year:$('#jy').value,level:$('#jl').value,help:[...document.querySelectorAll('#jroles input:checked')].map(x=>x.value),note:$('#jm').value.trim()};save();
 e.target.reset();$('#jok').textContent=`Got it, ${n}. In this prototype your application is saved in this browser only.`;
});
}
