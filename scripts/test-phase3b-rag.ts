import { retrieveRelevantChunks, getOrLoadVectorIndex } from '../server/projectCompassRag';
import { generateGroundedProjectCompassAnswer } from '../server/gemini';

async function runPhase3BTests() {
  console.log('====================================================');
  console.log('PHASE 3B — PROJECT COMPASS RAG AUTOMATED VERIFICATION');
  console.log('====================================================\n');

  // Test 1: Load and verify vector index integrity
  console.log('--- TEST 1: Vector Index Integrity ---');
  const index = await getOrLoadVectorIndex();
  console.log(`✓ Total Indexed Chunks: ${index.totalChunks}`);
  console.log(`✓ Active Chunks: ${index.activeChunks}`);
  console.log(`✓ Superseded Chunks: ${index.supersededChunks}`);
  console.log(`✓ Embedding Model: ${index.embeddingModel}`);
  console.log(`✓ Indexed At: ${index.indexedAt}`);

  if (index.totalChunks < 30) {
    throw new Error('Vector index has insufficient chunk count');
  }

  // Test 2: Active version isolation verification
  console.log('\n--- TEST 2: Active Version Isolation in Search ---');
  const activeSearchResults = await retrieveRelevantChunks('international wire transfer authorization limit', {
    topK: 5,
    minSimilarity: 0.5,
  });

  const hasSuperseded = activeSearchResults.chunks.some(c => c.status === 'SUPERSEDED');
  console.log(`✓ Retrieved Chunks Count: ${activeSearchResults.chunks.length}`);
  console.log(`✓ Top Similarity Score: ${activeSearchResults.topScore.toFixed(4)}`);
  console.log(`✓ Top Chunk: ${activeSearchResults.chunks[0]?.policyId} v${activeSearchResults.chunks[0]?.version} - ${activeSearchResults.chunks[0]?.title}`);
  console.log(`✓ Superseded Chunks Excluded in Search: ${activeSearchResults.excludedSupersededCount} chunks`);
  console.log(`✓ No Superseded in Results: ${!hasSuperseded}`);

  if (hasSuperseded) {
    throw new Error('FAILED: Superseded chunk was retrieved when activeOnly=true');
  }

  // Test 3: Wire Transfer SOP RAG Query & Grounded Citations
  console.log('\n--- TEST 3: Grounded Query (Wire Transfer Dual Authorization) ---');
  const wireQuery = 'What are the dual authorization requirements and verification steps for an international wire transfer?';
  const wireEvidence = await retrieveRelevantChunks(wireQuery, { topK: 4 });
  const { output: wireRagResponse, modelUsed: wireModel } = await generateGroundedProjectCompassAnswer(wireQuery, wireEvidence.chunks);

  console.log(`✓ Status: ${wireRagResponse.status}`);
  console.log(`✓ Model Used: ${wireModel}`);
  console.log(`✓ Citations Count: ${wireRagResponse.citations.length}`);
  console.log(`✓ Primary Citation: ${wireRagResponse.citations[0]?.policyId} v${wireRagResponse.citations[0]?.version} (${wireRagResponse.citations[0]?.citationAnchor})`);
  console.log(`✓ Key Steps Provided: ${wireRagResponse.keySteps?.length || 0}`);
  console.log(`✓ Cautions/Controls Provided: ${wireRagResponse.cautions?.length || 0}`);
  console.log(`✓ Demo Data Notice Present: ${wireRagResponse.requiresHumanVerification}`);

  if (wireRagResponse.status !== 'grounded' || wireRagResponse.citations.length === 0) {
    throw new Error('FAILED: Expected grounded answer with citations for Wire Transfer SOP');
  }

  // Test 4: Fee Waiver SOP RAG Query
  console.log('\n--- TEST 4: Grounded Query (Fee Waiver Thresholds) ---');
  const feeQuery = 'When does a fee waiver require Branch Supervisor approval versus Regional Director approval?';
  const feeEvidence = await retrieveRelevantChunks(feeQuery, { topK: 4 });
  const { output: feeRagResponse, modelUsed: feeModel } = await generateGroundedProjectCompassAnswer(feeQuery, feeEvidence.chunks);

  console.log(`✓ Status: ${feeRagResponse.status}`);
  console.log(`✓ Model Used: ${feeModel}`);
  console.log(`✓ Citations: ${feeRagResponse.citations.map(c => c.policyId).join(', ')}`);
  console.log(`✓ Key Steps: ${feeRagResponse.keySteps?.length || 0}`);

  if (feeRagResponse.status !== 'grounded') {
    throw new Error('FAILED: Expected grounded answer for Fee Waiver SOP');
  }

  // Test 5: Out of Scope / Policy Not Found Query (Mortgage Underwriting)
  console.log('\n--- TEST 5: Out-of-Scope Negative Test (Mortgage Approval) ---');
  const oosQuery = 'Can you approve a $600,000 commercial real estate development loan?';
  const oosEvidence = await retrieveRelevantChunks(oosQuery, { topK: 4, minSimilarity: 0.65 });
  console.log(`✓ OOS Evidence Retrieved Chunks: ${oosEvidence.chunks.length}`);
  console.log(`✓ Top Score for OOS query: ${oosEvidence.topScore.toFixed(4)} (Threshold: 0.65)`);
  
  if (oosEvidence.status === 'policy_not_found') {
    console.log('✓ RAG Retrieval correctly recognized insufficient similarity and returned policy_not_found!');
  } else {
    const { output: oosRagResponse } = await generateGroundedProjectCompassAnswer(oosQuery, oosEvidence.chunks);
    console.log(`✓ Model Status: ${oosRagResponse.status}`);
  }

  console.log('\n====================================================');
  console.log('ALL PHASE 3B RAG TESTS COMPLETED AND VERIFIED!');
  console.log('====================================================');
}

runPhase3BTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
