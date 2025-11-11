const { apiRequest } = require('./client/src/lib/queryClient');

async function testExpenseMonthlyData() {
  try {
    console.log('🔍 Testing Expense Monthly Data...\n');
    
    // Test the expenses endpoint
    const response = await fetch('http://localhost:5173/api/expenses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JWT_TOKEN || 'test-token'}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch expenses:', response.status, response.statusText);
      return;
    }
    
    const expenses = await response.json();
    
    console.log('📊 Expense Data Analysis:');
    console.log('========================');
    console.log(`Total Expenses: ${expenses.length}`);
    
    if (expenses.length === 0) {
      console.log('❌ No expenses found in database');
      return;
    }
    
    // Analyze date fields
    console.log('\n📅 Date Field Analysis:');
    console.log('=======================');
    const sampleExpense = expenses[0];
    console.log('Sample expense date fields:');
    console.log('- expenseDate:', sampleExpense.expenseDate);
    console.log('- createdAt:', sampleExpense.createdAt);
    console.log('- updatedAt:', sampleExpense.updatedAt);
    
    // Check for different date field names
    const dateFields = Object.keys(sampleExpense).filter(key => 
      key.toLowerCase().includes('date') || 
      key.toLowerCase().includes('time')
    );
    console.log('All date-related fields:', dateFields);
    
    // Monthly analysis
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYearMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    console.log('\n📈 Monthly Analysis:');
    console.log('===================');
    console.log(`Current Year-Month: ${currentYearMonth}`);
    
    // Group by year-month
    const monthlyGroups = {};
    expenses.forEach(expense => {
      if (expense.expenseDate) {
        const expenseDate = new Date(expense.expenseDate);
        const yearMonth = `${expenseDate.getFullYear()}-${(expenseDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyGroups[yearMonth]) {
          monthlyGroups[yearMonth] = [];
        }
        monthlyGroups[yearMonth].push(expense);
      }
    });
    
    console.log('\nMonthly Groups:');
    Object.keys(monthlyGroups).sort().forEach(yearMonth => {
      const monthExpenses = monthlyGroups[yearMonth];
      const totalAmount = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      console.log(`- ${yearMonth}: ${monthExpenses.length} expenses, ${totalAmount.toFixed(2)} ETB`);
    });
    
    // Current month analysis
    const currentMonthExpenses = monthlyGroups[currentYearMonth] || [];
    const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    
    console.log('\n🎯 Current Month Analysis:');
    console.log('=========================');
    console.log(`Current Month (${currentYearMonth}):`);
    console.log(`- Expenses Count: ${currentMonthExpenses.length}`);
    console.log(`- Total Amount: ${currentMonthTotal.toFixed(2)} ETB`);
    
    if (currentMonthExpenses.length === 0) {
      console.log('❌ No expenses found for current month');
      console.log('💡 This might be why monthly data is not showing');
    } else {
      console.log('✅ Current month has expense data');
    }
    
    // Check for date format issues
    console.log('\n🔍 Date Format Analysis:');
    console.log('========================');
    const dateFormats = new Set();
    expenses.slice(0, 5).forEach(expense => {
      if (expense.expenseDate) {
        dateFormats.add(typeof expense.expenseDate);
        console.log(`- expenseDate type: ${typeof expense.expenseDate}, value: ${expense.expenseDate}`);
      }
    });
    
    console.log('\n✅ Expense monthly data test completed!');
    
  } catch (error) {
    console.error('❌ Error testing expense monthly data:', error);
  }
}

// Run the test
testExpenseMonthlyData();








