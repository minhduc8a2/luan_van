import React from "react";

export default function WorkspaceAvatar({ name }) {
    const firstCharacter = name[0];
    console.log(firstCharacter);
    return (
        <div className="text-2xl h-10 font-bold text-primary flex items-center justify-center bg-white/75 aspect-square p-1 rounded-lg">
            {firstCharacter}
        </div>
    );
}
