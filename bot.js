const { Telegraf } = require("telegraf");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const bot = new Telegraf(process.env.BOT_TOKEN);

/* ================= MODELS ================= */
const TEXT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash"
];

// Image model (from your list)
const IMAGE_MODEL = "gemini-2.5-flash-image";

/* ================= START ================= */
bot.start((ctx) => {
  ctx.reply(
`👋 Welcome to AI Chat Bot 🤖

✨ Gemini AI Assistant
💬 Text + Image Generator

Commands:
👉 /img prompt (image generate)
👉 normal message (chat)`
  );
});

/* ================= TEXT AI ================= */
async function askGemini(text) {
  for (let model of TEXT_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }]
          })
        }
      );

      const data = await res.json();

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      if (data?.error) {
        console.log(`❌ ${model} error:`, data.error.message);
        continue;
      }

    } catch (err) {
      console.log(`❌ ${model} fetch error:`, err.message);
      continue;
    }
  }

  return "❌ AI এখন কাজ করছে না";
}

/* ================= IMAGE AI ================= */
async function generateImage(prompt) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await res.json();

    // Gemini image output (inline data / url)
    const img =
      data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;

    if (img?.data) {
      return Buffer.from(img.data, "base64");
    }

    return null;

  } catch (err) {
    console.log("IMAGE ERROR:", err.message);
    return null;
  }
}

/* ================= TEXT CHAT ================= */
bot.on("text", async (ctx) => {
  const msg = ctx.message.text;

  try {
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    const reply = await askGemini(msg);

    ctx.reply(reply);

  } catch (err) {
    ctx.reply("❌ সার্ভার সমস্যা");
  }
});

/* ================= IMAGE COMMAND ================= */
bot.command("img", async (ctx) => {
  const prompt = ctx.message.text.replace("/img", "").trim();

  if (!prompt) {
    return ctx.reply("⚠️ /img লিখে কিছু prompt দাও");
  }

  await ctx.reply("🎨 Image তৈরি হচ্ছে...");

  const image = await generateImage(prompt);

  if (!image) {
    return ctx.reply("❌ Image generate হয়নি");
  }

  ctx.replyWithPhoto({ source: image });
});

/* ================= LAUNCH ================= */
bot.launch()
  .then(() => console.log("🚀 Bot Running"))
  .catch((err) => console.log(err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
