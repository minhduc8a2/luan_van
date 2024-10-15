import Button from "@/Components/Button";
import CustomedDialog from "@/Components/CustomedDialog";
import React, { useContext, useState } from "react";
import ThemeContext from "@/ThemeProvider";
export default function ThemePicker() {
    const { theme, toggleTheme, setColorScheme } = useContext(ThemeContext)
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Theme</Button>
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>Theme</CustomedDialog.Title>
                <h2>Color Scheme</h2>
                <ul className="flex mt-4 gap-x-4">
                    <li>
                        <button className="w-8 h-8 bg-[#431248] rounded-full"></button>
                    </li>
                    <li>
                        <button className="w-8 h-8 bg-[#3131b4] rounded-full"></button>
                    </li>
                </ul>
                <div className="flex items-center gap-x-2 mt-4">
                    <input type="checkbox" id="mode" onChange={toggleTheme} checked={theme.mode}/>
                    <label htmlFor="mode">Dark mode</label>
                </div>
            </CustomedDialog>
        </>
    );
}
