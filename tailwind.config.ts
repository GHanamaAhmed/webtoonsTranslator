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
        title: ["32px", { lineHeight: "40px" }],
        "title-md": ["48px", { lineHeight: "56px" }],
        "title-lg": ["52px", { lineHeight: "60px" }],
        "title-xl": ["56px", { lineHeight: "64px" }],
        "title-2xl": ["60px", { lineHeight: "68px" }],

        header: ["24px", { lineHeight: "32px" }],
        "header-md": ["28px", { lineHeight: "36px" }],
        "header-lg": ["32px", { lineHeight: "40px" }],
        "header-xl": ["36px", { lineHeight: "44px" }],
        "header-2xl": ["40px", { lineHeight: "48px" }],

        subheader: ["18px", { lineHeight: "26px" }],
        "subheader-md": ["20px", { lineHeight: "28px" }],
        "subheader-lg": ["22px", { lineHeight: "30px" }],
        "subheader-xl": ["24px", { lineHeight: "32px" }],
        "subheader-2xl": ["26px", { lineHeight: "34px" }],

        paragraph: ["12px", { lineHeight: "18px" }],
        "paragraph-md": ["14px", { lineHeight: "20px" }],
        "paragraph-lg": ["16px", { lineHeight: "24px" }],
        "paragraph-xl": ["18px", { lineHeight: "26px" }],
        "paragraph-2xl": ["20px", { lineHeight: "28px" }],
      },
    },
  },
  plugins: [],
};

export default config;
