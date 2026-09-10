/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Superficies (oscuro → claro)
        void: '#0B0D11',
        graphite: '#12151B',
        steel: '#1A1F27',
        carbon: '#242A34',
        // Superficies claras (bloque central de la página)
        paper: '#F1F4F8',
        paper2: '#E4E9F0',
        card: '#FFFFFF',
        // Texto sobre oscuro
        chrome: '#E6ECF4',
        silver: '#AEB6C2',
        // Texto sobre claro
        ink: '#080C13',
        slate: '#4A5768',
        // Acentos de marca
        blue: { DEFAULT: '#1B57D6', deep: '#123C99', soft: '#4C7CFF' },
        // Antes era un cian neón: bajado a un azul acero legible
        cyan: { DEFAULT: '#7FA8D9', deep: '#2E6BB8' },
        red: { DEFAULT: '#D62030', btn: '#C0121F', deep: '#8E0A14' },
      },
      fontFamily: {
        display: ['"Saira Condensed"', 'Impact', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: { widest2: '0.24em', widest3: '0.36em' },
      screens: { xs: '400px', '3xl': '1800px' },
      maxWidth: { content: '84rem' },
      boxShadow: {
        'glow-blue': '0 18px 40px -18px rgba(27,87,214,0.45)',
        'glow-cyan': '0 18px 40px -18px rgba(46,107,184,0.4)',
        'glow-red': '0 12px 28px -14px rgba(214,32,48,0.5)',
        lift: '0 30px 60px -24px rgba(0,0,0,0.85)',
        card: '0 2px 4px -2px rgba(10,20,40,0.06), 0 12px 28px -12px rgba(10,20,40,0.14)',
        'card-hover': '0 8px 16px -6px rgba(10,20,40,0.10), 0 28px 52px -20px rgba(16,40,90,0.28)',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(rgba(20,40,80,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(20,40,80,0.055) 1px, transparent 1px)',
        'grid-tech':
          'linear-gradient(rgba(150,170,200,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(150,170,200,0.035) 1px, transparent 1px)',
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
