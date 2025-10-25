import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#FA2FB5', // Hot Pink
          dark: '#31087B',    // Deep Purple
          darker: '#100720',  // Near Black Purple
          accent: '#FFC23C',  // Golden Yellow
        },
        // Legacy color mappings for gradual migration
        purple: {
          600: '#31087B',
          700: '#31087B',
          800: '#100720',
        },
        pink: {
          500: '#FA2FB5',
          600: '#FA2FB5',
        },
        yellow: {
          400: '#FFC23C',
          500: '#FFC23C',
        },
      },
    },
  },
  plugins: [],
};
export default config;
