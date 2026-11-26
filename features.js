(function(){
'use strict';

const css=`
.cvrow{display:flex;gap:14px;margin-top:8px;align-items:stretch}
.cvrow .convert{margin-top:0!important;flex:1;width:auto!important;padding:10px!important}
.autoBtn{width:270px;white-space:nowrap;font-size:20px!important;border-radius:40px;border:2px solid #5d7cff;background:#1a2560;color:#cfe0ff;font-size:22px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:12px}
.autoBtn b{background:#0d1440;border-radius:30px;padding:6px 16px;font-size:24px}
.autoBtn.on{background:#1f5e3a;border-color:#7dffa8;color:#e9fff0;animation:autoPulse 1s infinite}
.autoBtn.on b{background:#7dffa8;color:#06301a}
@keyframes autoPulse{50%{filter:brightness(1.35)}}
.prefBtn{background:#bcd0ff;color:#1e2a6a;border:2px solid #fff;border-radius:24px;padding:6px 18px;font-size:19px;font-weight:700}
#m-notify,#m-confirm{z-index:12}
.pbox{border:1px solid #3a4a8a;background:#1b2550;padding:18px;text-align:center;font-size:24px;font-weight:600;margin-bottom:18px}
.pgrid{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.psec{font-size:26px;font-weight:700;color:#cfd8ff;border-bottom:2px solid #3a4a8a;padding-bottom:6px;margin:6px 0 16px}
.popts{display:flex;justify-content:space-around;margin-bottom:18px}
.popt{display:flex;align-items:center;gap:12px;background:none;border:none;color:var(--text);font-size:32px;font-weight:800;font-family:Georgia,serif}
.popt .bx{width:40px;height:40px;border:2px solid #8c96c8;background:#2a3050;display:flex;align-items:center;justify-content:center;font-size:28px;font-family:sans-serif}
.popt.on .bx{background:#e8ecff;color:#1e2a6a}
.popt:disabled{opacity:.7;cursor:not-allowed}
.popt:disabled .bx{background:#0f5a55;border-color:#2ee6c8}
.ptypes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
.ptype{display:flex;align-items:center;gap:16px;background:#1e2648;border:none;color:var(--text);padding:12px 18px;font-size:23px;font-weight:700;text-align:left}
.ptype .bx{width:38px;height:38px;border:2px solid #8c96c8;background:#2a3050;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}
.ptype.on .bx{background:#e8ecff;color:#1e2a6a}
.pbtns{display:flex;justify-content:center;gap:30px;margin-top:18px}
.pcancel,.papply{width:280px;padding:14px;font-size:28px;font-weight:800;border-radius:4px}
.pcancel{background:linear-gradient(#cfeaff,#86c4f0);border:2px solid #e8f6ff;color:#1e3050}
.papply{background:linear-gradient(#ffe07a,#e0b22a);border:2px solid #fff1b8;color:#3a2800}
.hitnote{background:linear-gradient(90deg,#5a3a00,#a87a10,#5a3a00);color:#fff6d8;border-radius:10px;padding:12px 16px;margin-bottom:14px;font-size:22px;font-weight:700;text-align:center}
.hitrow{display:flex;align-items:center;gap:14px;margin:10px 0;font-size:22px}
.hitrow .rk{width:58px;height:58px;font-size:34px}
.warn{color:#ffb84d}
.spentline{margin-top:6px;font-size:16px;color:var(--dim);white-space:nowrap}
.spentline b{color:#cfd8ff}
td.spentc{font-size:15px;color:#cfd8ff;white-space:nowrap}
`;
const styleEl=document.createElement('style');styleEl.textContent=css;document.head.appendChild(styleEl);

/* ---------------- MODALS ---------------- */
const stageEl=document.getElementById('stage')||document.body;
stageEl.insertAdjacentHTML('beforeend',`
<div class="modal-bg" id="m-pref"><div class="modal" style="width:1150px">
  <div class="mhead"><h3 style="flex:1;text-align:center">Set Preferred Stats</h3><button class="tbtn" onclick="closeModal('pref')">✕</button></div>
  <div class="pbox">Set your preferred ranks and stat types to receive a notification when the conversion results meet the criteria. Auto-Convert stops when they are met.</div>
  <div class="pgrid">
    <div><div class="psec">Minimum Rank</div><div class="popts" id="pRank"></div></div>
    <div><div class="psec">Minimum Stats</div><div class="popts" id="pCount"></div></div>
  </div>
  <div class="psec">Stat Type</div>
  <div class="ptypes" id="pTypes"></div>
  <div class="small warn" id="pNote"></div>
  <div class="pbtns"><button class="pcancel" onclick="closeModal('pref')">Cancel</button><button class="papply" onclick="SLF.applyPref()">Apply</button></div>
</div></div>

<div class="modal-bg" id="m-notify"><div class="modal" style="width:900px">
  <div class="mhead"><h3 id="nTitle" style="flex:1;text-align:center"></h3></div>
  <div id="nBody"></div>
  <div class="pbtns"><button class="papply" onclick="closeModal('notify')">OK</button></div>
</div></div>

<div class="modal-bg" id="m-confirm"><div class="modal" style="width:820px">
  <div class="mhead"><h3 id="cTitle" style="flex:1;text-align:center"></h3></div>
  <div id="cBody"></div>
  <div class="pbtns"><button class="pcancel" onclick="closeModal('confirm')">Cancel</button><button class="papply" id="cOk">Confirm</button></div>
</div></div>`);

const chooseModal=document.querySelector('#m-choose .modal');
if(chooseModal){const d=document.createElement('div');d.id='chooseNote';chooseModal.insertBefore(d,chooseModal.children[1]||null);}

const convBtn=document.querySelector('.convert');
const autoBtn=document.createElement('button');
autoBtn.className='autoBtn';autoBtn.id='autoBtn';autoBtn.innerHTML='Auto-Convert <b>OFF</b>';
autoBtn.onclick=()=>toggleAuto();
if(convBtn){const row=document.createElement('div');row.className='cvrow';convBtn.parentNode.insertBefore(row,convBtn);row.appendChild(autoBtn);row.appendChild(convBtn);}
const prefBtn=document.createElement('button');
prefBtn.className='prefBtn';prefBtn.id='prefBtn';prefBtn.onclick=()=>openPref();
const fsEl=document.querySelector('.fscore');
if(fsEl)fsEl.parentNode.insertBefore(prefBtn,fsEl);


const SALT='SLF~figures~v2~'+String.fromCharCode(76,105,99,104);
function sign(o){
  const core=JSON.stringify([o.gold,o.polish,o.seal,o.paid,o.rolls||0,o.rs||0,
    o.figs.map(f=>[f.stats.map(s=>s.r+s.s).join(','),f.lock,f.rolls||0])]
    .concat(o.spent?[[o.spent.gold,o.spent.polish,o.spent.seal]]:[]));
  let h=2166136261;const str=SALT+core;
  for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}
  return (h>>>0).toString(36);
}
const SIGNED_FLAG='slf_signed';
function flagGet(){try{return localStorage.getItem(SIGNED_FLAG)==='1';}catch(e){return false;}}
function flagSet(){try{localStorage.setItem(SIGNED_FLAG,'1');}catch(e){}}

const _save=save;
save=function(){if(st&&st.figs)st.h=sign(st);_save();flagSet();};

const _valid=valid;
valid=function(o){
  if(!_valid(o))return false;
  if(o&&o.gold!==undefined&&o.h&&o.h!==sign(o))return false;
  return true;
};

(function checkLocal(){
  const sumRolls=st.figs.reduce((a,f)=>a+(f.rolls||0),0);
  if(st.h){
    if(st.h!==sign(st)){tamperReset();return;}
  }else if(flagGet()){
    tamperReset();return;
  }else{
    if(typeof st.rolls!=='number')st.rolls=sumRolls;
    if(typeof st.rs!=='number')st.rs=sumRolls*3;
  }
  if(!st.pref)st.pref={rank:'S',count:1,types:[]};
  ensureSpent();
  save();
})();
function ensureSpent(){if(st&&!st.spent)st.spent={gold:0,polish:0,seal:0};}
function tamperReset(){
  alert('Your save data was changed outside the game, so it has been reset.');
  st=fresh();st.rolls=0;st.rs=0;st.pref={rank:'S',count:1,types:[]};st.spent={gold:0,polish:0,seal:0};save();
}

function suspicious(v){
  if(typeof v.rs!=='number')return false;
  if(typeof v.rolls==='number'&&v.rs>v.rolls*3)return true;
  let S=0,SA=0;
  v.figs.forEach(f=>f.stats.forEach(s=>{if(s.r==='S')S++;if(s.r==='S'||s.r==='A')SA++;}));
  return S>2+v.rs*0.05||SA>3+v.rs*0.09;
}


function normName(v){return String(v||'').replace(/[.#$\[\]\/\\]/g,'').replace(/\s+/g,' ').trim().slice(0,16);}
async function claimName(n){
  if(!online||!db)return true;
  const key=n.toLowerCase();
  if(st.nameKey===key)return true;
  const ref=db.ref(`${DB_ROOT}/names/${key}`);
  try{
    const cur=(await ref.get()).val();
    if(cur!==null&&cur!==uid)return false;
    if(cur===null){
      const res=await ref.transaction(c=>(c===null||c===uid)?uid:undefined);
      if(!res.committed||res.snapshot.val()!==uid)return false;
    }
    if(st.nameKey&&st.nameKey!==key)db.ref(`${DB_ROOT}/names/${st.nameKey}`).remove().catch(()=>{});
    st.nameKey=key;return true;
  }catch(e){console.warn('claimName',e);return false;}
}
async function ensureName(){
  let base=normName(st.name)||'Hunter';
  if(st.nameKey===base.toLowerCase()&&st.name===base)return;
  let n=base;
  for(let i=0;i<6;i++){
    if(await claimName(n)){st.name=n;return;}
    n=base.slice(0,11)+'_'+Math.floor(1000+Math.random()*9000);
  }
}

let lastPush=0,pushing=false,pushQueued=false;
pushNow=async function(){
  if(!online||!db)return;
  const wait=1200-(Date.now()-lastPush);
  if(pushing||wait>0){
    if(!pushQueued){pushQueued=true;setTimeout(()=>{pushQueued=false;pushNow();},Math.max(wait,400));}
    return;
  }
  pushing=true;
  try{
    await ensureName();
    ensureSpent();st.h=sign(st);
    const s=summary(st),up={};
    up[`${DB_ROOT}/saves/${uid}`]=st;
    up[`${DB_ROOT}/board/${uid}`]={name:st.name,paid:st.paid||0,score:s.score,pass:s.pass,
      rolls:st.rolls||0,rs:st.rs||0,spent:{gold:st.spent.gold,polish:st.spent.polish,seal:st.spent.seal},figs:st.figs.map(f=>({stats:f.stats})),
      updated:firebase.database.ServerValue.TIMESTAMP};
    await db.ref().update(up);
    try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}
    if(typeof setNet==='function')setNet(true,'🟢 Online');
  }catch(e){
    console.error(e);
    if(typeof setNet==='function')setNet(false,'Save failed — '+(e.code||e.message));
  }finally{lastPush=Date.now();pushing=false;}
};


startGame=async function(){
  if(typeof goLandscape==='function')goLandscape();
  if(!st.named){
    let n=normName(prompt('Enter your Hunter name (max 16):',st.name));
    while(n&&!(await claimName(n))){
      const again=prompt(`"${n}" is already taken. Choose another name:`,n.slice(0,15)+'1');
      if(again===null){n='';break;}
      n=normName(again);
    }
    if(n)st.name=n;
    st.named=true;save();
  }
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  render();
};
setName=async function(v){
  const n=normName(v);
  if(!n){$('nameIn').value=st.name;return;}
  if(n!==st.name){
    if(!(await claimName(n))){alert(`"${n}" is already taken.`);$('nameIn').value=st.name;return;}
    st.name=n;
  }
  st.named=true;save();await pushNow();openBoard();
};

openBoard=async function(){
  $('nameIn').value=st.name;
  if(online){
    $('boardBody').innerHTML='<tr><td colspan="6">Loading…</td></tr>';$('boardDetail').innerHTML='';openModal('board');
    try{
      await pushNow();
      const snap=await db.ref(`${DB_ROOT}/board`).orderByChild('score').limitToLast(100).get();
      const rows=[];
      snap.forEach(c=>{
        const v=c.val();if(!_valid(v))return;
        const me=c.key===uid,sus=suspicious(v);
        if(sus&&!me)return;
        rows.push({...summary({name:v.name||'Hunter',paid:v.paid,figs:v.figs}),spent:me?st.spent:v.spent,me:me?1:0,sus});
      });
      if(!rows.some(r=>r.me))rows.push({...summary(st),spent:st.spent,me:1});
      boardRows=rows.sort((a,b)=>b.score-a.score);
    }catch(e){$('boardBody').innerHTML=`<tr><td colspan="6">Could not load: ${esc(e.code||e.message)}</td></tr>`;return;}
  }else{
    if(!BOTS)makeBots();
    boardRows=[...BOTS.map(summary),{...summary(st),spent:st.spent,me:1}].sort((a,b)=>b.score-a.score);
  }
  $('boardBody').innerHTML=boardRows.map((r,i)=>
    `<tr class="clk ${r.me?'me':''}" onclick="detail(${i})"><td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td><td>${r.me?'⭐ ':''}${esc(r.name)}${r.sus?' <span class="warn">⚠️ hidden (unusual stats)</span>':''}</td><td><b>${fmt(r.score)}</b></td><td>${r.pass}/5</td><td>${r.best}</td><td>$${fmt(r.paid)}</td><td class="spentc">${spentShort(r.spent)}</td></tr>`).join('');
  detail(Math.max(0,boardRows.findIndex(r=>r.me)));
  openModal('board');
};

const RANK_OPTS=['B','A','S'];
let draft=null;
const isLocked=()=>st.figs[sel].lock>=0;
const saveOn=()=>{const c=$('saveChk');return !!(c&&c.checked);};
function prefText(p){
  const types=p.types.length?p.types.map(k=>STATS[k].n).join(', '):'All';
  return `<b>${p.count}</b> stat(s) of rank <b style="color:var(--${p.rank})">${p.rank}</b> or higher · Types: ${types}`;
}
function openPref(){draft=JSON.parse(JSON.stringify(st.pref));renderPref();openModal('pref');}
function renderPref(){
  const box=on=>`<span class="bx">${on?'✔':''}</span>`;
  $('pRank').innerHTML=RANK_OPTS.map(r=>
    `<button class="popt ${draft.rank===r?'on':''}" onclick="SLF.setRank('${r}')">${box(draft.rank===r)}<span style="color:var(--${r})">${r}</span></button>`).join('');
  const locked=isLocked();
  $('pCount').innerHTML=[1,2,3].map(c=>{
    const dis=locked&&c===3;
    return `<button class="popt ${draft.count===c?'on':''}" ${dis?'disabled title="Only 2 stats are rerolled while one is locked"':''} onclick="SLF.setCount(${c})"><span class="bx">${dis?'🔒':draft.count===c?'✔':''}</span><span style="font-family:sans-serif">${c}</span></button>`;}).join('');
  const all=draft.types.length===0;
  $('pTypes').innerHTML=`<button class="ptype ${all?'on':''}" onclick="SLF.setType(-1)">${box(all)}All</button>`+
    STATS.map((d,k)=>{const on=draft.types.includes(k);return `<button class="ptype ${on?'on':''}" onclick="SLF.setType(${k})">${box(on)}${d.n}</button>`;}).join('');
  $('pNote').textContent=locked&&draft.count===3?'This figure has a locked stat, so only 2 stats are rerolled — "3" will be treated as 2.':
    locked?'A stat is locked: only the 2 unlocked stats are checked.':'';
}
const SLF=window.SLF={
  setRank(r){draft.rank=r;renderPref();},
  setCount(c){draft.count=c;renderPref();},
  setType(k){
    if(k<0)draft.types=[];
    else{const i=draft.types.indexOf(k);if(i>=0)draft.types.splice(i,1);else draft.types.push(k);draft.types.sort((a,b)=>a-b);}
    if(draft.types.length===STATS.length)draft.types=[];
    renderPref();
  },
  applyPref(){st.pref=draft;save();closeModal('pref');render();msg('Preferred stats saved.',true);}
};


function hitStat(s){
  const p=st.pref;
  return RI[s.r]<=RI[p.rank]&&(p.types.length===0||p.types.includes(s.s));
}
function checkHits(nw,lock){
  const rolled=[0,1,2].filter(i=>i!==lock);
  const hits=rolled.filter(i=>hitStat(nw[i]));
  const need=Math.min(st.pref.count,rolled.length);
  return hits.length>=need?hits:[];
}


function doRoll(){
  const F=st.figs[sel],c=curCost();
  if(st.gold<c.gold||st.polish<c.polish||st.seal<c.seal)return null;
  st.gold-=c.gold;st.polish-=c.polish;st.seal-=c.seal;
  ensureSpent();st.spent.gold+=c.gold;st.spent.polish+=c.polish;st.spent.seal+=c.seal;
  F.rolls=(F.rolls||0)+1;st.rolls=(st.rolls||0)+1;
  const lock=F.lock;
  const nw=F.stats.map((s,i)=>i===lock?{...s}:rollOne());
  st.rs=(st.rs||0)+(lock>=0?2:3);
  return {nw,hits:checkHits(nw,lock)};
}
function hitHtml(nw,hits){
  return hits.map(i=>{const s=nw[i];return `<div class="hitrow"><div class="rk" style="color:var(--${s.r})">${s.r}</div><div>${STATS[s.s].n} — <b style="color:var(--gold)">${statVal(s)}</b></div></div>`;}).join('');
}
function notify(nw,hits,extra){
  $('nTitle').textContent='⭐ Preferred Stats Obtained!';
  $('nBody').innerHTML=`<div class="hitnote">${prefText(st.pref)}</div>${hitHtml(nw,hits)}${extra?`<p class="small" style="text-align:center">${extra}</p>`:''}`;
  openModal('notify');
}
function showChoose(nw,hits,extra){
  $('oldSide').innerHTML=miniList(st.figs[sel].stats);
  $('newSide').innerHTML=miniList(nw);
  const note=$('chooseNote');
  if(note)note.innerHTML=hits.length?`<div class="hitnote">⭐ Preferred stats obtained! ${extra||''}</div>`:'';
  openModal('choose');
}
const lacking='Not enough materials — open the 🛒 Shop';

convert=function(){
  if(auto.on){stopAuto();msg('Auto-Convert stopped.',true);return;}
  if(pending)return;
  const r=doRoll();
  if(!r){msg(lacking);return;}
  if(saveOn()){pending=r.nw;save();render();showChoose(r.nw,r.hits);}
  else{apply(r.nw);if(r.hits.length)notify(r.nw,r.hits);}
};

/* ---------------- AUTO ---------------- */
const auto={on:false,timer:null,count:0};
function affordable(){
  const c=curCost();
  return Math.min(Math.floor(st.gold/c.gold),Math.floor(st.polish/c.polish),c.seal?Math.floor(st.seal/c.seal):Infinity);
}
function toggleAuto(){
  if(auto.on){stopAuto();msg(`Auto-Convert stopped after ${auto.count} rolls.`,true);return;}
  if(pending)return;
  const n=affordable();
  if(n<1){msg(lacking);return;}
  const c=curCost(),F=st.figs[sel];
  confirmBox('Start Auto-Convert?',
    `<div class="hitnote">${prefText(st.pref)}</div>
     <p>Figure: <b>${FIGS[sel].n}</b>${F.lock>=0?` · 🔒 locked: <b>${STATS[F.stats[F.lock].s].n}</b> (only 2 stats reroll)`:' · no lock (all 3 stats reroll)'}</p>
     <p>Cost per roll: <b>${fmt(c.gold)}</b> gold · <b>${c.polish}</b> Polish${c.seal?` · <b>${c.seal}</b> Seal`:''} — you can afford <b>${fmt(n)}</b> rolls.</p>
     <p>${saveOn()?'<b>Save Stats ON:</b> your current stats are kept on every miss; when the target appears it stops and lets you choose Old or New.'
       :'<b>Save Stats OFF:</b> every roll replaces your unlocked stats. It stops as soon as the target appears.'}</p>
     <p class="small">Also stops when materials run out, or if you press Auto-Convert / Convert, change figure, lock, or open a menu.</p>`,
    'Start',startAuto);
}
function startAuto(){auto.on=true;auto.count=0;clearInterval(auto.timer);auto.timer=setInterval(tick,180);updateAutoUI();}
function stopAuto(){if(!auto.on)return;auto.on=false;clearInterval(auto.timer);auto.timer=null;updateAutoUI();}
function tick(){
  if(!auto.on)return;
  if(pending||document.querySelector('.modal-bg.show'))return;
  const r=doRoll();
  if(!r){const n=auto.count;stopAuto();render();msg(`Auto-Convert stopped: out of materials (${n} rolls).`);return;}
  auto.count++;
  if(r.hits.length){
    const extra=`Auto-Convert stopped after ${auto.count} rolls.`;
    stopAuto();
    if(saveOn()){pending=r.nw;save();render();showChoose(r.nw,r.hits,extra);}
    else{apply(r.nw);notify(r.nw,r.hits,extra);}
    return;
  }
  if(saveOn()){save();render();}
  else apply(r.nw);
  msg(`Auto-Convert… ${auto.count} rolls`,true);
}
function updateAutoUI(){
  autoBtn.classList.toggle('on',auto.on);
  autoBtn.innerHTML=`Auto-Convert <b>${auto.on?'ON':'OFF'}</b>`;
  if(st&&st.pref)prefBtn.innerHTML=`⚙ Preferred: <span style="color:var(--${st.pref.rank})">${st.pref.rank}</span> ×${Math.min(st.pref.count,isLocked()?2:3)}`;
}

function confirmBox(title,html,okText,onOk){
  $('cTitle').textContent=title;$('cBody').innerHTML=html;
  const b=$('cOk');b.textContent=okText||'Confirm';
  b.onclick=()=>{closeModal('confirm');onOk();};
  openModal('confirm');
}
const _buy=buy;
const CUR_NAME={gold:'Gold',polish:'Polish of Change',seal:'Seals of Unity'};
buy=function(type,amt,price){
  confirmBox('Confirm Purchase',
    `<p style="font-size:28px;text-align:center">Buy <b style="color:var(--gold)">${fmt(Math.floor(amt))} ${CUR_NAME[type]||type}</b> for <b>$${price}</b>?</p>
     <p class="small" style="text-align:center">Simulation only — no real money is charged.</p>`,
    'Buy',()=>{_buy(type,amt,price);msg(`Bought ${fmt(Math.floor(amt))} ${CUR_NAME[type]||type}.`,true);});
};

const _open=openModal;
openModal=function(n){if(auto.on&&n!=='choose'&&n!=='notify')stopAuto();_open(n);};
const _pick=pick;pick=function(i){stopAuto();_pick(i);};
const _toggleLock=toggleLock;toggleLock=function(i){stopAuto();_toggleLock(i);};
if(typeof showMenu==='function'){const _sm=showMenu;showMenu=function(){stopAuto();_sm();};}
const sc=$('saveChk');if(sc)sc.addEventListener('change',()=>stopAuto());
const _resetAll=resetAll;
resetAll=function(){stopAuto();_resetAll();if(!st.pref)st.pref={rank:'S',count:1,types:[]};st.rolls=st.rolls||0;st.rs=st.rs||0;st.spent={gold:0,polish:0,seal:0};save();render();};

const _render=render;
render=function(){if(st&&!st.pref)st.pref={rank:'S',count:1,types:[]};ensureSpent();_render();updateAutoUI();paintSpent();};


function short(n){n=n||0;return n>=1e9?(n/1e9).toFixed(n>=1e10?0:1)+'B':n>=1e6?(n/1e6).toFixed(n>=1e7?0:1)+'M':n>=1e4?(n/1e3).toFixed(0)+'K':fmt(n);}
function spentShort(sp){return sp?`${short(sp.gold)} Gold · ${fmt(sp.polish)} Polish · ${fmt(sp.seal)} Seals`:'—';}
const spentEl=document.createElement('div');spentEl.className='spentline';
const midCol=document.querySelector('.col-mid');if(midCol)midCol.appendChild(spentEl);
function paintSpent(){if(st&&st.spent)spentEl.innerHTML=`Spent: <b>${spentShort(st.spent)}</b> · ${fmt(st.rolls||0)} rolls`;}

const headRow=document.querySelector('#m-board thead tr');
if(headRow&&!headRow.querySelector('.spentc')){const th=document.createElement('th');th.className='spentc';th.textContent='Spent';headRow.appendChild(th);}

const _detail=detail;
detail=function(i){
  _detail(i);
  const r=boardRows[i];if(!r)return;
  const box=$('boardDetail');
  box.insertAdjacentHTML('afterbegin',`<div class="hitnote" style="text-align:left">💸 ${esc(r.name)} spent: ${r.spent?`<b>${fmt(r.spent.gold)}</b> Gold · <b>${fmt(r.spent.polish)}</b> Polish of Change · <b>${fmt(r.spent.seal)}</b> Seals of Unity`:'not recorded yet'} · Paid <b>$${fmt(r.paid||0)}</b></div>`);
};
render();
})();
