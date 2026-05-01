import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  const stage = req.query.stage as string | undefined;
  const deals = await prisma.deal.findMany({
    where: { ownerId: req.userId, stage: stage || undefined },
    include: { contact: true, company: true },
    orderBy: { updatedAt: "desc" },
  });
  res.json(deals);
});

router.post("/", async (req: AuthRequest, res) => {
  const d = await prisma.deal.create({ data: { ...req.body, ownerId: req.userId! } });
  res.json(d);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  await prisma.deal.updateMany({ where: { id: req.params.id, ownerId: req.userId }, data: req.body });
  res.json({ ok: true });
});

router.patch("/:id/stage", async (req: AuthRequest, res) => {
  await prisma.deal.updateMany({
    where: { id: req.params.id, ownerId: req.userId },
    data: { stage: req.body.stage },
  });
  res.json({ ok: true });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.deal.deleteMany({ where: { id: req.params.id, ownerId: req.userId } });
  res.json({ ok: true });
});

export default router;
