import TextInput from "@/Components/Input/TextInput";
import { usePage } from "@inertiajs/react";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaLock } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
export default function SearchChannelInput({ allChannels }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState();
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

    const resultChannels = useMemo(() => {
        return allChannels.filter((cn) =>
            cn.name.toLowerCase().includes(searchValue)
        );
    }, [searchValue, allChannels]);

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
                        setSearchValue(e.target.value?.toLowerCase());
                    }}
                />
            </div>

            {resultChannels.length > 0 && searchValue && isOpen && (
                <ul
                    ref={panelRef}
                    className="absolute z-10 w-[104%] left-1/2 -translate-x-1/2 bg-foreground overflow-hidden border border-white/15  text-white rounded-lg shadow-lg mt-1"
                >
                    {resultChannels.map((cn, index) => (
                        <li
                            key={index}
                            className="cursor-pointer p-4 hover:bg-white/15 "
                        >
                            <div className="flex items-baseline gap-x-2">
                                {cn.type == "PUBLIC" ? (
                                    <span className="text-xl">#</span>
                                ) : (
                                    <FaLock className="text-sm inline" />
                                )}{" "}
                                {cn.name}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
