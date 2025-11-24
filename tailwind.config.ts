import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in-down': {
          from: {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.7',
            transform: 'scale(1.3)',
          },
        },
        'aurora-glow': {
          '0%, 100%': {
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(59, 130, 246, 0.3) 100%)',
            'box-shadow': '0 0 60px rgba(147, 51, 234, 0.4), 0 0 120px rgba(236, 72, 153, 0.3), 0 0 180px rgba(59, 130, 246, 0.2), inset 0 0 60px rgba(147, 51, 234, 0.1)',
          },
          '33%': {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 50%, rgba(236, 72, 153, 0.3) 100%)',
            'box-shadow': '0 0 60px rgba(59, 130, 246, 0.4), 0 0 120px rgba(147, 51, 234, 0.3), 0 0 180px rgba(236, 72, 153, 0.2), inset 0 0 60px rgba(59, 130, 246, 0.1)',
          },
          '66%': {
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(59, 130, 246, 0.3) 50%, rgba(147, 51, 234, 0.3) 100%)',
            'box-shadow': '0 0 60px rgba(236, 72, 153, 0.4), 0 0 120px rgba(59, 130, 246, 0.3), 0 0 180px rgba(147, 51, 234, 0.2), inset 0 0 60px rgba(236, 72, 153, 0.1)',
          },
        },
        'cosmic-float': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '0.6',
          },
          '25%': {
            transform: 'translateY(-10px) rotate(2deg)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'translateY(-20px) rotate(0deg)',
            opacity: '1',
          },
          '75%': {
            transform: 'translateY(-10px) rotate(-2deg)',
            opacity: '0.8',
          },
        },
        'sound-wave': {
          '0%': {
            transform: 'scaleY(0.3) translateX(0)',
            opacity: '0.7',
          },
          '50%': {
            transform: 'scaleY(1.2) translateX(10px)',
            opacity: '1',
          },
          '100%': {
            transform: 'scaleY(0.3) translateX(20px)',
            opacity: '0.3',
          },
        },
        'hologram': {
          '0%, 100%': {
            opacity: '0.9',
            filter: 'hue-rotate(0deg) brightness(1)',
          },
          '25%': {
            opacity: '0.7',
            filter: 'hue-rotate(90deg) brightness(1.1)',
          },
          '50%': {
            opacity: '0.5',
            filter: 'hue-rotate(180deg) brightness(1.2)',
          },
          '75%': {
            opacity: '0.7',
            filter: 'hue-rotate(270deg) brightness(1.1)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-down': 'fade-in-down 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out 0.2s both',
        'pulse-slow': 'pulse-slow 1.5s ease-in-out infinite',
        'aurora-glow': 'aurora-glow 8s ease-in-out infinite',
        'cosmic-float': 'cosmic-float 6s ease-in-out infinite',
        'sound-wave': 'sound-wave 2s ease-in-out infinite',
        'hologram': 'hologram 4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
