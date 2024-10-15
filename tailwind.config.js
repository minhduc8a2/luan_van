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
                color: `rgb(var(--color) / <alpha-value>)`,

                primary: {
                    300: `rgb(var(--primary-300) / <alpha-value>)`,
                    400: `rgb(var(--primary-400) / <alpha-value>)`,
                    500: `rgb(var(--primary-500) / <alpha-value>)`,
                    600: `rgb(var(--primary-600) / <alpha-value>)`,
                },

                background: `rgb(var(--background) / <alpha-value>)`,
                foreground: `rgb(var(--foreground) / <alpha-value>)`,
                link: "#1d9bd1",
                "dark-green": "#00553d",
                danger: {
                    400: `rgb(var(--danger-400) / <alpha-value>)`,
                    500: `rgb(var(--danger-500) / <alpha-value>)`,
                },
            },
        },
    },

    plugins: [forms, require("@tailwindcss/typography")],
};
