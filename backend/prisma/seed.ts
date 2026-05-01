import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@crm.dev" },
    update: {},
    create: { email: "demo@crm.dev", password, name: "Demo User" },
  });

  const acme = await prisma.company.create({
    data: { name: "Acme Inc", domain: "acme.com", industry: "SaaS", ownerId: user.id },
  });

  const contact = await prisma.contact.create({
    data: {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@acme.com",
      title: "CTO",
      companyId: acme.id,
      ownerId: user.id,
    },
  });

  await prisma.deal.createMany({
    data: [
      { title: "Acme — Pilot", value: 12000, stage: "qualified", ownerId: user.id, companyId: acme.id, contactId: contact.id },
      { title: "Acme — Expansion", value: 48000, stage: "proposal", ownerId: user.id, companyId: acme.id },
      { title: "Globex Ltd", value: 8000, stage: "lead", ownerId: user.id },
    ],
  });

  await prisma.task.createMany({
    data: [
      { title: "Follow up with Jane", ownerId: user.id, dueDate: new Date(Date.now() + 86400000) },
      { title: "Send proposal draft", ownerId: user.id },
    ],
  });

  console.log("Seeded. Login: demo@crm.dev / demo1234");
}

main().finally(() => prisma.$disconnect());
