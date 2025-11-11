const { db } = require("./server/db");
const { users } = require("./shared/schema");
const { eq } = require("drizzle-orm");

async function checkUser() {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, "a4aa6df3-78fa-4bf3-a9c3-325e5fda778f"))
      .limit(1);
    console.log("User profile picture:", user[0]?.profilePicture);
    console.log("Full user object:", JSON.stringify(user[0], null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkUser();
