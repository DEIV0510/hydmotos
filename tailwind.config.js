/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Superficies (oscuro → claro)
        void: '#04060A',
        graphite: '#0A0E15',
        steel: '#121924',
        carbon: '#1B2431',
        // Superficies claras (bloque central de la página)
        paper: '#F1F4F8',
        paper2: '#E4E9F0',
        card: '#FFFFFF',
        // Texto sobre oscuro
        chrome: '#E6ECF4',
        silver: '#A5B2C3',
        // Texto sobre claro
        ink: '#080C13',
        slate: '#4A5768',
        // Acentos de marca
        blue: { DEFAULT: '#1E5BFF', deep: '#0B3FCC', soft: '#4C7CFF' },
        cyan: { DEFAULT: '#22E0FF', deep: '#0FA8C8' },
        red: { DEFAULT: '#FF2233', btn: '#DD0E20', deep: '#A80917' },
      },
      fontFamily: {
        display: ['"Saira Condensed"', 'Impact', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: { widest2: '0.24em', widest3: '0.36em' },
      screens: { xs: '400px', '3xl': '1800px' },
      maxWidth: { content: '84rem' },
      boxShadow: {
        'glow-blue': '0 0 40px -8px rgba(30,91,255,0.55)',
        'glow-cyan': '0 0 44px -10px rgba(34,224,255,0.5)',
        'glow-red': '0 10px 34px -10px rgba(255,34,51,0.65)',
        lift: '0 30px 60px -24px rgba(0,0,0,0.85)',
        card: '0 2px 4px -2px rgba(10,20,40,0.06), 0 12px 28px -12px rgba(10,20,40,0.14)',
        'card-hover': '0 8px 16px -6px rgba(10,20,40,0.10), 0 28px 52px -20px rgba(16,40,90,0.28)',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(rgba(20,40,80,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(20,40,80,0.055) 1px, transparent 1px)',
        'grid-tech':
          'linear-gradient(rgba(120,160,220,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(120,160,220,0.055) 1px, transparent 1px)',
      },
      backgroundSize: { grid: '54px 54px' },
      keyframes: {
        scan: { '0%': { transform: 'translateX(-110%)' }, '100%': { transform: 'translateX(320%)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        pulseGlow: { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '0.9' } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        dash: { to: { strokeDashoffset: '0' } },
        sheen: { '0%': { transform: 'translateX(-120%) skewX(-18deg)' }, '100%': { transform: 'translateX(320%) skewX(-18deg)' } },
      },
      animation: {
        scan: 'scan 2.6s cubic-bezier(.5,0,.2,1) infinite',
        marquee: 'marquee 38s linear infinite',
        float: 'float 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'spin-slow': 'spinSlow 24s linear infinite',
        sheen: 'sheen 1.1s ease-out',
      },
    },
  },
  plugins: [],
}
