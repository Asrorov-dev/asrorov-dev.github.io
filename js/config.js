// TELEGRAM SOZLAMASI. Faqat BITTA usulni to'ldiring.
// 1) Xavfsiz usul (tavsiya): WORKER_URL ga Cloudflare Worker manzilini yozing.
// 2) Oddiy usul: BOT_TOKEN va CHAT_ID ni yozing. Diqqat: sayt internetga chiqsa, token hammaga ko'rinadi.
const CONFIG = {
  WORKER_URL: "",
  BOT_TOKEN: "",
  CHAT_ID: "",

  // Yordamchi bot (sun'iy intellekt): bot/ai-worker.js ni Cloudflare'ga joylagach, manzilini shu yerga yozing
  CHAT_URL: ""
};

// SAYTDAGI HAVOLALAR. Bo'sh qoldirilganlari saytda ko'rinmaydi.
// Telefon, Telegram va Instagram sahifalarda doimiy turibdi; qolganlarini shu yerda to'ldiring.
const LINKS = {
  BOT_USERNAME: "asrorov_dev_bot",
  EMAIL: "abdugofurasrorov777@gmail.com",
  GITHUB: "",         // GitHub foydalanuvchi nomi
  LINKEDIN: ""        // LinkedIn foydalanuvchi nomi
};
