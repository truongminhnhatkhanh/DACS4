/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-ink': '#022c22',
        'emerald-pulse': '#00bc7d',
        'pine': '#007a55',
        'mint-glow': '#34d399',
        'jade-wash': '#10b981',
        'spearmint': '#6ee7b7',
        'signal-red': '#dc2626',
        'lilac-whisper': '#e9d5ff',
        'snow': '#ffffff',
        'paper': '#f5f5f5',
        'pale-sage': '#c9dbd6',
        'mint-mist': '#d2f2e7',
        'hairline': '#e5e7eb',
        'graphite': '#71717a',
        'carbon': '#3d3d3f',
        'obsidian': '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter Tight', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        pill: '9999px',
        card: '16px',
        tab: '12px',
      },
      backgroundImage: {
        'emerald-pulse-gradient': 'linear-gradient(to right, #007a55, #00bc7d, #f59e0b)',
        'sunset-gradient': 'linear-gradient(to right, #007a55, #00bc7d, #f59e0b)',
      }
    },
  },
  plugins: [],
}
