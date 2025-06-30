import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#023E8A",
        "admin-primary": "#023E8A",
        "admin-sidebar": "#023E8A",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    prefix: "heroui",
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          // primary: "#00449D",
          primary: {
            50: '#ebf8ff',
            100: '#d1f1ff',
            200: '#aee7ff',
            300: '#76dbff',
            400: '#35c4ff',
            500: '#07a0ff',
            600: '#007aff',
            700: '#0061ff',
            800: '#0050d7',
            900: '#00449d',
            950: '#062d65',
            foreground: "#00449D",
            DEFAULT: "#00449D",
          },
          // background: "#FAFEFF",
          background: {
            50: '#e5faff',
            100: '#bbeafc',
            200: '#90d6fa',
            300: '#69bcf8',
            400: '#51a3f7',
            500: '#4583dd',
            600: '#355eac',
            700: '#263d7a',
            800: '#131f4a',
            900: '#00041a',
            DEFAULT: "#FAFEFF",
          },

          foreground: "#030452",
          secondary: "#0077B6",
          accent: "#1618c1",
          muted: "#C6D9F1",
          card: "#83B9FF",
          border: "#253C5A",
          // color for button, warning text
          danger: "#c1121f",
          danger_light: "#FF0000",
          success: "#606c38",
          success_light: "#dad7cd",
          warning: "#c1121f",
          warning_light: "#fdf0d5",
          info: "#457b9d",
          info_light: "#f1faee",
        }
      },
      dark: {
        colors: {
          // primary: "#90E0EF",
          primary: {
            50: '#0e2f3e',
            100: '#1d485c',
            200: '#1e566c',
            300: '#1a6984',
            400: '#1881a2',
            500: '#1aa1c0',
            600: '#35bedb',
            700: '#90e0ef',
            800: '#ade9f4',
            900: '#d3f4fa',
            950: '#000131',
            foreground: "#90E0EF",
            DEFAULT: "#90E0EF",

          },
          // background: "#000131",
          background: {
            900: '#e5eeff',
            800: '#b4c7fa',
            700: '#839ef8',
            600: '#5271f7',
            500: '#223ef7',
            400: '#0e1cde',
            300: '#0a10ac',
            200: '#06087b',
            100: '#03044a',
            50: '#00011a',
            DEFAULT: "#000131",
          },
          foreground: "#EFF7F8",
          secondary: "#C0DAF0",
          accent: "#E2F2FF",
          muted: "#023E8A",
          card: "#0077B6",
          border: "#ADE8F4",
          // color for button, warning text
          danger_light: "#c1121f",
          danger: "#FF0000",
          success_light: "#606c38",
          success: "#dad7cd",
          warning_light: "#c1121f",
          warning: "#fdf0d5",
          info_light: "#457b9d",
          info: "#f1faee",
        },
      },
      "purple-dark": {
        colors: {
          primary: "#9D4EDD",
          background: "#10002B",
          foreground: "#E0AAFF",
          secondary: "#C77DFF",
          accent: "#7B2CBF",
          muted: "#3C096C",
          card: "#240046",
          border: "#5A189A"
        },
      }
    },
  })],
}
