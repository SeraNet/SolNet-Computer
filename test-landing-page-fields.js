// Using built-in fetch

async function testLandingPageFields() {
  try {
    console.log("🧪 Testing landing page fields...");

    // Test the business profile endpoint
    const response = await fetch('http://localhost:5173/api/business-profile');
    const data = await response.json();

    console.log("📊 Business Profile Data:");
    console.log("Features:", data.features ? data.features.length : "Not found");
    console.log("Team Members:", data.teamMembers ? data.teamMembers.length : "Not found");
    console.log("Why Choose Us:", data.whyChooseUs ? data.whyChooseUs.length : "Not found");
    console.log("Public Info:", data.publicInfo);

    if (data.features && data.features.length > 0) {
      console.log("✅ Features are working!");
      console.log("Sample feature:", data.features[0]);
    } else {
      console.log("❌ Features not found");
    }

    if (data.teamMembers && data.teamMembers.length > 0) {
      console.log("✅ Team Members are working!");
      console.log("Sample team member:", data.teamMembers[0]);
    } else {
      console.log("❌ Team Members not found");
    }

    if (data.whyChooseUs && data.whyChooseUs.length > 0) {
      console.log("✅ Why Choose Us are working!");
      console.log("Sample item:", data.whyChooseUs[0]);
    } else {
      console.log("❌ Why Choose Us not found");
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testLandingPageFields();
