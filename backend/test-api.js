import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:3000';

async function testAPI() {
  console.log('🧪 Starting API tests...');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData.status);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }

    // Test 2: Get devices
    console.log('\n2. Testing devices endpoint...');
    const devicesResponse = await fetch(`${BASE_URL}/api/v1/devices`);
    if (devicesResponse.ok) {
      const devicesData = await devicesResponse.json();
      console.log('✅ Devices endpoint working. Found devices:', devicesData.data?.length || 0);
      if (devicesData.data && devicesData.data.length > 0) {
        console.log('📱 Sample device:', devicesData.data[0].name);
      }
    } else {
      console.log('❌ Devices endpoint failed:', devicesResponse.status);
      const error = await devicesResponse.text();
      console.log('Error details:', error);
    }

    // Test 3: Get TV interfaces
    console.log('\n3. Testing TV interfaces endpoint...');
    const tvInterfacesResponse = await fetch(`${BASE_URL}/api/v1/tv-interfaces`);
    if (tvInterfacesResponse.ok) {
      const tvInterfacesData = await tvInterfacesResponse.json();
      console.log('✅ TV interfaces endpoint working. Found interfaces:', tvInterfacesData.data?.length || 0);
      if (tvInterfacesData.data && tvInterfacesData.data.length > 0) {
        console.log('📺 Sample interface:', tvInterfacesData.data[0].name);
      }
    } else {
      console.log('❌ TV interfaces endpoint failed:', tvInterfacesResponse.status);
      const error = await tvInterfacesResponse.text();
      console.log('Error details:', error);
    }

    // Test 4: Get problems
    console.log('\n4. Testing problems endpoint...');
    const problemsResponse = await fetch(`${BASE_URL}/api/v1/problems`);
    if (problemsResponse.ok) {
      const problemsData = await problemsResponse.json();
      console.log('✅ Problems endpoint working. Found problems:', problemsData.data?.length || 0);
    } else {
      console.log('❌ Problems endpoint failed:', problemsResponse.status);
      const error = await problemsResponse.text();
      console.log('Error details:', error);
    }

    console.log('\n🎉 API testing completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
