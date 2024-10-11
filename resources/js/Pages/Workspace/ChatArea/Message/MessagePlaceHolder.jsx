import Avatar from "@/Components/Avatar";
import React from "react";

export default function MessagePlaceHolder() {
    return (
        <div className="message-container transition-all pl-8 pt-2 pr-4 pb-2 relative break-all group hover:bg-white/10">
            <div class="rounded-lg animate-pulse bg-gray-700 h-10 w-10"></div>
            <div className="mx-3 flex flex-col justify-between animate-pulse">
                <div class="h-3 bg-gray-700 w-64 rounded"></div>
                <div class="h-3 bg-gray-700 w-32 rounded"></div>
            </div>
        </div>
    );
}
