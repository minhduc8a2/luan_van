import { forwardRef, useEffect, useRef } from "react";

export default forwardRef(function TextInput(
    {
        type = "text",
        error = null,
        className = "",
        id = "",
        label = "",
        isFocused = false,
        ...props
    },
    ref
) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <div className="">
            {label && (
                <label htmlFor={id} className="mb-2 block text-color-medium-emphasis">
                    {label}
                </label>
            )}

            <textarea
                {...props}
                type={type}
                id={id}
                className={
                    "border-color/15 bg-transparent text-color-high-emphasis focus:border-color-medium-emphasis focus:ring-color/15 rounded-xl shadow-sm w-full" +
                    className
                }
                ref={input}
            />
            {error && <div className="text-xs text-red-500">{error}</div>}
        </div>
    );
});
