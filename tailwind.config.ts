import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F7",
        paper2: "#F2F0EB",
        ink: "#1B1B19",
        ink2: "#5D5B55",
        ink3: "#93908A",
        line: "#E3E0DA",
        line2: "#EDEBE6",
        accent: "#3F5145",
      },
      fontFamily: {
        serif: ['"Newsreader"', "Georgia", "serif"],
        sans: ['"Hanken Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        wrap: "42rem",
      },
    },
  },
  plugins: [],
};

export default config;
