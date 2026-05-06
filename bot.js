const { Telegraf } = require("telegraf");

// Node 22 safe fetch
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const bot = new Telegraf(process.env.BOT_TOKEN);

// ✅ Models (from your list)
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash"
];

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(
`👋 Welcome to AI Chat Bot 🤖

✨ আমি তোমার Gemini AI Assistant
💬 বাংলা / English / Banglish সাপোর্ট করি

🚀 এখন শুধু টাইপ করো!`
  );
});

/* ================= GEMINI CALL ================= */
async function askGemini(text, modelIndex = 0) {
  if (modelIndex >= MODELS.length) {
    return "❌ সব model fail করেছে, পরে আবার চেষ্টা করো।";
  }

  const model = MODELS[modelIndex];

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
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      }
    );

    const data = await res.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    // ❌ যদি error হয় → next model try করবে
    console.log(`Model failed: ${model}`, data?.error?.message);
    return await askGemini(text, modelIndex + 1);

  } catch (err) {
    console.log("Fetch error:", err.message);
    return await askGemini(text, modelIndex + 1);
  }
}

/* ================= CHAT ================= */
bot.on("text", async (ctx) => {
  const msg = ctx.message.text;

  try {
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    const reply = await askGemini(msg);

    await ctx.reply(reply);

  } catch (err) {
    console.log("BOT ERROR:", err);
    ctx.reply("❌ সার্ভারে সমস্যা হয়েছে, পরে চেষ্টা করো।");
  }
});

/* ================= LAUNCH ================= */
bot.launch()
  .then(() => console.log("🚀 Bot Running Successfully"))
  .catch((err) => console.log("Launch Error:", err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
