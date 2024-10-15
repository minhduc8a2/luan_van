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
                "color": `var(--color)`,
                "border": `var(--border-color)`,
                primary: {
                    300: `var(--primary-300)`,
                    400: `var(--primary-400)`,
                    500: `var(--primary-500)`,
                    600: `var(--primary-600)`,
                },

                background: `var(--background)`,
                foreground: `var(--foreground)`,
                link: "#1d9bd1",
                "dark-green": "#00553d",
                danger: {
                    400: `var(--danger-400)`,
                    500: `var(--danger-500)`,
                },
            },
        },
    },

    plugins: [forms, require("@tailwindcss/typography")],
};
