// ─── Shared UI primitives ────────────────────────────────────────────────────

export function Card({ children, style }) {
  return (
    <div style={{ background: "#111814", border: "1px solid #1e2d2a", borderRadius: 18, padding: 24, marginBottom: 16, ...style }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: "#7a9e99", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 20 }}>
      {children}
    </div>
  );
}

export function Empty({ icon, title, desc }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 24px" }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: "#7a9e99" }}>{desc}</div>
    </div>
  );
}

export function FormGroup({ label, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: style?.gridColumn }}>
      <label style={{ fontSize: 12, color: "#7a9e99", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ ...props }) {
  return (
    <input
      className="fi"
      {...props}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select className="fi" {...props}>
      {children}
    </select>
  );
}

export function Button({ children, variant = "primary", disabled, onClick, style, type = "button" }) {
  const base = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    border: "none",
    borderRadius: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    padding: "13px 20px",
    width: "100%",
    ...style,
  };
  const variants = {
    primary: { background: disabled ? "#1e2d2a" : "linear-gradient(135deg, #2DD4BF, #1a8073)", color: disabled ? "#7a9e99" : "#080e0c" },
    ghost:   { background: "transparent", color: "#7a9e99", border: "1px solid #253330" },
    danger:  { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" },
    teal:    { background: "rgba(45,212,191,0.12)", color: "#2DD4BF", border: "1px solid rgba(45,212,191,0.3)" },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

export function Spinner({ size = 16 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: "2px solid rgba(45,212,191,0.3)", borderTopColor: "#2DD4BF",
      borderRadius: "50%", animation: "spin 0.6s linear infinite",
      verticalAlign: "middle", marginRight: 8,
    }} />
  );
}

export function Badge({ children, color = "#2DD4BF", bg }) {
  return (
    <span style={{
      fontSize: 11, padding: "3px 9px", borderRadius: 99, fontWeight: 700,
      background: bg || `rgba(${hexToRgb(color)}, 0.15)`,
      color,
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

export function Divider() {
  return <div style={{ height: 1, background: "#1e2d2a", margin: "20px 0" }} />;
}
