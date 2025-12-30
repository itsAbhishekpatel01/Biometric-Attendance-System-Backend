import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth";
import prisma from "../lib/prisma";
import { generateSecureToken } from "../lib/token";

const router = Router();

// List all devices with attendance count
router.get("/", adminAuth, async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        deviceId: true,
        name: true,
        token: true,
        createdAt: true,
        _count: {
          select: { attendance: true },
        },
      },
    });

    return res.json(devices);
  } catch (error) {
    console.error("Device list error:", error);
    return res.status(500).json({ message: "Failed to fetch devices" });
  }
});

// Get single device with recent activity
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const device = await prisma.device.findUnique({
      where: { id: req.params.id },
      include: {
        attendance: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { user: true },
        },
      },
    });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    return res.json(device);
  } catch (error) {
    console.error("Device get error:", error);
    return res.status(500).json({ message: "Failed to fetch device" });
  }
});

// Create device with auto-generated token
router.post("/", adminAuth, async (req, res) => {
  try {
    const { deviceId, name } = req.body;

    if (!deviceId || !name) {
      return res.status(400).json({ message: "deviceId and name are required" });
    }

    const token = generateSecureToken();

    const device = await prisma.device.create({
      data: {
        deviceId,
        name,
        token,
      },
    });

    return res.status(201).json(device);
  } catch (error: unknown) {
    console.error("Device create error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ message: "Device ID already exists" });
    }
    return res.status(500).json({ message: "Failed to create device" });
  }
});

// Regenerate device token
router.post("/:id/regenerate-token", adminAuth, async (req, res) => {
  try {
    const token = generateSecureToken();

    const device = await prisma.device.update({
      where: { id: req.params.id },
      data: { token },
    });

    return res.json(device);
  } catch (error: unknown) {
    console.error("Device token regenerate error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ message: "Device not found" });
    }
    return res.status(500).json({ message: "Failed to regenerate token" });
  }
});

// Delete device
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    // First delete related attendance records
    await prisma.attendance.deleteMany({
      where: { deviceId: req.params.id },
    });

    await prisma.device.delete({
      where: { id: req.params.id },
    });

    return res.json({ success: true });
  } catch (error: unknown) {
    console.error("Device delete error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ message: "Device not found" });
    }
    return res.status(500).json({ message: "Failed to delete device" });
  }
});

export default router;
