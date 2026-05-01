import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  const ownerId = req.userId!;
  const [contacts, companies, deals, tasksOpen, won] = await Promise.all([
    prisma.contact.count({ where: { ownerId } }),
    prisma.company.count({ where: { ownerId } }),
    prisma.deal.findMany({ where: { ownerId } }),
    prisma.task.count({ where: { ownerId, done: false } }),
    prisma.deal.aggregate({ where: { ownerId, stage: "won" }, _sum: { value: true } }),
  ]);
  const pipelineValue = deals.filter((d) => !["won", "lost"].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const byStage: Record<string, number> = {};
  deals.forEach((d) => (byStage[d.stage] = (byStage[d.stage] || 0) + 1));
  res.json({
    contacts,
    companies,
    deals: deals.length,
    tasksOpen,
    wonRevenue: won._sum.value || 0,
    pipelineValue,
    byStage,
  });
});

export default router;
