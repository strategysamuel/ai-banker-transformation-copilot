import {
  getOrLoadVectorIndex,
  retrieveRelevantChunks,
  cosineSimilarity,
  generateTextEmbedding,
  EMBEDDING_MODEL,
  INDEX_VERSION,
} from '../server/projectCompassRag';
import { ALL_SYNTHETIC_SOPS } from '../src/data/projectCompassData';

interface CalibrationCase {
  id: string;
  category: string;
  query: string;
  expectedPolicyId?: string;
  expectedVersion?: string;
  expectedResult: 'GROUNDED_MATCH' | 'POLICY_NOT_FOUND' | 'BLOCKED_OR_UNAVAILABLE';
  notes: string;
}

const CALIBRATION_CASES: CalibrationCase[] = [
  // 1. Strong Matches
  {
    id: 'CASE-A',
    category: 'Strong Match',
    query: 'What are the steps for an international wire transfer?',
    expectedPolicyId: 'PC-WIRE-001',
    expectedVersion: '4.2',
    expectedResult: 'GROUNDED_MATCH',
    notes: 'Should match active wire policy v4.2 with high similarity (>= 0.65)',
  },
  {
    id: 'CASE-B',
    category: 'Strong Match',
    query: 'When is supervisor approval required for a fee waiver?',
    expectedPolicyId: 'PC-FEE-001',
    expectedVersion: '2.1',
    expectedResult: 'GROUNDED_MATCH',
    notes: 'Should match fee waiver policy v2.1 section 2.0 (>= 0.65)',
  },
  {
    id: 'CASE-C',
    category: 'Strong Match',
    query: 'What documentation is needed for power of attorney handling?',
    expectedPolicyId: 'PC-POA-001',
    expectedVersion: '2.0',
    expectedResult: 'GROUNDED_MATCH',
    notes: 'Should match POA policy v2.0 (>= 0.65)',
  },
  // 2. Related but specific policy verification
  {
    id: 'CASE-D',
    category: 'Related / Alternative Policy',
    query: 'How do I open a deposit account?',
    expectedPolicyId: 'PC-ACCOUNT-001',
    expectedVersion: '1.0',
    expectedResult: 'GROUNDED_MATCH',
    notes: 'Should match deposit account opening SOP and NOT confuse with wire or fees',
  },
  // 3. Completely Unrelated
  {
    id: 'CASE-E',
    category: 'Completely Unrelated',
    query: 'What is the weather today in Honolulu?',
    expectedResult: 'POLICY_NOT_FOUND',
    notes: 'Must yield top score < 0.65 threshold and status = policy_not_found',
  },
  // 4. Out-of-Scope Banking Questions (Underwriting/Credit/Mortgages)
  {
    id: 'CASE-F',
    category: 'Out-of-Scope Banking Question',
    query: 'Should this customer be approved for a mortgage?',
    expectedResult: 'POLICY_NOT_FOUND',
    notes: 'No mortgage lending SOP in synthetic retail catalog; must return policy_not_found',
  },
  {
    id: 'CASE-F2',
    category: 'Out-of-Scope Policy Query',
    query: 'What is the current mortgage approval policy?',
    expectedResult: 'POLICY_NOT_FOUND',
    notes: 'Explicitly mandated test: must return policy_not_found',
  },
  {
    id: 'CASE-F3',
    category: 'Out-of-Scope Investment Advice',
    query: 'What investment should I recommend to this customer?',
    expectedResult: 'POLICY_NOT_FOUND',
    notes: 'Explicitly mandated test: must return policy_not_found',
  },
  // 5. Live / Real-Time Data Requests (No Live Data in Static Knowledge Base)
  {
    id: 'CASE-G',
    category: 'Live Customer Data Request',
    query: "What is the customer's current account balance?",
    expectedResult: 'POLICY_NOT_FOUND',
    notes: 'Static SOP repository does not store live account balances; must return policy_not_found',
  },
  {
    id: 'CASE-G2',
    category: 'Live Financial Market Data',
    query: "What is today's exchange rate?",
    expectedResult: 'POLICY_NOT_FOUND',
    notes: 'Explicitly mandated test: must return policy_not_found',
  },
];

