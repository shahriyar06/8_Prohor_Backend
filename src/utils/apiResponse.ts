import { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null,
  });
}

export function sendError(
  res: Response,
  message = "Something went wrong",
  statusCode = 400,
  error: unknown = null
) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error,
  });
}