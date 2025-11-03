#!/usr/bin/env tsx
/**
 * Test Hugging Face Inference API
 */

import { HfInference } from '@huggingface/inference';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testHuggingFace() {
  console.log('🤗 Testing Hugging Face Inference API...\n');

  try {
    // Get API token (you'll need to create one at https://huggingface.co/settings/tokens)
    const token = process.env.HUGGINGFACE_API_TOKEN || process.env.HF_TOKEN;

    if (!token) {
      console.log('❌ No API token found!\n');
      console.log('Get a FREE token:');
      console.log('1. Go to: https://huggingface.co/settings/tokens');
      console.log('2. Click "New token"');
      console.log('3. Name it "chat-api" and click "Create"');
      console.log('4. Copy the token');
      console.log('5. Add to apps/api/.env:');
      console.log('   HUGGINGFACE_API_TOKEN=hf_your_token_here\n');
      process.exit(1);
    }

    console.log('Token found! Testing models...\n');
    const hf = new HfInference(token);

    // Test models in order of preference (fastest/cheapest to best)
    const models = [
      {
        name: 'mistralai/Mistral-7B-Instruct-v0.2',
        description: 'Fast, cheap, great for chat'
      },
      {
        name: 'meta-llama/Meta-Llama-3-8B-Instruct',
        description: 'Excellent quality, fast'
      },
      {
        name: 'microsoft/phi-2',
        description: 'Very fast, good for simple responses'
      }
    ];

    let workingModel;

    for (const model of models) {
      try {
        console.log(`Testing: ${model.name}`);
        console.log(`Description: ${model.description}`);

        const response = await hf.textGeneration({
          model: model.name,
          inputs: 'Say hello in 10 words or less.',
          parameters: {
            max_new_tokens: 50,
            temperature: 0.7,
            return_full_text: false
          }
        });

        console.log(`Response: ${response.generated_text.trim()}`);
        console.log(`✅ ${model.name} works!\n`);
        workingModel = model.name;
        break;

      } catch (error: any) {
        console.log(`❌ Failed: ${error.message?.substring(0, 80)}`);
        console.log('Trying next model...\n');
      }
    }

    if (!workingModel) {
      throw new Error('No models available. Check token permissions or try again later.');
    }

    // Run full test suite with working model
    console.log(`\n🎉 Running full tests with: ${workingModel}\n`);

    // Test 1: Simple generation
    console.log('Test 1: Simple generation');
    const test1 = await hf.textGeneration({
      model: workingModel,
      inputs: 'What is 2+2? Answer briefly.',
      parameters: {
        max_new_tokens: 30,
        temperature: 0.7,
        return_full_text: false
      }
    });
    console.log(`Response: ${test1.generated_text.trim()}`);
    console.log('✅ Test 1 passed!\n');

    // Test 2: Health-related (like your app)
    console.log('Test 2: Health conversation');
    const test2 = await hf.textGeneration({
      model: workingModel,
      inputs: `You are a helpful health assistant. A user says: "I have a regular cycle of 28 days. What does this mean?"

Respond empathetically and ask a follow-up question.`,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        return_full_text: false
      }
    });
    console.log(`Response: ${test2.generated_text.trim().substring(0, 200)}...`);
    console.log('✅ Test 2 passed!\n');

    console.log('🎉 All tests passed!\n');
    console.log('Recommended model:', workingModel);
    console.log('\nCost estimate:');
    console.log('- Free tier: 30,000 characters/month');
    console.log('- Paid: ~$0.001 per 1K tokens (10x cheaper than OpenAI)');
    console.log('- For 100-100k users: ~$10-500/month\n');

    console.log('Next: Update apps/api/.env with your token and run your API!');

  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('\nDetails:', error.message);
    }
    process.exit(1);
  }
}

testHuggingFace();
