import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/components/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: { ink: "#333333" },
      borderColor: { hair: "#dddddd" },
    },
  },
  plugins: [],
};
export default config;
