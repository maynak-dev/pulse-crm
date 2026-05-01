import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

router.post("/register", async (req, res) => {
  const parsed = credSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, name } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email already registered" });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash, name: name || email.split("@")[0] } });
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.post("/login", async (req, res) => {
  const parsed = credSchema.pick({ email: true, password: true }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, role: true },
  });
  res.json(user);
});

export default router;
