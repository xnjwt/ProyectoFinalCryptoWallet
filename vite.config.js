import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import wasm from 'vite-plugin-wasm';

export default defineConfig({

  plugins: [
    react(),
    wasm(),
    tailwindcss(),
    nodePolyfills({
      include: ['crypto', 'stream', 'buffer'],
      globals: {
        Buffer: true, 
        global: true,
        process: true,
      },
    }),
  ],

  build: {
    target: 'esnext'
  },
  esbuild: {
    supported: {
      'top-level-await': true
    }
  }
})



