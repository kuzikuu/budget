// API Configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://your-railway-backend-url.railway.app'
  : 'http://localhost:5000';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    dashboard: '/api/dashboard',
    categories: '/api/categories',
    budgets: '/api/budgets',
    expenses: '/api/expenses',
    crypto: '/api/crypto',
    receipts: '/api/receipts',
  }
};

export default API_CONFIG;
