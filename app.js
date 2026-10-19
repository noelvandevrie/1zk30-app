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
  const empty = { me: null, going: {}, helped: {}, posts: [] };
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
  const mine = S.posts.filter((p) => p.type === "activiteit").map((p) => ({ ...p, when: parseDate(p.date), going: [] }));
  const seed = D.events.map((e) => ({ ...e, when: addDays(e.days) }));
  return [...mine, ...seed]
    .filter((e) => e.when >= today)
    .sort((a, b) => a.when - b.when || a.time.localeCompare(b.time));
}

function helpPosts() {
  const mine = S.posts.filter((p) => p.type !== "activiteit").map((p) => ({ ...p, when: new Date(p.created), reactions: 0 }));
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
  <article class="card">
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
    <button class="btn ${me ? "on" : "primary"}" data-go="${esc(e.id)}" aria-pressed="${me}">
      ${me ? "✓ Ik ga" : "Ik ga"}
    </button>
  </article>`;
}

function reactionText(n) {
  if (n === 0) return "";
  return `<p class="reactions">💬 ${n} ${n === 1 ? "buur reageerde" : "buren reageerden"}</p>`;
}

function helpCard(h) {
  const helped = !!S.helped[h.id];
  const offer = h.type === "aanbod";
  let action;
  if (h.mine) action = `<p class="small">Dit is jouw bericht</p>`;
  else if (helped) action = `<button class="btn on" disabled>✓ Je hebt gereageerd</button>`;
  else action = `<button class="btn primary" data-help="${esc(h.id)}">${offer ? "Graag!" : "Ik help!"}</button>`;
  return `
  <article class="card">
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

function render() {
  const view = location.hash.slice(1);
  const name = views[view] ? view : "overzicht";
  $("#main").innerHTML = views[name]();
  document.querySelectorAll(".tabs a").forEach((a) =>
    a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + name));
  $("#profile-btn").innerHTML = S.me ? avatar(S.me.name) : "";
}

function navigate(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

window.addEventListener("hashchange", () => {
  if (location.hash === "#plaatsen") postType = "activiteit";
  render();
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
    if (S.going[id]) toast("Leuk! Je staat op de lijst.");
    return;
  }
  const help = ev.target.closest("[data-help]");
  if (help) {
    const h = helpPosts().find((p) => p.id === help.dataset.help);
    S.helped[h.id] = true;
    save();
    render();
    $("#confirm-text").textContent = `${h.author} is op de hoogte en neemt contact met je op.`;
    $("#confirm").showModal();
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
  if (f.type === "activiteit") {
    S.posts.unshift({ ...base, date: f.at.slice(0, 10), time: f.at.slice(11, 16), place: f.place.trim() });
    S.going[id] = true;
  } else {
    S.posts.unshift({ ...base, text: f.text.trim(), author: S.me.name, street: S.me.street, created: Date.now() });
  }
  save();
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
  $("#welcome").hidden = true;
  render();
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
  if (!S.me) $("#welcome input").focus();
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
if (S.me) render();
