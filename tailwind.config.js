/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enable class-based dark mode
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dhis2: {
          blue: "#005eb8",
          "blue-dark": "#004a99",
          "blue-light": "#deebf7",
          green: "#2e7d32",
          "green-dark": "#27632a",
          red: "#d32f2f",
          "red-dark": "#b71c1c",
          "red-light": "#f9d6d5",
          "yellow-light": "#fff8e1",
          "gray-medium": "#9e9e9e",
          "gray-light": "#f5f5f5",
          "gray-dark": "#424242",
          text: "#212121",

          // CamelCase variants for ease in JSX usage:
          blueDark: "#004a99",
          blueLight: "#deebf7",
          greenDark: "#27632a",
          redDark: "#b71c1c",
          redLight: "#f9d6d5",
          yellowLight: "#fff8e1",
          grayMedium: "#9e9e9e",
          grayLight: "#f5f5f5",
          grayDark: "#424242",

          // Dark mode colors nested for clarity
          dark: {
            background: "#121212",
            surface: "#1E1E1E",
            textPrimary: "#e0e0e0",
            textSecondary: "#a0a0a0",
            blue: "#3399ff",
            green: "#81c784",
            red: "#ef5350",
            yellow: "#fff176",
            border: "#333333",
          },
        },
      },

      fontSize: {
        sm: ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
        base: ["1rem", { lineHeight: "1.5rem" }],     // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],  // 20px
      },

      borderRadius: {
        DEFAULT: "0.25rem", // 4px rounded corners, consistent with DHIS2
      },

      boxShadow: {
        DEFAULT: "0 1px 3px rgba(0,0,0,0.1)", // subtle DHIS2-like card shadow
      },

      keyframes: {
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },

      animation: {
        "spin-slow": "spin-slow 6s linear infinite",
      },

      backgroundImage: {
        "gradient-animated":
          "conic-gradient(from 0deg, #005eb8, #deebf7, #005eb8)", // DHIS2 blue gradient
        "gradient-animated-dark":
          "conic-gradient(from 0deg, #3399ff, #81c784, #3399ff)", // lighter for dark mode
      },
    },
  },
  plugins: [],
};