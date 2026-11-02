// Cloudflare Worker: saytdagi yordamchi bot.
// 1) Mehmon savoliga sun'iy intellekt javob beradi.
// 2) Har bir suhbat hisobot sifatida SIZNING Telegramingizga yuboriladi.
// 3) Mehmon bog'lanmoqchi bo'lsa (ism + aloqa), alohida "YANGI MIJOZ SO'ROVI" xabari keladi.
//
// Sozlamalar (Worker > Settings > Variables and Secrets):
//   ANTHROPIC_KEY  (Secret) - Anthropic API kaliti
//   BOT_TOKEN      (Secret) - Telegram bot tokeni (BotFather bergan)
//   CHAT_ID        (Text)   - sizning Telegram chat ID raqamingiz
//   ALLOWED_ORIGIN (Text)   - sayt manzili (sinov uchun bo'sh qoldirsa bo'ladi)

const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM = `Sen Abdug'ofur Asrorovning shaxsiy veb-saytidagi yordamchi botsan (uning virtual yordamchisi). Mehmonlarga qisqa, do'stona va aniq javob berasan.

Abdug'ofur haqida FAQAT shu ma'lumotlarni bilasan:
- To'liq ismi: Abdug'ofur Asrorov. Dasturiy injiniring yo'nalishi talabasi.
- Qiziqishlari: veb-saytlar, sun'iy intellekt, mobil ilovalar, 3D modellar.
- Saytdagi loyiha: shaxsiy veb-sayt (HTML, CSS, JavaScript). Yangi loyihalar qo'shib boriladi.
- Aloqa: Telegram @Asr_r_v_06, Instagram _Asrorov.06_, yoki saytdagi Contact sahifasidagi forma.

Qoidalar:
1. Yuqoridagidan tashqari narsani (yoshi, joyi, ish tajribasi, narxlar, bo'sh vaqti va hokazo) to'qima. Bilmasang, "Bu haqda ma'lumotim yo'q, lekin savolingizni Abdug'ofurga yetkazaman" de va mehmondan ismi va aloqa usulini so'ra.
2. Telefon raqami va boshqa shaxsiy ma'lumotlarni berma. Aloqa uchun Telegram yoki formani ko'rsat.
3. Dasturlash, veb-saytlar va o'rganish haqidagi oddiy savollarga qisqa yordam bera olasan.
4. Zararli, noqonuniy yoki saytga aloqasi yo'q uzun so'rovlarni xushmuomalalik bilan rad et.
5. Foydalanuvchi qaysi tilda yozsa, shu tilda javob ber (asosan o'zbekcha). Javob 4-5 gapdan oshmasin.
6. Mehmon Abdug'ofur bilan bog'lanmoqchi bo'lsa, ish yoki buyurtma taklif qilsa, yoki savolingni unga yetkazishni so'rasa: avval ismini va aloqa usulini (Telegram yoki telefon) muloyimlik bilan so'ra. IKKALASINI olgach, javobingning eng oxirida, alohida qatorda shu formatda yoz (mehmon bu qatorni ko'rmaydi):
[[LEAD|ism|aloqa|so'rov mazmuni 1 gapda]]
Ismi yoki aloqasi hali yo'q bo'lsa, bu qatorni yozma. Mehmonga "Abdug'ofurga yetkazdim" deb ayt.`;

const clean = (s, n) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);

async function tg(env, text) {
  if (!env.BOT_TOKEN || !env.CHAT_ID) return;
  await fetch("https://api.telegram.org/bot" + env.BOT_TOKEN + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.CHAT_ID, text: text.slice(0, 4000) }),
  }).catch(() => {});
}

export default {
  async fetch(req, env, ctx) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return json({ error: "Not allowed" }, 405);

    let body;
    try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }

    const sid = clean(body.sid, 12) || "noma'lum";
    let msgs = (Array.isArray(body.messages) ? body.messages : [])
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content.slice(0, 600) }));
    while (msgs.length && msgs[0].role !== "user") msgs.shift();
    if (!msgs.length || msgs[msgs.length - 1].role !== "user") return json({ error: "Bad request" }, 400);

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, system: SYSTEM, messages: msgs }),
    });
    if (!r.ok) {
      ctx.waitUntil(tg(env, "Bot xatosi: AI javob bera olmadi (suhbat #" + sid + "). API kalit yoki hisobni tekshiring."));
      return json({ error: "AI xatosi" }, 502);
    }
    const data = await r.json();
    let reply = (data.content && data.content[0] && data.content[0].text) || "";

    // Mijoz so'rovini ajratib olish va mehmondan yashirish
    const m = reply.match(/\[\[LEAD\|([^|\]]*)\|([^|\]]*)\|([^\]]*)\]\]/);
    reply = reply.replace(/\[\[LEAD[^\]]*\]\]/g, "").trim();

    // Hisobotlar sizning Telegramingizga
    const lastQ = msgs[msgs.length - 1].content;
    ctx.waitUntil(tg(env, "Suhbat #" + sid + "\n\nMehmon: " + clean(lastQ, 500) + "\n\nBot: " + clean(reply, 600)));
    if (m) {
      ctx.waitUntil(tg(env,
        "YANGI MIJOZ SO'ROVI (suhbat #" + sid + ")\n\nIsm: " + clean(m[1], 80) +
        "\nAloqa: " + clean(m[2], 120) + "\nSo'rov: " + clean(m[3], 300)));
    }
    return json({ reply: reply || "Kechirasiz, javob topa olmadim." });
  },
};
