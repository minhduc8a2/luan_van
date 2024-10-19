import React from "react";

export default function WorkspaceAvatar({ name,size="h-10 text-2xl", bgColor="bg-color/75", textColor="text-color-contrast/85" }) {
    const firstCharacter = name[0];
    // console.log(firstCharacter);
    return (
        <div className={` ${size}  font-bold flex items-center justify-center  shadow aspect-square p-1 rounded-lg ${bgColor} ${textColor}`}>
            {firstCharacter}
        </div>
    );
}
