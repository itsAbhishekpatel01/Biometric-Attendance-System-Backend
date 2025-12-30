import { Router } from "express";
import type { Response } from "express";
import { deviceAuth } from "../middleware/deviceAuth";
import type { DeviceRequest } from "../middleware/deviceAuth";
import { adminAuth } from "../middleware/adminAuth";
import prisma from "../lib/prisma";

const router = Router();

// Device endpoint: Mark attendance
router.post("/mark", deviceAuth, async (req: DeviceRequest, res: Response) => {
  try {
    const { userId, event, confidence } = req.body;
    const device = req.device!;

    if (!userId || !event) {
      return res.status(400).json({ message: "userId and event are required" });
    }

    // Validate event type
    if (!["IN", "OUT"].includes(event)) {
      return res.status(400).json({ message: "Event must be 'IN' or 'OUT'" });
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const attendance = await prisma.attendance.create({
      data: {
        event,
        confidence: confidence ?? null,
        userId,
        deviceId: device.id,
      },
      include: {
        user: true,
        device: true,
      },
    });

    return res.json({ success: true, attendance });
  } catch (error) {
    console.error("Attendance marking error:", error);
    return res.status(500).json({ message: "Failed to mark attendance" });
  }
});

// Admin endpoint: Query attendance with filters
router.get("/", adminAuth, async (req, res) => {
  try {
    const {
      userId,
      deviceId,
      startDate,
      endDate,
      page = "1",
      limit = "50",
    } = req.query;

    const where: {
      userId?: string;
      deviceId?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (userId) where.userId = userId as string;
    if (deviceId) where.deviceId = deviceId as string;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        // Set end date to end of day
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: { user: true, device: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.attendance.count({ where }),
    ]);

    return res.json({
      attendances,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Attendance query error:", error);
    return res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

export default router;
