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
                "border-border bg-transparent    rounded-xl shadow-sm w-full focus:ring-4 focus:ring-link/50 focus:border-link" +
                className
            }
            ref={input}
        />
    );
});
