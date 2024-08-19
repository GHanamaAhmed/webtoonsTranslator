import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00dc64",
        secondary: "#00dc64",
        tertiary: "#112D57",
        quaternary: "#000000",
        text: "#ffffff",
        secondText: "#5C5C5C",
        darkBackground: "#181818",
        lightBackground: "#FFFFFF",
      },
      fontFamily: {
        graphik: ["Graphik", "sans-serif"],
      },
      fontSize: {
        title: ["28px", { lineHeight: "36px" }],
        "title-md": ["44px", { lineHeight: "52px" }],
        "title-lg": ["48px", { lineHeight: "56px" }],
        "title-xl": ["52px", { lineHeight: "60px" }],
        "title-2xl": ["56px", { lineHeight: "64px" }],

        header: ["20px", { lineHeight: "28px" }],
        "header-md": ["24px", { lineHeight: "32px" }],
        "header-lg": ["28px", { lineHeight: "36px" }],
        "header-xl": ["32px", { lineHeight: "40px" }],
        "header-2xl": ["36px", { lineHeight: "44px" }],

        subheader: ["16px", { lineHeight: "24px" }],
        "subheader-md": ["18px", { lineHeight: "26px" }],
        "subheader-lg": ["20px", { lineHeight: "28px" }],
        "subheader-xl": ["22px", { lineHeight: "30px" }],
        "subheader-2xl": ["24px", { lineHeight: "32px" }],

        paragraph: ["10px", { lineHeight: "16px" }],
        "paragraph-md": ["12px", { lineHeight: "18px" }],
        "paragraph-lg": ["14px", { lineHeight: "20px" }],
        "paragraph-xl": ["16px", { lineHeight: "24px" }],
        "paragraph-2xl": ["18px", { lineHeight: "26px" }],
      },
    },
  },
  plugins: [],
};

export default config;
