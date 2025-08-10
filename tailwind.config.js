/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // CSS Variable Integration
        primary: {
          DEFAULT: 'var(--bg-primary)',
          50: 'var(--bg-secondary)',
          100: 'var(--bg-tertiary)',
        },
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--bg-tertiary)',
        accent: {
          DEFAULT: 'var(--accent-primary)',
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        
        // Additional Colors
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
        },
        code: 'var(--code-bg)',
        sidebar: 'var(--sidebar-bg)',
        
        // User Cursor Colors
        cursor: {
          1: 'var(--cursor-user-1)',
          2: 'var(--cursor-user-2)',
          3: 'var(--cursor-user-3)',
          4: 'var(--cursor-user-4)',
          5: 'var(--cursor-user-5)',
          6: 'var(--cursor-user-6)',
        }
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        code: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      animation: {
        'pulse-accent': 'pulse-accent 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      
      keyframes: {
        'pulse-accent': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-in': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'typing': {
          '0%, 60%': { opacity: '1' },
          '30%': { opacity: '0.4' },
        },
      },
      
      boxShadow: {
        'glow': '0 0 20px rgba(102, 126, 234, 0.3)',
        'glow-lg': '0 0 40px rgba(102, 126, 234, 0.4)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      },
      
      borderRadius: {
        '4xl': '2rem',
      },
      
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      gridTemplateColumns: {
        'session': '250px 1fr 300px',
        'session-mobile': '1fr',
        'dashboard': 'repeat(auto-fit, minmax(300px, 1fr))',
      },
      
      gridTemplateRows: {
        'session': '60px 1fr 200px',
        'session-mobile': '60px 1fr 150px 200px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar')({ nocompatible: true }),
    
    // Custom Plugin for Component Classes
    function({ addComponents, theme }) {
      addComponents({
        // Button Components
        '.btn': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          outline: 'none',
          '&:focus': {
            '--tw-ring-offset-width': '2px',
            '--tw-ring-width': '2px',
            '--tw-ring-color': 'var(--accent-primary)',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        
        '.btn-primary': {
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--accent-secondary)',
          },
        },
        
        '.btn-secondary': {
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--bg-secondary)',
          },
        },
        
        '.btn-ghost': {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          },
        },
        
        '.btn-danger': {
          backgroundColor: 'var(--error)',
          color: 'white',
          '&:hover:not(:disabled)': {
            opacity: '0.9',
          },
        },
        
        // Size variants
        '.btn-sm': {
          padding: `${theme('spacing.1')} ${theme('spacing.3')}`,
          fontSize: theme('fontSize.sm'),
        },
        
        '.btn-lg': {
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontSize: theme('fontSize.lg'),
        },
        
        // Input Components
        '.input': {
          width: '100%',
          padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
          borderRadius: theme('borderRadius.lg'),
          border: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          transition: 'all 0.2s ease',
          outline: 'none',
          '&::placeholder': {
            color: 'var(--text-secondary)',
          },
          '&:focus': {
            '--tw-ring-width': '2px',
            '--tw-ring-color': 'var(--accent-primary)',
            borderColor: 'transparent',
          },
        },
        
        '.input-error': {
          borderColor: 'var(--error)',
          '&:focus': {
            '--tw-ring-color': 'var(--error)',
          },
        },
        
        // Card Components
        '.card': {
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.lg'),
          backdropFilter: 'blur(10px)',
        },
        
        '.card-compact': {
          padding: theme('spacing.4'),
        },
        
        // Glass Effect
        '.glass': {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'var(--overlay)',
        },
        
        // Scrollbar
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--accent-primary) var(--bg-secondary)',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'var(--bg-secondary)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--accent-primary)',
            borderRadius: '3px',
            '&:hover': {
              background: 'var(--accent-secondary)',
            },
          },
        },
        
        // Status Components
        '.status-indicator': {
          width: theme('spacing.2'),
          height: theme('spacing.2'),
          borderRadius: '50%',
          display: 'inline-block',
        },
        
        '.status-online': {
          backgroundColor: 'var(--success)',
        },
        
        '.status-away': {
          backgroundColor: 'var(--warning)',
        },
        
        '.status-offline': {
          backgroundColor: 'var(--text-secondary)',
        },
        
        // Loading Components
        '.skeleton': {
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: theme('borderRadius.DEFAULT'),
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        
        '.spinner': {
          width: theme('spacing.4'),
          height: theme('spacing.4'),
          border: '2px solid var(--text-secondary)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        },
      })
    },
  ],
}