import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "@/utils/AppError";
import { sendError } from "@/utils/apiResponse";


export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[ERROR]", err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  if (err instanceof ZodError) {
    return sendError(res, "Validation failed", 422, err.flatten());
  }

  return sendError(res, "Internal Server Error", 500);
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}