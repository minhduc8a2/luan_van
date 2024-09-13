import React, { useState, useRef, useEffect } from "react";

export default function SelectInput({
    onChange = () => {},
    label,
    list,
    className = "",
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(list[0]);
    const panelRef = useRef(null);

    const closePanel = () => {
        setIsOpen(false);
    };
    const handleSelect = (item) => {
        setSelected(item);
        setIsOpen(false);
        onChange(item);
    };

    const handleClickOutside = (event) => {
        if (panelRef.current && !panelRef.current.contains(event.target)) {
            closePanel();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative">
            <label className="block mb-2 ">{label}</label>
            <div
                className={`border border-white/25 bg-transparent block w-full p-2.5 rounded-lg text-sm text-white/85  ${className}`}
                onClick={() => {
                    if (disabled) return;
                    setIsOpen(!isOpen);
                }}
            >
                {selected.label}
            </div>

            {isOpen && (
                <ul
                    ref={panelRef}
                    className="absolute z-10 w-full bg-background border border-white/15  text-white rounded-lg shadow-lg mt-1"
                >
                    {list.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(item)}
                            className="cursor-pointer p-2 hover:bg-white/15 "
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
