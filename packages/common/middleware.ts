import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization; // Bearer token
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const publicKey = process.env.JWT_PUBLIC_KEY;
  if (!publicKey) {
    res.status(500).json({ message: "Internal Server Error: JWT public key not found" });
    return;
  }

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    });


    const userId = (decoded as any).sub;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID not found in token" });
      return;
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}
