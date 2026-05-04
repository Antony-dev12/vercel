/**
 * Auth middleware — verifies JWT from httpOnly cookie.
 * Attaches req.user = { id, email } on success.
 * Returns 401 if token is missing or invalid.
 */

import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies?.dpt_token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("dpt_token", token, {
    httpOnly: true,
    secure: isProd,
    // "none" is required for cross-origin requests (frontend/backend on different Render subdomains)
    // "lax" is fine for local dev (same origin)
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("dpt_token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 0,
    path: "/",
  });
}
