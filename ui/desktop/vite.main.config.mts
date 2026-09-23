import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  define: {
    'process.env.GITHUB_OWNER': JSON.stringify(process.env.GITHUB_OWNER || 'aaif-goose'),
    'process.env.GITHUB_REPO': JSON.stringify(process.env.GITHUB_REPO || 'goose'),
    'process.env.GOOSE_BUNDLE_NAME': JSON.stringify(process.env.GOOSE_BUNDLE_NAME || 'Goose'),
    'process.env.ASI_WORK_UPDATE_FEED': JSON.stringify(
      process.env.ASI_WORK_UPDATE_FEED || 'https://downloads.asi1.ai/asi-work/latest/'
    ),
  },
});
