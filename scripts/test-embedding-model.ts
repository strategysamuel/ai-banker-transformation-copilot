import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function testEmbedding() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY');
    process.exit(1);
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  console.log('Testing model: gemini-embedding-2...');
  try {
    const res = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: 'International wire transfer dual authorization procedure.',
    });

    const values = res.embeddings?.[0]?.values;
    console.log('gemini-embedding-2 response:');
    console.log('- values length (dimension):', values?.length);
    console.log('- first 5 values:', values?.slice(0, 5));
    console.log('gemini-embedding-2 is VALID and SUPPORTED!');
  } catch (err) {
    console.error('gemini-embedding-2 failed:', err);
  }
}

testEmbedding();
