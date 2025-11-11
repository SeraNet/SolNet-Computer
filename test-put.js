const testPutEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:5173/api/inventory/d6936a44-4f31-43b1-a153-f2991e4ec9be', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        name: 'Test Update',
        sku: 'TEST-001',
        description: 'Test description',
        category: 'Test Category',
        salePrice: 100.00,
        quantity: 50,
        minStockLevel: 10,
        isPublic: true,
        isActive: true
      })
    });

    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testPutEndpoint();
