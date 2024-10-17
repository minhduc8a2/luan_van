import { forwardRef, useEffect, useRef } from "react";

export default forwardRef(function TextInput(
    { type = "text", className = "", isFocused = false, ...props },
    ref
) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                "border-color/15 bg-transparent text-color-high-emphasis px-3 py-2 border  rounded-xl shadow-sm w-full focus:ring-4 focus:ring-link/50 focus:border-link" +
                className
            }
            ref={input}
        />
    );
});
