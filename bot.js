const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ================= MULTI LANGUAGE AI ================= */
const systemPrompt = `
You are a smart AI assistant.

Rules:
- Understand Bangla, Banglish, English, Hindi, Arabic, and all languages
- Reply in same language user uses
- If mixed language, reply naturally mixed
- Be helpful and friendly
`;

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(
`🤖 Welcome ${ctx.from.first_name}

আমি AI Chat Bot 🤖
তুমি যেকোনো ভাষায় কথা বলতে পারো`
  );
});

/* ================= CHAT ================= */
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  try {
    ctx.sendChatAction("typing");

    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = res.data.choices[0].message.content;
    ctx.reply(reply);

  } catch (err) {
    console.log(err.message);
    ctx.reply("❌ Error occurred, try again later");
  }
});

/* ================= RUN ================= */
bot.launch();
console.log("🤖 Bot is running...");
