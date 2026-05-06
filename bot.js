const { Telegraf } = require("telegraf");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("👋 Bot Ready"));

bot.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: msg }] }]
        })
      }
    );

    const data = await res.json();

    console.log("FULL DATA:", data);

    // SAFE extract
    let reply = "❌ No response from AI";

    if (data.candidates && data.candidates.length > 0) {
      reply = data.candidates[0].content.parts[0].text;
    } else if (data.error) {
      reply = "❌ " + data.error.message;
    }

    ctx.reply(reply);

  } catch (err) {
    console.log("ERROR:", err);
    ctx.reply("❌ API error");
  }
});

bot.launch();
console.log("🚀 Bot Running...");
