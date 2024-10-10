import React, { useEffect } from "react";
import { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
function AutocompleInput({
    isLimitReached = false,
    inputPlaceholder,
    renderChoosenList,
    renderDropListFn,
}) {
    const [inputValue, setInputValue] = useState("");
    const ulRef = useRef(null);

    const items = renderDropListFn(inputValue);
    return (
        <div className="border border-white/15 rounded-xl p-2 relative">
            <div className="flex gap-x-2">{renderChoosenList()}</div>
            {!isLimitReached && (
                <input
                    type="text"
                    placeholder={inputPlaceholder}
                    className="bg-transparent border-none focus:border-none focus:ring-0 w-full "
                    value={inputValue}
                    onChange={(e) => {
                        const value = e.target.value;
                        setInputValue(value);
                    }}
                />
            )}

            {items && (
                <ul className="flex flex-col gap-y-2 absolute w-[100%] py-4 border border-white/15 top-full mt-2 left-1/2 -translate-x-1/2 bg-background rounded-xl z-20">
                    {items}
                </ul>
            )}
        </div>
    );
}

function InputItem({ children, onRemove }) {
    return (
        <div className="p-2 bg-link/15 rounded flex gap-x-2 items-center">
            {children}
            <button
                onClick={onRemove}
                className="h-6 w-6 flex justify-center items-center rounded hover:bg-white/15"
            >
                <IoClose />
            </button>
        </div>
    );
}
AutocompleInput.InputItem = InputItem;
export default AutocompleInput;
