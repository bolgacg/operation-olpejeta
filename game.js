/* OPERATION: OL PEJETA — full engine: Level 1 (field morning) + Level 2 (operations desk). */
'use strict';
(function(){
const TS=16;
const M=window.MAP;
const cvs=document.getElementById('game'), ctx=cvs.getContext('2d');
cvs.width=M.W*TS; cvs.height=M.H*TS;
ctx.imageSmoothingEnabled=false;
let ATLAS=window.ATLASDATA||null, SHEET=new Image();
SHEET.src='assets/sheet.png';
let SHEET_OK=false; SHEET.onload=()=>{SHEET_OK=true;};
const $=s=>document.querySelector(s);

function spr(name,x,y){
  const a=ATLAS[name]; if(!a) return;
  ctx.drawImage(SHEET,a.x,a.y,a.w,a.h, Math.round(x-a.w/2), Math.round(y-a.h/2), a.w,a.h);
}

/* ---------- audio ---------- */
const AC=new (window.AudioContext||window.webkitAudioContext)();
function beep(f,d=0.08,type='square',vol=0.04){
  const o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.value=f; g.gain.value=vol;
  o.connect(g); g.connect(AC.destination);
  o.start(); g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d); o.stop(AC.currentTime+d);
}
const snd={
  takeoff:()=>{beep(220,.06);setTimeout(()=>beep(330,.06),60);setTimeout(()=>beep(440,.08),120);},
  shutter:()=>{beep(1200,.03,'sine',.06);setTimeout(()=>beep(900,.04,'sine',.05),40);},
  warn:()=>beep(160,.15,'sawtooth',.05),
  alarm:()=>{beep(700,.1,'square',.06);setTimeout(()=>beep(500,.12,'square',.06),110);},
  land:()=>{beep(440,.06);setTimeout(()=>beep(330,.06),70);setTimeout(()=>beep(220,.1),140);},
  score:()=>{beep(660,.05,'sine',.05);setTimeout(()=>beep(880,.07,'sine',.05),60);},
  refuse:()=>{beep(330,.09,'square',.05);setTimeout(()=>beep(233,.16,'square',.05),100);},
  certify:()=>{beep(523,.06,'sine',.05);setTimeout(()=>beep(659,.06,'sine',.05),70);setTimeout(()=>beep(784,.1,'sine',.05),140);},
  radio:()=>{beep(880,.04,'sine',.03);setTimeout(()=>beep(880,.04,'sine',.03),120);},
};

/* ---------- sound priming ---------- */
let SOUND=false;
function primeSound(){
  SOUND=true;
  try{AC.resume();}catch(e){}
  try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);}catch(e){}
  const b=$('#sound-btn'); if(b) b.style.display='none';
}
$('#sound-btn').addEventListener('click',()=>{primeSound(); if(lastOpsy)opsy(lastOpsy,true,lastVo); else opsy('Sound on. I have been talking this whole time, you know.',true,'sound_on');});

/* ---------- OPSY ---------- */
/* OPSY speaks from pregenerated neural voice lines (assets/vo, see tools/make_vo.py).
   Played through a light radio bandpass. No speechSynthesis — preloaded or silent. */
const VOKEYS=['tut_start','tut_takeoff','tut_photo','tut_landed','science_prompt','zebra_done',
 'rhino_bonus','spooked','batt25','l1_down','l1_flawless','l1_complete_disturbed','sound_on',
 'desk_intro','draw_line','stop_locked','end_on_objective','end_on_pad','refuse_energy',
 'certified','certified_warn','new_request','ranger_priority','tower_logged','cleared',
 'wind_on','wind_off','sector_fine','dual_drone','buffer_hit','l2_down','no_thermal',
 'illuminated','bot_won','matched_machine'];
const VO={}; let voChain=null, voNow=null;
function voGraph(){
  if(voChain) return voChain;
  const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=250;
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3600;
  const g=AC.createGain();g.gain.value=1.15;
  hp.connect(lp);lp.connect(g);g.connect(AC.destination);
  voChain=hp; return hp;
}
function sayVO(key){
  const b=VO[key]; if(!b||!SOUND) return;
  try{
    if(voNow){try{voNow.stop();}catch(e){}}
    const s=AC.createBufferSource(); s.buffer=b; s.connect(voGraph()); s.start(); voNow=s;
  }catch(e){}
}
(function loadVO(){
  if(location.protocol==='file:') return; // dev preview: text only
  let n=0;
  VOKEYS.forEach(k=>fetch('assets/vo/'+k+'.mp3')
    .then(r=>r.ok?r.arrayBuffer():null)
    .then(ab=>ab&&AC.decodeAudioData(ab))
    .then(b=>{if(b){VO[k]=b;if(++n===VOKEYS.length)console.log('VO loaded '+n);}})
    .catch(()=>{}));
})();
const opsyEl=$('#opsy');
let opsyTimer=null, lastOpsy='', lastVo=null;
function opsy(text,speak=true,vo=null){
  lastOpsy=text; lastVo=vo;
  opsyEl.textContent='OPSY: '+text;
  opsyEl.classList.add('show');
  clearTimeout(opsyTimer); opsyTimer=setTimeout(()=>opsyEl.classList.remove('show'),6500);
  if(speak&&SOUND&&vo) sayVO(vo);
}

