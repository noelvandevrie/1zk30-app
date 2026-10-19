const D = window.DATA;
const KEY = "ogw-samen";
const $ = (s) => document.querySelector(s);

// ---------- Opslag (alleen op deze telefoon) ----------

if (new URLSearchParams(location.search).has("reset")) {
  localStorage.removeItem(KEY);
  history.replaceState(null, "", location.pathname + location.hash);
}

const S = load();
function load() {
  const empty = { me: null, going: {}, helped: {}, posts: [], chats: {} };
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return empty;
  }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(S));
}

// ---------- Hulpjes ----------

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const today = new Date();
today.setHours(0, 0, 0, 0);
const addDays = (n) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
const dayDiff = (d) => Math.round((d - today) / 864e5);
const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

const weekday = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" });
function dateLabel(d) {
  const n = dayDiff(d);
  if (n === 0) return "Vandaag";
  if (n === 1) return "Morgen";
  const s = weekday.format(d);
  return s[0].toUpperCase() + s.slice(1);
}
const rtf = new Intl.RelativeTimeFormat("nl", { numeric: "auto" });
function ago(d) {
  const s = rtf.format(dayDiff(d), "day");
  return s[0].toUpperCase() + s.slice(1);
}

const cat = (c) => D.categories[c] || D.categories.overig;

const COLORS = ["#8C3B1F", "#2F5D50", "#5B4B8A", "#7A5A00", "#1F4E79", "#8A2F5B"];
function avatar(name, cls = "") {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `<span class="avatar ${cls}" style="background:${COLORS[h % COLORS.length]}" aria-hidden="true">${esc(name[0].toUpperCase())}</span>`;
}

// ---------- Inhoud: startinhoud + eigen berichten ----------

function events() {
  const mine = S.posts.filter((p) => p.type === "activiteit").map((p) => ({ ...p, when: parseDate(p.date), going: p.joined || [] }));
  const seed = D.events.map((e) => ({ ...e, when: addDays(e.days) }));
  return [...mine, ...seed]
    .filter((e) => e.when >= today)
    .sort((a, b) => a.when - b.when || a.time.localeCompare(b.time));
}

function helpPosts() {
  const mine = S.posts.filter((p) => p.type !== "activiteit").map((p) => ({ ...p, when: new Date(p.created), reactions: p.reactions || 0 }));
  const seed = D.help.map((h) => ({ ...h, when: addDays(-h.daysAgo) }));
  return [...mine, ...seed].sort((a, b) => b.when - a.when);
}

const news = () => D.news.map((n) => ({ ...n, when: addDays(-n.daysAgo) })).sort((a, b) => b.when - a.when);

// ---------- Kaarten ----------

function goingText(e, me) {
  const n = e.going.length;
  if (me) return n === 0 ? "Jij gaat" : `Jij en ${n} ${n === 1 ? "ander gaat" : "anderen gaan"}`;
  if (n === 0) return "Nog niemand. Ben jij de eerste?";
  if (n === 1) return `${esc(e.going[0])} gaat`;
  if (n === 2) return `${esc(e.going[0])} en ${esc(e.going[1])} gaan`;
  return `${esc(e.going[0])}, ${esc(e.going[1])} en ${n - 2} anderen gaan`;
}

function eventCard(e) {
  const me = !!S.going[e.id];
  const names = me ? [S.me.name, ...e.going] : e.going;
  const faces = (me ? avatar(S.me.name, "me") : "") + e.going.slice(0, me ? 4 : 5).map((n) => avatar(n)).join("");
  return `
  <article class="card ${e.id === justPosted ? "fresh" : ""}">
    <div class="card-head">
      <span class="icon" aria-hidden="true">${cat(e.cat).icon}</span>
      <div>
        <h3>${esc(e.title)}</h3>
        <p class="meta"><strong>${dateLabel(e.when)} · ${esc(e.time)}</strong><br>📍 ${esc(e.place)}</p>
      </div>
    </div>
    ${e.text ? `<p>${esc(e.text)}</p>` : ""}
    ${e.mine ? `<p class="small">Georganiseerd door jou</p>` : e.host ? `<p class="small">Georganiseerd door ${esc(e.host)}</p>` : ""}
    <div class="who">
      ${faces ? `<span class="faces">${faces}</span>` : ""}
      <span>${goingText(e, me)}</span>
    </div>
    ${names.length ? `<details><summary>Wie gaan er?</summary><p>${names.map(esc).join(", ")}</p></details>` : ""}
    <div class="row">
      <button class="btn ${me ? "on" : "primary"}" data-go="${esc(e.id)}" aria-pressed="${me}">
        ${me ? "✓ Ik ga" : "Ik ga"}
      </button>
      ${me ? `<button class="btn" data-ics="${esc(e.id)}">📅 In agenda</button>` : ""}
    </div>
  </article>`;
}

