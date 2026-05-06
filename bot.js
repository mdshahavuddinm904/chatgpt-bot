const { Telegraf } = require("telegraf");

// node-fetch fix (Railway safe)
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
          ]
        })
      }
    );

    const data = await res.json();

    console.log("API RESPONSE:", JSON.stringify(data, null, 2));

    let reply = "❌ No response from AI";

    if (data?.candidates?.length > 0) {
      reply = data.candidates[0].content.parts[0].text;
    } else if (data?.error) {
      reply = "❌ " + data.error.message;
    }

    ctx.reply(reply);

  } catch (err) {
    console.log("ERROR:", err);
    ctx.reply("❌ API error occurred");
  }
});

/* ================= START BOT ================= */
bot.launch();
console.log("🚀 Bot Running...");
