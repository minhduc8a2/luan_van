import React from "react";

export default function Button({ className = "", children, ...props }) {
    return (
        <button
            className={
                " rounded-xl bg-foreground hover:bg-white/10 transition text-white/85 py-2 px-4 hover:text-white" + className
            }
        >
            {children}
        </button>
    );
}
