import fetch from 'node-fetch';

async function testCustomerAPI() {
  try {
    console.log("🔍 Testing customer API endpoint...");

    // First, try to login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log("❌ Login failed:", await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log("✅ Login successful");

    // Now test the customers endpoint with authentication
    const customersResponse = await fetch('http://localhost:5000/api/customers', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!customersResponse.ok) {
      console.log("❌ Customers API failed:", await customersResponse.text());
      return;
    }

    const customers = await customersResponse.json();
    console.log(`✅ Customers API successful - found ${customers.length} customers`);
    
    customers.forEach((customer, index) => {
      console.log(`  ${index + 1}. ${customer.name} - ${customer.phone} - ${customer.email || 'No email'}`);
    });

    // Test search functionality
    if (customers.length > 0) {
      const testCustomer = customers[0];
      console.log(`\n🔍 Testing search for customer: ${testCustomer.name}`);
      
      const searchResponse = await fetch(`http://localhost:5000/api/customers?search=${encodeURIComponent(testCustomer.name)}`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        console.log(`✅ Search API successful - found ${searchResults.length} customers`);
      } else {
        console.log("❌ Search API failed:", await searchResponse.text());
      }
    }

  } catch (error) {
    console.error("❌ Error testing customer API:", error.message);
  }
}

testCustomerAPI();
