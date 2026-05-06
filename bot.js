const { Telegraf } = require("telegraf");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ================= SPAM CONTROL ================= */
const userCooldown = new Map();

function isSpam(userId) {
  const now = Date.now();
  const last = userCooldown.get(userId);

  // 2 sec cooldown per user
  if (last && now - last < 2000) return true;

  userCooldown.set(userId, now);
  return false;
}

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(
`👋 Welcome to AI Bot 🤖

✨ Gemini AI Assistant
💬 Fast + Stable Chat

🚀 এখন মেসেজ দাও`
  );
});

/* ================= GEMINI ================= */
async function askGemini(text) {
  const model = "gemini-2.5-flash";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text }]
            }
          ]
        })
      }
    );

    const data = await res.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    if (data?.error) {
      console.log("API ERROR:", data.error.message);
      return "❌ AI এখন busy / quota issue";
    }

    return "❌ কোনো response পাওয়া যায়নি";

  } catch (err) {
    console.log("FETCH ERROR:", err.message);
    return "❌ নেটওয়ার্ক সমস্যা";
  }
}

/* ================= CHAT ================= */
bot.on("text", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const msg = ctx.message.text;

    // ❌ spam block
    if (isSpam(userId)) {
      return ctx.reply("⏳ একটু slow করো, বেশি fast message দেওয়া যাবে না");
    }

    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    const reply = await askGemini(msg);

    await ctx.reply(reply);

  } catch (err) {
    console.log("BOT ERROR:", err);
    ctx.reply("❌ Bot error, পরে চেষ্টা করো");
  }
});

/* ================= LAUNCH ================= */
bot.launch()
  .then(() => console.log("🚀 Bot Running Successfully"))
  .catch((err) => console.log("Launch Error:", err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
