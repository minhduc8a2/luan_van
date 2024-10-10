import React from "react";

export default function UserAvatar() {
    return (
        <Tooltip
            key={user.id}
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
                    size={"w-64 h-64"}
                />
                
            </div>
        </Tooltip>
    );
}
