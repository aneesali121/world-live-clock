const COUNTRIES = [
  ["PK","Pakistan",[["Islamabad","Asia/Karachi"],["Karachi","Asia/Karachi"],["Lahore","Asia/Karachi"]]],
  ["GB","United Kingdom",[["London","Europe/London"],["Manchester","Europe/London"],["Edinburgh","Europe/London"]]],
  ["US","United States",[["New York","America/New_York"],["Chicago","America/Chicago"],["Los Angeles","America/Los_Angeles"],["Honolulu","Pacific/Honolulu"]]],
  ["CA","Canada",[["Toronto","America/Toronto"],["Montreal","America/Toronto"],["Vancouver","America/Vancouver"]]],
  ["MX","Mexico",[["Mexico City","America/Mexico_City"]]],
  ["BR","Brazil",[["São Paulo","America/Sao_Paulo"],["Rio de Janeiro","America/Sao_Paulo"]]],
  ["AR","Argentina",[["Buenos Aires","America/Argentina/Buenos_Aires"]]],
  ["CO","Colombia",[["Bogotá","America/Bogota"]]],
  ["PE","Peru",[["Lima","America/Lima"]]],
  ["CL","Chile",[["Santiago","America/Santiago"]]],
  ["FR","France",[["Paris","Europe/Paris"]]],
  ["DE","Germany",[["Berlin","Europe/Berlin"],["Munich","Europe/Berlin"]]],
  ["ES","Spain",[["Madrid","Europe/Madrid"]]],
  ["IT","Italy",[["Rome","Europe/Rome"]]],
  ["NL","Netherlands",[["Amsterdam","Europe/Amsterdam"]]],
  ["PT","Portugal",[["Lisbon","Europe/Lisbon"]]],
  ["IE","Ireland",[["Dublin","Europe/Dublin"]]],
  ["CH","Switzerland",[["Zurich","Europe/Zurich"]]],
  ["SE","Sweden",[["Stockholm","Europe/Stockholm"]]],
  ["NO","Norway",[["Oslo","Europe/Oslo"]]],
  ["PL","Poland",[["Warsaw","Europe/Warsaw"]]],
  ["GR","Greece",[["Athens","Europe/Athens"]]],
  ["UA","Ukraine",[["Kyiv","Europe/Kyiv"]]],
  ["RU","Russia",[["Moscow","Europe/Moscow"]]],
  ["TR","Turkey",[["Istanbul","Europe/Istanbul"]]],
  ["EG","Egypt",[["Cairo","Africa/Cairo"]]],
  ["NG","Nigeria",[["Lagos","Africa/Lagos"]]],
  ["KE","Kenya",[["Nairobi","Africa/Nairobi"]]],
  ["ZA","South Africa",[["Johannesburg","Africa/Johannesburg"]]],
  ["SA","Saudi Arabia",[["Riyadh","Asia/Riyadh"],["Jeddah","Asia/Riyadh"]]],
  ["AE","United Arab Emirates",[["Dubai","Asia/Dubai"],["Abu Dhabi","Asia/Dubai"]]],
  ["QA","Qatar",[["Doha","Asia/Qatar"]]],
  ["IR","Iran",[["Tehran","Asia/Tehran"]]],
  ["AF","Afghanistan",[["Kabul","Asia/Kabul"]]],
  ["BD","Bangladesh",[["Dhaka","Asia/Dhaka"]]],
  ["NP","Nepal",[["Kathmandu","Asia/Kathmandu"]]],
  ["TH","Thailand",[["Bangkok","Asia/Bangkok"]]],
  ["ID","Indonesia",[["Jakarta","Asia/Jakarta"]]],
  ["MY","Malaysia",[["Kuala Lumpur","Asia/Kuala_Lumpur"]]],
  ["SG","Singapore",[["Singapore","Asia/Singapore"]]],
  ["PH","Philippines",[["Manila","Asia/Manila"]]],
  ["CN","China",[["Beijing","Asia/Shanghai"],["Shanghai","Asia/Shanghai"]]],
  ["HK","Hong Kong",[["Hong Kong","Asia/Hong_Kong"]]],
  ["KR","South Korea",[["Seoul","Asia/Seoul"]]],
  ["JP","Japan",[["Tokyo","Asia/Tokyo"],["Osaka","Asia/Tokyo"]]],
  ["AU","Australia",[["Sydney","Australia/Sydney"],["Melbourne","Australia/Melbourne"],["Perth","Australia/Perth"]]],
  ["NZ","New Zealand",[["Auckland","Pacific/Auckland"]]]
];

