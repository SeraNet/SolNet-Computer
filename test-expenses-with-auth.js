import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000";

async function testExpensesWithAuth() {
  console.log("🧪 Testing Expenses with Authentication...\n");

  try {
    // Step 1: Login to get a token
    console.log("1. Logging in...");
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log("❌ Login failed:", error);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log("✅ Login successful");
    console.log("User:", loginData.user.firstName, loginData.user.lastName);
    console.log("Role:", loginData.user.role);
    console.log("");

    // Step 2: Test expense categories with auth
    console.log("2. Testing GET /api/expense-categories (with auth)");
    const categoriesResponse = await fetch(
      `${BASE_URL}/api/expense-categories`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log(`✅ Categories found: ${categories.length}`);
      console.log("Categories:", categories.map((c) => c.name).join(", "));
    } else {
      const error = await categoriesResponse.text();
      console.log("❌ Failed to get categories:", error);
    }
    console.log("");

    // Step 3: Test expenses with auth
    console.log("3. Testing GET /api/expenses (with auth)");
    const expensesResponse = await fetch(`${BASE_URL}/api/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (expensesResponse.ok) {
      const expenses = await expensesResponse.json();
      console.log(`✅ Expenses found: ${expenses.length}`);
      if (expenses.length > 0) {
        console.log("Latest expense:", expenses[0]);
      }
    } else {
      const error = await expensesResponse.text();
      console.log("❌ Failed to get expenses:", error);
    }
    console.log("");

    // Step 4: Create a test expense
    console.log("4. Testing POST /api/expenses (with auth)");
    const testExpense = {
      category: "Supplies",
      description: "Test office supplies for API verification",
      amount: "250.00",
      expenseDate: new Date().toISOString(),
      vendor: "Test Vendor Inc.",
      notes: "Test expense created via API",
      expenseType: "one-time",
      paymentMethod: "cash",
      isRecurring: false,
    };

    const createResponse = await fetch(`${BASE_URL}/api/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(testExpense),
    });

    if (createResponse.ok) {
      const createdExpense = await createResponse.json();
      console.log("✅ Test expense created successfully");
      console.log("Created expense ID:", createdExpense.id);
      console.log("Amount:", createdExpense.amount);
      console.log("Description:", createdExpense.description);
      console.log("");

      // Step 5: Verify the expense appears in the list
      console.log("5. Verifying expense appears in list");
      const expensesResponse2 = await fetch(`${BASE_URL}/api/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (expensesResponse2.ok) {
        const expenses2 = await expensesResponse2.json();
        console.log(`✅ Total expenses now: ${expenses2.length}`);
        const newExpense = expenses2.find((e) => e.id === createdExpense.id);
        if (newExpense) {
          console.log("✅ New expense found in list");
        } else {
          console.log("❌ New expense not found in list");
        }
      }
    } else {
      const error = await createResponse.text();
      console.log("❌ Failed to create expense:", error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testExpensesWithAuth();
