const { Telegraf } = require("telegraf");

// Safe fetch for Railway / Node 22
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(
`👋 Welcome to AI Chat Bot 🤖

✨ আমি তোমার AI Assistant (Gemini 1.5 Flash)
💬 যেকোনো ভাষায় কথা বলতে পারো:
- বাংলা 🇧🇩
- Banglish ✍️
- English 🇬🇧

🚀 টাইপ করো, আমি উত্তর দিবো!`
  );
});

/* ================= CHAT ================= */
bot.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;

    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    // ✅ এখানে আমি মডেলের নাম ঠিক করে দিয়েছি: gemini-1.5-flash
    // আপনি চাইলে 'gemini-1.5-pro' ও ব্যবহার করতে পারেন
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: msg }]
            }
          ],
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 2048,
            topP: 0.95,
            topK: 40,
          }
        })
      }
    );

    const data = await res.json();

    let reply = "❌ কোনো উত্তর পাওয়া যায়নি";

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    } 
    else if (data?.error) {
      console.error("Gemini API Error:", data.error);
      reply = `❌ Error: ${data.error.message || "Unknown error"}`;
    }

    await ctx.reply(reply);

  } catch (err) {
    console.error("ERROR:", err);
    ctx.reply("❌ সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করো।");
  }
});

/* ================= LAUNCH BOT ================= */
bot.launch()
  .then(() => console.log("🚀 Gemini Bot is Running..."))
  .catch((err) => console.error("Bot Launch Error:", err));

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
