import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { sub: string };
    req.userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
