import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import attendanceRoutes from "./routes/attendance.routes";
import userRoutes from "./routes/user.routes";
import deviceRoutes from "./routes/device.routes";

const app = express();


// Handle preflight requests explicitly
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
  
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API Routes
app.use("/auth", authRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/users", userRoutes);
app.use("/devices", deviceRoutes);

export default app;
