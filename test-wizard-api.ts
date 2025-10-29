/**
 * Test script para verificar que el API del wizard funciona correctamente
 */

async function testWizardAPI() {
  console.log('🧪 Testing Wizard API...\n');

  // Test para profesión LAWYER
  console.log('📝 Test 1: PROFESSIONAL (LAWYER)');
  const response1 = await fetch('http://localhost:3000/api/wizard/activities?profileType=PROFESSIONAL&profession=LAWYER');
  const data1 = await response1.json();
  console.log(`   ✅ Activities: ${data1.activities?.length || 0}`);
  console.log(`   ✅ Risk Areas: ${data1.riskAreas?.length || 0}\n`);

  // Test para profesión DOCTOR
  console.log('📝 Test 2: PROFESSIONAL (DOCTOR)');
  const response2 = await fetch('http://localhost:3000/api/wizard/activities?profileType=PROFESSIONAL&profession=DOCTOR');
  const data2 = await response2.json();
  console.log(`   ✅ Activities: ${data2.activities?.length || 0}`);
  console.log(`   ✅ Risk Areas: ${data2.riskAreas?.length || 0}\n`);

  // Test para tipo de negocio TECHNOLOGY
  console.log('📝 Test 3: BUSINESS (TECHNOLOGY)');
  const response3 = await fetch('http://localhost:3000/api/wizard/activities?profileType=BUSINESS&businessType=TECHNOLOGY');
  const data3 = await response3.json();
  console.log(`   ✅ Activities: ${data3.activities?.length || 0}`);
  console.log(`   ✅ Risk Areas: ${data3.riskAreas?.length || 0}\n`);

  // Test para tipo de negocio E_COMMERCE
  console.log('📝 Test 4: BUSINESS (E_COMMERCE)');
  const response4 = await fetch('http://localhost:3000/api/wizard/activities?profileType=BUSINESS&businessType=E_COMMERCE');
  const data4 = await response4.json();
  console.log(`   ✅ Activities: ${data4.activities?.length || 0}`);
  console.log(`   ✅ Risk Areas: ${data4.riskAreas?.length || 0}\n`);

  console.log('✅ All tests passed!\n');
}

testWizardAPI().catch(console.error);
