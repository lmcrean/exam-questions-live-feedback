/**
 * Environment Configuration Utility for Tests
 *
 * Provides environment-specific expected values for tests
 * to handle differences between dev (SQLite) and prod (Supabase)
 */

// Type definitions
export type Environment = 'dev' | 'prod';

export interface EnvironmentExpectations {
  environment: 'development' | 'production';
  dbType: string;
  hasWebServer: boolean;
}

export interface EnvironmentExpectationsWithEnv extends EnvironmentExpectations {
  environment: 'development' | 'production';
}

// Extend globalThis to include our custom property
declare global {
  var APP_TEST_ENV: Environment | undefined;
}

/**
 * Detect environment based on available indicators
 * @returns {Environment} Environment name ('dev' or 'prod')
 */
function detectEnvironment(): Environment {
  console.log('🔍 Detecting test environment...');
  console.log(`   process.env.TEST_ENV: ${process.env.TEST_ENV}`);
  console.log(`   process.env.NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   process.env.PLAYWRIGHT_BASE_URL: ${process.env.PLAYWRIGHT_BASE_URL}`);
  console.log(`   globalThis.APP_TEST_ENV: ${globalThis.APP_TEST_ENV}`);

  // Check for environment variables first
  if (process.env.TEST_ENV === 'prod' || process.env.NODE_ENV === 'production') {
    console.log('✅ Environment detected as: prod (from env vars)');
    return 'prod';
  }

  // Check if we're using a production deployment URL (Vercel or Cloud Run)
  if (process.env.PLAYWRIGHT_BASE_URL &&
      (process.env.PLAYWRIGHT_BASE_URL.includes('vercel.app') ||
       process.env.PLAYWRIGHT_BASE_URL.includes('run.app'))) {
    console.log('✅ Environment detected as: prod (from deployment URL)');
    return 'prod';
  }

  // Check global test context if available
  if (typeof globalThis !== 'undefined' && globalThis.APP_TEST_ENV) {
    console.log(`✅ Environment detected as: ${globalThis.APP_TEST_ENV} (from global)`);
    return globalThis.APP_TEST_ENV;
  }

  console.log('✅ Environment detected as: dev (default)');
  return 'dev'; // default to dev
}

/**
 * Get environment-specific expected values
 * @returns {EnvironmentExpectationsWithEnv} Expected values for the current environment
 */
export function getEnvironmentExpectations(): EnvironmentExpectationsWithEnv {
  const environment = detectEnvironment();

  const expectations: Record<Environment, EnvironmentExpectations> = {
    dev: {
      dbType: 'SQLite',
      environment: 'development',
      hasWebServer: true
    },
    prod: {
      dbType: 'PostgreSQL (Neon)',
      environment: 'production',
      hasWebServer: false
    }
  };

  return {
    environment: expectations[environment].environment,
    ...expectations[environment]
  };
}

/**
 * Get expected database type for current environment
 * @returns {string} Expected database type
 */
export function getExpectedDbType(): string {
  const expectations = getEnvironmentExpectations();
  console.log(`📊 Expected DB Type for ${expectations.environment}: ${expectations.dbType}`);
  return expectations.dbType;
}

/**
 * Check if current environment is development
 * @returns {boolean} True if running against dev environment
 */
export function isDevEnvironment(): boolean {
  const expectations = getEnvironmentExpectations();
  return expectations.environment === 'development';
}

/**
 * Check if current environment is production
 * @returns {boolean} True if running against prod environment
 */
export function isProdEnvironment(): boolean {
  const expectations = getEnvironmentExpectations();
  return expectations.environment === 'production';
}

/**
 * Set the test environment manually (useful for test setup)
 * @param {Environment} env - Environment ('dev' or 'prod')
 */
export function setTestEnvironment(env: Environment): void {
  globalThis.APP_TEST_ENV = env;
}

/**
 * Get expected values by explicitly passing the environment
 * @param {Environment} environment - 'dev' or 'prod'
 * @returns {EnvironmentExpectationsWithEnv} Expected values for the environment
 */
export function getExpectationsByEnvironment(environment: Environment): EnvironmentExpectationsWithEnv {
  const expectations: Record<Environment, EnvironmentExpectations> = {
    dev: {
      dbType: 'SQLite',
      environment: 'development',
      hasWebServer: true
    },
    prod: {
      dbType: 'PostgreSQL (Neon)',
      environment: 'production',
      hasWebServer: false
    }
  };

  return {
    environment: expectations[environment].environment,
    ...expectations[environment]
  };
}
