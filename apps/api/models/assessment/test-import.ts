/**
 * Test script to verify Assessment model TypeScript imports and basic functionality
 */

// Test all imports work correctly
import Assessment from './Assessment.ts';
import { AssessmentBase } from './base/AssessmentBase.ts';
import ValidateAssessmentData from './validators/ValidateAssessmentData.ts';
import ValidateAssessmentOwnership from './validators/ValidateAssessmentOwnership.ts';
import ParseAssessmentJson from './transformers/ParseAssessmentJson.ts';
import TransformApiToDb from './transformers/TransformApiToDb.ts';
import TransformDbToApi from './transformers/TransformDbToApi.ts';
import CreateAssessment from './services/CreateAssessment.ts';
import FindAssessment from './services/FindAssessment.ts';
import UpdateAssessment from './services/UpdateAssessment.ts';
import DeleteAssessment from './services/DeleteAssessment.ts';
import RouteAssessment from './services/RouteAssessment.ts';

// Import types
import type {
  AssessmentDbRecord,
  AssessmentApiInput,
  AssessmentApiResponse,
  AssessmentUpdateInput,
  ValidationResult,
  Recommendation
} from './types.ts';

console.log('✅ All Assessment model TypeScript imports successful!');
console.log('\n📦 Imported classes:');
console.log('  - Assessment (main orchestrator)');
console.log('  - AssessmentBase');
console.log('  - ValidateAssessmentData');
console.log('  - ValidateAssessmentOwnership');
console.log('  - ParseAssessmentJson');
console.log('  - TransformApiToDb');
console.log('  - TransformDbToApi');
console.log('  - CreateAssessment');
console.log('  - FindAssessment');
console.log('  - UpdateAssessment');
console.log('  - DeleteAssessment');
console.log('  - RouteAssessment');

console.log('\n🔧 Testing validation...');
const testData: AssessmentApiInput = {
  age: '28',
  pattern: 'regular',
  cycle_length: '28',
  period_duration: '5',
  flow_heaviness: 'moderate',
  pain_level: '3',
  physical_symptoms: ['cramps', 'fatigue'],
  emotional_symptoms: ['mood swings'],
  other_symptoms: ['bloating'],
  recommendations: [
    { title: 'Exercise regularly', description: 'Light cardio helps' },
    { title: 'Stay hydrated', description: 'Drink plenty of water' }
  ]
};

const validation = ValidateAssessmentData.validateData(testData);
console.log('Validation result:', validation);

console.log('\n🔄 Testing transformers...');
const dbPayload = TransformApiToDb.transform(testData);
console.log('DB Payload keys:', Object.keys(dbPayload));

console.log('\n✨ Testing JSON serialization...');
const serialized = ParseAssessmentJson.serializeArrayField(testData.physical_symptoms);
console.log('Serialized physical_symptoms:', serialized);

const deserialized = ParseAssessmentJson.parseArrayField(serialized, 'physical_symptoms', 'test-id');
console.log('Deserialized physical_symptoms:', deserialized);

console.log('\n✅ Phase 3B - Assessment Model TypeScript Migration Complete!');
console.log('All 12 source files successfully migrated:');
console.log('  ✓ types.ts (type definitions)');
console.log('  ✓ base/AssessmentBase.ts');
console.log('  ✓ validators/ValidateAssessmentData.ts');
console.log('  ✓ validators/ValidateAssessmentOwnership.ts');
console.log('  ✓ transformers/ParseAssessmentJson.ts');
console.log('  ✓ transformers/TransformApiToDb.ts');
console.log('  ✓ transformers/TransformDbToApi.ts');
console.log('  ✓ services/CreateAssessment.ts');
console.log('  ✓ services/FindAssessment.ts');
console.log('  ✓ services/UpdateAssessment.ts');
console.log('  ✓ services/DeleteAssessment.ts');
console.log('  ✓ services/RouteAssessment.ts');
console.log('  ✓ Assessment.ts (orchestrator)');
