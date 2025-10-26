/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pokémon type colors
        'normal': '#A8A878',
        'fire': '#F08030',
        'water': '#6890F0',
        'electric': '#F8D030',
        'grass': '#78C850',
        'ice': '#98D8D8',
        'fighting': '#C03028',
        'poison': '#A040A0',
        'ground': '#E0C068',
        'flying': '#A890F0',
        'psychic': '#F85888',
        'bug': '#A8B820',
        'rock': '#B8A038',
        'ghost': '#705898',
        'dragon': '#7038F8',
        'dark': '#705848',
        'steel': '#B8B8D0',
        'fairy': '#EE99AC',
        
        // Custom black & red theme - SIMPLIFIED
        'primary': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        'dark': {
          100: '#1a1a1a',
          200: '#141414', 
          300: '#0f0f0f',
          400: '#0a0a0a',
          500: '#000000',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.6)' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
        'red-gradient': 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
      }
    },
  },
  plugins: [],
}