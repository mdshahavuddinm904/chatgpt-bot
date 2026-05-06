const { Telegraf } = require("telegraf");

// Safe fetch for Railway / Node 22+
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ================= START MESSAGE ================= */
bot.start((ctx) => {
  ctx.reply(
`👋 Welcome to AI Chat Bot 🤖

✨ আমি তোমার AI Assistant (Gemini 1.5)
💬 যেকোনো ভাষায় কথা বলতে পারো:
- বাংলা 🇧🇩
- Banglish ✍️
- English 🇬🇧

🚀 যেকোনো কিছু লিখে পাঠাও, আমি উত্তর দিচ্ছি!`
  );
});

/* ================= CHAT LOGIC ================= */
bot.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;

    // ইউজারকে বোঝানো যে বট টাইপ করছে
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    // ✅ Gemini v1 API URL (Updated)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: msg }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
        }
      })
    });

    const data = await res.json();

    let reply = "❌ দুঃখিত, কোনো উত্তর পাওয়া যায়নি।";

    // উত্তর চেক করা
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    } 
    else if (data?.error) {
      console.error("Gemini API Error:", data.error);
      reply = `❌ API Error: ${data.error.message}`;
    }

    await ctx.reply(reply);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    ctx.reply("❌ সার্ভারে একটু সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
  }
});

/* ================= LAUNCH BOT ================= */
bot.launch()
  .then(() => console.log("🚀 Bo hocche ai bot is Running..."))
  .catch((err) => console.error("Bot Launch Error:", err));

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
