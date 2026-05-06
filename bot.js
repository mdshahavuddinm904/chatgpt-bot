const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ================= SYSTEM PROMPT ================= */
const systemPrompt = `
You are a smart multilingual assistant.

Rules:
- Understand ALL languages (Bangla, Banglish, English, Hindi, Arabic, etc.)
- Reply in SAME language user uses
- If user mixes languages, reply in mixed natural way
- Keep answers simple, helpful and friendly
`;

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(
`🤖 Hello ${ctx.from.first_name}

আমি একটি AI Chat Bot 🤖
তুমি যেকোনো ভাষায় কথা বলতে পারো (Bangla / English / Banglish)`
  );
});

/* ================= CHAT ================= */
bot.on("text", async (ctx) => {
  const userMessage = ctx.message.text;

  try {
    ctx.sendChatAction("typing");

    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
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
console.log("🤖 Multilingual ChatGPT Bot Running");
