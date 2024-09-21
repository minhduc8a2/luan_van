import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaLock } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
export default function SearchInput({
    list,
    filterFunction,
    renderItemNode,
    onChange = () => {},
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const panelRef = useRef(null);
    const [focused, setFocused] = useState(false);

    const closePanel = () => {
        setIsOpen(false);
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

    const resultList = useMemo(
        () => filterFunction(searchValue, list),
        [searchValue, list]
    );

    return (
        <div className="relative mt-4">
            <div
                className={`flex bg-background border-white/15 items-center px-2 border rounded-lg ${
                    focused ? " ring-link/15 ring-4  !border-link" : ""
                }  `}
            >
                <IoIosSearch className="text-2xl text-white/85" />
                <input
                    type="text"
                    placeholder="Search for channels"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="w-full bg-transparent focus:ring-0 focus:border-none border-none"
                    onChange={(e) => {
                        setIsOpen(true);
                        onChange(e);
                        setSearchValue(e.target.value?.toLowerCase());
                    }}
                />
            </div>

            {resultList.length > 0 && searchValue && isOpen && (
                <ul
                    ref={panelRef}
                    className="absolute z-10 w-[104%] left-1/2 -translate-x-1/2 bg-foreground overflow-hidden border border-white/15 max-h-96 overflow-y-auto scrollbar text-white rounded-lg shadow-lg mt-1"
                >
                    {resultList.map((item, index) => (
                        <li
                            key={index}
                            className="cursor-pointer p-4 hover:bg-white/15 "
                        >
                            {renderItemNode(item)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
