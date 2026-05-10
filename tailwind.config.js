/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#8ed5ff',
        'on-primary': '#00354a',
        'primary-container': '#38bdf8',
        secondary: '#4edea3',
        'secondary-container': '#00a572',
        tertiary: '#ffb9d8',
        background: '#0b1326',
        surface: '#0b1326',
        'surface-variant': '#2d3449',
        'surface-container-lowest': '#060e20',
        'surface-container-low': '#131b2e',
        'surface-container': '#171f33',
        'surface-container-high': '#222a3d',
        'surface-container-highest': '#2d3449',
        'on-surface': '#dae2fd',
        'on-surface-variant': '#bdc8d1',
        outline: '#87929a',
        'outline-variant': '#3e484f',
        error: '#ffb4ab',
        // 钢筋等级配色（保留）
        rebar: '#b22222',
        concrete: '#cfcfc8',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
      },
      spacing: {
        'sidebar-width': '320px',
        'inspector-width': '360px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(56, 189, 248, 0.2)',
      },
    },
  },
  plugins: [],
};
