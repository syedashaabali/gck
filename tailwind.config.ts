import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* shadcn/ui semantic tokens */
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
        /* Jewel-tone palette for the fine-dining theme */
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          deep: "hsl(var(--gold-deep))",
        },
        ruby: {
          DEFAULT: "hsl(var(--ruby))",
          light: "hsl(var(--ruby-light))",
        },
        jade: {
          DEFAULT: "hsl(var(--jade))",
          light: "hsl(var(--jade-light))",
        },
        sapphire: {
          DEFAULT: "hsl(var(--sapphire))",
          light: "hsl(var(--sapphire-light))",
        },
        saffron: {
          DEFAULT: "hsl(var(--saffron))",
          light: "hsl(var(--saffron-light))",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        script: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        gold: "0 10px 30px -10px hsl(var(--gold) / 0.55)",
        "gold-lg": "0 0 60px -15px hsl(var(--gold) / 0.45)",
        ruby: "0 10px 30px -10px hsl(var(--ruby) / 0.6)",
        jade: "0 10px 30px -10px hsl(var(--jade) / 0.6)",
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 hsl(var(--jade-light) / 0.55)" },
          "100%": { boxShadow: "0 0 0 10px hsl(var(--jade-light) / 0)" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        shimmer: "shimmer 6s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
