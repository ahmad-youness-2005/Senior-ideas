// Configuration for different environments
const CONFIG = {
    development: {
        API_BASE_URL: 'http://localhost:3002',
        ENVIRONMENT: 'development'
    },
    production: {
        API_BASE_URL: 'https://9a8e90e1efe4.ngrok-free.app', // Your ngrok public URL
        ENVIRONMENT: 'production'
    }
};

// Auto-detect environment
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost');

// For now, always use local server (you'll need to keep it running)
const currentConfig = CONFIG.development;

// Export for use in other files
window.APP_CONFIG = currentConfig;