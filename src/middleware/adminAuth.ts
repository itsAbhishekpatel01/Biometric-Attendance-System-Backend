import type { Request, Response, NextFunction } from "express";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ message: "Missing admin token" });

  const token = auth.replace("Bearer ", "");

  if (token !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ message: "Invalid admin credentials" });

  next();
}
