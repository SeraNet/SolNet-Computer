// Simple test to check business profile
async function checkBusinessProfile() {
  console.log("🔍 Checking Business Profile...\n");

  try {
    const response = await fetch("http://localhost:5173/api/business-profile");
    const profile = await response.json();

    console.log("📊 Business Profile Data:");
    console.log(`Business Name: ${profile.businessName}`);
    console.log(`Owner Name: ${profile.ownerName}`);
    console.log(`Owner Photo: ${profile.ownerPhoto || "NOT SET"}`);
    console.log(
      `Show Owner Photo: ${profile.publicInfo?.showOwnerPhoto || false}`
    );
    console.log(
      `Show Owner Name: ${profile.publicInfo?.showOwnerName || false}`
    );

    if (profile.ownerPhoto) {
      console.log(`\n🔗 Full Owner Photo URL: /uploads/${profile.ownerPhoto}`);
      console.log(`📁 File should exist at: uploads/${profile.ownerPhoto}`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkBusinessProfile();
