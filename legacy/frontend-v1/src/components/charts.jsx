// ─── Score Ring SVG ──────────────────────────────────────────────────────────
export function ScoreRing({ score, size = 160 }) {
  const r = size * 0.39, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const g = getGrade(score);
  const color = gradeColor(g);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e2d2a" strokeWidth={size * 0.09} />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke={color}
        strokeWidth={size * 0.09}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.4s" }}
      />
    </svg>
  );
}

// ─── Sparkline chart ─────────────────────────────────────────────────────────
export function SparkLine({ data }) {
  if (data.length < 2) return null;
  const w = 100, h = 40;
  const scores = data.map(d => d.score);
  const min = Math.min(...scores), max = Math.max(...scores);
  const range = Math.max(max - min, 10);
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * w;
    const y = h - ((s - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 80, overflow: "visible" }}>
      <defs>
        <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#lg2)" />
      <polyline points={pts} fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {scores.map((s, i) => {
        const x = (i / (scores.length - 1)) * w;
        const y = h - ((s - min) / range) * (h - 8) - 4;
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#2DD4BF" />;
      })}
    </svg>
  );
}

// ─── Helpers (shared) ────────────────────────────────────────────────────────
export function getGrade(s) {
  if (s >= 80) return "A"; if (s >= 65) return "B";
  if (s >= 50) return "C"; if (s >= 35) return "D"; return "F";
}

export function gradeColor(g) {
  return { A: "#2DD4BF", B: "#4ade80", C: "#F59E0B", D: "#fb923c", F: "#ef4444" }[g] || "#2DD4BF";
}

export function calcLDVS({ profileComplete, postFreq, engagement, responsiveness, platforms }) {
  const ps = Math.min(100, ((platforms?.length || 0) / 7) * 100);
  return Math.max(0, Math.min(100, Math.round(
    profileComplete * 0.20 + postFreq * 0.20 + engagement * 0.25 + responsiveness * 0.20 + ps * 0.15
  )));
}

export function getTrend(history, t) {
  if (history.length < 2) return null;
  const last = history[history.length - 1].score;
  const prev = history[history.length - 2].score;
  const diff = last - prev;
  if (diff > 3)  return { label: t.improve, color: "#4ade80" };
  if (diff < -3) return { label: t.decline, color: "#ef4444" };
  return { label: t.stable, color: "#F59E0B" };
}
