import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    // IMPORTANT: This must match your GitHub repository name.
    // If your repo is https://github.com/username/my-cool-app, this should be '/my-cool-app/'
    base: '/quillt-beta/', 
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      port: 3000,
    }
  };
});