/* ---------- paper cards ---------- */
const PAPERS={
 noise:{shown:false, el:'#science'},
 energy:{shown:false, title:'WHY THE RESERVE FLOOR EXISTS', quotes:[
   '"[Aerial robot missions] comprise diverse planning and scheduling strategies and often require high autonomy under strict energy budgets."',
   '"We are interested in the energy optimization of motion plans and computations schedules in-flight."'],
   cite:'Seewald, García de Marina, Midtiby & Schultz, "Energy-Aware Planning-Scheduling for Autonomous Aerial Robots", IEEE/RSJ IROS 2022 (arXiv:2207.11056). The gate refuses any plan that cannot come home with 20% battery in reserve.'},
 uspace:{shown:false, title:'WHY TWO PLANS MAY NOT OVERLAP', quotes:[
   'Shared airspace is booked in volumes: every certified operation owns its corridor, and a new plan that intersects an active one is refused until the airspace is clear.'],
   cite:'After Grøntved, Jepsen, Christensen, Jensen & Schultz Lundquist, "Towards Autonomous Multi-UAV U-Space Operation Planning" (2024), and the WildOps coordination tool (G. Maalouf, WildDrone). Paraphrase, not quotation.'},
 airspace:{shown:false, title:'WHY THE TOWER GETS A SAY', quotes:[
   '"…a challenging operational setting due to its elevated airspace risk, with frequent low-flying tourist aircraft, two internal airstrips, and proximity to a military airport."'],
   cite:'Maalouf et al. (with U. P. Schultz Lundquist), "Insights into Safe and Scalable BVLOS UAS Operations from Kenya\'s Ol Pejeta Conservancy", ICUAS 2025. Direct quotation. In the field this coordination ran over airband radio with military ATC, plus ADS-B watch.'},
 gate:{shown:false, title:'WHY THE GATE SPEAKS IN RULES', quotes:[
   'Every refusal you see names the exact rule that fired. Machine-checked safety rules that veto unsafe robot behaviour at runtime are a long-standing line of the professor’s research.'],
   cite:'After Schultz et al., "Rule-based Dynamic Safety Monitoring for Mobile Robots" (2014/2016). Paraphrase, not quotation. Checklist discipline after WildProcedures (Maalouf): in Kenya, iterating these checklists cut pre-flight time from 26 to 13 minutes.'},
};
function paperCard(key){
  const p=PAPERS[key];
  if(!p||p.shown) return; p.shown=true;
  if(p.el){ $(p.el).classList.add('show'); return; }
  const div=document.createElement('div');
  div.className='overlay show';
  div.innerHTML='<div class="card"><div class="bt">'+p.title+'</div>'+
    p.quotes.map(q=>'<p class="quote">'+q+'</p>').join('')+
    '<p class="cite">'+p.cite+'</p><button class="close-btn">GOT IT</button></div>';
  $('.gamebox').appendChild(div);
  div.querySelector('.close-btn').addEventListener('click',()=>div.remove());
}

/* ---------- world ---------- */
const camp={x:(M.camp.pad.x+0.75)*TS, y:(M.camp.pad.y+0.75)*TS};
const pads=M.camp.pads.map(p=>({x:(p[0]+0.75)*TS,y:(p[1]+0.75)*TS}));
function nearestPad(x,y){let b=pads[1],bd=1e9;for(const p of pads){const dd=Math.hypot(p.x-x,p.y-y);if(dd<bd){bd=dd;b=p;}}return {pad:b,dist:bd};}
const station={x:4*TS, y:4*TS}; // research station NW
const DRONES=[
 {id:'M3E', name:'Mavic 3E', sprite:'drone_m3e', speed:30, drainBase:100/110, thermal:false, role:'endurance'},
 {id:'M2T', name:'Mavic 2T', sprite:'drone_m2t', speed:27, drainBase:100/85, thermal:true, role:'thermal'},
 {id:'MINI',name:'Mini 4 Pro',sprite:'drone_mini',speed:36, drainBase:100/70, thermal:false, role:'speed'},
];
let drones=[];
function mkDrone(t,active,i){ const p=pads[i]||pads[1]; return {...t, x:p.x,y:p.y,path:[],batt:100,state:'home',warned:false,op:null,active}; }

const herds=[
 {kind:'giraffe', n:4, x:8*TS, y:5.4*TS, hx:8*TS, hy:5.4*TS, vx:0,vy:0, buffer:44, photo:70, scattered:0, mixed:false},
 {kind:'zebra',  n:5, x:28*TS, y:16.5*TS, hx:28*TS, hy:16.5*TS, vx:0,vy:0, buffer:40, photo:66, scattered:0, mixed:false},
 {kind:'mixed',  n:6, x:19*TS, y:11*TS, hx:19*TS, hy:11*TS, vx:0,vy:0, buffer:56, photo:84, scattered:0, mixed:true},
];
const rhino={x:33*TS,y:4*TS,shot:false,dwell:0,photo:54};
const elephant={x:35*TS, y:3.2*TS, tx:0, ty:0};
let suspect=null;

let mode='L1';
let score=0, photos=0, disturbs=0, lost=0, refusals=0, completedOps=0;
let started=false, complete=false;
const objectives={giraffe:false, zebra:false, home:false};
let flash=0, wind={on:false, mult:1.9};

/* =================================================================== LEVEL 1 */
function objHud(){
  $('#objectives').textContent=(objectives.giraffe?'☑':'▢')+' GIRAFFES  '+(objectives.zebra?'☑':'▢')+' ZEBRAS  '+(objectives.home?'☑':'▢')+' HOME SAFE';
}
function checkComplete(){
  if(complete||mode!=='L1') return;
  if(objectives.giraffe&&objectives.zebra&&objectives.home){
    complete=true; snd.score(); snd.land();
    $('#complete-lines').innerHTML='Shift score <b>'+Math.max(0,score)+'</b> · photos '+photos+' · animals disturbed '+disturbs+
      (disturbs===0?' — a perfect conservation record.':' — the herds request quieter mornings.');
    $('#complete').classList.add('show');
    opsy(disturbs===0?'Flawless morning, coordinator. Not one animal looked up. I am telling the professor.':'Assignment complete. Next time we try it without frightening the locals.',true,disturbs===0?'l1_flawless':'l1_complete_disturbed');
  }
}

/* ---------- input ---------- */
let drawing=null;
function evPos(e){
  const r=cvs.getBoundingClientRect();
  const p=e.touches?e.touches[0]:e;
  return {x:(p.clientX-r.left)/r.width*cvs.width, y:(p.clientY-r.top)/r.height*cvs.height};
}
cvs.addEventListener('pointerdown',e=>{
  arrowOff();
  if(!started) return;
  const p=evPos(e);
  if(mode==='L1'){
    for(const d of drones){
      if(d.active&&Math.hypot(d.x-p.x,d.y-p.y)<16){drawing=d;d.path=[];if(AC.state==='suspended')AC.resume();break;}
    }
    return;
  }
  if(armed){
    const a=armed;
    const from=a.leg==='out'?{x:a.d.x,y:a.d.y}:a.stop;
    if(from&&Math.hypot(from.x-p.x,from.y-p.y)<24){a.pts=[];drawingL2=true;if(AC.state==='suspended')AC.resume();}
  }
});
cvs.addEventListener('pointermove',e=>{
  const p=evPos(e);
  if(drawing){
    const last=drawing.path[drawing.path.length-1]||drawing;
    if(Math.hypot(p.x-last.x,p.y-last.y)>6) drawing.path.push({x:p.x,y:p.y});
  }
  if(drawingL2&&armed){
    const a=armed, last=a.pts[a.pts.length-1]||(a.leg==='out'?{x:a.d.x,y:a.d.y}:a.stop);
    if(Math.hypot(p.x-last.x,p.y-last.y)>6) a.pts.push({x:p.x,y:p.y});
  }
});
addEventListener('pointerup',()=>{
  if(drawing){
    if(drawing.path.length&&drawing.state==='home'){drawing.state='fly';snd.takeoff();tut.next('takeoff');}
    drawing=null;
  }
  if(drawingL2&&armed){
    drawingL2=false;
    const a=armed, pts=a.pts||[];
    a.pts=[];
    if(pts.length){
      const end=pts[pts.length-1];
      if(a.leg==='out'){
        const t=a.m.target;
        if(Math.hypot(end.x-t.x,end.y-t.y)<=a.m.radius){
          a.out=pts; a.stop={x:end.x,y:end.y}; a.leg='home'; snd.radio();
          opsy('Objective locked — that is the stop. Now draw the way home: start at the stop, end on any pad.',true,'stop_locked');
          renderDeck();
        } else opsy('End the outbound line inside the amber ring — that is the objective — then release.',true,'end_on_objective');
      } else {
        const np=nearestPad(end.x,end.y);
        if(np.dist<24){ pts.push({x:np.pad.x,y:np.pad.y}); a.home=pts; launchRoute(); }
        else opsy('End the return line on one of the three highlighted pads.',true,'end_on_pad');
      }
    }
  }
});

