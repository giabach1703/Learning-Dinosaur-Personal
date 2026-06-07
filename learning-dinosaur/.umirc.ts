import { defineConfig } from 'umi';
import routes from './src/routes';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: routes,
  fastRefresh: {},
  antd: {},
  dva: false, // Tắt dva để sử dụng useModel
  define: {
    'process.env.GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID || '956714257482-2u4lmqbq96thm8k048boo9j22etiq297.apps.googleusercontent.com',
    'process.env.UMI_APP_API_BASE_URL': process.env.UMI_APP_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    'process.env.VITE_API_BASE_URL': process.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  },
});

