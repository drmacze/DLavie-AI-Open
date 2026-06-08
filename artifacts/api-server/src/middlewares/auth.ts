import { Request, Response, NextFunction } from "express";
import { supabase, isDeveloper, DEVELOPER_EMAIL } from "../lib/supabase.js";

export interface AuthRequest extends Request {
  userId?: string;
  userPlan?: string;
  userProfile?: any;
  isDev?: boolean;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    req.userId = undefined;
    req.userPlan = "free";
    req.isDev = false;
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      req.userId = undefined;
      req.userPlan = "free";
      req.isDev = false;
      return next();
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const devFlag = isDeveloper(profile);
    req.userId = user.id;
    req.userPlan = devFlag ? "developer" : (profile?.plan ?? "free");
    req.userProfile = profile;
    req.isDev = devFlag;
    next();
  } catch {
    req.userId = undefined;
    req.userPlan = "free";
    req.isDev = false;
    next();
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
