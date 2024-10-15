import Button from "@/Components/Button";
import CustomedDialog from "@/Components/CustomedDialog";
import React, { useContext, useState } from "react";
import ThemeContext from "@/ThemeProvider";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
export default function ThemePicker() {
    const { theme, toggleTheme, setColorScheme } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = useState(false);
    const themes = [
        {
            title: "Purple",
            value: "purple",
            color: "bg-[#431248]",
        },
        {
            title: "Lagoon",
            value: "lagoon",
            color: "bg-[#14486d]",
        },
        {
            title: "Jade",
            value: "jade",
            color: "bg-[#14805c]",
        },
    ];
    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Theme</Button>
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>Theme</CustomedDialog.Title>
                <div className=" my-4">
                    <h2 className="text-color-high-emphasis mb-4 font-bold">
                        Color Mode:
                    </h2>

                    <div className="flex items-center gap-x-4 col-span-3">
                        <button
                            className={`font-semibold flex gap-x-2 items-center px-6 py-2 rounded-lg border border-color/15 text-color-medium-emphasis ${
                                theme.mode ? "border-2 border-link" : ""
                            }`}
                            onClick={() => toggleTheme(true)}
                        >
                            <MdOutlineDarkMode /> Dark
                        </button>
                        <button
                            className={`font-semibold flex gap-x-2 items-center px-6 py-2 rounded-lg border border-color/15 text-color-medium-emphasis ${
                                !theme.mode ? "border-2 border-link" : ""
                            }`}
                            onClick={() => toggleTheme(false)}
                        >
                            <MdOutlineLightMode /> Light
                        </button>
                    </div>
                </div>
                <div className="">
                    <h2 className="text-color-high-emphasis mb-4 font-bold">
                        Color Scheme:
                    </h2>
                    <ul className="flex flex-wrap  gap-4 col-span-3">
                        {themes.map((color) => {
                            return (
                                <li key={color.value}>
                                    <button
                                        className={`p-2 font-semibold rounded-lg border text-color-medium-emphasis  border-color/15 flex gap-x-2 items-center hover:text-color ${
                                            theme.colorScheme == color.value
                                                ? "border-link border-2"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setColorScheme(color.value)
                                        }
                                    >
                                        <div
                                            className={`w-8 h-8 ${color.color} rounded-full`}
                                        ></div>
                                        {color.title}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <CustomedDialog.CloseButton />
            </CustomedDialog>
        </>
    );
}
