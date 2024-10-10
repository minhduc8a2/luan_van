import SquareImage from "@/Components/SquareImage";
import Tooltip from "@/Components/Tooltip";
import React from "react";

export default function UserAvatar({user, size="h-36 w-36"}) {
    return (
        <Tooltip
           
            content={
                <button className="text-nowrap">
                    {user.display_name || user.name}
                </button>
            }
        >
            <div className="relative">
                <SquareImage
                    url={user.avatar_url}
                    removable={false}
                    size={size}
                />
                
            </div>
        </Tooltip>
    );
}
