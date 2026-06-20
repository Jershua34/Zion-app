const http = require('http');

const API_PORT = 5000;
const BASE_URL = `http://localhost:${API_PORT}/api`;

const makeRequest = (path, method = 'GET', body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: API_PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) req.write(payload);
    req.end();
  });
};

const runTests = async () => {
  console.log('=== STARTING AUTOMATED API VERIFICATION ===');

  try {
    // Test 1: Check basic health check
    console.log('Testing Health Check...');
    const health = await makeRequest('/');
    console.log(`- Status: ${health.status}, Response:`, health.raw || health.data);

    // Test 2: Fetch default site content
    console.log('\nTesting GET /api/content...');
    const content = await makeRequest('/content');
    console.log(`- Status: ${content.status}`);
    console.log(`- Contenido keys cargadas: ${Object.keys(content.data).length}`);

    // Test 3: Member registration check
    console.log('\nTesting POST /api/members...');
    const memberPayload = {
      name: 'Verificador Automático',
      phone: '8888-9999',
      email: 'test@zionquepos.org',
      source: 'otro'
    };
    const regMember = await makeRequest('/members', 'POST', memberPayload);
    console.log(`- Status: ${regMember.status}, Msg: ${regMember.data.message}`);
    const memberId = regMember.data.member._id;

    // Test 4: Submit prayer request linking to member
    console.log('\nTesting POST /api/prayers...');
    const prayerPayload = {
      memberId: memberId,
      title: 'Oración de verificación',
      text: 'Petición automática de prueba para validar enrutamiento.',
      category: 'Otro'
    };
    const regPrayer = await makeRequest('/prayers', 'POST', prayerPayload);
    console.log(`- Status: ${regPrayer.status}, Msg: ${regPrayer.data.message}`);

    // Test 5: Admin Login
    console.log('\nTesting Admin Login (POST /api/auth/login)...');
    const login = await makeRequest('/auth/login', 'POST', { username: 'admin', password: 'password_incorrecto' });
    console.log(`- Intento fallido con clave incorrecta: Status ${login.status} (Esperado: 401)`);

    const loginCorrect = await makeRequest('/auth/login', 'POST', { username: 'admin', password: '170505' });
    console.log(`- Intento correcto con 170505: Status ${loginCorrect.status} (Esperado: 200)`);
    
    if (loginCorrect.status === 200 && loginCorrect.data.token) {
      const token = loginCorrect.data.token;
      console.log('  Token recibido con éxito.');

      // Test 6: Verify Admin lists
      console.log('\nTesting Admin GET /api/members...');
      const adminMembers = await makeRequest('/members', 'GET', null, { 'Authorization': `Bearer ${token}` });
      console.log(`- Status: ${adminMembers.status}, Cantidad miembros: ${adminMembers.data.length}`);

      // Test 7: Update Live settings
      console.log('\nTesting Admin PUT /api/stream...');
      const streamUpdate = await makeRequest('/stream', 'PUT', { isLive: true, youtubeUrl: 'https://youtube.com/embed/pX9-J-fU4XQ' }, { 'Authorization': `Bearer ${token}` });
      console.log(`- Status: ${streamUpdate.status}, isLive actualizado a: ${streamUpdate.data.config.isLive}`);
    }

    console.log('\n=== VERIFICATION COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('\n!!! VERIFICATION FAILED !!!');
    console.error(error.message);
  }
};

// Run after a short delay to allow server to start
setTimeout(runTests, 1000);
