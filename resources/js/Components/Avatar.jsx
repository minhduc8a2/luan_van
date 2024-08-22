import React from "react";

export default function Avatar({ src, className = "" }) {
    return <img src={src} className={`rounded-lg w-10 h-10 ${className}`} />;
}
