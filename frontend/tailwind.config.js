import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  },
};

// import daisyui from "daisyui";

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       animation: {
//         wave: 'wave 4s ease-in-out infinite', // Add wave animation
//       },
//       keyframes: {
//         wave: {
//           '0%, 100%': { transform: 'translateY(0)' },
//           '50%': { transform: 'translateY(10px)' }, // Move up and down for wave effect
//         },
//       },
//     },
//   },
//   plugins: [daisyui],
//   daisyui: {
//     themes: [
//       "light",
//       "dark",
//       "cupcake",
//       "bumblebee",
//       "emerald",
//       "corporate",
//       "synthwave",
//       "retro",
//       "cyberpunk",
//       "valentine",
//       "halloween",
//       "garden",
//       "forest",
//       "aqua",
//       "lofi",
//       "pastel",
//       "fantasy",
//       "wireframe",
//       "black",
//       "luxury",
//       "dracula",
//       "cmyk",
//       "autumn",
//       "business",
//       "acid",
//       "lemonade",
//       "night",
//       "coffee",
//       "winter",
//       "dim",
//       "nord",
//       "sunset",
//     ],
//   },
// };

