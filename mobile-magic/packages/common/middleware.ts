import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;

console.log("jwtkey: ", JWT_PUBLIC_KEY);

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization; // Bearer token
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token: ", token);

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const decoded = jwt.verify(token, JWT_PUBLIC_KEY!);

  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  console.log("decoded: ", decoded);

  const userId = (decoded as any).sub;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.userId = userId;
  next();
}
