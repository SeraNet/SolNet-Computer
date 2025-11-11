import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function checkServerLogs() {
  try {
    console.log("🔍 Checking server status and logs...");

    // Check if server is running on port 5000
    const { stdout: netstatOutput } = await execAsync(
      "netstat -ano | findstr :5000"
    );
    console.log("📊 Server port status:");
    console.log(netstatOutput);

    // Check if there are any Node.js processes
    const { stdout: nodeProcesses } = await execAsync(
      "tasklist | findstr node"
    );
    console.log("\n📊 Node.js processes:");
    console.log(nodeProcesses);

    console.log(
      "\n💡 To see server logs, check the terminal where you ran 'npm run dev'"
    );
    console.log(
      "   The server should be showing logs when you try to create a purchase order."
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkServerLogs();
