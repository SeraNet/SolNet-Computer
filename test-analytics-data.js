const { apiRequest } = require('./client/src/lib/queryClient');

async function testAnalyticsData() {
  try {
    console.log('🔍 Testing Analytics Data...\n');
    
    // Test the analytics endpoint
    const response = await fetch('http://localhost:5173/api/analytics', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JWT_TOKEN || 'test-token'}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch analytics:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('📊 Analytics Data:');
    console.log('================');
    console.log(`Total Revenue: ${data.totalRevenue || 0}`);
    console.log(`Revenue Change: ${data.revenueChange || 0}%`);
    console.log(`Profit Margin: ${data.profitMargin || 0}%`);
    console.log(`Revenue per Repair: ${data.revenuePerRepair || 0}`);
    console.log(`Active Repairs: ${data.activeRepairs || 0}`);
    console.log(`Total Sales: ${data.totalSales || 0}`);
    console.log(`New Customers: ${data.newCustomers || 0}`);
    console.log(`Completion Rate: ${data.completionRate || 0}%`);
    console.log(`Average Repair Time: ${data.avgRepairTime || 0} days`);
    console.log(`Average Transaction: ${data.avgTransaction || 0}`);
    
    if (data.debug) {
      console.log('\n🔧 Debug Information:');
      console.log('====================');
      console.log(`Current Period: ${data.debug.currentPeriod?.startDate} to ${data.debug.currentPeriod?.endDate}`);
      console.log(`Sales Revenue: ${data.debug.salesRevenue || 0}`);
      console.log(`Repair Revenue: ${data.debug.repairRevenue || 0}`);
      console.log(`All Time Revenue: ${data.debug.allTimeRevenue || 0}`);
      console.log(`Has Data in Period: ${data.debug.hasDataInPeriod}`);
      console.log(`Has All Time Data: ${data.debug.hasAllTimeData}`);
      console.log(`Completed Repairs Count: ${data.debug.completedRepairsCount || 0}`);
      console.log(`Revenue per Repair Calculation: ${data.debug.revenuePerRepairCalculation || 0}`);
    }
    
    console.log('\n✅ Analytics data test completed!');
    
  } catch (error) {
    console.error('❌ Error testing analytics data:', error);
  }
}

// Run the test
testAnalyticsData();








