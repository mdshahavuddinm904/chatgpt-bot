const { Telegraf } = require("telegraf");

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

/* ================= HELP ================= */
bot.help((ctx) => {
  ctx.reply(
`📖 Help Menu

💬 শুধু মেসেজ পাঠাও
🤖 আমি তোমার প্রশ্নের উত্তর দিবো

Examples:
- hello
- তুমি কেমন আছো?
- what is AI?`
  );
});

/* ================= CHAT ================= */
bot.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;

    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "❌ No response from AI";

    ctx.reply(reply);

  } catch (err) {
    console.log(err);
    ctx.reply("❌ Error occurred, try again later");
  }
});

/* ================= RUN ================= */
bot.launch();
console.log("🚀 Bot Running...");
