/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Manrope", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        "ink-900": "#050b16",
        "ink-800": "#0b1224",
        "sky-500": "#0ea5e9",
        "sky-600": "#0284c7",
        "ice-400": "#7dd3fc",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 20% 20%, #0ea5e933, transparent 25%), radial-gradient(circle at 80% 0%, #38bdf833, transparent 20%), linear-gradient(135deg, #050b16, #0b1224)",
      },
      boxShadow: {
        "glow-sky": "0 10px 50px -20px rgba(14,165,233,0.6)",
        "glow-amber": "0 10px 50px -20px rgba(245,158,11,0.5)",
      },
    },
  },
  plugins: [],
};
