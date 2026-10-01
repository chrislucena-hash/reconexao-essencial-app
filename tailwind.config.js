/** @type {import("tailwindcss").Config} */
export default {
        content: ["./index.html", "./*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./services/**/*.{ts,tsx}"],
        safelist: ["bg-magic-gold/10", "bg-emerald-400/10", "bg-rose-400/10", "bg-indigo-400/10", "bg-amber-400/10", "bg-purple-400/10", "bg-orange-400/10"],
        theme: {
          extend: {
            colors: {
              reconexao: {
                bg: '#F7F2EC',
                card: '#FFFFFF',
                navy: '#18245C',
                blue: '#5B8DE6',
                purple: '#A268D7',
                green: '#2E7D68',
                gold: '#E9B44C',
                pink: '#D87CB5',
              },
              aura: {
                violet: '#A268D7',
                indigo: '#18245C',
                teal: '#2E7D68',
                emerald: '#2E7D68',
                gold: '#E9B44C',
                rose: '#D87CB5',
                amber: '#E9B44C',
                sky: '#5B8DE6',
                deep: '#18245C'
              },
              nature: {
                900: '#18245C',
                950: '#18245C',
              },
              ethereal: {
                50: '#FFFFFF',
                100: '#18245C',
                200: '#232D53',
                300: '#323957',
                400: '#4A506B',
                500: '#4A506B',
                600: '#323957',
                700: '#232D53',
                800: '#18245C',
                900: '#111A42',
                950: '#18245C',
              },
              magic: {
                gold: '#E9B44C',
                sand: '#F7F2EC'
              }
            },
            fontFamily: {
              sans: ['"Atkinson Hyperlegible"', 'sans-serif'],
              serif: ['Montserrat', 'sans-serif'],
              title: ['Montserrat', 'sans-serif'],
              body: ['"Atkinson Hyperlegible"', 'sans-serif'],
            },
            borderRadius: {
              '2xl': '20px',
              '3xl': '24px',
              '4xl': '28px',
            },
            animation: {
              'float': 'float 6s ease-in-out infinite',
              'pulse-soft': 'pulse-soft 6s ease-in-out infinite',
              'fade-in': 'fadeIn 0.3s ease-out forwards',
              'zoom-in': 'zoomIn 0.3s ease-out forwards',
              'slide-up': 'slideUp 0.4s ease-out forwards',
            },
            keyframes: {
              float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-8px)' },
              },
              'pulse-soft': {
                '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
                '50%': { opacity: '0.7', transform: 'scale(0.99)' },
              },
              fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
              },
              zoomIn: {
                '0%': { opacity: '0', transform: 'scale(0.98)' },
                '100%': { opacity: '1', transform: 'scale(1)' },
              },
              slideUp: {
                '0%': { opacity: '0', transform: 'translateY(16px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
              }
            }
          }
        }
      };
