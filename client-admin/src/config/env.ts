/**
 * Environment Configuration
 *
 * Centralized configuration for all environment variables.
 * This file provides type-safe access to environment variables
 * with sensible defaults and validation.
 */

interface EnvConfig {
  // API Configuration
  API_BASE_URL: string

  // Environment flags
  NODE_ENV: string
  MODE: string
  DEV: boolean
  PROD: boolean

  // App Configuration
  APP_NAME: string
  APP_VERSION: string

  // Authentication Configuration
  TOKEN_EXPIRES_IN: number // in days
  REFRESH_TOKEN_EXPIRES_IN: number // in days

  // Security Configuration
  SECURE_COOKIES: boolean

  // Development Configuration
  ENABLE_DEVTOOLS: boolean
  ENABLE_CONSOLE_LOGS: boolean

  // Query Configuration
  QUERY_STALE_TIME: number // in milliseconds
  QUERY_RETRY_COUNT: number
  REFETCH_ON_WINDOW_FOCUS: boolean
}

// Validate required environment variables
const validateEnv = (): void => {
  const requiredVars = ['VITE_API_BASE_URL']
  const missing = requiredVars.filter((varName) => !import.meta.env[varName])

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`)
    console.warn('Using default values. Please check your .env file.')
  }
}

// Initialize environment validation
validateEnv()

// Check if we're in production-like environment
const isProductionEnv =
  import.meta.env.VITE_ENV === 'production' || import.meta.env.PROD

// Environment configuration object
export const env: EnvConfig = {
  // API Configuration
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',

  // Environment flags
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  MODE: import.meta.env.MODE || 'development',
  DEV: import.meta.env.DEV || false,
  PROD: isProductionEnv,

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Shadcn Admin',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Authentication Configuration
  TOKEN_EXPIRES_IN: Number(import.meta.env.VITE_TOKEN_EXPIRES_IN) || 1, // 1 day
  REFRESH_TOKEN_EXPIRES_IN:
    Number(import.meta.env.VITE_REFRESH_TOKEN_EXPIRES_IN) || 7, // 7 days

  // Security Configuration
  SECURE_COOKIES: isProductionEnv,

  // Development Configuration
  ENABLE_DEVTOOLS: import.meta.env.MODE === 'development',
  ENABLE_CONSOLE_LOGS: import.meta.env.DEV || false,

  // Query Configuration
  QUERY_STALE_TIME: Number(import.meta.env.VITE_QUERY_STALE_TIME) || 10000, // 10 seconds
  QUERY_RETRY_COUNT: Number(import.meta.env.VITE_QUERY_RETRY_COUNT) || 3,
  REFETCH_ON_WINDOW_FOCUS: isProductionEnv,
}

// Helper functions for common environment checks
export const isProduction = (): boolean => env.PROD
export const isDevelopment = (): boolean => env.DEV
export const isDevtoolsEnabled = (): boolean => env.ENABLE_DEVTOOLS

// Export individual environment variables for convenience
export const {
  API_BASE_URL,
  NODE_ENV,
  MODE,
  DEV,
  PROD,
  APP_NAME,
  APP_VERSION,
  TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  SECURE_COOKIES,
  ENABLE_DEVTOOLS,
  ENABLE_CONSOLE_LOGS,
  QUERY_STALE_TIME,
  QUERY_RETRY_COUNT,
  REFETCH_ON_WINDOW_FOCUS,
} = env

export default env
