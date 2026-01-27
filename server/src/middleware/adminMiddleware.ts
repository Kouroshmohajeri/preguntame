import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.email) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Fetch user from database
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if user is admin (using isAdmin field or role)
    if (!user.isAdmin && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error:
          "Admin access required. You do not have permission to access this resource.",
      });
    }

    // User is admin, proceed
    next();
  } catch (error: any) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during authorization",
    });
  }
};

// Optional: Check if user is admin (returns boolean, doesn't block request)
export const checkIsAdmin = async (req: Request): Promise<boolean> => {
  try {
    if (!req.user || !req.user.email) {
      return false;
    }

    const user = await User.findOne({ email: req.user.email });
    return user?.isAdmin || user?.role === "admin" || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};
