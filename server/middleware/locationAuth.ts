import { Request, Response, NextFunction } from "express";
import { DatabaseStorage } from "../storage";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    locationId?: string;
  };
  locationFilter?: LocationFilterOptions;
}

export interface LocationFilterOptions {
  locationId?: string;
  includeAllLocations?: boolean;
}

/**
 * Middleware to authenticate user and set req.user
 */
export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res
      .status(500)
      .json({ message: "Server misconfiguration: JWT secret not set" });
  }
  const authHeader = req.headers?.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, jwtSecret) as any;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Combined middleware to authenticate and add location filtering
 */
export const authenticateAndFilter = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res
      .status(500)
      .json({ message: "Server misconfiguration: JWT secret not set" });
  }
  const authHeader = req.headers?.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, jwtSecret) as any;
    req.user = payload;

    // Check for selected location in headers (for admin users)
    const selectedLocation = req.headers["x-selected-location"] as string;

    // Add location filter
    if (payload.role === "admin") {
      if (
        selectedLocation &&
        selectedLocation.trim() !== "" &&
        selectedLocation !== "all"
      ) {
        // Admin has selected a specific location
        req.locationFilter = {
          locationId: selectedLocation,
          includeAllLocations: false,
        };
      } else {
        // Admin sees all locations (no header or "all" value)
        req.locationFilter = {
          includeAllLocations: true,
        };
      }
    } else {
      // Non-admin users can only see their assigned location
      req.locationFilter = {
        locationId: payload.locationId,
        includeAllLocations: false,
      };
      console.log(
        "📍 Non-admin user assigned to location:",
        payload.locationId
      );
    }

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Middleware to add location filtering to requests
 * - Admins can see all locations
 * - Other users can only see their assigned location
 */
export const addLocationFilter = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Admins can see all locations
  if (user.role === "admin") {
    req.locationFilter = {
      includeAllLocations: true,
    };
  } else {
    // Other users can only see their assigned location
    req.locationFilter = {
      locationId: user.locationId,
      includeAllLocations: false,
    };
  }

  next();
};

/**
 * Helper function to build location-based WHERE clauses
 */
export const buildLocationWhereClause = (
  filter: LocationFilterOptions,
  tableAlias: string = ""
) => {
  const prefix = tableAlias ? `${tableAlias}.` : "";

  if (filter.includeAllLocations) {
    return {}; // No location filter for admins
  }

  if (filter.locationId) {
    return { [`${prefix}locationId`]: filter.locationId };
  }

  return { [`${prefix}locationId`]: null }; // Only show unassigned items
};

/**
 * Middleware to validate location access for specific operations
 */
export const validateLocationAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const targetLocationId = req.body.locationId || req.params.locationId;

  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Admins can access any location
  if (user.role === "admin") {
    return next();
  }

  // Other users can only access their assigned location
  if (targetLocationId && targetLocationId !== user.locationId) {
    return res.status(403).json({
      message:
        "Access denied: You can only access data from your assigned location",
    });
  }

  next();
};

/**
 * Middleware to ensure users can only create/update data for their location
 */
export const enforceLocationOwnership = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Admins can assign any location
  if (user.role === "admin") {
    return next();
  }

  // Other users can only assign their own location
  if (req.body.locationId && req.body.locationId !== user.locationId) {
    return res.status(403).json({
      message:
        "Access denied: You can only assign data to your assigned location",
    });
  }

  // Auto-assign user's location if not specified
  if (!req.body.locationId && user.locationId) {
    req.body.locationId = user.locationId;
  }

  next();
};
