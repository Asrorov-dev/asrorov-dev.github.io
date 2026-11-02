// Cloudflare Worker: token saytda ko'rinmaydi, faqat shu yerda saqlanadi.
// Sozlamalar (Settings > Variables): BOT_TOKEN, CHAT_ID  (ikkalasini "Secret" qiling)

const cors = {
  "Access-Control-Allow-Origin": "*",   // saytni joylagach, o'z saytingiz manziliga almashtiring
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("Not allowed", { status: 405, headers: cors });

    let d;
    try { d = await req.json(); } catch { return new Response("Bad request", { status: 400, headers: cors }); }

    const name = String(d.name || "").trim().slice(0, 80);
    const contact = String(d.contact || "").trim().slice(0, 120);
    const message = String(d.message || "").trim().slice(0, 1500);
    if (!name || !contact || message.length < 5) return new Response("Bad request", { status: 400, headers: cors });

    const text = "Saytdan yangi xabar\n\nIsm: " + name + "\nAloqa: " + contact + "\n\n" + message;
    const r = await fetch("https://api.telegram.org/bot" + env.BOT_TOKEN + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text }),
    });
    return new Response(r.ok ? "OK" : "Error", { status: r.ok ? 200 : 502, headers: cors });
  },
};