function reminderCard(e) {
  return `
  <a class="card reminder" href="#agenda">
    <span class="icon" aria-hidden="true">⏰</span>
    <span><strong>${dateLabel(e.when)} om ${esc(e.time)}</strong><br>${esc(e.title)} · ${esc(e.place)}</span>
  </a>`;
}

function reactionText(n) {
  if (n === 0) return "";
  return `<p class="reactions">💬 ${n} ${n === 1 ? "buur reageerde" : "buren reageerden"}</p>`;
}

function helpCard(h) {
  const helped = !!S.helped[h.id];
  const offer = h.type === "aanbod";
  let action;
  const chat = S.chats[h.id];
  if (h.mine && chat) action = `<button class="btn primary" data-chat="${esc(h.id)}">💬 Gesprek met ${esc(chat.with)}</button>`;
  else if (h.mine) action = `<p class="small">Dit is jouw bericht</p>`;
  else if (helped) action = `<button class="btn on" data-chat="${esc(h.id)}">💬 Bekijk gesprek</button>`;
  else action = `<button class="btn primary" data-help="${esc(h.id)}">${offer ? "Graag!" : "Ik help!"}</button>`;
  return `
  <article class="card ${h.id === justPosted ? "fresh" : ""}">
    <span class="tag ${offer ? "offer" : "ask"}">${offer ? "Hulpaanbod" : "Hulpvraag"}</span>
    <div class="card-head">
      <span class="icon" aria-hidden="true">${cat(h.cat).icon}</span>
      <h3>${esc(h.title)}</h3>
    </div>
    ${h.text ? `<p>${esc(h.text)}</p>` : ""}
    <p class="byline">${avatar(h.author)} <span><strong>${esc(h.author)}</strong> · ${esc(h.street)}<br><span class="small">${ago(h.when)}</span></span></p>
    ${reactionText(h.reactions + (helped ? 1 : 0))}
    ${action}
  </article>`;
}

function newsCard(n) {
  const story = n.story
    ? `<details><summary>Lees verder</summary>${n.story.split(/\n\s*\n/).map((p) => `<p>${esc(p)}</p>`).join("")}</details>`
    : "";
  return `
  <article class="card news">
    <span class="tag news">${n.source === "Gemeente" ? "🏛️" : "📣"} ${esc(n.source)}</span>
    <h3>${esc(n.title)}</h3>
    <p>${esc(n.text)}</p>
    ${story}
    <p class="small">${ago(n.when)}</p>
  </article>`;
}

// ---------- Schermen ----------

const views = {
  overzicht() {
    return `
      <h1>Hoi ${esc(S.me.name)} 👋</h1>
      <p class="lead">Dit gebeurt er in Oude Gracht-West.</p>
      ${events().filter((e) => S.going[e.id] && dayDiff(e.when) <= 1).map(reminderCard).join("")}
      <h2>Binnenkort</h2>
      ${events().slice(0, 2).map(eventCard).join("")}
      <a class="more" href="#agenda">Hele agenda →</a>
      <h2>Buren vragen en bieden</h2>
      ${helpPosts().slice(0, 2).map(helpCard).join("")}
      <a class="more" href="#hulpbord">Naar het hulpbord →</a>
      <h2>Nieuws uit de buurt</h2>
      ${news().slice(0, 3).map(newsCard).join("")}
      <a class="more" href="#nieuws">Alle nieuws →</a>`;
  },
  nieuws() {
    return `
      <h1>Nieuws</h1>
      <p class="lead">Berichten van de bewonersvereniging en de gemeente.</p>
      ${news().map(newsCard).join("")}`;
  },
  agenda() {
    const list = events();
    return `
      <h1>Agenda</h1>
      <p class="lead">Activiteiten in de buurt. Tik op <strong>Ik ga</strong> als je komt.</p>
      ${list.length ? list.map(eventCard).join("") : `<p class="card">Er staat nog niets gepland.</p>`}
      <a class="btn" href="#plaatsen">＋ Zelf iets organiseren</a>`;
  },
  hulpbord() {
    return `
      <h1>Hulpbord</h1>
      <p class="lead">Buren helpen buren. Iets nodig of iets te bieden?</p>
      <a class="btn" href="#plaatsen">＋ Vraag of bied hulp</a>
      ${helpPosts().map(helpCard).join("")}`;
  },
  plaatsen() {
    return `
      <h1>Plaatsen</h1>
      <p class="lead">Wat wil je delen met de buurt?</p>
      <form id="post-form" class="card">
        <fieldset class="types">
          <legend>Soort bericht</legend>
          ${[["activiteit", "📅", "Activiteit"], ["vraag", "🙋", "Hulpvraag"], ["aanbod", "🤝", "Hulpaanbod"]]
            .map(([v, i, l]) => `<label><input type="radio" name="type" value="${v}" ${v === postType ? "checked" : ""}><span>${i} ${l}</span></label>`)
            .join("")}
        </fieldset>
        <div id="post-fields">${postFields(postType)}</div>
        <button class="btn primary" type="submit">Plaatsen</button>
      </form>`;
  },
};

