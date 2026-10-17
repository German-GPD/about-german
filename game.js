(() => {
  "use strict";
  const canvas = document.getElementById("runnerCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("gameStart");
  const statusEl = document.getElementById("gameStatus");
  const scoreEl = document.getElementById("gameScore");
  const bestEl = document.getElementById("gameBest");
  const muteButton = document.getElementById("gameMute");
  const W = 900, H = 260, ground = 210;
  let running = false, started = false, dead = false, muted = true;
  let player = {x:90,y:ground-38,w:28,h:38,vy:0,duck:false};
  let obstacles = [], particles = [], score = 0, best = 0, speed = 5, spawn = 0, last = 0, raf = 0, audio = null;
  try { best = Number(localStorage.getItem("gpd-pixel-run-best")) || 0; } catch (_) {}
  const fmt = n => String(Math.floor(n)).padStart(5,"0");
  bestEl.textContent = fmt(best);
  const pixel = (x,y,w,h,color) => { ctx.fillStyle=color; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };
  function drawDino(x,y,duck=false) {
    const h=duck?22:38, w=duck?42:28; y = duck ? ground-h : y;
    pixel(x+5,y,duck?28:18,7,"#4fd1c5"); pixel(x+1,y+7,duck?34:24,11,"#4fd1c5");
    pixel(x+8,y+18,duck?23:17,duck?4:12,"#4fd1c5");
    pixel(x+(duck?32:18),y+3,4,4,"#10121a");
    pixel(x+2,y+(duck?18:30),7,8,"#4fd1c5"); pixel(x+17,y+(duck?18:30),7,8,"#4fd1c5");
    pixel(x+(duck?0:0),y+(duck?7:12),6,4,"#8b7bff");
  }
  function drawCactus(o) {
    const c="#ffb84d"; pixel(o.x+o.w*.38,o.y,o.w*.24,o.h,c);
    pixel(o.x,o.y+o.h*.38,o.w*.4,5,c); pixel(o.x,o.y+o.h*.25,5,o.h*.28,c);
    pixel(o.x+o.w*.6,o.y+o.h*.52,o.w*.4,5,c); pixel(o.x+o.w*.75,o.y+o.h*.36,5,o.h*.2,c);
  }
  function drawScene() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#10121a";ctx.fillRect(0,0,W,H);
    for(let i=0;i<36;i++){const x=(i*97+((score*0.25)%W))%W,y=(i*43)%145;pixel(W-x,y,2,2,i%3===0?"#8b7bff":"#2d303e");}
    pixel(0,ground,W,2,"#4fd1c5");
    for(let i=0;i<30;i++){let x=(i*41-(score*1.6)%41+W)%W;pixel(x,ground+12,10,2,"#2d303e");}
    obstacles.forEach(drawCactus);
    drawDino(player.x,player.y,player.duck);
    particles.forEach(p=>pixel(p.x,p.y,3,3,p.color));
    if(!started){ctx.fillStyle="#f2f1ee";ctx.font="12px monospace";ctx.textAlign="center";ctx.fillText("НАЖМИ «НАЧАТЬ» ИЛИ ПРОБЕЛ",W/2,90);}
    if(dead){ctx.fillStyle="#ff5a6e";ctx.font="bold 24px monospace";ctx.textAlign="center";ctx.fillText("ЗАБЕГ ОКОНЧЕН",W/2,90);ctx.fillStyle="#f2f1ee";ctx.font="12px monospace";ctx.fillText("НАЖМИ ПОВТОРИТЬ И ПОПРОБУЙ ЕЩЁ",W/2,116);}
  }
  function reset() {
    running=true;started=true;dead=false;score=0;speed=5;spawn=42;obstacles=[];particles=[];
    player.y=ground-player.h;player.vy=0;player.duck=false;last=performance.now();
    statusEl.textContent="ЗАБЕГ ИДЁТ";startButton.textContent="↻ ЗАНОВО";
    cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
  }
  function jump() {
    if(!started||dead){reset();return;}
    if(!running)return;
    if(player.y>=ground-player.h-1){player.vy=-12.2;burst(player.x+12,ground-5);}
  }
  function burst(x,y){for(let i=0;i<7;i++)particles.push({x,y,vx:(Math.random()-.5)*4,vy:-Math.random()*3,color:i%2?"#8b7bff":"#ffb84d",life:18});}
  function loop(now) {
    if(!running)return;
    const dt=Math.min((now-last)/16.67,2);last=now;
    score+=dt*speed*.08;speed=Math.min(10,5+score/180);spawn-=dt;
    if(spawn<=0){const h=24+Math.random()*24,w=14+Math.random()*10;obstacles.push({x:W+8,y:ground-h,w,h});spawn=48+Math.random()*48-(speed*1.5);}
    player.vy+=.68*dt;player.y+=player.vy*dt;
    if(player.y>ground-player.h){player.y=ground-player.h;player.vy=0;}
    obstacles.forEach(o=>o.x-=speed*dt);obstacles=obstacles.filter(o=>o.x+o.w>-5);
    particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.16*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);
    const px=player.x+4,py=player.y+5,pw=player.w-8,ph=player.h-7;
    if(obstacles.some(o=>px<o.x+o.w-3&&px+pw>o.x+3&&py<o.y+o.h&&py+ph>o.y+3)){finish();return;}
    scoreEl.textContent=fmt(score);drawScene();raf=requestAnimationFrame(loop);
  }
  function finish(){
    running=false;dead=true;started=true;
    const final=Math.floor(score);
    if(final>best){best=final;bestEl.textContent=fmt(best);try{localStorage.setItem("gpd-pixel-run-best",String(best));}catch(_){}}
    statusEl.textContent="РЕКОРД? ЕСТЬ К ЧЕМУ СТРЕМИТЬСЯ";startButton.textContent="↻ ПОВТОРИТЬ";drawScene();
  }
  function sound(){if(muted)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();const osc=audio.createOscillator(),gain=audio.createGain();osc.type="square";osc.frequency.value=560;gain.gain.value=.035;osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.055);}catch(_){}}
  function doJump(){sound();jump();}
  startButton.addEventListener("click",()=>{if(!started||dead)reset();else reset();});
  canvas.addEventListener("pointerdown",e=>{e.preventDefault();doJump();});
  window.addEventListener("keydown",e=>{
    if(["Space","ArrowUp","KeyW"].includes(e.code)&&!e.repeat&&!/INPUT|TEXTAREA|BUTTON/.test(document.activeElement?.tagName||"")){e.preventDefault();doJump();}
  });
  muteButton.addEventListener("click",()=>{muted=!muted;muteButton.textContent=muted?"ЗВУК: ВЫКЛ":"ЗВУК: ВКЛ";muteButton.setAttribute("aria-pressed",String(!muted));if(!muted)sound();});
  drawScene();
})();