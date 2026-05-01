import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  const search = (req.query.search as string) || "";
  const contacts = await prisma.contact.findMany({
    where: {
      ownerId: req.userId,
      OR: search
        ? [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(contacts);
});

router.post("/", async (req: AuthRequest, res) => {
  const c = await prisma.contact.create({ data: { ...req.body, ownerId: req.userId! } });
  res.json(c);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const c = await prisma.contact.findFirst({
    where: { id: req.params.id, ownerId: req.userId },
    include: { company: true, deals: true, activities: { orderBy: { createdAt: "desc" } } },
  });
  if (!c) return res.status(404).json({ error: "Not found" });
  res.json(c);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  const c = await prisma.contact.updateMany({
    where: { id: req.params.id, ownerId: req.userId },
    data: req.body,
  });
  res.json(c);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.contact.deleteMany({ where: { id: req.params.id, ownerId: req.userId } });
  res.json({ ok: true });
});

export default router;
