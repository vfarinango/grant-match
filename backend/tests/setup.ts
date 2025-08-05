import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Any global setup before all tests
  console.log('🧪 Starting test suite...');
});

afterAll(async () => {
  // Any global cleanup after all tests
  console.log('✅ Test suite completed');
});
