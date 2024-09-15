import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: "#340b37",
                secondary: "#241229",
                background: "#1a1d21",
                foreground: "#222529",
                link: "#1d9bd1",
                "primary-light": "#431248",
                "primary-lighter": "#7d3986",
                danger: "#b41541",
                "danger-light": "#DE678A",
            },
        },
    },

    plugins: [forms, require("@tailwindcss/typography")],
};
