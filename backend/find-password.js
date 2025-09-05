const { Pool } = require('pg');

console.log('🔍 Finding your PostgreSQL password...');

// Common passwords to try
const passwords = ['postgres', 'admin', 'password', '123456', 'root', '', 'postgres123', 'admin123'];

async function testPassword(password) {
  const pool = new Pool({
    host: 'localhost',
    port: 1234,
    database: 'postgres',
    user: 'postgres',
    password: 2005,
    connectionTimeoutMillis: 2000
  });
  
  try {
    const client = await pool.connect();
    console.log(`✅ SUCCESS! Password is: "${password}"`);
    client.release();
    await pool.end();
    return password;
  } catch (error) {
    console.log(`❌ Password "${password}" failed`);
    await pool.end();
    return null;
  }
}

async function findPassword() {
  for (const password of passwords) {
    const result = await testPassword(password);
    if (result) {
      console.log(`\n🎉 Found working password: "${result}"`);
      console.log('\n📝 Now update your .env file with:');
      console.log(`DB_PASSWORD=${result}`);
      return result;
    }
  }
  
  console.log('\n❌ No common password worked.');
  console.log('💡 Try these steps:');
  console.log('1. Open pgAdmin');
  console.log('2. Look at server connection settings');
  console.log('3. Or try connecting with pgAdmin to find the password');
  return null;
}

findPassword();
