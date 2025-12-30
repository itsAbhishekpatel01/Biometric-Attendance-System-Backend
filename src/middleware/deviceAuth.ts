import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

export interface DeviceRequest extends Request {
  device?: {
    id: string;
    deviceId: string;
    name: string;
    token: string;
    createdAt: Date;
  };
}

export async function deviceAuth(
  req: DeviceRequest,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ message: "Missing token" });

  const token = auth.replace("Bearer ", "");

  try {
    const device = await prisma.device.findUnique({
      where: { token },
    });

    if (!device)
      return res.status(401).json({ message: "Invalid device token" });

    req.device = device;
    next();
  } catch (error) {
    console.error("Device auth error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
}
