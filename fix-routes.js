const fs = require("fs");
const path = require("path");

// Read the routes.ts file
const routesPath = path.join(__dirname, "server", "routes.ts");
let content = fs.readFileSync(routesPath, "utf8");

// Fix route handlers by adding proper typing
// Pattern: app.get("/path", async (req, res) => {
// Replace with: app.get("/path", async (req: any, res: any) => {

// Fix GET routes
content = content.replace(
  /app\.get\("([^"]+)", async \(req, res\) =>/g,
  'app.get("$1", async (req: any, res: any) =>'
);

// Fix POST routes
content = content.replace(
  /app\.post\("([^"]+)", async \(req, res\) =>/g,
  'app.post("$1", async (req: any, res: any) =>'
);

// Fix PUT routes
content = content.replace(
  /app\.put\("([^"]+)", async \(req, res\) =>/g,
  'app.put("$1", async (req: any, res: any) =>'
);

// Fix DELETE routes
content = content.replace(
  /app\.delete\("([^"]+)", async \(req, res\) =>/g,
  'app.delete("$1", async (req: any, res: any) =>'
);

// Fix routes with middleware that have implicit any types
content = content.replace(
  /app\.get\("([^"]+)", ([^,]+), async \(req, res\) =>/g,
  'app.get("$1", $2, async (req: any, res: any) =>'
);

content = content.replace(
  /app\.post\("([^"]+)", ([^,]+), async \(req, res\) =>/g,
  'app.post("$1", $2, async (req: any, res: any) =>'
);

content = content.replace(
  /app\.put\("([^"]+)", ([^,]+), async \(req, res\) =>/g,
  'app.put("$1", $2, async (req: any, res: any) =>'
);

content = content.replace(
  /app\.delete\("([^"]+)", ([^,]+), async \(req, res\) =>/g,
  'app.delete("$1", $2, async (req: any, res: any) =>'
);

// Write the fixed content back
fs.writeFileSync(routesPath, content, "utf8");

console.log("Route handlers fixed successfully!");

