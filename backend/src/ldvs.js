/**
 * LDVS Algorithm
 * Local Digital Visibility Score — weighted average of 5 indicators.
 *
 * Weights are provisional. Update the WEIGHTS object when N1 delivers
 * the research-validated weights from the AHP study.
 */

export const WEIGHTS = {
  profileComplete:  0.20,
  postFreq:         0.20,
  engagement:       0.25,
  responsiveness:   0.20,
  platformPresence: 0.15,
};

const TOTAL_PLATFORMS = 7; // WhatsApp, FB, IG, TikTok, Twitter/X, Website, Google Maps

export function calcLDVS({ profileComplete, postFreq, engagement, responsiveness, platforms }) {
  const platformScore = Math.min(100, ((platforms?.length || 0) / TOTAL_PLATFORMS) * 100);

  const score = Math.round(
    profileComplete * WEIGHTS.profileComplete +
    postFreq        * WEIGHTS.postFreq +
    engagement      * WEIGHTS.engagement +
    responsiveness  * WEIGHTS.responsiveness +
    platformScore   * WEIGHTS.platformPresence
  );

  return Math.max(0, Math.min(100, score));
}

export function getGrade(score) {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}
