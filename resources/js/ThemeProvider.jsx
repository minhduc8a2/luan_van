import React, { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState({ mode: true, colorScheme: "purple" });

    const toggleTheme = () => {
        if (theme.mode) {
            document.body.classList.remove("dark");
        } else {
            document.body.classList.add("dark");
        }
        setTheme((pre) => {
            const newTheme = { ...pre, mode: !pre.mode };
            localStorage.setItem("theme", JSON.stringify(newTheme));
            return newTheme;
        });
    };

    const setColorScheme = (colorName) => {
        document.body.classList.remove(theme.colorScheme);
        document.body.classList.add(colorName);
        setTheme((pre) => {
            const newTheme = { ...pre, colorScheme: colorName };
            localStorage.setItem("theme", JSON.stringify(newTheme));
            return newTheme;
        });
    };

    useEffect(() => {
        let savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            try {
                savedTheme = JSON.parse(savedTheme);
                if (savedTheme.mode) {
                    document.body.classList.add("dark");
                }
                document.body.classList.add(savedTheme.colorScheme);
                setTheme(savedTheme);
            } catch (error) {
                console.log(error);
                document.body.classList.add("dark");
                document.body.classList.add("purple");
                setTheme({ colorScheme: "purple", mode: true });
            }
        } else {
            document.body.classList.add("dark");
            document.body.classList.add("purple");
            setTheme({ colorScheme: "purple", mode: true });
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setColorScheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
