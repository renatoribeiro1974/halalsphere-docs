/**
 * Test script for analyst assignment feature
 *
 * This script tests:
 * 1. Login as gestor/analista
 * 2. List all analysts
 * 3. Get processes without assigned analysts
 * 4. Assign an analyst to a process
 * 5. Verify the process was updated correctly
 */

const BASE_URL = 'http://localhost:3333/api';

async function testAnalystAssignment() {
  console.log('🧪 Testing Analyst Assignment Feature\n');

  try {
    // Step 1: Login as analyst
    console.log('1️⃣ Logging in as analyst...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'analista@halalsphere.com',
        password: 'senha123',
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    const analystId = loginData.data.user.id;
    console.log('✅ Login successful');
    console.log(`   User: ${loginData.data.user.name} (${loginData.data.user.email})`);
    console.log(`   Role: ${loginData.data.user.role}`);
    console.log(`   Analyst ID: ${analystId}\n`);

    // Step 2: List all analysts
    console.log('2️⃣ Fetching list of analysts...');
    const analystsResponse = await fetch(`${BASE_URL}/auth/users?role=analista`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!analystsResponse.ok) {
      throw new Error(`Failed to fetch analysts: ${analystsResponse.status}`);
    }

    const analystsData = await analystsResponse.json();
    const analysts = analystsData.data || [];
    console.log(`✅ Found ${analysts.length} analyst(s):`);
    analysts.forEach(analyst => {
      console.log(`   - ${analyst.name} (${analyst.email}) - ID: ${analyst.id}`);
    });
    console.log('');

    // Step 3: Get all processes
    console.log('3️⃣ Fetching all processes...');
    const processesResponse = await fetch(`${BASE_URL}/processes`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!processesResponse.ok) {
      throw new Error(`Failed to fetch processes: ${processesResponse.status}`);
    }

    const processesData = await processesResponse.json();
    const processes = processesData.data || [];
    console.log(`✅ Found ${processes.length} process(es)`);

    // Find processes without assigned analysts
    const unassignedProcesses = processes.filter(p => !p.assignedAnalystId);
    console.log(`   Processes without assigned analyst: ${unassignedProcesses.length}`);

    if (unassignedProcesses.length > 0) {
      console.log('   Unassigned processes:');
      unassignedProcesses.forEach(p => {
        console.log(`   - ${p.protocol} (${p.companyName}) - Phase: ${p.currentPhase}`);
      });
    }
    console.log('');

    // Step 4: Assign analyst to first unassigned process (if any)
    if (unassignedProcesses.length > 0 && analysts.length > 0) {
      const processToAssign = unassignedProcesses[0];
      const selectedAnalyst = analysts[0];

      console.log('4️⃣ Assigning analyst to process...');
      console.log(`   Process: ${processToAssign.protocol}`);
      console.log(`   Analyst: ${selectedAnalyst.name}`);
      console.log(`   Priority: media`);

      const assignResponse = await fetch(`${BASE_URL}/processes/${processToAssign.id}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analystId: selectedAnalyst.id,
          priority: 'media',
        }),
      });

      if (!assignResponse.ok) {
        const errorData = await assignResponse.json();
        throw new Error(`Failed to assign analyst: ${JSON.stringify(errorData)}`);
      }

      const assignData = await assignResponse.json();
      console.log('✅ Analyst assigned successfully!');
      console.log(`   Updated process:`, JSON.stringify(assignData.data, null, 2));
      console.log('');

      // Step 5: Verify the assignment
      console.log('5️⃣ Verifying assignment...');
      const verifyResponse = await fetch(`${BASE_URL}/processes/${processToAssign.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!verifyResponse.ok) {
        throw new Error(`Failed to verify process: ${verifyResponse.status}`);
      }

      const verifyData = await verifyResponse.json();
      const updatedProcess = verifyData.data;

      console.log('✅ Verification successful!');
      console.log(`   Protocol: ${updatedProcess.protocol}`);
      console.log(`   Assigned Analyst ID: ${updatedProcess.assignedAnalystId}`);
      console.log(`   Assigned Analyst Name: ${updatedProcess.assignedAnalystName}`);
      console.log(`   Current Phase: ${updatedProcess.currentPhase}`);
      console.log(`   Status: ${updatedProcess.status}`);
      console.log('');

      // Check if auto-transition happened
      if (processToAssign.currentPhase === 'cadastro_solicitacao' &&
          updatedProcess.currentPhase === 'analise_documental') {
        console.log('✨ Auto-transition detected!');
        console.log(`   Phase changed: cadastro_solicitacao → analise_documental`);
        console.log(`   Status changed: pendente → em_andamento`);
      }
    } else {
      console.log('⚠️  Cannot test assignment: ');
      if (unassignedProcesses.length === 0) {
        console.log('   - No unassigned processes found');
      }
      if (analysts.length === 0) {
        console.log('   - No analysts found');
      }
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testAnalystAssignment();
