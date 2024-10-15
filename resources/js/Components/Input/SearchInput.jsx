import React, { useState, useRef, useEffect, useMemo } from "react";

import { IoIosSearch } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
export default function SearchInput({
    placeholder = "",
    list,
    filterFunction,
    renderItemNode,
    onChange = () => {},
    onSearch = () => {},
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const panelRef = useRef(null);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef(null);
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
    function clearInput() {
        inputRef.current.value = "";
    }
    return (
        <div className="relative mt-4">
            <form
                className={`flex bg-background border-color/15 items-center px-2 border rounded-lg ${
                    focused ? " ring-link/15 ring-4  !border-link" : ""
                }  `}
                onSubmit={(e) => {
                    e.preventDefault();

                    onSearch(searchValue);
                    setIsOpen(false);
                }}
            >
                <IoIosSearch className="text-2xl text-color-high-emphasis" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="w-full bg-transparent focus:ring-0 focus:border-none border-none"
                    onChange={(e) => {
                        setIsOpen(true);
                        onChange(e);
                        setSearchValue(e.target.value?.toLowerCase());
                    }}
                />
            </form>

            {searchValue && isOpen && (
                <ul
                    ref={panelRef}
                    className="absolute z-10 w-[104%] left-1/2 -translate-x-1/2 bg-foreground  border border-color/15 max-h-96 overflow-y-auto scrollbar text-white rounded-lg shadow-lg mt-1"
                >
                    <li>
                        <button
                            className="cursor-pointer p-4 flex gap-x-4 items-center hover:bg-color/15 w-full "
                            onClick={() => {
                                onSearch(searchValue);
                                setIsOpen(false);
                            }}
                        >
                            <IoSearch /> {searchValue}
                        </button>
                    </li>
                    {resultList.map((item, index) => (
                        <li
                            key={index}
                            className="cursor-pointer hover:bg-color/15 "
                        >
                            {renderItemNode(item, closePanel, clearInput)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
