const { Telegraf } = require("telegraf");

// Safe fetch for Railway / Node 22
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(
`👋 Welcome to AI Chat Bot 🤖

✨ আমি তোমার Smart AI Assistant
💬 তুমি আমাকে যেকোনো ভাষায় মেসেজ করতে পারো:
- বাংলা 🇧🇩
- Banglish ✍️
- English 🇬🇧

🚀 শুধু টাইপ করো, আমি reply দিবো!`
  );
});

/* ================= CHAT ================= */
bot.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;

    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    // ✅ Fixed URL with latest working model
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: msg }]
            }
          ],
          // Optional: Better response quality
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      }
    );

    const data = await res.json();

    console.log("API RESPONSE:", JSON.stringify(data, null, 2));

    let reply = "❌ No response from AI";

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    } 
    else if (data?.error) {
      reply = `❌ Error: ${data.error.message}`;
      console.error("Gemini API Error:", data.error);
    }

    await ctx.reply(reply);

  } catch (err) {
    console.error("ERROR:", err);
    ctx.reply("❌ সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করো।");
  }
});

/* ================= START BOT ================= */
bot.launch()
  .then(() => console.log("🚀 Bot Running..."))
  .catch((err) => console.error("Bot Launch Error:", err));

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
