import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.js";

export interface AuthRequest extends Request {
  userId?: string;
  userPlan?: string;
  userProfile?: any;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    req.userId = undefined;
    req.userPlan = "free";
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      req.userId = undefined;
      req.userPlan = "free";
      return next();
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    req.userId = user.id;
    req.userPlan = profile?.plan ?? "free";
    req.userProfile = profile;
    next();
  } catch {
    req.userId = undefined;
    req.userPlan = "free";
    next();
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
