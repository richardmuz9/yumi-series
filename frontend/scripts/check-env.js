const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_FRONTEND_URL'
];

console.log('\n🔍 Checking environment variables...\n');

let missingVars = [];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    missingVars.push(envVar);
  }
}

if (missingVars.length > 0) {
  console.log('\n📝 Please create a .env file with the following variables:\n');
  console.error('\x1b[36m%s\x1b[0m', '   VITE_API_URL=http://137.184.89.215:3001');
  console.error('\x1b[36m%s\x1b[0m', '   VITE_FRONTEND_URL=https://yumi77965.online');
  console.log('\nOr for local development:');
  console.error('\x1b[36m%s\x1b[0m', '   VITE_API_URL=http://localhost:3000');
  console.error('\x1b[36m%s\x1b[0m', '   VITE_FRONTEND_URL=http://localhost:3000');
  process.exit(1);
}

console.log('✅ All required environment variables are set!\n'); 