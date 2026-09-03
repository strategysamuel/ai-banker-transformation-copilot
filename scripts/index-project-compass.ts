import dotenv from 'dotenv';
import { indexProjectCompassCorpus, EMBEDDING_MODEL } from '../server/projectCompassRag';

dotenv.config();

async function runIndexer() {
  console.log('=============================================================');
  console.log('PROJECT COMPASS — KNOWLEDGE CORPUS INDEXER & EMBEDDING BUILD');
  console.log(`Model: ${EMBEDDING_MODEL}`);
  console.log('=============================================================\n');

  const startTime = Date.now();
  try {
    const result = await indexProjectCompassCorpus();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n=============================================================');
    console.log(`✅ INDEXING COMPLETED in ${duration}s`);
    console.log(`Total Chunks: ${result.totalChunks}`);
    console.log(`Active Chunks: ${result.activeChunks}`);
    console.log(`Superseded Chunks: ${result.supersededChunks}`);
    console.log('=============================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Indexing failed:', error);
    process.exit(1);
  }
}

runIndexer();
