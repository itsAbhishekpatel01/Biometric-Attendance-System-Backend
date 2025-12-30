import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth";
import prisma from "../lib/prisma";

const router = Router();

// List all users with search and pagination
router.get("/", adminAuth, async (req, res) => {
  try {
    const { search, page = "1", limit = "50" } = req.query;

    const where: {
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        admissionNumber?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { admissionNumber: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("User list error:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Get single user with recent attendance
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        attendance: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { device: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("User get error:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Create user
router.post("/", adminAuth, async (req, res) => {
  try {
    const {
      admissionNumber,
      name,
      email,
      phone,
      rollNumber,
      className,
      section,
      batch,
    } = req.body;

    if (!admissionNumber || !name) {
      return res
        .status(400)
        .json({ message: "admissionNumber and name are required" });
    }

    const user = await prisma.user.create({
      data: {
        admissionNumber,
        name,
        email: email || "",
        phone: phone || "",
        rollNumber: rollNumber || "",
        className: className || "",
        section: section || "",
        batch: batch || "",
      },
    });

    return res.status(201).json(user);
  } catch (error: unknown) {
    console.error("User create error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ message: "Admission number already exists" });
    }
    return res.status(500).json({ message: "Failed to create user" });
  }
});

// Update user
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const {
      admissionNumber,
      name,
      email,
      phone,
      rollNumber,
      className,
      section,
      batch,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        admissionNumber,
        name,
        email,
        phone,
        rollNumber,
        className,
        section,
        batch,
      },
    });

    return res.json(user);
  } catch (error: unknown) {
    console.error("User update error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ message: "Admission number already exists" });
    }
    return res.status(500).json({ message: "Failed to update user" });
  }
});

// Delete user
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    // First delete related attendance records
    await prisma.attendance.deleteMany({
      where: { userId: req.params.id },
    });

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    return res.json({ success: true });
  } catch (error: unknown) {
    console.error("User delete error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
