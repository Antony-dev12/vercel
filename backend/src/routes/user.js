/**
 * User Routes (all require auth)
 *
 * PUT    /api/user/profile  — update business name, sector, location, language
 * DELETE /api/user/account  — permanently delete account
 */

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { clearAuthCookie } from "../middleware/auth.js";

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// ── Update profile ────────────────────────────────────────────────────────────
router.put("/profile", async (req, res) => {
  const { name, businessName, sector, location, language, hasOnboarded } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name         !== undefined && { name: name.trim() || null }),
        ...(businessName !== undefined && { businessName: businessName.trim() || null }),
        ...(sector      !== undefined && { sector }),
        ...(location    !== undefined && { location }),
        ...(language    !== undefined && { language }),
        ...(hasOnboarded !== undefined && { hasOnboarded: Boolean(hasOnboarded) }),
      },
      select: { id: true, email: true, name: true, businessName: true, sector: true, location: true, language: true, hasOnboarded: true },
    });
    res.json({ user: updated });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Could not update profile." });
  }
});

// ── Delete account ────────────────────────────────────────────────────────────
router.delete("/account", async (req, res) => {
  try {
    // Cascade deletes scores, connections, reset tokens (configured in schema)
    await prisma.user.delete({ where: { id: req.user.id } });
    clearAuthCookie(res);
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: "Could not delete account." });
  }
});

export default router;
