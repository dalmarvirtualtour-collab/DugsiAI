const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting API Validation Tests...\n');
  const baseUrl = '127.0.0.1';
  const port = 3000;

  // Test Case 1: Tutor Concept Query (Locale: Afaan Oromo - om)
  try {
    console.log('Test 1: Concept Query (Afaan Oromo - om)');
    const res = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/tutor/concept?conceptId=CUR-CON-DC3007&activeLocale=om&bypassAuth=true',
      method: 'GET'
    });
    console.log('Status Code:', res.statusCode);
    if (res.statusCode === 200 && res.body.success) {
      console.log('✅ Success! Concept name:', res.body.concept.concept_name_en);
      console.log('   Localized Title:', res.body.concept.localized_title);
      console.log('   Localized Definition:', res.body.concept.localized_definition);
      console.log('   Vocabulary Found:', res.body.vocabulary.length);
    } else {
      console.log('❌ Failed:', res.body);
    }
  } catch (err) {
    console.log('❌ Error connecting to server:', err.message);
  }

  console.log('\n----------------------------------------\n');

  // Test Case 2: Tutor Concept Query (Locale: Somali - so)
  try {
    console.log('Test 2: Concept Query (Somali - so)');
    const res = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/tutor/concept?conceptId=CUR-CON-DC3007&activeLocale=so&bypassAuth=true',
      method: 'GET'
    });
    console.log('Status Code:', res.statusCode);
    if (res.statusCode === 200 && res.body.success) {
      console.log('✅ Success! Concept name:', res.body.concept.concept_name_en);
      console.log('   Localized Title:', res.body.concept.localized_title);
      console.log('   Localized Definition:', res.body.concept.localized_definition);
    } else {
      console.log('❌ Failed:', res.body);
    }
  } catch (err) {
    console.log('❌ Error connecting to server:', err.message);
  }

  console.log('\n----------------------------------------\n');

  // Test Case 3: Gamified Metrics Retrieval (GET)
  try {
    console.log('Test 3: Get Student Gamified Metrics');
    const res = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/exams/mock?bypassAuth=true',
      method: 'GET'
    });
    console.log('Status Code:', res.statusCode);
    if (res.statusCode === 200 && res.body.success) {
      console.log('✅ Success! Level:', res.body.metrics.level);
      console.log('   XP:', res.body.metrics.xp);
      console.log('   Streak (Days):', res.body.metrics.streak);
      console.log('   Average Solving Velocity:', res.body.metrics.velocityMetrics.averageSecondsPerQuestion, 'seconds/question');
    } else {
      console.log('❌ Failed:', res.body);
    }
  } catch (err) {
    console.log('❌ Error connecting to server:', err.message);
  }

  console.log('\n----------------------------------------\n');

  // Test Case 4: Gamified Score Ingestion (POST)
  try {
    console.log('Test 4: Post Mock Exam Score (Ingest Metrics)');
    const postData = {
      examId: 'ESSLCE-2024-Physics',
      score: 88,
      secondsSpent: 1200,
      questionsCount: 30
    };
    const res = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/exams/mock?bypassAuth=true',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, postData);
    console.log('Status Code:', res.statusCode);
    if (res.statusCode === 200 && res.body.success) {
      console.log('✅ Success! Message:', res.body.message);
      console.log('   XP Gained:', res.body.xpGained);
      console.log('   New PR:', res.body.isNewPR);
      console.log('   New Streak:', res.body.metrics.streak);
      console.log('   New Solving Velocity:', res.body.metrics.velocityMetrics.averageSecondsPerQuestion, 'seconds/question');
    } else {
      console.log('❌ Failed:', res.body);
    }
  } catch (err) {
    console.log('❌ Error connecting to server:', err.message);
  }

  console.log('\n🎉 API Validation Testing Complete!');
}

runTests();
