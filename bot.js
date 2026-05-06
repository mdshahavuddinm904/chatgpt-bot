const { Telegraf } = require("telegraf");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(`👋 Welcome to AI Chat Bot 🤖

✨ আমি তোমার **Gemini 2.5 Flash** Assistant
💬 যেকোনো ভাষায় কথা বলো — বাংলা, Banglish, English

🚀 টাইপ করো!`);
});

/* ================= CHAT ================= */
bot.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: msg }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          }
        })
      }
    );

    const data = await res.json();

    let reply = "❌ কোনো উত্তর পাওয়া যায়নি";

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    } else if (data?.error) {
      reply = `❌ ${data.error.message}`;
      console.error("API Error:", data.error);
    }

    await ctx.reply(reply);

  } catch (err) {
    console.error("ERROR:", err);
    ctx.reply("❌ সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করো।");
  }
});

bot.launch()
  .then(() => console.log("🚀 Bot Running with Gemini 2.5 Flash..."))
  .catch(err => console.error(err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
