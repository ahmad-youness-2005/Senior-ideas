// Configuration for different environments
const CONFIG = {
    development: {
        API_BASE_URL: 'http://localhost:3000',
        ENVIRONMENT: 'development'
    },
    production: {
        API_BASE_URL: 'http://localhost:3000', // Keep using local server for now
        ENVIRONMENT: 'production'
    }
};

// Auto-detect environment
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost');

const currentConfig = isDevelopment ? CONFIG.development : CONFIG.production;

// Export for use in other files
window.APP_CONFIG = currentConfig;