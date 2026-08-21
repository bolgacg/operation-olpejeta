/* OPERATION: OL PEJETA — Level 1 engine. 8-bit, path-drawing, honest physics-lite. */
'use strict';
(function(){
const TS=16, SCALE=2.5;
const M=window.MAP;
const cvs=document.getElementById('game'), ctx=cvs.getContext('2d');
cvs.width=M.W*TS; cvs.height=M.H*TS;
ctx.imageSmoothingEnabled=false;

let ATLAS=window.ATLASDATA||null, SHEET=new Image();
SHEET.src='assets/sheet.png';
let SHEET_OK=false; SHEET.onload=()=>{SHEET_OK=true;};

function spr(name,x,y,cx=true){
  if(!ATLAS) return;
  const a=ATLAS[name]; if(!a) return;
  ctx.drawImage(SHEET,a.x,a.y,a.w,a.h, Math.round(x-(cx?a.w/2:0)), Math.round(y-(cx?a.h/2:0)), a.w,a.h);
}

/* ---------- audio ---------- */
const AC = new (window.AudioContext||window.webkitAudioContext)();
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
};

/* ---------- sound priming (iOS needs a user gesture for TTS + audio) ---------- */
let SOUND=false;
function primeSound(){
  SOUND=true;
  try{ AC.resume(); }catch(e){}
  try{
    const u=new SpeechSynthesisUtterance(' '); u.volume=0; speechSynthesis.speak(u);
  }catch(e){}
  const b=document.getElementById('sound-btn'); if(b) b.style.display='none';
}
document.getElementById('sound-btn').addEventListener('click',()=>{ primeSound(); opsy(lastOpsy||'Sound on. I have been talking this whole time, you know.'); });

/* ---------- OPSY ---------- */
const opsyEl=document.getElementById('opsy');
let opsyTimer=null, lastOpsy='';
function opsy(text, speak=true){
  lastOpsy=text;
  opsyEl.textContent='OPSY: '+text;
  opsyEl.classList.add('show');
  clearTimeout(opsyTimer); opsyTimer=setTimeout(()=>opsyEl.classList.remove('show'), 6500);
  if(speak && SOUND && 'speechSynthesis' in window){
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.rate=1.12; u.pitch=1.6; u.volume=.9;
      speechSynthesis.speak(u);
    }catch(e){}
  }
}

/* ---------- tutorial arrow ---------- */
const arrowEl=document.getElementById('tut-arrow');
function arrowAt(wx,wy){ // world coords -> css
  const r=cvs.getBoundingClientRect();
  arrowEl.style.left=(r.left+scrollX + wx/cvs.width*r.width -14)+'px';
  arrowEl.style.top=(r.top+scrollY + wy/cvs.height*r.height -46)+'px';
  arrowEl.classList.add('show');
}
function arrowOff(){ arrowEl.classList.remove('show'); }

/* ---------- entities ---------- */
const camp={x:(M.camp.pad.x+0.75)*TS, y:(M.camp.pad.y+0.75)*TS};
const drones=[
  {id:'MINI', name:'Mini 4 Pro', sprite:'drone_mini', x:camp.x, y:camp.y, path:[], speed:34,
   batt:100, drain:100/75, state:'home', shadow:2},
];
const herds=[
  {kind:'giraffe', n:4, x:8*TS, y:5.4*TS, vx:0, vy:0, buffer:44, photo:70, scattered:0},
  {kind:'zebra',  n:5, x:28*TS, y:16.5*TS, vx:0, vy:0, buffer:40, photo:66, scattered:0},
];
const rhino={x:33*TS,y:4*TS};
let score=0, photos=0, disturbs=0, lost=0;
let started=false, complete=false, scienceShown=false;
const objectives={giraffe:false, zebra:false, home:false};
function objHud(){
  document.getElementById('objectives').textContent=
    (objectives.giraffe?'☑':'▢')+' GIRAFFES  '+(objectives.zebra?'☑':'▢')+' ZEBRAS  '+(objectives.home?'☑':'▢')+' HOME SAFE';
}
function checkComplete(){
  if(complete) return;
  if(objectives.giraffe && objectives.zebra && objectives.home){
    complete=true; snd.score(); snd.land();
    document.getElementById('complete-lines').innerHTML=
      'Shift score <b>'+Math.max(0,score)+'</b> · photos '+photos+' · animals disturbed '+disturbs+
      (disturbs===0?' — a perfect conservation record.':' — the herds request quieter mornings.');
    document.getElementById('complete').classList.add('show');
    opsy(disturbs===0?'Flawless morning, coordinator. Not one animal looked up. I am telling the professor.':'Assignment complete. Next time we try it without frightening the locals.');
  }
}
let mission={type:'photo', target:0, dwell:0, done:false};

