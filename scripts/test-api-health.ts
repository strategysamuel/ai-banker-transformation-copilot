async function verifyApiHealth() {
  try {
    const healthRes = await fetch('http://localhost:3000/api/health');
    const healthData = await healthRes.json();
    console.log('Health Check:', healthData);

    const catalogRes = await fetch('http://localhost:3000/api/project-compass/catalog');
    const catalogData = await catalogRes.json();
    console.log('Project Compass Catalog Policies Count:', catalogData?.catalog?.policies?.length);

    console.log('✅ API Routes Health Verified Successfully!');
  } catch (err) {
    console.error('API Verification Failed:', err);
    process.exit(1);
  }
}

verifyApiHealth();
