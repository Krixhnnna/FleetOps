import http from 'http';

const log = (msg, success = true) => {
  console.log(`${success ? '✅ SUCCESS' : '❌ FAILURE'}: ${msg}`);
};

// Helper function to make HTTP requests
const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING BACKEND EXPORT HUB VERIFICATION TESTS ---\n');
  
  // Test 1: Unified Login API
  try {
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@fleetops.com',
      password: 'admin123'
    });
    
    const body = JSON.parse(loginRes.body);
    if (loginRes.statusCode === 200 && body.user && body.user.role === 'admin') {
      log('Unified login API correctly authenticates and returns credentials.');
    } else {
      log(`Unified login returned status ${loginRes.statusCode} with role ${body.user?.role}`, false);
    }
  } catch (err) {
    log(`Login test failed to connect: ${err.message}`, false);
  }

  // Test 2: Security Guardrail: verifyRole - Driver role attempt
  try {
    const driverRes = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/reports/export-csv?range=current_week',
      method: 'GET',
      headers: {
        'x-user-role': 'driver'
      }
    });

    if (driverRes.statusCode === 403) {
      log('Security Guardrail: verifyRole successfully blocks Driver role with 403 Forbidden.');
    } else {
      log(`Security Guardrail failed: expected 403 but got ${driverRes.statusCode}`, false);
    }
  } catch (err) {
    log(`Driver role test failed: ${err.message}`, false);
  }

  // Test 3: Authorized Export Hub Request & Headers check
  try {
    const managerRes = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/reports/export-csv?range=current_week',
      method: 'GET',
      headers: {
        'x-user-role': 'manager'
      }
    });

    const isCsvHeader = managerRes.headers['content-type']?.includes('text/csv');
    const isAttachment = managerRes.headers['content-disposition']?.includes('attachment; filename="fleet-report.csv"');
    const containsCsvData = managerRes.body.includes('VEH ID,ASSIGNED DRIVER,STATUS');

    if (managerRes.statusCode === 200 && isCsvHeader && isAttachment && containsCsvData) {
      log('CSV Export: API returns 200 OK with correct text/csv content-type, attachment headers, and body contents.');
    } else {
      log('CSV Export headers/data verification failed.', false);
      console.log('Returned headers:', managerRes.headers);
    }
  } catch (err) {
    log(`Authorized export test failed: ${err.message}`, false);
  }

  // Test 4: Date-Range Filtering (Today vs Current Week)
  try {
    const todayRes = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/reports/export-csv?range=today',
      method: 'GET',
      headers: {
        'x-user-role': 'admin'
      }
    });

    const allRes = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/reports/export-csv?range=last_30_days',
      method: 'GET',
      headers: {
        'x-user-role': 'admin'
      }
    });

    // Split lines, remove empty lines and header line
    const todayLines = todayRes.body.split('\n').filter(Boolean).length - 1;
    const allLines = allRes.body.split('\n').filter(Boolean).length - 1;

    if (allLines > todayLines) {
      log(`Date-range filtering: "today" range returned ${todayLines} records while "last_30_days" returned ${allLines} records.`);
    } else {
      log(`Date-range filtering: Range checks did not filter correctly (Today: ${todayLines}, 30-Days: ${allLines}).`, false);
    }
  } catch (err) {
    log(`Date-range filter test failed: ${err.message}`, false);
  }

  console.log('\n--- VERIFICATION COMPLETED ---');
};

runTests();
