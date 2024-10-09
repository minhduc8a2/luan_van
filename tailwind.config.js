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
                primary: {
                    300: "#7d3986",
                    400: "#431248",
                    500: "#340b37",
                    600:"#28092b",
                },
                secondary: "#241229",
                background: "#1a1d21",
                foreground: "#222529",
                link: "#1d9bd1",
                "dark-green": "#00553d",
                danger: {
                    400: "#DE678A",
                    500: "#b41541",
                },
            },
        },
    },

    plugins: [forms, require("@tailwindcss/typography")],
};
