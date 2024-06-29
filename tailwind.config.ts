import type {Config} from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      "xs": "360px",
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    darkTheme: "forest",
    // "light", "dark",
    themes: ["retro", "forest"],
  },
} satisfies Config;
