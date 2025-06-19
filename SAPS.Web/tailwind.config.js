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
          primary: "#00449D",
          background: "#EFF7F8",
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
          primary: "#90E0EF",
          background: "#000131", 
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
