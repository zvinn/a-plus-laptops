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
    },
})
