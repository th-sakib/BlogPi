import { fromNodeHeaders } from "better-auth/node";
import { auth as betterAuth } from "../lib/auth";
import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        role: string | undefined | null;
      };
    }
  }
}

const auth = (...roles: ("USER" | "ADMIN")[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await betterAuth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "you are not authorized",
      });
    }

    if (!session.user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Please verify your email",
      });
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      emailVerified: session.user.emailVerified,
      role: session.user.role,
    };

    if (roles.length && !roles.includes(req.user.role as "USER" | "ADMIN")) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You don't have permission to access this resource",
      });
    }

    next();
  };
};

export default auth;
