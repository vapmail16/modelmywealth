const { createClient } = require('@supabase/supabase-js');

// Use the existing Supabase configuration from the project
const SUPABASE_URL = "https://vmrvugezqpydlfjcoldl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnZ1Z2V6cXB5ZGxmamNvbGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTgxNTEsImV4cCI6MjA2OTM5NDE1MX0.gG3F0SxaIoCZoM5FhjB4YfrHwQkVBj9BpK94ldl_gBE";

// Create Supabase client using the project's configuration
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log(`📊 Using Supabase URL: ${SUPABASE_URL}`);

    // Test basic connection
    console.log('\n📋 Testing projects table...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
    } else {
      console.log(`✅ Found ${projects?.length || 0} projects:`, projects);
    }

    // Test company details
    console.log('\n🏢 Testing company_details table...');
    const { data: companyDetails, error: companyError } = await supabase
      .from('company_details')
      .select('*');

    if (companyError) {
      console.error('❌ Error fetching company details:', companyError);
    } else {
      console.log(`✅ Found ${companyDetails?.length || 0} company details:`, companyDetails);
    }

    // Test profit & loss data
    console.log('\n💰 Testing profit_loss_data table...');
    const { data: profitLossData, error: plError } = await supabase
      .from('profit_loss_data')
      .select('*');

    if (plError) {
      console.error('❌ Error fetching profit & loss data:', plError);
    } else {
      console.log(`✅ Found ${profitLossData?.length || 0} profit & loss records:`, profitLossData);
    }

    // Test balance sheet data
    console.log('\n📊 Testing balance_sheet_data table...');
    const { data: balanceSheetData, error: bsError } = await supabase
      .from('balance_sheet_data')
      .select('*');

    if (bsError) {
      console.error('❌ Error fetching balance sheet data:', bsError);
    } else {
      console.log(`✅ Found ${balanceSheetData?.length || 0} balance sheet records:`, balanceSheetData);
    }

    // Test other tables
    const tables = [
      'cash_flow_data',
      'working_capital_data', 
      'growth_assumptions_data',
      'seasonality_data',
      'debt_structure_data',
      'debt_calculations',
      'depreciation_schedule'
    ];

    for (const table of tables) {
      console.log(`\n📋 Testing ${table} table...`);
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.error(`❌ Error fetching ${table}:`, error);
      } else {
        console.log(`✅ Found ${data?.length || 0} records in ${table}:`, data);
      }
    }

    console.log('\n🎉 Supabase connection test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection(); 