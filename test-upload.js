import fs from "fs";
import path from "path";

// Test the owner photo upload endpoint
async function testUpload() {
  console.log("🧪 Testing Owner Photo Upload Endpoint...\n");

  try {
    // Check if the endpoint is accessible
    const response = await fetch(
      "http://localhost:5173/api/business-profile/photo/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test: true }),
      }
    );

    if (response.status === 400) {
      console.log(
        "✅ Upload endpoint is accessible (returned 400 for invalid request as expected)"
      );
    } else {
      console.log(`⚠️  Unexpected response: ${response.status}`);
    }

    // Check current business profile
    const profileResponse = await fetch(
      "http://localhost:5173/api/business-profile"
    );
    const profile = await profileResponse.json();

    console.log("\n📊 Current Business Profile:");
    console.log(`Owner Photo: ${profile.ownerPhoto || "NOT SET"}`);
    console.log(
      `Show Owner Photo: ${profile.publicInfo?.showOwnerPhoto || false}`
    );

    console.log("\n📝 To upload an owner photo:");
    console.log("1. Go to Owner Profile page");
    console.log("2. Click the camera icon on the owner photo");
    console.log("3. Select an image file");
    console.log(
      "4. The photo should upload and appear on the public landing page"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testUpload();