/* ---------- tutorial ---------- */
const arrowEl=$('#tut-arrow');
function arrowAt(wx,wy){
  // arrow is positioned inside the gamebox, so use canvas offsets, not page coords
  arrowEl.style.left=(cvs.offsetLeft+wx/cvs.width*cvs.clientWidth-14)+'px';
  arrowEl.style.top=(cvs.offsetTop+wy/cvs.height*cvs.clientHeight-46)+'px';
  arrowEl.classList.add('show');
}
function arrowOff(){arrowEl.classList.remove('show');}
const tut={
  step:0,
  steps:[
    {key:'start',go(){opsy('Good morning, coordinator! Drag a line from your drone to fly it.',true,'tut_start');arrowAt(camp.x,camp.y-8);}},
    {key:'takeoff',go(){opsy('Airborne! Fly into the GREEN ring around the giraffes and hold steady. The camera fires itself. Never cross the RED circle.',true,'tut_takeoff');arrowAt(herds[0].x,herds[0].y-14);}},
    {key:'photo',go(){opsy('Beautiful shot! Now the zebras, then bring it home before the battery runs out.',true,'tut_photo');arrowAt(herds[1].x,herds[1].y-14);}},
    {key:'landed',go(){opsy('Textbook landing. Fly, observe, disturb nothing, come home. That is the whole job.',true,'tut_landed');arrowOff();}},
  ],
  next(key){const s=this.steps[this.step];if(s&&s.key===key&&this.steps[this.step+1]){this.step++;this.steps[this.step].go();}},
  fire(key){for(let i=this.step;i<this.steps.length;i++){if(this.steps[i].key===key){this.step=i;this.steps[i].go();return;}}}
};

