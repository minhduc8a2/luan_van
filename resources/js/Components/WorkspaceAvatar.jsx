import React from "react";

export default function WorkspaceAvatar({ name, color="bg-color/75" }) {
    const firstCharacter = name[0];
    // console.log(firstCharacter);
    return (
        <div className={`text-2xl h-10 font-bold text-primary-500 flex items-center justify-center  shadow aspect-square p-1 rounded-lg ${color}`}>
            {firstCharacter}
        </div>
    );
}
