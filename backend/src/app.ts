import express from "express";
import cors from "cors";
import "dotenv/config";

// Fail fast if JWT_SECRET is not set — prevents silent auth breakage in production
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is not set. Add it in your Vercel project settings.");
  } else {
    console.warn("⚠️  JWT_SECRET not set — using insecure dev fallback. Set it before deploying.");
    process.env.JWT_SECRET = "dev-only-insecure-secret";
  }
}

import authRoutes from "./routes/auth";
import contactsRoutes from "./routes/contacts";
import companiesRoutes from "./routes/companies";
import dealsRoutes from "./routes/deals";
import tasksRoutes from "./routes/tasks";
import dashboardRoutes from "./routes/dashboard";
import { requireAuth } from "./middleware/auth";

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.json({ ok: true, name: "CRM API" }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/contacts", requireAuth, contactsRoutes);
app.use("/api/companies", requireAuth, companiesRoutes);
app.use("/api/deals", requireAuth, dealsRoutes);
app.use("/api/tasks", requireAuth, tasksRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});