/* =================================================================== LEVEL 2 */
const SHIFT={t:9*3600, end:17*3600, rate:96}; // 96 game-seconds per real second: 8h in 5 min
function clockStr(){const h=Math.floor(SHIFT.t/3600),m=Math.floor((SHIFT.t%3600)/60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');}
const sector=M.sector;

const DECK=[
 {id:'OP-01', at:9.2, type:'survey', label:'Survey the NE habitat block', target:{x:33.5*TS,y:4*TS}, radius:46, pts:800, best:'M3E',
  brief:'Ecology wants imagery of the north-east grass block.'},
 {id:'OP-02', at:10.3, type:'track', label:'Track the collared elephant', target:elephant, radius:52, pts:900, best:'M3E',
  brief:'The collared bull is moving. Twenty seconds of continuous observation, from outside his comfort.'},
 {id:'OP-03', at:11.5, type:'sample', label:'Vet sample to the research station', target:station, radius:20, pts:700, best:'MINI',
  brief:'A blood sample must reach the NW research station and the drone must come back. HealthDrone taught the centre this trade.'},
 {id:'OP-04', at:12.6, type:'survey', label:'Survey the waterhole margins', target:{x:19.5*TS,y:17*TS}, radius:42, pts:800, best:'M3E',
  brief:'Mapping the shoreline after the dry weeks.'},
 {id:'OP-05', at:13.8, type:'illuminate', label:'RANGER SUPPORT: suspected poacher', target:{x:31*TS,y:3*TS}, radius:30, pts:1200, best:'M2T', needsThermal:true,
  brief:'Rangers report movement near the rhinos, inside controlled airspace. Thermal aircraft required. Illuminate the area; the rangers do the rest.'},
 {id:'OP-06', at:15.2, type:'track', label:'Track the zebra herd drift', target:herds[1], radius:60, pts:900, best:'M2T',
  brief:'Biology wants the evening drift of the study herd. They are the noise-paper zebras; grant them distance.'},
];
let deck=[], activeOps=[], clearance={state:'none', t:0};
function fmtAt(at){const h=Math.floor(at),mm=Math.round((at-h)*60);return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0');}

function corridorAvail(m){return m.target.x>=22*TS&&m.target.y<=8*TS;}
function corridorFor(m){
  // north-east requests can fly the dirt-track corridor instead of the herd diagonal
  if(corridorAvail(m)&&m.route!=='direct') return [{x:12*TS,y:7*TS},{x:30*TS,y:6*TS}];
  return [];
}
function legsFor(m){
  const pts=[{x:camp.x,y:camp.y},...corridorFor(m),{x:m.target.x,y:m.target.y}];
  const legs=[]; for(let i=0;i<pts.length-1;i++) legs.push([pts[i],pts[i+1]]);
  return legs;
}
function routeLen(d,m){
  return 2*legsFor(m).reduce((a,[p,q])=>a+Math.hypot(q.x-p.x,q.y-p.y),0);
}
function crossesSector(m){
  const t=m.target;
  return t.x>=sector.x0&&t.x<=sector.x1&&t.y>=sector.y0&&t.y<=sector.y1;
}
function segCircle(x1,y1,x2,y2,cx,cy,r){
  const dx=x2-x1,dy=y2-y1;
  const L2=dx*dx+dy*dy||1;
  let t=((cx-x1)*dx+(cy-y1)*dy)/L2; t=Math.max(0,Math.min(1,t));
  return Math.hypot(x1+t*dx-cx, y1+t*dy-cy)<r;
}
function progFor(d,m){
  const lines=['mission '+m.id.toLowerCase()+' {',
   '  aircraft '+d.id+';',
   ...(corridorFor(m).length?['  corridor east_track;']:[]),
   '  goto '+Math.round(m.target.x/TS)+','+Math.round(m.target.y/TS)+';',
   (m.type==='survey'?'  survey r'+Math.round(m.radius/TS)+';':m.type==='track'?'  observe 20s;':m.type==='illuminate'?'  illuminate 6s;':'  deliver sample;'),
   '  rth_failsafe on;','  rtb;  reserve 20%;','}'];
  return lines.join('\n');
}

function renderDeck(){
  const box=$('#deck'); if(!box) return;
  box.innerHTML='';
  for(const m of deck){
    const div=document.createElement('div');
    div.className='mcard'+(m.state==='active'?' active':'')+(m.state==='done'?' done':'');
    let inner='<div class="mid">'+m.id+' · logged '+fmtAt(m.at)+'</div><b>'+m.label+'</b><p>'+m.brief+'</p>';
    if(m.state==='queued'){
      const sug=DRONES.find(x=>x.id===m.best);
      inner+='<div class="sug">OPSY suggests: '+m.best+' — '+sug.role+'</div>';
      if(m.arm){
        inner+='<div class="pend">DRAWING · '+m.arm.d.id+' — '+(m.arm.leg==='out'?'drag from the aircraft, release inside the amber ring':'now draw home to any pad')+'</div><div class="assign"><button data-cancel="'+m.id+'">CANCEL</button></div>';
      } else {
        inner+='<div class="assign">'+drones.filter(d=>d.active&&d.state==='home'&&!d.op).map(d=>
          '<button data-m="'+m.id+'" data-d="'+d.id+'">'+d.id+' · '+d.role+' · <span class="bpct" data-d="'+d.id+'">'+Math.round(d.batt)+'%</span></button>').join('')+
          (crossesSector(m)&&clearance.state==='none'?'<button class="clr" data-clr="1">REQUEST CLEARANCE</button>':'')+
          (clearance.state==='pending'&&crossesSector(m)?'<span class="pend">tower… '+Math.ceil(clearance.t)+'s</span>':'')+
          '</div>';
      }
      inner+='<div class="gate" id="gate-'+m.id+'"></div>';
    }
    if(m.state==='active') inner+='<div class="pend">airborne · '+m.op.d.id+'</div>'+((m.warns&&m.warns.length)?m.warns.map(f=>'<div class="frow warn"><b>'+f.rule+'</b> '+f.text+'</div>').join(''):'');
    if(m.state==='done') inner+='<div class="okd">complete +'+m.pts+'</div>';
    if(m.state==='failedwindow') inner+='<div class="okd" style="color:#B03A3A">window missed</div>';
    div.innerHTML=inner;
    box.appendChild(div);
  }
  box.querySelectorAll('button[data-d]').forEach(b=>b.addEventListener('click',()=>arm(b.dataset.m,b.dataset.d)));
  box.querySelectorAll('button[data-cancel]').forEach(b=>b.addEventListener('click',()=>{
    const m=deck.find(x=>x.id===b.dataset.cancel); if(m){m.arm=null;} armed=null; renderDeck();
  }));
  box.querySelectorAll('button[data-clr]').forEach(b=>b.addEventListener('click',()=>{
    clearance={state:'pending',t:18}; snd.radio();
    opsy('Tower called. Clearance request logged; they answer on their own schedule, like all towers since the dawn of aviation.',true,'tower_logged');
    renderDeck();
  }));
}
let armed=null, drawingL2=false; // {m,d,leg,out,stop,home,pts}
function arm(mid,did){
  const m=deck.find(x=>x.id===mid), d=drones.find(x=>x.id===did);
  if(!m||!d) return;
  if(armed&&armed.m!==m) armed.m.arm=null;
  armed={m,d,leg:'out',out:null,stop:null,home:null,pts:[]};
  m.arm=armed;
  opsy('Drawing '+m.id+' with the '+d.name+': drag a line from the aircraft and release inside the amber objective ring. Then draw the way home to any pad.',true,'draw_line');
  renderDeck();
}
function pathLen(pts,from){let L=0,p=from;for(const q of pts){L+=Math.hypot(q.x-p.x,q.y-p.y);p=q;}return L;}
function dwellFor(m){return m.type==='track'?20:(m.type==='illuminate'?6:(m.type==='survey'?8:4));}
function routeNeeds(d,m,out,home){
  const north=out.concat(home).some(p=>p.y<10*TS);
  const windMult=(wind.on&&north)?wind.mult:1;
  const len=pathLen(out,d)+pathLen(home,out[out.length-1]);
  return (len/d.speed*windMult+dwellFor(m))*d.drainBase;
}
function warningsFor(d,m,out,home){
  const w=[]; const all=[{x:d.x,y:d.y},...out,...home];
  for(const h of herds){
    if(m.target===h) continue;
    let hit=false;
    for(let i=0;i<all.length-1;i++) if(segCircle(all[i].x,all[i].y,all[i+1].x,all[i+1].y,h.x,h.y,h.buffer+6)){hit=true;break;}
    if(hit) w.push({rule:'WILDLIFE BUFFER', text:'This line brushes the '+h.kind+' herd’s noise buffer'+(h.mixed?' (mixed-species: larger by evidence)':'')+' — expect a disturbance, minus 300 (Afridi et al. 2026).', card:'noise'});
  }
  if(clearance.state!=='granted'&&all.some(p=>p.x>=sector.x0&&p.x<=sector.x1&&p.y>=sector.y0&&p.y<=sector.y1))
    w.push({rule:'CONTROLLED AIRSPACE', text:'This line enters the controlled sector without clearance — the tower fines 500 (Maalouf et al. 2025).', card:'airspace'});
  if(m.needsThermal&&!d.thermal)
    w.push({rule:'PAYLOAD', text:'No thermal camera on this aircraft — the rangers will see nothing at the stop and the mission will fail.', card:null});
  return w;
}
function launchRoute(){
  const a=armed; if(!a||!a.out||!a.home) return;
  const m=a.m, d=a.d;
  const need=routeNeeds(d,m,a.out,a.home);
  if(need>d.batt-20){
    refusals++; snd.refuse();
    a.leg='out'; a.out=null; a.home=null; a.stop=null;
    renderDeck();
    const g=$('#gate-'+m.id);
    if(g) g.innerHTML='<div class="ref">REFUSED — ENERGY</div><div class="frow"><b>ENERGY RESERVE</b> This line needs ~'+need.toFixed(0)+'% of a full battery'+(wind.on?' (headwind arithmetic)':'')+'; the aircraft has '+d.batt.toFixed(0)+'% and must land with 20% to spare (Seewald et al. 2022).</div><div class="fix">→ Fix: draw a shorter line, pick a longer-legged aircraft, or let the battery climb on the pad.</div>';
    paperCard('energy'); if(!PAPERS.gate.shown) paperCard('gate');
    opsy('Refused: not enough battery for that line. Energy is the one thing the gate will not negotiate. Draw again.',true,'refuse_energy');
    return;
  }
  const warns=warningsFor(d,m,a.out,a.home);
  m.warns=warns;
  snd.certify(); snd.takeoff();
  m.state='active'; m.arm=null;
  const op={m,d,phase:'out',dwell:0,home:a.home,stop:a.stop};
  m.op=op; d.op=op; d.state='fly';
  d.path=[...a.out];
  activeOps.push(op);
  armed=null;
  if(warns.length){paperCard(warns[0].card);}
  opsy(m.id+' certified: ~'+need.toFixed(0)+'% of battery for the round trip. '+d.name+' is airborne'+(warns.length?' — with warnings on the card.':'.'),true,warns.length?'certified_warn':'certified');
  renderDeck();
}
function updateL2(dt){
  SHIFT.t+=SHIFT.rate*dt;
  $('#h-clock').textContent=clockStr();
  if(clearance.state==='pending'){clearance.t-=dt;if(clearance.t<=0){clearance={state:'granted',t:0};snd.radio();opsy('Airband radio: cleared into the controlled sector. The real campaign coordinated with military ATC exactly this way. Fly it while it is yours.',true,'cleared');renderDeck();}}
  // wind event at 12:00
  if(!wind.announced&&SHIFT.t>12*3600){wind.on=true;wind.announced=true;snd.warn();opsy('Wind advisory: stiff northerly until mid-afternoon. Northern legs now cost nearly double the battery. The Kenya team mapped Route 1 for north winds and Route 2 for south; our gate just recalculates.',true,'wind_on');renderDeck();}
  if(wind.on&&SHIFT.t>14.5*3600){wind.on=false;snd.radio();opsy('Wind advisory lifted. Northern legs are affordable again; the gate has recalculated.',true,'wind_off');renderDeck();}
  // deck arrivals
  for(const m of DECK){
    if(!m.spawned&&SHIFT.t>=m.at*3600){m.spawned=true;m.state='queued';deck.push(m);snd.radio();
      if(m.type==='illuminate'){suspect={x:31*TS,y:3*TS};opsy('Priority from the rangers: possible poacher near the rhinos. Thermal aircraft, controlled airspace, no mistakes.',true,'ranger_priority');}
      else opsy('New request on the desk: '+m.label+'.',true,'new_request');
      renderDeck();}
  }
  // elephant drift
  elephant.x+=Math.sin(SHIFT.t/900)*0.18; elephant.y+=Math.cos(SHIFT.t/1300)*0.12;
  // ops progress
  for(const op of [...activeOps]){
    const d=op.d, m=op.m;
    const windMult=(wind.on&&d.y<10*TS)?wind.mult:1;
    d.batt-=d.drainBase*dt*windMult;
    if(d.batt<=0){d.state='down';lost++;score-=2000;snd.alarm();opsy(d.name+' is down in the bush. Recovery team dispatched. Minus two thousand.',true,'l2_down');activeOps.splice(activeOps.indexOf(op),1);m.state='failedwindow';d.op=null;renderDeck();updateHud();continue;}
    const t=d.path[0];
    if(t){
      const dx=t.x-d.x,dy=t.y-d.y,dist=Math.hypot(dx,dy);
      const step=d.speed*dt;
      if(dist<step){d.path.shift();}else{d.x+=dx/dist*step;d.y+=dy/dist*step;}
    } else if(op.phase==='out'){
      op.dwell+=dt;
      const need=dwellFor(m);
      if(m.type==='track'&&Math.hypot(d.x-m.target.x,d.y-m.target.y)>m.radius){d.path=[{x:m.target.x,y:m.target.y}];}
      if(op.dwell>=need){
        op.phase='home'; d.path=[...op.home];
        if(m.type==='illuminate'){
          if(!d.thermal){op.failed=true;m.state='failedwindow';snd.refuse();opsy('The aircraft reached the stop with no thermal camera. The rangers saw nothing. Window lost.',true,'no_thermal');}
          else{flash=0.3;snd.shutter();opsy('Area illuminated. Rangers moving in. The rhinos never knew we were there.',true,'illuminated');}
        }
      }
    } else if(op.phase==='home'){
      if(!d.path.length&&nearestPad(d.x,d.y).dist<24){
        d.state='home';d.op=null;snd.land();
        activeOps.splice(activeOps.indexOf(op),1);
        if(!op.failed){snd.score();m.state='done';completedOps++;score+=m.pts;}
        updateHud();renderDeck();
        if(deck.every(x=>x.state==='done'||x.state==='failedwindow')&&DECK.every(x=>x.spawned)) endShift();
      }
    }
    // live rule: uncleared entry into the controlled sector costs 500, once per flight
    if(clearance.state!=='granted'&&!op.secPaid&&d.x>=sector.x0&&d.x<=sector.x1&&d.y>=sector.y0&&d.y<=sector.y1){
      op.secPaid=true;score-=500;snd.alarm();paperCard('airspace');updateHud();
      opsy('Tower on the radio, not pleased: uncleared aircraft in the controlled sector. Minus five hundred.',true,'sector_fine');
    }
    // dual-drone + buffer disturbances while airborne
    for(const h of herds){
      const near=drones.filter(x=>x.state==='fly'&&Math.hypot(x.x-h.x,x.y-h.y)<h.photo).length;
      const dd=Math.hypot(d.x-h.x,d.y-h.y);
      if((dd<h.buffer||(near>=2&&dd<h.photo))&&h.scattered<=0){
        h.scattered=6;disturbs++;score-=300;snd.alarm();
        opsy(near>=2?'Two aircraft over one herd. The dual-drone finding was not a suggestion. Minus three hundred.':'Buffer violation at the '+h.kind+' herd. Minus three hundred.',true,near>=2?'dual_drone':'buffer_hit');
        const a=Math.atan2(h.y-d.y,h.x-d.x);h.vx=Math.cos(a)*22;h.vy=Math.sin(a)*22;updateHud();
      }
    }
  }
  // recharge docked
  for(const d of drones){ if(d.state==='home'&&d.batt<100){d.batt=Math.min(100,d.batt+6*dt);} }
  document.querySelectorAll('.bpct').forEach(s=>{const d=drones.find(x=>x.id===s.dataset.d);if(d)s.textContent=Math.round(d.batt)+'%';});
  if(SHIFT.t>=SHIFT.end) endShift();
}

/* ---------- the bot + debrief ---------- */
function botScore(){
  // The autonomy layer: same deck, same rules, continuous replanning (simulated deterministically).
  let s=0, batt={M3E:100,M2T:100,MINI:100};
  for(const m of DECK){
    const bestId=m.best, d=DRONES.find(x=>x.id===bestId);
    const dwell=m.type==='track'?20:(m.type==='illuminate'?6:(m.type==='survey'?8:4));
    // the layer schedules northern legs around the gust window, so no wind multiplier
    const need=(routeLen(d,m)/d.speed+dwell)*d.drainBase;
    batt[bestId]-=need;
    if(batt[bestId]<20){ batt[bestId]=100-need; } // recharged in idle gaps
    s+=m.pts;
  }
  const meanBatt=(batt.M3E+batt.M2T+batt.MINI)/3;
  return {score:Math.round(s+Math.max(0,meanBatt)), completed:DECK.length, disturbs:0, lost:0, eff:Math.round(Math.max(0,meanBatt))};
}
let shiftEnded=false;
function endShift(){
  if(shiftEnded)return; shiftEnded=true;
  const meanBatt=drones.reduce((a,d)=>a+Math.max(0,d.batt),0)/drones.length;
  const you={score:Math.max(0,(score-l2Base)+Math.round(meanBatt)), completed:completedOps, disturbs, lost, eff:Math.round(meanBatt)};
  const bot=botScore();
  const delta=you.score>0?Math.round((bot.score-you.score)/you.score*100):100;
  $('#debrief-table').innerHTML=
   '<tr><th></th><th>YOU</th><th>AUTONOMY LAYER</th></tr>'+
   '<tr><td>missions completed</td><td>'+you.completed+' / '+DECK.length+'</td><td>'+bot.completed+' / '+DECK.length+'</td></tr>'+
   '<tr><td>animals disturbed</td><td>'+you.disturbs+'</td><td>'+bot.disturbs+'</td></tr>'+
   '<tr><td>aircraft lost</td><td>'+you.lost+'</td><td>'+bot.lost+'</td></tr>'+
   '<tr><td>fleet battery at 17:00</td><td>'+you.eff+'%</td><td>'+bot.eff+'%</td></tr>'+
   '<tr class="tot"><td>SHIFT SCORE</td><td>'+you.score+'</td><td>'+bot.score+'</td></tr>';
  $('#debrief-delta').textContent='AUTONOMY DELTA: '+(delta>=0?'+':'')+delta+'%';
  $('#debrief-note').textContent='The autonomy layer flies the same deck under the same gate. Its edge is scheduling: it wastes no time on refused plans, sequences shared airspace, and books northern legs around the gust window. Deterministic simulation, not hindsight. This is the argument for autonomous fleet management, played rather than asserted.';
  $('#debrief').classList.add('show');
  opsy(delta>0?'The autonomy layer beat you by '+delta+' percent. Do not take it personally; it does not take coffee breaks.':'You matched the machine. I am genuinely impressed and slightly suspicious.',true,delta>0?'bot_won':'matched_machine');
}

/* ---------- start L2 ---------- */
let l2Base=0;
function startL2(){
  mode='L2';
  l2Base=score;
  arrowOff();
  drones=[mkDrone(DRONES[0],true,0), mkDrone(DRONES[1],true,1), mkDrone(DRONES[2],true,2)];
  $('#complete').classList.remove('show');
  $('#l2-panel').classList.add('show');
  $('#objectives').style.display='none';
  $('#h-clock').style.display='';
  opsy('Nine o’clock. The desk is yours: three aircraft, three pads, a queue of requests. Pick an aircraft on a card, then draw its route by hand — out to the objective, home to any pad. The gate only argues about batteries; everything else is your judgement.',true,'desk_intro');
  renderDeck();
}

/* =================================================================== shared */
let mission={dwell:0};
function updateL1(dt){
  for(const d of drones){
    if(d.state==='fly'){
      d.batt-=d.drainBase*dt;
      if(d.batt<=25&&!d.warned){d.warned=true;snd.warn();opsy('Battery at twenty-five percent. Home is where the charger is!',true,'batt25');}
      if(d.batt<=0){d.state='down';lost++;score-=2000;snd.alarm();opsy('Drone down in the bush. That is minus two thousand. We do not talk about this at dinner.',true,'l1_down');updateHud();setTimeout(()=>$('#crashed').classList.add('show'),1100);continue;}
      const t=d.path[0];
      if(t){
        const dx=t.x-d.x,dy=t.y-d.y,dist=Math.hypot(dx,dy);
        const step=d.speed*dt;
        if(dist<step){d.path.shift();}else{d.x+=dx/dist*step;d.y+=dy/dist*step;}
      }
      if(!d.path.length&&nearestPad(d.x,d.y).dist<14){
        d.state='home';snd.land();d.warned=false;
        score+=Math.round(d.batt*2);updateHud();
        if(d.batt>=20&&photos>0){objectives.home=true;objHud();checkComplete();}
        tut.fire('landed');
      }
      for(const h of herds){
        if(h.mixed) continue; // mixed herd is a Level 2 citizen
        const dist=Math.hypot(d.x-h.x,d.y-h.y);
        if(dist<h.buffer&&h.scattered<=0){
          h.scattered=6;disturbs++;score-=300;snd.alarm();
          opsy('You spooked the '+(h.kind==='giraffe'?'giraffes':'zebras')+'! Minus three hundred. Their therapist bills us.',true,'spooked');
          const a=Math.atan2(h.y-d.y,h.x-d.x);h.vx=Math.cos(a)*22;h.vy=Math.sin(a)*22;updateHud();
        } else if(dist<h.photo&&dist>=h.buffer&&h.scattered<=0&&d.state==='fly'){
          if(!PAPERS.noise.shown&&!h.shot){
            PAPERS.noise.shown=true;$('#science').classList.add('show');
            opsy('Hold on. Before you go closer, read why that red circle is there. Real research, real zebras, this exact conservancy.',true,'science_prompt');
          }
          h.dwell=(h.dwell||0)+dt;
          if(h.dwell>1.1&&!h.shot){
            h.shot=true;photos++;score+=800;snd.shutter();snd.score();flash=0.25;
            if(h.kind==='giraffe'){objectives.giraffe=true;tut.fire('photo');}
            if(h.kind==='zebra'){objectives.zebra=true;opsy('Zebra portfolio complete! The very herd from the noise study, by the way.',true,'zebra_done');}
            objHud();updateHud();checkComplete();
          }
        } else {h.dwell=0;}
      }
    }
    if(d.state==='home'&&d.batt<100){d.batt=Math.min(100,d.batt+8*dt);updateHud();}
    if(d.state==='fly'&&!rhino.shot){
      const dr=Math.hypot(d.x-rhino.x,d.y-rhino.y);
      if(dr<rhino.photo){
        rhino.dwell+=dt;
        if(rhino.dwell>1.1){rhino.shot=true;photos++;score+=400;snd.shutter();snd.score();flash=0.25;
          opsy('Bonus shot: the rhinos. The rangers will want that one on the wall.',true,'rhino_bonus');updateHud();}
      } else rhino.dwell=0;
    }
  }
}
function updateShared(dt){
  for(const h of herds){
    if(h.scattered>0){h.scattered-=dt;h.x+=h.vx*dt;h.y+=h.vy*dt;h.vx*=0.95;h.vy*=0.95;}
    else{const wx=h.hx+Math.sin(performance.now()/4000+h.hy)*4, wy=h.hy+Math.cos(performance.now()/5200+h.hx)*3;
      h.x+=(wx-h.x)*Math.min(1,1.5*dt); h.y+=(wy-h.y)*Math.min(1,1.5*dt);}
    h.x=Math.max(TS*2,Math.min((M.W-2)*TS,h.x));h.y=Math.max(TS*2,Math.min((M.H-2)*TS,h.y));
  }
  if(flash>0)flash-=dt;
}

/* ---------- render ---------- */
function tileName(v){return v===1?'tile_green':v===2?'tile_water':v===3?'tile_dirt':'tile_grass';}
function render(){
  if(!ATLAS||!SHEET_OK)return;
  for(let j=0;j<M.H;j++)for(let i=0;i<M.W;i++){
    const a=ATLAS[tileName(M.t[j][i])];
    ctx.drawImage(SHEET,a.x,a.y,a.w,a.h,i*TS,j*TS,TS,TS);
  }
  // controlled sector (L2)
  if(mode==='L2'){
    ctx.fillStyle=clearance.state==='granted'?'rgba(47,125,84,0.10)':'rgba(176,58,58,0.10)';
    ctx.fillRect(sector.x0,sector.y0,sector.x1-sector.x0,sector.y1-sector.y0);
    ctx.strokeStyle=clearance.state==='granted'?'rgba(47,125,84,0.6)':'rgba(176,58,58,0.6)';
    ctx.setLineDash([6,4]);ctx.strokeRect(sector.x0,sector.y0,sector.x1-sector.x0,sector.y1-sector.y0);ctx.setLineDash([]);
    ctx.font='7px monospace';ctx.fillStyle='rgba(74,63,38,0.9)';
    ctx.fillText(clearance.state==='granted'?'SECTOR: CLEARED':'CONTROLLED AIRSPACE',sector.x0+6,sector.y1-5);
  }
  for(const p of pads) spr('pad',p.x,p.y);
  for(const [x,y] of M.camp.tents)spr('tent',(x+0.5)*TS,(y+0.5)*TS);
  if(mode==='L2'){spr('tent',station.x,station.y);ctx.font='7px monospace';ctx.fillStyle='rgba(74,63,38,0.9)';ctx.fillText('RESEARCH',station.x-16,station.y+14);}
  ctx.font='7px monospace';ctx.fillStyle='rgba(40,70,95,0.9)';ctx.fillText('EWASO',36*TS+2,11.8*TS);
  for(const [x,y,k] of M.deco)spr(k,(x+0.5)*TS,(y+0.5)*TS);
  spr('rhino',rhino.x,rhino.y);
  if(mode==='L1'&&!rhino.shot){
    ctx.strokeStyle='rgba(47,125,84,0.5)';ctx.setLineDash([6,4]);ctx.lineWidth=1.2;
    ctx.beginPath();ctx.arc(rhino.x,rhino.y,rhino.photo,0,7);ctx.stroke();ctx.setLineDash([]);
    if(rhino.dwell>0){
      ctx.strokeStyle='#2f7d54';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(rhino.x,rhino.y,rhino.photo+5,-Math.PI/2,-Math.PI/2+(rhino.dwell/1.1)*6.283);ctx.stroke();
    }
  }
  if(mode==='L2'){spr('elephant',elephant.x,elephant.y);}
  if(suspect){spr('suspect',suspect.x,suspect.y);
    if(Math.floor(performance.now()/400)%2)spr('icon_alert',suspect.x,suspect.y-14);}
  for(const h of herds){
    if(mode==='L1'&&h.mixed)continue;
    if(!h.shot&&mode==='L1'){
      ctx.strokeStyle='rgba(47,125,84,0.5)';ctx.setLineDash([6,4]);ctx.lineWidth=1.2;
      ctx.beginPath();ctx.arc(h.x,h.y,h.photo,0,7);ctx.stroke();
    }
    ctx.strokeStyle='rgba(176,58,58,0.6)';ctx.setLineDash([4,3]);ctx.lineWidth=1.2;
    ctx.beginPath();ctx.arc(h.x,h.y,h.buffer,0,7);ctx.stroke();ctx.setLineDash([]);
    if(h.dwell>0&&!h.shot&&mode==='L1'){
      ctx.strokeStyle='#2f7d54';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(h.x,h.y,h.photo+5,-Math.PI/2,-Math.PI/2+(h.dwell/1.1)*6.283);ctx.stroke();
    }
    const list=h.mixed?['giraffe','zebra']:[h.kind];
    for(let k=0;k<h.n;k++){
      const a=k/h.n*6.28+(h.kind==='zebra'?1:0);
      spr(list[k%list.length],h.x+Math.cos(a)*14*(1+(k%2)*0.5),h.y+Math.sin(a)*11*(1+(k%3)*0.4));
    }
  }
  // op corridors (L2)
  if(mode==='L2'&&armed){
    const a=armed;
    // show where to release: objective ring on the out leg, pads on the home leg
    if(a.leg==='out'){
      const t=a.m.target, pulse=1+Math.sin(performance.now()/300)*0.05;
      ctx.strokeStyle='#F2A93B';ctx.setLineDash([5,4]);ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(t.x,t.y,a.m.radius*pulse,0,7);ctx.stroke();ctx.setLineDash([]);
      ctx.font='7px monospace';ctx.fillStyle='rgba(138,90,23,0.95)';
      ctx.fillText('RELEASE HERE',t.x-24,Math.max(8,t.y-a.m.radius-5));
    } else {
      for(const p of pads){
        ctx.strokeStyle='#F2A93B';ctx.setLineDash([5,4]);ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(p.x,p.y,13,0,7);ctx.stroke();ctx.setLineDash([]);
      }
    }
    ctx.strokeStyle='rgba(44,74,107,0.55)';ctx.setLineDash([3,3]);ctx.lineWidth=2;ctx.lineJoin='round';
    const segs=[];
    if(a.out) segs.push([{x:a.d.x,y:a.d.y},...a.out]);
    if(a.pts&&a.pts.length) segs.push([(a.leg==='out'?{x:a.d.x,y:a.d.y}:a.stop),...a.pts]);
    for(const s of segs){ctx.beginPath();ctx.moveTo(s[0].x,s[0].y);for(const p of s)ctx.lineTo(p.x,p.y);ctx.stroke();}
    ctx.setLineDash([]);ctx.lineWidth=1;
    if(a.stop){ctx.strokeStyle='#F2A93B';ctx.lineWidth=2;ctx.beginPath();ctx.arc(a.stop.x,a.stop.y,7,0,7);ctx.stroke();ctx.lineWidth=1;}
  }
  for(const d of drones){
    if(d.path.length){
      ctx.strokeStyle='rgba(34,48,63,0.85)';ctx.setLineDash([2,4]);ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(d.x,d.y);
      for(const p of d.path)ctx.lineTo(p.x,p.y);
      ctx.stroke();ctx.setLineDash([]);
    }
  }
  for(const d of drones){
    if(d.state!=='down'){
      ctx.fillStyle='rgba(0,0,0,0.18)';
      ctx.beginPath();ctx.ellipse(d.x,d.y+7,7,2.6,0,0,7);ctx.fill();
      spr(d.sprite,d.x,d.y);
      if(d.state==='fly'){
        const bw=16,bx=d.x-bw/2,by=d.y-13;
        ctx.fillStyle='rgba(40,34,20,0.55)';ctx.fillRect(bx-1,by-1,bw+2,4);
        ctx.fillStyle=d.batt>50?'#7E9E62':(d.batt>25?'#F2A93B':'#B03A3A');
        ctx.fillRect(bx,by,bw*Math.max(0,d.batt)/100,2);
      }
    } else spr('icon_alert',d.x,d.y);
  }
  if(flash>0){ctx.fillStyle='rgba(255,255,240,'+(flash*2)+')';ctx.fillRect(0,0,cvs.width,cvs.height);}
}

/* ---------- HUD ---------- */
function updateHud(){
  $('#h-score').textContent=String(Math.max(0,score)).padStart(5,'0');
  $('#h-photos').textContent=photos;
  $('#h-dist').textContent=disturbs;
  const d=drones[0];
  if(d){$('#h-batt').textContent=Math.max(0,Math.round(d.batt))+'%';
    $('#h-batt').style.color=d.batt>50?'#7E9E62':(d.batt>25?'#F2A93B':'#B03A3A');}
}

/* ---------- loop ---------- */
let last=performance.now();
function loop(now){
  const dt=Math.max(0,Math.min(0.05,(now-last)/1000));last=now;
  const paused=!!document.querySelector('.overlay.show,.overlay-fixed.show,#briefing.show,#science.show,#complete.show');
  if(started&&!shiftEnded&&!paused){
    if(mode==='L1')updateL1(dt); else updateL2(dt);
    updateShared(dt);
  }
  render();
  requestAnimationFrame(loop);
}

/* ---------- boot ---------- */
drones=[mkDrone(DRONES[2],true,1)];   // L1: the Mini only, middle pad
updateHud();objHud();
$('#briefing').classList.add('show');
$('#begin-btn').addEventListener('click',()=>{
  primeSound();
  $('#briefing').classList.remove('show');
  started=true;
  setTimeout(()=>tut.steps[0].go(),300);
});
$('#science-btn').addEventListener('click',()=>{$('#science').classList.add('show');});
document.querySelectorAll('.close-btn').forEach(b=>b.addEventListener('click',e=>{
  const ov=e.target.closest('.overlay, #science, #complete, #debrief');
  if(ov)ov.classList.remove('show');
}));
$('#desk-btn').addEventListener('click',()=>{$('#complete').classList.remove('show');$('#fleet').classList.add('show');});
$('#fleet-btn').addEventListener('click',()=>{$('#fleet').classList.remove('show');startL2();});
$('#restart-btn').addEventListener('click',()=>location.reload());
$('#crash-retry').addEventListener('click',()=>location.reload());
try{const q=new URLSearchParams(location.search);
  if(q.get('l2')){started=true;$('#briefing').classList.remove('show');startL2();SOUND=false;}
  if(q.get('t')){SHIFT.t=parseFloat(q.get('t'))*3600;}
  const simTry=(id,fn)=>{const iv=setInterval(()=>{if(deck.find(x=>x.id===id)){clearInterval(iv);fn();}},250);};
  const inj=(mid,did,out,home)=>{arm(mid,did);armed.out=out;armed.stop=out[out.length-1];armed.leg='home';armed.home=home;launchRoute();};
  if(q.get('sim')==='fly'){simTry('OP-01',()=>{clearance={state:'granted',t:0};
    inj('OP-01','M3E',[{x:176,y:112},{x:480,y:96},{x:536,y:64}],[{x:480,y:96},{x:176,y:112},{x:pads[0].x,y:pads[0].y}]);});}
  if(q.get('sim')==='refuse'){simTry('OP-01',()=>{
    inj('OP-01','MINI',[{x:600,y:300},{x:60,y:280},{x:600,y:200},{x:60,y:150},{x:536,y:64}],[{x:60,y:150},{x:600,y:200},{x:pads[2].x,y:pads[2].y}]);});}
  if(q.get('sim')==='warn'){simTry('OP-01',()=>{
    inj('OP-01','M3E',[{x:400,y:150},{x:536,y:64}],[{x:400,y:150},{x:pads[1].x,y:pads[1].y}]);});}
  if(q.get('sim')==='debrief'){setTimeout(()=>{completedOps=4;score=3400;disturbs=1;endShift();},900);}
  if(q.get('sim')==='tut'){started=true;$('#briefing').classList.remove('show');setTimeout(()=>tut.steps[0].go(),600);}
  if(q.get('sim')==='fleet'){started=true;$('#briefing').classList.remove('show');$('#fleet').classList.add('show');}
  if(q.get('sim')==='crash'){started=true;$('#briefing').classList.remove('show');setTimeout(()=>{const d=drones[0];d.state='fly';d.batt=0.4;d.path=[{x:300,y:200}];},600);}
}catch(e){}
window.onerror=function(msg,src,line){ opsyEl.textContent='ERR: '+msg+' @'+line; opsyEl.classList.add('show'); clearTimeout(opsyTimer); };
requestAnimationFrame(loop);
})();
