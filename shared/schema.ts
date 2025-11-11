// This file now imports from the modular schema structure
// All schemas have been split into domain-based modules for better organization

export * from "./schemas";

// Re-export everything to maintain backward compatibility
// This ensures existing imports like `import { users, devices } from "@shared/schema"` continue to work
