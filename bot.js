require("dotenv").config();

const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ================= AI FUNCTION ================= */
async function askAI(text) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. You understand Bangla, Banglish, and English and reply in the same language the user uses."
          },
          {
            role: "user",
            content: text
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    return res.data.choices[0].message.content;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return "❌ Sorry, AI error occurred. Try again later.";
  }
}

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(
    "👋 Welcome to ChatGPT Bot\n\n💬 Just send any message and I will reply!"
  );
});

/* ================= MESSAGE HANDLER ================= */
bot.on("text", async (ctx) => {
  const userText = ctx.message.text;

  ctx.sendChatAction("typing");

  const reply = await askAI(userText);

  ctx.reply(reply);
});

/* ================= LAUNCH ================= */
bot.launch();
console.log("🚀 Bot is running...");
