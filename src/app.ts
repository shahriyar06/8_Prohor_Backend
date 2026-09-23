import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "@/modules/auth/auth.routes";
import organizationRoutes from "@/modules/organization/organization.routes";
import taskRoutes from "./modules/task/task.routes";
import { errorHandler } from "@/middlewares/errorHandler";
import { env } from "./config/env";
import incomeRoutes from "./modules/income/income.routes";
import expenseRoutes from "./modules/expense/expense.routes";
import liabilityRoutes from "./modules/liability/liability.routes";

const allowedOrigins = [env.FRONTEND_URL, env.ADMIN_PANEL_URL];

const app = express();

app.use(helmet());
    
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/auth", authRoutes);

app.use("/api/organizations", organizationRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/income", incomeRoutes);

app.use("/api/expense", expenseRoutes);

app.use("/api/liability", liabilityRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(errorHandler);

export default app;