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
