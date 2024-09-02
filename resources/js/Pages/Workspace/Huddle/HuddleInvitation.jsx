import { usePage } from "@inertiajs/react";
import React from "react";
import AvatarAndName from "@/Components/AvatarAndName";
import AutocompleInput from "./AutocompleInput";
export default function HuddleInvitation() {
    const { channelUsers, auth } = usePage().props;
    return (
        <div className="min-w-96 p-4 text-white/85 max-w-lg">
            <h3 className="font-bold text-xl">Invite people to your huddle</h3>
            <p className="text-sm max-w-[90%]">
                {
                    "You can invite whomever you’d like to the huddle, and they’ll receive a notification to join."
                }
            </p>
            <div className="mt-4">
                <AutocompleInput users={channelUsers} />
            </div>
            <h4 className="text-sm font-bold mt-8">Suggested</h4>
            <ul className="mt-4 flex flex-col gap-y-2">
                {channelUsers.map((user) => {
                    if (user.id == auth.user.id) return "";
                    return (
                        <button key={user.id} onClick={() => {}}>
                            <AvatarAndName user={user} className="h-10 w-10" />
                        </button>
                    );
                })}
            </ul>
        </div>
    );
}
