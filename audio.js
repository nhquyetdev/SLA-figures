(function(){
'use strict';

const VOL={bgm:0.65,roll:0.7,rare:0.9};  
const KEY_A='slf_audio';

let cfg={bgm:true,sfx:true};
try{Object.assign(cfg,JSON.parse(localStorage.getItem(KEY_A))||{});}catch(e){}
const saveCfg=()=>{try{localStorage.setItem(KEY_A,JSON.stringify(cfg));}catch(e){}};

const BGM_LIST=['bgm1.mp3','bgm2.mp3','bgm3.mp3','bgm4.mp3','bgm5.mp3'];

const bgm=new Audio();bgm.volume=VOL.bgm;bgm.preload='auto';
const badSongs=new Set();
let curSong=-1;
function nextSong(){
  const ok=BGM_LIST.map((_,i)=>i).filter(i=>!badSongs.has(i));
  if(!ok.length)return false;
  const choices=ok.length>1?ok.filter(i=>i!==curSong):ok;
  curSong=choices[Math.floor(Math.random()*choices.length)];
  bgm.src='audio/'+BGM_LIST[curSong];
  return true;
}
bgm.addEventListener('ended',()=>{if(nextSong())playBgm();});
bgm.addEventListener('error',()=>{
  if(curSong>=0)badSongs.add(curSong);
  if(nextSong()&&cfg.bgm)playBgm();
});
nextSong();
const pool={roll:[],rare:[]};
function sfx(name){
  if(!cfg.sfx)return;
  let a=pool[name].find(x=>x.paused||x.ended);   
  if(!a){
    if(pool[name].length>=4)a=pool[name][0];
    else{a=new Audio(`audio/${name}.mp3`);a.volume=VOL[name];pool[name].push(a);}
  }
  try{a.currentTime=0;}catch(e){}
  a.play().catch(()=>{});
}
let unlocked=false;
function playBgm(){if(cfg.bgm&&!document.hidden)bgm.play().then(()=>{unlocked=true;}).catch(()=>{});}
function stopBgm(){bgm.pause();}


document.addEventListener('pointerdown',()=>{if(!unlocked)playBgm();},{passive:true});
document.addEventListener('visibilitychange',()=>{document.hidden?stopBgm():playBgm();});

const css=`.abtns{display:flex;gap:12px}
.abtn{flex:1;font-size:22px!important;padding:14px!important}
.abtn.off{opacity:.55;text-decoration:line-through}`;
const st_=document.createElement('style');st_.textContent=css;document.head.appendChild(st_);

const menuBtns=document.querySelector('.menu-btns');
const row=document.createElement('div');row.className='abtns';
row.innerHTML=`<button class="mbtn abtn" id="aBgm"></button><button class="mbtn abtn" id="aSfx"></button><button class="mbtn abtn" id="aNext" style="flex:0 0 70px" title="Next song">⏭</button>`;
if(menuBtns)menuBtns.appendChild(row);
const bBgm=document.getElementById('aBgm'),bSfx=document.getElementById('aSfx');
function paint(){
  if(!bBgm)return;
  bBgm.textContent=cfg.bgm?'🎵 Music: ON':'🎵 Music: OFF';bBgm.classList.toggle('off',!cfg.bgm);
  bSfx.textContent=cfg.sfx?'🔊 Sound: ON':'🔇 Sound: OFF';bSfx.classList.toggle('off',!cfg.sfx);
}
if(bBgm){
  bBgm.onclick=()=>{cfg.bgm=!cfg.bgm;saveCfg();cfg.bgm?playBgm():stopBgm();paint();};
  bSfx.onclick=()=>{cfg.sfx=!cfg.sfx;saveCfg();paint();if(cfg.sfx)sfx('roll');};
  document.getElementById('aNext').onclick=()=>{if(nextSong()&&cfg.bgm){cfg.bgm=true;playBgm();}};
}
paint();

let lastRolls=null,lastSfx=0;
const _render=render;
render=function(){
  _render();
  const r=(st&&st.rolls)||0;
  const inGame=!document.getElementById('game').classList.contains('hidden');
  if(lastRolls!==null&&r>lastRolls&&r-lastRolls<5&&inGame&&Date.now()-lastSfx>90){sfx('roll');lastSfx=Date.now();}
  lastRolls=r;
};

const _open=openModal;
openModal=function(n){
  _open(n);
  const note=document.getElementById('chooseNote');
  if(n==='notify'||(n==='choose'&&note&&note.textContent.trim()))sfx('rare');
};
const _start=startGame;
startGame=function(){playBgm();return _start.apply(this,arguments);};
})();
