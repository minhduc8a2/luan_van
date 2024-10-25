import SnackLogo from "@/Components/SnackLogo";
import { Link } from "@inertiajs/react";
import React from "react";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-color-contrast ">
            <div className="flex items-baseline gap-x-2 mb-8 text-color-high-emphasis">
                <SnackLogo />
                <Link href="/" className=" font-bold text-3xl ">
                    Snack
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-4   overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
