import { defineConfig } from "vite";
import { resolve } from 'path'
export default defineConfig({
  server: {
    open: true,
    port: 8080,
    host: '0.0.0.0',
  },
  publicDir: './public/',
  base: './',
  root: './examples',
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src/pixi-live2d-display/src'),
      '@cubism': resolve(__dirname, '../src/pixi-live2d-display/cubism/src')
    }
  },
  build: {
    outDir: '../docs'
  }
});