const flagOf = c => String.fromCodePoint(...[...c].map(x => 127397 + x.charCodeAt(0)));
const ENTRIES = COUNTRIES.flatMap(([code,name,cities]) =>
  cities.map(([city,tz]) => ({id:code+"|"+city, code, name, city, tz, flag:flagOf(code)})));
const byId = Object.fromEntries(ENTRIES.map(e => [e.id, e]));

const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2,"0");
const DEV_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const DEFAULTS = {clocks:["PK|Islamabad","GB|London","US|New York"], favs:[], h12:true, view:"both", theme:"auto", ref:"device"};
let S = {...DEFAULTS};
try { S = {...DEFAULTS, ...JSON.parse(localStorage.getItem("worldclock.v1") || "{}")}; } catch(e) {}
S.clocks = (S.clocks||[]).filter(id => byId[id]);
S.favs = (S.favs||[]).filter(id => byId[id]);
const save = () => { try { localStorage.setItem("worldclock.v1", JSON.stringify(S)); } catch(e) {} };

const fmtCache = {};
function fmts(tz){
  if(!fmtCache[tz]) fmtCache[tz] = {
    p: new Intl.DateTimeFormat("en-US",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"}),
    d: new Intl.DateTimeFormat("en-US",{timeZone:tz,weekday:"long",year:"numeric",month:"long",day:"numeric"})
  };
  return fmtCache[tz];
}
// Real-time, DST-aware zone reading via the browser's IANA database
function zoned(tz, now){
  const f = fmts(tz), p = {};
  for(const x of f.p.formatToParts(now)) p[x.type] = +x.value;
  const h = p.hour % 24;
  const asUTC = Date.UTC(p.year, p.month-1, p.day, h, p.minute, p.second);
  const off = Math.round((asUTC - (now - now % 1000)) / 60000);
  return {h, mi:p.minute, s:p.second, off, date:f.d.format(now)};
}
const offLabel = off => { const a = Math.abs(off); return `UTC${off<0?"-":"+"}${pad(Math.floor(a/60))}:${pad(a%60)}`; };
const timeStr = z => `${pad(S.h12 ? (z.h%12||12) : z.h)}:${pad(z.mi)}:${pad(z.s)}${S.h12 ? " "+(z.h<12?"AM":"PM") : ""}`;

let uid = 0;
function faceSVG(){
  const gid = "g" + (++uid);
  let s = `<svg class="clock" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="${gid}" cx="50%" cy="38%" r="65%"><stop offset="0" style="stop-color:var(--face-hi)"/><stop offset="1" style="stop-color:var(--face)"/></radialGradient></defs>
  <circle cx="100" cy="100" r="99" style="fill:var(--case)"/>
  <circle cx="100" cy="100" r="94" style="fill:url(#${gid})"/>
  <circle cx="100" cy="100" r="86" fill="none" style="stroke:var(--border)"/>`;
  for(let i=0;i<60;i++){
    const L = i%5 ? 4 : 10, w = i%5 ? 0.8 : 2.2;
    s += `<line x1="100" y1="16" x2="100" y2="${16+L}" transform="rotate(${i*6} 100 100)" style="stroke:var(--ring)" stroke-width="${w}"/>`;
  }
  for(let n=1;n<=12;n++){
    const a = n*30*Math.PI/180;
    s += `<text class="num" x="${(100+68*Math.sin(a)).toFixed(2)}" y="${(100-68*Math.cos(a)+1).toFixed(2)}" text-anchor="middle" dominant-baseline="central">${n}</text>`;
  }
  s += `<line class="hr" x1="100" y1="110" x2="100" y2="56" stroke-width="5.5" stroke-linecap="round"/>
  <line class="mn" x1="100" y1="114" x2="100" y2="36" stroke-width="3.5" stroke-linecap="round"/>
  <line class="sc" x1="100" y1="124" x2="100" y2="24" stroke-width="1.4" stroke-linecap="round"/>
  <circle class="pin" cx="100" cy="100" r="4.5"/><circle class="pin2" cx="100" cy="100" r="2"/></svg>`;
  return s;
}

const cards = new Map();
const grid = $("#grid");

function addCard(id){
  const e = byId[id];
  const el = document.createElement("article");
  el.className = "card";
  el.dataset.id = id;
  el.innerHTML = `<div class="city">${e.flag} ${e.city}</div><div class="country">${e.name}</div>
    ${faceSVG()}
    <div class="digital"><span class="t">--:--:--</span><span class="ap"></span></div>
    <div class="date"></div>
    <div class="zone">${e.tz}</div>
    <div class="tools">
      <button class="ib fav" title="Favorite" aria-label="Favorite">☆</button>
      <button class="ib fs" title="Full screen" aria-label="Full screen">⛶</button>
      <button class="ib rm" title="Remove" aria-label="Remove">✕</button>
    </div>`;
  const q = s => el.querySelector(s);
  const hr=q(".hr"), mn=q(".mn"), sc=q(".sc"), t=q(".t"), ap=q(".ap"), date=q(".date"), zone=q(".zone");
  const card = {el, off:0, upd(now){
    const z = zoned(e.tz, now);
    card.off = z.off;
    const sec = z.s + (now % 1000)/1000, min = z.mi + sec/60, hour = (z.h%12) + min/60;
    hr.setAttribute("transform", `rotate(${hour*30} 100 100)`);
    mn.setAttribute("transform", `rotate(${min*6} 100 100)`);
    sc.setAttribute("transform", `rotate(${sec*6} 100 100)`);
    const txt = `${pad(S.h12 ? (z.h%12||12) : z.h)}:${pad(z.mi)}:${pad(z.s)}`;
    if(t.textContent !== txt) t.textContent = txt;
    const apTxt = S.h12 ? (z.h < 12 ? "AM" : "PM") : "";
    if(ap.textContent !== apTxt) ap.textContent = apTxt;
    if(date.textContent !== z.date) date.textContent = z.date;
    const zl = `${e.tz} · ${offLabel(z.off)}`;
    if(zone.textContent !== zl) zone.textContent = zl;
  }};
  cards.set(id, card);
  paintFav(id);
  return card;
}

function paintFav(id){
  const b = cards.get(id)?.el.querySelector(".fav");
  if(!b) return;
  const on = S.favs.includes(id);
  b.textContent = on ? "★" : "☆";
  b.classList.toggle("on", on);
  b.setAttribute("aria-pressed", on);
}

function renderGrid(){
  const order = [...S.clocks].sort((a,b) => S.favs.includes(b) - S.favs.includes(a));
  for(const id of [...cards.keys()]) if(!S.clocks.includes(id)){ cards.get(id).el.remove(); cards.delete(id); }
  for(const id of order){
    if(!cards.has(id)) addCard(id);
    grid.appendChild(cards.get(id).el);
  }
  $("#empty").hidden = S.clocks.length > 0;
}

function renderCompare(){
  const sel = $("#ref"), box = $("#cmp");
  sel.innerHTML = `<option value="device">Your time zone</option>` +
    S.clocks.map(id => `<option value="${id}">${byId[id].city}</option>`).join("");
  sel.value = (S.ref === "device" || S.clocks.includes(S.ref)) ? S.ref : "device";
  box.innerHTML = S.clocks.length
    ? S.clocks.map(id => `<div class="row" data-id="${id}"><span>${byId[id].flag} ${byId[id].city}</span><span class="ct">--:--:--</span><span class="cd"></span></div>`).join("")
    : `<div class="empty">Add clocks to compare them.</div>`;
}

function updateCompare(now){
  const refCard = S.ref !== "device" ? cards.get(S.ref) : null;
  const refOff = refCard ? refCard.off : zoned(DEV_TZ, now).off;
  for(const row of $("#cmp").querySelectorAll(".row")){
    const id = row.dataset.id, c = cards.get(id);
    if(!c) continue;
    row.querySelector(".ct").textContent = timeStr(zoned(byId[id].tz, now));
    const d = c.off - refOff;
    row.querySelector(".cd").textContent = (refCard && S.ref === id) ? "Reference"
      : d === 0 ? "Same time"
      : `${Math.floor(Math.abs(d)/60)}h ${pad(Math.abs(d)%60)}m ${d>0?"ahead":"behind"}`;
  }
}

function toggleFav(id){
  S.favs = S.favs.includes(id) ? S.favs.filter(x => x !== id) : [...S.favs, id];
  save(); renderGrid(); paintFav(id);
}
function addClock(id){
  if(!S.clocks.includes(id)) S.clocks.push(id);
  save(); renderGrid(); renderCompare();
  return cards.get(id)?.el;
}
function removeClock(id){
  S.clocks = S.clocks.filter(x => x !== id);
  S.favs = S.favs.filter(x => x !== id);
  if(S.ref === id) S.ref = "device";
  save(); renderGrid(); renderCompare();
}

grid.addEventListener("click", ev => {
  const b = ev.target.closest("button");
  const card = ev.target.closest(".card");
  if(!b || !card) return;
  const id = card.dataset.id;
  if(b.classList.contains("fav")) toggleFav(id);
  else if(b.classList.contains("fs")) { if(document.fullscreenElement) document.exitFullscreen(); else card.requestFullscreen?.().catch(()=>{}); }
  else if(b.classList.contains("rm")) removeClock(id);
});

// Search
const inp = $("#q"), res = $("#res");
let list = [], act = -1;
function renderResults(){
  const q = inp.value.trim().toLowerCase();
  list = ENTRIES.filter(e => !q || (e.city+" "+e.name+" "+e.tz+" "+e.code).toLowerCase().includes(q)).slice(0,60);
  act = list.length ? 0 : -1;
  res.innerHTML = list.map((e,i) => `<div class="item${i===act?" active":""}" data-i="${i}"><span class="fl">${e.flag}</span><span><b>${e.city}</b><small>${e.name}</small></span>${S.clocks.includes(e.id) ? '<span class="tag">Added</span>' : '<span class="plus">+</span>'}</div>`).join("")
    || `<div class="item">No match. Try a different spelling.</div>`;
  res.classList.add("open");
}
function highlight(){
  res.querySelectorAll(".item").forEach((el,i) => el.classList.toggle("active", i===act));
  res.querySelector(".item.active")?.scrollIntoView({block:"nearest"});
}
function pick(e){
  if(S.clocks.includes(e.id)) cards.get(e.id)?.el.scrollIntoView({behavior:"smooth", block:"center"});
  else addClock(e.id);
  res.classList.remove("open");
  inp.value = "";
}
inp.addEventListener("input", renderResults);
inp.addEventListener("focus", renderResults);
inp.addEventListener("keydown", e => {
  if(e.key==="ArrowDown" || e.key==="ArrowUp"){
    e.preventDefault();
    if(!list.length) return;
    act = (act + (e.key==="ArrowDown" ? 1 : -1) + list.length) % list.length;
    highlight();
  } else if(e.key==="Enter"){ if(list[act]) pick(list[act]); }
  else if(e.key==="Escape") res.classList.remove("open");
});
res.addEventListener("click", e => {
  const it = e.target.closest(".item[data-i]");
  if(it) pick(list[+it.dataset.i]);
});
document.addEventListener("click", e => { if(!e.target.closest(".search")) res.classList.remove("open"); });

// Controls
const mq = matchMedia("(prefers-color-scheme: dark)");
function applyTheme(){
  const dark = S.theme === "dark" || (S.theme === "auto" && mq.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  $("#theme").textContent = S.theme[0].toUpperCase() + S.theme.slice(1);
}
mq.addEventListener?.("change", applyTheme);
$("#theme").onclick = () => { S.theme = S.theme==="auto" ? "light" : S.theme==="light" ? "dark" : "auto"; save(); applyTheme(); };
$("#fmt").onclick = () => { S.h12 = !S.h12; $("#fmt").textContent = S.h12 ? "12h" : "24h"; save(); };
function setView(v){
  S.view = v;
  grid.className = "grid v-" + v;
  document.querySelectorAll(".seg button").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === v));
  save();
}
document.querySelectorAll(".seg button").forEach(b => b.onclick = () => setView(b.dataset.view));
$("#ref").onchange = e => { S.ref = e.target.value; save(); };

// Init and live loop
applyTheme();
setView(S.view);
$("#fmt").textContent = S.h12 ? "12h" : "24h";
renderGrid();
renderCompare();
function frame(){
  const now = Date.now();
  for(const c of cards.values()) c.upd(now);
  if(S.clocks.length) updateCompare(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
