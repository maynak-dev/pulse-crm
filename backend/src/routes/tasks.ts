import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  const tasks = await prisma.task.findMany({
    where: { ownerId: req.userId },
    orderBy: [{ done: "asc" }, { dueDate: "asc" }],
  });
  res.json(tasks);
});

router.post("/", async (req: AuthRequest, res) => {
  const t = await prisma.task.create({ data: { ...req.body, ownerId: req.userId! } });
  res.json(t);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  await prisma.task.updateMany({ where: { id: req.params.id, ownerId: req.userId }, data: req.body });
  res.json({ ok: true });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.task.deleteMany({ where: { id: req.params.id, ownerId: req.userId } });
  res.json({ ok: true });
});

export default router;
