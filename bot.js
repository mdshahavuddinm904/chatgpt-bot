const { Telegraf } = require("telegraf");

// Safe fetch for Railway / Node 22
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(
`👋 Welcome to AI Chat Bot 🤖

✨ আমি তোমার **Gemini 3.1 Pro** Assistant
💬 যেকোনো ভাষায় কথা বলতে পারো:
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

    // ✅ Gemini 3.1 Pro (Latest Pro Model)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
            temperature: 0.75,      // সৃজনশীলতা + যুক্তি ভালো রাখবে
            maxOutputTokens: 2048,  // লম্বা উত্তরের জন্য
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        })
      }
    );

    const data = await res.json();

    let reply = "❌ কোনো উত্তর পাওয়া যায়নি";

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
    ctx.reply("❌ সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করো।");
  }
});

/* ================= LAUNCH BOT ================= */
bot.launch()
  .then(() => console.log("🚀 Gemini 3.1 Pro Bot Running..."))
  .catch((err) => console.error("Bot Launch Error:", err));

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
