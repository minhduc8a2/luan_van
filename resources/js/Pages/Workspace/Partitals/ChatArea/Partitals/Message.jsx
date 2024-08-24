import React from "react";
import { UTCToTime } from "@/helpers/dateTimeHelper";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Avatar from "@/Components/Avatar";

export default function Message({ message, user, hasChanged, index }) {
    return (
        <div
            className={`message-container ml-8  break-all ${
                hasChanged || index == 0 ? "mt-4" : "mt-0"
            }`}
        >
            {hasChanged || index == 0 ? (
                <Avatar src={user.avatar_url} noStatus={true} />
            ) : (
                <div></div>
            )}
            <div className="mx-3">
                {hasChanged || index == 0 ? (
                    <div className="flex gap-x-2">
                        <div className="text-sm font-bold">{user.name}</div>
                        <div className="text-xs">
                            {UTCToTime(message.updated_at)}
                        </div>
                    </div>
                ) : (
                    ""
                )}

                <div
                    className="prose prose-invert "
                    dangerouslySetInnerHTML={{
                        __html: generateHTML(JSON.parse(message.content), [
                            StarterKit,
                        ]),
                    }}
                ></div>
            </div>
        </div>
    );
}
