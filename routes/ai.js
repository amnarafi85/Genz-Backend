// routes/ai.js
import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const router = express.Router();

const LANG_MAP = {
  en: "English",
  ur: "Urdu",
  hi: "Hindi",
  ar: "Arabic",
  "roman-ur": "Roman Urdu",
};

// Expanded word count guidance
const LENGTH_WORDS = {
  short: "minimum 100–150 words",
  medium: "minimum 200–300 words",
  long: "minimum 400–600 words",
};

// Allow larger token limits
const LENGTH_TOKENS = { short: 400, medium: 700, long: 1000 };

router.post("/generate", async (req, res) => {
  try {
    const {
      platforms,
      article,
      language = "en",
      tone = "casual",
      hashtags = [],
      length = "long",
    } = req.body || {};

    if (!Array.isArray(platforms) || platforms.length === 0 || !article?.title) {
      return res.status(400).json({ ok: false, error: "Invalid request data" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
      return res
        .status(500)
        .json({ ok: false, error: "OPENAI_API_KEY not set" });

    const client = new OpenAI({ apiKey });
    const langName = LANG_MAP[language] || "English";
    const hashtagsText = hashtags.join(" ");
    const maxTokens = LENGTH_TOKENS[length] || 800;
    const lengthWords = LENGTH_WORDS[length] || "minimum 300 words";

    const generated = {};

    for (const platform of platforms) {
      try {
        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
You are a **world-class viral content creator & human storyteller**.  
Your posts must feel **100% human-written** — as if a real influencer typed them on their phone.  

💡 **STYLE RULES (VERY IMPORTANT)**  
- Always write in: ${langName}.  
- Strictly follow tone: ${tone}.  
- Use **natural pauses** with line breaks, dots (...), dashes (—).  
- Use emojis naturally 🎉🔥😂 (lots for Instagram/Twitter, subtle for LinkedIn, balanced for Facebook/YouTube).  
- Break content into **short paragraphs** for easy scrolling.  
- Feel raw, emotional, authentic — like you’re speaking directly to the audience.  

🎭 **TONE DEFINITIONS**  
- **informal** → friendly, chatty, relaxed 😎.  
- **funny** → witty, meme-style humor 😂🤣.  
- **professional** → polished, smart, corporate 💼.  
- **neutral** → simple, balanced, clear.  

🔥 **CONTENT RULES**  
- Posts must be **very long** (at least ${lengthWords}), never short.  
- Start with a **scroll-stopping hook** (question, bold fact, or shocking line).  
- Use **lots of engaging questions** (5–7+) to spark curiosity.  
- Flow like a conversation, not a summary.  
- Must include **minimum 20 unique hashtags** spread naturally.  
- Always encourage interaction (likes, shares, comments).  
- Write like a **viral human influencer**, never robotic.  

🎯 **PLATFORM STYLES**  
- **Instagram / TikTok** → Fun, emoji-rich, trendy vibes, playful.  
- **Twitter/X** → Punchy threads, strong hooks, conversational with hashtags.  
- **LinkedIn** → Professional, storytelling, inspirational, light emojis only.  
- **Facebook** → Long, casual, personal, question-driven, family vibe.  
- **YouTube** → Engaging description, with call to action to like/subscribe.  

📏 **STRICT REQUIREMENTS**  
1. Must be written in ${langName}.  
2. Must strictly follow ${tone} tone.  
3. Must be very long (minimum ${lengthWords}).  
4. Must include at least 20 hashtags.  
5. Must have line breaks, natural pauses, and emojis.  
6. Must include 5–7+ engaging questions.  
7. Must feel **100% human, influencer-style**.  
              `,
            },
            {
              role: "user",
              content: `
Platform: ${platform}
Tone: ${tone}
Article Title: ${article.title}
Description: ${article.description || "N/A"}
URL: ${article.url || ""}
Source: ${article.source || ""}
Hashtags (add minimum 20): ${hashtagsText}
Length: ${length} (${lengthWords})

⚠️ IMPORTANT:  
- Use ${langName} only.  
- Strictly follow ${tone} tone.  
- Write **very long**.  
- Add at least **20 hashtags**.  
- Use **line breaks + pauses + emojis**.  
- Make it **human-like, influencer-style, eye-catching & entertaining**.  
              `,
            },
          ],
          max_tokens: maxTokens,
          temperature: 0.95,
        });

        const text =
          completion?.choices?.[0]?.message?.content?.trim() ||
          "⚠️ No content generated";
        generated[platform] = { text };
      } catch (err) {
        console.error(`❌ Error generating for ${platform}:`, err);
        generated[platform] = { error: err?.message || "Generation failed" };
      }
    }

    return res.json({ ok: true, generated });
  } catch (error) {
    console.error("❌ Error in /api/generate:", error);
    return res
      .status(500)
      .json({ ok: false, error: "Failed to generate content" });
  }
});

export default router;
