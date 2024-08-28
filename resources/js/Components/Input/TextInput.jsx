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
                "border-white/25 bg-transparent focus:border-slate-200 focus:ring-white/15 rounded-xl shadow-sm w-full" +
                className
            }
            ref={input}
        />
    );
});
