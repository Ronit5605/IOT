/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070F2B',
          900: '#0B192C',
          800: '#1E3E62',
          700: '#1B263B',
          600: '#2A4365',
        },
        medical: {
          red: '#DC2626',
          alert: '#EF4444',
          pulse: '#E11D48',
          teal: '#0D9488',
          cyan: '#06B6D4',
          blue: '#2563EB',
          emerald: '#10B981',
          amber: '#F59E0B',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
