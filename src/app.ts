import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "@/modules/auth/auth.routes";
import organizationRoutes from "@/modules/organization/organization.routes";
import taskRoutes from "./modules/task/task.routes";
import { errorHandler } from "@/middlewares/errorHandler";

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/auth", authLimiter);
app.use("/api/auth", authRoutes);

app.use("/api/organizations", organizationRoutes);

app.use("/api/tasks", taskRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(errorHandler);

export default app;