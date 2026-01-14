// Test document upload endpoint
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUpload() {
  try {
    // Create a test file
    const testFilePath = 'test-document.txt';
    fs.writeFileSync(testFilePath, 'Test document content');

    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('requestId', '1e6c6e30-2e33-43cc-a699-f07130759fc3'); // Use existing process ID
    form.append('documentType', 'outros');

    console.log('Sending upload request...');

    const response = await axios.post('http://localhost:3333/api/documents/upload', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer <seu-token-aqui>' // You'll need to replace this
      }
    });

    console.log('Upload successful!');
    console.log('Response:', response.data);

    // Clean up
    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error('Upload failed!');
    console.error('Error:', error.response?.data || error.message);
  }
}

testUpload();
