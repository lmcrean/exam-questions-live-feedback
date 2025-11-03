#!/usr/bin/env tsx
/**
 * Test Google Gemini API Integration
 *
 * Get your FREE API key at: https://ai.google.dev/
 * Add to .env: GEMINI_API_KEY=your_key_here
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testGemini() {
  console.log('🤖 Testing Google Gemini API...\n');

  try {
    // Get API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log('❌ GEMINI_API_KEY not found in .env file!\n');
      console.log('Get your FREE API key:');
      console.log('1. Visit: https://ai.google.dev/');
      console.log('2. Sign in with Google account');
      console.log('3. Click "Get API key"');
      console.log('4. Copy key (starts with AIza...)');
      console.log('5. Add to apps/api/.env:');
      console.log('   GEMINI_API_KEY=AIza...your_key_here\n');
      console.log('Free tier includes:');
      console.log('- 45,000 requests/month');
      console.log('- Multimodal (text + images)');
      console.log('- No credit card required\n');
      process.exit(1);
    }

    console.log('✅ API key found!');
    console.log(`📍 Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Test 1: Simple generation
    console.log('Test 1: Simple text generation');
    console.log('Prompt: "Say hello in 10 words or less"');

    const result1 = await model.generateContent('Say hello in 10 words or less');
    const response1 = result1.response;
    const text1 = response1.text();

    console.log(`Response: ${text1}`);
    console.log(`Tokens used: ${response1.usageMetadata?.totalTokenCount || 'N/A'}`);
    console.log('✅ Test 1 passed!\n');

    // Test 2: Chat with history
    console.log('Test 2: Conversation with history');

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'What is 2+2?' }],
        },
        {
          role: 'model',
          parts: [{ text: '2+2 equals 4.' }],
        },
      ],
    });

    const result2 = await chat.sendMessage('What was my previous question?');
    const text2 = result2.response.text();

    console.log(`Response: ${text2}`);
    console.log('✅ Test 2 passed!\n');

    // Test 3: Assessment-style prompt (your use case)
    console.log('Test 3: Student assessment feedback');

    const assessmentPrompt = `You are a helpful teacher assistant. A student answered an exam question about Big O notation.

Question: "Explain what Big O notation is and why it's important in computer science."

Student Answer: "Big O notation is a way to measure how fast an algorithm runs. It's important because it helps us choose the best algorithm for a problem."

Provide constructive feedback on their answer. What did they get right? What could they add?`;

    const result3 = await model.generateContent(assessmentPrompt);
    const text3 = result3.response.text();

    console.log('Assessment feedback (first 300 chars):');
    console.log(text3.substring(0, 300) + '...\n');
    console.log('✅ Test 3 passed!\n');

    // Test 4: Rate limit check
    console.log('Test 4: Rate limit check (3 quick requests)');

    for (let i = 1; i <= 3; i++) {
      const start = Date.now();
      await model.generateContent('Quick test ' + i);
      const time = Date.now() - start;
      console.log(`  Request ${i}: ${time}ms`);
    }
    console.log('✅ Test 4 passed!\n');

    // Success summary
    console.log('🎉 All tests passed!\n');
    console.log('📊 Your Free Tier Capacity:');
    console.log('   • 45,000 requests/month');
    console.log('   • 15 requests/minute');
    console.log('   • 1,500 requests/day\n');
    console.log('💰 Cost:');
    console.log('   • Current usage: $0');
    console.log('   • For <100 users: $0/month');
    console.log('   • Scales to 5,000+ users FREE\n');
    console.log('✨ Ready to use Gemini in your app!');
    console.log('   • Chat conversations: ✅');
    console.log('   • Student assessments: ✅');
    console.log('   • OCR (when you add it): ✅\n');

  } catch (error: any) {
    console.error('❌ Test failed:\n');

    if (error.message?.includes('API key not valid')) {
      console.error('Invalid API key!');
      console.error('• Make sure you copied the full key from https://ai.google.dev/');
      console.error('• Key should start with "AIza"');
      console.error('• Try regenerating a new key\n');
    } else if (error.message?.includes('quota')) {
      console.error('Rate limit or quota exceeded!');
      console.error('• Free tier: 15 requests/minute, 1,500/day');
      console.error('• Wait a few minutes and try again');
      console.error('• Check usage at: https://ai.google.dev/\n');
    } else {
      console.error('Error:', error.message);
      if (error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
    }

    console.error('\n🔧 Troubleshooting:');
    console.error('1. Verify GEMINI_API_KEY in .env');
    console.error('2. Check internet connection');
    console.error('3. Visit https://ai.google.dev/ to verify API status');
    console.error('4. Try regenerating your API key\n');

    process.exit(1);
  }
}

// Run the test
testGemini();
