import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0D0D0D", 2: "#1A1A1A" },
        brand: {
          orange: "#E85D04",
          "orange-light": "#FF7A1A",
          "orange-dark": "#C44B00",
          gold: "#FAA307",
          "gold-light": "#FFD166",
          cream: "#FFF8F0",
          "cream-dark": "#F0E6D3",
          brown: "#3D1A08",
        },
      },
      fontFamily: {
        display: ["var(--font-lilita)", "var(--font-bebas)", "Impact", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #E85D04 0%, #FAA307 55%, #FF7A1A 100%)",
        "gradient-cta":
          "linear-gradient(135deg, #C44B00 0%, #E85D04 50%, #FAA307 100%)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(-6deg) scale(1)" },
          "40%": { transform: "translateY(-18px) rotate(4deg) scale(1.05)" },
          "75%": { transform: "translateY(8px) rotate(-8deg) scale(0.97)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        pulseRing: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(250, 163, 7, 0.45)" },
          "50%": { boxShadow: "0 0 0 10px rgba(250, 163, 7, 0)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-ring": "pulseRing 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
