console.log('\n🔍 Checking environment variables...\n');

// Required variables
const requiredVars = [
  'VITE_API_URL',
  'VITE_FRONTEND_URL'
];

let missingVars = false;

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Missing required environment variable: ${varName}`);
    missingVars = true;
  }
});

if (missingVars) {
  console.log('\n📝 Please create a .env file with the following variables:\n');
  console.error('\x1b[36m%s\x1b[0m', '   VITE_API_URL=https://api.yumi77965.online');
  console.error('\x1b[36m%s\x1b[0m', '   VITE_FRONTEND_URL=https://yumi77965.online');
  console.log('\nOr for local development:');
  console.error('\x1b[36m%s\x1b[0m', '   VITE_API_URL=http://localhost:3000');
  console.error('\x1b[36m%s\x1b[0m', '   VITE_FRONTEND_URL=http://localhost:3000');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✅ All required environment variables are set!\n'); 