import { forwardRef, useEffect, useRef } from "react";

export default forwardRef(function TextInput(
    {
        type = "text",
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
                <label htmlFor={id} className="mb-2 block">
                    {label}
                </label>
            )}

            <textarea
                {...props}
                type={type}
                id={id}
                className={
                    "border-white/25 bg-transparent focus:border-slate-200 focus:ring-white/15 rounded-xl shadow-sm w-full" +
                    className
                }
                ref={input}
            />
        </div>
    );
});
