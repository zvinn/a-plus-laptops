import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        include: ['src/**/*.test.js', 'src/**/*.test.jsx'],
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        globals: true,
        css: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            all: true,
            include: ['src/**/*.jsx', 'src/**/*.js'],
            exclude: [
                'src/main.jsx',
                'src/**/*.test.jsx',
                'src/**/*.test.js',
                'src/setupTests.js',
                'src/vite-env.d.ts',
                '**/index.js',
                'dist/**',
                'coverage/**'
            ],
        },
    },
})
