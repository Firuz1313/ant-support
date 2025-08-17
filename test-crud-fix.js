#!/usr/bin/env node

/**
 * Test script to verify CRUD operation fixes
 * Tests specifically for the 409 conflict resolution on device updates
 */

const API_BASE = "http://localhost:5000/api/v1";

async function testDeviceUpdate() {
  console.log("🧪 Testing Device Update Fix...");

  try {
    // 1. Get existing devices
    console.log("📋 Fetching existing devices...");
    const getResponse = await fetch(`${API_BASE}/devices`);
    const devicesData = await getResponse.json();

    if (!devicesData.success || !devicesData.data.length) {
      console.log("❌ No devices found to test with");
      return;
    }

    const testDevice = devicesData.data[0];
    console.log(
      `✅ Found test device: ${testDevice.name} (ID: ${testDevice.id})`,
    );

    // 2. Try to update device with same name (should NOT give 409 anymore)
    console.log("🔄 Testing update with same name...");
    const updateData = {
      name: testDevice.name,
      brand: testDevice.brand,
      model: testDevice.model + " (Updated)",
      description:
        testDevice.description + " - Updated at " + new Date().toISOString(),
    };

    const updateResponse = await fetch(`${API_BASE}/devices/${testDevice.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const updateResult = await updateResponse.json();

    if (updateResponse.status === 409) {
      console.log("❌ Still getting 409 Conflict - fix failed");
      console.log("Error:", updateResult.error);
      return false;
    } else if (updateResponse.status === 200) {
      console.log("✅ Update successful - 409 conflict fixed!");
      console.log("Updated device:", updateResult.data.name);
      return true;
    } else {
      console.log(`❓ Unexpected response: ${updateResponse.status}`);
      console.log("Response:", updateResult);
      return false;
    }
  } catch (error) {
    console.log("❌ Test failed with error:", error.message);
    return false;
  }
}

async function testDeviceCreation() {
  console.log("\n🧪 Testing Device Creation...");

  try {
    const newDevice = {
      name: `Test Device ${Date.now()}`,
      brand: "Test Brand",
      model: "Test Model",
      description: "Test device for validation",
    };

    console.log("🔄 Creating new device...");
    const createResponse = await fetch(`${API_BASE}/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newDevice),
    });

    const createResult = await createResponse.json();

    if (createResponse.status === 201) {
      console.log("✅ Device creation successful!");
      console.log("Created device:", createResult.data.name);
      return true;
    } else {
      console.log(`❌ Device creation failed: ${createResponse.status}`);
      console.log("Error:", createResult.error);
      return false;
    }
  } catch (error) {
    console.log("❌ Test failed with error:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting CRUD Fix Tests...\n");

  const updateResult = await testDeviceUpdate();
  const createResult = await testDeviceCreation();

  console.log("\n📊 Test Results:");
  console.log(
    `- Device Update Fix: ${updateResult ? "✅ PASSED" : "��� FAILED"}`,
  );
  console.log(`- Device Creation: ${createResult ? "✅ PASSED" : "❌ FAILED"}`);

  if (updateResult && createResult) {
    console.log(
      "\n🎉 All tests passed! CRUD operations are now working correctly.",
    );
  } else {
    console.log("\n⚠️  Some tests failed. Check the output above for details.");
  }
}

main();
