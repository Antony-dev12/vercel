/**
 * AI-Powered Recommendation Engine
 * ════════════════════════════════════════════════════════════════
 * STATUS: READY TO ACTIVATE — just add your API key to .env
 *
 * To enable:
 *  1. Add ANTHROPIC_API_KEY=your_key_here  to your .env file
 *     (OR use OPENAI_API_KEY=your_key_here for OpenAI GPT-4)
 *  2. Run: npm install @anthropic-ai/sdk   (or: npm install openai)
 *  3. In server.js, uncomment the import and the getAIRecommendations call
 *
 * Cost estimate: ~KES 0.50–2 per recommendation call at current pricing
 * ════════════════════════════════════════════════════════════════
 */

// import Anthropic from "@anthropic-ai/sdk";
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── OR use OpenAI instead ──
// import OpenAI from "openai";
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates rich, context-aware, bilingual recommendations using Claude or GPT.
 * Falls back to rule-based recs if the API call fails.
 */
export async function getAIRecommendations({
  score, profileComplete, postFreq, engagement, responsiveness,
  platforms, businessName, sector, location, language = "en",
}) {

  const langInstruction = language === "sw"
    ? "Respond ENTIRELY in Swahili (Kiswahili). Use simple, everyday language suitable for a Kenyan business owner."
    : "Respond in English. Use simple, jargon-free language suitable for a Kenyan SME owner.";

  const prompt = `
You are a digital marketing expert specializing in helping Kenyan small businesses grow their online presence.

Analyze the following business metrics and provide 3-5 specific, actionable growth recommendations.

Business Details:
- Name: ${businessName || "Unknown"}
- Sector: ${sector || "General"}
- Location: ${location || "Kenya"}
- Active Platforms: ${platforms?.join(", ") || "None specified"}

Digital Presence Scores (0-100):
- Profile Completeness: ${profileComplete}/100
- Posting Frequency: ${postFreq}/100
- Engagement Level: ${engagement}/100
- Responsiveness: ${responsiveness}/100
- Overall LDVS Score: ${score}/100

${langInstruction}

Return a JSON array of recommendations. Each recommendation must have:
- icon: (single emoji)
- priority: "high" | "mid" | "low"  
- title: (short, max 5 words)
- desc: (2-3 sentences, specific and actionable for a Kenyan SME)

Return ONLY the JSON array. No markdown, no preamble.
Example format:
[{"icon":"📱","priority":"high","title":"Activate WhatsApp Business","desc":"..."}]
`;

  try {
    // ── CLAUDE (Anthropic) ──────────────────────────────────────────────
    // const message = await anthropic.messages.create({
    //   model: "claude-opus-4-6",
    //   max_tokens: 1024,
    //   messages: [{ role: "user", content: prompt }],
    // });
    // const text = message.content[0].text;
    // return JSON.parse(text);

    // ── OPENAI (GPT-4) ──────────────────────────────────────────────────
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4o-mini", // Cheaper option, still very good
    //   messages: [{ role: "user", content: prompt }],
    //   response_format: { type: "json_object" },
    // });
    // return JSON.parse(response.choices[0].message.content);

    throw new Error("AI module not activated yet — uncomment one of the blocks above");

  } catch (err) {
    console.warn("AI recommendations unavailable, falling back to rule-based:", err.message);
    // Import and use rule-based fallback
    const { generateRecs } = await import("./recommendations.js");
    return generateRecs({ profileComplete, postFreq, engagement, responsiveness, platforms }, language);
  }
}
