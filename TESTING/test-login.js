const http = require('http');

// Login
const loginData = JSON.stringify({
  email: 'analista@halalsphere.com',
  password: 'senha123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3333,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('🔐 Fazendo login como analista...\n');

const loginReq = http.request(loginOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const response = JSON.parse(data);

    if (response.success) {
      console.log('✅ Login realizado com sucesso!');
      console.log(`   Nome: ${response.data.user.name}`);
      console.log(`   Email: ${response.data.user.email}`);
      console.log(`   Role: ${response.data.user.role}\n`);

      const token = response.data.token;

      // Listar processos
      console.log('📋 Listando processos...\n');

      const processOptions = {
        hostname: 'localhost',
        port: 3333,
        path: '/api/processes',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const processReq = http.request(processOptions, (res) => {
        let processData = '';

        res.on('data', (chunk) => {
          processData += chunk;
        });

        res.on('end', () => {
          const processResponse = JSON.parse(processData);

          if (processResponse.success) {
            console.log(`✅ Total de processos: ${processResponse.data.length}\n`);

            if (processResponse.data.length > 0) {
              console.log('Processos encontrados:');
              processResponse.data.forEach((proc, idx) => {
                console.log(`\n${idx + 1}. ${proc.protocol} - ${proc.companyName}`);
                console.log(`   Status: ${proc.status}`);
                console.log(`   Fase: ${proc.currentPhase}`);
                console.log(`   Analista: ${proc.assignedAnalystName || 'Não atribuído'}`);
              });
            } else {
              console.log('⚠️  Nenhum processo encontrado no sistema.');
              console.log('   Isso é esperado se ainda não houver processos cadastrados.');
            }
          } else {
            console.log('❌ Erro ao listar processos:', processResponse.error);
          }
        });
      });

      processReq.on('error', (error) => {
        console.error('❌ Erro na requisição:', error.message);
      });

      processReq.end();

    } else {
      console.log('❌ Erro no login:', response.error);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
});

loginReq.write(loginData);
loginReq.end();
