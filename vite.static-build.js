import { defineConfig } from 'vite';
import rootConfig from './vite.config.js';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// defineWorkspace provides a nice type hinting DX
export default defineConfig((configEnv) => {
  const config = rootConfig(configEnv);
  config.build = {
    outDir: 'test-html',
  };
  config.plugins.push(
    nodePolyfills({
      // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
      include: ['path'],
    }),
  );
  return config;
});