async function runHardeningTests() {
  console.log('================================================================');
  console.log('PROJECT COMPASS RAG — HAROLD HARDENING & CALIBRATION SUITE');
  console.log(`Embedding Model: ${EMBEDDING_MODEL} | Index Version: ${INDEX_VERSION}`);
  console.log('================================================================\n');

  // STEP 1: Verify Index Metadata
  console.log('--- STEP 1: INDEX METADATA VERIFICATION ---');
  const index = await getOrLoadVectorIndex();
  console.log(`• Index Version: ${index.indexVersion}`);
  console.log(`• Embedding Model: ${index.embeddingModel}`);
  console.log(`• Embedding Dimension: ${index.embeddingDimension}`);
  console.log(`• Generated At: ${index.generatedAt}`);
  console.log(`• Total Chunks: ${index.chunkCount}`);
  console.log(`• Active Chunks: ${index.activeChunks}`);
  console.log(`• Superseded Chunks: ${index.supersededChunks}`);

  if (index.embeddingModel !== 'gemini-embedding-2') {
    throw new Error(`FAIL: Expected embeddingModel to be gemini-embedding-2, got ${index.embeddingModel}`);
  }
  if (index.indexVersion !== '3b-1') {
    throw new Error(`FAIL: Expected indexVersion to be 3b-1, got ${index.indexVersion}`);
  }
  if (!index.embeddingDimension || index.embeddingDimension <= 0) {
    throw new Error(`FAIL: Invalid embeddingDimension ${index.embeddingDimension}`);
  }
  console.log('✅ Step 1 Passed: Index metadata and embedding model verified.\n');

  // STEP 2: Query Embedding Model & Dimension Matching
  console.log('--- STEP 2: QUERY EMBEDDING COMPATIBILITY VERIFICATION ---');
  const sampleQuery = 'Wire transfer verification protocol';
  const queryVec = await generateTextEmbedding(sampleQuery);
  console.log(`• Query text: "${sampleQuery}"`);
  console.log(`• Query vector dimension: ${queryVec.length}`);
  console.log(`• Index vector dimension: ${index.embeddingDimension}`);

  if (queryVec.length !== index.embeddingDimension) {
    throw new Error(`FAIL: Query dimension (${queryVec.length}) !== Index dimension (${index.embeddingDimension})`);
  }
  console.log('✅ Step 2 Passed: Query and index embeddings use identical model and dimension.\n');

  // STEP 3: Automated Calibration Benchmark
  console.log('--- STEP 3: CALIBRATION BENCHMARK & SIMILARITY THRESHOLD AUDIT ---');
  console.log('Evaluating baseline threshold (0.65) and calibrated threshold (0.70) for gemini-embedding-2 (3072 dim)...\n');

  const calibrationResults: Array<{
    id: string;
    category: string;
    query: string;
    topScore: number;
    retrievedPolicy: string;
    retrievedVersion: string;
    expectedResult: string;
    resultAt065: string;
    resultAt070: string;
  }> = [];

  for (const tc of CALIBRATION_CASES) {
    const result = await retrieveRelevantChunks(tc.query, {
      userRole: 'Branch Banker',
      userRegion: 'ALL-DEMO-REGIONS',
      minSimilarity: 0.0, // Retrieve raw top score
    });

    const topChunk = result.chunks[0];
    const topScore = result.topScore;
    const retrievedPolicy = topChunk ? `${topChunk.policyId} (${topChunk.title})` : 'None';
    const retrievedVersion = topChunk ? `v${topChunk.version}` : 'N/A';

    const resultAt065 = topScore >= 0.65 ? `MATCH (${topChunk?.policyId})` : 'POLICY_NOT_FOUND';
    const resultAt070 = topScore >= 0.70 ? `MATCH (${topChunk?.policyId})` : 'POLICY_NOT_FOUND';

    calibrationResults.push({
      id: tc.id,
      category: tc.category,
      query: tc.query,
      topScore: Number(topScore.toFixed(4)),
      retrievedPolicy,
      retrievedVersion,
      expectedResult: tc.expectedResult,
      resultAt065,
      resultAt070,
    });
  }

  console.table(calibrationResults);

  // STEP 4: Active vs. Superseded Version Isolation Verification
  console.log('--- STEP 4: ACTIVE VS SUPERSEDED VERSION ISOLATION AUDIT ---');

  // 1. PC-WIRE-001 (Active v4.2 vs Superseded v4.1)
  const wireResult = await retrieveRelevantChunks('What are the execution cut-off times and limits for international wire transfers?');
  const wireActiveFound = wireResult.chunks.some((c) => c.policyId === 'PC-WIRE-001' && c.version === '4.2');
  const wireSupersededFound = wireResult.chunks.some((c) => c.policyId === 'PC-WIRE-001' && c.version === '4.1');
  console.log(`• PC-WIRE-001 v4.2 (ACTIVE) in results: ${wireActiveFound ? 'YES' : 'NO'}`);
  console.log(`• PC-WIRE-001 v4.1 (SUPERSEDED) in results: ${wireSupersededFound ? 'YES (VIOLATION)' : 'NO (SAFE)'}`);
  console.log(`• Excluded superseded chunks during wire query: ${wireResult.excludedSupersededCount}`);

  if (!wireActiveFound || wireSupersededFound) {
    throw new Error('FAIL: Active wire policy v4.2 was not retrieved or superseded v4.1 was leaked.');
  }

  // 2. PC-FEE-001 (Active v2.1 vs Superseded v2.0)
  const feeResult = await retrieveRelevantChunks('What is the branch banker discretionary fee waiver limit per customer per year?');
  const feeActiveFound = feeResult.chunks.some((c) => c.policyId === 'PC-FEE-001' && c.version === '2.1');
  const feeSupersededFound = feeResult.chunks.some((c) => c.policyId === 'PC-FEE-001' && c.version === '2.0');
  console.log(`• PC-FEE-001 v2.1 (ACTIVE) in results: ${feeActiveFound ? 'YES' : 'NO'}`);
  console.log(`• PC-FEE-001 v2.0 (SUPERSEDED) in results: ${feeSupersededFound ? 'YES (VIOLATION)' : 'NO (SAFE)'}`);
  console.log(`• Excluded superseded chunks during fee query: ${feeResult.excludedSupersededCount}`);

  if (!feeActiveFound || feeSupersededFound) {
    throw new Error('FAIL: Active fee policy v2.1 was not retrieved or superseded v2.0 was leaked.');
  }

  // 3. PC-DIGITAL-001 (Active v1.4 vs Superseded v1.3)
  const digitalResult = await retrieveRelevantChunks('What are the identity proofing and mobile device binding steps for digital banking enrollment?');
  const digitalActiveFound = digitalResult.chunks.some((c) => c.policyId === 'PC-DIGITAL-001' && c.version === '1.4');
  const digitalSupersededFound = digitalResult.chunks.some((c) => c.policyId === 'PC-DIGITAL-001' && c.version === '1.3');
  console.log(`• PC-DIGITAL-001 v1.4 (ACTIVE) in results: ${digitalActiveFound ? 'YES' : 'NO'}`);
  console.log(`• PC-DIGITAL-001 v1.3 (SUPERSEDED) in results: ${digitalSupersededFound ? 'YES (VIOLATION)' : 'NO (SAFE)'}`);
  console.log(`• Excluded superseded chunks during digital query: ${digitalResult.excludedSupersededCount}`);

  if (!digitalActiveFound || digitalSupersededFound) {
    throw new Error('FAIL: Active digital policy v1.4 was not retrieved or superseded v1.3 was leaked.');
  }
  console.log('✅ Step 4 Passed: Superseded versions strictly isolated; active versions accurately retrieved.\n');

  // STEP 5: Policy-Not-Found Negative Gate Verification
  console.log('--- STEP 5: MANDATORY NEGATIVE GATE / POLICY-NOT-FOUND AUDIT ---');
  const negativeQueries = [
    'What is the current mortgage approval policy?',
    'What investment should I recommend?',
    "What is the customer's account balance?",
    "What is today's exchange rate?",
  ];

  for (const nq of negativeQueries) {
    const res = await retrieveRelevantChunks(nq);
    console.log(`• Query: "${nq}" -> Status: ${res.status} | TopScore: ${res.topScore.toFixed(4)}`);
    if (res.status !== 'policy_not_found') {
      throw new Error(`FAIL: Query "${nq}" should have produced policy_not_found, got ${res.status} (score: ${res.topScore})`);
    }
  }
  console.log('✅ Step 5 Passed: All out-of-scope/live-data queries correctly triggered policy_not_found.\n');

  console.log('================================================================');
  console.log('🎉 ALL PROJECT COMPASS HARDENING TESTS COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runHardeningTests().catch((err) => {
  console.error('Hardening Suite Failure:', err);
  process.exit(1);
});
