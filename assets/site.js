/* Punch: shared behaviour for every page */
const $ = id => document.getElementById(id);

/* mobile menu */
const burger = $("burger"), mnav = $("mnav");
if (burger) burger.addEventListener("click", () => {
  const open = burger.classList.toggle("open");
  mnav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
});

/* reveal on scroll */
const rv = document.querySelectorAll(".rv");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } }), { threshold: .08 });
  rv.forEach(el => io.observe(el));
} else rv.forEach(el => el.classList.add("show"));

/* footer year */
document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

/* visit counter (counts once per session, only on the real domain) */
(async () => {
  const out = $("vn"); if (!out) return;
  try {
    let first = false;
    try { first = location.hostname === "heyimpunch.xyz" && !sessionStorage.getItem("hp-view"); } catch (_) {}
    const r = await fetch("https://abacus.jasoncameron.dev/" + (first ? "hit" : "get") + "/heyimpunch-xyz/visits");
    const j = await r.json();
    if (typeof j.value !== "number") throw 0;
    try { if (first) sessionStorage.setItem("hp-view", "1"); } catch (_) {}
    out.textContent = j.value.toLocaleString(); $("views").hidden = false;
  } catch (_) {}
})();

/* live Discord profile: avatar + status (shown on the site, not used for contact) */
(() => {
  const ID = "1495161901330464801";
  const LABEL = { online: "Online", idle: "Away", dnd: "Busy", offline: "Offline" };
  const render = d => {
    const u = d.discord_user || {};
    if (u.avatar) {
      const ext = u.avatar.startsWith("a_") ? "gif" : "png";
      document.querySelectorAll("[data-av]").forEach(i => i.src = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=256`);
    }
    const s = d.discord_status || "offline";
    document.querySelectorAll("[data-dot]").forEach(i => i.className = s);
    document.querySelectorAll("[data-status]").forEach(i => i.textContent = LABEL[s] || s);
  };
  if (!document.querySelector("[data-av],[data-status]")) return;
  fetch("https://api.lanyard.rest/v1/users/" + ID).then(r => r.json()).then(j => j.success && render(j.data)).catch(() => {});
  (function connect(retry = 1000) {
    let hb;
    const ws = new WebSocket("wss://api.lanyard.rest/socket");
    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.op === 1) { ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: ID } })); hb = setInterval(() => ws.readyState === 1 && ws.send(JSON.stringify({ op: 3 })), m.d.heartbeat_interval); }
      else if (m.op === 0) render(m.d[ID] || m.d);
    };
    ws.onclose = () => { clearInterval(hb); setTimeout(() => connect(Math.min(retry * 2, 30000)), retry); };
  })();
})();
