import fetch from "node-fetch";

const BASE_URL = "http://localhost:3001";

async function testExpensesAPI() {
  console.log("🧪 Testing Expenses API...\n");

  try {
    // Test 1: Get expense categories
    console.log("1. Testing GET /api/expense-categories");
    const categoriesResponse = await fetch(
      `${BASE_URL}/api/expense-categories`
    );
    const categories = await categoriesResponse.json();
    console.log(`✅ Categories found: ${categories.length}`);
    console.log("Categories:", categories.map((c) => c.name).join(", "));
    console.log("");

    // Test 2: Get expenses
    console.log("2. Testing GET /api/expenses");
    const expensesResponse = await fetch(`${BASE_URL}/api/expenses`);
    const expenses = await expensesResponse.json();
    console.log(`✅ Expenses found: ${expenses.length}`);
    console.log("");

    // Test 3: Create a test expense
    console.log("3. Testing POST /api/expenses");
    const testExpense = {
      category: "Supplies",
      description: "Test office supplies",
      amount: "150.00",
      expenseDate: new Date().toISOString(),
      vendor: "Test Vendor",
      notes: "Test expense for API verification",
      expenseType: "one-time",
      paymentMethod: "cash",
      isRecurring: false,
    };

    const createResponse = await fetch(`${BASE_URL}/api/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testExpense),
    });

    if (createResponse.ok) {
      const createdExpense = await createResponse.json();
      console.log("✅ Test expense created successfully");
      console.log("Created expense ID:", createdExpense.id);
      console.log("");

      // Test 4: Get expenses again to verify the new one appears
      console.log("4. Testing GET /api/expenses (after creation)");
      const expensesResponse2 = await fetch(`${BASE_URL}/api/expenses`);
      const expenses2 = await expensesResponse2.json();
      console.log(`✅ Total expenses now: ${expenses2.length}`);
      console.log("Latest expense:", expenses2[0]);
    } else {
      const error = await createResponse.text();
      console.log("❌ Failed to create expense:", error);
    }
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
}

testExpensesAPI();
