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
  plugins: [
    heroui({
      prefix: "heroui",
      defaultTheme: "light",
      themes: {
        light: {
          colors: {
            primary: "#023E8A",
            background: "#e7f4f7",
            foreground: "#030452",
            secondary: "#0077B6",
            accent: "#1618c1",
            muted: "#C6D9F1",
            card: "#83B9FF",
          },
        },
        dark: {
          colors: {
            primary: "#023E8A",
            background: "#000131",
            foreground: "#DCF3F7",
            secondary: "#C0DAF0",
            accent: "#E2F2FF",
            muted: "#023E8A",
            card: "#0077B6",
            border: "#ADE8F4",
          },
        },
      },
    }),
  ],
};
