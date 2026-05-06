const { Telegraf } = require("telegraf");
const OpenAI = require("openai");

// Railway variables থেকে token নেয়
const bot = new Telegraf(process.env.BOT_TOKEN);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(`👋 Welcome!

🤖 I am your AI Chat Bot

💬 You can talk with me in:
- English
- বাংলা
- Banglish

👉 Just send a message`);
});

/* ================= HELP ================= */
bot.command("help", (ctx) => {
  ctx.reply(`📖 Help Menu

💬 Just send any message
🌍 Supports all languages

Examples:
- Hello
- tumi kemon aso
- আমি কি করতে পারি?`);
});

/* ================= CHAT ================= */
bot.on("text", async (ctx) => {
  try {
    const userMsg = ctx.message.text;

    // typing দেখাবে
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Reply in same language user uses (Bangla, Banglish, English). Keep answers simple and friendly."
        },
        {
          role: "user",
          content: userMsg
        }
      ]
    });

    const reply = res.choices[0].message.content;

    ctx.reply(reply);

  } catch (err) {
    console.log(err);
    ctx.reply("❌ Error occurred, try again later");
  }
});

/* ================= ERROR ================= */
bot.catch((err) => {
  console.log("Bot Error:", err);
});

/* ================= RUN ================= */
bot.launch();
console.log("🚀 Bot Running...");
