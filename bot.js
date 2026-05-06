require("dotenv").config();

const { Telegraf } = require("telegraf");
const OpenAI = require("openai");

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
- Bangla
- Banglish

Type anything...`);
});

/* ================= HELP ================= */
bot.command("help", (ctx) => {
  ctx.reply(`📖 Help Menu

💬 Just send any message
🤖 I will reply using AI

🌍 Supports all languages`);
});

/* ================= CHAT SYSTEM ================= */
bot.on("text", async (ctx) => {
  try {
    const userMsg = ctx.message.text;

    // typing indicator
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a friendly helpful assistant. Reply in user's language (Bangla, Banglish, English automatically)."
        },
        {
          role: "user",
          content: userMsg
        }
      ]
    });

    const reply = response.choices[0].message.content;

    ctx.reply(reply);

  } catch (err) {
    console.error(err);
    ctx.reply("❌ Error occurred. Try again later.");
  }
});

/* ================= ERROR HANDLE ================= */
bot.catch((err) => {
  console.error("Bot Error:", err);
});

/* ================= LAUNCH ================= */
bot.launch();
console.log("🚀 Bot Running...");

/* ================= STOP (optional) ================= */
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
