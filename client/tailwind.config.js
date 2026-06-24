/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "bg-blue-50", "text-blue-600",
    "bg-slate-50", "text-slate-600",
    "bg-sky-50", "text-sky-600",
    "bg-teal-50", "text-teal-600",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