/* ---------- input: draw path ---------- */
let drawing=null;
function evPos(e){
  const r=cvs.getBoundingClientRect();
  const p=e.touches?e.touches[0]:e;
  return {x:(p.clientX-r.left)/r.width*cvs.width, y:(p.clientY-r.top)/r.height*cvs.height};
}
cvs.addEventListener('pointerdown',e=>{
  if(!started) return;
  const p=evPos(e);
  for(const d of drones){
    if(Math.hypot(d.x-p.x,d.y-p.y)<16){ drawing=d; d.path=[]; if(AC.state==='suspended')AC.resume(); break; }
  }
});
cvs.addEventListener('pointermove',e=>{
  if(!drawing) return;
  const p=evPos(e);
  const last=drawing.path[drawing.path.length-1]||drawing;
  if(Math.hypot(p.x-last.x,p.y-last.y)>6) drawing.path.push({x:p.x,y:p.y});
});
addEventListener('pointerup',()=>{
  if(drawing){
    if(drawing.path.length && drawing.state==='home'){ drawing.state='fly'; snd.takeoff(); tut.next('takeoff'); }
    drawing=null;
  }
});

/* ---------- tutorial script ---------- */
const tut={
  step:0,
  steps:[
    {key:'start',  go(){ opsy('Good morning, coordinator! Drag a line from your drone to fly it.'); arrowAt(camp.x,camp.y-8);} },
    {key:'takeoff',go(){ opsy('Airborne! Fly into the GREEN ring around the giraffes and hold steady. The camera fires itself. Never cross the RED circle.'); arrowAt(herds[0].x,herds[0].y-14);} },
    {key:'photo',  go(){ opsy('Beautiful shot! Now bring it home before the battery runs out.'); arrowAt(camp.x,camp.y-8);} },
    {key:'landed', go(){ opsy('Textbook landing. This is the whole job: fly, observe, disturb nothing, come home.'); arrowOff();} },
  ],
  next(key){
    const s=this.steps[this.step];
    if(s && s.key===key && this.steps[this.step+1]){ this.step++; this.steps[this.step].go(); }
  },
  fire(key){ // jump if matching upcoming
    for(let i=this.step;i<this.steps.length;i++){
      if(this.steps[i].key===key){ this.step=i; this.steps[i].go(); return; }
    }
  }
};

/* ---------- update ---------- */
let last=performance.now();
function update(dt){
  for(const d of drones){
    if(d.state==='fly'){
      d.batt-=d.drain*dt;
      if(d.batt<=25 && !d.warned){ d.warned=true; snd.warn(); opsy('Battery at twenty-five percent. Home is where the charger is!'); }
      if(d.batt<=0){ d.state='down'; lost++; score-=2000; snd.alarm(); opsy('Drone down in the bush. That is minus two thousand. We do not talk about this at dinner.'); updateHud(); continue; }
      const t=d.path[0];
      if(t){
        const dx=t.x-d.x, dy=t.y-d.y, dist=Math.hypot(dx,dy);
        const step=d.speed*dt;
        if(dist<step){ d.path.shift(); } else { d.x+=dx/dist*step; d.y+=dy/dist*step; }
      }
      // landing
      if(!d.path.length && Math.hypot(d.x-camp.x,d.y-camp.y)<14){
        d.state='home'; snd.land(); d.warned=false;
        score+=Math.round(d.batt*2); updateHud();
        if(d.batt>=20 && (photos>0)){ objectives.home=true; objHud(); checkComplete(); }
        tut.fire('landed');
      }
      // herd interactions
      for(const [hi,h] of herds.entries()){
        const dist=Math.hypot(d.x-h.x,d.y-h.y);
        if(dist<h.buffer && h.scattered<=0){
          h.scattered=6; disturbs++; score-=300; snd.alarm();
          opsy('You spooked the '+(h.kind==='giraffe'?'giraffes':'zebras')+'! Minus three hundred. Their therapist bills us.');
          const a=Math.atan2(h.y-d.y,h.x-d.x); h.vx=Math.cos(a)*22; h.vy=Math.sin(a)*22;
          updateHud();
        } else if(dist<h.photo && dist>=h.buffer && h.scattered<=0 && d.state==='fly'){
          if(!scienceShown && !h.shot){
            scienceShown=true;
            document.getElementById('science').classList.add('show');
            opsy('Hold on. Before you go closer, read why that red circle is there. Real research, real zebras, this exact conservancy.');
          }
          h.dwell=(h.dwell||0)+dt;
          if(h.dwell>1.1 && !h.shot){
            h.shot=true; photos++; score+=800; snd.shutter(); snd.score(); flash=0.25;
            if(h.kind==='giraffe'){ objectives.giraffe=true; tut.fire('photo'); }
            if(h.kind==='zebra'){ objectives.zebra=true; opsy('Zebra portfolio complete! The very herd from the noise study, by the way.'); }
            objHud(); updateHud(); checkComplete();
          }
        } else { h.dwell=0; }
      }
    }
    // recharge at home
    if(d.state==='home' && d.batt<100){ d.batt=Math.min(100,d.batt+8*dt); updateHud(); }
  }
  for(const h of herds){
    if(h.scattered>0){ h.scattered-=dt; h.x+=h.vx*dt; h.y+=h.vy*dt; h.vx*=0.95; h.vy*=0.95; }
    else { h.x+=Math.sin(performance.now()/4000+h.y)*0.06; }
    h.x=Math.max(TS*2,Math.min((M.W-2)*TS,h.x)); h.y=Math.max(TS*2,Math.min((M.H-2)*TS,h.y));
  }
  if(flash>0) flash-=dt;
}

