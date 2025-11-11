// Test script to check business profile update
async function testBusinessProfileUpdate() {
  try {
    console.log("🧪 Testing business profile update...");

    // First, get the current business profile
    const getResponse = await fetch(
      "http://localhost:5173/api/business-profile"
    );
    const currentProfile = await getResponse.json();

    console.log("📊 Current Profile Keys:", Object.keys(currentProfile));
    console.log("📊 Has features:", !!currentProfile.features);
    console.log("📊 Has teamMembers:", !!currentProfile.teamMembers);
    console.log("📊 Has whyChooseUs:", !!currentProfile.whyChooseUs);

    // Try to update with minimal data
    const updateData = {
      businessName: currentProfile.businessName,
      ownerName: currentProfile.ownerName,
      email: currentProfile.email,
      phone: currentProfile.phone,
      address: currentProfile.address,
      city: currentProfile.city,
      state: currentProfile.state,
      zipCode: currentProfile.zipCode,
      country: currentProfile.country,
      // Add the new fields
      features: currentProfile.features || [],
      teamMembers: currentProfile.teamMembers || [],
      whyChooseUs: currentProfile.whyChooseUs || [],
      publicInfo: currentProfile.publicInfo || {},
    };

    console.log("📤 Sending update data:", JSON.stringify(updateData, null, 2));

    const updateResponse = await fetch(
      "http://localhost:5173/api/business-profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error("❌ Update failed:", updateResponse.status, errorData);
    } else {
      const result = await updateResponse.json();
      console.log("✅ Update successful:", result);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testBusinessProfileUpdate();
