import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
    plugins: [
        nodePolyfills({
            // Whether to polyfill `node:` protocol imports.
            protocolImports: true,
        }),
    ],
    resolve: {
        alias: {
            // Alias src to allow importing direct source implementation
            '../../src': path.resolve(__dirname, '../../src')
        }
    },
    define: {
        'process.env': {} // anchor might need this
    }
});
