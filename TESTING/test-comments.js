const axios = require('axios');

const API_URL = 'http://localhost:3333/api';

async function testAPIs() {
  try {
    // Login as analyst
    console.log('1. Logging in as analyst...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'analista@halalsphere.com',
      password: 'senha123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test comment creation
    console.log('\n2. Creating a test comment...');
    const commentResponse = await axios.post(`${API_URL}/comments`, {
      processId: '02bafa6a-12e4-4658-adbd-04b05ffdba3a',
      content: 'Teste de comentário criado via API - análise inicial concluída.',
      isInternal: true
    }, config);

    console.log('✅ Comment created:', commentResponse.data);

    // Test get comments
    console.log('\n3. Fetching process comments...');
    const commentsResponse = await axios.get(
      `${API_URL}/processes/02bafa6a-12e4-4658-adbd-04b05ffdba3a/comments?includeInternal=true`,
      config
    );

    console.log(`✅ Found ${commentsResponse.data.data.length} comments`);

    // Test document request
    console.log('\n4. Creating document request...');
    const docRequestResponse = await axios.post(`${API_URL}/document-requests`, {
      processId: '02bafa6a-12e4-4658-adbd-04b05ffdba3a',
      documentType: 'certificado_sanitario',
      description: 'Precisamos do certificado sanitário atualizado para prosseguir com a análise.',
      dueDate: '2025-11-25T00:00:00.000Z'
    }, config);

    console.log('✅ Document request created:', docRequestResponse.data);

    // Test get document requests
    console.log('\n5. Fetching process document requests...');
    const docRequestsResponse = await axios.get(
      `${API_URL}/processes/02bafa6a-12e4-4658-adbd-04b05ffdba3a/document-requests`,
      config
    );

    console.log(`✅ Found ${docRequestsResponse.data.data.length} document requests`);

    // Test audit creation
    console.log('\n6. Creating audit schedule...');
    const auditResponse = await axios.post(`${API_URL}/audits`, {
      processId: '02bafa6a-12e4-4658-adbd-04b05ffdba3a',
      auditType: 'estagio1',
      scheduledDate: '2025-12-01T10:00:00.000Z',
      location: {
        tipo: 'presencial',
        endereco: 'Rua Exemplo, 123 - São Paulo, SP'
      },
      auditorNotes: 'Primeira auditoria de estágio 1'
    }, config);

    console.log('✅ Audit scheduled:', auditResponse.data);

    console.log('\n🎉 ALL TESTS PASSED! All analyst features are working correctly.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPIs();
