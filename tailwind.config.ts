import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
      colors: {
        Primary: "#00dc64",
        Secondary: "#00dc64",
        Tertiary: "#112D57",
        Quaternary: "#000000",
        Text: "#ffffff",
        SecondText: "#5C5C5C",
        DarkBackground: "#181818",
        DarkBackground2: "#1E1E1E",
        LightBackground: "#ffffff",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