let postType = "activiteit";
function postFields(type) {
  const cats = Object.entries(D.categories)
    .map(([k, c]) => `<option value="${k}">${c.icon} ${esc(c.label)}</option>`)
    .join("");
  const catField = `<label>Soort <select name="cat">${cats}</select></label>`;
  if (type === "activiteit") {
    const min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}T00:00`;
    return `
      <label>Wat ga je doen? <input name="title" required maxlength="60" placeholder="Bijv. Samen naar de speeltuin"></label>
      <label>Wanneer? <input name="at" type="datetime-local" required min="${min}"></label>
      <label>Waar? <input name="place" required maxlength="60" placeholder="Bijv. Speeltuin Kastanjestraat"></label>
      ${catField}`;
  }
  const ask = type === "vraag";
  return `
    <label>${ask ? "Waar heb je hulp bij nodig?" : "Wat kun je doen of uitlenen?"}
      <input name="title" required maxlength="60" placeholder="${ask ? "Bijv. Wie kan woensdag even oppassen?" : "Bijv. Ik heb een buggy te leen"}">
    </label>
    <label>Toelichting <textarea name="text" rows="3" maxlength="300" placeholder="Wanneer, hoe lang, wat precies?"></textarea></label>
    ${catField}`;
}

// ---------- Render ----------

let justPosted = null;

function render(animate = false) {
  const view = location.hash.slice(1);
  const name = views[view] ? view : "overzicht";
  $("#main").innerHTML = views[name]();
  justPosted = null;
  document.querySelectorAll(".tabs a").forEach((a) =>
    a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + name));
  $("#profile-btn").innerHTML = S.me ? avatar(S.me.name) : "";
  if (animate) enter($("#main"));
  else $("#main").classList.remove("enter");
}

// ---------- Animaties ----------

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

// Laat de kinderen van el één voor één in beeld schuiven
function enter(el) {
  [...el.children].forEach((c, i) => c.style.setProperty("--n", Math.min(i, 8)));
  el.classList.remove("enter");
  void el.offsetWidth;
  el.classList.add("enter");
}

// Vervaag el, verberg het daarna en ga verder met then()
function leave(el, then) {
  if (reduceMotion.matches) {
    el.hidden = true;
    return then();
  }
  el.classList.add("leaving");
  el.addEventListener("animationend", function done(ev) {
    if (ev.target !== el) return;
    el.removeEventListener("animationend", done);
    el.classList.remove("leaving");
    el.hidden = true;
    then();
  });
}

// Feestelijk spatje vanuit het midden van el
function burst(el) {
  if (reduceMotion.matches || !el) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("span");
    p.className = "spark";
    p.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;background:${COLORS[i % COLORS.length]};border-radius:${i % 2 ? "50%" : "2px"}`;
    document.body.append(p);
    const a = Math.random() * Math.PI * 2;
    const d = 50 + Math.random() * 80;
    p.animate(
      [
        { transform: "translate(0, 0) scale(1) rotate(0)", opacity: 1 },
        { opacity: 1, offset: 0.6 },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d - 40}px) scale(0.3) rotate(${Math.random() * 360}deg)`, opacity: 0 },
      ],
      { duration: 650 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" },
    ).onfinish = () => p.remove();
  }
}

// Opnieuw tekenen na iets dat 'vanzelf' gebeurt, maar niet midden in een formulier of gesprek
function refresh() {
  if (location.hash !== "#plaatsen" && !document.querySelector("dialog[open]")) render();
}

function navigate(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

window.addEventListener("hashchange", () => {
  if (location.hash === "#plaatsen") postType = "activiteit";
  render(true);
  scrollTo(0, 0);
});

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 3000);
}

// ---------- Acties ----------

$("#main").addEventListener("click", (ev) => {
  const go = ev.target.closest("[data-go]");
  if (go) {
    const id = go.dataset.go;
    S.going[id] = !S.going[id];
    save();
    render();
    if (S.going[id]) {
      const btn = $(`[data-go="${CSS.escape(id)}"]`);
      btn.closest(".card").classList.add("joined");
      burst(btn);
      const e = events().find((x) => x.id === id);
      const soon = dayDiff(e.when) <= 1;
      toast(soon ? "Leuk! Je krijgt straks een herinnering." : "Leuk! Je krijgt de dag ervoor een herinnering.");
      if (soon) remind(e);
    }
    return;
  }
  const ics = ev.target.closest("[data-ics]");
  if (ics) {
    downloadIcs(events().find((e) => e.id === ics.dataset.ics));
    toast("📅 Afspraak staat klaar voor je agenda");
    return;
  }
  const help = ev.target.closest("[data-help]") || ev.target.closest("[data-chat]");
  if (help) {
    const h = helpPosts().find((p) => p.id === (help.dataset.help || help.dataset.chat));
    if (!h.mine) {
      S.helped[h.id] = true;
      chatFor(h);
      save();
      render();
    }
    openChat(h.id);
  }
});

$("#main").addEventListener("change", (ev) => {
  if (ev.target.name === "type") {
    postType = ev.target.value;
    $("#post-fields").innerHTML = postFields(postType);
  }
});

$("#main").addEventListener("submit", (ev) => {
  if (ev.target.id !== "post-form") return;
  ev.preventDefault();
  const f = Object.fromEntries(new FormData(ev.target));
  const id = "u" + Date.now();
  const base = { id, mine: true, type: f.type, title: f.title.trim(), cat: f.cat };
  const post = f.type === "activiteit"
    ? { ...base, date: f.at.slice(0, 10), time: f.at.slice(11, 16), place: f.place.trim() }
    : { ...base, text: f.text.trim(), author: S.me.name, street: S.me.street, created: Date.now() };
  S.posts.unshift(post);
  if (f.type === "activiteit") S.going[id] = true;
  save();
  respondTo(post);
  burst(ev.submitter);
  justPosted = id;
  navigate(f.type === "activiteit" ? "#agenda" : "#hulpbord");
  toast("Geplaatst! Je buren kunnen het nu zien.");
});

// ---------- Welkom & profiel ----------

$("#streets").innerHTML = D.streets.map((s) => `<option value="${esc(s)}">`).join("");

$("#welcome-form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const f = Object.fromEntries(new FormData(ev.target));
  S.me = { name: f.name.trim(), street: f.street.trim(), line: "" };
  save();
  burst(ev.submitter);
  leave($("#welcome"), () => {
    render(true);
    startDemo();
  });
});

$("#profile-btn").addEventListener("click", () => {
  const form = $("#profile-form");
  for (const k of ["name", "street", "line"]) form.elements[k].value = S.me[k] || "";
  $("#profile").returnValue = "";
  $("#profile").showModal();
});

$("#profile").addEventListener("close", () => {
  if ($("#profile").returnValue !== "save") return;
  const form = $("#profile-form");
  S.me = { name: form.elements.name.value.trim(), street: form.elements.street.value.trim(), line: form.elements.line.value.trim() };
  save();
  render();
});

// ---------- Agenda-bestand (.ics) ----------

function downloadIcs(e) {
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const txt = (t) => String(t ?? "").replace(/[\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
  const [h, m] = e.time.split(":").map(Number);
  const start = new Date(e.when.getFullYear(), e.when.getMonth(), e.when.getDate(), h, m);
  const end = new Date(start.getTime() + 2 * 36e5);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Samen//Oude Gracht-West//NL",
    "BEGIN:VEVENT",
    `UID:${e.id}@samen`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, "")}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${txt(e.title)}`,
    `LOCATION:${txt(e.place)}`,
    `DESCRIPTION:${txt(e.text)}`,
    "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${txt(e.title)}`, "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = `${e.title}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- Meldingen (gesimuleerd) ----------

const notes = D.notifications
  .filter((n) => n.after == null)
  .map((n) => ({ ...n, at: Date.now() - n.minutesAgo * 6e4, unread: true }))
  .sort((a, b) => b.at - a.at);

function since(t) {
  const m = Math.round((Date.now() - t) / 6e4);
  if (m < 1) return "Zojuist";
  if (m < 60) return `${m} min geleden`;
  return `${Math.round(m / 60)} uur geleden`;
}

const noteIcon = (n) => (n.from ? avatar(n.from) : `<span class="note-icon" aria-hidden="true">${n.icon || "🔔"}</span>`);

function updateBell(ring = false) {
  const unread = notes.filter((n) => n.unread).length;
  $("#bell-badge").textContent = unread;
  $("#bell-badge").hidden = !unread;
  if (ring) {
    $("#bell").classList.remove("ring");
    void $("#bell").offsetWidth;
    $("#bell").classList.add("ring");
  }
}

function notify(n) {
  const note = { ...n, at: Date.now(), unread: true };
  notes.unshift(note);
  updateBell(true);
  banners.push(note);
  if (banners.length === 1) showBanner();
}

// Banners één voor één, en niet terwijl er een venster open is
const banners = [];
function showBanner() {
  const n = banners[0];
  if (!n) return;
  if (document.querySelector("dialog[open]")) return void setTimeout(showBanner, 1000);
  $("#banner").innerHTML = `${noteIcon(n)}<span><span class="banner-app">${esc(D.appName)} · nu</span>${esc(n.text)}</span>`;
  $("#banner").classList.add("show");
  showBanner.timer = setTimeout(hideBanner, 5000);
}
function hideBanner() {
  clearTimeout(showBanner.timer);
  $("#banner").classList.remove("show");
  banners.shift();
  if (banners.length) setTimeout(showBanner, 500);
}
$("#banner").addEventListener("click", () => {
  const n = banners[0];
  hideBanner();
  if (n) openNote(n);
});

function openNote(n) {
  n.unread = false;
  updateBell();
  if (n.chat) openChat(n.chat);
  else if (n.link) navigate(n.link);
}

$("#bell").addEventListener("click", () => {
  $("#notif-list").innerHTML = notes.length
    ? notes.map((n, i) => `
      <button type="button" class="note ${n.unread ? "unread" : ""}" data-note="${i}">
        ${noteIcon(n)}<span>${esc(n.text)}<br><span class="small">${since(n.at)}</span></span>
      </button>`).join("")
    : `<p class="small">Nog geen meldingen.</p>`;
  $("#notifs").showModal();
  notes.forEach((n) => (n.unread = false));
  updateBell();
});

$("#notif-list").addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-note]");
  if (!b) return;
  $("#notifs").close();
  openNote(notes[b.dataset.note]);
});

// Meldingen uit data.js die na een tijdje binnenkomen
function startDemo() {
  if (startDemo.done) return;
  startDemo.done = true;
  for (const n of D.notifications) if (n.after != null) setTimeout(() => notify(n), n.after * 1000);
}

// Herinnering kort na 'Ik ga' voor iets van vandaag of morgen
const reminded = {};
function remind(e) {
  if (reminded[e.id]) return;
  reminded[e.id] = true;
  setTimeout(() => {
    if (S.going[e.id]) notify({ icon: "⏰", text: `Herinnering: ${e.title}, ${dateLabel(e.when).toLowerCase()} om ${e.time} in ${e.place}.`, link: "#overzicht" });
  }, 8000);
}

// Een buur reageert na een paar seconden op wat je zelf plaatst
function respondTo(post) {
  const r = D.responders[post.type];
  setTimeout(() => {
    if (post.type === "activiteit") {
      post.joined = [r.from];
      notify({ from: r.from, text: `${r.from} gaat ook naar "${post.title}"`, link: "#agenda" });
    } else {
      post.reactions = 1;
      S.chats[post.id] = { with: r.from, street: r.street, kind: "mine", msgs: [{ me: false, text: r.text }], replied: 0 };
      notify({ from: r.from, text: `${r.from} reageerde op "${post.title}"`, chat: post.id });
    }
    save();
    refresh();
  }, 8000);
}

// ---------- Gesprekken (gesimuleerd: de buur antwoordt vanzelf) ----------

function chatFor(h) {
  return (S.chats[h.id] ??= { with: h.author, street: h.street, kind: h.type, msgs: [], replied: 0 });
}

let chatId = null;

function openChat(id) {
  const h = helpPosts().find((p) => p.id === id);
  const c = S.chats[id];
  if (!h || !c) return;
  chatId = id;
  $("#chat-who").innerHTML = `${avatar(c.with)}<span><strong>${esc(c.with)}</strong><br><span class="small">${esc(c.street)}</span></span>`;
  $("#chat-about").textContent = `${cat(h.cat).icon} ${h.title}`;
  drawChat();
  if (!$("#chat").open) $("#chat").showModal();
}

function drawChat(fresh = false) {
  const c = S.chats[chatId];
  const last = c.msgs.length - 1;
  $("#chat-log").innerHTML =
    (c.kind === "mine" ? "" : `<p class="chat-note">${esc(c.with)} ziet je voornaam en straat.</p>`) +
    c.msgs.map((m, i) => `<p class="bubble ${m.me ? "me" : "them"} ${fresh && i === last ? "new" : ""}">${esc(m.text)}</p>`).join("");
  const chips = c.msgs.some((m) => m.me) ? [] : D.chat[c.kind].chips;
  $("#chat-chips").innerHTML = chips.map((t) => `<button type="button" class="chip">${esc(t)}</button>`).join("");
  $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
}

function sendChat(text) {
  const id = chatId;
  const c = S.chats[id];
  c.msgs.push({ me: true, text });
  save();
  drawChat(true);
  const reply = D.chat[c.kind].replies[c.replied++] ?? "👍";
  setTimeout(() => {
    if (chatId !== id) return;
    $("#chat-log").insertAdjacentHTML("beforeend", `<p class="bubble them typing" aria-label="${esc(c.with)} typt"><i></i><i></i><i></i></p>`);
    $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
  }, 600);
  setTimeout(() => {
    c.msgs.push({ me: false, text: reply });
    save();
    if (chatId === id) drawChat(true);
    else notify({ from: c.with, text: `${c.with}: ${reply}`, chat: id });
  }, 2200);
}

$("#chat-chips").addEventListener("click", (ev) => {
  const chip = ev.target.closest(".chip");
  if (chip) sendChat(chip.textContent);
});

$("#chat-form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const input = ev.target.elements.msg;
  const text = input.value.trim();
  input.value = "";
  if (text) sendChat(text);
});

$("#chat").addEventListener("close", () => {
  chatId = null;
  refresh();
});

// Onderin uitschuivende vensters: sluiten met ✕ of door ernaast te tikken
document.querySelectorAll("dialog.sheet").forEach((d) =>
  d.addEventListener("click", (ev) => {
    if (ev.target === d || ev.target.closest("[data-close]")) d.close();
  }));

// ---------- Verborgen reset: logo 5x snel tikken ----------

let taps = [];
$("#logo").addEventListener("click", () => {
  if (S.me) navigate("#overzicht");
  const now = Date.now();
  taps = [...taps.filter((t) => now - t < 2000), now];
  if (taps.length < 5) return;
  taps = [];
  if (confirm("Alles wissen en opnieuw beginnen? (voor de volgende tester)")) {
    localStorage.removeItem(KEY);
    location.replace(location.pathname);
  }
});

// ---------- Startanimatie: verdwijnt vanzelf, of tik om over te slaan ----------

const splash = $("#splash");
function hideSplash() {
  if (!splash.isConnected) return;
  splash.remove();
  if (S.me) {
    enter($("#main"));
    return startDemo();
  }
  enter($("#welcome-form"));
  $("#welcome input").focus();
}
splash.addEventListener("animationend", (ev) => {
  if (ev.target === splash) hideSplash();
});
splash.addEventListener("click", hideSplash);

// ---------- Start ----------

$("#app-name").textContent = $("#splash-name").textContent = D.appName;
$("#hood").textContent = $("#splash-hood").textContent = D.neighbourhood;
document.title = `${D.appName} · ${D.neighbourhood}`;
$("#welcome").hidden = !!S.me;
updateBell();
if (S.me) render();
