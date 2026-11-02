// Saytdagi yordamchi bot oynasi. Manzil js/config.js ichidagi CHAT_URL da.
(function () {
  const URL = (typeof CONFIG !== 'undefined' && CONFIG.CHAT_URL) || '';
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };

  const fab = el('button', 'cb-fab'); fab.setAttribute('aria-label', 'Yordamchi botni ochish');
  fab.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.4A8 8 0 1 1 21 12z"/></svg>';
  const panel = el('div', 'cb-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Yordamchi bot');
  const head = el('div', 'cb-head');
  const title = el('div', '', 'Yordamchi bot'); title.appendChild(el('small', '', 'Suhbat Abdug\'ofurga yetkaziladi'));
  const close = el('button', 'cb-x', '×'); close.setAttribute('aria-label', 'Yopish');
  head.append(title, close);
  const log = el('div', 'cb-log'); log.setAttribute('aria-live', 'polite');
  const chips = el('div', 'cb-chips');
  const form = el('form', 'cb-form');
  const input = el('input'); input.placeholder = 'Savolingizni yozing...'; input.maxLength = 500; input.setAttribute('aria-label', 'Xabar');
  const send = el('button', '', 'Yuborish'); send.type = 'submit';
  form.append(input, send);
  panel.append(head, log, chips, form);
  document.body.append(fab, panel);

  const history = [];
  const sid = Math.random().toString(36).slice(2, 8);
  let busy = false;
  const add = (who, text) => { const m = el('div', 'cb-m ' + who, text); log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };

  add('bot', "Salom! Men Abdug'ofurning yordamchi botiman. Savolingizga javob beraman va kerak bo'lsa uni Abdug'ofurga yetkazaman. Eslatma: suhbat unga ko'rinadi.");
  ["Siz kimsiz?", "Qanday bog'lanaman?", "Loyihalar haqida"].forEach(q => {
    const b = el('button', '', q); b.type = 'button'; b.onclick = () => ask(q); chips.appendChild(b);
  });

  async function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    chips.style.display = 'none';
    add('me', text); history.push({ role: 'user', content: text });
    input.value = '';
    if (!URL) { add('bot', "Yordamchi bot hali ulanmagan. (js/config.js ichidagi CHAT_URL ni to'ldiring.)"); return; }
    busy = true; send.disabled = true;
    const wait = add('bot', '...'); wait.classList.add('wait');
    try {
      const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sid, messages: history.slice(-10) }) });
      if (!r.ok) throw 0;
      const d = await r.json();
      const reply = (d.reply || '').trim() || "Kechirasiz, javob topa olmadim.";
      wait.textContent = reply; wait.classList.remove('wait');
      history.push({ role: 'assistant', content: reply });
    } catch (e) {
      wait.textContent = "Hozir javob bera olmayman. Iltimos, Contact sahifasi orqali yozing."; wait.classList.remove('wait');
      history.pop();
    }
    busy = false; send.disabled = false; log.scrollTop = log.scrollHeight; input.focus();
  }

  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  const toggle = open => { panel.classList.toggle('open', open); if (open) input.focus(); else fab.focus(); };
  fab.onclick = () => toggle(!panel.classList.contains('open'));
  close.onclick = () => toggle(false);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) toggle(false); });
})();
