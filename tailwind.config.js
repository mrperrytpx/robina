/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                glacier: {
                    50: "#f1fafa",
                    100: "#dbeff2",
                    200: "#bbdfe6",
                    300: "#8cc8d4",
                    400: "#56a8ba",
                    500: "#3a8ca0",
                    600: "#337387",
                    700: "#2f5e6f",
                    800: "#2d4f5d",
                    900: "#2a434f",
                    950: "#172a35",
                },
            },
            keyframes: {
                scrollX: {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-100%)" },
                },
            },
            animation: {
                scroll: "scrollX 45s linear infinite",
            },
        },
    },
    plugins: [require("tailwind-scrollbar")],
};
