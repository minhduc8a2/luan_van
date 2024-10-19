import React from "react";

export default function WorkspaceAvatar({ name, bgColor="bg-color/75", textColor="text-color-contrast/85" }) {
    const firstCharacter = name[0];
    // console.log(firstCharacter);
    return (
        <div className={`text-2xl h-10 font-bold flex items-center justify-center  shadow aspect-square p-1 rounded-lg ${bgColor} ${textColor}`}>
            {firstCharacter}
        </div>
    );
}
