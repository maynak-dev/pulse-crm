import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  const companies = await prisma.company.findMany({
    where: { ownerId: req.userId },
    include: { _count: { select: { contacts: true, deals: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(companies);
});

router.post("/", async (req: AuthRequest, res) => {
  const c = await prisma.company.create({ data: { ...req.body, ownerId: req.userId! } });
  res.json(c);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const c = await prisma.company.findFirst({
    where: { id: req.params.id, ownerId: req.userId },
    include: { contacts: true, deals: true },
  });
  if (!c) return res.status(404).json({ error: "Not found" });
  res.json(c);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  await prisma.company.updateMany({ where: { id: req.params.id, ownerId: req.userId }, data: req.body });
  res.json({ ok: true });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.company.deleteMany({ where: { id: req.params.id, ownerId: req.userId } });
  res.json({ ok: true });
});

export default router;
