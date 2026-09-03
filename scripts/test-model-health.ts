import { GoogleGenAI } from '@google/genai';

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY missing');
    process.exit(1);
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const modelsToTest = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
  ];
  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}...`);
      const res = await ai.models.generateContent({
        model,
        contents: 'Reply in 2 words: Health OK.',
      });
      console.log(`✅ ${model} SUCCESS: ${res.text?.trim()}`);
    } catch (err) {
      console.error(`❌ ${model} ERROR:`, err);
    }
  }
}

testModels();
