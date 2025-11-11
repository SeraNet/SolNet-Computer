import { Request } from "express";

// Extend Express Request interface to include custom properties
declare module "express-serve-static-core" {
  interface Request {
    locationFilter?: any;
    user?: any;
    file?: any;
  }
}
