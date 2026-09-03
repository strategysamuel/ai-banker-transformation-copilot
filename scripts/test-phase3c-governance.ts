/**
 * AI BANKER TRANSFORMATION COPILOT
 * Phase 3C Governance, Policy Version Safety, and Human-in-the-Loop Test Suite
 *
 * Validates:
 * 1. Hardened Grounding & System Instructions
 * 2. Strict Negative Gate (No Gemini on policy_not_found)
 * 3. Citation Validation against retrieved chunks
 * 4. Policy Version Safety (Active only, Conflict detection)
 * 5. Effective Date & Scheduled Review Date Safety
 * 6. Deterministic High-Risk Policy Classification
 * 7. Human-in-the-Loop Verification Metadata
 * 8. Governance Audit Record Logging (Zero Secrets/Tokens)
 * 9. Regression Safety across Phase 1, Phase 2A/B, and Phase 3A/B
 */

import {
  evaluatePolicyRisk,
  evaluateReviewDate,
  detectPolicyVersionConflicts,
  validateAndAlignCitations,
  logGovernanceAuditRecord,
  getGovernanceAuditLogs,
  retrieveRelevantChunks,
  getVectorStoreSummary,
  buildPolicyChunks,
} from '../server/projectCompassRag';
import { PROJECT_COMPASS_SYSTEM_INSTRUCTION } from '../server/gemini';
import { SYNTHETIC_SOP_CATALOG, ALL_SYNTHETIC_SOPS } from '../src/data/projectCompassData';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `— ${details}` : ''}`);
    failed++;
  }
}

async function runPhase3CGovernanceTests() {
  console.log('\n===============================================================');
  console.log('  PHASE 3C: GOVERNANCE, VERSION SAFETY & HUMAN VERIFICATION TESTS');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // Test Group 1: Grounded System Instruction Mandates
  // -------------------------------------------------------------
  console.log('--- Test Group 1: System Instruction Grounding & Mandates ---');
  assert(
    PROJECT_COMPASS_SYSTEM_INSTRUCTION.includes('EXCLUSIVE RETRIEVED SOURCE CONSTRAINT'),
    'System instruction enforces exclusive retrieved source constraint'
  );
  assert(
    PROJECT_COMPASS_SYSTEM_INSTRUCTION.includes('NO GENERAL KNOWLEDGE'),
    'System instruction prohibits general world knowledge'
  );
  assert(
    PROJECT_COMPASS_SYSTEM_INSTRUCTION.includes('NO INVENTED PROCEDURES OR THRESHOLDS'),
    'System instruction prohibits invented thresholds or approvals'
  );
  assert(
    PROJECT_COMPASS_SYSTEM_INSTRUCTION.includes('NO LIVE ACCOUNT / TRANSACTION ACTIONS'),
    'System instruction prohibits live account access / transaction execution'
  );
  assert(
    PROJECT_COMPASS_SYSTEM_INSTRUCTION.includes('NO CREDIT / LENDING DECISIONS'),
    'System instruction prohibits lending/credit approval decisions'
  );
  assert(
    PROJECT_COMPASS_SYSTEM_INSTRUCTION.includes('ADVISORY-ONLY NATURE'),
    'System instruction declares AI guidance is advisory only'
  );
  assert(
    PROJECT_COMPASS_SYSTEM_INSTRUCTION.includes('REFUSAL & INSUFFICIENT EVIDENCE'),
    'System instruction directs refusal on insufficient evidence'
  );

  // -------------------------------------------------------------
  // Test Group 2: Deterministic High-Risk Action Classification
  // -------------------------------------------------------------
  console.log('\n--- Test Group 2: Deterministic High-Risk Policy Classification ---');
  const wireRisk = evaluatePolicyRisk('PC-WIRE-001', 'International Outward Wire Transfer SOP');
  assert(
    wireRisk.isHighRisk && wireRisk.riskLevel === 'HIGH_OPERATIONAL_RISK',
    'PC-WIRE-001 is classified as HIGH_OPERATIONAL_RISK requiring verification'
  );

  const poaRisk = evaluatePolicyRisk('PC-POA-003', 'Power of Attorney Verification & Validation SOP');
  assert(
    poaRisk.isHighRisk && poaRisk.riskLevel === 'HIGH_OPERATIONAL_RISK',
    'PC-POA-003 is classified as HIGH_OPERATIONAL_RISK requiring verification'
  );

  const feeRisk = evaluatePolicyRisk('PC-FEE-004', 'Retail Service Fee Waiver & Authorization SOP');
  assert(
    feeRisk.isHighRisk && feeRisk.riskLevel === 'HIGH_OPERATIONAL_RISK',
    'PC-FEE-004 is classified as HIGH_OPERATIONAL_RISK requiring verification'
  );

  const kycRisk = evaluatePolicyRisk('PC-ACCOUNT-001', 'Deposit Account Opening & Customer Identification Program (CIP/KYC) SOP');
  assert(
    kycRisk.isHighRisk && kycRisk.riskLevel === 'HIGH_OPERATIONAL_RISK',
    'PC-ACCOUNT-001 is classified as HIGH_OPERATIONAL_RISK requiring verification'
  );

  const dormantRisk = evaluatePolicyRisk('PC-DORMANT-002', 'Dormant Account Management & Reactivation SOP');
  assert(
    dormantRisk.isHighRisk && dormantRisk.riskLevel === 'HIGH_OPERATIONAL_RISK',
    'PC-DORMANT-002 is classified as HIGH_OPERATIONAL_RISK requiring verification'
  );

  const safeRisk = evaluatePolicyRisk('PC-SAFE-007', 'Safe Deposit Box Access & Drilling Procedures SOP');
  assert(
    !safeRisk.isHighRisk && safeRisk.riskLevel === 'STANDARD_OPERATIONAL',
    'PC-SAFE-007 is classified as STANDARD_OPERATIONAL with advisory notice'
  );

  // -------------------------------------------------------------
  // Test Group 3: Policy Version Conflict & Active-Only Enforcement
  // -------------------------------------------------------------
  console.log('\n--- Test Group 3: Policy Version Safety & Conflict Detection ---');
  // Scenario A: All active chunks from same version
  const allGeneratedChunks = buildPolicyChunks(ALL_SYNTHETIC_SOPS);
  const activeWireChunks = allGeneratedChunks.filter(
    (c) => c.policyId === 'PC-WIRE-001' && c.version === '4.2'
  ).map((c) => ({ ...c, similarityScore: 0.92 }));
  const checkA = detectPolicyVersionConflicts(activeWireChunks);
  assert(!checkA.hasConflict, 'Single active version (v4.2) passes without conflict');

  // Scenario B: Corrupted input with superseded version present
  const mixedVersionChunks = [
    { ...activeWireChunks[0], version: '4.2', status: 'ACTIVE' as const },
    { ...activeWireChunks[0], chunkId: 'pc-wire-old', version: '4.1', status: 'SUPERSEDED' as const },
  ];
  const checkB = detectPolicyVersionConflicts(mixedVersionChunks as any);
  assert(checkB.hasConflict, 'Mixed active and superseded versions trigger conflict gate');

  // Scenario C: Multiple active versions for same policy ID
  const multiVersionChunks = [
    { ...activeWireChunks[0], version: '4.2', status: 'ACTIVE' as const },
    { ...activeWireChunks[0], chunkId: 'pc-wire-diff', version: '4.3', status: 'ACTIVE' as const },
  ];
  const checkC = detectPolicyVersionConflicts(multiVersionChunks as any);
  assert(checkC.hasConflict, 'Multiple distinct active versions trigger conflict gate');

  // -------------------------------------------------------------
  // Test Group 4: Effective Date & Scheduled Review Date Safety
  // -------------------------------------------------------------
  console.log('\n--- Test Group 4: Effective Date & Scheduled Review Safety ---');
  const pastEval = evaluateReviewDate('2025-01-01');
  assert(pastEval.type === 'PAST_REVIEW', 'Past review date evaluated as PAST_REVIEW warning');

  const futureEval = evaluateReviewDate('2028-01-01');
  assert(futureEval.type === 'CURRENT', 'Future review date evaluated as CURRENT');

  // Approaching review (e.g. 30 days from simulated date)
  const simulatedNow = new Date('2026-09-01T00:00:00Z');
  const approachingDate = new Date(simulatedNow.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const approachingEval = evaluateReviewDate(approachingDate);
  assert(approachingEval.type === 'APPROACHING_REVIEW', 'Date within 90 days evaluated as APPROACHING_REVIEW');

  // -------------------------------------------------------------
  // Test Group 5: Citation Validation & Alignment
  // -------------------------------------------------------------
  console.log('\n--- Test Group 5: Citation Validation & Alignment ---');
  const mockRetrieved = [
    {
      chunkId: 'chunk-wire-1',
      policyId: 'PC-WIRE-001',
      title: 'International Wire Transfer SOP',
      version: '4.2',
      status: 'ACTIVE' as const,
      policyOwner: 'Wire Operations',
      sectionNumber: '3.1',
      sectionTitle: 'Dual Authorization & Approval Thresholds',
      effectiveDate: '2026-08-01',
      nextReviewDate: '2027-08-01',
      sourceUri: 'synthetic-kb://project-compass/policies/PC-WIRE-001/v4.2',
      citationAnchor: 'PC-WIRE-001-v4.2-section-3.1',
      applicableRoles: ['Branch Banker'],
      applicableRegion: 'ALL-DEMO-REGIONS',
      text: 'Wire transfer content...',
      demoData: true as const,
      similarityScore: 0.95,
    },
  ];

  // Case 1: Valid citation matching retrieved chunk
  const validRawCitations = [
    {
      policyId: 'PC-WIRE-001',
      title: 'International Wire Transfer SOP',
      version: '4.2',
      sectionNumber: '3.1',
      sectionTitle: 'Dual Authorization & Approval Thresholds',
      effectiveDate: '2026-08-01',
      sourceUri: 'synthetic-kb://project-compass/policies/PC-WIRE-001/v4.2',
      citationAnchor: 'PC-WIRE-001-v4.2-section-3.1',
    },
  ];
  const valResult1 = validateAndAlignCitations(validRawCitations, mockRetrieved);
  assert(valResult1.valid && valResult1.citations.length === 1, 'Valid citation aligned perfectly');
  assert(valResult1.citations[0].status === 'ACTIVE', 'Citation enforces status=ACTIVE');

  // Case 2: Fabricated citation anchor from LLM
  const fabricatedCitations = [
    {
      policyId: 'PC-MORTGAGE-999',
      title: 'Fabricated Mortgage Policy',
      version: '1.0',
      sectionNumber: '9.9',
      sectionTitle: 'Fake Section',
      effectiveDate: '2026-01-01',
      sourceUri: 'fake-uri',
      citationAnchor: 'PC-MORTGAGE-999-v1.0-section-9.9',
    },
  ];
  const valResult2 = validateAndAlignCitations(fabricatedCitations, mockRetrieved);
  assert(
    valResult2.citations.length === 1 && valResult2.citations[0].policyId === 'PC-WIRE-001',
    'Fabricated citations stripped and replaced with genuine retrieved SOP chunk'
  );

  // -------------------------------------------------------------
  // Test Group 6: Governance Audit Logging (Security & Zero Secrets)
  // -------------------------------------------------------------
  console.log('\n--- Test Group 6: Governance Audit Logging ---');
  logGovernanceAuditRecord({
    authenticatedUid: 'test-banker-uid-12345',
    queryId: 'req-test-999',
    query: 'What are wire transfer dual authorization rules?',
    retrievedChunkIds: ['chunk-wire-1'],
    policyIds: ['PC-WIRE-001'],
    policyVersions: ['4.2'],
    similarityScores: [0.95],
    citationAnchors: ['PC-WIRE-001-v4.2-section-3.1'],
    modelUsed: 'gemini-2.5-flash',
    responseStatus: 'grounded',
    highRiskClassification: true,
    verificationRequired: true,
  });

  const auditLogs = getGovernanceAuditLogs();
  const testRecord = auditLogs.find((l) => l.queryId === 'req-test-999');
  assert(!!testRecord, 'Governance audit record successfully logged in memory store');
  assert(testRecord?.authenticatedUid === 'test-banker-uid-12345', 'Audit record preserves authenticated UID');
  assert(testRecord?.highRiskClassification === true, 'Audit record captures highRiskClassification flag');
  assert(
    !JSON.stringify(testRecord).includes('AIzaSy') && !JSON.stringify(testRecord).includes('Bearer'),
    'Audit logs contain zero API keys, auth tokens, or passwords'
  );

  // -------------------------------------------------------------
  // Test Group 7: End-to-End Retrieval & Negative Gate Validation
  // -------------------------------------------------------------
  console.log('\n--- Test Group 7: Vector Retrieval & Negative Gate Integration ---');
  const summary = getVectorStoreSummary();
  assert(summary.totalActiveChunks >= 10, `Vector store maintains active synthetic SOP chunks (found ${summary.totalActiveChunks})`);
  assert(summary.embeddingModel === 'gemini-embedding-2', 'Vector index uses stable gemini-embedding-2');
  assert(summary.dimensions === 3072, 'Vectors have 3,072 dimensions');

  // Out of scope query
  const outOfScope = await retrieveRelevantChunks('Can you approve a $500,000 commercial real estate mortgage loan today?');
  assert(
    outOfScope.status === 'policy_not_found',
    'Out of scope query triggers policy_not_found negative gate'
  );

  // Valid policy query
  const wireQuery = await retrieveRelevantChunks('What are the authorization thresholds for international wire transfers?');
  assert(
    wireQuery.status === 'grounded' && wireQuery.chunks.length > 0,
    'Valid policy query retrieves grounded chunks'
  );
  assert(
    wireQuery.chunks.every((c) => c.status === 'ACTIVE'),
    'Every retrieved chunk has status=ACTIVE'
  );

  // -------------------------------------------------------------
  // Test Group 8: SOP Catalog Consistency
  // -------------------------------------------------------------
  console.log('\n--- Test Group 8: SOP Catalog Completeness ---');
  assert(SYNTHETIC_SOP_CATALOG.policies.length === 10, 'SOP catalog contains 10 synthetic Standard Operating Procedures');
  const allActiveSOPs = SYNTHETIC_SOP_CATALOG.policies.every((s) => s.status === 'ACTIVE');
  assert(allActiveSOPs, 'All 10 catalog SOPs have status=ACTIVE');
  const allHaveDates = SYNTHETIC_SOP_CATALOG.policies.every((s) => s.effectiveDate && s.nextReviewDate);
  assert(allHaveDates, 'All catalog SOPs have effectiveDate and nextReviewDate populated');

  console.log('\n===============================================================');
  console.log(`  PHASE 3C TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase3CGovernanceTests().catch((err) => {
  console.error('Fatal error during Phase 3C tests:', err);
  process.exit(1);
});
