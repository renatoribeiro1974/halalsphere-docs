/**
 * Test script for Audit Schedule flow
 * Tests the complete flow: login -> get process -> schedule audit -> view audits
 */

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ1OWU1OTc1LTMxYzUtNDJjZi05YzA4LWJiMmNjZWM1MjQ2MSIsImVtYWlsIjoiYW5hbGlzdGFAaGFsYWxzcGhlcmUuY29tIiwicm9sZSI6ImFuYWxpc3RhIiwiY29tcGFueUlkIjpudWxsLCJpYXQiOjE3NjM0OTgwNzksImV4cCI6MTc2NDEwMjg3OX0.3f06Gpz79XCcwFs9SXhynlXBD_gOAmk3bwul6Wmw82o";
const BASE_URL = "http://localhost:3333/api";

async function testAuditSchedule() {
  console.log("🧪 Testing Audit Schedule Flow\n");

  try {
    // Step 1: Get all processes
    console.log("📋 Step 1: Fetching processes...");
    const processesResponse = await fetch(`${BASE_URL}/processes`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!processesResponse.ok) {
      throw new Error(`Failed to fetch processes: ${processesResponse.statusText}`);
    }

    const processesData = await processesResponse.json();
    console.log(`✅ Found ${processesData.data.length} processes`);

    if (processesData.data.length === 0) {
      console.log("❌ No processes found. Please create a process first.");
      return;
    }

    // Get the first process in "auditoria_agendada" phase or any process
    let testProcess = processesData.data.find(p => p.currentPhase === 'auditoria_agendada');

    if (!testProcess) {
      console.log("⚠️  No process in 'auditoria_agendada' phase, using first available process");
      testProcess = processesData.data[0];

      // Try to advance the process to auditoria_agendada phase
      console.log(`\n🔄 Attempting to advance process ${testProcess.id} to auditoria_agendada phase...`);
      const advanceResponse = await fetch(`${BASE_URL}/processes/${testProcess.id}/advance-phase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phase: 'auditoria_agendada',
          notes: 'Testing audit schedule',
        }),
      });

      if (advanceResponse.ok) {
        console.log("✅ Process advanced to auditoria_agendada phase");
      } else {
        console.log("⚠️  Could not advance phase, continuing with current phase");
      }
    }

    console.log(`\n📌 Using process: ${testProcess.protocol} (${testProcess.companyName})`);
    console.log(`   Current phase: ${testProcess.currentPhase}`);

    // Step 2: Create an audit schedule
    console.log("\n📅 Step 2: Creating audit schedule...");

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 7); // Schedule for 7 days from now

    const auditData = {
      processId: testProcess.id,
      auditType: 'estagio1',
      scheduledDate: scheduledDate.toISOString(),
      location: {
        tipo: 'presencial',
        endereco: 'Rua Teste, 123 - São Paulo, SP',
      },
      auditorNotes: 'Auditoria de teste - favor trazer documentação completa',
    };

    const createAuditResponse = await fetch(`${BASE_URL}/audits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData),
    });

    if (!createAuditResponse.ok) {
      const errorData = await createAuditResponse.json();
      throw new Error(`Failed to create audit: ${errorData.error || createAuditResponse.statusText}`);
    }

    const createAuditData = await createAuditResponse.json();
    const createdAudit = createAuditData.data;
    console.log(`✅ Audit scheduled successfully!`);
    console.log(`   Audit ID: ${createdAudit.id}`);
    console.log(`   Type: ${createdAudit.auditType}`);
    console.log(`   Date: ${new Date(createdAudit.scheduledDate).toLocaleString('pt-BR')}`);
    console.log(`   Location: ${createdAudit.location.tipo}`);

    // Step 3: Get audits for the process
    console.log("\n📋 Step 3: Fetching audits for process...");
    const auditsResponse = await fetch(`${BASE_URL}/processes/${testProcess.id}/audits`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!auditsResponse.ok) {
      throw new Error(`Failed to fetch audits: ${auditsResponse.statusText}`);
    }

    const auditsData = await auditsResponse.json();
    console.log(`✅ Found ${auditsData.data.length} audit(s) for this process`);
    auditsData.data.forEach((audit, index) => {
      console.log(`   ${index + 1}. ${audit.auditType} - ${new Date(audit.scheduledDate).toLocaleString('pt-BR')} (${audit.status})`);
    });

    // Step 4: Get audit statistics
    console.log("\n📊 Step 4: Fetching audit statistics...");
    const statsResponse = await fetch(`${BASE_URL}/audits/statistics`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!statsResponse.ok) {
      throw new Error(`Failed to fetch statistics: ${statsResponse.statusText}`);
    }

    const statsData = await statsResponse.json();
    console.log("✅ Statistics:");
    console.log(`   Total audits: ${statsData.data.total}`);
    console.log(`   By status:`);
    console.log(`     - Agendado: ${statsData.data.byStatus.agendado}`);
    console.log(`     - Em andamento: ${statsData.data.byStatus.em_andamento}`);
    console.log(`     - Concluído: ${statsData.data.byStatus.concluido}`);
    console.log(`     - Cancelado: ${statsData.data.byStatus.cancelado}`);

    // Step 5: Get upcoming audits
    console.log("\n📅 Step 5: Fetching upcoming audits (next 30 days)...");
    const upcomingResponse = await fetch(`${BASE_URL}/audits/upcoming?daysAhead=30`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!upcomingResponse.ok) {
      throw new Error(`Failed to fetch upcoming audits: ${upcomingResponse.statusText}`);
    }

    const upcomingData = await upcomingResponse.json();
    console.log(`✅ Found ${upcomingData.data.length} upcoming audit(s)`);
    upcomingData.data.forEach((audit, index) => {
      console.log(`   ${index + 1}. ${audit.process?.protocol} - ${audit.auditType}`);
      console.log(`      Date: ${new Date(audit.scheduledDate).toLocaleString('pt-BR')}`);
      console.log(`      Company: ${audit.process?.companyName}`);
    });

    // Step 6: Update audit (optional - demonstrate update capability)
    console.log("\n✏️  Step 6: Updating audit notes...");
    const updateResponse = await fetch(`${BASE_URL}/audits/${createdAudit.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auditorNotes: 'Observações atualizadas: Auditoria confirmada. Empresa notificada.',
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update audit: ${updateResponse.statusText}`);
    }

    console.log("✅ Audit updated successfully!");

    console.log("\n✨ All tests completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   ✓ Process selected: ${testProcess.protocol}`);
    console.log(`   ✓ Audit scheduled: ${createdAudit.id}`);
    console.log(`   ✓ Statistics retrieved`);
    console.log(`   ✓ Upcoming audits listed`);
    console.log(`   ✓ Audit updated`);

    console.log("\n🎯 Next steps:");
    console.log(`   1. Open the analyst dashboard and navigate to process ${testProcess.protocol}`);
    console.log(`   2. You should see the "Agendar Auditoria" button`);
    console.log(`   3. Click it to open the scheduling modal`);
    console.log(`   4. Open the auditor dashboard to see the scheduled audit`);
    console.log(`   5. Switch to calendar view to see the audit on the calendar`);

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error);
  }
}

// Run the test
testAuditSchedule();
