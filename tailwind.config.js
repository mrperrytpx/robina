/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
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
