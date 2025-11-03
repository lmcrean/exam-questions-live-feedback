#!/usr/bin/env tsx
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testModelNames() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found!');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const modelNamesToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-flash',
    'models/gemini-pro',
    'models/gemini-1.5-flash'
  ];

  console.log('🧪 Testing different model names...\n');

  for (const modelName of modelNamesToTry) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "hi"');
      const response = result.response;
      const text = response.text();
      console.log(`✅ SUCCESS! Model "${modelName}" works!`);
      console.log(`   Response: ${text}\n`);
      break; // Stop after first success
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message.split('\n')[0]}\n`);
    }
  }
}

testModelNames();
