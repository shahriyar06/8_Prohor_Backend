import { NextFunction, Request, Response } from "express";
import { AppError } from "@/utils/AppError";
import { AccessTokenPayload, verifyAccessToken } from "@/utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization; 

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Access token missing", 401);
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
}


export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "super_admin") {
    throw new AppError("Forbidden: Admin access required", 403);
  }
  next();
}