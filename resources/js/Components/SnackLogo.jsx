import React from "react";
import icon from "@/../images/icon.png";
export default function SnackLogo({ size = "h-8 w-8" }) {
    return <img src={icon} alt="icon" className={size} />;
}
