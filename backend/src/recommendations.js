/**
 * Rule-based Recommendation Engine
 * Generates bilingual (EN/SW) growth tips based on metric scores.
 *
 * When you're ready to upgrade to AI-powered recommendations,
 * see /src/ai.js — just uncomment it in server.js.
 */

const TOTAL_PLATFORMS = 7;

export function generateRecs({ profileComplete, postFreq, engagement, responsiveness, platforms }, lang = "en") {
  const sw = lang === "sw";
  const recs = [];
  const platformCount = platforms?.length || 0;
  const platformScore = Math.min(100, (platformCount / TOTAL_PLATFORMS) * 100);

  if (profileComplete < 60) {
    recs.push({
      icon: "📋",
      priority: "high",
      title: sw ? "Kamilisha Wasifu Wako" : "Complete Your Profile",
      desc: sw
        ? "Ongeza nambari ya simu, saa za kufungua, picha ya biashara, na maelezo mafupi kwenye kila jukwaa. Wateja 70% wanaangalia maelezo kamili kabla ya kuwasiliana."
        : "Add your phone number, opening hours, a profile photo, and a short bio to every platform. 70% of customers check for complete info before reaching out.",
    });
  }

  if (postFreq < 40) {
    recs.push({
      icon: "📅",
      priority: "high",
      title: sw ? "Chapisha Mara kwa Mara" : "Post More Consistently",
      desc: sw
        ? "Jaribu kuchapisha mara 4–5 kwa wiki. Tumia Canva kutengeneza picha nzuri kwa urahisi, na panga machapisho mapema kwa wiki nzima."
        : "Aim for 4–5 posts per week. Use Canva to create nice visuals easily, and batch-create a whole week of posts on Sunday.",
    });
  } else if (postFreq < 70) {
    recs.push({
      icon: "📅",
      priority: "mid",
      title: sw ? "Ongeza Mara za Kuchapisha" : "Increase Posting Frequency",
      desc: sw
        ? "Unachapisha vizuri! Kufikia kila siku kutakusaidia kukua haraka. Jaribu kuongeza siku 2 zaidi kwa wiki."
        : "Good posting habits! Going daily could accelerate your growth. Try adding 2 more posting days per week.",
    });
  }

  if (engagement < 40) {
    recs.push({
      icon: "💬",
      priority: "high",
      title: sw ? "Ongeza Mwingiliano" : "Boost Engagement",
      desc: sw
        ? "Uliza maswali mwisho wa kila chapisho. Fanya uchaguzi (polls) au mashindano madogo. Jibu maoni yote ndani ya masaa 24 — algorithms zinapenda hilo."
        : "End every post with a question. Run polls or small giveaways. Reply to every comment within 24 hours — the algorithms reward this heavily.",
    });
  }

  if (responsiveness < 60) {
    recs.push({
      icon: "⚡",
      priority: "mid",
      title: sw ? "Jibu Haraka Zaidi" : "Reply Faster to Messages",
      desc: sw
        ? "Weka ujumbe wa kiotometi wa WhatsApp ukisema utajibu hivi karibuni. Wateja wanaotakiwa muda mrefu mara nyingi wanakwenda kwa washindani."
        : "Set a WhatsApp auto-reply saying you'll respond soon. Customers who wait too long often go to a competitor. Aim for under 2 hours during business hours.",
    });
  }

  if (platformScore < 45) {
    recs.push({
      icon: "🌐",
      priority: "mid",
      title: sw ? "Ongeza Majukwaa Zaidi" : "Expand to More Platforms",
      desc: sw
        ? `Uko kwenye majukwaa ${platformCount} kati ya ${TOTAL_PLATFORMS}. Ongeza kwenye Google Maps kwanza — ni bure na husaidia wateja wa karibu kukupata haraka.`
        : `You're on ${platformCount} of ${TOTAL_PLATFORMS} platforms. Add Google Maps first — it's free and helps nearby customers find you instantly.`,
    });
  }

  if (profileComplete >= 80 && postFreq >= 70 && engagement >= 60) {
    recs.push({
      icon: "🚀",
      priority: "low",
      title: sw ? "Jaribu Matangazo ya Kulipwa" : "Try Paid Promotions",
      desc: sw
        ? "Msingi wako wa kidijitali ni imara sana! Matangazo ya Facebook na Instagram ya KES 200–500 kwa siku yanaweza kufikia watu 2,000+ katika mji wako."
        : "Your digital foundation is solid! Facebook/Instagram ads for KES 200–500 per day can reach 2,000+ people in your town — a great next step.",
    });
  }

  if (postFreq >= 60 && engagement >= 60) {
    recs.push({
      icon: "🎬",
      priority: "low",
      title: sw ? "Jaribu Video za Fupi" : "Try Short Videos",
      desc: sw
        ? "Machapisho ya video yanashirikiwa mara 3 zaidi kuliko picha. Jaribu TikTok au Reels — hata video ya sekunde 30 ya bidhaa yako inaweza kuleta wateja wengi."
        : "Video posts get 3x more shares than photos. Try TikTok or Instagram Reels — even a 30-second clip of your product or service can bring significant new customers.",
    });
  }

  if (recs.length === 0) {
    recs.push({
      icon: "🏆",
      priority: "low",
      title: sw ? "Unaifanya Vizuri Sana!" : "Excellent Work!",
      desc: sw
        ? "Alama yako ya kidijitali ni ya juu sana. Endelea kudumisha ubora na ushirikiano. Fikiria kushirikiana na biashara zingine za karibu kwa maudhui ya pamoja."
        : "Your digital presence score is excellent. Keep maintaining quality and engagement. Consider collaborating with other local businesses for cross-promotional content.",
    });
  }

  return recs;
}
