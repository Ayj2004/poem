/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 覆盖所有src下的vue/ts文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
