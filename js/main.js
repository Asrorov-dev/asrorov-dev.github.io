// Rejim (yorug' / qorong'i) har sahifada eslab qolinadi
try { if (localStorage.getItem('theme') === 'light') document.body.classList.add('light'); } catch (e) {}
const tm = document.getElementById('tm');
if (tm) tm.onclick = () => {
  document.body.classList.toggle('light');
  try { localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch (e) {}
};

// Elementlar sekin paydo bo'lishi
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), {threshold: .1});
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// Telegram botga xabar yuborish
const form = document.getElementById('mf');
if (form) {
  const st = document.getElementById('st'), sb = document.getElementById('sb');
  let last = 0;
  const say = (t, c) => { st.textContent = t; st.className = c || ''; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (f.website) return;
    if (!f.name.trim() || !f.contact.trim() || f.message.trim().length < 5) return say("Barcha maydonlarni to'ldiring.", 'err');
    if (Date.now() - last < 30000) return say("Iltimos, biroz kutib qayta yuboring.", 'err');
    const C = CONFIG;
    if (!C.WORKER_URL && !(C.BOT_TOKEN && C.CHAT_ID)) return say("Forma hali sozlanmagan (js/config.js).", 'err');
    sb.disabled = true; say("Yuborilmoqda...");
    const text = "Saytdan yangi xabar\n\nIsm: " + f.name.trim() + "\nAloqa: " + f.contact.trim() + "\n\n" + f.message.trim();
    try {
      const r = C.WORKER_URL
        ? await fetch(C.WORKER_URL, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name: f.name, contact: f.contact, message: f.message})})
        : await fetch('https://api.telegram.org/bot' + C.BOT_TOKEN + '/sendMessage', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({chat_id: C.CHAT_ID, text})});
      if (!r.ok) throw 0;
      last = Date.now(); form.reset(); say("Xabaringiz yuborildi. Rahmat!", 'ok');
    } catch (x) { say("Yuborib bo'lmadi. Telegram orqali yozing.", 'err'); }
    sb.disabled = false;
  });
}

// Qo'shimcha havolalar (js/config.js dagi LINKS dan)
(function () {
  if (typeof LINKS === 'undefined') return;
  const ic = {
    bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    git: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-4 1.3-4-2-6-2m12 4v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a13.4 13.4 0 0 0-7 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
    in: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v5M8 8h.01M12 16v-5m0 2a2.5 2.5 0 0 1 5 0v3"/></svg>'
  };
  const L = [];
  if (LINKS.BOT_USERNAME) L.push(['bot', 'https://t.me/' + LINKS.BOT_USERNAME.replace('@', ''), 'Yordamchi bot: @' + LINKS.BOT_USERNAME.replace('@', '')]);
  if (LINKS.EMAIL) L.push(['mail', 'mailto:' + LINKS.EMAIL, LINKS.EMAIL]);
  if (LINKS.GITHUB) L.push(['git', 'https://github.com/' + LINKS.GITHUB, 'GitHub: ' + LINKS.GITHUB]);
  if (LINKS.LINKEDIN) L.push(['in', 'https://linkedin.com/in/' + LINKS.LINKEDIN, 'LinkedIn: ' + LINKS.LINKEDIN]);
  const mk = (i, href, label, full) => {
    const a = document.createElement('a');
    a.href = href; a.setAttribute('aria-label', label);
    if (!href.startsWith('mailto')) { a.target = '_blank'; a.rel = 'noopener'; }
    a.innerHTML = ic[i] + (full ? label : '');
    return a;
  };
  document.querySelectorAll('.links').forEach(c => L.forEach(x => c.appendChild(mk(x[0], x[1], x[2], true))));
  document.querySelectorAll('.soc').forEach(c => L.forEach(x => c.appendChild(mk(x[0], x[1], x[2], false))));
})();
