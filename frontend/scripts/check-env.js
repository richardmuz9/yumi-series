const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_FRONTEND_URL'
];

function checkEnvVars() {
  const missing = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
    console.error('\x1b[31m%s\x1b[0m', missing.join(', '));
    console.error('\x1b[33m%s\x1b[0m', '\nPlease set these variables in your GitHub repository:');
    console.error('\x1b[33m%s\x1b[0m', '1. Go to Settings → Secrets and variables → Actions → Variables');
    console.error('\x1b[33m%s\x1b[0m', '2. Add the following variables:');
    console.error('\x1b[36m%s\x1b[0m', '   VITE_API_URL=https://yumi-series-production.up.railway.app');
    console.error('\x1b[36m%s\x1b[0m', '   VITE_FRONTEND_URL=https://yumi77965.online');
    process.exit(1);
  }

  console.log('\x1b[32m%s\x1b[0m', '✓ All required environment variables are set');
}

checkEnvVars(); 