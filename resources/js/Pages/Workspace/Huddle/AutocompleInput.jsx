import React from "react";
import { useState, useRef } from "react";
import Avatar from "@/Components/Avatar";
import AvatarAndName from "@/Components/AvatarAndName";
import { IoMdClose } from "react-icons/io";
export default function AutocompleInput({
    users,
    choosenUsers,
    setChoosenUsers,
}) {
    const [showSuggested, setShowSuggested] = useState(false);
    const [inputValue, setInputValue] = useState("");
    return (
        <div className="border rounded-xl p-2 relative">
            <div className="flex gap-x-2">
                {Object.values(choosenUsers).map((user) => {
                    return (
                        <div
                            className="flex gap-x-1 items-center bg-white/15 p-1 px-2 rounded-lg w-fit"
                            key={user.id}
                        >
                            <AvatarAndName user={user} className="h-4 w-4" />
                            <button
                                className=""
                                onClick={() => {
                                    setChoosenUsers((pre) => {
                                        const temp = { ...pre };
                                        delete temp[user.id];
                                        return temp;
                                    });
                                }}
                            >
                                <IoMdClose />
                            </button>
                        </div>
                    );
                })}
            </div>
            <input
                type="text"
                placeholder="Search by name"
                className="bg-transparent border-none focus:border-none focus:ring-0 w-full"
                value={inputValue}
                onChange={(e) => {
                    const value = e.target.value;
                    setInputValue(value);
                }}
            />
            {users.filter(
                (user) =>
                    inputValue != "" &&
                    user.name.toLowerCase().includes(inputValue.toLowerCase())
            ).length > 0 && (
                <ul className="flex flex-col gap-y-2 absolute w-[105%] p-2 border border-white/15 top-full mt-2 left-1/2 -translate-x-1/2 bg-background rounded-xl z-20">
                    {users
                        .filter((user) =>
                            user.name
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                        )
                        .map((user) => (
                            <li key={user.id} className="p-1 w-full">
                                <button
                                    className="w-full"
                                    onClick={() => {
                                        setChoosenUsers((pre) => ({
                                            ...pre,
                                            [user.id]: user,
                                        }));
                                        setInputValue("");
                                    }}
                                >
                                    <AvatarAndName
                                        user={user}
                                        className="h-6 w-6"
                                    />
                                </button>
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}
