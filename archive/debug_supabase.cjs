const { createClient } = require('@supabase/supabase-js');

// Use the existing Supabase configuration from the project
const SUPABASE_URL = "https://vmrvugezqpydlfjcoldl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnZ1Z2V6cXB5ZGxmamNvbGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTgxNTEsImV4cCI6MjA2OTM5NDE1MX0.gG3F0SxaIoCZoM5FhjB4YfrHwQkVBj9BpK94ldl_gBE";

// Create Supabase client using the project's configuration
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugSupabase() {
  try {
    console.log('🔍 Debugging Supabase connection...');
    console.log(`📊 Using Supabase URL: ${SUPABASE_URL}`);
    console.log(`🔑 Using Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);

    // Test basic connection
    console.log('\n📋 Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('balance_sheet_data')
      .select('*')
      .limit(1);

    console.log('Test result:', { data: testData, error: testError });

    // Test with different approaches
    console.log('\n📋 Testing with explicit schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('public.balance_sheet_data')
      .select('*')
      .limit(1);

    console.log('Schema test result:', { data: schemaData, error: schemaError });

    // Test raw SQL
    console.log('\n📋 Testing raw SQL...');
    const { data: sqlData, error: sqlError } = await supabase
      .rpc('get_balance_sheet_data');

    console.log('SQL test result:', { data: sqlData, error: sqlError });

    // Test different tables
    const tables = ['balance_sheet_data', 'cash_flow_data', 'companies', 'company_details'];
    
    for (const table of tables) {
      console.log(`\n📋 Testing ${table} table...`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(5);
      
      console.log(`${table} result:`, { 
        dataCount: data?.length || 0, 
        error: error?.message || null,
        sampleData: data?.[0] || null
      });
    }

    // Test with authentication (mock user)
    console.log('\n📋 Testing with mock user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password'
    });

    console.log('Auth test result:', { data: authData, error: authError });

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugSupabase(); 