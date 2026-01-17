import { IUser } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name?: string;
        email: string;
        googleId?: string;
      };
    }
  }
}