/* ---------- render ---------- */
let flash=0;
function tileName(v){ return v===1?'tile_green':v===2?'tile_water':v===3?'tile_dirt':'tile_grass'; }
function render(){
  if(!ATLAS || !SHEET_OK) return;
  for(let j=0;j<M.H;j++) for(let i=0;i<M.W;i++){
    const a=ATLAS[tileName(M.t[j][i])];
    ctx.drawImage(SHEET,a.x,a.y,a.w,a.h,i*TS,j*TS,TS,TS);
  }
  // pad + tents + deco
  spr('pad',camp.x,camp.y);
  for(const [x,y] of M.camp.tents) spr('tent',(x+0.5)*TS,(y+0.5)*TS);
  for(const [x,y,k] of M.deco) spr(k,(x+0.5)*TS,(y+0.5)*TS);
  spr('rhino',rhino.x,rhino.y);
  // herds with buffers
  for(const h of herds){
    if(!h.shot){
      ctx.strokeStyle='rgba(47,125,84,0.5)'; ctx.setLineDash([6,4]); ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.arc(h.x,h.y,h.photo,0,7); ctx.stroke();
    }
    ctx.strokeStyle='rgba(176,58,58,0.6)'; ctx.setLineDash([4,3]); ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.arc(h.x,h.y,h.buffer,0,7); ctx.stroke(); ctx.setLineDash([]);
    if(h.dwell>0 && !h.shot){
      ctx.strokeStyle='#2f7d54'; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.arc(h.x,h.y,h.photo+5,-Math.PI/2,-Math.PI/2+(h.dwell/1.1)*6.283); ctx.stroke();
    }
    for(let k=0;k<h.n;k++){
      const a=k/h.n*6.28+(h.kind==='zebra'?1:0);
      spr(h.kind, h.x+Math.cos(a)*13*(1+(k%2)*0.5), h.y+Math.sin(a)*10*(1+(k%3)*0.4));
    }
  }
  // paths
  for(const d of drones){
    if(d.path.length){
      ctx.strokeStyle='rgba(34,48,63,0.85)'; ctx.setLineDash([2,4]); ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(d.x,d.y);
      for(const p of d.path) ctx.lineTo(p.x,p.y);
      ctx.stroke(); ctx.setLineDash([]);
    }
  }
  // drones
  for(const d of drones){
    if(d.state!=='down'){
      ctx.fillStyle='rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.ellipse(d.x,d.y+7,7,2.6,0,0,7); ctx.fill();
      spr(d.sprite,d.x,d.y);
    } else {
      spr('icon_alert',d.x,d.y);
    }
  }
  if(flash>0){ ctx.fillStyle=`rgba(255,255,240,${flash*2})`; ctx.fillRect(0,0,cvs.width,cvs.height); }
}

/* ---------- HUD ---------- */
function updateHud(){
  document.getElementById('h-score').textContent=String(Math.max(0,score)).padStart(5,'0');
  document.getElementById('h-photos').textContent=photos;
  document.getElementById('h-dist').textContent=disturbs;
  const d=drones[0];
  document.getElementById('h-batt').textContent=Math.max(0,Math.round(d.batt))+'%';
  document.getElementById('h-batt').style.color = d.batt>50?'#7E9E62':(d.batt>25?'#F2A93B':'#B03A3A');
}

/* ---------- loop ---------- */
function loop(now){
  const dt=Math.min(0.05,(now-last)/1000); last=now;
  update(dt); render();
  requestAnimationFrame(loop);
}
updateHud(); objHud();
document.getElementById('briefing').classList.add('show');
document.getElementById('begin-btn').addEventListener('click',()=>{
  primeSound();
  document.getElementById('briefing').classList.remove('show');
  started=true;
  setTimeout(()=>tut.steps[0].go(), 300);
});
document.getElementById('science-btn').addEventListener('click',()=>{
  document.getElementById('science').classList.add('show');
});
for(const b of document.querySelectorAll('.close-btn')) b.addEventListener('click',e=>{
  e.target.closest('#science, #complete').classList.remove('show');
});
requestAnimationFrame(loop);
})();
